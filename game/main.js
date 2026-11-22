// Midnight Vault — top-down stealth heist. Grab all 3 loot, reach the exit,
// keep the alarm under 100%. WASD/arrows move, Shift sneaks, click tosses a
// coin to distract guards, R restarts.

import { VIEW, WALLS, LOOT, EXIT, PLAYER_START, GUARDS, CAMERAS, COINS_START, ALARM_MAX, WIN_SCORE_BONUS } from './level.js';
import { makeGuards, makeCameras, updateGuard, updateCamera, detect } from './guards.js';
import { drawRoom, drawLoot, drawGuards, drawCameras, drawThief, drawCoin, drawHud, drawOverlay } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const SHOT = params.get('shot'); // start | play | end — fixed states for screenshots

function freshState() {
  return {
    phase: 'title', // title | playing | caught | won
    thief: { x: PLAYER_START.x, y: PLAYER_START.y },
    guards: makeGuards(GUARDS),
    cameras: makeCameras(CAMERAS),
    lootTaken: new Set(),
    alarm: 0,
    score: 0,
    coins: COINS_START,
    coin: null, // {x, y, t} tossed coin on the floor
    timeLeft: 180,
    elapsed: 0,
    message: '',
  };
}

let state = freshState();

function collide(x, y, r) {
  // returns corrected position after pushing out of walls
  for (const w of WALLS) {
    const nx = Math.max(w.x, Math.min(x, w.x + w.w));
    const ny = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - nx, dy = y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 === 0) { x = w.x - r; continue; }
      const d = Math.sqrt(d2);
      x = nx + (dx / d) * r;
      y = ny + (dy / d) * r;
    }
  }
  x = Math.max(22, Math.min(VIEW.w - 22, x));
  y = Math.max(VIEW.hud + 22, Math.min(VIEW.h - 22, y));
  return { x, y };
}

const keys = new Set();
addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  keys.add(e.key.toLowerCase());
  if (e.key === 'Enter' && state.phase === 'title') state.phase = 'playing';
  if (e.key.toLowerCase() === 'r') state = freshState();
});
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

canvas.addEventListener('click', () => {
  if (state.phase === 'title') { state.phase = 'playing'; return; }
  if (state.phase !== 'playing') { state = freshState(); return; }
  if (state.coins <= 0) return;
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  const mx = (lastMouse.x - rect.left) * scale;
  const my = (lastMouse.y - rect.top) * scale;
  state.coins -= 1;
  state.coin = { x: mx, y: my, t: 4 };
  for (const g of state.guards) {
    if (Math.hypot(g.x - mx, g.y - my) < 260) { g.distracted = 3; }
  }
});
const lastMouse = { x: 0, y: 0 };
canvas.addEventListener('mousemove', (e) => { lastMouse.x = e.clientX; lastMouse.y = e.clientY; });

