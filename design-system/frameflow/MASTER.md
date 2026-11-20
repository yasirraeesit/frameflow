# FrameFlow Studio Master Design System
*Architecture: Next.js 14 + Tailwind CSS + Zustand • Profile: Professional Dark-Mode NLE*

---

## 1. System Philosophy & Aesthetic Directives

FrameFlow is engineered for frame-accurate, high-density non-linear editing. The interface removes visual noise to center attention on footage, timecode alignment, and audio waveforms.

### Invariants:
1. **Zero Muddy Grays:** Every surface belongs to a strict 4-tier obsidian/zinc ramp anchored by absolute black and cold zinc undertones.
2. **Sharp 1px Structural Dividers:** Floating cards with thick margins and heavy drop shadows are banished. Panels interface cleanly via `1px solid #27272A` hairline dividers.
3. **Single Studio Accent:** A single Electric Indigo accent (`#6366F1`) commands all active visual states (Playhead, active clip selection ring, play button, primary export CTA). Everything else remains disciplined and neutral.
4. **Tabular Monospace Timing:** All timecodes, durations, FPS counters, and tick labels enforce `font-mono tabular-nums tracking-wider` to eliminate layout shift during scrubbing.
5. **Distinct Semantic Track Signatures:**
   - **VIDEO:** Deep Steel Blue (`#1E3A5F` fill / `#3B82F6` border)
   - **AUDIO:** Deep Emerald/Teal (`#134E4A` fill / `#14B8A6` border)
   - **TEXT:** Deep Plum/Violet (`#4C1D95` fill / `#A855F7` border)

---

## 2. 4-Tier Surface Hierarchy

| Tier | Token | Hex Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Tier 0** | `--studio-canvas` | `#09090B` | Root app shell, base workspace, modal backdrops |
| **Tier 1** | `--studio-panel` | `#111114` | Media Bin, Timeline track area, Inspector panels |
| **Tier 2** | `--studio-surface` | `#18181C` | Headers, toolbars, transport bar, clip card base, input fields |
| **Tier 3** | `--studio-surface-hover` | `#222228` | Hover states, active segmented buttons, selected rows |
| **Border** | `--studio-border` | `#27272A` | Structural 1px hairline dividers across all panes |
| **Border Active** | `--studio-border-hover` | `#3F3F46` | Focused elements, hovered clip edges |

---

## 3. Accent & Track Tokens

### Studio Accent (Electric Indigo)
```css
--studio-accent:          #6366F1; /* Primary CTA, Playhead, Active Ring */
--studio-accent-hover:    #4F46E5;
--studio-accent-subtle:   rgba(99, 102, 241, 0.15);
--studio-accent-glow:     rgba(99, 102, 241, 0.35);
```

### Semantic Track Tokens
```css
/* VIDEO TRACKS */
--track-video-bg:         #1E3A5F; /* Deep Steel Blue fill */
--track-video-border:     #3B82F6; /* Bright structural edge */
--track-video-hover:      #60A5FA;
--track-video-selected:   #93C5FD;

/* AUDIO TRACKS */
--track-audio-bg:         #134E4A; /* Deep Teal fill */
--track-audio-border:     #14B8A6; /* Bright structural edge */
--track-audio-hover:      #2DD4BF;
--track-audio-selected:   #5EEAD4;

/* TEXT / TITLE TRACKS */
--track-text-bg:          #4C1D95; /* Deep Plum/Violet fill */
--track-text-border:      #A855F7; /* Bright structural edge */
--track-text-hover:       #C084FC;
--track-text-selected:    #E9D5FF;
```

---

## 4. Typography Scale

| Token | Size | Leading | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-display` | `14px` | `18px` | `600` | Project titles, modal headers |
| `text-ui` | `12px` | `16px` | `500` | Button labels, track names, tabs, tooltips |
| `text-meta` | `11px` | `14px` | `400` | Resolution chips, codecs, secondary status |
| `text-mono` | `11px–12px` | `none` | `600` | Timecodes (`00:01:24:15`), durations (`tabular-nums`) |
| `text-badge` | `9px` | `10px` | `700` | Keyboard caps (`S`, `Space`, `Del`, `Ctrl+Z`) |

---

## 5. Timeline & Spatial Dimensions

- **Track Height:** Fixed `56px` (`h-14`) per lane.
- **Track Header Width:** Fixed `208px` (`w-52`) with right border separator `#27272A`.
- **Ruler Height:** Fixed `28px` (`h-7`) with `1px` tick dividers and monospace labels.
- **Timeline Toolbar:** Fixed `44px` (`h-11`) with segmented button groups.
- **Clip Trim Grab Handles:** `10px` hit area on start/end edges with vertical hairline indicator.
- **Playhead Needle:** `1.5px` vertical hairline (`#6366F1`) with zero horizontal playhead jitter.

---

## 6. Prohibited Anti-Patterns

- ❌ **No heavy drop shadows:** Avoid `shadow-xl`, `shadow-2xl` over timeline or canvas.
- ❌ **No glassmorphism / `backdrop-blur`:** Destroys 60fps scrubbing and adds muddy tinting.
- ❌ **No proportional numbers for time:** Never use proportional fonts for timecodes or counters.
- ❌ **No floating cards with thick margins:** Use edge-to-edge docking panels separated by 1px borders.
