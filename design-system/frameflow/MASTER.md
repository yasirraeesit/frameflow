# Design System Master File — FrameFlow

> **LOGIC:** This Master file documents FrameFlow's **Warm Carbon & Cinema Amber** visual design system.
> Built for a real, high-craft creator tool—never an AI template.

---

**Project:** FrameFlow (AI-Assisted Video Repurposing Studio & Multi-Track Editor)  
**Theme:** Warm Carbon & Cinema Amber  
**Philosophy:** Concrete, functional video editing tool aesthetics. High contrast, precise layout, zero AI buzzwords.

---

## Global Color Palette

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Canvas Base** | `#0C0C0E` | `--shell-bg` | Full app backdrop, theater viewport frame |
| **Card / Panel Surface** | `#141417` | `--card-bg` / `--sidebar-bg` | Workstation panels, cards, navigation rails |
| **Elevated Surface / Hover** | `#1E1E23` | `--elevated-bg` | Inputs, dropdown menus, button hovers |
| **Hover Accent Surface** | `#26262D` | `--elevated-hover` | Active hover states on elevated items |
| **Structural Hairline Border** | `#28282F` | `--border-color` | 1px hairline rules, component dividers |
| **Subtle Border** | `#202026` | `--border-subtle` | Inset borders, nested track lanes |
| **Border Hover** | `#3E3E47` | `--border-hover` | Card and button hover borders |
| **Primary Brand Accent & Playhead** | `#F59E0B` | `--accent-primary` | Cinema Amber, active scrubber, primary CTA |
| **Primary Accent Hover** | `#D97706` | `--accent-hover` | Dark amber hover state |
| **Primary Text on Accent** | `#0C0C0E` | `--accent-text` | Crisp dark text on Amber buttons (WCAG AAA) |
| **Secondary Accent** | `#FB923C` | `--accent-secondary` | Warm highlight, B-roll tags, secondary glow |
| **Virality Score & Ready Status** | `#10B981` | `--virality-emerald` | Virality badges, ready states, fast audio stats |
| **Text Main** | `#F4F4F6` | `--text-main` | Headers, primary titles, timestamps (15:1 contrast) |
| **Text Muted** | `#9E9EA8` | `--text-muted` | Subheadlines, form labels, parameter descriptions |
| **Text Dim** | `#71717A` | `--text-dim` | Metadata, shortcut tooltips, inactive states |

---

## Typography Hierarchy

- **Display & Headlines:** `Inter` or `Geist` with tight `-0.03em` letter-spacing, font-weight 700/800.
- **Body & Controls:** `Inter` with neutral letter-spacing, font-weight 400/500/600.
- **Precision Metrics & Timecodes:** `JetBrains Mono` with `tabular-nums` (`font-variant-numeric: tabular-nums`).
- **Display Headings Rule:** Keep headlines under 80 characters, avoid single-word color accents in headlines, and use sentence case or natural titling.

---

## Copywriting Invariants

- **Banned Words:** Never use generic AI marketing clichés:
  - ❌ "Unleash"
  - ❌ "Elevate"
  - ❌ "Revolutionize"
  - ❌ "Seamless"
  - ❌ "Game-changer"
  - ❌ "Next-gen"
  - ❌ "Craft" (as marketing verb)
  - ❌ "Dive into"
- **Mandated Tone:** Direct, concrete, technical, and written from the perspective of an experienced video editor:
  - ✅ "Turn one 60-minute video into 15 viral shorts."
  - ✅ "Paste a YouTube link or drop a raw MP4. FrameFlow finds the sharpest hooks, reframes speakers to 9:16, burns in word-by-word captions, and opens in a full timeline editor if you want to tweak a single frame."
  - ✅ "Zero monthly credit traps. Plug in your own free Groq or Google AI Studio key and process hours of footage."
