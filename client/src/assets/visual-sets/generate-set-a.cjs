/**
 * SET A: CLASSICAL BAUHAUS
 * Pure geometry, primary colors, sharp edges, hard shadows.
 * The foundational vocabulary — circles, squares, triangles in red/blue/yellow/black.
 */
const { createCanvas, COLORS, saveCanvas, loadFonts, OUTPUT_BASE } = require('./generate-utils.cjs');
const path = require('path');

const SIZE = 512;
const SET_DIR = path.join(OUTPUT_BASE, 'set-a-classical-bauhaus');

function generateAll() {
  loadFonts();
  console.log('\n=== SET A: Classical Bauhaus ===\n');
  generateBackgrounds();
  generateTextures();
  generateParticles();
  generateIcons();
  generateButtons();
  generateGradients();
  generateDecorativeShapes();
  generateHeroPattern();
  console.log('\nSet A complete.\n');
}

// ─── BACKGROUNDS ───────────────────────────────────────────────

function generateBackgrounds() {
  console.log('Backgrounds...');

  // Light background — warm off-white with subtle grid
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  ctx.fillStyle = COLORS.warmWhite;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= SIZE; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  // Corner accent — small red square
  ctx.fillStyle = COLORS.red;
  ctx.globalAlpha = 0.08;
  ctx.fillRect(SIZE - 64, 0, 64, 64);
  ctx.globalAlpha = 1;

  saveCanvas(c, path.join(SET_DIR, 'bg-light.png'));

  // Dark background — near-black with subtle blue undertone
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.fillStyle = COLORS.nearBlack;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= SIZE; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  // Corner accent — small blue square
  ctx.fillStyle = COLORS.blue;
  ctx.globalAlpha = 0.06;
  ctx.fillRect(SIZE - 64, 0, 64, 64);
  ctx.globalAlpha = 1;

  saveCanvas(c, path.join(SET_DIR, 'bg-dark.png'));
}

// ─── TEXTURES ──────────────────────────────────────────────────

function generateTextures() {
  console.log('Textures...');

  // Noise texture — fine grain
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  const imageData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.random() * 255;
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 12; // ~5% opacity
  }
  ctx.putImageData(imageData, 0, 0);
  saveCanvas(c, path.join(SET_DIR, 'texture-noise.png'));

  // Dot grid texture
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let x = 8; x < SIZE; x += 16) {
    for (let y = 8; y < SIZE; y += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-dots.png'));

  // Crosshatch texture
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 0.5;
  for (let i = -SIZE; i < SIZE * 2; i += 12) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + SIZE, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + SIZE, 0); ctx.lineTo(i, SIZE); ctx.stroke();
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-crosshatch.png'));
}

// ─── PARTICLES ─────────────────────────────────────────────────

function generateParticles() {
  console.log('Particles...');
  const shapes = [
    { name: 'circle-red', draw: drawCircle, color: COLORS.red },
    { name: 'circle-blue', draw: drawCircle, color: COLORS.blue },
    { name: 'circle-yellow', draw: drawCircle, color: COLORS.yellow },
    { name: 'circle-black', draw: drawCircle, color: COLORS.black },
    { name: 'square-red', draw: drawSquare, color: COLORS.red },
    { name: 'square-blue', draw: drawSquare, color: COLORS.blue },
    { name: 'square-yellow', draw: drawSquare, color: COLORS.yellow },
    { name: 'square-black', draw: drawSquare, color: COLORS.black },
    { name: 'triangle-red', draw: drawTriangle, color: COLORS.red },
    { name: 'triangle-blue', draw: drawTriangle, color: COLORS.blue },
    { name: 'triangle-yellow', draw: drawTriangle, color: COLORS.yellow },
    { name: 'diamond-red', draw: drawDiamond, color: COLORS.red },
    { name: 'diamond-blue', draw: drawDiamond, color: COLORS.blue },
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

  // Ghost variants (low opacity for background use)
  shapes.slice(0, 8).forEach(({ name, draw, color }) => {
    const c = createCanvas(128, 128);
    const ctx = c.getContext('2d');
    ctx.globalAlpha = 0.12;
    draw(ctx, 128, color);
    ctx.globalAlpha = 1;
    saveCanvas(c, path.join(SET_DIR, 'particles', `ghost-${name}-128.png`));
  });
}

function drawCircle(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawSquare(ctx, size, color) {
  ctx.fillStyle = color;
  const pad = size * 0.12;
  ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);
}

function drawTriangle(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 0.1);
  ctx.lineTo(size * 0.9, size * 0.9);
  ctx.lineTo(size * 0.1, size * 0.9);
  ctx.closePath();
  ctx.fill();
}

