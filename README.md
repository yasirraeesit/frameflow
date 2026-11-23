<div align="center">

# 🎬 FrameFlow

### **The Commercial AI Video Repurposing Platform & Multi-Track Studio**

*Turn 1-hour podcasts, gaming streams, and long videos into 15 viral 9:16 shorts in minutes — backed by managed AI transcription, transformative fair-use protection, and a real, editable multi-track timeline.*

[![Version](https://img.shields.io/badge/version-1.0.0-E84C2B?style=flat-square)](https://github.com/yasirraeesit/frameflow/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Zero_Any-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-v4_REST_and_WS-000000?style=flat-square&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis_Worker_Mesh-DC382D?style=flat-square&logo=redis&logoColor=white)](https://bullmq.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Paddle Billing](https://img.shields.io/badge/Paddle-Merchant_of_Record-2B2D42?style=flat-square&logo=paddle&logoColor=white)](https://paddle.com/)
[![Groq & Gemini](https://img.shields.io/badge/AI_Engine-Groq_Whisper_+_Gemini_2.5-FF7700?style=flat-square)](https://groq.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Hardware_Accelerated-007808?style=flat-square&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![MinIO](https://img.shields.io/badge/MinIO-S3_Compatible-C72C48?style=flat-square&logo=minio&logoColor=white)](https://min.io/)

<br />

[**Key Capabilities**](#-key-capabilities) • [**System Architecture**](#-system-architecture) • [**Core Engines**](#-core-engines) • [**Timeline AST Spec**](#-serializable-timeline-ast) • [**Screens & Studio Flow**](#-screens--studio-flow) • [**Quickstart**](#-quickstart-in-5-minutes) • [**Environment Reference**](#-environment-configuration)

</div>

---

## 💡 The FrameFlow Commercial Vision

Most video repurposing platforms trap creators in an inflexible dilemma:

1. **Legacy Desktop NLEs (Premiere Pro, DaVinci Resolve, Final Cut)**: Phenomenal timelines, but hunting through a 2-hour interview or gaming stream for hooks, keyframing auto-crops, and styling 400 subtitle layers requires hours of tedious manual scrubbing.
2. **Black-Box AI Clippers ($29–$99/month)**: You paste a link and receive an uneditable, pre-rendered video. If the AI cuts off a punchline, misidentifies the speaker, or chooses a boring crop, you have no recourse — re-generating wastes your monthly paid minutes. Furthermore, raw re-uploads frequently trigger YouTube and Meta copyright strikes and unoriginal content demonetization flags.

### **The FrameFlow Standard**
> **"Instant AI hook discovery and auto-reframing up front. Non-destructive multi-track control and transformative monetization safety underneath."**

FrameFlow detects high-retention hooks, reframes speakers or gameplay HUDs into vertical 9:16, burns animated kinetic subtitles, and hands you **both a text-based transcript editor (delete words to ripple-cut video) and a non-destructive 5-track timeline dock** with instant `Ctrl+Z` atomic history. For gaming streams and reaction content, our **Monetization-Safe Transformation Engine** automates visual pacing cuts, generates custom commentary hooks, and records creator voiceovers directly in the browser to ensure full compliance with YouTube and Meta monetization policies.

---

## ⚡ Key Capabilities

### 1. ✂️ Dual-Mode Studio Editor
- **Interactive Transcript Ripple-Cut Engine**: Click awkward pauses or filler words (`"um"`, `"sort of like"`, `"you know"`) directly in the word-by-word transcript to strike them out, instantly trimming the underlying video track with zero re-encode latency.
- **5-Track Non-Destructive Timeline**: Video (V1), B-Roll (V2), Subtitles (T1), Master Audio (A1), and Creator Voiceover (A2) with frame-accurate scrubbing, split cutting (`S`), and atomic undo/redo (`Ctrl+Z` / `Ctrl+Shift+Z`).
- **Dark Cinema Monitor (`#121318`)**: Aspect ratio switching (`9:16`, `1:1`, `16:9`), platform safe zone guides for TikTok, Reels, and Shorts, and live subtitle rendering.
- **Pro Multi-Format Export Drawer**: Render 1080p / 4K MP4, export DaVinci Resolve & Premiere Pro XML project sequences (`PRO`), or download raw SRT/VTT/TXT subtitle packages.

### 2. 🎮 Gaming & GTA 6 Long-to-Short Engine
- **Hybrid Audio Energy & Action Spike Detection**: Slices gaming walkthroughs, speedruns, and esports VODs using a +14dB burst volume energy analyzer that detects gunshots, sirens, vehicle redlines, explosions, and streamer screaming reactions — extracting viral clips even from zero-commentary gameplay.
- **Gameplay + Cam Reframe Layout**: Maintains the 16:9 gameplay canvas with visible minimap radar, ammo counters, and HUD, while seamlessly overlaying a cropped streamer facecam and 5-star wanted badge (`★ ★ ★ ★ ★ POLICE`).
- **Vice Neon Subtitles**: High-energy cyan (`#00F0FF`) and hot magenta (`#FF007F`) glowing kinetic typography engineered for high-octane gaming content.

### 3. 🛡️ Monetization-Safe Transformation Engine
- **Source Ownership Classification**:
  - **`My Original Footage`**: Marks clips as original source material for clean master rendering.
  - **`Commentary / Reaction Clip`** (Transformative Mode): Activates fair-use compliance rules to prevent unoriginal content demonetization.
- **Dynamic Visual Pacing**: Automatically injects subtle `1.0x -> 1.12x` punch-in zoom keyframes and reframing cuts every 3.5–5 seconds into the `TimelineDocument` AST (`V1`), defeating automated static-frame detection algorithms.
- **AI Commentary Hook Generator**: Google Gemini 2.5 Flash drafts a 5-second opening hook script tailored to the clip's dramatic climax.
- **In-Browser Voiceover Hook Recorder**: Built-in HTML5 `MediaRecorder` audio capture with a live teleprompter, automatically attaching creator commentary onto `Track A2 • Creator Voiceover`.
- **Platform-Agnostic Clean Master Export**: Strips foreign social container metadata (`-map_metadata -1`) and writes clean master headers (`title="Master Short"`, `artist="FrameFlow Studio"`).

### 4. 💳 Managed AI Credits & Commercial Paddle Billing
- **Zero API Setup Required**: Full managed server-side inference powered by Groq Whisper Turbo and Google Gemini 2.5 Flash — creators never touch API keys or configuration files.
- **Transparent Credit Model**:
  - **30 Free Trial Credits** granted automatically upon registration (no credit card required).
  - **Starter**: 300 credits/month ($29/mo or $23/mo billed annually) with 1080p exports and 1 brand template.
  - **Pro**: 1,000 credits/month ($59/mo or $47/mo billed annually) with 4K exports, DaVinci/Premiere XML timeline export, and unlimited brand templates.
  - **Business**: 3,500 credits/month ($149/mo or $119/mo billed annually) with dedicated worker lanes and priority rendering.
- **Atomic Credit Ledger**: Database-backed transactional accounting (`CreditTransaction` model) with automatic refund guarantees if worker tasks encounter unexpected failures.
- **Paddle Webhook Engine**: Seamless global tax compliance, merchant-of-record subscription lifecycle events (`subscription_created`, `subscription_updated`, `transaction_completed`), and HMAC-SHA256 signature verification.

---

## 🏗 System Architecture

```
                                  +--------------------------------------------------+
                                  |     Next.js 14 Commercial App Router Frontend    |
                                  |   (Warm Vellum #FAF9F5 & Cinema Coral #E84C2B)   |
                                  +------------------------+-------------------------+
                                                           |
                                        REST API / Ingest  |  WebSocket (/ws)
                                        Multipart Uploads  |  Real-Time Progress
                                                           v
                                  +--------------------------------------------------+
                                  |             Fastify API Gateway (Node.js)        |
                                  |  - Auth & JWT Session Verification               |
                                  |  - Project Ingestion & Credit Deduction Ledger   |
                                  |  - Paddle Webhook Ingestion (HMAC Verification)  |
                                  |  - Real-Time Redis Pub/Sub WebSocket Bridge      |
                                  +------------+-----------------------+-------------+
                                               |                       |
                             Enqueue Jobs via  |                       | Prisma ORM
                             BullMQ Queue      |                       | Database Queries
                                               v                       v
                                  +------------+----+     +------------+------------+
                                  |   Redis Cluster |     |    PostgreSQL Database  |
                                  |  - Job Queues   |     |  - Users & Subscriptions|
                                  |  - PubSub Bus   |     |  - Credit Ledger Engine |
                                  +------------+----+     |  - Projects & Timelines |
                                               |          +-------------------------+
                               Worker Consumes | Redis PubSub
                               Job Execution   | Progress Broadcast
                                               v
                                  +------------+------------------------------------+
                                  |     BullMQ Distributed AI & Render Worker Mesh  |
                                  |                                                 |
                                  |  [Stage 1: Ingest & Proxy Generation]          |
                                  |    - Resumable Chunk Assembly & ffprobe         |
                                  |    - 720p Faststart Video Proxy Generation      |
                                  |                                                 |
                                  |  [Stage 2: Hybrid Audio & AI Transcription]     |
                                  |    - FFmpeg 16kHz WAV Audio Extraction          |
                                  |    - +14dB Gaming Audio Peak Detection          |
                                  |    - Groq Whisper Turbo Word-Level Timestamps   |
                                  |                                                 |
                                  |  [Stage 3: Gemini Multimodal Hook Discovery]    |
                                  |    - Gemini 2.5 Flash Virality Sub-Scoring      |
                                  |    - Commentary Hook Script Generation          |
                                  |    - Dynamic Pacing Keyframes (1.0x -> 1.12x)   |
                                  |                                                 |
                                  |  [Stage 4: FFmpeg Multi-Track Export Engine]    |
                                  |    - TimelineDocument AST Filtergraph Compiler  |
                                  |    - 1080p/4K MP4 Render with Clean Metadata    |
                                  +--------------------+----------------------------+
                                                       |
                                                       | Streams proxy & final renders
                                                       v
                                          +------------+------------+
                                          |   MinIO / AWS S3 Storage|
                                          |  - raw-assets           |
                                          |  - proxies              |
                                          |  - renders              |
                                          +-------------------------+
```

---

## ⚙️ Core Engines

### 1. Ingest & Managed AI Processing Pipeline (`@frameflow/worker`)
When a creator pastes a video URL or uploads a master file:
1. **Credit Gate**: The Fastify API validates available credit balance (`Math.ceil(durationMinutes)`). If insufficient, it returns `402 Payment Required` with plan upgrade pathways; otherwise, credits are atomically deducted and logged to `CreditTransaction` (`reason: 'CLIP_GENERATION'`).
2. **Audio Extraction & Energy Peak Analysis**: The worker extracts a mono 16kHz WAV file. For gaming projects, an FFmpeg `astats` and RMS burst volume filter flags audio peaks $\ge$ 14dB above average baseline (gunfire, sirens, streamer screams).
3. **Groq Whisper Turbo Transcription**: Fast, accurate transcription with word-level timestamps (`start`, `end`, `confidence`).
4. **Gemini 2.5 Flash Hook Ranking**: Analyzes transcript flow and audio peaks to identify viral shorts, generating sub-scores for Hook, Flow, Engagement, and Clarity (0–99), social copy for TikTok/Reels/Shorts, and a 5-second `commentaryHookScript`.
5. **TimelineDocument Synthesis**: Slices footage into 3.5–5.0 second visual pacing intervals, keyframes reframing crops, applies subtitle presets, and constructs a serializable multi-track AST.

### 2. Monetization-Safe Transformation Engine
- **Algorithmic Flag Protection**: Video clips under commentary/reaction mode are injected with dynamic `1.0x -> 1.12x` scale punch-ins every 4 seconds.
- **Fair-Use Voiceover Slot**: Automatically provisions track `A2 • Creator Voiceover` and adds a `5s Creator Hook Window` marker at the beginning of the clip.
- **Clean Master Metadata**: Removes residual encoder markers (`-map_metadata -1`) and injects clean publishing headers.

### 3. Commercial Paddle Billing & Ledger System (`@frameflow/api`)
- **Subscription Management**: Full sync with Paddle customer IDs, subscription IDs, and price plans.
- **Webhook Processing**: Validates Paddle webhook payloads with HMAC-SHA256 signature verification over `/api/webhooks/paddle`.
- **Automatic Refunds**: If a clipping worker job or export render fails, the API atomically rolls back the deducted credits to the user's balance (`reason: 'REFUND'`).

---

## 🖥 Screens & Studio Flow

| Screen | Route | Visual System & Core Functionality |
|---|---|---|
| **Commercial Homepage** | `/` | Flagship Warm Vellum (`#FAF9F5`) showcase with interactive transcript cut demo, kinetic subtitle styler, dual-phone 9:16 player, feature bento, and direct links to pricing. |
| **Commercial Pricing Page** | `/pricing` | Dedicated commercial SaaS pricing with interactive Monthly vs. Annual toggle (Save 20%), 3-column tier comparison, simulated Paddle checkout trigger, and FAQ. |
| **Split Auth Screens** | `/login`, `/register` | Warm Vellum split auth layout featuring 30 free credit trial signup (no card required) and a Dark Cinema 9:16 animated preview showcase. |
| **Studio Dashboard** | `/dashboard` | Quick URL ingestion, **Content Mode** toggle (`Talking Head` vs `Gaming & GTA 6`), **Source Type** selector (`Original Footage` vs `Commentary / Reaction`), 1-click GTA 6 chips, and 1-click demo presets. |
| **Processing Monitor** | `/projects/[id]/processing` | Real-time 4-stage pipeline checklist with animated progress, time estimate, and credit usage badge. |
| **Viral Shorts Feed** | `/projects/[id]` | Grid of ranked viral clips with virality scores (0–99), **Monetization Readiness Badges** (`✓ Original Ready` vs `⚡ Add 5s Voiceover Hook`), aspect ratio switcher, and 1-click social copy. |
| **Dual-Mode Studio Editor** | `/editor/[clipId]` | Flagship studio: 4-zone workstation with word-level strikeout transcript cuts, **In-Browser Voiceover Hook Recorder**, 5-track non-destructive timeline, Dark Cinema monitor, and 1080p/4K/XML export drawer. |
| **Brand Kit & Presets** | `/brand-kit` | Visual brand styling for fonts, colors, and 5 subtitle presets: *Hormozi Bold Pop*, *Keyword Highlight*, *Karaoke Glow*, *Clean Cinema*, and *Vice Neon*. |
| **Exports Library** | `/exports` | Rendered 1080p / 4K MP4 library with direct download links, XML project file exports, and copyable social copy packs. |
| **Workspace Settings** | `/settings` | Managed credit ledger history, subscription tier details, Paddle billing portal management, and storage stats. |

---

## 📁 Repository Structure

```
frameflow/
├── client/                     # Next.js 14 App Router Frontend Studio
│   ├── src/app/
│   │   ├── page.tsx            # Commercial landing page
│   │   ├── pricing/            # Dedicated commercial pricing page
│   │   ├── (auth)/             # /login & /register split auth screens
│   │   ├── (dashboard)/        # /dashboard, /projects, /brand-kit, /exports, /settings
│   │   └── editor/[clipId]/    # Flagship Dual-Mode Studio Editor
│   ├── src/components/
│   │   ├── editor/             # VideoMonitor, TimelineDock, TranscriptPanel, ExportModal
│   │   ├── landing/            # Commercial landing components & bento grid
│   │   └── layout/             # SiteHeader, SiteFooter, WorkspaceSidebar
│   └── src/lib/                # Mock data, API client, types
├── server/
│   ├── api/                    # Fastify REST API & WebSocket Gateway
│   │   ├── src/modules/        # Auth, Projects, Billing (Paddle & Credits), Renders
│   │   └── src/gateway/        # WebSocket (/ws) Redis Pub/Sub gateway
│   ├── worker/                 # BullMQ AI & Render Worker Mesh
│   │   ├── src/processors/     # clip-generation.processor.ts, clip-export.processor.ts
│   │   └── src/index.ts        # Worker queue entrypoint
│   └── database/               # PostgreSQL & Prisma ORM
│       └── prisma/schema.prisma# Schema: Users, Subscriptions, Credits, Projects, Clips
├── shared/                     # Isomorphic Shared Library (Strict Zero Any)
│   ├── src/schemas/            # Zod schemas: billing, projects, clips, brand-kit
│   ├── src/timeline/           # TimelineDocument AST definitions & validation
│   ├── src/commands/           # Command Pattern implementations (undo/redo)
│   └── src/compiler/           # Timeline-to-FFmpeg filtergraph compiler
├── docker-compose.yml          # Infrastructure: PostgreSQL, Redis, MinIO
└── scripts/                    # End-to-end verification and pipeline test suites
```

---

## 📜 Serializable Timeline AST

Every short clip in FrameFlow is backed by a deterministic, version-controlled JSON AST conforming to `TimelineDocument`:

```json
{
  "id": "tl-clip-01",
  "projectId": "gta6-demo",
  "clipId": "gta6-clip-01",
  "version": 1,
  "fps": 30.0,
  "duration": 36.5,
  "aspectRatio": "9:16",
  "reframeConfig": {
    "mode": "gameplay_cam",
    "cropX": 0.5,
    "cropY": 0.5,
    "scale": 1.0,
    "speakerTracking": false
  },
  "tracks": [
    {
      "id": "track-v1",
      "type": "VIDEO",
      "name": "V1 • Gameplay Master",
      "locked": false,
      "muted": false,
      "clips": [
        {
          "id": "vclip-1",
          "assetId": "asset-raw-gameplay",
          "start": 0.0,
          "duration": 4.0,
          "inPoint": 12.0,
          "outPoint": 16.0,
          "speed": 1.0,
          "reframe": { "mode": "gameplay_cam", "scale": 1.0, "cropX": 0.5, "cropY": 0.5 }
        },
        {
          "id": "vclip-2",
          "assetId": "asset-raw-gameplay",
          "start": 4.0,
          "duration": 4.0,
          "inPoint": 16.0,
          "outPoint": 20.0,
          "speed": 1.0,
          "reframe": { "mode": "gameplay_cam", "scale": 1.12, "cropX": 0.5, "cropY": 0.5 }
        }
      ]
    },
    {
      "id": "track-t1",
      "type": "TEXT",
      "name": "T1 • Vice Neon Captions",
      "locked": false,
      "muted": false,
      "clips": [
        {
          "id": "tclip-1",
          "start": 0.0,
          "duration": 36.5,
          "inPoint": 0.0,
          "outPoint": 36.5,
          "textConfig": {
            "preset": "vice_neon",
            "primaryColor": "#00F0FF",
            "highlightColor": "#FF007F",
            "position": "bottom"
          }
        }
      ]
    },
    {
      "id": "track-a2",
      "type": "AUDIO",
      "name": "A2 • Creator Voiceover",
      "locked": false,
      "muted": false,
      "clips": []
    }
  ],
  "markers": [
    { "id": "m1", "time": 0.0, "label": "Hook Impact", "color": "#10B981" },
    { "id": "m2", "time": 5.0, "label": "Creator Hook Window", "color": "#F59E0B" }
  ]
}
```

---

## ⚡ Quickstart in 5 Minutes

### System Prerequisites
- **Node.js**: v20.x or higher
- **Docker & Docker Compose**: For PostgreSQL, Redis, and MinIO
- **FFmpeg & ffprobe**: Installed in your system environment (`ffmpeg -version`)
- **API Keys**: Server-side `GROQ_API_KEY` (transcription) and `GEMINI_API_KEY` (hook discovery)

### 1. Clone the Repository
```bash
git clone https://github.com/yasirraeesit/frameflow.git
cd frameflow
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
*(Populate your `GROQ_API_KEY`, `GEMINI_API_KEY`, and optional `PADDLE_WEBHOOK_SECRET` in `.env`)*

### 3. Spin Up Infrastructure
```bash
docker compose up -d
```
Service endpoints:
- **PostgreSQL**: `localhost:5432`
- **Redis Engine**: `localhost:6379`
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadminpassword`)

### 4. Install Dependencies & Generate Prisma Client
```bash
npm install
npm --workspace=@frameflow/database run prisma:generate
npm --workspace=@frameflow/database run prisma:push
```

### 5. Launch the Full Development Stack
Start the API, BullMQ AI Worker, and Web Studio concurrently:

```bash
# Run all services concurrently
npm run dev

# Or launch independently:
npm --workspace=@frameflow/api run dev     # Fastify API (Port 4000)
npm --workspace=@frameflow/worker run dev  # BullMQ Worker Mesh
npm --workspace=@frameflow/web run dev     # Next.js Studio (Port 3000)
```

Navigate to [**http://localhost:3000**](http://localhost:3000) to open FrameFlow.

---

## 🔐 Environment Configuration

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with schema | `postgresql://postgres:postgrespassword@localhost:5432/frameflow?schema=public` |
| `REDIS_URL` | Redis instance for BullMQ and WebSocket Pub/Sub | `redis://localhost:6379` |
| `S3_ENDPOINT` | MinIO or AWS S3 endpoint URL | `http://localhost:9000` |
| `S3_REGION` | S3 region identifier | `us-east-1` |
| `S3_ACCESS_KEY` | MinIO / S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | MinIO / S3 secret access key | `minioadminpassword` |
| `S3_BUCKET_RAW` | S3 bucket name for uploaded source videos | `raw-assets` |
| `S3_BUCKET_PROXIES` | S3 bucket name for 720p faststart proxies | `proxies` |
| `S3_BUCKET_RENDERS` | S3 bucket name for final exported 1080p/4K MP4s | `renders` |
| `JWT_SECRET` | Secure key for signing Fastify user authentication tokens | `frameflow-super-secret-jwt-key-2026-production-grade` |
| `GROQ_API_KEY` | Server-side Groq key for Whisper Turbo transcription | `gsk_...` |
| `GEMINI_API_KEY` | Server-side Gemini key for hook analysis and scripts | `AIzaSy...` |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook signature secret for HMAC-SHA256 validation | `pdl_ntfset_...` |
| `PORT` | Fastify API HTTP listening port | `4000` |
| `WEB_URL` | Next.js frontend base URL for CORS and redirects | `http://localhost:3000` |

---

## 🧪 Comprehensive Verification & Testing

FrameFlow enforces strict type safety (zero `any`) across all 5 monorepo packages:

```bash
# Build and verify typecheck across all 5 workspaces
npm --workspace=@frameflow/shared run build
npm --workspace=@frameflow/database run build
npm --workspace=@frameflow/api run build
npm --workspace=@frameflow/worker run build
npm --workspace=@frameflow/web run build

# Run unit tests
npm --workspace=@frameflow/shared test
npm --workspace=@frameflow/api test
npm --workspace=@frameflow/worker test

# Execute the End-to-End Rendering Pipeline verification suite
npx tsx --env-file=.env scripts/test-phase3-e2e.ts
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>FrameFlow — Built with precision for the next generation of video creators.</sub>
</div>
