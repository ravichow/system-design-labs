/**
 * Isometric Vector Math & Geometry Engine
 * Uses classic 2:1 isometric tile ratio (width: 28, height: 14)
 * X_screen = 14 * (x + y)
 * Y_screen = 7 * (x - y) - z
 */

export const A = (e: number): number => Math.round(e * 100) / 100;

export function project(x: number, y: number, z: number = 0): [number, number] {
  return [A(14 * (x + y)), A(7 * (x - y) - z)];
}

export const PALETTE = {
  ink: '#211e1b',
  inkDark: '#1c1a17',
  paper: '#fbf6ef',
  orange: {
    top: ['#fee6cc', '#fcd4ad'],
    side: ['#f9c697', '#f3b47f']
  },
  green: {
    top: ['#e2f2d7', '#d1e9c2'],
    side: ['#c3e1b2', '#b3d79f']
  },
  blue: {
    top: ['#dfebf9', '#cde0f5'],
    side: ['#bcd3ef', '#a9c5e8']
  },
  yellow: {
    top: ['#fff3d6', '#fee7b8'],
    side: ['#fcdb9c', '#f6cd82']
  },
  purple: {
    top: ['#f2eaf9', '#e6dbf4'],
    side: ['#d9cbef', '#cbbae6']
  },
  sand: {
    top: ['#faf3e9', '#f1e8db'],
    side: ['#e8dfd1', '#d3c7b6']
  },
  red: {
    top: ['#fdf0ed', '#f8d5cf'],
    side: ['#f0b6ac', '#e39183']
  },
  slab: {
    top: ['#f7f0e7', '#f0e7dc'],
    side: ['#ece2d5', '#e3d7c8']
  },
  store: {
    top: ['#f6f1fa', '#ece4f4'],
    side: ['#e2d8ee', '#d6c9e6']
  }
};

/**
 * Rounded isometric polygon path generator
 */
export function Sr(pts: [number, number][], radius: number | number[] = 8): string {
  const n = pts.length;
  if (n === 0) return '';
  const getR = (i: number) => (Array.isArray(radius) ? radius[i] : radius);
  const clamp = (p1: [number, number], p2: [number, number], rad: number): [number, number] => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const d = Math.hypot(dx, dy) || 1;
    const factor = Math.min(rad, d / 2) / d;
    return [p1[0] + dx * factor, p1[1] + dy * factor];
  };

  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const rad = getR(i);
    const l = clamp(cur, prev, rad);
    const u = clamp(cur, next, rad);
    d += `${i === 0 ? 'M' : 'L'}${A(l[0])},${A(l[1])} Q${A(cur[0])},${A(cur[1])} ${A(u[0])},${A(u[1])} `;
  }
  return d + 'Z';
}

/**
 * Rounded polyline path generator
 */
export function Cr(pts: [number, number][], radius: number = 10): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${A(pts[0][0])},${A(pts[0][1])}`;
  if (pts.length === 2) return `M${A(pts[0][0])},${A(pts[0][1])} L${A(pts[1][0])},${A(pts[1][1])}`;

  let d = `M${A(pts[0][0])},${A(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(cx - px, cy - py);
    const d2 = Math.hypot(nx - cx, ny - cy);
    if (d1 < 0.01 || d2 < 0.01) continue;
    const f = Math.min(radius, d1 / 2, d2 / 2);
    const startX = cx + ((px - cx) / d1) * f;
    const startY = cy + ((py - cy) / d1) * f;
    const endX = cx + ((nx - cx) / d2) * f;
    const endY = cy + ((ny - cy) / d2) * f;
    d += ` L${A(startX)},${A(startY)} Q${A(cx)},${A(cy)} ${A(endX)},${A(endY)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${A(last[0])},${A(last[1])}`;
  return d;
}

/**
 * Point inside polygon test
 */
function pointInPoly([x, y]: [number, number], poly: [number, number][]): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
    if (Math.abs(cross) < 1e-9) continue;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
}

/**
 * Clip polyline points against polygon boundary (from-entity)
 */
