# Visual Asset Sets — Integration Guide

## Overview

4 complete asset sets, each with a distinct aesthetic direction. **455 total PNG assets** across backgrounds, textures, particles, icons, buttons, gradients, decorative shapes, and hero patterns.

## Asset Sets

### Set A: Classical Bauhaus
**Mood:** Pure geometry, primary colors, sharp edges, hard shadows.
**Best for:** The current LearnMosaic design — directly compatible with existing Kandinsky color-shape grammar.
**Palette:** Red `#E63946`, Blue `#1D3557`, Yellow `#F4D35E`, Black, White.
**Files:** 131 assets (843 KB)

### Set B: Organic Bauhaus
**Mood:** Softened geometry, warm earth tones, rounded forms, nature-meets-modernism.
**Best for:** A warmer, more approachable variant. Good for younger learners or a gentler UX.
**Palette:** Sage `#7A9E7E`, Terracotta `#C4704A`, Sand `#D4C4A8`, Dusty Rose, Warm Gray.
**Files:** 108 assets (1055 KB)

### Set C: Structural Depth
**Mood:** Heavy shadows, layered surfaces, architectural mass, Brutalist weight.
**Best for:** A more serious, institutional feel. Good for assessments or data-heavy views.
**Palette:** Concrete `#2A2A2A`, Steel `#6A7A8A`, Rust `#A05030`, Bone `#E8E0D8`.
**Files:** 108 assets (333 KB)

### Set D: Luminous Geometry
**Mood:** Gradients, glow effects, light-play, deep space, Moholy-Nagy digital.
**Best for:** The most modern/dramatic option. Good for dark mode, hero sections, achievement moments.
**Palette:** Glow Red `#FF2040`, Electric Blue `#0080FF`, Cyan `#00C0D0`, Violet `#6040C0`.
**Files:** 108 assets (1180 KB)

---

## File Structure

```
client/src/assets/visual-sets/
├── PHILOSOPHY.md                    # Design philosophy document
├── INTEGRATION.md                   # This file
├── set-a-classical-bauhaus/
│   ├── bg-light.png                 # 512x512 background
│   ├── bg-dark.png                  # 512x512 dark background
│   ├── texture-noise.png            # Overlay texture
│   ├── texture-dots.png
│   ├── texture-crosshatch.png
│   ├── hero-pattern.png             # 1024x512 hero composition
│   ├── particles/                   # Floating shapes (32/48/64px + 128px ghost)
│   ├── icons/                       # UI icons (64px, 4 color variants each)
│   ├── buttons/                     # Button states (normal/hover/active)
│   ├── gradients/                   # Radial + linear gradients (512x512)
│   └── decorative/                  # Ghost shapes, color strips, corner marks
├── set-b-organic-bauhaus/...
├── set-c-structural-depth/...
└── set-d-luminous-geometry/...
```

---

## How to Use

### 1. Backgrounds as CSS background-image
```css
.light-mode {
  background-image: url('./assets/visual-sets/set-a-classical-bauhaus/bg-light.png');
  background-size: 512px;
  background-repeat: repeat;
}
.dark-mode {
  background-image: url('./assets/visual-sets/set-a-classical-bauhaus/bg-dark.png');
  background-size: 512px;
  background-repeat: repeat;
}
```

### 2. Textures as Overlay
```css
.texture-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('./assets/visual-sets/set-a-classical-bauhaus/texture-noise.png');
  background-size: 512px;
  opacity: 0.06;
  pointer-events: none;
  z-index: 9998;
}
```

### 3. Ghost Particles for AmbientBackground
Replace the canvas-based AmbientBackground with positioned `<img>` elements using the ghost particles:
```jsx
<img src="./assets/visual-sets/set-a-classical-bauhaus/particles/ghost-circle-red-128.png"
     className="absolute animate-drift" style={{ opacity: 0.12 }} />
```

### 4. Gradients as Section Overlays
```css
.hero-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('./assets/visual-sets/set-d-luminous-geometry/gradients/grad-glow-blue.png');
  background-size: cover;
  opacity: 0.3;
  pointer-events: none;
}
```

### 5. Color Strips as Dividers
```jsx
<img src="./assets/visual-sets/set-a-classical-bauhaus/decorative/color-strip.png"
     className="w-full h-2" alt="" />
```

### 6. Icons in UI
```jsx
<img src="./assets/visual-sets/set-a-classical-bauhaus/icons/learn-red.png"
     className="w-8 h-8" alt="Learn" />
```

### 7. Buttons as Background Images (for complex states)
```css
.cta-button {
  background: url('./assets/visual-sets/set-d-luminous-geometry/buttons/btn-glow-red-normal.png') center/contain no-repeat;
}
.cta-button:hover {
  background-image: url('./assets/visual-sets/set-d-luminous-geometry/buttons/btn-glow-red-hover.png');
}
```

---

## Recommended Set for LearnMosaic

**Set A (Classical Bauhaus)** is the natural fit — it matches the existing Kandinsky color-shape grammar, the primary color palette, and the sharp-edge Bauhaus aesthetic already in the codebase.

**Set D (Luminous Geometry)** is the strongest for dark mode and hero sections — the glow effects and deep-space backgrounds would dramatically improve the "something is missing" feeling.

**Hybrid approach:** Use Set A for structure (icons, buttons, particles) and Set D for atmosphere (backgrounds, gradients, hero patterns). This gives the geometric rigor of Bauhaus with the depth and life of luminous design.

---

## Stats

| Category | Set A | Set B | Set C | Set D |
|----------|-------|-------|-------|-------|
| Backgrounds | 2 | 2 | 2 | 2 |
| Textures | 3 | 3 | 3 | 3 |
| Particles | 51 | 42 | 42 | 42 |
| Icons | 48 | 40 | 40 | 40 |
| Buttons | 15 | 15 | 15 | 15 |
| Gradients | 6 | 6 | 6 | 6 |
| Decorative | 9 | 5 | 5 | 5 |
| Hero | 1 | 1 | 1 | 1 |
| **Total** | **131** | **108** | **108** | **108** |
