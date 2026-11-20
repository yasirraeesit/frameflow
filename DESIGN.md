# FrameFlow Design System Specification (`DESIGN.md`)

## 1. Aesthetic Identity & Purpose
FrameFlow is a professional web-based non-linear video editor (NLE). The interface is modeled on the ergonomics of professional media software: high spatial density, crisp 1px borders, zero visual distraction, and exact frame-accurate alignment.

## 2. Color Palette & Hierarchy

### Surfaces (Obsidian / Zinc)
- **App Shell & Canvas (`--studio-canvas`):** `#09090B`
- **Panel Surface (`--studio-panel`):** `#111114`
- **Elevated Controls & Headers (`--studio-surface`):** `#18181C`
- **Hover & Sub-surfaces (`--studio-surface-hover`):** `#222228`
- **Structural Hairline Border (`--studio-border`):** `#27272A`
- **Active / Focused Border (`--studio-border-hover`):** `#3F3F46`

### Text & Neutral Contrast
- **Primary Text:** `#F4F4F5` (High contrast, clean legibility)
- **Muted Text:** `#A1A1AA` (Tool labels, track details)
- **Dim / Delimiter Text:** `#71717A` (Inactive icons, timecode dividers)

### Single Studio Accent
- **Primary Accent (`--studio-accent`):** `#6366F1` (Electric Indigo)
- **Accent Hover:** `#4F46E5`
- **Playhead Needle & Flag:** `#6366F1`
- **Selection Ring:** `ring-2 ring-indigo-500`

### Track Types
- **VIDEO Clips:**
  - Fill: `#1E3A5F`
  - Border: `#3B82F6`
  - Selected Ring: `#60A5FA`
- **AUDIO Clips:**
  - Fill: `#134E4A`
  - Border: `#14B8A6`
  - Selected Ring: `#2DD4BF`
- **TEXT Clips:**
  - Fill: `#4C1D95`
  - Border: `#A855F7`
  - Selected Ring: `#C084FC`

## 3. Typography Rules
- **UI & Labels:** Inter / Geist / System Sans (`12px–13px`, font-medium).
- **Timecode, Rulers, Durations:** JetBrains Mono / Geist Mono (`font-mono tabular-nums tracking-wider`).
- **Keycap Badges:** Monospace (`9px`, `bg-zinc-800 border border-zinc-700`).

## 4. Layout & Spacing
- Edge-to-edge docking layouts with `1px solid #27272A` dividers.
- Fixed timeline ruler (`28px`), track headers (`208px`), and track lanes (`56px`).
- No floating cards with heavy shadows or blurred backgrounds over the timeline.
