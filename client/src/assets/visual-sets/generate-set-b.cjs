/**
 * SET B: ORGANIC BAUHAUS
 * Softened geometry, secondary palette, rounded forms, warmth.
 * Nature meets modernism — curves, muted tones, organic rhythm.
 */
const { createCanvas, COLORS, saveCanvas, loadFonts, OUTPUT_BASE } = require('./generate-utils.cjs');
const path = require('path');

const SIZE = 512;
const SET_DIR = path.join(OUTPUT_BASE, 'set-b-organic-bauhaus');

// Extended organic palette
const P = {
  ...COLORS,
  sage: '#7A9E7E',
  sageDark: '#5A7E5E',
  terracotta: '#C4704A',
  terracottaDark: '#9E5030',
  sand: '#D4C4A8',
  sandLight: '#E8DCC8',
  warmGray: '#A09890',
  dustyRose: '#C49090',
  olive: '#8B8B3A',
  cream: '#F5EDE0',
  linen: '#FAF5EE',
};

function generateAll() {
  loadFonts();
  console.log('\n=== SET B: Organic Bauhaus ===\n');
  generateBackgrounds();
  generateTextures();
  generateParticles();
  generateIcons();
  generateButtons();
  generateGradients();
  generateDecorativeShapes();
  generateHeroPattern();
  console.log('\nSet B complete.\n');
}

