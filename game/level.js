// Midnight Vault — level layout. One room, fully visible in a single frame
// (1280x720 canvas, HUD strip on top). All coordinates are in canvas pixels.
// Walls block movement and block guard/camera line of sight.

export const VIEW = { w: 1280, h: 720, hud: 76 };

export const WALLS = [
  // outer walls (leave a gap at the bottom for the exit door)
  { x: 8, y: 76, w: 1264, h: 14 }, // top
  { x: 8, y: 76, w: 14, h: 636 }, // left
  { x: 1258, y: 76, w: 14, h: 636 }, // right
  { x: 8, y: 698, w: 592, h: 14 }, // bottom, left of exit
  { x: 680, y: 698, w: 592, h: 14 }, // bottom, right of exit
  // interior display cases (obstacles + cover)
  { x: 300, y: 180, w: 180, h: 56 },
  { x: 800, y: 180, w: 180, h: 56 },
  { x: 300, y: 480, w: 180, h: 56 },
  { x: 800, y: 480, w: 180, h: 56 },
  // central vault block (scenery; the diamond pedestal stands in the open
  // floor west of it so it stays visible even under the title panel)
  { x: 560, y: 296, w: 160, h: 44 },
];

// Loot targets. id, label, position, colour, points.
export const LOOT = [
  { id: 'diamond', label: 'Star Diamond', x: 200, y: 300, color: '#7fe7ff', points: 500 },
  { id: 'gold', label: 'Gold Bars', x: 200, y: 600, color: '#ffd34d', points: 300 },
  { id: 'cash', label: 'Cash Stack', x: 1080, y: 600, color: '#7dff8a', points: 200 },
];

export const EXIT = { x: 600, y: 690, w: 80, h: 22, label: 'EXIT' };

export const PLAYER_START = { x: 140, y: 650 };

// Guards patrol between waypoints (loop). speed in px/s.
export const GUARDS = [
  { name: 'Guard A', path: [{ x: 250, y: 140 }, { x: 1030, y: 140 }], speed: 70, range: 260, fov: 0.62, color: '#ffb020' },
  { name: 'Guard B', path: [{ x: 1120, y: 200 }, { x: 1120, y: 600 }], speed: 60, range: 250, fov: 0.62, color: '#ffb020' },
  { name: 'Guard C', path: [{ x: 1030, y: 640 }, { x: 250, y: 640 }], speed: 70, range: 260, fov: 0.62, color: '#ffb020' },
];

// Wall-mounted cameras sweep their cone back and forth.
export const CAMERAS = [
  { x: 60, y: 104, base: 0.9, sweep: 0.7, speed: 0.45, range: 300, fov: 0.44, phase: 0 },
  { x: 1220, y: 104, base: Math.PI - 0.9, sweep: 0.7, speed: 0.45, range: 300, fov: 0.44, phase: 1.6 },
];

export const COINS_START = 3;
export const ALARM_MAX = 100;
export const WIN_SCORE_BONUS = 1000;
