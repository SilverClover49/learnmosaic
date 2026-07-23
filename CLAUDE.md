# LearnMosaic — Project Memory

## Stack
- Client: React 19 + Vite + Tailwind CSS 4 + Framer Motion
- Server: Node.js + Express
- AI: OpenRouter (gpt-4o-mini), key in server/.env
- Storage: PocketBase v0.39.x (SQLite), binary at pocketbase/pocketbase.exe

## Design Mandate (Vanguard_UI_Architect)
- **Double-bezel**: `p-[2px] rounded-[var(--radius-xl)]` outer (glass-border) + `rounded-[calc(var(--radius-xl)-2px)]` inner (surface + shadow-inner)
- **Button-in-button**: arrows inside `bg-white/15 rounded-full` wrapper with group-hover:translate-x-1 / -translate-y-[1px] / scale-105
- **Floating island nav**: `mt-4 mx-auto w-max rounded-full` glass pill, hamburger morph → X, staggered mobile overlay
- **No backdrop-blur on scrollable containers** — only on fixed/sticky (nav pill, modals, toasts, overlays)
- **Macro whitespace**: `py-24` or `py-32` on page containers
- **Radii**: sm=8px, md=12px, lg=20px, xl=32px, 2xl=40px
- **Transition speed**: 700ms, `cubic-bezier(0.32, 0.72, 0, 1)` throughout
- **Z-index**: dropdown:10, sticky:20, overlay:40, modal-backdrop:45, modal:50, toast:60
- **Banned**: Inter, Poppins, Lato fonts; Font Awesome / Material Icons; side-by-side card grids; edge-to-edge navbars

## What's Done
- **PocketBase**: 4 collections (profiles, sessions, messages, milestones) with proper autodate timestamps, text limits, favorite/chatCount/reviewCards fields
- **Server**: sessions CRUD, OpenRouter AI (constitution, curriculum, tutor, checklist, summarize), image gen endpoint, rename + favorite toggle via PATCH, thinking board summarization every 5 messages, review cards on session complete
- **Client pages**: Landing (staggered fadeUp+blur), Onboarding (5-step wizard), Dashboard (Bauhaus card grid + ProfilePanel sidebar + 3-dot session menu with favorite/rename/delete), Session (chat + side panels + floating-island nav + text selection → Ask Doubt + SVG diagrams + delete/complete modals + toast undo), Curriculum, Board, Checklist (persistent checkboxes), Credits (milestone timeline + review cards)
- **UI**: Card, Button (rounded-full + magnetic), Modal (double-bezel + backdrop), Toast (with action buttons), Input, ProgressBar, ColorPicker (4 presets + wheel + texture + particles), ArtifactRenderer (double-bezel code with responsive SVG + image support), FileUploader (double-bezel drop zone), SessionMenu (3-dot dropdown), ProfilePanel (left sidebar with stats)
- **Theme engine**: 4 presets (Obsidian, Amethyst, Terracotta, Sage) + color wheel + texture overlay (6 patterns) + particle toggle
- **start.bat**: launches PocketBase + server + client

## Next Steps
1. Capture screenshots for PPT deck
2. Code-split to reduce vendor chunk size
3. Re-run `setup-pb.js` for fresh installs

## Build Commands
- Client: `cd client && npm run build`
- Server: `cd server && node index.js`
- PocketBase: `pocketbase/pocketbase.exe serve --http=127.0.0.1:8090`
- All: `start.bat`
