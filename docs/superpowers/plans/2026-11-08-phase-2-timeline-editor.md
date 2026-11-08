# Phase 2: Timeline Editor (No AI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, non-destructive, multi-track timeline video editor in Next.js with Zustand, full command-pattern undo/redo, timeline JSON serialization, proxy preview playback, and autosave with version history in PostgreSQL.

**Architecture:** A serializable `TimelineDocument` in `shared/` serves as the single source of truth. All user modifications (add, move, trim, split, delete, lock) are modeled as atomic command objects executing through a bidirectional history stack with unlimited undo/redo. The Fastify API persists timeline versions to PostgreSQL. The Next.js frontend renders a zoomable, snappable multi-track timeline UI synchronized frame-by-frame with a proxy video player.

**Tech Stack:** TypeScript strict mode, Zustand, HTML5 Canvas/DOM, Next.js App Router, Tailwind CSS, Fastify, Prisma, PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-11-08-frameflow-design.md`

## Global Constraints
- The timeline JSON document is the SINGLE source of truth.
- Command pattern for ALL state edits: every edit must implement `execute()` and `undo()`. No direct state mutation.
- Unlimited undo/redo history.
- Non-destructive trimming: clips remember original media source boundaries (`inPoint`, `outPoint`).
- Clips cannot be edited or moved on locked tracks.
- Proxy video files (720p H.264 generated in Phase 1) are used for fluid client preview playback.

## Review Focus
- Splitting a clip in the middle must accurately compute adjacent in/out points and timeline offsets without changing total media playback duration.
- Trimming left edge must adjust both `start` time and `inPoint` synchronously without altering source media sync.
- Snapping must calculate nearest clip boundaries within pixel threshold without causing jitter during drag operations.
- Undo/redo must restore exact clip positioning, track assignment, and selection state.
- Restoring an older timeline version from PostgreSQL must reset the timeline document cleanly and push a new snapshot.

---

### Task 1: Timeline Document Model & Validation Schemas (`shared/src/timeline/`)

**Files:**
- Create: `shared/src/timeline/types.ts`
- Create: `shared/src/timeline/schema.ts`
- Modify: `shared/src/index.ts`
- Test: `shared/src/timeline/timeline.test.ts`

**Interfaces:**
- Consumes: `zod`
- Produces: `TimelineDocument`, `Track`, `Clip`, `Transition`, `Marker` types and validation schemas.

- [ ] **Step 1: Write failing schema tests for TimelineDocument in `shared/src/timeline/timeline.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement timeline document types and Zod schemas**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit timeline document specification**

---

### Task 2: Command Pattern & Undo/Redo Engine (`shared/src/commands/`)

**Files:**
- Create: `shared/src/commands/command.interface.ts`
- Create: `shared/src/commands/clip.commands.ts` (AddClip, MoveClip, TrimClip, SplitClip, DeleteClip)
- Create: `shared/src/commands/track.commands.ts` (ToggleLock, ToggleMute)
- Create: `shared/src/commands/composite.command.ts`
- Create: `shared/src/commands/history.ts`
- Modify: `shared/src/index.ts`
- Test: `shared/src/commands/commands.test.ts`

**Interfaces:**
- Consumes: `TimelineDocument`
- Produces: `ICommand`, `CommandHistory`, `SplitClipCommand`, `TrimClipCommand`, `MoveClipCommand`, `DeleteClipCommand`, `CompositeCommand`.

- [ ] **Step 1: Write comprehensive failing tests for each command and undo/redo cycles in `commands.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement commands and `CommandHistory` with pure state transformations**
- [ ] **Step 4: Run test to verify all command tests pass**
- [ ] **Step 5: Commit command pattern engine**

---

### Task 3: Timeline Versioning & Autosave API (`server/api/`)

**Files:**
- Create: `server/api/src/modules/timeline/timeline.service.ts`
- Create: `server/api/src/modules/timeline/timeline.routes.ts`
- Modify: `server/api/src/server.ts`
- Test: `server/api/test/timeline.test.ts`

**Interfaces:**
- Consumes: Prisma client, Authenticated user decorator
- Produces:
  - `GET /api/projects/:projectId/timeline`
  - `PUT /api/projects/:projectId/timeline` (autosave current timeline)
  - `POST /api/projects/:projectId/timeline/versions` (create named version snapshot)
  - `GET /api/projects/:projectId/timeline/versions` (list version history)
  - `POST /api/projects/:projectId/timeline/versions/:version/restore` (revert to version)

- [ ] **Step 1: Write integration tests for timeline autosave, version snapshots, listing, and restore in `server/api/test/timeline.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement timeline service and Fastify routes**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit timeline API module**

---

### Task 4: Zustand Timeline Editor Store (`client/src/store/`)

