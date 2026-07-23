# Graph Report - .  (2026-07-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 177 nodes · 283 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7

## God Nodes (most connected - your core abstractions)
1. `PageTransition()` - 9 edges
2. `api` - 9 edges
3. `useTheme()` - 7 edges
4. `scripts` - 6 edges
5. `Button()` - 5 edges
6. `MagneticButton()` - 5 edges
7. `toast()` - 5 edges
8. `AmbientBackground()` - 5 edges
9. `Session()` - 5 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useTheme()`  [EXTRACTED]
  client/src/App.jsx → client/src/lib/ThemeProvider.jsx
- `Dashboard()` --calls--> `toast()`  [EXTRACTED]
  client/src/pages/Dashboard.jsx → client/src/components/ui/Toast.jsx
- `Session()` --calls--> `toast()`  [EXTRACTED]
  client/src/pages/Session.jsx → client/src/components/ui/Toast.jsx
- `ColorPicker()` --calls--> `useTheme()`  [EXTRACTED]
  client/src/components/visuals/ColorPicker.jsx → client/src/lib/ThemeProvider.jsx
- `ParticlesBg()` --calls--> `useTheme()`  [EXTRACTED]
  client/src/components/visuals/ParticlesBg.jsx → client/src/lib/ThemeProvider.jsx

## Import Cycles
- None detected.

## Communities (10 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (21): app, router, __dirname, promptsDir, router, upload, DB_PATH, __dirname (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (28): dependencies, framer-motion, react, react-dom, react-markdown, react-router-dom, tailwindcss, @tailwindcss/vite (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (15): ArtifactRenderer(), FileUploader(), BauhausConfetti(), COLORS, Modal(), RevealText(), StaggerItem(), StaggerReveal() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (12): Input(), MagneticButton(), ProgressBar(), AmbientBackground(), confettiColors, Credits(), fadeUp, fadeSlide (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (13): App(), ColorPicker(), presets, textures, CursorFollower(), ParticlesBg(), ThemeContext, ThemeProvider() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): cors, dotenv, express, multer, dependencies, cors, dotenv, express (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (7): PageTransition(), Button(), api, fadeUp, Landing(), stagger, taglines

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): concurrently, devDependencies, concurrently, name, private, scripts, build, dev (+5 more)

## Knowledge Gaps
- **60 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PageTransition()` connect `Community 6` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12307692307692308 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._