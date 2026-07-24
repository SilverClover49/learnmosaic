# LearnMosaic Design Audit Report
**Date:** 2026-07-24
**Auditor:** AI Design Review
**Screenshots:** `client/src/assets/visual-sets/audit-screenshots/`

---

## EXECUTIVE SUMMARY

The app is **functionally solid** and the Bauhaus DNA is clearly present. The core experience works: onboarding flows cleanly, AI generates real code/SVG/video recommendations, dashboard cards are bold, curriculum/checklist are well-structured. However, there are **significant visual issues** — mostly around dark mode not applying, too much empty space on several screens, and some inconsistent styling. The overall feel is "good foundation, needs polish."

---

## SCREEN-BY-SCREEN ASSESSMENT

### 1. LANDING PAGE (01-03)
**File:** `client/src/pages/Landing.jsx`
**Verdict:** STRONG

| Aspect | Rating | Notes |
|--------|--------|-------|
| Typography | ✅ | "LEARN" / "MOSAIC" split with bold/italic is distinctive |
| Composition | ✅ | Split-screen (text left, Kandinsky shapes right) is Bauhaus-authentic |
| Color DNA | ✅ | Red/Blue/Yellow/Black primary palette well-applied |
| Texture | ✅ | Subtle shape pattern background adds depth without noise |
| CTAs | ✅ | START (red fill) + CONTINUE (outline) — clear hierarchy |
| Footer | ✅ | Minimal, color swatches in corner are a nice touch |