export function Tr(pts: [number, number][], poly: [number, number][] | null | undefined, margin: number = 3): [number, number][] {
  if (!poly || poly.length < 3 || !pointInPoly(pts[0], poly)) return pts;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (pointInPoly(p2, poly)) continue;
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      const testPt: [number, number] = [p1[0] + (p2[0] - p1[0]) * mid, p1[1] + (p2[1] - p1[1]) * mid];
      if (pointInPoly(testPt, poly)) lo = mid;
      else hi = mid;
    }
    const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    const clippedT = Math.min(1, hi + margin / dist);
    const clippedPt: [number, number] = [p1[0] + (p2[0] - p1[0]) * clippedT, p1[1] + (p2[1] - p1[1]) * clippedT];
    return [clippedPt, ...pts.slice(i + 1)];
  }
  return pts;
}

/**
 * Clip polyline points against polygon boundary (to-entity)
 */
export function Er(pts: [number, number][], poly: [number, number][] | null | undefined, margin: number = 3): [number, number][] {
  return Tr([...pts].reverse(), poly, margin).reverse();
}

/**
 * Parse point expressions from lesson scene link specs
 */
export function ip(pt: any, getCenter: (id: string) => [number, number]): [number, number] {
  const parsePart = (expr: string, idx: number): number => {
    const m = /^([\w-]+?)([+-][\d.]+)?$/.exec(expr);
    if (!m) return 0;
    const center = getCenter(m[1]);
    const base = center ? center[idx] : 0;
    const offset = m[2] ? parseFloat(m[2]) : 0;
    return base + offset;
  };

  if (typeof pt === 'string') {
    return [parsePart(pt, 0), parsePart(pt, 1)];
  }
  if (Array.isArray(pt)) {
    const x = typeof pt[0] === 'string' ? parsePart(pt[0], 0) : pt[0];
    const y = typeof pt[1] === 'string' ? parsePart(pt[1], 1) : pt[1];
    return [x, y];
  }
  return [0, 0];
}

export interface BoxGeometry {
  T: [number, number];
  R: [number, number];
  B: [number, number];
  L: [number, number];
  Rd: [number, number];
  Bd: [number, number];
  Ld: [number, number];
  ty: number;
  outline: [number, number][];
  sil: string;
  top: string;
  sheen: string;
  right: string;
  left: string;
  bevel: string;
}

export function computeBoxGeometry(
  x: number,
  y: number,
  size: number = 4,
  height: number = 38,
  radius: number = 9
): BoxGeometry {
  const t = size / 2;
  const x0 = x - t;
  const x1 = x + t;
  const y0 = y - t;
  const y1 = y + t;

  const T = project(x0, y1, height);
  const R = project(x1, y1, height);
  const B = project(x1, y0, height);
  const L = project(x0, y0, height);

  const Rd = project(x1, y1, 0);
  const Bd = project(x1, y0, 0);
  const Ld = project(x0, y0, 0);

  const p = Math.max(1, Math.min(radius, height / 2 - 0.5));
  const ty = project((x0 + x1) / 2, (y0 + y1) / 2, height)[1];
  const outline: [number, number][] = [T, R, Rd, Bd, Ld, L];

  return {
    T,
    R,
    B,
    L,
    Rd,
    Bd,
    Ld,
    ty,
    outline,
    sil: Sr(outline, [radius + 1, p, p, radius + 3, p, p]),
    top: Sr([T, R, B, L], [radius + 1, p, 6, p]),
    sheen: Sr(
      [T, R, B, L].map(([px, py]) => [px, py - 3 + (py - ty) * -0.25]),
      [radius + 1, p, 6, p]
    ),
    right: Sr([B, R, Rd, Bd], [6, p, p, radius + 3]),
    left: Sr([L, B, Bd, Ld], [6, p, p, radius + 3]),
    bevel: Cr([L, B, R], 8)
  };
}

