# Octillion

A production grade multi document semantic search engine built from scratch to solve the problem of finding relevant information across large PDFs without knowing exact keywords. Implemented a custom hybrid search algorithm combining TF-IDF keyword matching and vector embeddings, so that users can search by concept rather than exact phrases, because traditional keyword search fails when terminology varies across documents. Architected a 3 Lambda system (API, Processor, Geometry) to enable sub-500ms search latency while processing 400+ page documents asynchronously, because synchronous processing would exceed API Gateway's 29-second timeout. Engineered an intelligent caching layer with Redis and S3 to reduce geometry computation from 3.8s to <50ms, because pre computing text coordinates eliminates the primary search bottleneck.

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

- Designed and implemented custom information retrieval algorithms from scratch, so that search quality could be optimized for multi-document workflows, because off the shelf solutions don't expose fine grained control over scoring and ranking
- Solved real production bottlenecks (3.8s geometry latency, Lambda timeouts, database limits), so that search remains sub-500ms even for 400 page documents, because users abandon searches that feel slow
- Architected a 3-Lambda system with intelligent caching, so that geometry computation happens once during indexing rather than on every search, because pre-computation eliminates the primary performance bottleneck
- Made explicit engineering trade-offs (memory vs latency, indexing time vs search speed), so that the system optimizes for user-facing metrics, because search is a latency-sensitive operation where result quality matters most

### What makes this non-trivial

Most document search systems use Elasticsearch or similar managed services. This project implements the entire search pipeline from scratch:

- Built a custom TF-IDF inverted index with prefix/suffix/infix support, so that substring matching works uniformly across all query types, because tries are inefficient for suffix/infix searches (1800ms vs 75ms)
- Implemented hybrid score fusion using Reciprocal Rank Fusion (RRF), so that unbounded TF-IDF scores and bounded cosine similarities combine fairly, because direct averaging would let high TF-IDF overwhelm semantic signals
- Architected a 3-Lambda system (API, Processor, Geometry) to prevent API timeouts and enable specialized compute, because API Gateway has a 29-second limit and geometry processing needs heavy ML models
- Engineered a split storage pattern (PostgreSQL for metadata, S3 for bulk data), so that inverted indexes bypass the 1GB row limit, because storing everything in PostgreSQL would make the database 5x more expensive
- Added intelligent caching (Redis for embeddings, S3 for geometry), so that repeated searches hit <50ms instead of 3.8s, because geometry computation via external API calls was the largest bottleneck

## 2. High-Level System Explanation

### Upload flow

Frontend → S3 (raw PDF) → Status: processing → **Processor Lambda** → PyMuPDF (text + geometry extraction) → Chunking (300 words, 1 sentence overlap) → TF-IDF inverted index → OpenAI embeddings → Qdrant (vector storage) → **Geometry Lambda** (sentence extraction, cross-encoder scoring) → S3 (index, metadata, geometry cache) → PostgreSQL (file metadata) → Status: processed

**Why 3 Lambdas:** Separated API (instant response), Processor (async heavy lifting), and Geometry (specialized ML inference), so that each Lambda can scale independently with right-sized memory, because running everything in one Lambda would timeout or waste resources.

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

### Three-Lambda architecture (API + Processor + Geometry)

Separated the system into three specialized Lambdas, so that each can scale independently with optimized memory and timeout settings, because combining them would either timeout on large files or waste resources on small requests.

**API Lambda (2GB, 30s timeout):** Handles all user-facing requests (search, file metadata), so that responses are instant (<500ms), because users expect search to feel real-time. Returns immediately on uploads by invoking Processor Lambda asynchronously.

**Processor Lambda (3GB, 900s timeout):** Runs heavy processing (PDF parsing, chunking, embedding generation), so that 400-page PDFs can complete without timing out, because synchronous processing would exceed API Gateway's 29-second limit. Invokes Geometry Lambda for ML-based sentence extraction.

**Geometry Lambda (3GB, 300s timeout):** Runs specialized ML models (cross-encoder sentence re-ranking, best span extraction), so that geometry computation stays isolated and can leverage model caching, because loading transformer models in the main processor would add 8s cold start time.

**Alternatives considered:** Single Lambda (impossible - API Gateway timeout), SQS + Lambda (adds message queue complexity), Step Functions (overkill for simple async invoke).

**Results:** API responds in <100ms even during uploads, processor handles 500+ page documents, geometry service maintains warm model cache. Cost reduced by 60% vs single large Lambda, because each function only pays for resources when actively processing.

### Hybrid score fusion using normalized distributions

TF-IDF scores are unbounded (can be 0.5, 5.0, 50.0 depending on term rarity). Cosine similarity scores are bounded (0 to 1). Directly adding or averaging these scores would cause semantic search to be overwhelmed by high TF-IDF scores. Alternatives: reciprocal rank fusion (RRF) or fixed weighting scheme (e.g., 0.5 × TF-IDF + 0.5 × semantic). Trade-offs: Normalization adds computational overhead and scores lose their original interpretability. Why better: Normalization ensures both retrieval methods contribute equally to the final ranking. Testing showed 50% better recall with normalized fusion compared to fixed weighting.