function drawDiamond(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 0.08);
  ctx.lineTo(size * 0.92, size / 2);
  ctx.lineTo(size / 2, size * 0.92);
  ctx.lineTo(size * 0.08, size / 2);
  ctx.closePath();
  ctx.fill();
}

// ─── ICONS ─────────────────────────────────────────────────────

function generateIcons() {
  console.log('Icons...');
  const iconSize = 64;
  const stroke = 3;

  const icons = [
    { name: 'learn', draw: drawLearnIcon },
    { name: 'progress', draw: drawProgressIcon },
    { name: 'achievement', draw: drawAchievementIcon },
    { name: 'brain', draw: drawBrainIcon },
    { name: 'book', draw: drawBookIcon },
    { name: 'clock', draw: drawClockIcon },
    { name: 'star', draw: drawStarIcon },
    { name: 'arrow-right', draw: drawArrowRight },
    { name: 'plus', draw: drawPlus },
    { name: 'check', draw: drawCheck },
    { name: 'settings', draw: drawSettingsIcon },
    { name: 'search', draw: drawSearchIcon },
  ];

  const colors = [COLORS.black, COLORS.red, COLORS.blue, COLORS.yellow];

  icons.forEach(({ name, draw }) => {
    colors.forEach(color => {
      const c = createCanvas(iconSize, iconSize);
      const ctx = c.getContext('2d');
      const colorName = color === COLORS.black ? 'black' :
                        color === COLORS.red ? 'red' :
                        color === COLORS.blue ? 'blue' : 'yellow';
      draw(ctx, iconSize, color, stroke);
      saveCanvas(c, path.join(SET_DIR, 'icons', `${name}-${colorName}.png`));
    });
  });
}

function drawLearnIcon(ctx, s, color, sw) {
  // Circle with inner triangle — knowledge + direction
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(s / 2, s * 0.25);
  ctx.lineTo(s * 0.62, s * 0.55);
  ctx.lineTo(s * 0.38, s * 0.55);
  ctx.closePath();
  ctx.fill();
}

function drawProgressIcon(ctx, s, color, sw) {
  // Three ascending bars
  ctx.fillStyle = color;
  const barW = s * 0.15;
  const gap = s * 0.06;
  const baseY = s * 0.75;
  const heights = [s * 0.2, s * 0.35, s * 0.5];
  const startX = s * 0.2;
  heights.forEach((h, i) => {
    ctx.fillRect(startX + i * (barW + gap), baseY - h, barW, h);
  });
}

