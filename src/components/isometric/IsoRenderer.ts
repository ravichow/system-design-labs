import iconData from './iconDefs.json';
import { IsoEntity, SceneGraph, TagInfo } from '../../types';

const ICONS: Record<string, Array<[string, Record<string, string>]>> = iconData as any;

export const A = (e: number): number => Math.round(e * 100) / 100;
export const Mr = (e: number): number => Math.max(0, Math.min(1, e));

export const k = '#211e1b';
export const _r = '#1c1a17';

export const vr: Record<string, { top: [string, string]; side: [string, string] }> = {
  orange: { top: ['#fee6cc', '#fcd4ad'], side: ['#f9c697', '#f3b47f'] },
  green: { top: ['#e2f2d7', '#d1e9c2'], side: ['#c3e1b2', '#b3d79f'] },
  blue: { top: ['#dfebf9', '#cde0f5'], side: ['#bcd3ef', '#a9c5e8'] },
  yellow: { top: ['#fff3d6', '#fee7b8'], side: ['#fcdb9c', '#f6cd82'] },
  purple: { top: ['#f2eaf9', '#e6dbf4'], side: ['#d9cbef', '#cbbae6'] },
  slab: { top: ['#f7f0e7', '#f0e7dc'], side: ['#ece2d5', '#e3d7c8'] },
  store: { top: ['#f6f1fa', '#ece4f4'], side: ['#e2d8ee', '#d6c9e6'] }
};

export function project(x: number, y: number, z: number = 0): [number, number] {
  return [A(14 * (x + y)), A(7 * (x - y) - z)];
}

export function yr(x: number, y: number, z: number = 0): string {
  const [rx, ry] = project(x, y, z);
  return `matrix(1 -0.5 0 1 ${rx} ${ry})`;
}

export function br(x: number, y: number, z: number = 0): string {
  const [rx, ry] = project(x, y, z);
  return `matrix(1 0.5 -1 0.5 ${rx} ${ry})`;
}

export function xr(x: number, y: number, z: number = 0): string {
  const [rx, ry] = project(x, y, z);
  return `matrix(1 -0.5 1 0.5 ${rx} ${ry})`;
}

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

function wr([px, py]: [number, number], poly: [number, number][]): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    const cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
    if (Math.abs(cross) < 1e-9) continue;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
}

export function Tr(
  pts: [number, number][],
  poly: [number, number][] | null | undefined,
  margin: number = 3
): [number, number][] {
  if (!poly || poly.length < 3 || !wr(pts[0], poly)) return pts;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (wr(p2, poly)) continue;
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      const testPt: [number, number] = [p1[0] + (p2[0] - p1[0]) * mid, p1[1] + (p2[1] - p1[1]) * mid];
      if (wr(testPt, poly)) lo = mid;
      else hi = mid;
    }
    const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    const clippedT = Math.min(1, hi + margin / dist);
    const clippedPt: [number, number] = [p1[0] + (p2[0] - p1[0]) * clippedT, p1[1] + (p2[1] - p1[1]) * clippedT];
    return [clippedPt, ...pts.slice(i + 1)];
  }
  return pts;
}

export function Er(
  pts: [number, number][],
  poly: [number, number][] | null | undefined,
  margin: number = 3
): [number, number][] {
  return Tr([...pts].reverse(), poly, margin).reverse();
}

export function ip(
  expr: any,
  getCenter: (id: string) => [number, number]
): [number, number] {
  const parsePart = (e: string, idx: number): number => {
    const m = /^([\w-]+?)([+-][\d.]+)?$/.exec(e);
    if (!m) return 0;
    const center = getCenter(m[1]);
    const base = center ? center[idx] : 0;
    const offset = m[2] ? parseFloat(m[2]) : 0;
    return base + offset;
  };

  if (typeof expr === 'string') {
    return [parsePart(expr, 0), parsePart(expr, 1)];
  }
  if (Array.isArray(expr)) {
    const x = typeof expr[0] === 'string' ? parsePart(expr[0], 0) : expr[0];
    const y = typeof expr[1] === 'string' ? parsePart(expr[1], 1) : expr[1];
    return [x, y];
  }
  return [0, 0];
}

export function getThemeDefs(): string {
  let gradients = '';
  for (const [name, colors] of Object.entries(vr)) {
    gradients += `
      <linearGradient id="g-${name}-top" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="${colors.top[0]}"/><stop offset="1" stop-color="${colors.top[1]}"/>
      </linearGradient>
      <linearGradient id="g-${name}-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${colors.side[0]}"/><stop offset="1" stop-color="${colors.side[1]}"/>
      </linearGradient>`;
  }

  return `
    ${gradients}
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E3D6F3"/><stop offset="1" stop-color="#C9B5E6"/>
    </linearGradient>
    <linearGradient id="screen-glare" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="cyl-sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".3" stop-color="#fff" stop-opacity=".35"/>
      <stop offset=".55" stop-color="#fff" stop-opacity=".05"/>
      <stop offset="1" stop-color="#4b2f6b" stop-opacity=".08"/>
    </linearGradient>
    <filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="blur-md" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="blur-lg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6.5"/></filter>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="5.2" markerHeight="5.2" orient="auto-start-reverse" markerUnits="strokeWidth">
      <path d="M1,1.2 L9,5 L1,8.8 Z" fill="${k}" stroke="${k}" stroke-width="1" stroke-linejoin="round"/>
    </marker>
    <marker id="arrow-muted" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="5.2" markerHeight="5.2" orient="auto-start-reverse" markerUnits="strokeWidth">
      <path d="M1,1.2 L9,5 L1,8.8 Z" fill="#a59c90" stroke="#a59c90" stroke-width="1" stroke-linejoin="round"/>
    </marker>
    <pattern id="iso-grid" patternUnits="userSpaceOnUse" x="0" y="-7" width="28" height="14">
      <path d="M0 7 L14 0 L28 7 L14 14 Z" fill="none" stroke="#a8916f" stroke-opacity=".3" stroke-width=".8"/>
    </pattern>`;
}

export function renderIconSvg(
  name: string | undefined,
  cx: number,
  cy: number,
  size: number = 22,
  opts: { stroke?: number; color?: string; fill?: string } = {}
): string {
  if (!name) return '';
  const def = ICONS[name] || ICONS['server'] || ICONS['box'];
  if (!def) return '';

  const stroke = opts.stroke ?? 1.9;
  const color = opts.color ?? '#211e1b';
  const fill = opts.fill ?? 'none';
  const scale = size / 24;

  const children = def
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([key, val]) => `${key}="${val}"`)
        .join(' ');
      return `<${tag} ${attrStr}/>`;
    })
    .join('');

  return `<g transform="translate(${A(cx - size / 2)} ${A(cy - size / 2)}) scale(${A(scale)})" fill="${fill}" stroke="${color}" stroke-width="${A(stroke / scale)}" stroke-linecap="round" stroke-linejoin="round">${children}</g>`;
}