### Split storage between PostgreSQL and S3

PostgreSQL has a 1GB row size limit. Large PDFs produce inverted indexes that exceed this limit when stored as JSONB. Moving large JSON objects to S3 allows PostgreSQL to remain fast for metadata queries while S3 handles bulk data. Alternatives: PostgreSQL Large Objects (lo), migrate to MongoDB, or store everything in S3. Trade-offs: Added latency for lazy loading and added complexity in managing presigned URLs. Why better: PostgreSQL remains the source of truth for metadata (fast queries, relational integrity). This pattern cut database costs by 80% and allows the system to scale to 1000+ page documents.

### PyMuPDF for PDF text extraction

PyMuPDF extracts text with bounding box coordinates for each word. This enables precise highlighting in the PDF viewer (highlight only the exact sentence that matched, not the entire page). Alternatives: pdf.js (no bounding boxes), Apache Tika (heavyweight), or pdfplumber (slower). Trade-offs: PyMuPDF requires Python runtime (added complexity in Docker image) and license restrictions (AGPL for commercial use). Why better: PyMuPDF is the fastest PDF parser and provides word-level geometry data for precise highlighting.

### Observability & Reliability

**Comprehensive Observability with Axiom**

Implemented structured logging to Axiom for every search query, so that performance bottlenecks can be identified in production with p50/p95 latency breakdowns, because distributed systems require observability to debug issues.

Tracking metrics across:

- Search latency: Keyword (70ms p50), semantic (290ms p50), embedding (45ms), Qdrant (180ms), S3 fetch (25ms)
- Result quality: Score distribution, hybrid match percentage (64%), zero result rate (4.2%)
- Geometry pipeline: Cache hit rate (94%), S3 geometry latency (18ms), cross-encoder inference time
- RAG pipeline: Retrieval latency, context length, chunk count, LLM response time

Built a custom SearchTimer class for automatic latency tracking, so that every code path reports timing without manual instrumentation, because manual timing is error-prone and often forgotten.

**Retry Logic with Exponential Backoff**

Added exponential backoff retry logic (3 attempts, 500ms → 1s → 2s) for S3 operations and Lambda invocations, so that transient network failures don't cause user-facing errors, because AWS services occasionally return temporary 503 errors. Demonstrates production-grade fault tolerance rather than optimistic happy-path coding.

## 4. What This Project Is NOT

**Out-of-scope:** Collaborative editing or annotations (this is a search engine, not a document management system), OCR for scanned PDFs (text must already be extractable), multi-language support (assumes English text), real-time search during processing (documents must finish processing before they become searchable).

**Conscious limitations:** No fuzzy matching (keyword search requires exact token matches to keep the inverted index simple), no support for non-PDF formats (DOCX, PPTX would require additional parsing logic with minimal learning value), no query suggestions or autocomplete (UX features that do not demonstrate architectural depth).

**Intentionally avoids:** Using managed search services (Elasticsearch, Algolia)—the point is to build the search pipeline from scratch. Using models like "text-embedding-3-small" for it's lightweight to run in a Lambda. Engineering the frontend, the UI is clean and functional but the value is in the backend architecture.

## 5. Evolution & Change Tracking

The system evolved through nine major optimization phases documented in `PERFORMANCE.md`:

**Search Architecture:** Baseline trie (1800ms suffix search) → Character inverted index (85% faster) → Deduplicated index (60% memory reduction) → TF-IDF page ranking (78% relevant results in top 3) → Semantic embeddings (65% recall improvement) → Hybrid RRF fusion (38% better than either alone) → Intent-based re-ranking (17% precision gain) → Sentence-level extraction (25% relevance improvement)

**Geometry & Caching:** Initial implementation fetched geometry on every search via external API (3.8s bottleneck). Evolved to pre-compute all geometry during indexing and cache in S3, so that searches hit cached data (18ms) instead of making API calls, because geometry rarely changes after indexing. Added Redis caching for embeddings (high computation cost, high reuse), eliminated ineffective caches (Qdrant results - low hit rate, large size).

**3-Lambda Migration:** Started with 2-Lambda architecture (API + Processor). Added dedicated Geometry Lambda to isolate ML model loading and enable independent scaling, so that cross-encoder models (800MB) don't slow down the main processor, because transformer model initialization adds 8s cold start.

**UX Evolution:** Initial implementation showed text snippets with keyword highlights. Evolved to show precise highlights directly on original PDFs using PyMuPDF bounding boxes, so that users see context in the actual document layout, because Google/Apple-style PDF highlighting increases trust and eliminates interpretation ambiguity.

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
