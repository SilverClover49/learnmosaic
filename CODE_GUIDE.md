# LearnMosaic — Code Guide

## Stack

| Layer | Tech | Role |
|-------|------|------|
| **Client** | React 19 + Vite + Tailwind CSS 4 + Framer Motion 12 | UI |
| **Server** | Node.js + Express | API |
| **Database** | PocketBase 0.39.x (SQLite) | Storage |
| **AI** | OpenRouter / OpenAI / Ollama / Custom | Tutor |

## Project Structure (133 nodes, 247 edges, 10 communities)

```
learnmosaic/
├── client/                    # React SPA (Community 1, 2, 5, 6, 7)
│   └── src/
│       ├── pages/             # Route-level page components
│       │   ├── Landing.jsx    # Hero + profile selection
│       │   ├── Onboarding.jsx # 5-step wizard (name, age, interests, goal, timeframe)
│       │   ├── Dashboard.jsx  # Session card grid + ProfilePanel sidebar
│       │   ├── Session.jsx    # AI chat interface + side panels
│       │   ├── Board.jsx      # Thinking board viewer
│       │   ├── Checklist.jsx  # Persistable interactive checklist
│       │   ├── Curriculum.jsx # AI-generated curriculum viewer
│       │   ├── Credits.jsx    # Milestone timeline + review cards + confetti
│       │   └── Settings.jsx   # AI provider config (provider, model, key, baseUrl)
│       ├── components/
│       │   ├── ui/            # Reusable: Button, Modal, Card, Input, Toast, Reveal, ProgressBar, BauhausConfetti
│       │   ├── visuals/       # Decorations: AmbientBackground, ColorPicker, ParticlesBg, CursorFollower
│       │   ├── layout/        # PageTransition (fade-up wrapper)
│       │   ├── dashboard/     # ProfilePanel sidebar
│       │   └── session/       # ArtifactRenderer, CodeSandbox, PresentationViewer, ReferencePanel, SelectionToolbar, SessionMenu, FileUploader
│       └── lib/
│           ├── api.js         # Client API client (getSettings, saveSettings, sessions CRUD, chat, etc.)
│           └── ThemeProvider.jsx # Theme context (4 presets + wheel + textures + particles)
├── server/                    # Express API (Community 0, 4, 8, 9)
│   ├── routes/
│   │   ├── sessions.js        # Session CRUD, chat (AI tutor), image gen, complete/undo, credits
│   │   ├── settings.js        # GET/PUT /api/settings, POST /api/settings/test-ai
│   │   ├── users.js           # Profile CRUD
│   │   └── documents.js       # Document generation (lean canvas)
│   ├── services/
│   │   ├── chat.js            # Chat pipeline: SSE, memory injection, tool chaining, persistence
│   │   ├── openrouter.js      # AI provider router (OpenRouter, OpenAI, Ollama, Custom)
│   │   ├── pb.js              # PocketBase REST client wrapper
│   │   ├── tools.js           # 11 AI tool definitions + executors (search, images, SVG, code, etc.)
│   │   ├── memory.js          # Per-session key-value memory with keyword scoring
│   │   ├── artifacts.js       # Artifact CRUD (code outputs, images, SVGs)
│   │   ├── settings.js        # Settings loader with in-memory cache + env fallback
│   │   ├── search.js          # Web search + image search (DuckDuckGo)
│   │   └── imagegen.js        # Image generation client
│   ├── prompts/               # Markdown prompt templates (tutor, curriculum, checklist, tools)
│   └── index.js               # Express entry point
├── pocketbase/                # PocketBase binary
├── graphify-out/              # Code graph visualizations
│   ├── studio.html            # Dependency graph viewer (378 KB, offline)
│   ├── graph.html             # Force-directed graph
│   ├── GRAPH_TREE.html        # Tree viewer
│   └── GRAPH_REPORT.md        # Graph analysis report
└── start.bat                  # 3-process launcher (PocketBase + server + client)
```

## Community Map (from graphify)

