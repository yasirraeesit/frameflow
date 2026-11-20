---
name: frameflow-architecture
description: Core architectural invariants, TimelineDocument AST rules, Command Pattern constraints, and FFmpeg worker contracts for FrameFlow
---

# FrameFlow System Architecture & Architectural Invariants

This skill defines the core non-negotiable architectural rules, data structures, and execution boundaries of the **FrameFlow** video creation platform.

## 1. Strict TypeScript (Zero `any`)
- All code across `client/`, `server/` (`api`, `worker`, `database`), and `packages/shared/` must compile in TypeScript strict mode.
- Explicit types, Zod schemas, and discriminated unions are mandatory. The `any` keyword is strictly prohibited.

## 2. Non-Destructive Command Pattern
- **Single Source of Truth:** The timeline state is serialized as an immutable `TimelineDocument` JSON structure.
- **No Direct Mutation:** Neither UI components, event listeners, nor AI handlers may mutate `TimelineDocument` directly.
- **Atomic Command Hierarchy:** All modifications must be instantiated and executed as atomic command objects:
  - `AddClipCommand`
  - `MoveClipCommand`
  - `TrimClipCommand`
  - `SplitClipCommand`
  - `DeleteClipCommand`
- **Composite Batches:** Multi-action edits (such as an automated AI rough cut, ripple deletions, or multi-clip realignment) must be wrapped inside a `CompositeCommand` to ensure single-step Undo/Redo (`Ctrl+Z` / `Ctrl+Y`).

## 3. Track Locking Invariant
- Every track in `TimelineDocument.tracks` contains a `locked: boolean` property.
- When `track.locked === true`:
  - No clips on this track can be moved, trimmed, sliced, or deleted.
  - No new clips can be placed onto this track.
  - Automated timeline generators, AI assistants, and batch scripts must skip locked tracks and preserve their exact state without modification.

## 4. Isomorphic Shared Package Boundary
- `packages/shared/` (and `@frameflow/shared`) is imported by both the browser (`client/`) and Node.js environments (`server/api`, `server/worker`).
- It must contain **zero Node.js standard library imports** (`fs`, `path`, `child_process`, `os`, `stream`).
- All AST definitions, validation schemas, command implementations, and compiler pure functions in `shared` must remain 100% browser-safe.

## 5. Decoupled Media Worker Pipeline
- Heavy compute and media tasks—including `ffprobe` inspection, 720p proxy generation, thumbnail strip extraction, Whisper transcription, scene detection, and FFmpeg `filter_complex` export rendering—must **never** run within Fastify HTTP handlers or Next.js server actions.
- Processing is exclusively executed by background BullMQ workers in `server/worker/`.
- Progress updates ($0\% \to 100\%$) are emitted over Redis Pub/Sub channels and broadcast through the Fastify WebSocket gateway (`/ws`) to connected clients.
