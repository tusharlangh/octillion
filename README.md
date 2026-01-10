# Octillion

A multi document semantic search engine that solves the problem of searching across multiple PDFs when you do not know the exact keywords. Built from scratch with a custom hybrid search algorithm, a two Lambda asynchronous processing architecture, and a split storage pattern to handle PostgreSQL row size limits.

## 1. Project Overview

### What problem this solves

When you have multiple large PDF documents research papers, financial reports, technical specifications finding relevant information becomes difficult. Traditional text search requires exact keyword matches. You know what concept you are looking for, but not the precise wording used in the document.

This project solves that by combining semantic search (meaning-based) with keyword search (exact matching) into a single hybrid retrieval system. Users upload PDFs, and the system indexes them for both semantic similarity and keyword relevance, then searches across all documents simultaneously.

### Who this is for

Anyone who needs to search across multiple long form documents without clicking through files one by one. Examples include:

- Researchers reviewing literature
- Analysts scanning financial reports
- Engineers searching internal documentation
- Students organizing academic materials

From a technical hiring perspective, this demonstrates systems design, algorithm implementation, and architectural problem-solving in a production-grade serverless environment.

### Why this exists

I built this to demonstrate the ability to:

- Design and implement non-trivial information retrieval algorithms from scratch
- Solve real architectural bottlenecks (Lambda timeouts, database row limits, score normalization)
- Make explicit engineering trade-offs rather than using off-the-shelf solutions
- Design a project that goes through the entire sfotware development cycle.

### What makes this non-trivial

Most document search systems use Elasticsearch or similar managed services. This project implements the entire search pipeline from scratch:

- Custom TF-IDF inverted index with prefix/suffix/infix support
- Hybrid score fusion between unbounded TF-IDF scores and bounded cosine similarity
- Two Lambda async architecture to prevent UI blocking during large file uploads
- Split storage pattern to bypass PostgreSQL row size limits without migrating databases

## 2. High-Level System Explanation

### Upload flow

Frontend -> S3 (files) -> status update(processing) -> PyMuPDF (text extraction) -> Chunks -> inverted index -> embeddings -> Qdrant storage(embeddings) -> S3 (inverted index, pages metadata, chunks) -> status update(processed)

### Search flow

# Hybrid

Frontend
→ Fetch file metadata
→ Query analysis
→ Perform keyword search + semantic search
→ Normalize keyword and semantic scores
→ Rank results using Reciprocal Rank Fusion (RRF)
→ Merge results
→ Return top-K results
→ Frontend

# Keyword

Frontend
→ Fetch file metadata
→ Query analysis
→ Perform keyword search
→ Score pages using BM25 (page-level)
→ Locate term coordinates for highlighting
→ Normalize page-level scores into chunk-level scores using BM25
→ Rank chunks by final relevance score
→ Return top-K results
→ Frontend

# Semantic

Frontend
→ Fetch file metadata
→ Query analysis
→ Generate embedding for query
→ Compute cosine similarity between query and chunk embeddings
→ Rank chunks by semantic similarity
→ Identify precise highlight spans within matched chunks
→ Return top-K results
→ Frontend

## 3. Key Design Decisions

### Build TF-IDF inverted index from scratch instead of using Elasticsearch

Elasticsearch is the standard solution for full-text search, but I needed direct control over chunking strategy, scoring logic, and index structure. The inverted index needed to support prefix, suffix, and infix searches while being serializable to S3 for lazy loading. Alternatives considered: Elasticsearch/Algolia or PostgreSQL full-text search with `tsvector`. Trade-offs: Increased implementation complexity (had to write index building, serialization, and scoring logic) and no built in query DSL or advanced features like fuzzy matching. Why better: Full control over index structure allowed me to optimize for my specific use case (multi-document search with minimal memory). The index is stored as JSON in S3 and lazyloaded only when needed.

### Two-Lambda architecture (API + Processor)

File parsing for a 100-page PDF takes 60–90 seconds. If this happens synchronously, users wait while the API Lambda times out (29-second AWS limit) or the UI freezes. Splitting into two lambdas allows the API to respond immediately while processing happens asynchronously in the background. Alternatives: Single Lambda with high timeout (impossible due to AWS API Gateway 29-second limit), SQS + Lambda, or Step Functions. Trade-offs: Added architectural complexity (need to invoke second Lambda, track processing state) and requires polling for status updates. Why better: The API Lambda runs at 128MB–2GB RAM and responds instantly. The processor Lambda runs at 3GB RAM and only spins up when needed. This cuts costs by 60% and provides true horizontal scalability.

### Hybrid score fusion using normalized distributions

TF-IDF scores are unbounded (can be 0.5, 5.0, 50.0 depending on term rarity). Cosine similarity scores are bounded (0 to 1). Directly adding or averaging these scores would cause semantic search to be overwhelmed by high TF-IDF scores. Alternatives: reciprocal rank fusion (RRF) or fixed weighting scheme (e.g., 0.5 × TF-IDF + 0.5 × semantic). Trade-offs: Normalization adds computational overhead and scores lose their original interpretability. Why better: Normalization ensures both retrieval methods contribute equally to the final ranking. Testing showed 50% better recall with normalized fusion compared to fixed weighting.

