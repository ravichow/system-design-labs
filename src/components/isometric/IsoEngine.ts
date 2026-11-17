/**
 * Isometric Vector Math Engine
 * Uses classic 2:1 isometric tile ratio (width: 28, height: 14)
 * X_screen = 14 * (x + y)
 * Y_screen = 7 * (x - y) - h
 */

export const ISO_TILE_W = 28;
export const ISO_TILE_H = 14;

export function project(x: number, y: number, h: number = 0): [number, number] {
  const sx = Math.round(14 * (x + y) * 10) / 10;
  const sy = Math.round((7 * (x - y) - h) * 10) / 10;
  return [sx, sy];
}

export interface BoxGeometry {
  T: [number, number]; // Top-most vertex of top face
  R: [number, number]; // Right vertex of top face
  B: [number, number]; // Bottom vertex of top face
  L: [number, number]; // Left vertex of top face
  Rd: [number, number]; // Right vertex of ground
  Bd: [number, number]; // Bottom vertex of ground
  Ld: [number, number]; // Left vertex of ground
  sil: string; // Full outer 3D silhouette path
  top: string; // Top face diamond path
  left: string; // Left vertical face
  right: string; // Right vertical face
  sheen: string; // Top glare highlight
}

export function computeBoxGeometry(
  x: number,
  y: number,
  size: number = 4,
  height: number = 38
): BoxGeometry {
  const half = size / 2;
  const x0 = x - half;
  const x1 = x + half;
  const y0 = y - half;
  const y1 = y + half;

  const T = project(x0, y1, height);
  const R = project(x1, y1, height);
  const B = project(x1, y0, height);
  const L = project(x0, y0, height);

  const Rd = project(x1, y1, 0);
  const Bd = project(x1, y0, 0);
  const Ld = project(x0, y0, 0);

  // Top face path
  const top = `M ${T[0]} ${T[1]} L ${R[0]} ${R[1]} L ${B[0]} ${B[1]} L ${L[0]} ${L[1]} Z`;

  // Left face path: L -> B -> Bd -> Ld -> Z
  const left = `M ${L[0]} ${L[1]} L ${B[0]} ${B[1]} L ${Bd[0]} ${Bd[1]} L ${Ld[0]} ${Ld[1]} Z`;

  // Right face path: B -> R -> Rd -> Bd -> Z
  const right = `M ${B[0]} ${B[1]} L ${R[0]} ${R[1]} L ${Rd[0]} ${Rd[1]} L ${Bd[0]} ${Bd[1]} Z`;

  // Outer silhouette: T -> R -> Rd -> Bd -> Ld -> L -> Z
  const sil = `M ${T[0]} ${T[1]} L ${R[0]} ${R[1]} L ${Rd[0]} ${Rd[1]} L ${Bd[0]} ${Bd[1]} L ${Ld[0]} ${Ld[1]} L ${L[0]} ${L[1]} Z`;

  // Sheen overlay
  const sheen = `M ${T[0]} ${T[1] + 2} L ${R[0] - 2} ${R[1]} L ${B[0]} ${B[1] - 2} L ${L[0] + 2} ${L[1]} Z`;

  return { T, R, B, L, Rd, Bd, Ld, sil, top, left, right, sheen };
}

export function computeCylinderGeometry(
  x: number,
  y: number,
  radius: number = 2.4,
  height: number = 42
) {
  const centerTop = project(x, y, height);
  const centerBottom = project(x, y, 0);
  const rx = radius * 14;
  const ry = radius * 7;

  return {
    topCenter: centerTop,
    bottomCenter: centerBottom,
    rx,
    ry,
    height
  };
}

export function buildCablePath(points: [number, number][], lift: number = 0): string {
  if (points.length === 0) return '';
  const projected = points.map(([px, py]) => project(px, py, lift));
  if (projected.length === 1) return `M ${projected[0][0]} ${projected[0][1]}`;

  let d = `M ${projected[0][0]} ${projected[0][1]}`;
  for (let i = 1; i < projected.length; i++) {
    d += ` L ${projected[i][0]} ${projected[i][1]}`;
  }
  return d;
}