**Files:**
- Create: `client/src/store/timeline.store.ts`
- Create: `client/src/store/snapping.ts`
- Test: `client/src/store/timeline.store.test.ts`

**Interfaces:**
- Consumes: `TimelineDocument`, `CommandHistory`, `ICommand`
- Produces: `useTimelineStore` hook managing timeline state, playhead position, playback, zoom level, snapping calculations, and command dispatch.

- [ ] **Step 1: Write tests for timeline store actions (setPlayhead, executeCommand, undo/redo, snapping logic)**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `timeline.store.ts` and `snapping.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Zustand timeline store**

---

### Task 5: Multi-Track Timeline UI Components (`client/src/components/timeline/`)

**Files:**
- Create: `client/src/components/timeline/TimelineRuler.tsx`
- Create: `client/src/components/timeline/Playhead.tsx`
- Create: `client/src/components/timeline/TrackHeader.tsx`
- Create: `client/src/components/timeline/ClipView.tsx`
- Create: `client/src/components/timeline/TrackLane.tsx`
- Create: `client/src/components/timeline/TimelineToolbar.tsx`
- Create: `client/src/components/timeline/TimelineEditor.tsx`

**Interfaces:**
- Consumes: `useTimelineStore`
- Produces: Interactive timeline UI supporting drag-to-move, edge trimming, playhead scrub, zoom scaling, clip splitting, track locking/muting, and keyboard shortcuts (`Space` for play/pause, `S` for split, `Delete` for remove, `Ctrl+Z` / `Ctrl+Y` for undo/redo).

- [ ] **Step 1: Implement `TimelineRuler` and draggable `Playhead`**
- [ ] **Step 2: Implement `ClipView` with edge trim handles and dragging**
- [ ] **Step 3: Implement `TrackLane` and `TrackHeader`**
- [ ] **Step 4: Implement `TimelineToolbar` with zoom slider, play/pause, split, undo/redo, and snapping toggle**
- [ ] **Step 5: Assemble `TimelineEditor` container with keyboard shortcuts**
- [ ] **Step 6: Commit multi-track timeline UI components**

---

### Task 6: Synchronized Proxy Video Preview Player (`client/src/components/preview/`)

**Files:**
- Create: `client/src/components/preview/PreviewPlayer.tsx`
- Create: `client/src/components/preview/TimecodeDisplay.tsx`

**Interfaces:**
- Consumes: `useTimelineStore`, proxy video URLs from assets
- Produces: HTML5 video player that renders active top-layer video clip at the current playhead time, synchronized frame-by-frame with timeline playback and scrub.

- [ ] **Step 1: Implement `TimecodeDisplay` (HH:MM:SS:FF formatting)**
- [ ] **Step 2: Implement `PreviewPlayer` with video element seeking and `requestAnimationFrame` playhead driver**
- [ ] **Step 3: Commit preview player component**

---

### Task 7: Version History & Autosave Integration (`client/src/components/timeline/`)

**Files:**
- Create: `client/src/components/timeline/VersionHistoryModal.tsx`
- Create: `client/src/app/editor/[id]/page.tsx`
- Modify: `client/src/app/projects/[id]/page.tsx` (connect "Open Timeline Editor" button)

**Interfaces:**
- Consumes: Timeline API endpoints, `useTimelineStore`
- Produces:
  - Debounced autosave mechanism (saves to API after 2 seconds of inactivity)
  - Dedicated full-screen `/editor/[id]` studio route combining Media Bin, Preview Player, and Multi-track Timeline.
  - Version history modal showing snapshot list and "Restore" button.

- [ ] **Step 1: Implement `VersionHistoryModal` with version list and restore action**
- [ ] **Step 2: Build the complete editor studio page at `client/src/app/editor/[id]/page.tsx`**
- [ ] **Step 3: Link project workspace to timeline editor**
- [ ] **Step 4: Verify Next.js build succeeds with no type errors**
- [ ] **Step 5: Commit Editor Studio page and version history**

---

### Task 8: Phase 2 End-to-End Verification

**Files:**
- Create: `scripts/test-phase2-e2e.ts`

**Interfaces:**
- Consumes: Full stack (Fastify API, PostgreSQL, Shared command engine)
- Produces: Automated verification of:
  - Initial timeline loading
  - Adding media clips to timeline
  - Trimming clip and verifying non-destructive in/out offsets
  - Splitting clip at playhead into two sub-clips
  - Multiple undo/redo operations verifying state restoration
  - Autosaving timeline and creating version snapshots
  - Restoring an earlier snapshot and confirming state match

- [ ] **Step 1: Write E2E test script `scripts/test-phase2-e2e.ts`**
- [ ] **Step 2: Run E2E test script and verify all assertions pass**
- [ ] **Step 3: Tag/commit Phase 2 milestone**