export const Yr: Record<string, (cx: number, cy: number, scale?: number) => string> = {
  server: (cx, cy, s = 1) => `
    <g transform="translate(${A(cx)} ${A(cy)}) scale(${s})" fill="none" stroke="${k}" stroke-width="1.9" stroke-linecap="round">
      <rect x="-11" y="-10" width="22" height="8.5" rx="2.2"/>
      <rect x="-11" y="1.5" width="22" height="8.5" rx="2.2"/>
      <path d="M-6.5 -5.75h.01M-6.5 5.75h.01" stroke-width="2.6"/>
      <path d="M1 -5.75h5.5M1 5.75h5.5"/>
    </g>`,
  balancer: (cx, cy, s = 1) => `
    <g transform="translate(${A(cx)} ${A(cy)}) scale(${s})" fill="none" stroke="${k}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="-8" cy="0" r="3" fill="${k}"/>
      <path d="M-5 0h4M-1 0 C 3 0 3 -8 8 -8M-1 0 C 3 0 3 8 8 8M-1 0h9"/>
      <path d="M5.5 -10.5l3 2.5-3 2.5M5.5 -2.5l3 2.5-3 2.5M5.5 5.5l3 2.5-3 2.5"/>
    </g>`
};

export const Nr: Record<string, { bg: string; fg: string }> = {
  paper: { bg: '#fbf6ef', fg: k },
  red: { bg: '#f8d5cf', fg: '#8f2a22' },
  green: { bg: '#dcefd2', fg: '#24521c' },
  amber: { bg: '#fbe5bd', fg: '#6d4a0c' },
  violet: { bg: '#e7ddf5', fg: '#47306f' },
  gray: { bg: '#ebe5dc', fg: '#5f5850' },
  blue: { bg: '#dfebf9', fg: '#1d1b19' },
  teal: { bg: '#dcf4f2', fg: '#1a4e4b' },
  rose: { bg: '#f9dce7', fg: '#6d1838' }
};

export const Rr = (text: string, size: number): number => {
  return String(text).length * size * 0.62;
};

export function zr(
  cx: number,
  cy: number,
  text: string,
  opts: { tone?: string; size?: number; icon?: string | null } = {}
): string {
  const tone = opts.tone || 'paper';
  const s = Nr[tone] || Nr.paper;
  const icon = opts.icon || null;
  const size = opts.size || 10.5;
  const iconPadding = icon ? 15 : 0;
  const lines = String(text).split('\n');
  const tw = Math.max(...lines.map((l) => Rr(l, size)));
  const h = 21 + (lines.length - 1) * Math.round(size * 1.3);
  const width = tw + 18 + iconPadding;
  const px = cx - width / 2;
  const py = cy - h / 2;
  const lineSpacing = Math.round(size * 1.3);

  const textTags = lines
    .map((line, idx) => {
      const lineY = cy + size * 0.36 + (idx - (lines.length - 1) / 2) * lineSpacing;
      return `<text x="${A(px + 9 + iconPadding + tw / 2)}" y="${A(lineY)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${s.fg}">${line}</text>`;
    })
    .join('');

  return `
    <g class="pill">
      <rect x="${A(px)}" y="${A(py + 2)}" width="${A(width)}" height="${h}" rx="10.5" fill="${_r}"/>
      <rect x="${A(px)}" y="${A(py)}" width="${A(width)}" height="${h}" rx="10.5" fill="${s.bg}" stroke="${k}" stroke-width="1.3"/>
      ${icon ? renderIconSvg(icon, px + 9 + 6, cy, 12, { stroke: 2.2, color: s.fg }) : ''}
      ${textTags}
    </g>`;
}

export function Wr(cx: number, cy: number, cpu: number): string {
  const pct = Math.round(Mr(cpu) * 100);
  const barColor = cpu < 0.6 ? '#7fc278' : cpu < 0.85 ? '#efb041' : '#e5534b';
  const ox = cx - 43;
  const oy = cy - 21 / 2;
  const barX = ox + 23;

  return `
    <g class="pill">
      <rect x="${A(ox)}" y="${A(oy + 2)}" width="86" height="21" rx="10.5" fill="${_r}"/>
      <rect x="${A(ox)}" y="${A(oy)}" width="86" height="21" rx="10.5" fill="#fbf6ef" stroke="${k}" stroke-width="1.3"/>
      ${renderIconSvg('cpu', ox + 13, cy, 11, { stroke: 2.2, color: '#6f6961' })}
      <rect x="${A(barX)}" y="${A(cy - 3.5)}" width="28" height="7" rx="3.5" fill="#e6ddd0"/>
      <rect x="${A(barX)}" y="${A(cy - 3.5)}" width="${A(Math.max(3, 28 * Mr(cpu)))}" height="7" rx="3.5" fill="${barColor}"/>
      <text x="${A(ox + 86 - 9)}" y="${A(cy + 3.6)}" text-anchor="end" font-size="10.5" font-weight="800" fill="${k}">${pct}%</text>
    </g>`;
}

