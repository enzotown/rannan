// art.js — allt som ritas: himmel, brädor, kran, kruka, blomma, Marre
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, SAND);
  g.addColorStop(0, C.sky1); g.addColorStop(1, C.sky2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, DW, DH);

  // sol
  ctx.save();
  ctx.translate(742, 108);
  ctx.fillStyle = 'rgba(255,224,138,.55)';
  for (let i = 0; i < 12; i++) {
    const a = time * 0.12 + i * Math.PI / 6;
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(7, -70); ctx.lineTo(-7, -70); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = C.yellow;
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath(); ctx.arc(-9, -10, 12, 0, 6.3); ctx.fill();
  ctx.restore();

  // moln
  cloud(150, 80, 1.0, 0.55);
  cloud(620, 60, 0.8, 0.45);
  cloud(1010, 150, 0.65, 0.4);

  // kullar
  ctx.fillStyle = 'rgba(150,205,175,.45)';
  ctx.beginPath(); ctx.moveTo(0, SAND);
  ctx.quadraticCurveTo(220, 360, 470, SAND); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150,205,175,.35)';
  ctx.beginPath(); ctx.moveTo(430, SAND);
  ctx.quadraticCurveTo(760, 330, 1000, SAND); ctx.closePath(); ctx.fill();

  // sanden
  const sg = ctx.createLinearGradient(0, SAND - 30, 0, DH);
  sg.addColorStop(0, C.sand); sg.addColorStop(1, C.sandDark);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(0, SAND);
  ctx.quadraticCurveTo(240, SAND - 16, 500, SAND - 4);
  ctx.quadraticCurveTo(780, SAND + 12, DW, SAND - 8);
  ctx.lineTo(DW, DH); ctx.lineTo(0, DH); ctx.closePath(); ctx.fill();
  // sandprickar
  ctx.fillStyle = 'rgba(190,150,95,.35)';
  for (let i = 0; i < 90; i++) {
    const x = (i * 137) % DW, y = SAND + 12 + ((i * 53) % 150);
    ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.3); ctx.fill();
  }
}

function cloud(x, y, s, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, 6.3); ctx.arc(28, -8, 20, 0, 6.3);
  ctx.arc(54, 2, 22, 0, 6.3); ctx.arc(26, 12, 20, 0, 6.3);
  ctx.fill();
  ctx.restore();
}

function drawGrid(isHintOn) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,250,243,.75)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 9]);
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(GX + c * CELL, GY); ctx.lineTo(GX + c * CELL, GY + ROWS * CELL); ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(GX, GY + r * CELL); ctx.lineTo(GX + COLS * CELL, GY + r * CELL); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

// en bräda: trätråg med två kanter
function drawGutter(type, x, y, alpha, scale) {
  const h = CELL / 2, s = scale || 1;
  let x1, y1, x2, y2;
  if (type === 'r') { x1 = x - h; y1 = y - 40; x2 = x + h; y2 = y + 40; }
  else if (type === 'l') { x1 = x + h; y1 = y - 40; x2 = x - h; y2 = y + 40; }
  else { x1 = x - h; y1 = y; x2 = x + h; y2 = y; }

  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);

  // skugga
  ctx.strokeStyle = 'rgba(74,63,57,.18)';
  ctx.lineWidth = 26; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1 + 6); ctx.lineTo(x2, y2 + 6); ctx.stroke();

  // yttre trä
  ctx.strokeStyle = C.wood; ctx.lineWidth = 24; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  // ljus överkant
  ctx.strokeStyle = C.woodLight; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1 - 5); ctx.lineTo(x2, y2 - 5); ctx.stroke();
  // urholkning
  ctx.strokeStyle = C.woodDark; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1 - 1); ctx.lineTo(x2, y2 - 1); ctx.stroke();
  ctx.restore();
}

function drawPieces() {
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i], c = cellCenter(p.c, p.r);
    drawGutter(p.type, c.x, c.y, 1, 1);
  }
}

