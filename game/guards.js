// Guards, cameras and detection for Midnight Vault.
// A guard or camera "sees" the thief when the thief is inside its vision cone
// (range + angle) AND no wall blocks the line of sight.

import { WALLS } from './level.js';

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Liang-Barsky clip: true when the segment crosses the rectangle.
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

export function lineBlocked(x1, y1, x2, y2) {
  for (const w of WALLS) if (segmentHitsRect(x1, y1, x2, y2, w)) return true;
  return false;
}

export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function inCone(ox, oy, facing, range, halfFov, tx, ty) {
  const dx = tx - ox, dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return { seen: false, dist };
  if (Math.abs(angleDiff(angleTo(ox, oy, tx, ty), facing)) > halfFov) return { seen: false, dist };
  if (lineBlocked(ox, oy, tx, ty)) return { seen: false, dist };
  return { seen: true, dist };
}

// --- guards ---------------------------------------------------------------

export function makeGuards(defs) {
  return defs.map((d) => ({
    ...d,
    x: d.path[0].x, y: d.path[0].y,
    target: 1, facing: 0, distracted: 0, dx: 0, dy: 0, alert: false,
  }));
}

export function updateGuard(g, dt, coin) {
  if (g.distracted > 0) {
    g.distracted -= dt;
    const a = angleTo(g.x, g.y, coin.x, coin.y);
    g.facing = a;
    const d = Math.hypot(coin.x - g.x, coin.y - g.y);
    if (d > 12) {
      g.x += (Math.cos(a) * g.speed * 0.9 * dt);
      g.y += (Math.sin(a) * g.speed * 0.9 * dt);
    }
    return;
  }
  const wp = g.path[g.target];
  const a = angleTo(g.x, g.y, wp.x, wp.y);
  g.facing = a;
  const d = Math.hypot(wp.x - g.x, wp.y - g.y);
  const step = g.speed * dt;
  if (d <= step) { g.x = wp.x; g.y = wp.y; g.target = (g.target + 1) % g.path.length; }
  else { g.x += Math.cos(a) * step; g.y += Math.sin(a) * step; }
}

// --- cameras --------------------------------------------------------------

export function makeCameras(defs) {
  return defs.map((d) => ({ ...d, t: d.phase, facing: d.base }));
}

export function updateCamera(c, dt) {
  c.t += dt;
  c.facing = c.base + Math.sin(c.t * c.speed) * c.sweep;
}

// --- detection ------------------------------------------------------------
// Returns { spotted: boolean, byGuard: boolean }. Alarm rises faster up close
// and when the thief is running (not sneaking).

export function detect(guards, cameras, thief, sneaking) {
  let spotted = false, byGuard = false;
  for (const g of guards) {
    const r = inCone(g.x, g.y, g.facing, g.range, g.fov, thief.x, thief.y);
    g.alert = r.seen;
    if (r.seen) { spotted = true; byGuard = true; }
  }
  for (const c of cameras) {
    const r = inCone(c.x, c.y, c.facing, c.range, c.fov, thief.x, thief.y);
    c.alert = r.seen;
    if (r.seen) spotted = true;
  }
  return { spotted, byGuard, loud: !sneaking };
}
