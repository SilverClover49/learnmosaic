/**
 * SET D: LUMINOUS GEOMETRY
 * Gradients, glow effects, light-play, transparency.
 * Moholy-Nagy meets digital screens — light as material, depth through luminosity.
 */
const { createCanvas, COLORS, saveCanvas, loadFonts, OUTPUT_BASE } = require('./generate-utils.cjs');
const path = require('path');

const SIZE = 512;
const SET_DIR = path.join(OUTPUT_BASE, 'set-d-luminous-geometry');

const P = {
  ...COLORS,
  glowRed: '#FF2040',
  glowBlue: '#2060FF',
  glowYellow: '#FFD020',
  electricBlue: '#0080FF',
  violet: '#6040C0',
  cyan: '#00C0D0',
  warmGlow: '#FF8040',
  deepSpace: '#080818',
  midnightBlue: '#0A1030',
  softWhite: '#F8F8FF',
};

function generateAll() {
  loadFonts();
  console.log('\n=== SET D: Luminous Geometry ===\n');
  generateBackgrounds();
  generateTextures();
  generateParticles();
  generateIcons();
  generateButtons();
  generateGradients();
  generateDecorativeShapes();
  generateHeroPattern();
  console.log('\nSet D complete.\n');
}

function generateBackgrounds() {
  console.log('Backgrounds...');

  // Light — soft white with radial glow
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  ctx.fillStyle = P.softWhite;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle radial glow from center
  const grad = ctx.createRadialGradient(SIZE/2, SIZE/2, 0, SIZE/2, SIZE/2, SIZE * 0.6);
  grad.addColorStop(0, 'rgba(244,211,94,0.04)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Thin grid
  ctx.strokeStyle = 'rgba(0,0,0,0.025)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= SIZE; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  saveCanvas(c, path.join(SET_DIR, 'bg-light.png'));

  // Dark — deep space with color bleed
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.fillStyle = P.deepSpace;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Blue glow from bottom-left
  const g1 = ctx.createRadialGradient(0, SIZE, 0, 0, SIZE, SIZE * 0.7);
  g1.addColorStop(0, 'rgba(32,96,255,0.08)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Red glow from top-right
  const g2 = ctx.createRadialGradient(SIZE, 0, 0, SIZE, 0, SIZE * 0.5);
  g2.addColorStop(0, 'rgba(255,32,64,0.05)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Thin bright grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= SIZE; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  saveCanvas(c, path.join(SET_DIR, 'bg-dark.png'));
}

function generateTextures() {
  console.log('Textures...');

  // Luminous noise
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  const imgData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 200 + Math.random() * 55;
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = Math.min(255, v + 20);
    imgData.data[i + 3] = 8;
  }
  ctx.putImageData(imgData, 0, 0);
  saveCanvas(c, path.join(SET_DIR, 'texture-luminous.png'));

  // Light rays
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(SIZE / 2, SIZE / 2);
    ctx.lineTo(SIZE / 2 + Math.cos(angle) * SIZE, SIZE / 2 + Math.sin(angle) * SIZE);
    ctx.stroke();
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-rays.png'));

  // Soft dot matrix
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  for (let x = 8; x < SIZE; x += 16) {
    for (let y = 8; y < SIZE; y += 16) {
      const brightness = 0.02 + Math.sin(x * 0.01) * Math.cos(y * 0.01) * 0.015;
      ctx.fillStyle = `rgba(255,255,255,${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-dot-matrix.png'));
}

function generateParticles() {
  console.log('Particles...');
  const shapes = [
    { name: 'glow-circle-red', draw: drawGlowCircle, color: P.glowRed },
    { name: 'glow-circle-blue', draw: drawGlowCircle, color: P.glowBlue },
    { name: 'glow-circle-yellow', draw: drawGlowCircle, color: P.glowYellow },
    { name: 'glow-circle-cyan', draw: drawGlowCircle, color: P.cyan },
    { name: 'ring-red', draw: drawRing, color: P.glowRed },
    { name: 'ring-blue', draw: drawRing, color: P.glowBlue },
    { name: 'ring-yellow', draw: drawRing, color: P.glowYellow },
    { name: 'prism-red', draw: drawPrism, color: P.glowRed },
    { name: 'prism-blue', draw: drawPrism, color: P.glowBlue },
    { name: 'ray-white', draw: drawRay, color: P.softWhite },
  ];

  const sizes = [32, 48, 64];

  shapes.forEach(({ name, draw, color }) => {
    sizes.forEach(size => {
      const c = createCanvas(size, size);
      const ctx = c.getContext('2d');
      draw(ctx, size, color);
      saveCanvas(c, path.join(SET_DIR, 'particles', `${name}-${size}.png`));
    });
  });

  // Ghosts
  shapes.slice(0, 6).forEach(({ name, draw, color }) => {
    const c = createCanvas(128, 128);
    const ctx = c.getContext('2d');
    ctx.globalAlpha = 0.15;
    draw(ctx, 128, color);
    ctx.globalAlpha = 1;
    saveCanvas(c, path.join(SET_DIR, 'particles', `ghost-${name}-128.png`));
  });
}

function drawGlowCircle(ctx, s, color) {
  // Outer glow
  const grad = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s * 0.45);
  grad.addColorStop(0, color);
  grad.addColorStop(0.5, color + '80');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
  // Core
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(s/2, s/2, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRing(ctx, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(s/2, s/2, s * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(s/2, s/2, s * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPrism(ctx, s, color) {
  // Triangle with gradient fill
  const grad = ctx.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, color);
  grad.addColorStop(1, color + '40');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(s/2, s * 0.1);
  ctx.lineTo(s * 0.9, s * 0.9);
  ctx.lineTo(s * 0.1, s * 0.9);
  ctx.closePath();
  ctx.fill();
}

function drawRay(ctx, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(s * 0.1, s * 0.9);
  ctx.lineTo(s * 0.9, s * 0.1);
  ctx.stroke();
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(s * 0.2, s * 0.9);
  ctx.lineTo(s * 0.9, s * 0.2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function generateIcons() {
  console.log('Icons...');
  const iconSize = 64;
  const colors = ['#FFFFFF', P.glowRed, P.glowBlue, P.glowYellow];

  const icons = [
    { name: 'learn', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.32, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle = c; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.18, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }},
    { name: 'progress', draw: (ctx, s, c) => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.3, -Math.PI*0.7, Math.PI*0.5); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.06, 0, Math.PI*2); ctx.fill(); }},
    { name: 'spark', draw: (ctx, s, c) => { ctx.fillStyle = c; for (let i = 0; i < 4; i++) { const a = (i/4)*Math.PI*2 - Math.PI/4; ctx.beginPath(); ctx.moveTo(s/2, s/2); ctx.lineTo(s/2+Math.cos(a)*s*0.35, s/2+Math.sin(a)*s*0.35); ctx.lineTo(s/2+Math.cos(a+0.3)*s*0.2, s/2+Math.sin(a+0.3)*s*0.2); ctx.closePath(); ctx.fill(); } }},
    { name: 'lens', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); ctx.arc(s*0.4, s/2, s*0.25, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(s*0.6, s/2, s*0.25, 0, Math.PI*2); ctx.stroke(); }},
    { name: 'wave', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); for (let x = s*0.1; x < s*0.9; x += 2) { const y = s/2 + Math.sin((x/s)*Math.PI*4)*s*0.15; if (x === s*0.1) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }},
    { name: 'orbit', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(s/2, s/2, s*0.35, s*0.15, -0.3, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s*0.7, s*0.35, s*0.06, 0, Math.PI*2); ctx.fill(); }},
    { name: 'arrow-right', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); ctx.moveTo(s*0.15, s/2); ctx.lineTo(s*0.7, s/2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.55, s*0.3); ctx.lineTo(s*0.75, s/2); ctx.lineTo(s*0.55, s*0.7); ctx.stroke(); }},
    { name: 'plus', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); ctx.moveTo(s/2, s*0.2); ctx.lineTo(s/2, s*0.8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.2, s/2); ctx.lineTo(s*0.8, s/2); ctx.stroke(); }},
    { name: 'check', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw+1; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(s*0.2, s*0.5); ctx.lineTo(s*0.4, s*0.68); ctx.lineTo(s*0.78, s*0.32); ctx.stroke(); }},
    { name: 'star', draw: (ctx, s, c) => { ctx.fillStyle = c; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i/6)*Math.PI*2 - Math.PI/2; const r = i % 2 === 0 ? s*0.35 : s*0.15; const x = s/2+Math.cos(a)*r; const y = s/2+Math.sin(a)*r; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); }},
  ];

  icons.forEach(({ name, draw }) => {
    colors.forEach(color => {
      const c = createCanvas(iconSize, iconSize);
      const ctx = c.getContext('2d');
      const cn = color === '#FFFFFF' ? 'white' : color === P.glowRed ? 'red' : color === P.glowBlue ? 'blue' : 'yellow';
      draw(ctx, iconSize, color, 2);
      saveCanvas(c, path.join(SET_DIR, 'icons', `${name}-${cn}.png`));
    });
  });
}

function generateButtons() {
  console.log('Buttons...');
  const btnW = 200, btnH = 56;

  const variants = [
    { name: 'btn-glow-red', bg: P.glowRed, text: '#fff', glow: P.glowRed },
    { name: 'btn-glow-blue', bg: P.glowBlue, text: '#fff', glow: P.glowBlue },
    { name: 'btn-glow-yellow', bg: P.glowYellow, text: COLORS.black, glow: P.glowYellow },
    { name: 'btn-glass', bg: 'rgba(255,255,255,0.08)', text: '#fff', glow: 'rgba(255,255,255,0.2)' },
    { name: 'btn-ghost', bg: 'transparent', text: '#fff', glow: 'transparent' },
  ];

  const states = ['normal', 'hover', 'active'];

  variants.forEach(v => {
    states.forEach(state => {
      const c = createCanvas(btnW, btnH);
      const ctx = c.getContext('2d');

      // Glow shadow
      if (state !== 'active' && v.glow !== 'transparent') {
        ctx.shadowColor = v.glow;
        ctx.shadowBlur = state === 'hover' ? 20 : 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Button
      ctx.fillStyle = v.bg;
      const rad = 28;
      const off = state === 'active' ? 1 : 0;
      ctx.beginPath();
      ctx.roundRect(off, off, btnW - off, btnH - off, rad);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Border (glass variant)
      if (v.name === 'btn-glass') {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(off, off, btnW - off, btnH - off, rad);
        ctx.stroke();
      }

      // Text
      ctx.fillStyle = v.text;
      ctx.font = '500 14px Jost, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = state === 'hover' ? 'LEARN →' : 'LEARN';
      ctx.fillText(label, btnW / 2, btnH / 2 + 1);

      saveCanvas(c, path.join(SET_DIR, 'buttons', `${v.name}-${state}.png`));
    });
  });
}

function generateGradients() {
  console.log('Gradients...');
  const gradients = [
    { name: 'grad-glow-red', draw: (ctx, s) => { const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); g.addColorStop(0, P.glowRed); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0,0,s,s); }},
    { name: 'grad-glow-blue', draw: (ctx, s) => { const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); g.addColorStop(0, P.glowBlue); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0,0,s,s); }},
    { name: 'grad-glow-yellow', draw: (ctx, s) => { const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); g.addColorStop(0, P.glowYellow); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0,0,s,s); }},
    { name: 'grad-spectrum', draw: (ctx, s) => { const g = ctx.createLinearGradient(0,0,s,s); g.addColorStop(0, P.glowRed); g.addColorStop(0.33, P.glowYellow); g.addColorStop(0.66, P.glowBlue); g.addColorStop(1, P.violet); ctx.fillStyle = g; ctx.fillRect(0,0,s,s); }},
    { name: 'grad-aurora', draw: (ctx, s) => { const g = ctx.createLinearGradient(0,0,s,0); g.addColorStop(0, P.electricBlue); g.addColorStop(0.5, P.cyan); g.addColorStop(1, P.violet); ctx.fillStyle = g; ctx.fillRect(0,0,s,s); }},
    { name: 'grad-deep', draw: (ctx, s) => { const g = ctx.createLinearGradient(0,s,0,0); g.addColorStop(0, P.deepSpace); g.addColorStop(1, P.midnightBlue); ctx.fillStyle = g; ctx.fillRect(0,0,s,s); }},
  ];

  gradients.forEach(({ name, draw }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    draw(ctx, SIZE);
    saveCanvas(c, path.join(SET_DIR, 'gradients', `${name}.png`));
  });
}

function generateDecorativeShapes() {
  console.log('Decorative shapes...');

  // Glow ghosts
  [
    { name: 'ghost-glow-red', color: P.glowRed },
    { name: 'ghost-glow-blue', color: P.glowBlue },
    { name: 'ghost-glow-yellow', color: P.glowYellow },
    { name: 'ghost-ring-white', color: P.softWhite },
  ].forEach(({ name, color }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    drawGlowCircle(ctx, SIZE, color);
    saveCanvas(c, path.join(SET_DIR, 'decorative', `${name}.png`));
  });

  // Spectrum strip
  const strip = createCanvas(SIZE, 8);
  const sctx = strip.getContext('2d');
  const grad = sctx.createLinearGradient(0, 0, SIZE, 0);
  grad.addColorStop(0, P.glowRed);
  grad.addColorStop(0.25, P.glowYellow);
  grad.addColorStop(0.5, P.glowBlue);
  grad.addColorStop(0.75, P.cyan);
  grad.addColorStop(1, P.violet);
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, SIZE, 8);
  saveCanvas(strip, path.join(SET_DIR, 'decorative', 'color-strip.png'));
}

function generateHeroPattern() {
  console.log('Hero pattern...');
  const c = createCanvas(1024, 512);
  const ctx = c.getContext('2d');

  // Deep space base
  ctx.fillStyle = P.deepSpace;
  ctx.fillRect(0, 0, 1024, 512);

  // Ambient glow orbs
  const orbs = [
    { x: 200, y: 250, r: 200, color: P.glowBlue },
    { x: 600, y: 200, r: 180, color: P.glowRed },
    { x: 850, y: 350, r: 160, color: P.glowYellow },
  ];

  orbs.forEach(({ x, y, r, color }) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color + '30');
    g.addColorStop(0.5, color + '10');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
  }
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  // Central geometric cluster
  // Large blue circle
  ctx.fillStyle = P.glowBlue;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(400, 260, 120, 0, Math.PI * 2);
  ctx.fill();

  // Red triangle
  ctx.fillStyle = P.glowRed;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(580, 100);
  ctx.lineTo(780, 360);
  ctx.lineTo(380, 360);
  ctx.closePath();
  ctx.fill();

  // Yellow square
  ctx.fillStyle = P.glowYellow;
  ctx.globalAlpha = 0.2;
  ctx.fillRect(620, 140, 160, 160);

  // Thin white orbit rings
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(500, 260, 300, 100, -0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Small accent dots
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.5;
  [
    { x: 320, y: 160, r: 3 },
    { x: 750, y: 120, r: 2 },
    { x: 180, y: 380, r: 2.5 },
    { x: 900, y: 250, r: 2 },
  ].forEach(({ x, y, r }) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  saveCanvas(c, path.join(SET_DIR, 'hero-pattern.png'));
}

generateAll();
