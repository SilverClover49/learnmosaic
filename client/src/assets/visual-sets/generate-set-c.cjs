/**
 * SET C: STRUCTURAL DEPTH
 * Heavy shadows, layered surfaces, architectural mass, dark-forward.
 * Bauhaus meets Brutalism — concrete weight, deep shadows, carved space.
 */
const { createCanvas, COLORS, saveCanvas, loadFonts, OUTPUT_BASE } = require('./generate-utils.cjs');
const path = require('path');

const SIZE = 512;
const SET_DIR = path.join(OUTPUT_BASE, 'set-c-structural-depth');

const P = {
  ...COLORS,
  concrete: '#2A2A2A',
  concreteMid: '#3A3A3A',
  concreteLight: '#4A4A4A',
  steel: '#6A7A8A',
  steelLight: '#8A9AAA',
  rust: '#A05030',
  rustLight: '#C07050',
  bone: '#E8E0D8',
  charcoal: '#181818',
  smoke: '#333333',
  deepBlue: '#0A1520',
};

function generateAll() {
  loadFonts();
  console.log('\n=== SET C: Structural Depth ===\n');
  generateBackgrounds();
  generateTextures();
  generateParticles();
  generateIcons();
  generateButtons();
  generateGradients();
  generateDecorativeShapes();
  generateHeroPattern();
  console.log('\nSet C complete.\n');
}

function generateBackgrounds() {
  console.log('Backgrounds...');

  // Light — bone/concrete with heavy structural grid
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  ctx.fillStyle = P.bone;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Structural grid — thicker lines
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= SIZE; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  // Heavy corner block
  ctx.fillStyle = P.concrete;
  ctx.globalAlpha = 0.06;
  ctx.fillRect(0, 0, 96, 96);
  ctx.globalAlpha = 1;

  saveCanvas(c, path.join(SET_DIR, 'bg-light.png'));

  // Dark — layered dark surfaces
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');

  // Base
  ctx.fillStyle = P.charcoal;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Structural grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= SIZE; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
  }

  // Elevated surface block
  ctx.fillStyle = P.smoke;
  ctx.fillRect(0, 0, SIZE / 3, SIZE);

  // Shadow edge
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(SIZE / 3, 0, 4, SIZE);

  saveCanvas(c, path.join(SET_DIR, 'bg-dark.png'));
}

function generateTextures() {
  console.log('Textures...');

  // Concrete grain
  let c = createCanvas(SIZE, SIZE);
  let ctx = c.getContext('2d');
  const imgData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const base = 128 + Math.random() * 30;
    imgData.data[i] = base;
    imgData.data[i + 1] = base;
    imgData.data[i + 2] = base;
    imgData.data[i + 3] = 15;
  }
  ctx.putImageData(imgData, 0, 0);
  saveCanvas(c, path.join(SET_DIR, 'texture-concrete.png'));

  // Heavy crosshatch
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let i = -SIZE; i < SIZE * 2; i += 8) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + SIZE, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + SIZE, 0); ctx.lineTo(i, SIZE); ctx.stroke();
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-heavy-hatch.png'));

  // Diagonal lines
  c = createCanvas(SIZE, SIZE);
  ctx = c.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1.5;
  for (let i = -SIZE; i < SIZE * 2; i += 16) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + SIZE, SIZE); ctx.stroke();
  }
  saveCanvas(c, path.join(SET_DIR, 'texture-diagonal.png'));
}

function generateParticles() {
  console.log('Particles...');
  const shapes = [
    { name: 'block-concrete', draw: drawBlock, color: P.concrete },
    { name: 'block-steel', draw: drawBlock, color: P.steel },
    { name: 'block-rust', draw: drawBlock, color: P.rust },
    { name: 'block-red', draw: drawBlock, color: COLORS.red },
    { name: 'slab-concrete', draw: drawSlab, color: P.concreteMid },
    { name: 'slab-steel', draw: drawSlab, color: P.steel },
    { name: 'slab-bone', draw: drawSlab, color: P.bone },
    { name: 'pillar-steel', draw: drawPillar, color: P.steel },
    { name: 'pillar-rust', draw: drawPillar, color: P.rust },
    { name: 'beam-concrete', draw: drawBeam, color: P.concreteLight },
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
    ctx.globalAlpha = 0.08;
    draw(ctx, 128, color);
    ctx.globalAlpha = 1;
    saveCanvas(c, path.join(SET_DIR, 'particles', `ghost-${name}-128.png`));
  });
}

