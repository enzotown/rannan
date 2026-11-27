// Kotten — skolappars maskot (samma figur som i de andra spelen)
function drawKotten(x, y, mood, s) {
  s = s || 1;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(74,63,57,.14)';
  ctx.beginPath(); ctx.ellipse(0, 2, 34, 8, 0, 0, 6.3); ctx.fill();
  ctx.restore();
  KOTTEN.drawAtFeet(ctx, x, y, 126 * s, {
    wave: mood === 'happy' ? Math.max(0, Math.sin((typeof time !== 'undefined' ? time : 0) * 9)) : 0.35
  });
}
// art2.js — vattendroppar, gnistor, kruka, blomma, Marre och skärmtext
function drawDrops() {
  ctx.save();
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (d.st === 'free') {
      const sp = Math.hypot(d.vx, d.vy);
      if (sp > 220) {
        ctx.strokeStyle = 'rgba(79,180,224,.40)';
        ctx.lineWidth = d.r * 1.2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(d.x - d.vx * 0.02, d.y - d.vy * 0.02);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
    }
    const gr = ctx.createRadialGradient(d.x - d.r * 0.35, d.y - d.r * 0.4, 0, d.x, d.y, d.r * 1.2);
    gr.addColorStop(0, C.waterLight); gr.addColorStop(1, C.water);
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.3); ctx.fill();
  }
  ctx.restore();
}

function drawParts() {
  ctx.save();
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.col;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    rr(-p.sz / 2, -p.sz / 2, p.sz, p.sz, 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawPuddles() {
  ctx.save();
  for (let i = 0; i < puddles.length; i++) {
    const p = puddles[i];
    const a = Math.min(0.5, p.t * 1.4) * Math.max(0, 1 - p.t / 14);
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = C.water;
    ctx.beginPath();
    ctx.ellipse(p.x, SAND + 6, p.w * Math.min(1, p.t * 2), 7, 0, 0, 6.3);
    ctx.fill();
  }
  ctx.restore();
}

function drawPot() {
  const L = LEVELS[level];
  const x = L.pot;
  // vatten inne i krukan
  const lvl = fill / L.need;
  ctx.save();
  ctx.fillStyle = 'rgba(79,180,224,.85)';
  ctx.beginPath();
  ctx.ellipse(x, SAND - 8 - lvl * 16, 34, 7 + lvl * 3, 0, 0, 6.3);
  ctx.fill();
  ctx.restore();

  // krukan
  ctx.save();
  ctx.fillStyle = C.potDark;
  ctx.beginPath();
  ctx.moveTo(x - 42, SAND - 44); ctx.lineTo(x + 42, SAND - 44);
  ctx.lineTo(x + 30, SAND + 2); ctx.lineTo(x - 30, SAND + 2); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.pot;
  ctx.beginPath();
  ctx.moveTo(x - 38, SAND - 40); ctx.lineTo(x + 38, SAND - 40);
  ctx.lineTo(x + 27, SAND - 2); ctx.lineTo(x - 27, SAND - 2); ctx.closePath();
  ctx.fill();
  // kant
  ctx.fillStyle = C.potDark;
  rr(x - 46, SAND - 52, 92, 14, 6); ctx.fill();
  ctx.fillStyle = C.pot;
  rr(x - 44, SAND - 50, 88, 9, 5); ctx.fill();
  // jord
  ctx.fillStyle = '#5d4433';
  ctx.beginPath(); ctx.ellipse(x, SAND - 44, 38, 8, 0, 0, 6.3); ctx.fill();
  ctx.restore();
}

function drawPlant() {
  const L = LEVELS[level];
  const x = L.pot, base = SAND - 46;
  const g = Math.min(1, fill / L.need);
  const h = 12 + g * 96;
  const lean = (1 - g) * 0.55 + Math.sin(time * 1.4) * 0.03;
  ctx.save();
  ctx.translate(x, base);
  ctx.rotate(lean);
  ctx.strokeStyle = C.leafDark; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -h * 0.5, 0, -h); ctx.stroke();

  const leaves = g > 0.18 ? (g > 0.5 ? 3 : 2) : 1;
  for (let i = 0; i < leaves; i++) {
    const ly = -h * (0.30 + i * 0.22);
    const dir = i % 2 === 0 ? 1 : -1;
    ctx.fillStyle = i % 2 === 0 ? C.leaf : C.leafDark;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.quadraticCurveTo(dir * 34, ly - 16, dir * 40, ly + 6);
    ctx.quadraticCurveTo(dir * 22, ly + 14, 0, ly);
    ctx.fill();
  }
  if (g >= 1) {
    const s = 1 + Math.sin(time * 3) * 0.06;
    ctx.translate(0, -h); ctx.scale(s, s);
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 3 + Math.sin(time) * 0.05);
      ctx.fillStyle = C.coral;
      ctx.beginPath(); ctx.ellipse(0, -16, 10, 15, 0, 0, 6.3); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = C.yellow;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.3); ctx.fill();
  }
  ctx.restore();
}

