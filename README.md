<div align="center">

# 🎬 FrameFlow

### **The AI-Native Video Repurposing Studio & Multi-Track Timeline Editor**

*Turn 1-hour podcasts, interviews, and long videos into 15 viral 9:16 shorts in minutes — with a real, editable multi-track timeline underneath.*

[![Version](https://img.shields.io/badge/version-0.4.0-E84C2B?style=flat-square)](https://github.com/yasirraeesit/frameflow/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Zero_Any-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-v4_REST_and_WS-000000?style=flat-square&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis_Worker_Mesh-DC382D?style=flat-square&logo=redis&logoColor=white)](https://bullmq.io/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Hardware_Accelerated-007808?style=flat-square&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MinIO](https://img.shields.io/badge/MinIO-S3_Compatible-C72C48?style=flat-square&logo=minio&logoColor=white)](https://min.io/)

<br />

[**Key Capabilities**](#-key-capabilities) • [**The FrameFlow Difference**](#-the-frameflow-difference) • [**System Architecture**](#-system-architecture) • [**Timeline AST Spec**](#-serializable-timeline-ast) • [**Quickstart**](#-quickstart-in-2-minutes) • [**Screens & Studio Flow**](#-screens--studio-flow)

</div>

---

## 💡 The FrameFlow Difference

Most video clipping tools force creators into an artificial dilemma:

1. **Legacy Desktop NLEs (Premiere, Final Cut, DaVinci)**: Powerful timelines, but scrubbing through a 2-hour podcast to find hooks and keyframing 400 subtitle layers takes 4+ hours of mind-numbing manual work.
2. **Black-Box AI Clippers ($29–$99/month)**: You paste a link and get a locked, uneditable video out. If the AI cuts off a punchline or picks an awkward frame, you can't fix it — re-generating burns your monthly paid minutes.

### **The FrameFlow Philosophy**
> **"Edit video like a document. Fine-tune on an actual multi-track timeline."**

FrameFlow detects high-retention hooks, reframes speakers into 9:16 vertical video, generates word-by-word animated captions, and hands you **both a text-based transcript editor (delete words to trim video) and a non-destructive 4-track timeline** to adjust every cut, transition, and B-roll layer with instant `Ctrl+Z` undo.

---

## ⚡ Key Capabilities

### 1. ✂️ Dual Text & Timeline Editing
- **Transcript Cut Engine**: Click awkward filler words (`"um, sort of like"`, `"you know"`) directly in the text transcript to strike them out, automatically trimming the underlying footage and shrinking the timeline clip with zero re-encode delay.
- **Full 4-Track Non-Destructive Timeline**: Video (V1), B-Roll (V2), Subtitles (T1), and Master Audio (A1) tracks with frame-accurate playhead trimming and splitting (`S` key).
- **Atomic Undo/Redo Engine**: Every action (move, trim, split, delete, or AI batch cuts) is an undoable Command Pattern object (`Ctrl+Z` / `Ctrl+Y`).

### 2. 📱 Intelligent 9:16 Auto-Crop & Dynamic Layouts
- **Speaker Diarization & Face Tracking**: Keeps the active speaker centered in vertical 9:16 without awkward manual pan-and-scan.
- **Dynamic Layout Modes**:
  - **Solo Speaker**: Dynamic face crop with smart padding.
  - **2-Speaker Split**: Automatic top/bottom split for host-guest banter.
  - **Screen + Cam**: Picture-in-picture overlay for slide decks, software demos, and game streams.
- **Social Safe Zone Overlays**: Verified boundaries for TikTok, Instagram Reels, and YouTube Shorts.

### 3. ✨ Viral Caption & Brand Styler
- **Animated Subtitle Presets**:
  - **Hormozi Bold Pop**: High-energy uppercase typography with animated kinetic scaling and keyword glows.
  - **Karaoke Box**: Solid high-contrast badge with synchronized word highlight fills.
  - **Clean Cinema**: Crisp modern sans-serif with subtle drop shadows.
- **Brand Kits**: Custom fonts, primary colors, keyword highlight colors, uppercase transforms, and logo watermark placement.

### 4. 🔑 Unlimited Bring Your Own Key (BYOK) Engine
- **Zero "AI Minute" Subscriptions**: Plug in your own free developer API keys to process hours of video at zero markup:
  - **Groq Whisper Turbo**: 500+ free transcription minutes per month at 216x real-time speed with word-level timestamps.
  - **Google Gemini 2.0 Flash**: Free tier (15 requests/minute) for multimodal hook discovery and virality scoring.
  - **OpenRouter & GitHub Models**: Connect any custom LLM or free model endpoint.
  - **Local Ollama**: 100% offline, private inference for air-gapped workstations.
- **Client-Side Privacy**: Your API keys stay in your browser and your video footage never trains third-party models.

### 5. 🚀 Distributed Media Ingestion & FFmpeg Render Mesh
- **Resumable Chunked Multipart Uploads**: Upload giant 4K/1080p source files in parallel chunks directly to S3-compatible MinIO storage.
- **Asynchronous Worker Mesh**: BullMQ Redis workers probe metadata via `ffprobe`, generate 720p faststart proxies, and compile timelines into optimized FFmpeg `filter_complex` graphs for clean 1080p MP4 exports with zero watermarks.
- **Live WebSocket Progress**: Real-time 0% $\to$ 100% event streaming over WebSocket gateway (`/ws`).

---

## 🏗 System Architecture

```
                           +-------------------------------------+
                           |   Next.js 14 Frontend Studio UI     |
                           |   (Zustand + React 18 + Tailwind)   |
                           +------------------+------------------+
                                              |
                           HTTP REST API /    | WebSocket (/ws)
                           Multipart Upload   | Live Progress
                                              v
                           +-------------------------------------+
                           |      Fastify API Gateway (Node)     |
                           |    Auth | Projects | Renders API    |
                           +---------+-----------------+---------+
                                     |                 |
                 Enqueue Job via     |                 | Database Queries
                 BullMQ Queue        |                 | (Prisma ORM)
                                     v                 v
                        +------------+----+       +----+------------+
                        |   Redis Engine  |       |   PostgreSQL    |
                        |  Queue & PubSub |       |  Relational DB  |
                        +------------+----+       +-----------------+
                                     |
                     Worker consumes | Redis PubSub
                     job execution   | progress broadcast
                                     v
                        +------------+--------------------------+
                        |     BullMQ Background Worker Mesh     |
                        | - Chunked Video Ingestion & ffprobe   |
                        | - 720p Proxy & Thumbnail Generator    |
                        | - Timeline-to-FFmpeg Filter Compiler  |
                        | - 1080p Multi-Track Final Renderer    |
                        +---------------------+-----------------+
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

## 🖥 Screens & Studio Flow

| Screen | Route | Description |
|---|---|---|
| **Editorial Landing Page** | `/` | High-craft commercial homepage with live interactive transcript cut demo, interactive caption styler, dual-phone 9:16 showcase, and transparent BYOK pricing. |
| **Split Auth & Demo Access** | `/login`, `/register` | Split editorial auth screen (Warm Vellum + Dark Cinema Showcase) with 1-click instant demo account access, live 9:16 iPhone preview with kinetic Hormozi captions, and BYOK privacy. |
| **Studio Dashboard** | `/dashboard` | Quick URL launcher (YouTube / Vimeo / MP4), recent projects list, viral score preview cards, and storage stats. |
| **Project & Hook Pipeline** | `/projects/[id]` | Processing monitor with live Whisper transcription progress, Diarization, and 8 ranked viral shorts with hook strength & virality sub-scores. |
| **Short-Form Studio Editor** | `/editor/[clipId]` | Full-viewport (`100dvh`) 4-zone workstation: interactive transcript cuts, 9:16 canvas with safe zones, timeline tracks, and brand kit toggles. |
| **Brand Kit & Templates** | `/brand-kit` | Split view for font selection, primary & highlight colors, uppercase toggle, and live 9:16 preview card. |
| **Exports History** | `/exports` | Grid of rendered 1080p shorts with file sizes, download CTA, and 1-click copy for AI-generated TikTok/Shorts titles and hashtags. |
| **BYOK AI Settings** | `/settings` | Bring Your Own Key configuration for Groq, Google Gemini, OpenRouter, and Ollama with live "Test Connection" status checks. |

---

## 📁 Repository Map

```
frameflow/
├── client/                     # Next.js 14 Frontend Studio (App Router)
│   ├── src/app/
│   │   ├── page.tsx            # High-craft Warm Vellum landing page
│   │   ├── (auth)/             # /login & /register (Split editorial auth screens)
│   │   ├── (dashboard)/        # /dashboard, /projects, /brand-kit, /exports, /settings
│   │   └── editor/[clipId]/    # Full 4-zone short-form studio editor
│   ├── src/components/
│   │   ├── auth/               # AuthShowcasePanel (9:16 iPhone preview, Hormozi captions)
│   │   ├── landing/            # HeroOverlappingStage, AsymmetricWorkflowShowcase,
│   │   │                       # StaggeredBento, PricingComparison, FaqAndCtaBanner, LandingFooter
│   │   └── layout/             # Sidebar rail, header, navigation shell
│   └── src/lib/                # Mock data, types, utilities
├── server/
│   ├── api/                    # Fastify REST API & WebSocket Gateway
│   │   ├── src/modules/        # Auth, Projects, Assets, Timeline, Renders
│   │   └── src/gateway/        # WebSocket (/ws) Redis Pub/Sub gateway
│   ├── worker/                 # Asynchronous Media & Render Engine
│   │   ├── src/processors/     # media.processor.ts & render.processor.ts
│   │   └── src/index.ts        # Worker pool entrypoint
│   └── database/               # PostgreSQL Database & Persistence
│       └── prisma/schema.prisma# Prisma Schema (Users, Projects, Renders, etc.)
├── shared/                     # Isomorphic Shared Library (Strict Zero Any)
│   ├── src/timeline/           # TimelineDocument AST & validation
│   ├── src/commands/           # Command pattern implementations (undo/redo)
│   ├── src/compiler/           # Timeline-to-FFmpeg filtergraph compiler
│   └── src/events/             # Distributed job event definitions
├── docker-compose.yml          # Local infra: PostgreSQL, Redis, MinIO
└── scripts/                    # End-to-end verification and test suites
```

---

## 📜 Serializable Timeline AST

The timeline is stored as a deterministic, version-controlled JSON schema:

```json
{
  "id": "tl-short-9a4f21",
  "projectId": "proj-podcast-01",
  "version": 4,
  "fps": 30,
  "duration": 40.8,
  "tracks": [
    {
      "id": "track-v1",
      "type": "VIDEO",
      "name": "9:16 Speaker Crop",
      "locked": false,
      "muted": false,
      "clips": [
        {
          "id": "clip-101",
          "assetId": "asset-raw-interview",
          "name": "Speaker 1 Crop",
          "start": 0.0,
          "duration": 40.8,
          "inPoint": 14.22,
          "outPoint": 55.02,
          "speed": 1.0,
          "proxyUrl": "/media/proxies/asset-raw-interview.mp4"
        }
      ]
    },
    {
      "id": "track-t1",
      "type": "TEXT",
      "name": "Animated Subtitles",
      "locked": false,
      "muted": false,
      "clips": [
        {
          "id": "clip-sub-01",
          "assetId": null,
          "name": "Hormozi Pop Captions",
          "start": 0.0,
          "duration": 40.8,
          "inPoint": 0.0,
          "outPoint": 40.8,
          "speed": 1.0,
          "textConfig": {
            "preset": "bold_pop",
            "highlightColor": "#E84C2B",
            "position": "bottom"
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

### 4. Install Dependencies & Run Database Schema Push
```bash
npm install
npm --workspace=@frameflow/database run prisma:generate
npm --workspace=@frameflow/database run prisma:push
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

FrameFlow enforces strict type safety (zero `any`) and comprehensive test coverage across every workspace:

```bash
# Run unit & schema tests across all packages
npm --workspace=@frameflow/shared test
npm --workspace=@frameflow/api test
npm --workspace=@frameflow/worker test

# Build client production bundles
npm --workspace=@frameflow/web run build

# Run the complete Phase 3 End-to-End Rendering Pipeline verification suite
npx tsx --env-file=.env scripts/test-phase3-e2e.ts
```

The E2E and unit test suites validate:
1. User registration, login, and project creation
2. Real-time WebSocket gateway connection and channel subscription
3. Parallel multipart chunked video ingestion to MinIO
4. Background `ffprobe` inspection and 720p proxy generation
5. Multi-track timeline assembly (Video + Audio + Text overlays)
6. Asynchronous 1080p render job dispatch and BullMQ worker execution
7. Direct inspection of the rendered MP4 via `ffprobe` (dimensions, codecs, bitrates)
8. Mid-flight render cancellation and cleanup

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