function drawBlock(ctx, s, color) {
  ctx.fillStyle = color;
  const pad = s * 0.1;
  ctx.fillRect(pad, pad, s - pad * 2, s - pad * 2);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(pad + 3, s - pad - 2, s - pad * 2, 4);
}

function drawSlab(ctx, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(s * 0.08, s * 0.25, s * 0.84, s * 0.5);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(s * 0.08 + 2, s * 0.75, s * 0.84, 3);
}

function drawPillar(ctx, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(s * 0.3, s * 0.08, s * 0.4, s * 0.84);
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(s * 0.7, s * 0.08, 3, s * 0.84);
}

function drawBeam(ctx, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(s * 0.08, s * 0.35, s * 0.84, s * 0.3);
}

function generateIcons() {
  console.log('Icons...');
  const iconSize = 64;
  const colors = [COLORS.black, P.steel, P.rust, COLORS.red];

  const icons = [
    { name: 'structure', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.strokeRect(s*0.2, s*0.2, s*0.6, s*0.6); ctx.beginPath(); ctx.moveTo(s*0.2, s*0.5); ctx.lineTo(s*0.8, s*0.5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.5, s*0.2); ctx.lineTo(s*0.5, s*0.8); ctx.stroke(); }},
    { name: 'column', draw: (ctx, s, c) => { ctx.fillStyle = c; ctx.fillRect(s*0.35, s*0.12, s*0.3, s*0.76); ctx.fillRect(s*0.25, s*0.12, s*0.5, s*0.08); ctx.fillRect(s*0.25, s*0.8, s*0.5, s*0.08); }},
    { name: 'arch', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.beginPath(); ctx.moveTo(s*0.2, s*0.8); ctx.lineTo(s*0.2, s*0.35); ctx.arc(s/2, s*0.35, s*0.3, Math.PI, 0); ctx.lineTo(s*0.8, s*0.8); ctx.stroke(); }},
    { name: 'layer', draw: (ctx, s, c) => { ctx.fillStyle = c; for (let i = 0; i < 3; i++) { ctx.globalAlpha = 1 - i * 0.25; ctx.fillRect(s*0.15, s*(0.15+i*0.22), s*0.7, s*0.18); } ctx.globalAlpha = 1; }},
    { name: 'weight', draw: (ctx, s, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(s/2, s*0.15); ctx.lineTo(s*0.8, s*0.5); ctx.lineTo(s*0.65, s*0.5); ctx.lineTo(s*0.65, s*0.85); ctx.lineTo(s*0.35, s*0.85); ctx.lineTo(s*0.35, s*0.5); ctx.lineTo(s*0.2, s*0.5); ctx.closePath(); ctx.fill(); }},
    { name: 'frame', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.strokeRect(s*0.15, s*0.15, s*0.7, s*0.7); ctx.strokeRect(s*0.25, s*0.25, s*0.5, s*0.5); }},
    { name: 'arrow-right', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.lineCap = 'square'; ctx.beginPath(); ctx.moveTo(s*0.15, s/2); ctx.lineTo(s*0.65, s/2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.5, s*0.3); ctx.lineTo(s*0.7, s/2); ctx.lineTo(s*0.5, s*0.7); ctx.stroke(); }},
    { name: 'plus', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw; ctx.lineCap = 'square'; ctx.beginPath(); ctx.moveTo(s/2, s*0.2); ctx.lineTo(s/2, s*0.8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s*0.2, s/2); ctx.lineTo(s*0.8, s/2); ctx.stroke(); }},
    { name: 'check', draw: (ctx, s, c, sw) => { ctx.strokeStyle = c; ctx.lineWidth = sw+1; ctx.lineCap = 'square'; ctx.lineJoin = 'miter'; ctx.beginPath(); ctx.moveTo(s*0.18, s*0.5); ctx.lineTo(s*0.38, s*0.7); ctx.lineTo(s*0.8, s*0.3); ctx.stroke(); }},
    { name: 'grid', draw: (ctx, s, c) => { ctx.fillStyle = c; for (let r = 0; r < 3; r++) { for (let c2 = 0; c2 < 3; c2++) { ctx.fillRect(s*(0.15+c2*0.25), s*(0.15+r*0.25), s*0.2, s*0.2); } } }},
  ];

  icons.forEach(({ name, draw }) => {
    colors.forEach(color => {
      const c = createCanvas(iconSize, iconSize);
      const ctx = c.getContext('2d');
      const cn = color === COLORS.black ? 'black' : color === P.steel ? 'steel' : color === P.rust ? 'rust' : 'red';
      draw(ctx, iconSize, color, 3);
      saveCanvas(c, path.join(SET_DIR, 'icons', `${name}-${cn}.png`));
    });
  });
}

