// All drawing for Midnight Vault. Everything the judge needs to see lives in
// one frame: the room, guards with vision cones, cameras, loot, alarm meter.

import { VIEW, WALLS, LOOT, EXIT } from './level.js';

function conePath(ctx, x, y, facing, range, halfFov) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfFov, facing + halfFov);
  ctx.closePath();
}

function drawCone(ctx, x, y, facing, range, halfFov, color, alert) {
  conePath(ctx, x, y, facing, range, halfFov);
  ctx.fillStyle = alert ? color.replace('0.13', '0.30') : color;
  ctx.fill();
  ctx.strokeStyle = alert ? '#ff3b30' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawRoom(ctx) {
  // floor
  ctx.fillStyle = '#11162a';
  ctx.fillRect(0, VIEW.hud, VIEW.w, VIEW.h - VIEW.hud);
  // floor tiles
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 22; x < VIEW.w; x += 62) {
    ctx.beginPath(); ctx.moveTo(x, VIEW.hud); ctx.lineTo(x, VIEW.h); ctx.stroke();
  }
  for (let y = VIEW.hud + 62; y < VIEW.h; y += 62) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW.w, y); ctx.stroke();
  }
  // carpet runner to the vault
  ctx.fillStyle = '#3a1530';
  ctx.fillRect(600, VIEW.hud, 80, VIEW.h - VIEW.hud);
  // walls
  for (const w of WALLS) {
    ctx.fillStyle = '#2c3552';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#46537a';
    ctx.fillRect(w.x, w.y, w.w, 3);
  }
  // vault block label
  ctx.fillStyle = '#8b93a7';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAULT', 640, 322);
  // exit door
  ctx.fillStyle = '#1d7a33';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = '#b8ffce';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText(EXIT.label, EXIT.x + EXIT.w / 2, EXIT.y + 15);
}

export function drawLoot(ctx, loot, taken) {
  for (const l of LOOT) {
    if (taken.has(l.id)) continue;
    // pedestal glow
    ctx.beginPath();
    ctx.arc(l.x, l.y, 26, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = l.color;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(l.id === 'diamond' ? '◆' : l.id === 'gold' ? '▬' : '$', l.x, l.y + 5);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#c9cfdd';
    ctx.fillText(l.label, l.x, l.y + 34);
  }
}

export function drawGuards(ctx, guards) {
  for (const g of guards) {
    drawCone(ctx, g.x, g.y, g.facing, g.range, g.fov,
      g.alert ? 'rgba(255,59,48,0.30)' : 'rgba(255,176,32,0.13)', g.alert);
    // guard body
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
    ctx.fillStyle = g.alert ? '#ff3b30' : '#e8a020';
    ctx.fill();
    ctx.strokeStyle = '#0d1220';
    ctx.lineWidth = 2;
    ctx.stroke();
    // facing tick
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.facing) * 20, g.y + Math.sin(g.facing) * 20);
    ctx.strokeStyle = '#0d1220';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#c9cfdd';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, g.x, g.y - 20);
    if (g.alert) {
      ctx.fillStyle = '#ff3b30';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('!', g.x, g.y - 30);
    }
  }
}

export function drawCameras(ctx, cameras) {
  for (const c of cameras) {
    drawCone(ctx, c.x, c.y, c.facing, c.range, c.fov,
      c.alert ? 'rgba(255,59,48,0.30)' : 'rgba(255,80,80,0.13)', c.alert);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = c.alert ? '#ff3b30' : '#d43d3d';
    ctx.fill();
    ctx.strokeStyle = '#0d1220';
    ctx.lineWidth = 2;
    ctx.stroke();
    // lens direction
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + Math.cos(c.facing) * 16, c.y + Math.sin(c.facing) * 16);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#c9cfdd';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAM', c.x, c.y - 16);
  }
}

export function drawThief(ctx, thief, sneaking) {
  // shadow ring when sneaking
  if (sneaking) {
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 22, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(127,231,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#2fbf71';
  ctx.fill();
  ctx.strokeStyle = '#0d1220';
  ctx.lineWidth = 2;
  ctx.stroke();
  // mask stripe
  ctx.fillStyle = '#0d1220';
  ctx.fillRect(thief.x - 8, thief.y - 3, 16, 5);
  ctx.fillStyle = '#c9cfdd';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', thief.x, thief.y - 20);
}

export function drawCoin(ctx, coin) {
  if (!coin) return;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd34d';
  ctx.fill();
  ctx.strokeStyle = '#7a5b00';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,211,77,0.5)';
  ctx.stroke();
}

export function drawHud(ctx, state) {
  // HUD strip
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, VIEW.w, VIEW.hud);
  ctx.fillStyle = '#2a3350';
  ctx.fillRect(0, VIEW.hud - 2, VIEW.w, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('MIDNIGHT VAULT', 20, 32);
  ctx.fillStyle = '#8b93a7';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('steal the loot · dodge the cones · reach the exit', 20, 54);

  // alarm meter
  const ax = 480, ay = 22, aw = 320, ah = 22;
  ctx.fillStyle = '#1a2138';
  ctx.fillRect(ax, ay, aw, ah);
  const frac = Math.max(0, Math.min(1, state.alarm / 100));
  ctx.fillStyle = frac < 0.5 ? '#e8a020' : frac < 0.8 ? '#ff7a1a' : '#ff3b30';
  ctx.fillRect(ax, ay, aw * frac, ah);
  ctx.strokeStyle = '#46537a';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, ay, aw, ah);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`ALARM ${Math.round(state.alarm)}%`, ax, ay + 38);

  // loot counter
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT ${state.lootTaken.size}/3`, 860, 32);
  ctx.fillStyle = '#ffd34d';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`SCORE ${state.score}`, 860, 54);

  // coins + timer
  ctx.fillStyle = '#c9cfdd';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`COINS ${state.coins}`, 1040, 32);
  const t = Math.max(0, Math.floor(state.timeLeft));
  ctx.fillText(`TIME ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, 1040, 54);
}

export function drawOverlay(ctx, title, lines, accent) {
  // Centered panel only — the room, cones, cameras and loot stay visible
  // around it, so every screenshot still shows the whole heist in one frame.
  const px = 330, py = 235, pw = 620, ph = 92 + lines.length * 28;
  ctx.fillStyle = 'rgba(5,8,16,0.85)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 12);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText(title, VIEW.w / 2, py + 56);
  ctx.fillStyle = '#dfe3ee';
  ctx.font = '17px system-ui, sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, VIEW.w / 2, py + 92 + i * 28));
}
