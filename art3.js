// art3.js — skyltar, hjälpkort, fåglar och firande
function drawBirds() {
  ctx.save();
  for (let i = 0; i < birds.length; i++) {
    const b = birds[i];
    ctx.strokeStyle = 'rgba(74,63,57,.55)';
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    const f = Math.sin(time * 6 + b.ph) * 7;
    ctx.beginPath();
    ctx.moveTo(b.x - 12, b.y + f);
    ctx.quadraticCurveTo(b.x - 5, b.y - 4, b.x, b.y);
    ctx.quadraticCurveTo(b.x + 5, b.y - 4, b.x + 12, b.y + f);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHUD() {
  // nivåprickar
  const n = LEVELS.length, cx = DW / 2 - (n - 1) * 16;
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.arc(cx + i * 32, 34, i === level ? 9 : 6, 0, 6.3);
    ctx.fillStyle = i === level ? C.coral : 'rgba(255,250,243,.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(74,63,57,.25)'; ctx.lineWidth = 2; ctx.stroke();
  }
  // hjälpknapp
  ctx.fillStyle = C.cream;
  ctx.beginPath(); ctx.arc(950, 40, 26, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(74,63,57,.18)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.brown2;
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('?', 950, 42);
}

function drawHelp() {
  ctx.save();
  ctx.fillStyle = 'rgba(74,63,57,.62)';
  ctx.fillRect(0, 0, DW, DH);
  ctx.fillStyle = C.cream;
  rr(150, 96, 700, 470, 32); ctx.fill();
  ctx.fillStyle = C.brown;
  ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('Rännan', 196, 158);
  ctx.fillStyle = C.brown2;
  ctx.font = '24px "Trebuchet MS", sans-serif';
  const rader = [
    'Dra en bräda från hyllan längst ner och släpp den på',
    'rutnätet. Vrid på ratten — då rinner vattnet.',
    '',
    'Vattnet faller rakt ner. En bräda som lutar får vattnet',
    'att rinna åt sidan. Lutar den mycket går det fortare!',
    '',
    'Bygg en väg ända fram till krukan så växer blomman.',
    'Rinner det fel? Inget händer — flytta en bräda och prova.',
    '',
    'Det som drar vattnet nedåt heter gravitation.'
  ];
  for (let i = 0; i < rader.length; i++) ctx.fillText(rader[i], 196, 214 + i * 34);
  ctx.fillStyle = C.mint;
  rr(386, 486, 228, 62, 31); ctx.fill();
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Jag fattar!', 500, 526);
  ctx.restore();
}

function drawCelebrate() {
  if (celebrate <= 0) return;
  const a = Math.min(1, celebrate / 0.5);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = C.cream;
  const w = 420, h = 96, x = DW / 2 - w / 2, y = 250 - Math.sin(time * 3) * 3;
  ctx.shadowColor = 'rgba(74,63,57,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rr(x, y, w, h, 28); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.mintDark;
  ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Blomman är glad!', DW / 2, y + h / 2);
  ctx.restore();
}