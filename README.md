# FrameFlow 🎬

> **AI-native video creation and timeline editing platform.**  
> *Core Principle: With the AI removed, this is still a fully functional, high-performance video editor. Build the editor first, then add AI on top.*

---

## 🚀 Overview

**FrameFlow** is a modern, full-stack video creation platform designed for creators, editors, and AI-assisted workflows. Users can upload hours of raw footage, perform precision multi-track timeline editing with non-destructive undo/redo, auto-generate 720p proxies and thumbnail strips, and export finished videos via an asynchronous FFmpeg rendering pipeline.

---

## 📦 Project Architecture & Monorepo Structure

FrameFlow is structured as an npm workspaces monorepo:

```
frameflow/
├── client/                     # Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand
│   ├── src/app/                # App router pages (auth, projects dashboard, studio editor)
│   ├── src/components/         # Timeline, Toolbar, Ruler, Playhead, PreviewPlayer, ExportModal
│   ├── src/hooks/              # Custom hooks (WebSocket live updates, snapping engine)
│   └── src/store/              # Zustand timeline store with non-destructive Command History
├── server/
│   ├── api/                    # Fastify REST API & WebSocket Gateway
│   │   ├── src/modules/        # Auth, Projects, Assets, Timeline, Renders
│   │   └── src/gateway/        # WebSocket job progress gateway (/ws)
│   ├── worker/                 # BullMQ background workers with FFmpeg pipelines
│   │   ├── src/processors/     # Media processor (metadata, proxy, thumbs) & Render processor
│   │   └── src/config.ts       # MinIO S3 & Redis configurations
│   └── database/               # PostgreSQL schema & Prisma ORM
│       └── prisma/schema.prisma# User, Project, Asset, Timeline, TimelineVersion, RenderJob
├── packages/
│   └── shared/                 # Shared types, Zod schemas, Command Pattern, FFmpeg Compiler
│       ├── src/timeline/       # TimelineDocument, Track, Clip models & Zod validation
│       ├── src/commands/       # ICommand, CommandHistory, Add/Trim/Split/Move/Delete/Composite
│       ├── src/compiler/       # Timeline-to-FFmpeg Filtergraph Compiler & presets
│       └── src/events/         # Redis Pub/Sub & WebSocket event definitions
├── docker-compose.yml          # PostgreSQL, Redis, and MinIO storage infrastructure
└── scripts/                    # End-to-end integration and verification suites
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Zustand |
| **Backend API** | Node.js, TypeScript, Fastify, `@fastify/jwt`, `@fastify/websocket`, Pino |
| **Worker Engine** | BullMQ, Redis, FFmpeg, ffprobe |
| **Storage & Database** | PostgreSQL, Prisma ORM, MinIO (S3-compatible object storage) |
| **Media Compiler** | Custom multi-track FFmpeg `filter_complex` compiler |
| **State & Commands** | Command Pattern (unlimited undo/redo), Serializable JSON documents |

---

## 🌟 Key Features

### 1. Multi-Track Timeline Editor
- **Video, Audio, and Text Tracks**: Add clips across multiple independent tracks.
- **Precision Trimming & Splitting**: Non-destructively adjust in/out points or split clips at the playhead.
- **Magnetic Snapping Engine**: Snaps clips to track bounds, adjacent clips, and playhead position.
- **Zoom & Playhead Scrubbing**: Dynamic ruler with zoom levels and smooth timecode scrubbing.
- **Proxy Preview Player**: Real-time synchronized playback preview using generated 720p proxy files.

### 2. Command Pattern with Unlimited Undo/Redo
- Every user edit is encapsulated as an atomic command implementing the `ICommand` interface:
  - `AddClipCommand`, `MoveClipCommand`, `TrimClipCommand`, `SplitClipCommand`, `DeleteClipCommand`, `CompositeCommand`
- Full `Ctrl+Z` / `Ctrl+Y` keyboard shortcuts and toolbar buttons.
- Enables multi-action AI edits to be undone in a single step via `CompositeCommand`.

### 3. PostgreSQL Autosave & Version History Snapshots
- Timeline is a serializable JSON document (`TimelineDocument`) acting as the single source of truth.
- Automatic background autosave to PostgreSQL with version incrementing.
- Create named milestone snapshots (e.g. "Rough Cut v1", "Director's Cut") and restore any previous version instantly.

### 4. Background Media Processing Pipeline
- **Chunked Multipart Uploads**: Upload large video files in 5MB chunks directly to MinIO.
- **Automated ffprobe Inspection**: Extracts duration, width, height, framerate, and codecs in background workers.
- **Proxy & Thumbnail Generation**: Generates 720p faststart proxies and 100-frame thumbnail strips automatically.
- **WebSocket Gateway**: Live progress updates (`QUEUED`, `PROCESSING`, `DONE`, `FAILED`) streamed to the UI in real time.

### 5. High-Performance FFmpeg Rendering Pipeline
- **Compiler**: Converts complex timelines into an FFmpeg `filter_complex` graph:
  - Base solid canvas of timeline duration
  - Aspect-ratio preserving scale and letterbox/pillarbox padding
  - Overlay positioning with timeline enable intervals
  - Cross-platform font resolution for title/text overlays
  - Audio delay syncing (`adelay`) and mixing (`amix` with `anullsrc` silence fallback)
- **Presets**: 1080p (`1080p_h264`, 5000 kbps) and 720p (`720p_h264`, 2500 kbps).
- **Asynchronous BullMQ Workers**: Progress tracking, job cancellation, MinIO upload, and one-click download.

---

## 🗺 Roadmap & Progress

- [x] **Phase 1: Foundation** (`phase-1-complete`)
  - [x] Monorepo architecture & Docker infrastructure (Postgres, Redis, MinIO)
  - [x] JWT Authentication & Projects CRUD
  - [x] Chunked multipart video uploads
  - [x] Worker ffprobe metadata extraction, 720p proxy & thumbnail generation
  - [x] Redis Pub/Sub WebSocket job progress gateway
- [x] **Phase 2: Timeline Editor (No AI)** (`phase-2-complete`)
  - [x] Serializable `TimelineDocument` with Zod schema validation
  - [x] Non-destructive Command Pattern with unlimited undo/redo
  - [x] PostgreSQL timeline autosave, version snapshots & restore
  - [x] Zustand timeline store with magnetic snapping & playhead scrubbing
  - [x] Studio editor UI with synchronized proxy `PreviewPlayer`
- [x] **Phase 3: Rendering Pipeline** (`phase-3-complete`)
  - [x] Timeline-to-FFmpeg `filter_complex` compiler
  - [x] BullMQ render workers with regex progress tracking
  - [x] Fastify render queue endpoints & cancellation
  - [x] Client Export Modal with presets, live progress bar & direct download
  - [x] Automated Phase 3 E2E test suite (100% pass)
- [ ] **Phase 4: AI Analysis** *(In Progress)*
  - [ ] FFmpeg scene cut detection & keyframe sampling
  - [ ] Audio extraction & Whisper transcription
  - [ ] Multimodal AI provider adapter (Google Gemini / Claude / Mock)
  - [ ] Structured scene boundaries, importance scoring, and labels
  - [ ] Natural language footage search ("find the part where he explains pricing")
- [ ] **Phase 5: AI-Assisted Assembly**
  - [ ] Prompt-driven highlight reel generator ("make a 60-second highlight reel")
  - [ ] Non-destructive command emission (undoable in one click)
  - [ ] Proposed edit preview diff with accept/reject controls
- [ ] **Phase 6: Production Hardening**
  - [ ] Rate limiting, signed URLs, structured logging & metrics
  - [ ] Comprehensive benchmarks (`docs/benchmarks.md`)

---

## ⚡ Quickstart & Local Development

### Prerequisites
- **Node.js**: v20 or later
- **Docker & Docker Compose**
- **FFmpeg & ffprobe**: Installed and available in your `PATH`

### 1. Clone the Repository
```bash
git clone https://github.com/yasirraeesit/frameflow.git
cd frameflow
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Infrastructure Containers
Start PostgreSQL, Redis, and MinIO:
```bash
docker compose up -d
```
Verify the services are running:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO Console**: `http://localhost:9001` (User: `minioadmin`, Password: `minioadmin`)

### 4. Install Dependencies & Migrate Database
```bash
npm install
npm --workspace=@frameflow/database run db:migrate
```

### 5. Start Development Servers
Run the full stack concurrently:
```bash
# In separate terminals (or using your process manager):
npm --workspace=@frameflow/api run dev     # Fastify API on http://localhost:4000
npm --workspace=@frameflow/worker run dev  # BullMQ Media & Render Workers
npm --workspace=@frameflow/web run dev     # Next.js frontend on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run unit tests across all workspace packages:
```bash
npm --workspace=@frameflow/shared test   # Timeline schemas, commands & compiler tests
npm --workspace=@frameflow/api test      # Auth, Projects, Assets, Timeline & Renders tests
npm --workspace=@frameflow/worker test   # FFmpeg media & render processor tests
```

Run the automated End-to-End Rendering Pipeline verification suite:
```bash
npx tsx --env-file=.env scripts/test-phase3-e2e.ts
```

---

## 📄 License

MIT License. Designed and built with ❤️ for creators and AI-assisted workflows.

