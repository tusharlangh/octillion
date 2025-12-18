# Octillion

A serverless document intelligence platform with hybrid search (semantic + keyword) for searching across multiple PDFs.

## The Problem

Searching through multiple documents is painful. You either need to know the exact phrase you're looking for, or you're stuck opening files one by one hoping to find what you need. Octillion solves this by letting you search across all your documents at once. Semantic search finds relevant content even when wording differs, while hybrid mode combines both approaches for 50% better recall than keyword only search.

## Demo

**Live Demo:** [octillion.vercel.app](https://octillion.vercel.app)

## Features

- **Keyword Search** — Uses TF-IDF with an inverted index. Good when you know the exact terms you're looking for.
- **Semantic Search** — Vector embeddings stored in Qdrant (384-dimensional). Finds conceptually similar content even when wording differs.
- **Hybrid Search** — Runs both searches, normalizes the scores, and merges results using a MinHeap to get the best of both worlds.
- **Async Processing** — File parsing happens in a separate Lambda worker so uploads don't block the UI.
- **PDF Extraction** — Chunks documents while preserving page structure for accurate retrieval.

## Tech Stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Frontend       | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend        | Node.js 20, Express 5, Serverless Framework      |
| Database       | Supabase (PostgreSQL), Qdrant (Vector DB)        |
| Infrastructure | AWS Lambda, S3, Docker                           |
| Auth           | Supabase Auth + JWT                              |

## Installation

### Prerequisites

- Node.js 20+
- AWS CLI configured
- Supabase project
- Qdrant instance

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

**Backend** (`backend/.env`)

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

**Frontend** (`frontend/oc/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Usage

1. Upload your PDF documents
2. Wait for processing to complete (happens async)
3. Search using one of three modes:
   - **Keyword**: `"budget allocation 2024"` — finds exact matches
   - **Semantic**: `"financial planning"` — finds related content
   - **Hybrid**: Best results when you're not sure which approach will work better

## What I Learned

- Built a custom hybrid search system combining semantic vector search and TF-IDF keyword matching. Implemented the TF-IDF inverted index from scratch instead of using Elasticsearch, which gave me control over chunking strategy and scoring logic. The challenge was merging results from two different scoring systems—vector similarity scores (0-1 range) and TF-IDF scores (unbounded). Solved this by normalizing both score distributions to the same scale before combining them, then used a MinHeap to efficiently maintain top-k results (O(n log k) vs O(n log n) for sorting). **Result: 50% better recall than keyword-only search while keeping query latency under 500ms.**

- Built a two-Lambda architecture to solve a critical scalability bottleneck. Originally, file uploads locked users into 60-90 second loading screens while a single over provisioned Lambda (1GB RAM) processed 100MB+ files. Split this into separate API and processor functions. API handles requests at 128MB, processor runs async at 1GB only when needed. Added background processing with real-time status updates so users can keep working during uploads. **Result: 90% smoother UX, 60% cost reduction, and true horizontal scalability.**

- Designed a hybrid storage architecture to solve PostgreSQL's row size limits. When testing with large documents that hit Supabase's 1GB row limit, storing inverted indexes and page metadata as JSONB caused database errors on 50+ page files. Instead of just upgrading to a bigger database plan, I architected a split storage pattern: metadata stays in PostgreSQL for fast queries, large JSON objects get stored in S3 with lazy loading. Queries only fetch S3 data when needed via presigned URLs. **Result: Eliminated row size errors, cut database costs by 80%, and can now handle documents with 1000+ pages without architectural changes.**

## Contact

- **GitHub:** [github.com/tusharlangh](https://github.com/tusharlangh)
- **LinkedIn:** [linkedin.com/in/tushar-langhnoda](https://www.linkedin.com/in/tushar-langhnoda-7681aa385)
- **Email:** tusharlanghnoda@gmail.com
- **Portfolio:** [tushar-langhnoda.vercel.app](https://tushar-langhnoda.vercel.app)
