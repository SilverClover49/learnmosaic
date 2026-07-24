const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = 'C:\\Users\\mdrum\\.agents\\skills\\canvas-design\\canvas-fonts';
const OUTPUT_BASE = path.join(__dirname, 'client', 'src', 'assets', 'visual-sets');

// Register fonts
function loadFonts() {
  const fonts = fs.readdirSync(FONTS_DIR).filter(f => f.endsWith('.ttf'));
  fonts.forEach(f => {
    const name = path.basename(f, '.ttf');
    registerFont(path.join(FONTS_DIR, f), { family: name });
  });
}

// Bauhaus palette
const COLORS = {
  red: '#E63946',
  redLight: '#FF6B73',
  redDark: '#B82D38',
  blue: '#1D3557',
  blueLight: '#2A4F7A',
  blueDark: '#0F1F35',
  yellow: '#F4D35E',
  yellowLight: '#F7DE8A',
  yellowDark: '#D4B03A',
  black: '#000000',
  nearBlack: '#0A0A0A',
  darkSurface: '#141414',
  darkAlt: '#1A1A1A',
  darkMid: '#1E1E1E',
  white: '#FFFFFF',
  offWhite: '#F0EFED',
  warmWhite: '#F5F4F0',
  cream: '#E8E7E4',
  gray: '#888888',
  lightGray: '#CCCCCC',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveCanvas(canvas, filepath) {
  ensureDir(path.dirname(filepath));
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`  ✓ ${path.relative(OUTPUT_BASE, filepath)}`);
}

module.exports = { createCanvas, COLORS, ensureDir, saveCanvas, loadFonts, OUTPUT_BASE };
