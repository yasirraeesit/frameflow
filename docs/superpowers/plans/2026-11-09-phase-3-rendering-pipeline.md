# Phase 3 Implementation Plan: Rendering Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, asynchronous rendering pipeline that compiles a `TimelineDocument` into an FFmpeg `filter_complex` graph, executes render jobs through BullMQ with real-time WebSocket progress, handles retries, cancellations, and failure paths, and allows users to export preset videos (1080p/720p) directly from the editor.

**Architecture:** 
- **Timeline Compiler (`shared/src/compiler/`)**: Pure function that converts `TimelineDocument` + asset path mappings into deterministic FFmpeg inputs, `-filter_complex` filtergraph chains (video trimming, scaling, black base canvas, overlay positioning, text rendering, audio trimming, delay, mixing), and encoding preset arguments.
- **Render Worker (`server/worker/src/processors/render.processor.ts`)**: Decoupled BullMQ worker running on `render-jobs` queue. Downloads required source media from MinIO `raw-assets` bucket into an isolated workspace temp directory, executes FFmpeg child process, parses progress percentages from stderr stream, publishes real-time WebSocket events, uploads final exported MP4 to MinIO `renders` bucket, and cleans up temporary files.
- **REST & WebSocket API (`server/api/src/modules/renders/`)**: Fastify routes to trigger render jobs, list project render history, check status, cancel in-flight jobs, and stream live progress.
- **Frontend Export Studio (`client/src/components/export/`)**: Modal in editor studio with preset selection (1080p / 720p), live progress bar, cancel option, and video download link.

**Tech Stack:** Node.js, TypeScript strict mode, Fastify, Prisma (PostgreSQL), BullMQ (Redis), FFmpeg / ffprobe native CLI, MinIO S3, Next.js 14, Zustand.

## Global Constraints
- TypeScript strict mode enabled (`noImplicitAny`, zero `any`).
- Never run FFmpeg in the Fastify API or Next.js processes; all rendering occurs strictly within `server/worker`.
- FFmpeg output must be idempotent, faststarted (`-movflags +faststart`), and encoded in standard MP4 H.264/AAC.
- Failure paths must handle missing/corrupt media, out-of-disk/worker termination, and report clear error messages.
- Unit test coverage for timeline compiler and integration tests for render endpoints and worker job execution.

## Review Focus
1. Empty timeline or timeline with gaps: Canvas must render continuous black video and silence without FFmpeg filtergraph crash.
2. Multiple overlapping or stacked clips on different video tracks: Topmost video track overlays cleanly over lower tracks at precise timestamps.
3. Audio/Video synchronization: Video trimming (`inPoint`, `outPoint`) and audio trimming (`adelay`, `atrim`) stay frame-synchronized without drift.
4. Worker crash / Mid-render cancellation: SIGKILL/SIGTERM delivered cleanly to FFmpeg child process without orphaned zombie processes or locking the queue.
5. Large asset downloads: Sandboxed local storage path cleaned up in `finally` block even if render fails or is cancelled.

---

### Task 1: Timeline-to-FFmpeg Filtergraph Compiler (`shared/src/compiler/`)

**Files:**
- Create: `shared/src/compiler/types.ts`
- Create: `shared/src/compiler/ffmpeg-compiler.ts`
- Modify: `shared/src/index.ts`
- Test: `shared/src/compiler/compiler.test.ts`

**Interfaces:**
- Consumes: `TimelineDocument`, `Clip`, `Track`, `ExportPreset` ('1080p_h264' | '720p_h264')
- Produces:
  ```typescript
  export interface CompilerOutput {
    inputs: string[]; // List of input file paths
    filterComplex: string; // The complete -filter_complex string
    outputOptions: string[]; // Codec, bitrate, preset, and movflags
  }
  export function compileTimelineToFFmpeg(
    timeline: TimelineDocument,
    assetPathMap: Record<string, string>, // assetId -> local filepath
    preset: '1080p_h264' | '720p_h264'
  ): CompilerOutput;
  ```

- [ ] **Step 1: Write unit tests in `compiler.test.ts`**
  - Test compiling empty timeline (produces black canvas of timeline duration)
  - Test compiling single video clip with in/out trim and scale
  - Test compiling multi-track video overlay with offset start time
  - Test compiling audio track with `atrim` and `adelay`
  - Test compiling text overlays with `drawtext`
  - Test preset configurations (1080p vs 720p)
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `types.ts` and `ffmpeg-compiler.ts`**
- [ ] **Step 4: Run test to verify all compiler tests pass**
- [ ] **Step 5: Commit timeline compiler**

---

### Task 2: Render Job Schemas & Database Operations (`shared/` & `server/database/`)

**Files:**
- Create: `shared/src/schemas/render.schema.ts`
- Modify: `shared/src/index.ts`
- Modify: `shared/src/events/job.events.ts` (add `RENDER_PROGRESS` event type)