function drawHint() {
  const L = LEVELS[level];
  if (hintT <= 0 || !L.hint) return;
  const a = Math.min(1, hintT / 0.6) * (0.45 + 0.25 * Math.sin(time * 4));
  ctx.save();
  for (let i = 0; i < L.hint.length; i++) {
    const h = L.hint[i], c = cellCenter(h[1], h[2]);
    ctx.globalAlpha = a;
    drawGutter(h[0], c.x, c.y, a, 1);
    ctx.strokeStyle = C.mintDark; ctx.lineWidth = 3; ctx.setLineDash([7, 7]);
    ctx.strokeRect(GX + h[1] * CELL + 5, GY + h[2] * CELL + 5, CELL - 10, CELL - 10);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawTray() {
  ctx.save();
  // hylla
  ctx.fillStyle = 'rgba(74,63,57,.14)';
  rr(168, 566, 664, 122, 26); ctx.fill();
  ctx.fillStyle = C.cream;
  rr(164, 556, 664, 122, 26); ctx.fill();
  ctx.strokeStyle = C.wood; ctx.lineWidth = 5;
  rr(164, 556, 664, 122, 26); ctx.stroke();

  const xs = [270, 500, 730];
  for (let i = 0; i < 3; i++) {
    const on = sel === i;
    if (on) {
      ctx.fillStyle = 'rgba(123,203,182,' + (0.35 + 0.15 * Math.sin(time * 5)) + ')';
      rr(xs[i] - 100, 566, 200, 104, 20); ctx.fill();
    }
    drawGutter(TRAY[i], xs[i], 615, drag ? 0.45 : 1, 0.92);
  }
  ctx.restore();
}

function drawFaucet() {
  const L = LEVELS[level];
  const x = L.faucet;
  ctx.save();
  // stigande rör upp ur bild
  ctx.strokeStyle = '#8fa4b0'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x, GY - 74); ctx.stroke();
  ctx.strokeStyle = '#c3d4dc'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x - 4, -10); ctx.lineTo(x - 4, GY - 76); ctx.stroke();
  // fäste
  ctx.fillStyle = '#7d939f';
  rr(x - 20, GY - 86, 40, 14, 6); ctx.fill();
  // kranens kropp
  ctx.fillStyle = '#9db2bd';
  rr(x - 17, GY - 80, 34, 46, 10); ctx.fill();
  ctx.fillStyle = '#cfdde4';
  rr(x - 10, GY - 76, 10, 38, 5); ctx.fill();
  // munstycke
  ctx.fillStyle = '#8fa4b0';
  rr(x - 12, GY - 40, 24, 16, 6); ctx.fill();

  // ratt
  const rot = flowing ? time * 5 : 0;
  ctx.save();
  ctx.translate(x + 40, GY - 62); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(74,63,57,.15)';
  ctx.beginPath(); ctx.arc(2, 3, 22, 0, 6.3); ctx.fill();
  ctx.fillStyle = flowing ? C.mint : C.coral;
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, 6.3); ctx.fill();
  ctx.strokeStyle = C.cream; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, 6.3); ctx.fillStyle = C.cream; ctx.fill();
  ctx.restore();
  // liten pil som visar att ratten går att vrida
  if (!flowing) {
    ctx.fillStyle = 'rgba(255,250,243,.9)';
    ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('vrid', x + 40, GY - 92);
  }
  // stilken mellan kran och ratt
  ctx.strokeStyle = '#9db2bd'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x + 14, GY - 62); ctx.lineTo(x + 22, GY - 62); ctx.stroke();

  // pulserande ring när vattnet är avstängt och brädor finns
  if (!flowing && pieces.length > 0 && fill < LEVELS[level].need) {
    const p = (time * 0.9) % 1;
    ctx.globalAlpha = 0.5 * (1 - p);
    ctx.strokeStyle = C.coral; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x + 40, GY - 62, 24 + p * 26, 0, 6.3); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawStream() {
  const L = LEVELS[level];
  if (!flowing) return;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = C.waterLight; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const wob = Math.sin(time * 22) * 2;
  ctx.beginPath();
  ctx.moveTo(L.faucet + wob, GY - 26);
  ctx.lineTo(L.faucet + wob * 0.4, GY - 14);
  ctx.stroke();
  ctx.restore();
}

