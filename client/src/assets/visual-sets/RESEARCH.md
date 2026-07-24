# Animation, Lighting & Effects — Research Document

## Sources
- Material Design 3 Motion Guidelines (m3.material.io/styles/motion)
- Apple Human Interface Guidelines — Motion (developer.apple.com/design/human-interface-guidelines/motion)
- Disney's 12 Principles of Animation (Thomas & Johnston, "The Illusion of Life", 1981)
- Framer Motion Documentation (framer.com/motion)
- Stripe.com design patterns (inspected live)
- Linear.app design patterns (inspected live)
- Vercel.com design patterns (inspected live)
- Raycast.com design patterns (inspected live)
- Arc Browser UI patterns (inspected live)
- Josh Comeau — "The Surprising Power of CSS Gradients" (css-tricks.com)
- Artur Bien — Glass morphism techniques
- MDN Web Docs — CSS Animations, Transitions, Performance

---

## 1. Disney's 12 Principles → UI Mapping

| # | Principle | UI Application | Duration | Easing |
|---|-----------|---------------|----------|--------|
| 1 | Squash & Stretch | Button press (scale 0.95→1.05) | 100ms | ease-out |
| 2 | Anticipation | Dropdown shrinks 2% before expanding | 50-100ms | ease-in |
| 3 | Staging | Modal dims background, focuses attention | 200-300ms | ease-out |
| 5 | Follow-Through | Child elements stagger after parent stops | 50-100ms delay | ease-out |
| 6 | Slow In/Out | All UI motion — never use linear | 200-400ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 8 | Secondary Action | Shadow grows on hover alongside lift | simultaneous | ease-out |
| 9 | Timing | Duration = weight. Small=fast, large=slow | 100-700ms | varies |
| 10 | Exaggeration | Hover scale 1.05 (not 1.01), error shake 10px | 150-300ms | spring |

---

## 2. Easing Curves (Reference)

| Name | cubic-bezier | When |
|------|-------------|------|
| Standard | `(0.2, 0, 0, 1)` | Element moving A→B |
| Decelerate | `(0, 0, 0, 1)` | Elements entering |
| Accelerate | `(0.3, 0, 0.8, 0.15)` | Elements leaving |
| Sharp | `(0.4, 0, 0.6, 1)` | Quick exit, may return |
| Spring | `(0.34, 1.56, 0.64, 1)` | Playful bounce |
| Snappy | `(0.22, 1, 0.36, 1)` | Most UI transitions |
| Elastic | `(0.68, -0.6, 0.32, 1.6)` | Rubber band snap |

### Framer Motion Spring Configs
| Preset | stiffness | damping | mass | Use |
|--------|-----------|---------|------|-----|
| Snappy | 400 | 28 | 0.8 | Buttons, toggles |
| Smooth | 300 | 25 | 1 | Cards, panels |
| Gentle | 150 | 18 | 1 | Page transitions |
| Bouncy | 350 | 12 | 0.8 | Achievements |

---

## 3. Micro-Interaction Timing

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button press | 80-120ms | ease-out |
| Button hover | 120-180ms | ease-out |
| Card hover | 150-200ms | ease-out |
| Input focus | 100-150ms | ease-out |
| Modal open | 250-350ms | spring |
| Modal close | 150-200ms | ease-in (60% of open) |
| Toast enter | 250-350ms | spring |
| Toast exit | 150-200ms | ease-in |
| Page transition | 300-400ms | standard |

**The 2:1 Rule:** Exit duration ≈ 50% of enter duration.

---

## 4. Lighting Techniques

### Radial Gradients as Light Sources
```css
/* Spotlight from top-left */
background: radial-gradient(circle at 20% 30%, rgba(255,200,100,0.3) 0%, transparent 60%);
```

### Glow (Multi-layer for realistic falloff)
```css
box-shadow:
  0 0 5px rgba(99,102,241,0.8),    /* tight core */
  0 0 15px rgba(99,102,241,0.5),   /* mid glow */
  0 0 45px rgba(99,102,241,0.2),   /* soft falloff */
  0 0 80px rgba(99,102,241,0.1);   /* ambient haze */
```

### Mix-Blend-Mode for Light
- `screen` — additive, makes overlapping areas brighter (most common for light effects)
- `color-dodge` — intense, saturated glow (use sparingly)
- `lighten` — keeps lighter of two colors