function generateBackgrounds() {
  console.log('Backgrounds...');

  // Light — warm linen with soft dot grid
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  ctx.fillStyle = P.linen;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Soft dots
  ctx.fillStyle = 'rgba(0,0,0,0.025)';
  for (let x = 12; x < SIZE; x += 24) {
    for (let y = 12; y < SIZE; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sage corner accent
  ctx.fillStyle = P.sage;
  ctx.globalAlpha = 0.06;
  ctx.beginPath();
  ctx.arc(SIZE, 0, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  saveCanvas(c, path.join(SET_DIR, 'bg-light.png'));

  // Dark — deep warm charcoal
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.fillStyle = '#1A1816';
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let x = 12; x < SIZE; x += 24) {
    for (let y = 12; y < SIZE; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = P.sage;
  ctx.globalAlpha = 0.04;
  ctx.beginPath();
  ctx.arc(SIZE, 0, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  saveCanvas(c, path.join(SET_DIR, 'bg-dark.png'));
}

function generateTextures() {
  console.log('Textures...');

  // Warm grain
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  const imgData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 180 + Math.random() * 75;
    imgData.data[i] = v;
    imgData.data[i + 1] = v * 0.95;
    imgData.data[i + 2] = v * 0.88;
    imgData.data[i + 3] = 10;
  }
  ctx.putImageData(imgData, 0, 0);
  saveCanvas(c, path.join(SET_DIR, 'texture-warm-grain.png'));

  // Organic blob pattern
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = 'rgba(122,158,126,0.04)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 20 + Math.random() * 60;
    ctx.beginPath();
    // Organic shape via bezier
    ctx.moveTo(x + r, y);
    ctx.bezierCurveTo(x + r, y - r * 0.6, x + r * 0.6, y - r, x, y - r);
    ctx.bezierCurveTo(x - r * 0.6, y - r, x - r, y - r * 0.6, x - r, y);
    ctx.bezierCurveTo(x - r, y + r * 0.6, x - r * 0.6, y + r, x, y + r);
    ctx.bezierCurveTo(x + r * 0.6, y + r, x + r, y + r * 0.6, x + r, y);
    ctx.fill();
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-organic.png'));

  // Soft line pattern
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  ctx.lineWidth = 0.8;
  for (let y = 0; y < SIZE; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < SIZE; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + y * 0.01) * 3);
    }
    ctx.stroke();
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-waves.png'));
}

function generateParticles() {
  console.log('Particles...');
  const shapes = [
    { name: 'circle-sage', draw: drawSoftCircle, color: P.sage },
    { name: 'circle-terracotta', draw: drawSoftCircle, color: P.terracotta },
    { name: 'circle-dustyrose', draw: drawSoftCircle, color: P.dustyRose },
    { name: 'circle-olive', draw: drawSoftCircle, color: P.olive },
    { name: 'rounded-sage', draw: drawRoundedSquare, color: P.sage },
    { name: 'rounded-terracotta', draw: drawRoundedSquare, color: P.terracotta },
    { name: 'rounded-sand', draw: drawRoundedSquare, color: P.sand },
    { name: 'oval-warmgray', draw: drawOval, color: P.warmGray },
    { name: 'blob-sage', draw: drawBlob, color: P.sage },
    { name: 'blob-terracotta', draw: drawBlob, color: P.terracotta },
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
    ctx.globalAlpha = 0.1;
    draw(ctx, 128, color);
    ctx.globalAlpha = 1;
    saveCanvas(c, path.join(SET_DIR, 'particles', `ghost-${name}-128.png`));
  });
}

function drawSoftCircle(ctx, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundedSquare(ctx, s, color) {
  ctx.fillStyle = color;
  const pad = s * 0.12;
  const r = s * 0.15;
  const x = pad, y = pad, w = s - pad * 2, h = s - pad * 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawOval(ctx, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(s / 2, s / 2, s * 0.42, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlob(ctx, s, color) {
  ctx.fillStyle = color;
  const cx = s / 2, cy = s / 2, r = s * 0.35;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const offset = r * (0.85 + Math.sin(i * 2.5) * 0.15);
    const x = cx + Math.cos(angle) * offset;
    const y = cy + Math.sin(angle) * offset;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevAngle = ((i - 1) / 8) * Math.PI * 2;
      const prevOffset = r * (0.85 + Math.sin((i - 1) * 2.5) * 0.15);
      const cpx = cx + Math.cos((prevAngle + angle) / 2) * offset * 1.1;
      const cpy = cy + Math.sin((prevAngle + angle) / 2) * offset * 1.1;
      ctx.quadraticCurveTo(cpx, cpy, x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function generateIcons() {
  console.log('Icons...');
  const iconSize = 64;
  const colors = [COLORS.black, P.sage, P.terracotta, P.warmGray];

  const icons = [
    { name: 'learn', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.32, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s/2, s*0.38, s*0.12, 0, Math.PI*2); ctx.fill(); }},
    { name: 'progress', draw: (ctx, s, c) => { ctx.fillStyle = c; for (let i = 0; i < 3; i++) { const r = s * (0.12 + i * 0.08); ctx.beginPath(); ctx.arc(s/2, s/2, r, 0, Math.PI * (1.5 + i * 0.3)); ctx.fill(); } }},
    { name: 'heart', draw: (ctx, s, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(s/2, s*0.75); ctx.bezierCurveTo(s*0.1, s*0.5, s*0.1, s*0.2, s/2, s*0.3); ctx.bezierCurveTo(s*0.9, s*0.2, s*0.9, s*0.5, s/2, s*0.75); ctx.fill(); }},
    { name: 'leaf', draw: (ctx, s, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(s/2, s*0.15); ctx.bezierCurveTo(s*0.85, s*0.25, s*0.85, s*0.75, s/2, s*0.85); ctx.bezierCurveTo(s*0.15, s*0.75, s*0.15, s*0.25, s/2, s*0.15); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(s/2, s*0.25); ctx.lineTo(s/2, s*0.75); ctx.stroke(); }},
    { name: 'sun', draw: (ctx, s, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s/2, s/2, s*0.18, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = (i/8)*Math.PI*2; ctx.beginPath(); ctx.moveTo(s/2+Math.cos(a)*s*0.25, s/2+Math.sin(a)*s*0.25); ctx.lineTo(s/2+Math.cos(a)*s*0.35, s/2+Math.sin(a)*s*0.35); ctx.stroke(); } }},
    { name: 'wave', draw: (ctx, s, c) => { ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); for (let x = s*0.1; x < s*0.9; x += 2) { const y = s/2 + Math.sin((x/s)*Math.PI*3)*s*0.12; if (x === s*0.1) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }},
    { name: 'diamond', draw: (ctx, s, c) => { ctx.fillStyle = c; const r = s * 0.3; ctx.beginPath(); ctx.moveTo(s/2, s/2-r); ctx.quadraticCurveTo(s/2+r*0.3, s/2-r*0.3, s/2+r, s/2); ctx.quadraticCurveTo(s/2+r*0.3, s/2+r*0.3, s/2, s/2+r); ctx.quadraticCurveTo(s/2-r*0.3, s/2+r*0.3, s/2-r, s/2); ctx.quadraticCurveTo(s/2-r*0.3, s/2-r*0.3, s/2, s/2-r); ctx.fill(); }},
    { name: 'arrow-right', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s*0.2, s/2); ctx.bezierCurveTo(s*0.4, s/2, s*0.6, s*0.35, s*0.75, s/2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.62, s*0.35); ctx.lineTo(s*0.75, s/2); ctx.lineTo(s*0.62, s*0.65); ctx.stroke(); }},
    { name: 'plus', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s/2, s*0.22); ctx.lineTo(s/2, s*0.78); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.22, s/2); ctx.lineTo(s*0.78, s/2); ctx.stroke(); }},
    { name: 'check', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw+1; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(s*0.22, s*0.52); ctx.bezierCurveTo(s*0.32, s*0.62, s*0.42, s*0.68, s*0.78, s*0.32); ctx.stroke(); }},
  ];

  icons.forEach(({ name, draw }) => {
    colors.forEach(color => {
      const c = createCanvas(iconSize, iconSize);
      const ctx = c.getContext('2d');
      const cn = color === COLORS.black ? 'black' : color === P.sage ? 'sage' : color === P.terracotta ? 'terracotta' : 'warmgray';
      draw(ctx, iconSize, color, 3);
      saveCanvas(c, path.join(SET_DIR, 'icons', `${name}-${cn}.png`));
    });
  });
}