| # | Name | Cohesion | Key Files |
|---|------|----------|-----------|
| 8 | **AI Service Layer** | 0.40 | `openrouter.js`, `tools.js`, `memory.js`, `artifacts.js` |
| 9 | **PocketBase Data Layer** | 0.40 | `pb.js` |
| 7 | **Credits & Milestones** | 0.33 | `Credits.jsx` |
| 6 | **Session Chat UI** | 0.32 | `Session.jsx`, `SelectionToolbar.jsx`, `ReferencePanel.jsx`, `CodeSandbox.jsx` |
| 5 | **Onboarding & Inputs** | 0.18 | `Onboarding.jsx`, `Input.jsx`, `ProgressBar.jsx` |
| 3 | **Project Config & Git** | 0.17 | `package.json`, `vite.config.js`, git history |
| 1 | **Page API Client** | 0.16 | `api.js`, `Landing.jsx`, `Board.jsx`, `Checklist.jsx`, `Curriculum.jsx` |
| 4 | **Server Session Routes** | 0.15 | `sessions.js`, `imagegen.js`, `search.js` |
| 2 | **Theme Engine** | 0.13 | `ThemeProvider.jsx`, `ColorPicker.jsx`, `AmbientBackground.jsx` |
| 0 | **Dashboard UI** | 0.12 | `Dashboard.jsx`, `ProfilePanel.jsx`, `BauhausConfetti.jsx`, `Reveal.jsx` |

## Chat Pipeline (`server/services/chat.js`)

The chat handler was extracted from the route file into its own service (~180 lines → ~120 lines):

```
handleChat(req, res)              # Entry point — receives Express req/res
  ├── buildSystemPrompt()         # Loads prompts, injects memories + artifacts (parallel)
  ├── streamAI()                  # First SSE streaming call — detects tool calls
  │   └── tool_call_chunks → buffer → executeToolCalls() [sequential]
  │       └── streamAI()          # Follow-up streaming with tool results
  ├── sendSSE('done') + res.end()
  └── persistChat()               # Post-response: save messages, update board, extract facts
      └── extractFacts()          # Every 3 messages (not every turn — saves tokens)
```

Key fixes in this refactor:
- **`callAI()` always returns `{ content, tool_calls }`** — was returning `message.content` (string) for non-tool calls, breaking callers that expected `.content`
- **`executeToolCalls()` runs sequentially** — was `Promise.all` (parallel), now `for...of` for deterministic ordering
- **Fact extraction batches every 3 messages** — was every reply, doubling token cost
- **`documents.js` now passes `settings`** — was calling AI without settings, falling back to env vars only

## Key Architecture Decisions

### Settings Flow
```
Client Settings page → PUT /api/settings → PocketBase profiles.apiKey
                                ↓
           clearSettingsCache() (invalidates in-memory cache)
                                ↓
           Next getSettings() reads from PocketBase (env var fallback)
                                ↓
           callAI(settings) dynamically resolves provider/URL/model/headers
```

All AI calls pass a `settings` object: `callAI({ system, messages, tools, settings })`. No global state or env var dependencies at call sites.

### Memory System (per-session key-value)
- **Storage**: PocketBase `memories` collection (`sessionId`, `type`, `key`, `value`, `importance`)
- **Retrieval**: `recallMemories(sessionId, message)` — keyword-scored relevance matching
- **Auto-extraction**: After each chat reply, `callAI` extracts factual statements and stores as memories
- **Injection**: Relevant memories are injected into the system prompt on every chat turn

### SSE Streaming
Chat responses now stream via Server-Sent Events (SSE). The flow:

```
Client sends POST /api/sessions/:id/chat → Server sets SSE headers
  ↓
streamAI() async generator reads fetch response body chunk by chunk
  ↓
Each text delta → SSE { type: 'token', text } → Client appends to last message
  ↓
Tool calls detected → Execute → Stream follow-up response
  ↓
SSE { type: 'blocks', blocks } → SSE { type: 'done' } → res.end()
  ↓
Messages persisted to PocketBase + auto fact extraction + thinking board update
```

Client shows animated Bauhaus loading dots during streaming and a blinking cursor after final token.

### AI Tool System
11 tools available to the AI via function calling:

