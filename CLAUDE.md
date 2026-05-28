# Blog Project — Pixel-Retro + Hand-Drawn Doodle

## Tech Stack
- Astro (static site)
- Tailwind CSS (utility-first styling)
- Fusion Pixel Font (TakWolf/fusion-pixel-font) for UI chrome
- Noto Sans SC for body text

## Design System: Dual-Track (Pixel Frame + Doodle Sticker)

This project uses a **dual-track** design: structural elements are pixel-hard (solid borders, no rounding), while accent elements are hand-drawn doodle style (dashed borders, slight rounding, marker-color shadows).

### Typography
- **Headings, nav, buttons, labels, terminal**: Fusion Pixel 12px Proportional SC (fallback: Pixelify Sans, Press Start 2P). Use `font-display`.
- **Body text, articles, long paragraphs**: Noto Sans SC, 16-18px, line-height 1.7-1.9. Use `font-prose`.
- **NEVER** use pixel fonts for body text, never `font-mono` for body text.

### Colors — Light Mode (Notebook Doodle)
| Role | Hex |
|------|-----|
| Page bg | `#F5F5DC` |
| Card bg | `#FFFDF1` |
| Text / border | `#2B2B2B` |
| Muted text | `#66615A` |
| Marker red | `#ff006e` |
| Marker teal | `#4ecdc4` |
| Marker yellow | `#ffd93d` |

### Colors — Dark Mode (Chalkboard)
| Role | Hex |
|------|-----|
| Page bg | `#141C18` |
| Card bg | `#18221D` |
| Text | `#E0EAE5` |
| Border | `#8BE4A0` |
| Muted text | `#8A9C93` |
| Chalk pink | `#FF8EA6` |
| Chalk green | `#8BE4A0` |
| Chalk yellow | `#FDF28D` |

### Component 1: Pixel Frame (structural cards, code blocks, containers)
- `rounded-none` — always
- `border-2 border-solid border-[#2B2B2B]`
- `shadow-[4px_4px_0_var(--shadow)]` (hard offset shadow, never blur shadows)
- Light shadow var → `#4ecdc4`, dark shadow var → chalk color

### Component 2: Doodle Sticker (buttons, tags, chips, accents)
- `rounded-sm` — slight rounding for hand-drawn feel
- `border-2 border-dashed border-[#2c2c2c]` (dark: `border-[#8BE4A0]`)
- `shadow-[3px_3px_0px_#4ecdc4]`
- Hover: `hover:translate-x-[1px] hover:translate-y-[1px] hover:rotate-1` (slight tilt like a crooked sticker)
- Active: `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`
- Transition: `transition-all duration-200 ease-in-out`

### Component 3: Pixel Button
- `pixel-button` class
- `border-2 border-solid border-[#2c2c2c]`
- Hover: `hover:-translate-y-0.5 hover:translate-x-0.5`
- Shadow: `shadow-[3px_3px_0_#ff006e]`

## FORBIDDEN Tailwind Classes (all components)

These must NEVER appear in generated code:
- **No gradients**: `bg-gradient-to-r`, `bg-gradient-to-b`, `bg-gradient-to-br`
- **No blur shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
- **No glass/blur**: `backdrop-blur`, `backdrop-blur-sm`
- **No large rounding**: `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`
- **No gradient backgrounds**: `^bg-gradient-`
- **No mono for body**: `font-mono` (only allowed in terminal/code contexts)

## REQUIRED Classes by Component

### Card (pixel frame variant)
```
rounded-none border-2 border-solid border-[#2B2B2B] shadow-[4px_4px_0_var(--shadow)]
```

### Card (doodle sticker variant)
```
rounded-sm bg-[#FFFDF1] border-2 border-dashed border-[#2c2c2c] shadow-[4px_4px_0px_#4ecdc4]
```

### Button
```
rounded-sm font-sans font-semibold border-2 border-dashed transition-all duration-200 ease-in-out
```

### Input
```
rounded-sm border-2 border-dashed border-[#2c2c2c] bg-[#FFFDF1] font-sans focus:outline-none
```

## Motion Rules
- All interactive elements: `transition-all`, max 120-180ms
- Links/buttons hover: decoration-wavy underline animation
- Respect `prefers-reduced-motion`
- No particle backgrounds, no heavy Canvas animations, no scroll hijacking

## Site Architecture (Routes)

All routes must exist:
- `/` — Home: hero (avatar, name, role, motto, socials), CLI teaser, about preview, latest blog, latest notes, experience/projects/education/skills, site stats
- `/blog` — Paginated posts: date, title, summary, reading time, tags. Year archive + tag index.
- `/notes` — Living research cards: type, date, updated, tags, status (seed/draft/整理中/已整理/evergreen)
- `/projects` — TOC sections (Open Source, Programs, Learnings, Theme, Sponsorship), project cards with links
- `/links` — Friend link cards: title, alias, description, status, date. Optional constellation visualization.
- `/about` — Profile, motto, hobbies, tools, social networks, personal stories, blog philosophy, site history
- `/contact` — Contact cards with QR reveal. Rules for adding.
- `/search` — Full-site search with pixel-styled input
- `/blog/[slug]`, `/notes/[slug]` — Article detail: TOC, reading progress, metadata, tags, copyright, share, prev/next

## Terminal (Optional)
- Entry: `$_` button in nav/hero
- Open: click or backtick key
- Close: Esc
- Commands: `help`, `ls`, `cat`, `open`, `search`, `theme`, `about`, `blog`, `notes`, `projects`, `links`, `contact`, `clear`

## Pre-Generation Checklist

Before outputting any HTML/Tailwind code, verify:
1. No forbidden classes present
2. Cards use `rounded-none` (pixel frame) or `rounded-sm` (doodle sticker), nothing else
3. Shadows are hard offset only: `shadow-[Npx_Npx_0_...]`
4. Borders are `#2B2B2B` (light) or chalk color (dark), solid on frames, dashed on stickers
5. All interactive elements have `transition-all` + hover displacement
6. Responsive: `p-5 md:p-6`, `text-sm md:text-base` pattern
7. Headings use `font-display`, body uses `font-prose`

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