**Interfaces:**
- Consumes: Prisma `RenderJob` model
- Produces: `CreateRenderInputSchema`, `RenderJobResponseSchema`, `RenderProgressEvent`

- [ ] **Step 1: Define Zod schemas for render creation, status query, and events**
- [ ] **Step 2: Export from `@frameflow/shared`**
- [ ] **Step 3: Run shared tests and build**
- [ ] **Step 4: Commit render schemas**

---

### Task 3: Render Worker Process with FFmpeg Stderr Progress & Failure Recovery (`server/worker/`)

**Files:**
- Create: `server/worker/src/processors/render.processor.ts`
- Modify: `server/worker/src/index.ts` (register `render-jobs` worker)
- Test: `server/worker/test/render.processor.test.ts`

**Interfaces:**
- Consumes: `render-jobs` BullMQ queue, MinIO S3 client, `compileTimelineToFFmpeg`
- Produces: Executed MP4 saved in MinIO `renders` bucket, real-time progress published to Redis PubSub, graceful error handling for missing/corrupt media.

- [ ] **Step 1: Write integration test for render processor mocking or running short synthetic test clip**
- [ ] **Step 2: Implement `render.processor.ts` with:**
  - Asset downloading from MinIO `raw-assets`
  - Child process execution with `spawn('ffmpeg', args)`
  - Regex parser for `time=(\d+):(\d+):(\d+.\d+)` on stderr to compute 0-100% progress
  - Redis PubSub progress publisher
  - Uploading completed file to MinIO `renders` bucket
  - Clean `try...finally` disk temp folder cleanup
  - Process abort / kill listener on cancellation
- [ ] **Step 3: Run tests to verify render processor passes**
- [ ] **Step 4: Commit render worker processor**

---

### Task 4: Fastify Render API Endpoints (`server/api/src/modules/renders/`)

**Files:**
- Create: `server/api/src/modules/renders/renders.service.ts`
- Create: `server/api/src/modules/renders/renders.routes.ts`
- Modify: `server/api/src/server.ts`
- Test: `server/api/test/renders.test.ts`

**Interfaces:**
- Consumes: Fastify instance, Prisma client, BullMQ `render-jobs` queue
- Produces:
  - `POST /api/projects/:projectId/renders` (dispatch render job)
  - `GET /api/projects/:projectId/renders` (list project render jobs)
  - `GET /api/projects/:projectId/renders/:renderJobId` (get status and download URL)
  - `POST /api/projects/:projectId/renders/:renderJobId/cancel` (cancel job)

- [ ] **Step 1: Write integration tests in `server/api/test/renders.test.ts`**
- [ ] **Step 2: Implement `renders.service.ts` and `renders.routes.ts`**
- [ ] **Step 3: Register in `server.ts` under `/api/projects`**
- [ ] **Step 4: Run tests and verify 100% pass rate**
- [ ] **Step 5: Commit render API endpoints**

---

### Task 5: Client Export Modal & Download Integration (`client/src/components/export/`)

**Files:**
- Create: `client/src/components/export/ExportModal.tsx`
- Modify: `client/src/app/editor/[id]/page.tsx` (add "Export Video" button and modal trigger)
- Modify: `client/src/hooks/useProjectWebSocket.ts` (support render progress event handling)

**Interfaces:**
- Consumes: Render API endpoints, WebSocket connection
- Produces: Interactive Export dialog with preset selection (1080p / 720p), live progress animation, Cancel button, and direct MP4 download link upon completion.

- [ ] **Step 1: Implement `ExportModal.tsx` with preset choice, active render status, and progress indicator**
- [ ] **Step 2: Connect Export button in Editor Studio header**
- [ ] **Step 3: Verify client build succeeds with `npm --workspace=@frameflow/web run build`**
- [ ] **Step 4: Commit client export components**

---

### Task 6: Phase 3 End-to-End Verification

**Files:**
- Create: `scripts/test-phase3-e2e.ts`

**Interfaces:**
- Consumes: Full stack (Fastify API, Worker, Redis, MinIO, PostgreSQL, FFmpeg)
- Produces: Automated verification script that:
  - Creates project and uploads test video asset
  - Builds a multi-clip timeline document
  - Triggers asynchronous 720p and 1080p render jobs
  - Listens on WebSocket for real-time `RENDER_PROGRESS` (0% to 100%)
  - Verifies completed MP4 exists in MinIO `renders` bucket
  - Runs `ffprobe` on rendered output to verify duration, resolution, codec (h264/aac), and validity
  - Tests cancellation and error recovery on corrupt input

- [ ] **Step 1: Write E2E test script `scripts/test-phase3-e2e.ts`**
- [ ] **Step 2: Run E2E test script and confirm all assertions pass**
- [ ] **Step 3: Tag `phase-3-complete`**