### Backdrop-Filter (Frosted Glass)
```css
background: rgba(255,255,255,0.1);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.15);
```

---

## 5. Depth System

### Material Design Elevation
| Level | Shadow | Usage |
|-------|--------|-------|
| 0dp | none | Resting surface |
| 1dp | `0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)` | Cards |
| 2dp | `0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)` | Buttons |
| 3dp | `0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)` | Menus |
| 4dp | `0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)` | Nav |
| 5dp | `0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)` | Modal |

### Card Lift on Hover
```css
.card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 7px 14px rgba(0,0,0,0.16), 0 6px 6px rgba(0,0,0,0.23);
}
```

### Dark Mode Elevation (Surface Brightness)
```css
.surface-0 { background: #121212; }
.surface-1 { background: #1e1e1e; }
.surface-2 { background: #252525; }
```

---

## 6. Atmosphere Techniques

### Mesh Gradient Background
```css
background-color: #0d0d2b;
background-image:
  radial-gradient(at 20% 30%, rgba(255,107,157,0.4) 0, transparent 50%),
  radial-gradient(at 80% 20%, rgba(107,91,255,0.3) 0, transparent 50%),
  radial-gradient(at 50% 70%, rgba(0,212,255,0.2) 0, transparent 50%);
```

### Aurora Animation
```css
.aurora::before {
  background:
    radial-gradient(ellipse at 25% 60%, rgba(120,40,200,0.5) 0, transparent 55%),
    radial-gradient(ellipse at 75% 40%, rgba(0,200,180,0.4) 0, transparent 55%);
  animation: aurora 8s ease infinite alternate;
  filter: blur(30px);
}
```

### Grain Texture
```css
.grain::after {
  background-image: url("data:image/svg+xml,...feTurbulence...");
  opacity: 0.15;
  mix-blend-mode: overlay;
}
```

### Vignette
```css
.vignette::after {
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
}
```

---

## 7. World-Class Patterns

### Apple.com
- Hero: scale 0.95→1 + opacity 0→1 over 800ms ease-out
- Frosted glass nav: backdrop-filter: blur(20px)
- Warm ambient radial gradients behind products

### Stripe.com
- Gradient borders: transparent border + gradient background clipping
- Cards: slide up 24px + fade-in, staggered 80ms
- Colored shadows matching brand palette

### Linear.app
- Entrance: opacity 0→1, translateY 12→0, 300-500ms, ease-out
- Hover: translateY -2px, shadow deepens, 200ms
- Deep dark (#0A0A0A), purple accents (#8B5CF6)

### Vercel.com
- Pure black (#000) backgrounds
- Elevation via surface brightness, not shadows
- Concentrated accent colors on CTAs against black

### Raycast.com
- Cursor-tracking radial glow (JS-driven CSS variable)
- Hover: scale 1→1.02, border shift, glow increase, 150-200ms

### Arc Browser
- Spatial tab switching (3D transform)
- Depth-of-field: inactive content blur(2px) + opacity 0.6
- Glass sidebar: backdrop-filter: blur(20px) saturate(1.5)

---

## 8. Performance Rules

1. **Only animate `transform` and `opacity`** — GPU composited, ~1-2ms per frame
2. **Never animate `box-shadow` continuously** — animate pseudo-element opacity instead
3. **60fps = 16.67ms per frame** — layout-triggering animations consume 12-20ms
4. **`will-change` sparingly** — each gets its own GPU layer
5. **Use `requestAnimationFrame`** for JS animations, never setTimeout/setInterval

---

## 9. Accessibility

### prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 120ms !important;
  }
}
```

### Rules
- Essential motion (button feedback, error shake): keep but faster/subtler
- Decorative motion (particles, parallax): remove entirely
- Never use motion as only signal for state changes
- Pair every animation with static signal (color, icon, text)

---

## 10. Stagger Timing

| Feel | Delay/item | Use Case |
|------|-----------|----------|
| Rapid | 10-30ms | Card dealing, galleries |
| Rhythm | 40-60ms | Standard stagger, nav items |
| Deliberate | 80-100ms | Hero sections, dramatic reveals |

**Rules:**
- Stagger only 3-8 items
- Cap total at ~1200ms
- Enter > Exit (entry 300ms, exit ~200ms)