function generateButtons() {
  console.log('Buttons...');
  const btnW = 200, btnH = 56;

  const variants = [
    { name: 'btn-primary', bg: COLORS.black, text: '#fff', border: P.concreteLight },
    { name: 'btn-steel', bg: P.steel, text: '#fff', border: P.steelLight },
    { name: 'btn-rust', bg: P.rust, text: '#fff', border: P.rustLight },
    { name: 'btn-ghost', bg: 'transparent', text: COLORS.black, border: P.concreteLight },
    { name: 'btn-elevated', bg: P.bone, text: COLORS.black, border: COLORS.black },
  ];

  const states = ['normal', 'hover', 'active'];

  variants.forEach(v => {
    states.forEach(state => {
      const c = createCanvas(btnW, btnH);
      const ctx = c.getContext('2d');

      // Heavy shadow
      if (state === 'normal') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(5, 5, btnW, btnH);
      } else if (state === 'hover') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(7, 7, btnW, btnH);
      }

      // Button
      ctx.fillStyle = v.bg;
      const off = state === 'active' ? 2 : 0;
      ctx.fillRect(off, off, btnW - off, btnH - off);

      // Border
      ctx.strokeStyle = v.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(off, off, btnW - off, btnH - off);

      // Text
      ctx.fillStyle = v.text;
      ctx.font = '700 13px Jost, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      const label = state === 'hover' ? 'LEARN →' : 'LEARN';
      ctx.fillText(label, btnW / 2, btnH / 2 + 1);

      saveCanvas(c, path.join(SET_DIR, 'buttons', `${v.name}-${state}.png`));
    });
  });
}

function generateGradients() {
  console.log('Gradients...');
  const gradients = [
    { name: 'grad-concrete-radial', colors: [P.concreteMid, P.charcoal] },
    { name: 'grad-steel-radial', colors: [P.steel, P.charcoal] },
    { name: 'grad-rust-radial', colors: [P.rust, P.charcoal] },
    { name: 'grad-depth', colors: [P.concrete, P.charcoal] },
    { name: 'grad-elevation', colors: [P.bone, P.concrete] },
    { name: 'grad-shadow', colors: ['#000000', 'transparent'] },
  ];

  gradients.forEach(({ name, colors }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
    saveCanvas(c, path.join(SET_DIR, 'gradients', `${name}.png`));
  });
}

function generateDecorativeShapes() {
  console.log('Decorative shapes...');

  // Heavy ghost blocks
  [
    { name: 'ghost-block-concrete', color: P.concrete },
    { name: 'ghost-block-steel', color: P.steel },
    { name: 'ghost-slab-rust', color: P.rust },
    { name: 'ghost-frame-black', color: COLORS.black },
  ].forEach(({ name, color }) => {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.05;
    const pad = SIZE * 0.15;
    ctx.fillRect(pad, pad, SIZE - pad * 2, SIZE - pad * 2);
    ctx.globalAlpha = 1;
    saveCanvas(c, path.join(SET_DIR, 'decorative', `${name}.png`));
  });

  // Heavy strip
  const strip = createCanvas(SIZE, 12);
  const sctx = strip.getContext('2d');
  [P.charcoal, P.concrete, P.steel, P.rust, P.bone].forEach((color, i) => {
    sctx.fillStyle = color;
    sctx.fillRect(i * (SIZE / 5), 0, SIZE / 5, 12);
  });
  saveCanvas(strip, path.join(SET_DIR, 'decorative', 'color-strip.png'));
}

function generateHeroPattern() {
  console.log('Hero pattern...');
  const c = createCanvas(1024, 512);
  const ctx = c.getContext('2d');

  ctx.fillStyle = P.bone;
  ctx.fillRect(0, 0, 1024, 512);

  // Heavy grid
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 1024; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
  }
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  // Large concrete block
  ctx.fillStyle = P.concrete;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(100, 80, 350, 350);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(450, 430, 350, 8);

  // Steel pillar
  ctx.fillStyle = P.steel;
  ctx.globalAlpha = 0.2;
  ctx.fillRect(520, 60, 80, 400);

  // Rust accent block
  ctx.fillStyle = P.rust;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(660, 180, 200, 160);

  // Small red block — accent
  ctx.fillStyle = COLORS.red;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(700, 80, 40, 40);

  // Black beam
  ctx.fillStyle = COLORS.black;
  ctx.globalAlpha = 0.12;
  ctx.fillRect(0, 300, 1024, 6);

  // Steel circle
  ctx.fillStyle = P.steel;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(880, 380, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  saveCanvas(c, path.join(SET_DIR, 'hero-pattern.png'));
}

generateAll();