**Issues:**
- "ready to learn?" / "ready to explore?" rotating tagline is too small — easy to miss
- Right panel shapes could benefit from subtle animation (they're static in screenshot)
- The "FORM FOLLOWS FUNCTION" vertical text on the divider is a nice touch but barely visible

**Rating: 8/10** — This is the strongest screen.

---

### 2. ONBOARDING — Name & Age (04-05)
**File:** `client/src/pages/Onboarding.jsx`
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Step indicator | ✅ | Left sidebar with checkboxes, percentage, step labels |
| Icon system | ✅ | Yellow person icon (circle = identity) follows Kandinsky |
| Form layout | ✅ | Clean, centered, clear labels |
| Progress | ✅ | "STEP 1 OF 6" + "17%" — both visible |

**Issues:**
- Floating shapes in background are TOO prominent — they overlap the form area and compete with content
- The step indicator sidebar has no background contrast against the main content area
- CONTINUE button uses red text on light background (low contrast when not filled)

**Rating: 7/10**

---

### 3. ONBOARDING — Interests (06-07)
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Chip design | ✅ | Clean bordered chips, uppercase tracking |
| Selection state | ✅ | Selected = filled black, unselected = outline |
| Layout | ✅ | Wrapped grid, centered |
| Custom input | ✅ | "Or type your own interest..." below chips |

**Issues:**
- Chips are all the same visual weight — hard to scan quickly
- No visual feedback animation when selecting (screenshot can't show, but Framer Motion is there)
- The floating shapes STILL overlap content

**Rating: 7/10**

---

### 4. ONBOARDING — Goal (08-09)
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Option layout | ✅ | Full-width stacked buttons — clear |
| Red checkbox icon | ✅ | Kandinsky: square = goal/decision |
| "SOMETHING ELSE..." | ✅ | Custom goal option included |
| Material upload | ✅ | "+ ADD YOUR OWN MATERIALS" toggle present |

**Issues:**
- Goal buttons all look identical until selected — no hover preview
- "ADD YOUR OWN MATERIALS" button is small and easy to miss
- The horizontal divider line uses `var(--border-color)` which we just defined — was invisible before

**Rating: 7/10**

---

### 5. ONBOARDING — Refine (10-11)
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| AI prompt card | ✅ | Double-bezel card with contextual question |
| AI Suggest button | ✅ | "AI SUGGEST" available for guidance |
| Input field | ✅ | Clear placeholder |

**Issues:**
- The AI prompt card text is too light (low contrast)
- AI Suggest button is small and isolated
- Too much vertical whitespace above the form

**Rating: 6/10**

---

### 6. ONBOARDING — Timeframe (12-13)
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Grid layout | ✅ | 2×3 grid of timeframe options |
| Typography | ✅ | Large numbers (1, 7, 30, 90, 180, ∞) |
| Selection state | ✅ | Black fill when selected |
| Custom option | ✅ | "CUSTOM..." full-width button below |

**Issues:**
- The cyan/teal square floating shape overlaps the "FLEXIBLE" card — distracting
- Cards lack hover state differentiation
- The grid could be more visually interesting with Kandinsky shapes per option

**Rating: 7/10**

---

### 7. ONBOARDING — Review (14)
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Plan summary | ✅ | Table with Name, Age, Goal, Focus, Interests, Timeframe |
| Header bar | ✅ | Black "YOUR PLAN" header |
| CTA | ✅ | "BEGIN LEARNING" red button |

**Issues:**
- The review table rows have very low contrast (gray on light)
- Floating shapes overlap the review card
- INTERESTS row is partially cut off at bottom of card

**Rating: 6/10**

---

### 8. LOADING STATE (15)
**File:** `client/src/pages/Onboarding.jsx` (loading section)
**Verdict:** EXCELLENT

| Aspect | Rating | Notes |
|--------|--------|-------|
| Spinner design | ✅ | Red square with rotating border — Bauhaus-authentic |
| Progress bar | ✅ | Red fill with "GENERATING CURRICULUM..." |
| Status messages | ✅ | "Designing your curriculum..." |
| Floating shapes | ✅ | More prominent here — appropriate for loading |

**Issues:**
- None significant. This is well-executed.

**Rating: 9/10**

---

### 9. SESSION — Empty State (37)
**File:** `client/src/pages/Session.jsx`
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Welcome message | ✅ | "START LEARNING!" with context about the goal |
| Suggestion chips | ✅ | "Where should I start?", "Give me an overview", "What do I need to know first?" |
| Nav bar | ✅ | Black bar with Dashboard link, session title, timer, EXPORT, PANELS, COMPLETE, X |
| Input bar | ✅ | Clean input with SEND button |

**Issues:**
- The yellow icon and suggestion chips are floating in a LOT of empty space
- The suggestion chips have yellow triangle bullets — hard to see
- No visual indication of session progress or curriculum preview

**Rating: 6/10**

---

### 10. SESSION — Code Response (16-17)
**File:** `client/src/pages/Session.jsx` + `client/src/components/session/CodeSandbox.jsx`
**Verdict:** STRONG

| Aspect | Rating | Notes |
|--------|--------|-------|
| Code rendering | ✅ | Full Python BST code with syntax highlighting |
| Code sandbox | ✅ | macOS-style window with red/yellow/green dots |
| Explanation | ✅ | Bulleted explanation below code |
| Copy/Reference | ✅ | Copy and Reference buttons visible |

**Issues:**
- The code block uses a white/cream background — works in light mode but could clash in dark
- The red border on the AI bubble is very thick (3px) — feels heavy
- "Feel free to modify or expand this code based on your needs!" is a bit generic
- The code sandbox title shows "svg" — should show the actual file type

**Rating: 8/10**

---

### 11. SESSION — SVG/Architecture Diagram (18-19)
**Verdict:** EXCELLENT

| Aspect | Rating | Notes |
|--------|--------|-------|
| SVG rendering | ✅ | Clean architecture diagram (Frontend → API Gateway → Microservices → Database) |
| CodeSandbox | ✅ | SVG renders properly in sandbox |
| Labels | ✅ | "HTTP Requests", "API Calls", "Service Calls", "Data Requests" |

**Issues:**
- The SVG sandbox has lots of empty space around the diagram
- Sandbox shows "svg" as title — could be more descriptive

**Rating: 9/10**

---

### 12. SESSION — HTML/CSS Response (22-23)
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Code quality | ✅ | Full HTML + CSS with animations, hero, about, projects, contact |
| Explanation | ✅ | Clear bullet breakdown of each section |
| Dual code blocks | ✅ | HTML and CSS in separate codeSandbox instances |

**Issues:**
- Two separate code blocks (HTML + CSS) without sandbox preview — user has to manually combine
- The explanation mentions "copy into separate files" but doesn't provide a sandbox preview
- Missing a "Run in sandbox" or "Preview" button

**Rating: 7/10**

---

### 13. SESSION — Complex Code (26-27)
**Verdict:** GOOD

**Issues:**
- Same HTML/CSS response appears to be shown (the screenshots show CSS code, not the React drawing board)
- The AI may not have generated the React Canvas component as requested
- Need to verify if the response actually matches the prompt

**Rating: 6/10** (if response doesn't match prompt)

---

### 14. SESSION — Dark Mode (37-37b)
**File:** `client/src/pages/Session.jsx`
**Verdict:** NEEDS WORK

| Aspect | Rating | Notes |
|--------|--------|-------|
| Nav bar | ✅ | Black background, white text |
| Session title | ✅ | "Learn a new skill from scratch — Three.js for c..." |
| Timer | ✅ | Visible |
| COMPLETE button | ✅ | Red with good contrast |

**Issues:**
- The chat area background is very light (the dark mode class may not be applying to the chat area)
- The suggestion chips and "START LEARNING!" text are on a light background
- The input bar area appears light
- The overall session page doesn't look dark

**Rating: 4/10** — Dark mode is not working properly on session page.

---

### 15. DASHBOARD (32)
**File:** `client/src/pages/Dashboard.jsx`
**Verdict:** STRONG

| Aspect | Rating | Notes |
|--------|--------|-------|
| Welcome header | ✅ | "Welcome back, Audit User" with yellow triangle icon |
| Card grid | ✅ | 3-column grid with bold colors |
| Card variety | ✅ | Red, Blue, Yellow, Black cards — good visual rhythm |
| Status badges | ✅ | "ACTIVE", "COMPLETED" clearly visible |
| Timeframe labels | ✅ | "TODAY", "1 MONTH", "FLEXIBLE", "3 MONTHS" |
| Favorite star | ✅ | Yellow star on first card |
| 3-dot menu | ✅ | Present on each card |
| Dark mode toggle | ✅ | Moon icon visible |

**Issues:**
- Cards are ALL the same height — no visual hierarchy between them
- "TEST THE APP" (first card) looks like a test leftover
- The session name "LEARN A NEW SKILL FROM..." is truncated on every card — not informative
- Missing: session thumbnail/preview, last activity timestamp, progress indicator
- The dark mode toggle is tiny and hard to find

**Rating: 7/10**

---

### 16. DASHBOARD — Dark Mode (36)
**Verdict:** NEEDS WORK

**Issues:**
- The page background is still light/cream — dark mode NOT applying
- Cards look identical to light mode
- The dark mode toggle exists but doesn't seem to work (or the CSS isn't applied)

**Rating: 3/10** — Dark mode broken on dashboard.

---

### 17. SETTINGS (34)
**File:** `client/src/pages/Settings.jsx`
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Layout | ✅ | Centered, clean |
| AI Provider grid | ✅ | 2×2 grid: OPENROUTER, OPENAI, OLLAMA, CUSTOM |
| Selection state | ✅ | Black fill on selected provider |
| API Key input | ✅ | Password-masked |
| Model dropdown | ✅ | "openai/gpt-4o-mini" |
| Save/Test buttons | ✅ | Red SAVE + outline TEST |

**Issues:**
- Floating shapes overlap the form
- No visual feedback after Save/Test
- Missing: Theme settings, notification preferences, account management
- The "← BACK" link is small

**Rating: 7/10**

---

### 18. CURRICULUM (30)
**File:** `client/src/pages/Curriculum.jsx`
**Verdict:** EXCELLENT

| Aspect | Rating | Notes |
|--------|--------|-------|
| Content quality | ✅ | 6 modules with topics, objectives, key concepts, practice activities |
| Typography | ✅ | Clean hierarchy: headings, bold labels, bullet lists |
| Structure | ✅ | Prerequisites → Modules → Resources → Success Criteria |
| Reading experience | ✅ | Good line height, clear contrast |

**Issues:**
- The entire curriculum is one long scroll — could benefit from collapsible modules
- No progress tracking (which modules are done?)
- No estimated total time displayed

**Rating: 8/10**

---

### 19. CHECKLIST (31)
**File:** `client/src/pages/Checklist.jsx`
**Verdict:** GOOD

| Aspect | Rating | Notes |
|--------|--------|-------|
| Design | ✅ | Clean rounded cards with checkbox circles |
| Typography | ✅ | Clear task descriptions |
| Spacing | ✅ | Good vertical rhythm |

**Issues:**
- The "CHECKLIST" badge is red — should it be yellow? (checkmark = yellow in Kandinsky)
- No grouping by module (all 12 items are flat)
- No progress counter (e.g., "3 of 12 complete")
- Cards all have the same gray/beige background — no visual hierarchy

**Rating: 6/10**

---

### 20. THINKING BOARD (29)
**File:** `client/src/pages/Board.jsx`
**Verdict:** WEAK

| Aspect | Rating | Notes |
|--------|--------|-------|
| Content | ⚠️ | Just raw markdown — not rendered |
| Layout | ⚠️ | Monospace text dump in a gray card |

**Issues:**
- The thinking board renders raw markdown instead of formatted HTML
- It shows "**Goal**:", "**Started**:" as literal markdown syntax
- Very sparse content — just the initial template
- The "THINKING BOARD" badge is red
- This page feels unfinished compared to the rest

**Rating: 3/10** — Needs significant work. Should render markdown as formatted content, and the AI should populate it during conversations.

---

### 21. CREDITS (40)
**File:** `client/src/pages/Credits.jsx`
**Verdict:** NOT CAPTURED (script didn't reach it)

---

## OVERALL ASSESSMENT

### What's Working Well
1. **Landing page** — Strongest screen. Bauhaus composition is authentic.
2. **Onboarding flow** — Clean, progressive, good use of Kandinsky shapes per step.
3. **AI code generation** — Real, functional code with code sandbox rendering.
4. **SVG diagram generation** — Architecture diagrams render beautifully.
5. **Curriculum** — Comprehensive, well-structured learning paths.
6. **Dashboard cards** — Bold color rhythm, clear status indicators.
7. **Nav bar** — Clean, informative, consistent.

### What Needs Fixing
1. **Dark mode is broken** — The `dark-mode` class is being added via JS but CSS isn't applying to most pages. The landing page, dashboard, and session all show light backgrounds in "dark mode". This is the **#1 priority**.
2. **Thinking Board** — Renders raw markdown. Needs markdown-to-HTML rendering.
3. **Floating shapes overlap content** — On onboarding and settings pages, the decorative shapes compete with form elements.
4. **Session empty state** — Too much empty space. Suggestion chips are small and hard to find.
5. **Checklist** — No progress tracking, no module grouping.
6. **Code responses** — HTML/CSS responses don't have sandbox preview. The "svg" title in code sandbox is misleading.
7. **Card names on dashboard** — All truncated to "LEARN A NEW SKILL FROM..." — not useful.
8. **Settings page** — Missing theme/notification/account sections.

### Priority Fixes
| Priority | Issue | Screens Affected |
|----------|-------|-----------------|
| P0 | Dark mode CSS not applying | Dashboard, Session, Landing |
| P1 | Thinking Board markdown rendering | Board |
| P1 | Floating shapes overlap content | Onboarding, Settings |
| P2 | Session empty state spacing | Session |
| P2 | Checklist progress tracking | Checklist |
| P2 | Code sandbox titles | Session |
| P3 | Dashboard card hierarchy | Dashboard |
| P3 | Settings completeness | Settings |

---

## RATING SUMMARY

| Screen | Light Mode | Dark Mode | Source File |
|--------|-----------|-----------|-------------|
| Landing | 8/10 | N/A (not tested) | `Landing.jsx` |
| Onboarding (all steps) | 7/10 | N/A | `Onboarding.jsx` |
| Loading | 9/10 | N/A | `Onboarding.jsx` |
| Session (empty) | 6/10 | 4/10 | `Session.jsx` |
| Session (code) | 8/10 | N/A | `Session.jsx` |
| Session (SVG) | 9/10 | N/A | `Session.jsx` |
| Session (HTML) | 7/10 | N/A | `Session.jsx` |
| Dashboard | 7/10 | 3/10 | `Dashboard.jsx` |
| Settings | 7/10 | N/A | `Settings.jsx` |
| Curriculum | 8/10 | N/A | `Curriculum.jsx` |
| Checklist | 6/10 | N/A | `Checklist.jsx` |
| Thinking Board | 3/10 | N/A | `Board.jsx` |

**Overall Score: 6.8/10** — Solid foundation with clear Bauhaus identity. Dark mode and a few polish items are holding it back from 8+.