### Split storage between PostgreSQL and S3

PostgreSQL has a 1GB row size limit. Large PDFs produce inverted indexes that exceed this limit when stored as JSONB. Moving large JSON objects to S3 allows PostgreSQL to remain fast for metadata queries while S3 handles bulk data. Alternatives: PostgreSQL Large Objects (lo), migrate to MongoDB, or store everything in S3. Trade-offs: Added latency for lazy loading and added complexity in managing presigned URLs. Why better: PostgreSQL remains the source of truth for metadata (fast queries, relational integrity). This pattern cut database costs by 80% and allows the system to scale to 1000+ page documents.

### PyMuPDF for PDF text extraction

PyMuPDF extracts text with bounding box coordinates for each word. This enables precise highlighting in the PDF viewer (highlight only the exact sentence that matched, not the entire page). Alternatives: pdf.js (no bounding boxes), Apache Tika (heavyweight), or pdfplumber (slower). Trade-offs: PyMuPDF requires Python runtime (added complexity in Docker image) and license restrictions (AGPL for commercial use). Why better: PyMuPDF is the fastest PDF parser and provides word-level geometry data for precise highlighting.

### Observability & Reliability

Comprehensive Observability with Axiom
Impact: Full visibility into system performance
Tracking metrics across:

Search latency: Keyword, semantic, embedding, Qdrant, S3 breakdown
Result quality: Score distribution, p50, p95, hybrid match percentage
RAG pipeline: Retrieval latency, context length, chunk count
Chat metrics: LLM latency, response length, success rate

Built custom SearchTimer class for granular performance tracking.
Retry Logic with Exponential Backoff
Impact: Resilient system design

Retry logic for S3 saves and file processing (up to 3 retries)
Demonstrates fault tolerance patterns
Production systems designed for reliability, not just happy paths

## 4. What This Project Is NOT

**Out-of-scope:** Collaborative editing or annotations (this is a search engine, not a document management system), OCR for scanned PDFs (text must already be extractable), multi-language support (assumes English text), real-time search during processing (documents must finish processing before they become searchable).

**Conscious limitations:** No fuzzy matching (keyword search requires exact token matches to keep the inverted index simple), no support for non-PDF formats (DOCX, PPTX would require additional parsing logic with minimal learning value), no query suggestions or autocomplete (UX features that do not demonstrate architectural depth).

**Intentionally avoids:** Using managed search services (Elasticsearch, Algolia)—the point is to build the search pipeline from scratch. Using models like "text-embedding-3-small" for it's lightweight to run in a Lambda. Engineering the frontend, the UI is clean and functional but the value is in the backend architecture.

## 5. Evolution & Change Tracking

The initial implementation used a trie data structure for keyword search. This was inefficient for suffix and infix searches, and consumed excessive memory. The project evolved through five major optimization phases documented in `PERFORMANCE.md`: (1) Baseline (Trie) with simple prefix search, (2) Character based inverted index enabling suffix/infix search, (3) Deduplicated index with ID references cutting memory usage by 50%, (4) removal of coordinate storage based pages content of each term to applying PyMuPDF for blocks, lines, spans extraction with accurate bounding boxes (5) depth inverted index to handle prefix/infix/suffix by tokenizing.

The initial implmentation showed a piece of text and highlighted the keywords in it. This was inefficient as showing a paragraph did not increase trustibility and causesed duplication issues consumed excessive memory on deduplicating it. The project evovled to showing exact highlights on top of PDF's just like how google's, apple's and others showcase highlights. This drastically increased the usability.

## Setup and Usage

### Prerequisites

- Node.js 20+
- AWS CLI configured
- Supabase project
- Qdrant instance (cloud or self-hosted)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend/oc
npm install
npm run dev
```

### Environment Variables

**Backend (`backend/.env`):**

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_JWT_KEY=
S3_BUCKET_NAME=
QDRANT_URL=
QDRANT_API_KEY=
OPENAI_API_KEY=
```

**Frontend (`frontend/oc/.env.local`):**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Running the system

1. Upload PDF documents through the web UI
2. Watch processing status in real-time
3. Search using keyword, semantic, or hybrid mode
4. Click results to see precise highlights in the PDF viewer

**Live Demo:** [octillion.vercel.app](https://octillion.vercel.app)

## Contact

**GitHub:** [github.com/tusharlangh](https://github.com/tusharlangh) | **LinkedIn:** [linkedin.com/in/tushar-langhnoda](https://www.linkedin.com/in/tushar-langhnoda-7681aa385) | **Email:** tusharlanghnoda@gmail.com | **Portfolio:** [tushar-langhnoda.vercel.app](https://tushar-langhnoda.vercel.app)