function drawAchievementIcon(ctx, s, color, sw) {
  // Star shape
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = s / 2 + Math.cos(angle) * s * 0.35;
    const y = s / 2 + Math.sin(angle) * s * 0.35;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawBrainIcon(ctx, s, color, sw) {
  // Two overlapping circles — mind/idea
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.beginPath();
  ctx.arc(s * 0.4, s / 2, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.6, s / 2, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBookIcon(ctx, s, color, sw) {
  // Open book shape — two rectangles with spine
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.fillStyle = color;
  // Left page
  ctx.fillRect(s * 0.15, s * 0.2, s * 0.32, s * 0.6);
  // Right page
  ctx.fillRect(s * 0.53, s * 0.2, s * 0.32, s * 0.6);
  // Spine line
  ctx.beginPath();
  ctx.moveTo(s / 2, s * 0.18);
  ctx.lineTo(s / 2, s * 0.82);
  ctx.stroke();
}

function drawClockIcon(ctx, s, color, sw) {
  // Circle with hands
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  // Hour hand
  ctx.beginPath();
  ctx.moveTo(s / 2, s / 2);
  ctx.lineTo(s / 2, s * 0.32);
  ctx.stroke();
  // Minute hand
  ctx.beginPath();
  ctx.moveTo(s / 2, s / 2);
  ctx.lineTo(s * 0.62, s / 2);
  ctx.stroke();
}

function drawStarIcon(ctx, s, color, sw) {
  // 4-point star — diamond with concave sides
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(s / 2, s * 0.1);
  ctx.lineTo(s * 0.58, s * 0.42);
  ctx.lineTo(s * 0.9, s / 2);
  ctx.lineTo(s * 0.58, s * 0.58);
  ctx.lineTo(s / 2, s * 0.9);
  ctx.lineTo(s * 0.42, s * 0.58);
  ctx.lineTo(s * 0.1, s / 2);
  ctx.lineTo(s * 0.42, s * 0.42);
  ctx.closePath();
  ctx.fill();
}

function drawArrowRight(ctx, s, color, sw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.lineCap = 'round';
  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(s * 0.15, s / 2);
  ctx.lineTo(s * 0.7, s / 2);
  ctx.stroke();
  // Arrow head
  ctx.beginPath();
  ctx.moveTo(s * 0.55, s * 0.3);
  ctx.lineTo(s * 0.75, s / 2);
  ctx.lineTo(s * 0.55, s * 0.7);
  ctx.stroke();
}

function drawPlus(ctx, s, color, sw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s / 2, s * 0.2);
  ctx.lineTo(s / 2, s * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.2, s / 2);
  ctx.lineTo(s * 0.8, s / 2);
  ctx.stroke();
}

function drawCheck(ctx, s, color, sw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = sw + 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 0.2, s * 0.5);
  ctx.lineTo(s * 0.4, s * 0.68);
  ctx.lineTo(s * 0.78, s * 0.32);
  ctx.stroke();
}

function drawSettingsIcon(ctx, s, color, sw) {
  // Gear = circle with notches
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  // Outer notches
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const x1 = s / 2 + Math.cos(angle) * s * 0.28;
    const y1 = s / 2 + Math.sin(angle) * s * 0.28;
    const x2 = s / 2 + Math.cos(angle) * s * 0.38;
    const y2 = s / 2 + Math.sin(angle) * s * 0.38;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawSearchIcon(ctx, s, color, sw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  // Magnifying glass circle
  ctx.beginPath();
  ctx.arc(s * 0.42, s * 0.42, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  // Handle
  ctx.beginPath();
  ctx.moveTo(s * 0.58, s * 0.58);
  ctx.lineTo(s * 0.78, s * 0.78);
  ctx.stroke();
}

// ─── BUTTONS ───────────────────────────────────────────────────

function generateButtons() {
  console.log('Buttons...');
  const btnW = 200;
  const btnH = 56;

  const variants = [
    { name: 'btn-primary', bg: COLORS.red, text: COLORS.white, border: COLORS.black },
    { name: 'btn-secondary', bg: 'transparent', text: COLORS.black, border: COLORS.black },
    { name: 'btn-accent', bg: COLORS.blue, text: COLORS.white, border: COLORS.black },
    { name: 'btn-yellow', bg: COLORS.yellow, text: COLORS.black, border: COLORS.black },
    { name: 'btn-ghost', bg: 'transparent', text: COLORS.black, border: 'transparent' },
  ];

  const states = ['normal', 'hover', 'active'];

  variants.forEach(v => {
    states.forEach(state => {
      const c = createCanvas(btnW, btnH);
      const ctx = c.getContext('2d');

      // Shadow offset
      if (state === 'normal') {
        ctx.fillStyle = COLORS.black;
        ctx.fillRect(4, 4, btnW, btnH);
      } else if (state === 'hover') {
        ctx.fillStyle = COLORS.black;
        ctx.fillRect(6, 6, btnW, btnH);
      }

      // Button fill
      ctx.fillStyle = v.bg;
      if (state === 'active') {
        ctx.fillRect(2, 2, btnW - 2, btnH - 2);
      } else {
        ctx.fillRect(0, 0, btnW, btnH);
      }

      // Border
      if (v.border !== 'transparent') {
        ctx.strokeStyle = v.border;
        ctx.lineWidth = 2;
        if (state === 'active') {
          ctx.strokeRect(2, 2, btnW - 2, btnH - 2);
        } else {
          ctx.strokeRect(0, 0, btnW, btnH);
        }
      }

      // Text
      ctx.fillStyle = v.text;
      ctx.font = '600 14px Jost, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = state === 'normal' ? 'LEARN' : state === 'hover' ? 'LEARN →' : 'LEARN';
      ctx.fillText(label, btnW / 2, btnH / 2 + 1);

      saveCanvas(c, path.join(SET_DIR, 'buttons', `${v.name}-${state}.png`));
    });
  });
}

// ─── GRADIENTS ─────────────────────────────────────────────────

function generateGradients() {
  console.log('Gradients...');

  const gradients = [
    { name: 'grad-red-radial', type: 'radial', colors: [COLORS.red, 'transparent'] },
    { name: 'grad-blue-radial', type: 'radial', colors: [COLORS.blue, 'transparent'] },
    { name: 'grad-yellow-radial', type: 'radial', colors: [COLORS.yellow, 'transparent'] },
    { name: 'grad-warm', type: 'linear', colors: [COLORS.red, COLORS.yellow] },
    { name: 'grad-cool', type: 'linear', colors: [COLORS.blue, COLORS.red] },
    { name: 'grad-depth', type: 'linear', colors: [COLORS.blueDark, COLORS.nearBlack] },
  ];

  gradients.forEach(({ name, type, colors }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');

    if (type === 'radial') {
      const grad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, SIZE, SIZE);

    saveCanvas(c, path.join(SET_DIR, 'gradients', `${name}.png`));
  });
}

// ─── DECORATIVE SHAPES ─────────────────────────────────────────

function generateDecorativeShapes() {
  console.log('Decorative shapes...');

  // Large ghost shapes for backgrounds
  const largeShapes = [
    { name: 'ghost-circle-red', draw: (ctx, s) => { ctx.fillStyle = COLORS.red; ctx.globalAlpha = 0.06; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.42, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }},
    { name: 'ghost-circle-blue', draw: (ctx, s) => { ctx.fillStyle = COLORS.blue; ctx.globalAlpha = 0.06; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.42, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }},
    { name: 'ghost-square-red', draw: (ctx, s) => { ctx.fillStyle = COLORS.red; ctx.globalAlpha = 0.06; ctx.fillRect(s*0.12, s*0.12, s*0.76, s*0.76); ctx.globalAlpha = 1; }},
    { name: 'ghost-triangle-yellow', draw: (ctx, s) => { ctx.fillStyle = COLORS.yellow; ctx.globalAlpha = 0.08; ctx.beginPath(); ctx.moveTo(s/2, s*0.1); ctx.lineTo(s*0.9, s*0.9); ctx.lineTo(s*0.1, s*0.9); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }},
  ];

  largeShapes.forEach(({ name, draw }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    draw(ctx, SIZE);
    saveCanvas(c, path.join(SET_DIR, 'decorative', `${name}.png`));
  });

  // Border patterns — horizontal color strip
  const stripH = 8;
  const strip = createCanvas(SIZE, stripH);
  const stripCtx = strip.getContext('2d');
  const segW = SIZE / 4;
  [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.black].forEach((color, i) => {
    stripCtx.fillStyle = color;
    stripCtx.fillRect(i * segW, 0, segW, stripH);
  });
  saveCanvas(strip, path.join(SET_DIR, 'decorative', 'color-strip.png'));

  // Corner marks — L-shaped corner rules
  const cornerSize = 48;
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  corners.forEach(pos => {
    const c = createCanvas(cornerSize, cornerSize);
    const ctx = c.getContext('2d');
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (pos === 'top-left') { ctx.moveTo(0, cornerSize); ctx.lineTo(0, 0); ctx.lineTo(cornerSize, 0); }
    else if (pos === 'top-right') { ctx.moveTo(0, 0); ctx.lineTo(cornerSize, 0); ctx.lineTo(cornerSize, cornerSize); }
    else if (pos === 'bottom-left') { ctx.moveTo(0, 0); ctx.lineTo(0, cornerSize); ctx.lineTo(cornerSize, cornerSize); }
    else { ctx.moveTo(cornerSize, 0); ctx.lineTo(cornerSize, cornerSize); ctx.lineTo(0, cornerSize); }
    ctx.stroke();
    saveCanvas(c, path.join(SET_DIR, 'decorative', `corner-${pos}.png`));
  });
}

// ─── HERO PATTERN ──────────────────────────────────────────────

function generateHeroPattern() {
  console.log('Hero pattern...');

  // Kandinsky-inspired composition: overlapping geometric forms
  const c = createCanvas(1024, 512);
  const ctx = c.getContext('2d');

  // Base
  ctx.fillStyle = COLORS.warmWhite;
  ctx.fillRect(0, 0, 1024, 512);

  // Grid overlay
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
  }
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  // Large blue circle — left-center
  ctx.fillStyle = COLORS.blue;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(320, 280, 140, 0, Math.PI * 2);
  ctx.fill();

  // Red square — overlapping
  ctx.fillStyle = COLORS.red;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(380, 120, 180, 180);

  // Yellow triangle — right side
  ctx.fillStyle = COLORS.yellow;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(720, 80);
  ctx.lineTo(920, 380);
  ctx.lineTo(520, 380);
  ctx.closePath();
  ctx.fill();

  // Small black circle — accent
  ctx.fillStyle = COLORS.black;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(680, 160, 35, 0, Math.PI * 2);
  ctx.fill();

  // Thin black lines — structural
  ctx.strokeStyle = COLORS.black;
  ctx.globalAlpha = 0.15;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 350); ctx.lineTo(1024, 350); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(500, 0); ctx.lineTo(500, 512); ctx.stroke();

  // Red circle — small accent
  ctx.fillStyle = COLORS.red;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(180, 120, 28, 0, Math.PI * 2);
  ctx.fill();

  // Blue triangle — tiny
  ctx.fillStyle = COLORS.blue;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(880, 60);
  ctx.lineTo(920, 100);
  ctx.lineTo(840, 100);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  saveCanvas(c, path.join(SET_DIR, 'hero-pattern.png'));
}

generateAll();
