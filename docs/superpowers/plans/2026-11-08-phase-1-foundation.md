# Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational infrastructure for FrameFlow, including a TypeScript monorepo, Docker Compose dev environment (PostgreSQL, Redis, MinIO), Auth & Projects CRUD, chunked video upload, BullMQ media workers (ffprobe metadata extraction, 720p proxy generation, thumbnail strip creation), and real-time WebSocket job progress reporting.

**Architecture:** A Fastify REST & WebSocket API handles authentication, project management, and chunked uploads to MinIO. Work is enqueued to BullMQ on Redis. A decoupled media worker service runs ffprobe and FFmpeg to extract stream metadata, transcode 720p proxies, and create thumbnail sprite strips. Progress is published over Redis Pub/Sub and relayed to the browser via Fastify WebSockets. A Next.js frontend provides the UI for auth, projects, and live-monitored uploads.

**Tech Stack:** TypeScript strict mode, Node.js 24, Fastify, Prisma (PostgreSQL), Redis 7, BullMQ, MinIO S3 SDK, FFmpeg 9 / ffprobe, Next.js 14/15, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-08-frameflow-design.md`

## Global Constraints
- TypeScript strict mode enabled across all apps and packages (`noImplicitAny: true`, `strictNullChecks: true`, zero `any`).
- FFmpeg and ffprobe must NEVER run in the API server process; workers handle all media execution.
- Fastify is the backend framework; Next.js App Router is the frontend framework.
- Storage must be MinIO S3-compatible with pre-configured buckets: `raw-assets`, `proxies`, `thumbnails`, `renders`.
- Real-time job updates must transition through `queued` -> `processing` (with progress %) -> `done` or `failed`.

## Review Focus
- Incomplete/interrupted chunked uploads should not corrupt storage or leave orphaned DB records without failure status.
- Invalid or non-video file uploads must fail fast during validation or ffprobe extraction without crashing the worker.
- Worker process crashes or errors must catch exceptions, update asset status to `FAILED`, and publish a `failed` event over WebSockets with a human-readable error.
- Authentication tokens (JWT) must protect project and asset endpoints, preventing unauthorized tenant data access.
- WebSocket subscriptions must only broadcast progress for assets belonging to authorized project listeners.

---

### Task 1: Monorepo & Docker Infrastructure Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env`
- Create: `.gitignore`

**Interfaces:**
- Consumes: None
- Produces: Monorepo workspaces (`apps/*`, `packages/*`) and operational local services (Postgres on 5432, Redis on 6379, MinIO on 9000/9001).

- [ ] **Step 1: Write `package.json` with npm workspaces and build scripts**
- [ ] **Step 2: Write root `tsconfig.base.json` with strict mode enabled**
- [ ] **Step 3: Write `docker-compose.yml` defining PostgreSQL 16, Redis 7, MinIO and MinIO bucket provisioner**
- [ ] **Step 4: Write `.env.example` and `.env` with connection URLs**
- [ ] **Step 5: Run `docker compose up -d` and verify all containers are healthy**
- [ ] **Step 6: Commit monorepo and docker infrastructure**

---

### Task 2: Shared Package (`/packages/shared`)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/schemas/auth.schema.ts`
- Create: `packages/shared/src/schemas/project.schema.ts`
- Create: `packages/shared/src/schemas/asset.schema.ts`
- Create: `packages/shared/src/events/job.events.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/src/schemas/schemas.test.ts`

**Interfaces:**
- Consumes: `zod`
- Produces: Exported TypeScript interfaces and Zod schemas: `RegisterInput`, `LoginInput`, `CreateProjectInput`, `AssetMetadata`, `JobProgressEvent`, `JobStatus`.

- [ ] **Step 1: Write failing schema tests in `schemas.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Zod schemas and TypeScript types in `packages/shared/src/`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Build `packages/shared` and commit**

---

### Task 3: Database & Prisma Setup

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/src/index.ts`
- Test: `packages/database/src/client.test.ts`