export function computeCylinderGeometry(
  x: number,
  y: number,
  radius: number = 1.7,
  height: number = 38
) {
  const rx = Math.SQRT2 * 14 * radius;
  const ry = rx / 2;
  const [cx, groundY] = project(x, y, 0);
  const topY = groundY - height;

  return {
    cx,
    groundY,
    topY,
    rx,
    ry,
    height,
    poly: (() => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 8; i++) {
        pts.push([cx - rx * Math.cos((Math.PI * i) / 8), topY - ry * Math.sin((Math.PI * i) / 8)]);
      }
      for (let i = 0; i <= 8; i++) {
        pts.push([cx + rx * Math.cos((Math.PI * i) / 8), groundY + ry * Math.sin((Math.PI * i) / 8)]);
      }
      return pts;
    })()
  };
}

/**
 * Consistent hashing ring geometry and element generator
 */
export function computeRingGeometry(
  cx: number = 0,
  cy: number = 0,
  r: number = 10,
  nodes: Array<{ a: number; color: string; mark?: boolean }> = [],
  keys: number[] = [],
  moved: number[] = []
) {
  const toPt = (deg: number, rad = r): [number, number] => {
    const theta = (deg * Math.PI) / 180;
    return project(cx + rad * Math.cos(theta), cy + rad * Math.sin(theta), 0);
  };

  const arcPath = (fromDeg: number, toDeg: number, rad = r): string => {
    let d = '';
    const steps = Math.max(2, Math.ceil(Math.abs(toDeg - fromDeg) / 3));
    for (let i = 0; i <= steps; i++) {
      const [x, y] = toPt(fromDeg + ((toDeg - fromDeg) * i) / steps, rad);
      d += `${i === 0 ? 'M' : 'L'}${A(x)},${A(y)} `;
    }
    return d;
  };

  const sortedNodes = [...nodes].sort((a, b) => a.a - b.a);

  // Compute owner for any key
  const findOwner = (keyDeg: number) => {
    if (!sortedNodes.length) return null;
    let owner = sortedNodes[sortedNodes.length - 1];
    for (const node of sortedNodes) {
      if (node.a <= keyDeg) owner = node;
    }
    return owner;
  };

  // Colored server arc partitions
  const serverArcs = sortedNodes.map((node, i) => {
    const next = sortedNodes[(i + 1) % sortedNodes.length];
    const nextAngle = next.a > node.a ? next.a : next.a + 360;
    return {
      node,
      color: node.color,
      d: arcPath(node.a, nextAngle)
    };
  });

  // Directional navigation arrows around ring perimeter
  const dirArrows: Array<{ x: number; y: number; angle: number }> = [];
  for (let n = 22; n < 360; n += 60) {
    const [x1, y1] = toPt(n + 2.5, r + 1.4);
    const [x0, y0] = toPt(n, r + 1.4);
    const angle = (Math.atan2(y0 - y1, x0 - x1) * 180) / Math.PI;
    dirArrows.push({ x: x0, y: y0, angle });
  }

  // Diamonds for marked nodes (virtual nodes)
  const diamonds = sortedNodes
    .filter((n) => n.mark)
    .map((n) => {
      const [nx, ny] = toPt(n.a);
      return {
        x: nx,
        y: ny,
        color: n.color
      };
    });

  // Keys with moved pulse rings
  const movedSet = new Set(moved);
  const keyDots = keys.map((k) => {
    const [kx, ky] = toPt(k);
    const owner = findOwner(k);
    return {
      deg: k,
      x: kx,
      y: ky,
      color: owner ? (PALETTE as any)[owner.color]?.side[0] || '#9FD28F' : '#fbf6ef',
      isMoved: movedSet.has(k)
    };
  });

  // Ring boundary polygon
  const poly: [number, number][] = [];
  for (let a = 0; a < 360; a += 15) {
    poly.push(toPt(a, r + 1.6));
  }

  const [labelX, labelY] = toPt(135, r + 2.2);

  return {
    toPt,
    arcPath,
    fullTrackD: arcPath(0, 360, r),
    outerTrackD: arcPath(0, 360, r + 0.9),
    serverArcs,
    dirArrows,
    diamonds,
    keyDots,
    poly,
    labelPos: [labelX, labelY - 12] as [number, number]
  };
}