function generateButtons() {
  console.log('Buttons...');
  const btnW = 200, btnH = 56;

  const variants = [
    { name: 'btn-primary', bg: P.sage, text: '#fff', border: P.sageDark },
    { name: 'btn-warm', bg: P.terracotta, text: '#fff', border: P.terracottaDark },
    { name: 'btn-sand', bg: P.sand, text: COLORS.black, border: P.warmGray },
    { name: 'btn-ghost', bg: 'transparent', text: COLORS.black, border: P.warmGray },
    { name: 'btn-outline', bg: 'transparent', text: P.sage, border: P.sage },
  ];

  const states = ['normal', 'hover', 'active'];

  variants.forEach(v => {
    states.forEach(state => {
      const c = createCanvas(btnW, btnH);
      const ctx = c.getContext('2d');

      // Soft shadow
      if (state === 'normal') {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.roundRect(3, 5, btnW, btnH, 12);
        ctx.fill();
      } else if (state === 'hover') {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.roundRect(2, 6, btnW, btnH, 12);
        ctx.fill();
      }

      // Button
      ctx.fillStyle = v.bg;
      const rad = state === 'active' ? 10 : 12;
      const offset = state === 'active' ? 1 : 0;
      ctx.beginPath();
      ctx.roundRect(offset, offset, btnW - offset, btnH - offset, rad);
      ctx.fill();

      // Border
      ctx.strokeStyle = v.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(offset, offset, btnW - offset, btnH - offset, rad);
      ctx.stroke();

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
    { name: 'grad-sage-radial', colors: [P.sage, 'transparent'] },
    { name: 'grad-terracotta-radial', colors: [P.terracotta, 'transparent'] },
    { name: 'grad-sand-radial', colors: [P.sand, 'transparent'] },
    { name: 'grad-earth', colors: [P.terracotta, P.sage] },
    { name: 'grad-warmth', colors: [P.sand, P.dustyRose] },
    { name: 'grad-forest', colors: [P.sageDark, '#1A1816'] },
  ];

  gradients.forEach(({ name, colors }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(SIZE/2, SIZE/2, 0, SIZE/2, SIZE/2, SIZE/2);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
    saveCanvas(c, path.join(SET_DIR, 'gradients', `${name}.png`));
  });
}

function generateDecorativeShapes() {
  console.log('Decorative shapes...');

  // Ghost blobs
  [
    { name: 'ghost-blob-sage', color: P.sage },
    { name: 'ghost-blob-terracotta', color: P.terracotta },
    { name: 'ghost-blob-dustyrose', color: P.dustyRose },
    { name: 'ghost-circle-sand', color: P.sand },
  ].forEach(({ name, color }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.06;
    drawBlob(ctx, SIZE, color);
    ctx.globalAlpha = 1;
    saveCanvas(c, path.join(SET_DIR, 'decorative', `${name}.png`));
  });

  // Gradient strip
  const strip = createCanvas(SIZE, 8);
  const sctx = strip.getContext('2d');
  const grad = sctx.createLinearGradient(0, 0, SIZE, 0);
  grad.addColorStop(0, P.sage);
  grad.addColorStop(0.33, P.terracotta);
  grad.addColorStop(0.66, P.sand);
  grad.addColorStop(1, P.warmGray);
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, SIZE, 8);
  saveCanvas(strip, path.join(SET_DIR, 'decorative', 'color-strip.png'));
}

function generateHeroPattern() {
  console.log('Hero pattern...');
  const c = createCanvas(1024, 512);
  const ctx = c.getContext('2d');

  ctx.fillStyle = P.linen;
  ctx.fillRect(0, 0, 1024, 512);

  // Soft dot grid
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  for (let x = 12; x < 1024; x += 24) {
    for (let y = 12; y < 512; y += 24) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Large sage circle
  ctx.fillStyle = P.sage;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(280, 260, 160, 0, Math.PI * 2);
  ctx.fill();

  // Terracotta rounded square
  ctx.fillStyle = P.terracotta;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.roundRect(420, 100, 200, 200, 30);
  ctx.fill();

  // Dusty rose oval
  ctx.fillStyle = P.dustyRose;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(750, 300, 140, 90, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Small olive circle
  ctx.fillStyle = P.olive;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(680, 120, 30, 0, Math.PI * 2);
  ctx.fill();

  // Sand blob
  ctx.fillStyle = P.sand;
  ctx.globalAlpha = 0.15;
  drawBlob(ctx, 200, P.sand);
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(150, 400, 70, 0, Math.PI * 2);
  ctx.fill();

  // Flowing line
  ctx.strokeStyle = COLORS.black;
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 350);
  ctx.bezierCurveTo(256, 300, 512, 400, 1024, 320);
  ctx.stroke();

  ctx.globalAlpha = 1;
  saveCanvas(c, path.join(SET_DIR, 'hero-pattern.png'));
}

generateAll();
