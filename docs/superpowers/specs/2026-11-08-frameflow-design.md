# FrameFlow System Architecture & Design Spec

## 1. Vision & Core Principle
FrameFlow is an AI-native video creation and timeline editing platform.
**Core Principle:** With AI removed, FrameFlow must still be a responsive, fully featured, non-destructive video editor. The editor is built first; AI sits on top as an assistant that produces standard editor commands.

## 2. Global Constraints
- TypeScript strict mode throughout (`noImplicitAny`, `strictNullChecks`, no `any`).
- Worker isolation: FFmpeg and ffprobe must NEVER be executed inside the web or API server processes; all media processing is handled by decoupled BullMQ workers.
- Timeline state is a serializable JSON document that is the single source of truth.
- Command pattern for all edits: every action (split, trim, move, delete, AI edit) implements `execute()` and `undo()`.
- All AI calls route through a single adapter service with timeouts, retries, cost tracking, and Zod schema validation.
- End-to-end local development reproducible via Docker Compose (`docker compose up`).

## 3. Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand editor state store.
- **Backend API**: Fastify (Node.js + TypeScript), `@fastify/jwt`, `@fastify/websocket`, `@fastify/multipart`.
- **Database & Queue**: PostgreSQL 16 (via Prisma ORM), Redis 7 (BullMQ job queues + pub/sub event bus).
- **Storage**: MinIO S3-compatible object storage (buckets: `raw-assets`, `proxies`, `thumbnails`, `renders`).
- **Media Engine**: FFmpeg 9.0+ / ffprobe.
- **AI Engine**: Gemini API adapter (`@google/genai`) with swappable interface (`IAiProvider`).

## 4. Phase Breakdown
- **Phase 1: Foundation**: Monorepo scaffolding, auth, projects CRUD, chunked video upload to MinIO, ffprobe metadata extraction, 720p proxy generation, thumbnail strip generation, WebSocket job progress.
- **Phase 2: Timeline Editor (no AI)**: Multi-track timeline UI, command pattern undo/redo, timeline JSON document, autosave & version history, proxy playback.
- **Phase 3: Rendering Pipeline**: Timeline JSON to FFmpeg `filter_complex` compiler, BullMQ render jobs, presets (1080p/720p H.264), error recovery.
- **Phase 4: AI Analysis**: Scene detection, audio transcription, frame sampling, multimodal scene labeling & scoring, semantic footage search.
- **Phase 5: AI-Assisted Assembly**: Natural language timeline assembly via editor commands, diff/preview UI, lock preservation.
- **Phase 6: Production Hardening**: Rate limits, quotas, signed URLs, structured logging, benchmarks, complete documentation.