**Interfaces:**
- Consumes: PostgreSQL connection string from `.env`
- Produces: Prisma Client with `User`, `Project`, `Asset`, `Timeline`, `TimelineVersion`, `SceneAnalysis`, `RenderJob` models.

- [ ] **Step 1: Write Prisma schema with all models defined in the specification**
- [ ] **Step 2: Write test connecting to database and verifying model creation**
- [ ] **Step 3: Run `npx prisma db push` or `prisma migrate dev` against Docker Postgres**
- [ ] **Step 4: Run test to verify Prisma client queries succeed**
- [ ] **Step 5: Commit database package and schema**

---

### Task 4: API Foundation & Authentication Module

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/plugins/prisma.ts`
- Create: `apps/api/src/plugins/jwt.ts`
- Create: `apps/api/src/plugins/redis.ts`
- Create: `apps/api/src/plugins/s3.ts`
- Create: `apps/api/src/modules/auth/auth.routes.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Test: `apps/api/test/auth.test.ts`

**Interfaces:**
- Consumes: `@frameflow/shared`, `@frameflow/database`
- Produces: Fastify server on port 4000, `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, JWT verification decorator `authenticate`.

- [ ] **Step 1: Write integration tests for user registration, duplicate email rejection, login, and `/api/auth/me` token inspection**
- [ ] **Step 2: Run test to verify it fails (server not running/routes missing)**
- [ ] **Step 3: Implement Fastify plugins and Auth routes with argon2/bcrypt password hashing and JWT signing**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Auth module**

---

### Task 5: Projects CRUD API

**Files:**
- Create: `apps/api/src/modules/projects/projects.routes.ts`
- Create: `apps/api/src/modules/projects/projects.service.ts`
- Test: `apps/api/test/projects.test.ts`

**Interfaces:**
- Consumes: Authenticated user decorator, Prisma client
- Produces: `POST /api/projects`, `GET /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id` (initializing default empty timeline JSON on project creation).

- [ ] **Step 1: Write tests for project creation, listing, retrieval, update, and cascading delete**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Projects routes and service (automatically provisions initial Timeline record)**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Projects module**

---

### Task 6: Chunked Asset Upload API & MinIO Storage

**Files:**
- Create: `apps/api/src/modules/assets/assets.routes.ts`
- Create: `apps/api/src/modules/assets/assets.service.ts`
- Create: `apps/api/src/queues/media.queue.ts`
- Test: `apps/api/test/assets.test.ts`

**Interfaces:**
- Consumes: MinIO S3 client (`@aws-sdk/client-s3`), BullMQ `Queue`
- Produces:
  - `POST /api/projects/:projectId/assets/upload/init` (returns uploadId, chunk size)
  - `PUT /api/projects/:projectId/assets/upload/chunk` (accepts chunk buffer & partNumber)
  - `POST /api/projects/:projectId/assets/upload/complete` (assembles parts in MinIO, creates `Asset` in DB with status `QUEUED`, enqueues BullMQ job)
  - `GET /api/projects/:projectId/assets` (lists project assets)

- [ ] **Step 1: Write tests for upload initialization, chunk upload, assembly completion, and queue dispatch**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement MinIO multipart upload and BullMQ job dispatching in `assets.service.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Asset Upload module**

---

### Task 7: BullMQ Worker & Media Processing Pipeline

**Files:**
- Create: `apps/worker/package.json`
- Create: `apps/worker/tsconfig.json`
- Create: `apps/worker/src/index.ts`
- Create: `apps/worker/src/config.ts`
- Create: `apps/worker/src/processors/media.processor.ts`
- Create: `apps/worker/src/ffmpeg/ffprobe.ts`
- Create: `apps/worker/src/ffmpeg/proxy.ts`
- Create: `apps/worker/src/ffmpeg/thumbnail.ts`
- Test: `apps/worker/test/media.processor.test.ts`

