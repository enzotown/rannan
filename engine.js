// engine.js — yta, ljud, geometri och vattnets fysik
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const DW = 1000, DH = 700;
let vw = DW, vh = DH, SC = 1, OX = 0, OY = 0, DPR = 1;

const C = {
  cream: '#fffaf3', brown: '#4a3f39', brown2: '#6b5d54',
  mint: '#7bcbb6', mintDark: '#4fae94', coral: '#ef8064', coralDark: '#c9553f',
  yellow: '#ffe08a', sand: '#f3ddb4', sandDark: '#e3c894', sandLight: '#fbeccd',
  wood: '#d9a35f', woodDark: '#a8722f', woodLight: '#efc386',
  water: '#4fb4e0', waterLight: '#a8e0f4', waterDark: '#2b7fa8',
  sky1: '#cfe9f6', sky2: '#eef8fc', leaf: '#5bb07a', leafDark: '#3f8a5c',
  pot: '#d9825f', potDark: '#b35f42'
};

const GX = 200, GY = 110, CELL = 90, COLS = 7, ROWS = 4, SAND = 500;
const GRAV = 1500;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  vw = window.innerWidth; vh = window.innerHeight;
  cv.width = Math.floor(vw * DPR); cv.height = Math.floor(vh * DPR);
  SC = Math.min(vw / DW, vh / DH);
  OX = (vw - DW * SC) / 2; OY = (vh - DH * SC) / 2;
  ctx.setTransform(DPR * SC, 0, 0, DPR * SC, DPR * OX, DPR * OY);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });

// ------------------------------------------------------------------ ljud
let actx = null, master = null;
const MASTER_VOL = 0.9;
function audio() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = actx.createDynamicsCompressor();
      comp.threshold.value = -8; comp.ratio.value = 6;
      master = actx.createGain(); master.gain.value = MASTER_VOL;
      master.connect(comp); comp.connect(actx.destination);
      noiseStart();
    } catch (e) {}
  }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(f, dur, vol, type, slide, delay) {
  const a = audio(); if (!a) return;
  const t0 = a.currentTime + (delay || 0);
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.06, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master || a.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
let noiseSrc = null, noiseGain = null, noiseFilter = null;
function noiseStart() {
  const a = audio(); if (!a || noiseSrc) return;
  const len = a.sampleRate * 2;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  noiseSrc = a.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
  noiseFilter = a.createBiquadFilter(); noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 850; noiseFilter.Q.value = 0.65;
  noiseGain = a.createGain(); noiseGain.gain.value = 0;
  noiseSrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(master);
  noiseSrc.start();
}
function waterSound(lvl) {
  if (!actx || !noiseGain) return;
  noiseGain.gain.setTargetAtTime(lvl * 0.10, actx.currentTime, 0.10);
}
function plop() { tone(560, 0.10, 0.06, 'sine', 320); }
function tinyDrip() { tone(760 + Math.random() * 300, 0.05, 0.018, 'sine', 380); }
function chime() { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.34, 0.08, 'triangle', null, i * 0.10); }); }
function whoosh() { tone(220, 0.30, 0.05, 'sine', 660); }

// ------------------------------------------------------------------ geometri
function cellCenter(c, r) { return { x: GX + c * CELL + CELL / 2, y: GY + r * CELL + CELL / 2 }; }

function segOf(piece) {
  const p = cellCenter(piece.c, piece.r), h = CELL / 2;
  if (piece.type === 'r') return { x1: p.x - h, y1: p.y - 40, x2: p.x + h, y2: p.y + 40 };
  if (piece.type === 'l') return { x1: p.x + h, y1: p.y - 40, x2: p.x - h, y2: p.y + 40 };
  return { x1: p.x - h, y1: p.y, x2: p.x + h, y2: p.y };
}