export function Gr(p: { x0: number; x1: number; y0: number; y1: number; h: number; radius?: number }) {
  const a = p.radius ?? 9;
  const o = project(p.x0, p.y1, p.h);
  const s = project(p.x1, p.y1, p.h);
  const c = project(p.x1, p.y0, p.h);
  const l = project(p.x0, p.y0, p.h);
  const u = project(p.x1, p.y1, 0);
  const d = project(p.x1, p.y0, 0);
  const f = project(p.x0, p.y0, 0);
  const pr = Math.max(1, Math.min(a, p.h / 2 - 0.5));
  const m = project((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, p.h)[1];
  const outline: [number, number][] = [o, s, u, d, f, l];

  return {
    T: o,
    R: s,
    B: c,
    L: l,
    Rd: u,
    Bd: d,
    Ld: f,
    ty: m,
    outline,
    sil: Sr(outline, [a + 1, pr, pr, a + 3, pr, pr]),
    top: Sr([o, s, c, l], [a + 1, pr, 6, pr]),
    sheen: Sr(
      [o, s, c, l].map(([px, py]) => [px, py - 3 + (py - m) * -0.25]),
      [a + 1, pr, 6, pr]
    ),
    right: Sr([c, s, u, d], [6, pr, pr, a + 3]),
    bevel: Cr([l, c, s], 8)
  };
}

export function Kr(geo: any, color: string, opts: { stroke?: string; sw?: number } = {}): string {
  const stroke = opts.stroke || k;
  const sw = opts.sw || 1.9;

  return `
    <path d="${geo.sil}" fill="url(#g-${color}-side)"/>
    <path d="${geo.right}" fill="#3a2a14" opacity=".05"/>
    <path d="${geo.top}" fill="url(#g-${color}-top)"/>
    <path d="${geo.sheen}" fill="#fff" opacity=".22" filter="url(#blur-sm)"/>
    <path d="${geo.bevel}" transform="translate(0 1.4)" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>
    <path d="${geo.bevel}" transform="translate(0 3.4)" fill="none" stroke="#5a4123" stroke-opacity=".07" stroke-width="2.4" stroke-linecap="round"/>
    <path d="${geo.sil}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

export function qr(geo: any, height: number, lift: number, maxOpacity: number): string {
  const i = Math.min(9, 3 + height * 0.15);
  const a = 1 - Math.min(1, lift / 140) * 0.85;
  return `<path d="${geo.sil}" transform="translate(0 ${A(i + lift)})" fill="#6b5236" opacity="${A(maxOpacity * a)}" filter="url(#blur-lg)"/>`;
}

export function Jr(pts: [number, number][], pad: number[] = [0, 0, 0, 0]): [number, number, number, number] {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [
    Math.min(...xs) - pad[0],
    Math.min(...ys) - pad[1],
    Math.max(...xs) + pad[2],
    Math.max(...ys) + pad[3]
  ];
}

export const Ar = (cx: number, cy: number, text: string, size = 12.5, weight = 700, extra = ''): string =>
  `<text x="${A(cx)}" y="${A(cy)}" text-anchor="middle" font-size="${size}" font-weight="${weight}" fill="${k}" ${extra}>${text}</text>`;

// Block Renderer (Servers, Balancers, Workers)
export function renderBlock(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const s = e.s || 4;
  const h = e.h || 46;
  const t = s / 2;
  const geo = Gr({
    x0: (e.x ?? 0) - t,
    x1: (e.x ?? 0) + t,
    y0: (e.y ?? 0) - t,
    y1: (e.y ?? 0) + t,
    h,
    radius: e.radius ?? 9
  });

  const lift = e.lift || 0;
  const cx = geo.T[0];
  const cy = geo.ty;
  const dead = e.dead || 0;
  const dim = e.dim || 0;
  const heat = e.heat || 0;
  const label = Array.isArray(e.label) ? e.label : e.label ? [String(e.label)] : [];
  const color = e.color || 'blue';

  const labelBaseY = cy + (s * 14 * 0.5 + h) * 0.4;
  let labelSvg = '';
  if (label.length) {
    if (label.length === 1 && !e.sub) {
      labelSvg = Ar(cx, labelBaseY + 4.5, label[0], 13.5, 800);
    } else if (label.length === 1) {
      labelSvg = `${Ar(cx, labelBaseY, label[0], 13.5, 800)}${Ar(cx, labelBaseY + 14, e.sub || '', 10, 600)}`;
    } else if (e.sub) {
      labelSvg = `${Ar(cx, labelBaseY - 9, label[0], 13, 800)}${Ar(cx, labelBaseY + 6.5, label[1], 13, 800)}${Ar(cx, labelBaseY + 20.5, e.sub, 10, 600)}`;
    } else {
      labelSvg = `${Ar(cx, labelBaseY - 3.5, label[0], 13, 800)}${Ar(cx, labelBaseY + 12, label[1], 13, 800)}`;
    }
  }

  const glyphScale = s >= 6 ? 1.15 : s < 3.5 ? 0.8 : 1;
  const glyphSvg = Yr[e.glyph || '']
    ? Yr[e.glyph || ''](cx, label.length ? cy - 1 : cy + 2, glyphScale)
    : e.glyph
    ? renderIconSvg(e.glyph, cx, cy - 1, 24, { stroke: 1.9 })
    : '';

  const deadMark =
    dead > 0.01
      ? `<g opacity="${A(dead)}" stroke="#c0392b" stroke-width="3.2" stroke-linecap="round">
           <path d="M${A(cx - 9)},${A(cy - 10)} L${A(cx + 9)},${A(cy + 8)} M${A(cx + 9)},${A(cy - 10)} L${A(cx - 9)},${A(cy + 8)}"/>
         </g>`
      : '';

  const bodySvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      ${qr(geo, h, lift, 0.26)}
      <g transform="translate(0 ${A(-lift)})">
        ${heat > 0.01 ? `<g class="pulse"><path d="${geo.sil}" fill="#f0552f" opacity="${A(heat * 0.7)}" filter="url(#glow)"/></g>` : ''}
        ${Kr(geo, color)}
        ${heat > 0.01 ? `<path d="${geo.sil}" fill="#f0552f" opacity="${A(heat * 0.3)}"/>` : ''}
        ${dead > 0.01 ? `<path d="${geo.sil}" fill="#b9b2a8" opacity="${A(dead * 0.62)}"/><path d="${geo.sil}" fill="none" stroke="${k}" stroke-width="1.9" stroke-linejoin="round"/>` : ''}
        ${dim > 0.01 ? `<path d="${geo.sil}" fill="#f4ebe0" opacity="${A(dim * 0.45)}"/>` : ''}
        <g opacity="${A(1 - dead * 0.5 - dim * 0.35)}">
          ${dead > 0.5 ? '' : glyphSvg}
          <g opacity="${A(e.labelFade ?? 1)}">${labelSvg}</g>
        </g>
        ${deadMark}
      </g>
    </g>`;

  // Pills and tags
  const isBelow = e.pills === 'below';
  let stackY = isBelow ? geo.Bd[1] - lift + 20 : geo.T[1] - lift - 17;
  const pillItems: string[] = [];
  if (e.cpu !== undefined && e.cpu >= 0) {
    pillItems.push(Wr(cx, 0, e.cpu));
  }
  for (const tag of e.tags || []) {
    pillItems.push(`<g opacity="${A(e.tagFade ?? 1)}">${zr(cx, 0, tag.text, tag)}</g>`);
  }

  let overSvg = '';
  for (const item of pillItems) {
    overSvg += `<g transform="translate(0 ${A(stackY)})">${item}</g>`;
    stackY += isBelow ? 26 : -26;
  }
  if (overSvg) {
    overSvg = `<g opacity="${A(e.opacity ?? 1)}">${overSvg}</g>`;
  }

  const poly: [number, number][] = geo.outline.map(([px, py]) => [px, py - lift]);
  const bounds = Jr(
    geo.outline,
    isBelow
      ? [8, 8, 8, 14 + pillItems.length * 26]
      : [8, 8 + Math.max(pillItems.length, 1) * 26, 8, 14]
  );

  return { body: bodySvg, over: overSvg, poly, bounds };
}

// Database Cylinder Renderer (Shards, Storage, Replicas)
export function renderDb(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const r = e.r || 1.7;
  const h = e.h || 38;
  const t = Math.SQRT2 * 14 * r;
  const n = t / 2;
  const [cx, cy] = project(e.x ?? 0, e.y ?? 0, 0);
  const lift = e.lift || 0;
  const groundY = cy - lift;
  const topY = groundY - h;

  const cylPath = `M${A(cx - t)},${A(topY)} V${A(groundY)} A${A(t)},${A(n)} 0 0 0 ${A(cx + t)},${A(groundY)} V${A(topY)} Z`;
  const cylOutline = `M${A(cx - t)},${A(topY)} V${A(groundY)} A${A(t)},${A(n)} 0 0 0 ${A(cx + t)},${A(groundY)} V${A(topY)}`;
  const dropShadowFactor = 1 - Math.min(1, lift / 140) * 0.85;

  // 3D liquid fill
  const cpuVal = e.cpu !== undefined && e.cpu >= 0 ? Mr(e.cpu) : 0;
  let liquidSvg = '';
  if (cpuVal > 0.004) {
    const liqTop = groundY - cpuVal * h;
    const [fillColor, strokeColor] =
      e.cpu! < 0.6
        ? ['#cfe8c0', '#5fa95a']
        : e.cpu! < 0.85
        ? ['#f9dca3', '#d99a2b']
        : ['#f5bdb2', '#d9473d'];
    const liqBody = `M${A(cx - t)},${A(liqTop)} A${A(t)},${A(n)} 0 0 0 ${A(cx + t)},${A(liqTop)} V${A(groundY)} A${A(t)},${A(n)} 0 0 1 ${A(cx - t)},${A(groundY)} Z`;
    const liqArc = `M${A(cx - t + 1)},${A(liqTop)} A${A(t - 1)},${A(n - 0.5)} 0 0 0 ${A(cx + t - 1)},${A(liqTop)}`;
    liquidSvg = `
      <path d="${liqBody}" fill="${fillColor}" opacity=".92"/>
      ${cpuVal < 0.995 ? `<path d="${liqArc}" fill="none" stroke="${strokeColor}" stroke-width="1.6" stroke-linecap="round"/>` : ''}
    `;
  }

  const heat = e.heat || 0;
  const color = e.color || 'purple';

  const bodySvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      <ellipse cx="${A(cx)}" cy="${A(cy + 5)}" rx="${A(t + 3)}" ry="${A(n + 1)}" fill="#6b5236" opacity="${A(0.22 * dropShadowFactor)}" filter="url(#blur-md)"/>
      ${heat > 0.01 ? `<g class="pulse"><path d="${cylPath}" fill="#f0552f" opacity="${A(heat * 0.7)}" filter="url(#glow)"/></g>` : ''}
      <path d="${cylPath}" fill="url(#g-${color}-side)"/>
      ${liquidSvg}
      <path d="${cylPath}" fill="url(#cyl-sheen)"/>
      <ellipse cx="${A(cx)}" cy="${A(topY)}" rx="${A(t)}" ry="${A(n)}" fill="url(#g-${color}-top)"/>
      <path d="M${A(cx - t + 3)},${A(topY + 2.5)} A${A(t - 3)},${A(n - 2)} 0 0 0 ${A(cx + t - 3)},${A(topY + 2.5)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"/>
      <path d="${cylOutline}" fill="none" stroke="${k}" stroke-width="1.9" stroke-linejoin="round"/>
      <ellipse cx="${A(cx)}" cy="${A(topY)}" rx="${A(t)}" ry="${A(n)}" fill="none" stroke="${k}" stroke-width="1.9"/>
      ${renderIconSvg(e.glyph || 'database', cx, topY + n + h / 2, 19, { stroke: 1.8 })}
    </g>`;

  // Stacking pills above top rim
  const labelText = e.label ? (Array.isArray(e.label) ? e.label.join(' ') : String(e.label)) : '';
  const labelWidth = Rr(labelText, 10.5) + 33;
  let overSvg = labelText
    ? `<g opacity="${A(e.labelFade ?? 1)}">${zr(cx + t + 10 + labelWidth / 2, groundY - h * 0.35, labelText, { icon: 'database' })}</g>`
    : '';

  let stackY = topY - n - 15;
  const pillItems: string[] = [];
  if (e.cpu !== undefined && e.cpu >= 0) {
    pillItems.push(Wr(cx, 0, e.cpu));
  }
  for (const tag of e.tags || []) {
    pillItems.push(`<g opacity="${A(e.tagFade ?? 1)}">${zr(cx, 0, tag.text, tag)}</g>`);
  }
  for (const item of pillItems) {
    overSvg += `<g transform="translate(0 ${A(stackY)})">${item}</g>`;
    stackY -= 26;
  }
  if (overSvg) {
    overSvg = `<g opacity="${A(e.opacity ?? 1)}">${overSvg}</g>`;
  }

  // Exact cylinder poly boundary for cable trimming
  const poly: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    poly.push([cx - t * Math.cos((Math.PI * i) / 8), topY - n * Math.sin((Math.PI * i) / 8)]);
  }
  for (let i = 0; i <= 8; i++) {
    poly.push([cx + t * Math.cos((Math.PI * i) / 8), groundY + n * Math.sin((Math.PI * i) / 8)]);
  }

  const bounds: [number, number, number, number] = [
    cx - t - 8,
    topY - n - 12 - pillItems.length * 26,
    cx + t + (labelText ? labelWidth + 18 : 8),
    groundY + n + 10
  ];

  return { body: bodySvg, over: overSvg, poly, bounds };
}

// Consistent Hashing Ring Renderer
export function renderRing(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const r = e.r || 10;
  const toPt = (deg: number, rad = r): [number, number] => {
    const theta = (deg * Math.PI) / 180;
    return project((e.x ?? 0) + rad * Math.cos(theta), (e.y ?? 0) + rad * Math.sin(theta), 0);
  };

  const arcPath = (fromDeg: number, toDeg: number, rad = r): string => {
    let d = '';
    const steps = Math.max(2, Math.ceil(Math.abs(toDeg - fromDeg) / 3));
    for (let i = 0; i <= steps; i++) {
      const [px, py] = toPt(fromDeg + ((toDeg - fromDeg) * i) / steps, rad);
      d += `${i === 0 ? 'M' : 'L'}${A(px)},${A(py)} `;
    }
    return d;
  };

  const sortedNodes = [...(e.nodes || [])].sort((a, b) => a.a - b.a);

  let arcsSvg = '';
  sortedNodes.forEach((node, i) => {
    const next = sortedNodes[(i + 1) % sortedNodes.length];
    const nextAngle = next.a > node.a ? next.a : next.a + 360;
    const sideColor = vr[node.color]?.side[1] || '#9FD28F';
    arcsSvg += `<path d="${arcPath(node.a, nextAngle)}" fill="none" stroke="${sideColor}" stroke-width="10" stroke-opacity=".55"/>`;
  });

  let arrowsSvg = '';
  for (let n = 22; n < 360; n += 60) {
    const [x1, y1] = toPt(n + 2.5, r + 1.4);
    const [x0, y0] = toPt(n, r + 1.4);
    const angle = (Math.atan2(y0 - y1, x0 - x1) * 180) / Math.PI;
    arrowsSvg += `<path d="M-4,-3.5 L1,0 L-4,3.5" transform="translate(${A(x0)} ${A(y0)}) rotate(${A(angle)})" fill="none" stroke="#a59c90" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  const diamondsSvg = sortedNodes
    .filter((n) => n.mark)
    .map((n) => {
      const [nx, ny] = toPt(n.a);
      const topColor = vr[n.color]?.top[1] || '#F6CD82';
      return `<path d="M${A(nx)},${A(ny - 6)} L${A(nx + 9)},${A(ny)} L${A(nx)},${A(ny + 6)} L${A(nx - 9)},${A(ny)} Z" fill="${topColor}" stroke="${k}" stroke-width="1.4"/>`;
    })
    .join('');

  const movedSet = new Set(e.moved || []);
  const keysSvg = (e.keys || [])
    .map((deg) => {
      const [kx, ky] = toPt(deg);
      let owner = sortedNodes[sortedNodes.length - 1];
      for (const node of sortedNodes) {
        if (node.a <= deg) owner = node;
      }
      const dotColor = owner ? vr[owner.color]?.side[0] || '#fbf6ef' : '#fbf6ef';
      const movedRing = movedSet.has(deg)
        ? `<circle class="moved" cx="${A(kx)}" cy="${A(ky)}" r="9" fill="none" stroke="#e5534b" stroke-width="2"/>`
        : '';
      return `${movedRing}<circle cx="${A(kx)}" cy="${A(ky)}" r="4.6" fill="${dotColor}" stroke="${k}" stroke-width="1.4"/>`;
    })
    .join('');

  const fullTrack = arcPath(0, 360);
  const [labelX, labelY] = toPt(135, r + 2.2);

  const bodySvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      <path d="${arcPath(0, 360, r + 0.9)}" fill="none" stroke="#e8ddcf" stroke-width="1"/>
      <path d="${fullTrack}" fill="#fffaf2" fill-opacity=".35" stroke="${k}" stroke-opacity=".55" stroke-width="1.5"/>
      ${arcsSvg}
      ${arrowsSvg}
      ${diamondsSvg}
      ${keysSvg}
    </g>`;

  const overSvg = e.label
    ? `<g opacity="${A(e.opacity ?? 1)}">${zr(labelX, labelY - 12, String(e.label), { tone: 'gray', icon: 'replay' })}</g>`
    : '';

  const poly: [number, number][] = [];
  for (let a = 0; a < 360; a += 15) {
    poly.push(toPt(a, r + 1.6));
  }

  return { body: bodySvg, over: overSvg, poly, bounds: Jr(poly, [10, 34, 10, 10]) };
}

// Zone Renderer (Subnets, VPCs, Regions)
export function renderZone(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const x0 = e.x0 ?? 0;
  const x1 = e.x1 ?? 0;
  const y0 = e.y0 ?? 0;
  const y1 = e.y1 ?? 0;
  const pts: [number, number][] = [project(x0, y0), project(x0, y1), project(x1, y1), project(x1, y0)];
  const labelSvg = e.label
    ? `<text transform="${br(x0 + 0.9, y0 + 0.55, 0)}" font-size="10.5" font-weight="800" letter-spacing="1.6" fill="#6f6961">${e.label}</text>`
    : '';

  const bodySvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      <path d="${Sr(pts, 8)}" fill="#fffaf2" fill-opacity=".55" stroke="${k}" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="6 5"/>
      ${labelSvg}
    </g>`;

  return { body: bodySvg, over: '', poly: pts, bounds: Jr(pts, [6, 6, 6, 6]) };
}

// Queue Renderer (Message queues, Kafka topics, task buffers)
export function renderQueue(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const count = e.n ?? 0;
  const gap = e.gap ?? 1;
  const dir = e.dir || [0, -1];
  const color = e.color || '#efb041';
  const pts: [number, number][] = [];
  let dotsSvg = '';
  const ceilN = Math.ceil(count);

  for (let i = ceilN - 1; i >= 0; i--) {
    const alpha = Mr(count - i);
    const [qx, qy] = project((e.x ?? 0) + dir[0] * gap * i, (e.y ?? 0) + dir[1] * gap * i, 0);
    pts.push([qx, qy]);
    dotsSvg += `<g opacity="${A(alpha * (e.opacity ?? 1))}" transform="translate(${A(qx)} ${A(qy - (1 - alpha) * 8)}) scale(${A(0.5 + alpha * 0.5)})">
      <circle r="4.6" fill="${color}" stroke="${k}" stroke-width="1.5"/></g>`;
  }

  return {
    body: dotsSvg,
    over: '',
    poly: pts,
    bounds: pts.length ? Jr(pts, [8, 8, 8, 8]) : [0, 0, 0, 0]
  };
}

// Panel Card Renderer (HUD Cards, Hockey stick charts, Metric bars)
export function renderPanel(e: IsoEntity): { body: string; over: string; poly: null; bounds: [number, number, number, number]; size: { w: number; h: number } } {
  const [baseX, baseY] = project(e.x ?? 0, e.y ?? 0, e.z ?? 0);
  const u = baseX + (e.dx ?? 0);
  const d = baseY + (e.dy ?? 0) - (e.lift ?? 0);
  const lines = e.lines || [];
  const title = e.title || '';

  const w = e.w || Math.max(220, title.length * 9 + 48);
  const chartHeight = e.chart === 'hockey' ? 96 : e.chart === 'bars' ? (e.bars || []).length * 19 : 0;
  const h = 34 + lines.length * 18 + (chartHeight ? chartHeight + 16 : 0) + 6;

  let linesSvg = '';
  lines.forEach((line, idx) => {
    const lineY = d + 34 + idx * 18 + 12;
    if (line.startsWith('= ')) {
      linesSvg += `<rect x="${A(u + 10)}" y="${A(lineY - 13)}" width="${A(w - 20)}" height="18" rx="5" fill="#dcefd2"/>`;
      linesSvg += `<text x="${A(u + 16)}" y="${A(lineY)}" font-size="11.5" font-weight="800" fill="#24521c">${line.slice(2)}</text>`;
    } else if (line.startsWith('! ')) {
      linesSvg += `<rect x="${A(u + 10)}" y="${A(lineY - 13)}" width="${A(w - 20)}" height="18" rx="5" fill="#f8d5cf"/>`;
      linesSvg += `<text x="${A(u + 16)}" y="${A(lineY)}" font-size="11.5" font-weight="800" fill="#8f2a22">${line.slice(2)}</text>`;
    } else if (line.startsWith('# ')) {
      linesSvg += `<text x="${A(u + 16)}" y="${A(lineY)}" font-size="10.5" font-weight="500" fill="#8b847a">${line.slice(2)}</text>`;
    } else {
      linesSvg += `<text x="${A(u + 16)}" y="${A(lineY)}" font-size="11.5" font-weight="500" fill="#34302b">${line}</text>`;
    }
  });

  const overSvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      <rect x="${A(u)}" y="${A(d + 2.5)}" width="${A(w)}" height="${A(h)}" rx="10" fill="${_r}"/>
      <rect x="${A(u)}" y="${A(d)}" width="${A(w)}" height="${A(h)}" rx="10" fill="#fbf7f1" stroke="${k}" stroke-width="1.4"/>
      <path d="M${A(u + 12)},${A(d + 30)} H${A(u + w - 12)}" stroke="#e6ddd0" stroke-width="1"/>
      <g opacity="${A(e.fade ?? 1)}">
        ${renderIconSvg(e.icon || 'sparkles', u + 20, d + 18, 13, { stroke: 2.1, color: '#6f6961' })}
        <text x="${A(u + 33)}" y="${A(d + 21.5)}" font-size="10" font-weight="800" letter-spacing="1" fill="#6f6961">${title.toUpperCase()}</text>
        ${linesSvg}
      </g>
    </g>`;

  return {
    body: '',
    over: overSvg,
    poly: null,
    size: { w, h },
    bounds: [u - 6, d - 6, u + w + 6, d + h + 10]
  };
}

// Crowd Slab Renderer (Isometric User Avatars)
const AVATAR_COLORS = ['#F3B47F', '#A9C5E8', '#B3D79F', '#CBBAE6', '#F6CD82'];
const AVATAR_SPACING = 1.75;
const pseudoHash = (e: number, t: number) => {
  const n = Math.sin(e * 127.1 + t * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

function renderAvatar(x: number, y: number, z: number, alpha: number, color: string): string {
  const [a, o] = project(x, y, z);
  const s = (0.35 + 0.65 * alpha) * 1.3;
  return `
    <g opacity="${A(alpha)}" transform="translate(${A(a)} ${A(o - (1 - alpha) * 10)}) scale(${A(s)})">
      <ellipse cx="0" cy="0" rx="5.6" ry="2.8" fill="#6b5236" opacity=".18"/>
      <path d="M-5.2,0 V-9 A5.2,5.2 0 0 1 5.2,-9 V0 A5.2,2.4 0 0 1 -5.2,0 Z" fill="${color}" stroke="${k}" stroke-width="1.25"/>
      <circle cx="0" cy="-17.6" r="4.3" fill="#fdf6ec" stroke="${k}" stroke-width="1.25"/>
    </g>`;
}

export function renderCrowd(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const x0 = e.x0 ?? 0;
  const x1 = e.x1 ?? 0;
  const y0 = e.y0 ?? 0;
  const y1 = e.y1 ?? 0;
  const geo = Gr({ x0, x1, y0, y1, h: 10, radius: 8 });
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const halfW = (x1 - x0) / 2 - 0.85;
  const halfD = (y1 - y0) / 2 - 0.85;
  const o = Math.floor(halfW / AVATAR_SPACING);
  const s = Math.floor(halfD / AVATAR_SPACING);
  const slots: Array<{ i: number; j: number; key: number }> = [];

  for (let di = -o; di <= o; di++) {
    for (let dj = -s; dj <= s; dj++) {
      slots.push({ i: di, j: dj, key: Math.abs(di) + pseudoHash(di, dj) * 1.6 });
    }
  }
  slots.sort((a, b) => a.key - b.key);

  const count = e.count ?? 0;
  const avatarsSvg = slots
    .map((slot, idx) => ({ ...slot, a: Mr(count - idx) }))
    .filter((slot) => slot.a > 0.01)
    .sort((a, b) => a.i - a.j - (b.i - b.j))
    .map((slot) =>
      renderAvatar(
        midX + slot.i * AVATAR_SPACING,
        midY + slot.j * AVATAR_SPACING,
        10,
        slot.a,
        AVATAR_COLORS[Math.abs(slot.i * 3 + slot.j * 7) % AVATAR_COLORS.length]
      )
    )
    .join('');

  const lift = e.lift || 0;
  const bodySvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      ${qr(geo, 10, lift, 0.2)}
      <g transform="translate(0 ${A(-lift)})">
        ${Kr(geo, 'slab', { stroke: '#3b3631', sw: 1.5 })}
        ${avatarsSvg}
      </g>
    </g>`;

  const [cornerX, cornerY] = project(x1, y0, 0);
  const overSvg = e.label
    ? `<g opacity="${A((e.opacity ?? 1) * (e.labelFade ?? 1))}" transform="translate(0 ${A(-lift)})">${zr(cornerX, cornerY + 22, String(e.label), { icon: 'users' })}</g>`
    : '';

  const poly: [number, number][] = geo.outline.map(([px, py]) => [px, py - lift]);
  return { body: bodySvg, over: overSvg, poly, bounds: Jr(geo.outline, [8, 34, 8, 40]) };
}

// Ghost Box Renderer (Dashed Wireframe for Planned or Migrating Nodes)
export function renderGhost(e: IsoEntity): { body: string; over: string; poly: null; bounds: [number, number, number, number] } {
  const s = e.s || 6;
  const h = e.h || 90;
  const t = (e.x ?? 0) - s / 2;
  const n = (e.x ?? 0) + s / 2;
  const r = (e.y ?? 0) - s / 2;
  const i = (e.y ?? 0) + s / 2;

  const topPts: [number, number][] = [project(t, r, h), project(t, i, h), project(n, i, h), project(n, r, h)];
  const botPts: [number, number][] = [project(t, r, 0), project(t, i, 0), project(n, i, 0), project(n, r, 0)];

  const line = (p1: [number, number], p2: [number, number], dim = false) =>
    `<path d="M${A(p1[0])},${A(p1[1])} L${A(p2[0])},${A(p2[1])}" stroke="${k}" stroke-opacity="${dim ? 0.22 : 0.55}" stroke-width="1.4" stroke-dasharray="5 4" fill="none"/>`;

  const lines = [
    line(topPts[0], topPts[1]),
    line(topPts[1], topPts[2]),
    line(topPts[2], topPts[3]),
    line(topPts[3], topPts[0]),
    line(botPts[0], botPts[3]),
    line(botPts[3], botPts[2]),
    line(topPts[0], botPts[0]),
    line(topPts[2], botPts[2]),
    line(topPts[3], botPts[3]),
    line(botPts[0], botPts[1], true),
    line(botPts[1], botPts[2], true),
    line(topPts[1], botPts[1], true)
  ].join('');

  const [cornerX, cornerY] = topPts[2];
  const labelWidth = Rr(e.label ? String(e.label) : '', 10.5) + 33;
  const overSvg = e.label
    ? `<g opacity="${A(e.opacity ?? 1)}">${zr(cornerX + 14 + labelWidth / 2, cornerY + 18, String(e.label), { tone: 'gray', icon: 'alert' })}</g>`
    : '';

  return {
    body: `<g opacity="${A(e.opacity ?? 1)}">${lines}</g>`,
    over: overSvg,
    poly: null,
    bounds: Jr([...topPts, ...botPts, [cornerX + 22 + labelWidth, cornerY]], [8, 30, 8, 8])
  };
}

// Device Renderer (Laptop with Screen & Keyboard Matrix)
function renderBoxFaces(
  box: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number },
  style: { top: string; front: string; left: string; sw?: number; r?: number }
): string {
  const sw = style.sw ?? 1.5;
  const r = style.r ?? 2;
  const d = [project(box.x0, box.y0, box.z1), project(box.x0, box.y1, box.z1), project(box.x1, box.y1, box.z1), project(box.x1, box.y0, box.z1)];
  const f = [project(box.x1, box.y0, box.z1), project(box.x1, box.y1, box.z1), project(box.x1, box.y1, box.z0), project(box.x1, box.y0, box.z0)];
  const p = [project(box.x0, box.y0, box.z1), project(box.x1, box.y0, box.z1), project(box.x1, box.y0, box.z0), project(box.x0, box.y0, box.z0)];
  const m = [project(box.x0, box.y0, box.z1), project(box.x0, box.y1, box.z1), project(box.x1, box.y1, box.z1), project(box.x1, box.y1, box.z0), project(box.x1, box.y0, box.z0), project(box.x0, box.y0, box.z0)];

  return `
    <path d="${Sr(p, r)}" fill="${style.left}"/>
    <path d="${Sr(f, r)}" fill="${style.front}"/>
    <path d="${Sr(d, r)}" fill="${style.top}"/>
    <path d="${Sr(m, r)}" fill="none" stroke="${k}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

export function renderDevice(e: IsoEntity): { body: string; over: string; poly: [number, number][]; bounds: [number, number, number, number] } {
  const w = e.w || 6;
  const d = e.d || 6;
  const x = e.x ?? 0;
  const y = e.y ?? 0;
  const t = x - d / 2;
  const n = x + d / 2;
  const r = y - w / 2;
  const i = y + w / 2;
  const geo = Gr({ x0: t, x1: n, y0: r, y1: i, h: 16, radius: 9 });

  const screenBox = { x0: t + 0.7, x1: t + 1.05, y0: r + 0.9, y1: i - 0.9, z0: 19, z1: 66 };
  const baseBox = { x0: screenBox.x1, x1: screenBox.x1 + 2.7, y0: screenBox.y0, y1: screenBox.y1, z0: 16, z1: 19 };
  const keyboardW = (screenBox.y1 - screenBox.y0) * 14;
  const screenH = screenBox.z1 - screenBox.z0;

  let keysGrid = '';
  const cols = Math.floor((keyboardW - 6) / 4.7);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < cols; col++) {
      keysGrid += `<rect x="${A(3 + col * 4.7)}" y="${A(2.5 + row * 4.3)}" width="3.8" height="3.3" rx=".7"/>`;
    }
  }

  const screenInnerW = keyboardW - 6.8;
  const screenInnerH = screenH - 8;
  const screenContent = `
    <rect x="3.4" y="3.4" width="${A(screenInnerW)}" height="${A(screenInnerH)}" rx="1.5" fill="#FBF8F4"/>
    <rect x="3.4" y="3.4" width="${A(screenInnerW)}" height="7" rx="1.5" fill="#E4D9CB"/>
    <circle cx="6.6" cy="6.9" r="1" fill="#E5534B"/><circle cx="9.6" cy="6.9" r="1" fill="#EFB041"/><circle cx="12.6" cy="6.9" r="1" fill="#7FC278"/>
    <rect x="16" y="5" width="${A(screenInnerW - 16)}" height="3.8" rx="1.9" fill="#FBF8F4"/>
    <rect x="7" y="14.5" width="${A(screenInnerW - 7.2)}" height="12" rx="1.5" fill="url(#screen)"/>
    <rect x="7" y="29.5" width="${A((screenInnerW - 7.2) * 0.62)}" height="2.6" rx="1.3" fill="#D6CCBF"/>
    <rect x="7" y="34" width="${A((screenInnerW - 7.2) * 0.8)}" height="2.6" rx="1.3" fill="#D6CCBF"/>
    <rect x="3.4" y="3.4" width="${A(screenInnerW)}" height="${A(screenInnerH)}" rx="1.5" fill="url(#screen-glare)"/>`;

  const lift = e.lift || 0;
  const bodySvg = `
    <g opacity="${A(e.opacity ?? 1)}">
      ${qr(geo, 16, lift, 0.2)}
      <g transform="translate(0 ${A(-lift)})">
        ${Kr(geo, 'slab', { stroke: '#3b3631', sw: 1.5 })}
        <path d="${Sr([project(screenBox.x0 - 0.3, screenBox.y0 - 0.3, 16), project(screenBox.x0 - 0.3, screenBox.y1 + 0.3, 16), project(baseBox.x1 + 0.3, baseBox.y1 + 0.3, 16), project(baseBox.x1 + 0.3, baseBox.y0 - 0.3, 16)], 6)}" fill="#6b5236" opacity=".14" filter="url(#blur-sm)"/>
        ${renderBoxFaces(baseBox, { top: '#efeae4', front: '#cfc8c0', left: '#ddd6ce', r: 2.5, sw: 1.4 })}
        <g transform="${xr(baseBox.x0 + 0.15, baseBox.y0, baseBox.z1)}" fill="#fbf8f4" stroke="#b9b1a7" stroke-width=".55">
          ${keysGrid}
          <rect x="${A(keyboardW / 2 - 10)}" y="21.5" width="20" height="9" rx="1.6"/>
        </g>
        ${renderBoxFaces(screenBox, { top: '#8B8580', front: '#3D3935', left: '#6E6862', r: 3, sw: 1.5 })}
        <g transform="${yr(screenBox.x1, screenBox.y0, screenBox.z1)}">${screenContent}</g>
      </g>
    </g>`;

  const [cornerX, cornerY] = project(n, r, 0);
  const [tagOriginX, tagOriginY] = project(screenBox.x0, (screenBox.y0 + screenBox.y1) / 2, screenBox.z1);

  let overSvg = e.label
    ? `<g opacity="${A(e.labelFade ?? 1)}">${zr(cornerX, cornerY + 22, String(e.label), { icon: 'user' })}</g>`
    : '';

  let stackY = tagOriginY - 22;
  for (const tag of e.tags || []) {
    overSvg += `<g transform="translate(0 ${A(stackY)})" opacity="${A(e.tagFade ?? 1)}">${zr(tagOriginX, 0, tag.text, tag)}</g>`;
    stackY -= 26;
  }
  if (overSvg) {
    overSvg = `<g opacity="${A(e.opacity ?? 1)}" transform="translate(0 ${A(-lift)})">${overSvg}</g>`;
  }

  const poly: [number, number][] = geo.outline.map(([px, py]) => [px, py - lift]);
  return {
    body: bodySvg,
    over: overSvg,
    poly,
    bounds: Jr([...geo.outline, [tagOriginX, tagOriginY]], [8, 18 + (e.tags || []).length * 26, 8, 40])
  };
}

// Master Entity Dispatcher
export function renderEntity(e: IsoEntity): { body: string; over: string; poly: [number, number][] | null; bounds: [number, number, number, number] } {
  const type = e.type || 'block';
  if (type === 'block') return renderBlock(e);
  if (type === 'db') return renderDb(e);
  if (type === 'ring') return renderRing(e);
  if (type === 'zone') return renderZone(e);
  if (type === 'queue') return renderQueue(e);
  if (type === 'panel') return renderPanel(e);
  if (type === 'crowd') return renderCrowd(e);
  if (type === 'ghost') return renderGhost(e);
  if (type === 'device') return renderDevice(e);
  return renderBlock(e);
}

// Isometric Depth Calculation for layer-ents DOM sorting
export function getDepth(e: IsoEntity): number {
  if (e.type === 'zone' || e.type === 'ring') return -1e4;
  if (e.type === 'queue') return -1e3;
  if (e.type === 'panel') return 1e4;
  const x = e.type === 'crowd' ? ((e.x0 ?? 0) + (e.x1 ?? 0)) / 2 : (e.x ?? 0);
  const y = e.type === 'crowd' ? ((e.y0 ?? 0) + (e.y1 ?? 0)) / 2 : (e.y ?? 0);
  return x - y - (e.type === 'ghost' ? 0.5 : 0);
}

// Layout & Camera ViewBox Auto-Fit Calculation
export function layoutOf(scene: SceneGraph) {
  const polys: Record<string, [number, number][]> = {};
  let bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];

  const updateBounds = (b: [number, number, number, number]) => {
    bounds = [
      Math.min(bounds[0], b[0]),
      Math.min(bounds[1], b[1]),
      Math.max(bounds[2], b[2]),
      Math.max(bounds[3], b[3])
    ];
  };

  const entities = scene.entities || {};
  for (const [id, ent] of Object.entries(entities)) {
    const res = renderEntity(ent);
    if (res.poly) polys[id] = res.poly;
    if (res.bounds) updateBounds(res.bounds);
  }

  // Include links
  const getCenter = (id: string): [number, number] => {
    const ent = entities[id];
    if (!ent) return [0, 0];
    if (ent.type === 'crowd' || ent.type === 'zone') {
      return [((ent.x0 ?? 0) + (ent.x1 ?? 0)) / 2, ((ent.y0 ?? 0) + (ent.y1 ?? 0)) / 2];
    }
    return [ent.x ?? 0, ent.y ?? 0];
  };

  const links = scene.links || {};
  for (const [, link] of Object.entries(links)) {
    let pts = (link.pts || []).map((pt: any) => project(...ip(pt, getCenter)));
    if (link.from && polys[link.from]) pts = Tr(pts, polys[link.from], 3);
    if (link.to && polys[link.to]) pts = Er(pts, polys[link.to], link.heads === 'none' ? 3 : 4);
    for (const [px, py] of pts) {
      updateBounds([px - 8, py - 8, px + 8, py + 8]);
    }
  }

  if (bounds[0] === Infinity) {
    bounds = [-200, -140, 200, 140];
  }

  return { bounds, polys };
}

export function planFor(scene: SceneGraph, width: number, height: number) {
  const { bounds, polys } = layoutOf(scene);
  const [minX, minY, maxX, maxY] = bounds;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);

  const containerW = Math.max(1, width);
  const containerH = Math.max(1, height);

  // Leave 40px comfortable padding around the bounding box
  const padding = 40;
  const scaleX = (containerW - padding * 2) / w;
  const scaleY = (containerH - padding * 2) / h;
  const zoom = Math.min(1.6, Math.max(0.4, Math.min(scaleX, scaleY)));

  const camW = containerW / zoom;
  const camH = containerH / zoom;
  const camX = minX - (camW - w) / 2;
  const camY = minY - (camH - h) / 2;

  return {
    cam: { x: camX, y: camY, w: camW, h: camH },
    zoom,
    bounds,
    polys
  };
}