| Tool | Description |
|------|-------------|
| `search_web` | DuckDuckGo web search |
| `search_images` | DuckDuckGo image search |
| `generate_svg` | SVG diagram generation |
| `generate_image` | AI image generation |
| `remember` | Store a memory fact |
| `recall` | Query stored memories by keyword |
| `create_artifact` | Save output as named artifact |
| `list_artifacts` | List session artifacts |
| `run_code` | Execute HTML/CSS/JS in sandbox |
| `create_presentation` | Generate slide deck |
| `generate_download` | Create downloadable file |

Tools run in up to 3 chained rounds (first call → tool execution → second call → optional third call).

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/settings` | Get AI provider config |
| PUT | `/api/settings` | Save AI provider config |
| POST | `/api/settings/test-ai` | Test AI provider connection |
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Create session (generates curriculum + checklist via AI) |
| GET | `/api/sessions/:id` | Get single session |
| PATCH | `/api/sessions/:id` | Update session (name, goal, favorite) |
| DELETE | `/api/sessions/:id` | Delete session + messages + milestones |
| POST | `/api/sessions/:id/chat` | Send message to AI tutor |
| POST | `/api/sessions/:id/complete` | Mark session complete (generates review cards) |
| POST | `/api/sessions/:id/undo-complete` | Restore active status |
| POST | `/api/sessions/:id/generate-image` | Generate image |
| POST | `/api/sessions/:id/upload` | Upload file |
| GET | `/api/sessions/:id/credits` | Get milestones + thinking board + review cards |
| GET | `/api/sessions/users` | List all profiles |
| POST | `/api/sessions` (users route) | Create profile |
| GET | `/api/sessions/:id` (documents route) | Get lean canvas |

## PocketBase Collections

| Collection | Fields |
|------------|--------|
| `profiles` | name, age, aiProvider, aiModel, apiKey, baseUrl |
| `sessions` | profileId, name, age, interests, goal, timeframe, status, materials, curriculum, thinkingBoard, checklist, completedAt, chatCount, favorite, reviewCards |
| `messages` | sessionId, role, content, blocks (JSON) |
| `milestones` | sessionId, type, description |
| `memories` | sessionId, type, key, value, importance |
| `artifacts` | sessionId, type, name, content, mimeType |

## Design Mandate (Bauhaus inspired)

- **Double-bezel**: `p-[2px]` outer (glass) + `rounded-[calc(var(--radius-xl)-2px)]` inner (surface + shadow)
- **Button-in-button**: arrows inside `bg-white/15 rounded-full` with group-hover transforms
- **Floating island nav**: `mt-4 mx-auto w-max rounded-full` glass pill
- **Colors**: Bauhaus primaries (red, yellow, blue, black) + configurable palette via ThemeProvider
- **Radii**: sm=8px, md=12px, lg=20px, xl=32px, 2xl=40px
- **Transition**: 700ms, `cubic-bezier(0.32, 0.72, 0, 1)` throughout
- **Z-index**: dropdown=10, sticky=20, overlay=40, modal-backdrop=45, modal=50, toast=60
- **Banned**: Inter/Poppins/Lato, Font Awesome/Material Icons, side-by-side card grids, edge-to-edge navbars

## Client Theme Engine

```
ThemeProvider (context)
├── 4 presets: Obsidian, Amethyst, Terracotta, Sage
├── Color wheel (custom hue + adjustment)
├── 6 texture patterns (dots, grid, noise, etc.)
├── Particle toggle + density + motion speed
└── Border radius + border weight options
```

## Running the App

```
start.bat          # Launches PocketBase + server + client
├── PocketBase     :8090  (Admin UI: http://127.0.0.1:8090/_/)
├── Express server :3001  (API)
└── Vite dev server:5173  (Client)
```

First-time setup: `cd server && node setup-pb.js` (creates collections + migrates fields).

## Graphify Code Graph

Open `graphify-out/studio.html` (378 KB, fully offline) to explore the dependency graph interactively. Shows 133 nodes, 247 edges across 10 communities. Also available:
- `graphify-out/graph.html` — Force-directed graph
- `graphify-out/GRAPH_TREE.html` — Tree viewer
- `.graphify/GRAPH_REPORT.md` — Freshness timestamp, god nodes, cohesion scores, knowledge gaps
