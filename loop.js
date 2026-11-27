// loop.js — uppdatering, teckning och spelvarv
function update(dt) {
  time += dt;
  const L = LEVELS[level];

  if (flowing && fill < L.need) {
    spawnAcc += dt * 46;
    while (spawnAcc > 1) { spawnAcc -= 1; if (drops.length < 260) spawnDrop(); }
    waterSound(1);
  } else {
    waterSound(0);
  }
  if (fill >= L.need) flowing = false;

  updateDrops(dt);

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt * (p.g > 1000 ? 1.2 : 0.85);
    p.vy += p.g * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += dt * 6;
    if (p.life <= 0 || p.y > DH + 40) parts.splice(i, 1);
  }
  for (let i = puddles.length - 1; i >= 0; i--) {
    puddles[i].t += dt;
    if (puddles[i].t > 14) puddles.splice(i, 1);
  }
  birds.forEach(function (b) {
    b.x += b.v * dt;
    if (b.x > DW + 60) { b.x = -60; b.y = 60 + Math.random() * 110; }
  });

  if (celebrate > 0) {
    celebrate -= dt;
    if (celebrate <= 0) loadLevel(level + 1);
  }

  const L2 = LEVELS[level];
  if (fill > 0 && fill < L2.need) idleT = 0; else idleT += dt;
  if (hintT > 0) hintT -= dt;
  else if (idleT > 20 && pieces.length === 0 && !showHelp) { hintT = 6; idleT = 0; }
}

function draw() {
  drawSky();
  drawBirds();
  drawGrid();
  drawHint();
  drawPieces();
  drawFaucet();
  drawStream();
  const L = LEVELS[level];
  drawPot();
  drawPlant();
  drawKotten(L.pot + 96, SAND + 2, celebrate > 0 || fill >= L.need ? 'happy' : 'calm', 0.95);
  drawPuddles();
  drawDrops();
  drawParts();
  drawTray();
  drawHUD();
  drawCelebrate();
  if (drag) drawGutter(drag.type, drag.x, drag.y, 0.85, 1.05);
  if (showHelp) drawHelp();
}

let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.05) dt = 0.05;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

resize();
birds = [
  { x: 200, y: 90, v: 26, ph: 0 },
  { x: 640, y: 128, v: -20, ph: 1.7 }
];
loadLevel(0);
requestAnimationFrame(frame);