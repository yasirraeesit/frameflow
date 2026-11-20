# SDD ledger — plan: docs/superpowers/plans/2026-11-21-ai-long-to-short-pivot.md

Pre-flight: verified shared interfaces and invariant boundaries:
- Database: Project -> GeneratedClip (1:N), Project -> BrandKit (1:1), RenderJob -> GeneratedClip (optional 1:1)
- Shared AST: TimelineDocument extended with aspectRatio, reframeConfig, captionConfig, brandKit
- Worker: BullMQ clip-generation queue, FFmpeg 9:16 filter_complex
- API: /api/projects/:id/clips, /api/clips/:clipId, /api/projects/:id/brand-kit
- Web: /projects, /projects/:id/clips, /editor/:clipId
