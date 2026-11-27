// app.js — nivåer, inmatning och spelets gång
const LEVELS = [
  { faucet: 232, pot: 470, need: 26, hint: [['r', 0, 0], ['r', 1, 1], ['r', 2, 2]] },
  { faucet: 605, pot: 335, need: 30, hint: [['l', 4, 0], ['l', 3, 1], ['l', 2, 2], ['l', 1, 3]] },
  { faucet: 245, pot: 700, need: 34, hint: [['r', 0, 0], ['r', 1, 1], ['r', 2, 2], ['f', 3, 3], ['f', 4, 3]] }
];

let level = 0, pieces = [], drops = [], parts = [], puddles = [], birds = [];
let flowing = false, fill = 0, celebrate = 0, time = 0;
let drag = null, sel = null, hintT = 0, idleT = 0, showHelp = false, spawnAcc = 0;
let shot = 0;

const TRAY = ['r', 'f', 'l'];
const TRAY_X = [270, 500, 730];

function loadLevel(n) {
  level = ((n % LEVELS.length) + LEVELS.length) % LEVELS.length;
  pieces = []; drops = []; parts = []; puddles = [];
  flowing = false; fill = 0; celebrate = 0; hintT = 0; idleT = 0; spawnAcc = 0;
  drag = null; sel = null;
  waterSound(0);
}

function win() {
  celebrate = 3.2;
  chime();
  const L = LEVELS[level];
  for (let i = 0; i < 70; i++) {
    parts.push({
      x: L.pot + (Math.random() - 0.5) * 70, y: SAND - 110,
      vx: (Math.random() - 0.5) * 460, vy: -Math.random() * 540 - 120,
      g: 900, life: 1.6 + Math.random() * 1.2, max: 2.8,
      col: [C.mint, C.coral, C.yellow, C.waterLight, C.cream][i % 5],
      sz: 5 + Math.random() * 7, rot: Math.random() * 6
    });
  }
}

function burst(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    parts.push({
      x: x, y: y, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 230 - 40,
      g: 1150, life: 0.45 + Math.random() * 0.4, max: 0.85,
      col: col, sz: 3 + Math.random() * 4, rot: 0
    });
  }
}

function addPuddle(x) {
  puddles.push({ x: Math.max(24, Math.min(DW - 24, x)), t: 0, w: 24 + Math.random() * 18 });
  if (puddles.length > 24) puddles.shift();
}

// ------------------------------------------------------------ inmatning
function toDesign(e) {
  const r = cv.getBoundingClientRect();
  const t = e.touches && e.touches[0] ? e.touches[0] : e;
  const cx = (t.clientX - r.left) * (cv.width / DPR / r.width);
  const cy = (t.clientY - r.top) * (cv.height / DPR / r.height);
  return { x: (cx - OX) / SC, y: (cy - OY) / SC };
}

function hitFaucet(L, x, y) {
  return Math.hypot(x - (L.faucet + 40), y - (GY - 62)) < 46;
}
function traySlotAt(x, y) {
  if (y < 556 || y > 682) return -1;
  for (let i = 0; i < 3; i++) if (Math.abs(x - TRAY_X[i]) < 105) return i;
  return -1;
}
function pieceUnder(x, y) {
  const cell = cellAt(x, y);
  if (!cell) return null;
  const p = pieceAtCell(cell.c, cell.r);
  if (!p) return null;
  const s = segOf(p), d = distToSeg(x, y, s);
  return d < 34 ? p : null;
}
function distToSeg(px, py, s) {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - s.x1) * dx + (py - s.y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (s.x1 + dx * t), py - (s.y1 + dy * t));
}

function placePiece(type, c, r) {
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  if (pieceAtCell(c, r)) return false;
  pieces.push({ type: type, c: c, r: r });
  plop(); idleT = 0;
  return true;
}

function onDown(e) {
  e.preventDefault();
  audio();
  const p = toDesign(e);
  const L = LEVELS[level];

  if (showHelp) { showHelp = false; return; }
  if (celebrate > 0) { celebrate = 0; loadLevel(level + 1); return; }

  if (hitFaucet(L, p.x, p.y)) {
    flowing = !flowing;
    waterSound(flowing ? 1 : 0);
    if (flowing) whoosh();
    return;
  }
  if (Math.hypot(p.x - 950, p.y - 40) < 34) { showHelp = true; return; }

  const slot = traySlotAt(p.x, p.y);
  if (slot >= 0) {
    sel = (sel === slot) ? null : slot;
    plop();
    drag = { type: TRAY[slot], x: p.x, y: p.y, from: 'tray' };
    return;
  }

  const hit = pieceUnder(p.x, p.y);
  if (hit) {
    pieces.splice(pieces.indexOf(hit), 1);
    drag = { type: hit.type, x: p.x, y: p.y, from: 'grid', oc: hit.c, or: hit.r };
    sel = null;
    return;
  }

  const cell = cellAt(p.x, p.y);
  if (cell && sel !== null && !pieceAtCell(cell.c, cell.r)) {
    placePiece(TRAY[sel], cell.c, cell.r);
    sel = null;
    return;
  }
  sel = null;
}

function onMove(e) {
  e.preventDefault();
  if (!drag) return;
  const p = toDesign(e);
  drag.x = p.x; drag.y = p.y;
}

function onUp(e) {
  e.preventDefault();
  if (!drag) { sel = null; return; }
  const cell = cellAt(drag.x, drag.y);
  let ok = false;
  if (cell && !pieceAtCell(cell.c, cell.r)) ok = placePiece(drag.type, cell.c, cell.r);
  if (!ok && drag.from === 'grid') {
    pieces.push({ type: drag.type, c: drag.oc, r: drag.or });
    plop();
  }
  drag = null; sel = null;
}

cv.addEventListener('pointerdown', onDown);
cv.addEventListener('pointermove', onMove);
cv.addEventListener('pointerup', onUp);
cv.addEventListener('pointercancel', onUp);
cv.addEventListener('touchstart', function (e) { }, { passive: false });

