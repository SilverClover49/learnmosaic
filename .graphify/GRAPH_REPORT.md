# Graph Report - learnmosaic  (2026-07-23)

## Corpus Check
- 54 files · ~1,00,327 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 133 nodes · 248 edges · 10 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 84 · imports_from: 64 · MODIFIES: 51 · imports: 29 · calls: 7 · ON_BRANCH: 7 · PARENT_OF: 6


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 54 · Candidates: 65
- Excluded: 109 untracked · 8437 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `16377a2`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `api` - 11 edges
2. `toast()` - 4 edges
3. `useTheme()` - 4 edges
4. `callAI()` - 4 edges
5. `Session()` - 3 edges
6. `generateImage()` - 3 edges
7. `pb` - 3 edges
8. `searchImages()` - 3 edges
9. `executeToolCalls()` - 3 edges
10. `StaggerReveal()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 2 - "Theme Engine"
Cohesion: 0.13
Nodes (8): textures, densities, borderWeights, cornerOptions, motionOptions, ThemeContext, ThemeProvider(), useTheme()

### Community 0 - "Dashboard UI Components"
Cohesion: 0.12
Nodes (5): COLORS, StaggerReveal(), StaggerItem(), toast(), cardColors

### Community 1 - "Page API Client"
Cohesion: 0.16
Nodes (4): api, taglines, stagger, fadeUp

### Community 6 - "Session Chat UI"
Cohesion: 0.32
Nodes (3): formatTime(), formatTimer(), Session()

### Community 3 - "Project Config & Git"
Cohesion: 0.17
Nodes (11): app, api(), setup(), 0c09560 Update: ProfilePanel, SessionMenu, API, Dashboard, Landing, Session, server routes and services, 16377a2 Add presentation slides and PDF, 201fa50 Initial commit: LearnMosaic project structure and documentation, 42e6886 Add React frontend with Vite, Tailwind, Framer Motion, 9afa192 Add Express backend with OpenRouter AI integration (+3 more)

### Community 5 - "Onboarding & Inputs"
Cohesion: 0.18
Nodes (4): interests, goals, stepIcons, fadeSlide

### Community 7 - "Credits & Milestones"
Cohesion: 0.33
Nodes (2): fadeUp, confettiColors

### Community 8 - "AI Service Layer"
Cohesion: 0.40
Nodes (4): router, PROVIDERS, resolveSettings(), callAI()

### Community 4 - "Server Session Routes"
Cohesion: 0.15
Nodes (12): __dirname, promptsDir, UPLOAD_DIR, upload, router, generateImage(), searchWeb(), searchImages() (+4 more)

### Community 9 - "PocketBase Data Layer"
Cohesion: 0.40
Nodes (4): router, getToken(), api(), pb

## Knowledge Gaps
- **26 isolated node(s):** `COLORS`, `textures`, `densities`, `borderWeights`, `cornerOptions` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Credits & Milestones`** (2 nodes): `fadeUp`, `confettiColors`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `Page API Client` to `Dashboard UI Components`, `Credits & Milestones`, `Onboarding & Inputs`, `Session Chat UI`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `callAI()` connect `AI Service Layer` to `Server Session Routes`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `pb` connect `PocketBase Data Layer` to `Server Session Routes`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `COLORS`, `textures`, `densities` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Theme Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
- **Should `Dashboard UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._