**Interfaces:**
- Consumes: BullMQ `media-processing` queue, MinIO S3 client, Redis connection, FFmpeg & ffprobe binaries
- Produces:
  - `ffprobe`: extracts duration, width, height, fps, videoCodec, audioCodec, updates Asset DB record
  - `proxy`: generates 720p H.264 mp4 (`-vf scale=-2:720`, `-movflags +faststart`), uploads to MinIO `proxies` bucket
  - `thumbnail`: generates thumbnail sprite strip or keyframe previews, uploads to MinIO `thumbnails` bucket
  - Publishes progress updates (0% -> 25% -> 75% -> 100%) to Redis pub/sub channel `events:project:{projectId}` and updates Asset status to `READY`.

- [ ] **Step 1: Write integration test using a sample MP4 fixture verifying metadata extraction, proxy output, and thumbnail output**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `ffprobe.ts`, `proxy.ts`, `thumbnail.ts`, and `media.processor.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Worker package and processors**

---

### Task 8: WebSocket Real-Time Job Progress Gateway

**Files:**
- Create: `apps/api/src/ws/ws.gateway.ts`
- Modify: `apps/api/src/server.ts`
- Test: `apps/api/test/ws.test.ts`

**Interfaces:**
- Consumes: `@fastify/websocket`, Redis subscriber listening on `events:project:*`
- Produces: WebSocket server on `/ws?token=<jwt>`, channel subscriptions (`subscribe:project:<id>`), real-time `JobProgressEvent` delivery to connected clients.

- [ ] **Step 1: Write test establishing WebSocket connection, subscribing to project events, and receiving simulated progress event**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Redis-to-WebSocket fanout in `ws.gateway.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit WebSocket gateway**

---

### Task 9: Web Client Foundation (Next.js)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/(auth)/login/page.tsx`
- Create: `apps/web/src/app/(auth)/register/page.tsx`
- Create: `apps/web/src/app/projects/page.tsx`
- Create: `apps/web/src/app/projects/[id]/page.tsx`
- Create: `apps/web/src/components/media/ChunkedUploader.tsx`
- Create: `apps/web/src/components/media/AssetList.tsx`
- Create: `apps/web/src/hooks/useProjectWebSocket.ts`

**Interfaces:**
- Consumes: Fastify REST API (`http://localhost:4000`), WebSocket (`ws://localhost:4000/ws`)
- Produces: Working Next.js App Router UI for Authentication, Project management, Chunked video drag-and-drop with slice-by-slice upload progress bar, and real-time transcode status indicators (queued, processing %, ready, failed).

- [ ] **Step 1: Initialize Next.js project with Tailwind CSS and TypeScript strict mode**
- [ ] **Step 2: Implement Auth state management (JWT in memory / localStorage) and Login/Register pages**
- [ ] **Step 3: Implement Projects dashboard (create, list, open project)**
- [ ] **Step 4: Implement `ChunkedUploader` component with chunk slicing (5MB parts) and progress bar**
- [ ] **Step 5: Implement `useProjectWebSocket` hook and `AssetList` with live status badges**
- [ ] **Step 6: Verify client builds (`npm run build`) cleanly with no type errors**
- [ ] **Step 7: Commit Web application**

---

### Task 10: Phase 1 End-to-End Verification

**Files:**
- Create: `scripts/test-phase1-e2e.ts`

**Interfaces:**
- Consumes: Running Docker stack, API, Worker, Web client
- Produces: Synthetic video file generation, full upload via chunking API, worker processing verification (ffprobe metadata + 720p proxy + thumbnail strip in MinIO), WebSocket event assertion.

- [ ] **Step 1: Write E2E test script `scripts/test-phase1-e2e.ts` that creates a test user, project, uploads a test video via chunks, listens to WebSocket events, and verifies DB and MinIO outputs**
- [ ] **Step 2: Execute E2E test script and verify all assertions pass**
- [ ] **Step 3: Verify the UI in browser at `http://localhost:3000`**
- [ ] **Step 4: Tag/commit Phase 1 milestone**