function cellAt(x, y) {
  if (x < GX || x > GX + COLS * CELL || y < GY || y > GY + ROWS * CELL) return null;
  return { c: Math.floor((x - GX) / CELL), r: Math.floor((y - GY) / CELL) };
}
function pieceAtCell(c, r) {
  for (let i = 0; i < pieces.length; i++) if (pieces[i].c === c && pieces[i].r === r) return pieces[i];
  return null;
}

// ------------------------------------------------------------------ vattnet
function spawnDrop() {
  const L = LEVELS[level];
  const a = (Math.random() - 0.5) * 0.30;
  drops.push({
    x: L.faucet + Math.sin(a) * 7, y: GY - 14,
    vx: Math.sin(a) * 55, vy: 50 + Math.random() * 45,
    r: 4.6 + Math.random() * 2.2, st: 'free', p: null, t: 0, dir: 1, sp: 0, life: 0
  });
}

function updateDrops(dt) {
  const L = LEVELS[level];
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += dt;

    if (d.st === 'slide') {
      const s = segOf(d.p);
      const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      const len = Math.hypot(dx, dy) || 1;
      d.sp += (GRAV * (dy / len) * 0.85 - 220) * dt;
      d.sp = Math.max(140, Math.min(780, d.sp));
      d.t += d.dir * d.sp * dt / len;
      if (d.t >= 1 || d.t <= 0) {
        const ux = dx / len, uy = dy / len;
        d.x = s.x1 + dx * (d.t >= 1 ? 1 : 0);
        d.y = s.y1 + dy * (d.t >= 1 ? 1 : 0) - 8;
        const EXIT = 0.55;
        if (Math.abs(dy) < 3) { d.vx = d.sp * d.dir * 0.85; d.vy = 0; }
        else { d.vx = ux * d.sp * d.dir * EXIT; d.vy = uy * d.sp * d.dir * EXIT; }
        d.x += ux * 8; d.y += uy * 8;
        d.st = 'free'; d.p = null; d.t = 0; d.grace = 0.12;
      } else {
        d.x = s.x1 + dx * d.t;
        d.y = s.y1 + dy * d.t - 8;
      }
      continue;
    }

    const py = d.y;
    if (d.grace > 0) d.grace -= dt;
    d.vy += GRAV * dt;
    d.x += d.vx * dt; d.y += d.vy * dt;
    d.vx *= (1 - Math.min(0.85, 1.5 * dt));

    for (let k = 0; k < pieces.length && !(d.grace > 0); k++) {
      const s = segOf(pieces[k]);
      const lox = Math.min(s.x1, s.x2) - 8, hix = Math.max(s.x1, s.x2) + 8;
      if (d.x < lox || d.x > hix) continue;
      const u = (d.x - s.x1) / (s.x2 - s.x1);
      if (u > 0.97 || u < 0.03) continue;
      const sy = s.y1 + (s.y2 - s.y1) * u;
      if (py <= sy + 8 && d.y >= sy - 8 && d.vy > 0) {
        d.st = 'slide'; d.p = pieces[k];
        d.t = Math.max(0, Math.min(1, u));
        d.dir = Math.abs(s.y2 - s.y1) > 3 ? (s.y2 > s.y1 ? 1 : -1) : (d.vx >= 0 ? 1 : -1);
        d.sp = Math.max(170, Math.hypot(d.vx, d.vy) * 0.8);
        d.y = sy - 8;
        tinyDrip();
        break;
      }
    }
    if (d.st === 'slide') continue;

    if (d.y > SAND - 48 && d.y < SAND + 8 && Math.abs(d.x - L.pot) < 56) {
      fill = Math.min(L.need, fill + 1);
      burst(d.x, SAND - 42, 4, C.waterLight);
      drops.splice(i, 1);
      if (fill >= L.need && celebrate <= 0) win();
      continue;
    }
    if (d.y > SAND - 2) {
      addPuddle(d.x);
      burst(d.x, SAND - 4, 3, C.water);
      drops.splice(i, 1); continue;
    }
    if (d.x < -40 || d.x > DW + 40 || d.life > 14) drops.splice(i, 1);
  }
}