function step(dt) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) { state.phase = 'caught'; state.message = 'Out of time — the vault sealed itself.'; return; }

  // movement
  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my -= 1;
  if (keys.has('s') || keys.has('arrowdown')) my += 1;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  const sneaking = keys.has('shift');
  const speed = sneaking ? 95 : 185;
  if (mx || my) {
    const len = Math.hypot(mx, my);
    const p = collide(state.thief.x + (mx / len) * speed * dt, state.thief.y + (my / len) * speed * dt, 12);
    state.thief.x = p.x; state.thief.y = p.y;
  }

  // guards + cameras
  for (const g of state.guards) updateGuard(g, dt, state.coin ?? { x: g.x, y: g.y });
  for (const c of state.cameras) updateCamera(c, dt);
  if (state.coin) { state.coin.t -= dt; if (state.coin.t <= 0) state.coin = null; }

  // detection -> alarm
  const d = detect(state.guards, state.cameras, state.thief, sneaking);
  if (d.spotted) {
    const rate = d.byGuard ? (sneaking ? 14 : 26) : (sneaking ? 10 : 20);
    state.alarm += rate * dt;
  } else {
    state.alarm = Math.max(0, state.alarm - 9 * dt);
  }
  if (state.alarm >= ALARM_MAX) {
    state.alarm = ALARM_MAX;
    state.phase = 'caught';
    state.message = 'Spotted! The alarm hit 100% and security locked the vault.';
    return;
  }

  // loot pickup
  for (const l of LOOT) {
    if (!state.lootTaken.has(l.id) && Math.hypot(l.x - state.thief.x, l.y - state.thief.y) < 26) {
      state.lootTaken.add(l.id);
      state.score += l.points;
    }
  }

  // exit
  const t = state.thief;
  if (t.x > EXIT.x - 6 && t.x < EXIT.x + EXIT.w + 6 && t.y > EXIT.y - 14) {
    if (state.lootTaken.size === LOOT.length) {
      state.score += WIN_SCORE_BONUS + Math.round(state.timeLeft) * 5;
      state.phase = 'won';
    } else {
      state.message = `Need all 3 loot to leave — you have ${state.lootTaken.size}/3.`;
    }
  } else if (state.message.startsWith('Need all 3')) {
    state.message = '';
  }
}

function draw() {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawRoom(ctx);
  drawLoot(ctx, LOOT, state.lootTaken);
  drawGuards(ctx, state.guards);
  drawCameras(ctx, state.cameras);
  drawCoin(ctx, state.coin);
  drawThief(ctx, state.thief, keys.has('shift'));
  drawHud(ctx, state);
  if (state.phase === 'title') {
    drawOverlay(ctx, 'MIDNIGHT VAULT', [
      'A one-room heist. Grab the diamond, the gold and the cash,',
      'dodge guard vision cones and sweeping cameras,',
      'and slip out the exit before the alarm hits 100%.',
      '',
      'WASD / arrows — move · Shift — sneak · Click — toss a coin',
      'Press ENTER or click to start',
    ], '#ffd34d');
  } else if (state.phase === 'caught') {
    drawOverlay(ctx, 'BUSTED', [state.message, '', `Score ${state.score} · press R to try again`], '#ff3b30');
  } else if (state.phase === 'won') {
    drawOverlay(ctx, 'CLEAN GETAWAY', [
      `All 3 loot stolen · score ${state.score}`,
      'The vault never knew what hit it.',
      '',
      'Press R to run it again',
    ], '#7dff8a');
  } else if (state.message) {
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, VIEW.w / 2, VIEW.hud + 24);
  }
}

// Fixed screenshot states (?shot=start|play|end) so the shipped screenshots
// are deterministic renders of this code.
function applyShot() {
  if (!SHOT) return;
  if (SHOT === 'start') {
    state.phase = 'title';
  } else if (SHOT === 'play') {
    state.phase = 'playing';
    state.thief = { x: 560, y: 560 };
    state.alarm = 35;
    state.score = 300;
    state.lootTaken = new Set(['gold']);
    state.coins = 2;
    state.timeLeft = 142;
    // guards mid-patrol, one cone sweeping across the thief's route
    state.guards[0].x = 700; state.guards[0].y = 140; state.guards[0].facing = Math.PI;
    state.guards[1].x = 1120; state.guards[1].y = 430; state.guards[1].facing = Math.PI / 2;
    state.guards[2].x = 500; state.guards[2].y = 640; state.guards[2].facing = 0;
    state.cameras[0].facing = 1.1;
    state.cameras[1].facing = Math.PI - 1.1;
  } else if (SHOT === 'end') {
    state.phase = 'won';
    state.thief = { x: 640, y: 676 };
    state.alarm = 58;
    state.score = 2240;
    state.lootTaken = new Set(['diamond', 'gold', 'cash']);
    state.coins = 1;
    state.timeLeft = 88;
  }
  draw();
}

applyShot();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
