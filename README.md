<div align="center">

# 🎬 FrameFlow

### **The Open-Source, AI-Native Video Creation & Timeline Editing Platform**

*Professional multi-track editing in the browser, powered by an asynchronous FFmpeg rendering engine and extensible multimodal AI.*

[![Version](https://img.shields.io/github/v/tag/yasirraeesit/frameflow?label=version&color=6366f1&style=flat-square)](https://github.com/yasirraeesit/frameflow/tags)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_100%25-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-v4_REST_%2B_WS-000000?style=flat-square&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis_Worker_Mesh-DC382D?style=flat-square&logo=redis&logoColor=white)](https://bullmq.io/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Hardware_Accelerated-007808?style=flat-square&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MinIO](https://img.shields.io/badge/MinIO-S3_Compatible-C72C48?style=flat-square&logo=minio&logoColor=white)](https://min.io/)

<br />

[**Key Capabilities**](#-key-capabilities) • [**Why FrameFlow?**](#-why-frameflow) • [**System Architecture**](#-system-architecture) • [**Timeline AST Spec**](#-serializable-timeline-ast) • [**Quickstart**](#-quickstart-in-2-minutes) • [**Milestones**](#-roadmap--milestones)

</div>

---

## 💡 Why FrameFlow?

Modern video creation tooling is fundamentally divided between two flawed extremes:

1. **Legacy Desktop NLEs (Premiere, Final Cut, DaVinci)**: Heavy desktop installations, proprietary closed binary project files, no collaborative cloud primitives, and zero programmatic web APIs.
2. **Black-Box AI Video Generators**: Prompt in, un-editable compressed video out. If a single word or cut is wrong, the creator is forced to re-prompt from scratch with zero granular control.

### **The FrameFlow Philosophy**
> **"With AI removed, FrameFlow is still a lightning-fast, frame-accurate, professional video editor. With AI added, you gain an autonomous assistant editor that drafts cuts directly onto your timeline — keeping you in full creative control."**

Every edit, transition, and asset remains an editable, non-destructive node on the timeline that can be adjusted, re-arranged, or undone in a single keystroke.

---

## ⚡ Key Capabilities

### 1. 🎞 Multi-Track Timeline Engine
- **Independent Video, Audio & Text Tracks**: Overlay dynamic titles, background music, sound effects, and B-roll seamlessly.
- **Frame-Accurate Trimming & Splitting**: Non-destructively adjust clip in/out boundaries or slice clips at the playhead position (`S` key).
- **Magnetic Snapping Engine**: Snaps clips dynamically to track bounds, adjacent cut points, and the playhead with sub-pixel precision.
- **Smooth Timecode Scrubbing & Zoom**: Dynamic zoom levels ($10\text{px/s} \to 160\text{px/s}$) with responsive playhead scrubbing and frame-accurate proxy preview.

### 2. ⏪ Non-Destructive Command Pattern & Unlimited Undo/Redo
- Edits never mutate timeline state directly. All actions are dispatched as atomic command objects:
  - `AddClipCommand`, `MoveClipCommand`, `TrimClipCommand`, `SplitClipCommand`, `DeleteClipCommand`
- **Atomic Composite Batches**: Multi-action operations (such as an automated AI rough cut) are batched via `CompositeCommand`, allowing a 50-cut edit sequence to be rolled forward or backward in a single click (`Ctrl+Z` / `Ctrl+Y`).

### 3. 💾 PostgreSQL Autosave & Snapshot Branching
- The timeline is an open, serializable JSON document (`TimelineDocument`) acting as the single source of truth.
- Automatic non-blocking background debounced autosave.
- **Milestone Snapshots**: Create named release checkpoints (e.g. *"Director's Cut v1"*, *"Client Review 2"*) and restore any previous version instantly.

### 4. 🚀 Cloud-Native Ingestion & Proxy Transcoding
- **Resumable Chunked Multipart Uploads**: Upload hours of raw 4K/1080p footage directly to MinIO in parallel 5MB chunks.
- **Worker Media Extraction**: Automated `ffprobe` inspection extracts resolution, duration, framerate, and audio/video codecs.
- **Faststart Proxy Generation**: Generates 720p H.264 web proxies and 100-slice visual scrubbing thumbnail strips in background BullMQ workers.

### 5. 🎛 Distributed FFmpeg Filtergraph Compiler
- Pure TypeScript compiler converts complex multi-track timelines into an optimized FFmpeg `filter_complex` execution graph:
  - Base solid canvas generated to exact project resolution and FPS
  - Dynamic aspect-ratio scaling with automatic letterbox/pillarbox padding
  - Overlays bound to timeline time ranges via `enable='between(t,start,end)'`
  - Cross-platform font resolution for title/text overlays
  - Sub-millisecond audio offset delay matching (`adelay`) and mixing (`amix` with silence fallback)
- **Export Presets**: Crisp 1080p (`1080p_h264`, 5 Mbps) and fast 720p (`720p_h264`, 2.5 Mbps) with faststart container flags.

### 6. 📡 Real-Time Distributed Event Mesh
- Redis Pub/Sub backplane connected to Fastify WebSocket gateway (`/ws`).
- Streams real-time progress percentages (0% $\to$ 100%) for both asset ingestion and video rendering directly to the user's browser.

---

## 🏗 System Architecture

FrameFlow is architected with strict decoupling: the API server manages business logic and control plane traffic, while distributed BullMQ worker processes manage compute-intensive FFmpeg data pipelines.

```
                           +----------------------------------+
                           |  Next.js 14 Frontend Studio UI   |
                           |   (Zustand + React 18 + HTML5)   |
                           +-----------------+----------------+
                                             |
                          HTTP REST API /    | WebSocket (/ws)
                          Multipart Upload   | Live Progress
                                             v
                           +----------------------------------+
                           |     Fastify API Gateway (Node)    |
                           |   Auth | Projects | Renders API  |
                           +--------+----------------+--------+
                                    |                |
                Enqueue Job via     |                | Database Queries
                BullMQ Queue        |                | (Prisma ORM)
                                    v                v
                       +------------+----+      +----+------------+
                       |   Redis Engine  |      |   PostgreSQL    |
                       |  Queue & PubSub |      | Relational DB   |
                       +------------+----+      +-----------------+
                                    |
                    Worker consumes | Redis PubSub
                    job execution   | progress broadcast
                                    v
                       +------------+-------------------------+
                       |    BullMQ Background Worker Mesh     |
                       | - Chunked Video Ingestion & ffprobe  |
                       | - 720p Proxy & Thumbnail Generator   |
                       | - FFmpeg filter_complex Compiler     |
                       | - Multimodal AI Analysis & Cuts      |
                       +--------------------+-----------------+
                                            |
                                            | Streams chunks &
                                            | exports rendered MP4
                                            v
                               +------------+------------+
                               |   MinIO Object Storage  |
                               | (S3-compatible storage) |
                               +-------------------------+
```

---

## 📁 Repository Map

```
frameflow/
├── client/                     # Next.js 14 Frontend (App Router)
│   ├── src/app/                # /login, /register, /projects, /editor/[id]
│   ├── src/components/
│   │   ├── timeline/           # Ruler, Tracks, Clips, Playhead, Snapping
│   │   ├── preview/            # Synchronized HTML5 Proxy Preview Player
│   │   ├── media/              # Media Bin, Chunked Uploader, Asset Cards
│   │   └── export/             # Render Export Modal & Live Progress Bar
│   └── src/store/              # Zustand Timeline & Command State Store
├── server/
│   ├── api/                    # Fastify REST API & WebSocket Gateway
│   │   ├── src/modules/        # Auth, Projects, Assets, Timeline, Renders
│   │   └── src/gateway/        # WebSocket (/ws) Redis Pub/Sub gateway
│   ├── worker/                 # Asynchronous Media & Render Engine
│   │   ├── src/processors/     # media.processor.ts & render.processor.ts
│   │   └── src/index.ts        # Worker pool entrypoint
│   └── database/               # PostgreSQL Database & Persistence
│       └── prisma/schema.prisma# Prisma Schema (Users, Projects, Renders, etc.)
├── packages/
│   └── shared/                 # Isomorphic Shared Library
│       ├── src/timeline/       # TimelineDocument AST & validation
│       ├── src/commands/       # Command pattern implementations & history
│       ├── src/compiler/       # Timeline-to-FFmpeg filtergraph compiler
│       └── src/events/         # Distributed job event definitions
├── docker-compose.yml          # Local infra: PostgreSQL, Redis, MinIO
└── scripts/                    # End-to-end verification and benchmark suites
```

---

## 📜 Serializable Timeline AST

The timeline is stored as a deterministic, version-controlled JSON schema:

```json
{
  "id": "tl-9a4f21",
  "projectId": "proj-3810f2",
  "version": 4,
  "fps": 30,
  "duration": 45.0,
  "tracks": [
    {
      "id": "track-v1",
      "type": "VIDEO",
      "name": "Main Footage",
      "locked": false,
      "muted": false,
      "clips": [
        {
          "id": "clip-101",
          "assetId": "asset-raw-4k",
          "name": "Interview A-Roll",
          "start": 0.0,
          "duration": 15.0,
          "inPoint": 2.5,
          "outPoint": 17.5,
          "speed": 1.0,
          "proxyUrl": "/media/proxies/asset-raw-4k.mp4"
        }
      ]
    },
    {
      "id": "track-t1",
      "type": "TEXT",
      "name": "Lower Thirds",
      "locked": false,
      "muted": false,
      "clips": [
        {
          "id": "clip-201",
          "assetId": null,
          "name": "Speaker Name Title",
          "start": 1.0,
          "duration": 4.0,
          "inPoint": 0.0,
          "outPoint": 4.0,
          "speed": 1.0,
          "textConfig": {
            "text": "Dr. Alex Vance — Lead Researcher",
            "fontSize": 42,
            "color": "#ffffff",
            "position": { "x": 50, "y": 85 }
          }
        }
      ]
    }
  ],
  "markers": []
}
```

---

## ⚡ Quickstart in 2 Minutes

### System Prerequisites
- **Node.js**: v20.x or higher
- **Docker & Docker Compose**: For PostgreSQL, Redis, and MinIO
- **FFmpeg & ffprobe**: Installed in your system environment (`ffmpeg -version`)

### 1. Clone the Repository
```bash
git clone https://github.com/yasirraeesit/frameflow.git
cd frameflow
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Spin Up Infrastructure
```bash
docker compose up -d
```
Service health check:
- **PostgreSQL**: `localhost:5432`
- **Redis Engine**: `localhost:6379`
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)

### 4. Install Dependencies & Run Database Migrations
```bash
npm install
npm --workspace=@frameflow/database run db:migrate
```

### 5. Launch the Development Stack
Start the API, Worker, and Web Studio concurrently:

```bash
# Terminal 1: Fastify REST API
npm --workspace=@frameflow/api run dev

# Terminal 2: BullMQ Media & Render Worker
npm --workspace=@frameflow/worker run dev

# Terminal 3: Next.js Studio Frontend
npm --workspace=@frameflow/web run dev
```

Navigate to [**http://localhost:3000**](http://localhost:3000) to open the FrameFlow Studio.

---

## 🧪 Comprehensive Verification & Testing

FrameFlow enforces strict type safety (zero `any`) and comprehensive test coverage across every package:

```bash
# Run unit & schema tests across all packages
npm --workspace=@frameflow/shared test
npm --workspace=@frameflow/api test
npm --workspace=@frameflow/worker test

# Run the complete Phase 3 End-to-End Rendering Pipeline verification suite
npx tsx --env-file=.env scripts/test-phase3-e2e.ts
```

The E2E suite validates:
1. User registration and project creation
2. Real-time WebSocket gateway connection and channel subscription
3. Parallel multipart chunked video ingestion
4. Background ffprobe extraction and 720p proxy generation
5. Multi-track timeline assembly (Video + Audio + Text overlays)
6. Asynchronous 1080p render job dispatch
7. BullMQ worker execution and live progress broadcasting (0% $\to$ 100%)
8. Direct inspection of the rendered MP4 via `ffprobe` (dimensions, codecs, bitrates, audio channels)
9. Mid-flight render cancellation and cleanup

---

## 🗺 Roadmap & Milestones

| Milestone | Scope | Status | Tag |
|---|---|:---:|:---:|
| **Phase 1: Foundation** | Monorepo scaffolding, JWT auth, projects CRUD, chunked video uploads, worker ffprobe metadata, 720p proxies, thumbnail strips, WebSocket progress. | ✅ **Complete** | [`phase-1-complete`](https://github.com/yasirraeesit/frameflow/releases/tag/phase-1-complete) |
| **Phase 2: Timeline Editor** | Multi-track timeline UI, serializable JSON AST, non-destructive Command Pattern (unlimited undo/redo), PostgreSQL autosave & version snapshots, synchronized proxy player. | ✅ **Complete** | [`phase-2-complete`](https://github.com/yasirraeesit/frameflow/releases/tag/phase-2-complete) |
| **Phase 3: Rendering Pipeline** | Timeline-to-FFmpeg `filter_complex` compiler, BullMQ render workers, export presets (1080p/720p), job cancellation, client export modal with live download. | ✅ **Complete** | [`phase-3-complete`](https://github.com/yasirraeesit/frameflow/releases/tag/phase-3-complete) |
| **Phase 4: AI Analysis** | FFmpeg scene detection, audio extraction & Whisper transcription, swappable multimodal AI adapter (Gemini / Claude / Mock), importance scoring, natural language search. | 🔄 **In Progress** | `main` |
| **Phase 5: AI-Assisted Assembly** | Natural language timeline prompts ("create a 60s highlight reel"), atomic command emission, diff preview with accept/reject, track locking preservation. | ⏳ Planned | — |
| **Phase 6: Production Hardening** | Rate limiting, signed URLs, structured logging, health checks, queue latency metrics, benchmarks documentation (`docs/benchmarks.md`). | ⏳ Planned | — |

---

## 🤝 Contributing

We welcome contributions from developers, video creators, and AI researchers!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by creators, for creators.</sub>
</div>
