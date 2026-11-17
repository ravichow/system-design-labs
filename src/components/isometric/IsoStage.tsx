import React, { useState, useRef, useMemo } from 'react';
import { SceneGraph, IsoEntity, TagInfo } from '../../types';
import {
  project,
  computeBoxGeometry,
  computeCylinderGeometry,
  computeRingGeometry,
  Sr,
  Cr,
  Tr,
  Er,
  ip,
  A
} from './IsoEngine';
import { renderIsoIcon } from './IsoIcons';

interface IsoStageProps {
  scene: SceneGraph;
  className?: string;
}

export const IsoStage: React.FC<IsoStageProps> = ({ scene, className }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.min(2.2, Math.max(0.5, zoom - e.deltaY * 0.0015));
    setZoom(newZoom);
  };

  // Center coordinate resolver for entities
  const getEntityCenter = (id: string): [number, number] => {
    const ent = scene.entities[id];
    if (!ent) return [0, 0];
    if (ent.type === 'crowd' || ent.type === 'zone') {
      return [((ent.x0 ?? 0) + (ent.x1 ?? 0)) / 2, ((ent.y0 ?? 0) + (ent.y1 ?? 0)) / 2];
    }
    return [ent.x ?? 0, ent.y ?? 0];
  };

  // Precompute entity polygon boundaries for cable clipping
  const entityPolys = useMemo(() => {
    const map: Record<string, [number, number][]> = {};
    for (const [id, ent] of Object.entries(scene.entities)) {
      if (ent.type === 'block' || !ent.type) {
        const size = ent.s || 4;
        const height = ent.h || 38;
        const geo = computeBoxGeometry(ent.x ?? 0, ent.y ?? 0, size, height);
        map[id] = geo.outline;
      } else if (ent.type === 'db') {
        const cyl = computeCylinderGeometry(ent.x ?? 0, ent.y ?? 0, ent.r || 1.7, ent.h || 38);
        map[id] = cyl.poly;
      } else if (ent.type === 'zone') {
        const x0 = ent.x0 ?? 0;
        const x1 = ent.x1 ?? 0;
        const y0 = ent.y0 ?? 0;
        const y1 = ent.y1 ?? 0;
        map[id] = [project(x0, y0), project(x0, y1), project(x1, y1), project(x1, y0)];
      } else if (ent.type === 'ring') {
        const ring = computeRingGeometry(ent.x ?? 0, ent.y ?? 0, ent.r || 10);
        map[id] = ring.poly;
      }
    }
    return map;
  }, [scene.entities]);

  // Render floating tags & CPU meters
  const renderPill = (cx: number, cy: number, tag: TagInfo) => {
    const tone = tag.tone || 'paper';
    const bg =
      tone === 'red'
        ? '#f8d5cf'
        : tone === 'green'
        ? '#dcefd2'
        : tone === 'amber'
        ? '#fbe5bd'
        : tone === 'violet'
        ? '#e7ddf5'
        : tone === 'gray'
        ? '#ebe5dc'
        : tone === 'blue'
        ? '#dfebf9'
        : '#fbf6ef';
    const fg =
      tone === 'red'
        ? '#8f2a22'
        : tone === 'green'
        ? '#24521c'
        : tone === 'amber'
        ? '#6d4a0c'
        : tone === 'violet'
        ? '#47306f'
        : tone === 'gray'
        ? '#5f5850'
        : '#1c1a17';

    const width = Math.max(38, tag.text.length * 7.5 + (tag.icon ? 24 : 16));
    const height = 21;
    const px = cx - width / 2;
    const py = cy - height / 2;

    return (
      <g key={tag.text} className="pill">
        <rect x={A(px)} y={A(py + 2)} width={A(width)} height={height} rx={height / 2} fill="#1c1a17" />
        <rect x={A(px)} y={A(py)} width={A(width)} height={height} rx={height / 2} fill={bg} stroke="var(--ink)" strokeWidth="1.3" />
        {tag.icon && renderIsoIcon(tag.icon, px + 12, cy, { size: 12, stroke: 2.2, color: fg })}
        <text
          x={A(tag.icon ? px + 16 + (width - 16) / 2 : cx)}
          y={A(cy + 3.8)}
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill={fg}
        >
          {tag.text}
        </text>
      </g>
    );
  };

  const renderCpuMeter = (cx: number, cy: number, cpu: number) => {
    const pct = Math.round(Math.min(1, Math.max(0, cpu)) * 100);
    const barColor = cpu > 0.85 ? '#e5534b' : cpu > 0.6 ? '#efb041' : '#7fc278';
    const w = 86;
    const h = 21;
    const ox = cx - w / 2;
    const oy = cy - h / 2;

    return (
      <g className="pill">
        <rect x={A(ox)} y={A(oy + 2)} width={w} height={h} rx={h / 2} fill="#1c1a17" />
        <rect x={A(ox)} y={A(oy)} width={w} height={h} rx={h / 2} fill="#fbf6ef" stroke="var(--ink)" strokeWidth="1.3" />
        {renderIsoIcon('cpu', ox + 13, cy, { size: 11, stroke: 2.2, color: '#6f6961' })}
        <rect x={A(ox + 23)} y={A(cy - 3.5)} width={28} height={7} rx={3.5} fill="#e6ddd0" />
        <rect x={A(ox + 23)} y={A(cy - 3.5)} width={A(Math.max(3, 28 * Math.min(1, cpu)))} height={7} rx={3.5} fill={barColor} />
        <text x={A(ox + w - 9)} y={A(cy + 3.6)} textAnchor="end" fontSize="10.5" fontWeight="800" fill="var(--ink)">
          {pct}%
        </text>
      </g>
    );
  };

  // Render individual entities based on their authentic type
  const renderEntity = (id: string, entity: IsoEntity) => {
    const type = entity.type || 'block';
    const opacity = entity.opacity ?? 1;
    const lift = entity.lift ?? 0;

    // --- 1. RING (Consistent Hashing) ---
    if (type === 'ring') {
      const ring = computeRingGeometry(
        entity.x ?? 0,
        entity.y ?? 0,
        entity.r || 10,
        entity.nodes || [],
        entity.keys || [],
        entity.moved || []
      );

      return (
        <g key={id} opacity={opacity}>
          {/* Outer guide track */}
          <path d={ring.outerTrackD} fill="none" stroke="#e8ddcf" strokeWidth="1" />
          {/* Main hash space ring */}
          <path d={ring.fullTrackD} fill="#fffaf2" fillOpacity="0.35" stroke="var(--ink)" strokeOpacity="0.55" strokeWidth="1.5" />

          {/* Colored server ownership arcs */}
          {ring.serverArcs.map((arc, i) => (
            <path
              key={i}
              d={arc.d}
              fill="none"
              stroke={`url(#g-${arc.color}-side)`}
              strokeWidth="10"
              strokeOpacity="0.55"
              strokeLinecap="round"
            />
          ))}

          {/* Directional navigation arrows */}
          {ring.dirArrows.map((arrow, i) => (
            <path
              key={i}
              d="M-4,-3.5 L1,0 L-4,3.5"
              transform={`translate(${A(arrow.x)} ${A(arrow.y)}) rotate(${A(arrow.angle)})`}
              fill="none"
              stroke="#a59c90"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Server diamond markers for virtual nodes */}
          {ring.diamonds.map((dia, i) => (
            <path
              key={i}
              d={`M${A(dia.x)},${A(dia.y - 6)} L${A(dia.x + 9)},${A(dia.y)} L${A(dia.x)},${A(dia.y + 6)} L${A(dia.x - 9)},${A(dia.y)} Z`}
              fill={`url(#g-${dia.color}-top)`}
              stroke="var(--ink)"
              strokeWidth="1.4"
            />
          ))}

          {/* Key dots & moved pulses */}
          {ring.keyDots.map((dot, i) => (
            <g key={i}>
              {dot.isMoved && (
                <circle className="moved" cx={A(dot.x)} cy={A(dot.y)} r="9" fill="none" stroke="#e5534b" strokeWidth="2" />
              )}
              <circle cx={A(dot.x)} cy={A(dot.y)} r="4.6" fill={dot.color} stroke="var(--ink)" strokeWidth="1.4" />
            </g>
          ))}

          {/* Ring title badge */}
          {entity.label && renderPill(ring.labelPos[0], ring.labelPos[1], { text: String(entity.label), tone: 'gray', icon: 'replay' })}
        </g>
      );
    }

    // --- 2. PANEL (Calculation / Code / Metrics Cards) ---
    if (type === 'panel') {
      const [baseX, baseY] = project(entity.x ?? 0, entity.y ?? 0, entity.z ?? 0);
      const u = baseX + (entity.dx ?? 0);
      const d = baseY + (entity.dy ?? 0) - lift;
      const lines = entity.lines || [];
      const title = entity.title || '';

      const boxW = entity.w || Math.max(220, title.length * 9 + 48);
      const boxH = 40 + lines.length * 20 + (entity.chart === 'hockey' ? 90 : entity.bars ? entity.bars.length * 22 : 0);

      return (
        <g key={id} opacity={opacity}>
          {/* Card shadow */}
          <rect x={A(u)} y={A(d + 2.5)} width={A(boxW)} height={A(boxH)} rx="10" fill="#1c1a17" />
          {/* Card body */}
          <rect x={A(u)} y={A(d)} width={A(boxW)} height={A(boxH)} rx="10" fill="#fbf7f1" stroke="var(--ink)" strokeWidth="1.4" />
          {/* Header divider */}
          <path d={`M${A(u + 12)},${A(d + 30)} H${A(u + boxW - 12)}`} stroke="#e6ddd0" strokeWidth="1" />

          {/* Header Icon & Title */}
          {entity.icon && renderIsoIcon(entity.icon, u + 20, d + 18, { size: 14, stroke: 2.1, color: '#6f6961' })}
          <text x={A(u + (entity.icon ? 33 : 16))} y={A(d + 21.5)} fontSize="10" fontWeight="800" letterSpacing="1" fill="#6f6961">
            {title.toUpperCase()}
          </text>

          {/* Formatted syntax lines */}
          {lines.map((line, idx) => {
            const lineY = d + 48 + idx * 20;
            if (line.startsWith('= ')) {
              return (
                <g key={idx}>
                  <rect x={A(u + 10)} y={A(lineY - 13)} width={A(boxW - 20)} height="18" rx="5" fill="#dcefd2" />
                  <text x={A(u + 16)} y={A(lineY)} fontSize="11.5" fontWeight="800" fill="#24521c">
                    {line.slice(2)}
                  </text>
                </g>
              );
            }
            if (line.startsWith('! ')) {
              return (
                <g key={idx}>
                  <rect x={A(u + 10)} y={A(lineY - 13)} width={A(boxW - 20)} height="18" rx="5" fill="#f8d5cf" />
                  <text x={A(u + 16)} y={A(lineY)} fontSize="11.5" fontWeight="800" fill="#8f2a22">
                    {line.slice(2)}
                  </text>
                </g>
              );
            }
            if (line.startsWith('# ')) {
              return (
                <text key={idx} x={A(u + 16)} y={A(lineY)} fontSize="10.5" fontWeight="500" fill="#8b847a">
                  {line.slice(2)}
                </text>
              );
            }
            return (
              <text key={idx} x={A(u + 16)} y={A(lineY)} fontSize="11.5" fontWeight="600" fill="#34302b">
                {line}
              </text>
            );
          })}

          {/* Hockey Stick Chart if specified */}
          {entity.chart === 'hockey' && (
            <g transform={`translate(${A(u + 16)}, ${A(d + 44 + lines.length * 20)})`}>
              <path d="M0,0 V60 H180" fill="none" stroke="#a59c90" strokeWidth="1.2" />
              <rect x="144" y="0" width="36" height="60" fill="#e5534b" opacity="0.08" />
              <path
                d="M0,58 Q120,56 150,30 Q165,10 175,2"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <circle
                cx={A(180 * (entity.marker ?? 0.75))}
                cy="32"
                r="5"
                fill={(entity.marker ?? 0.75) > 0.8 ? '#e5534b' : '#efb041'}
                stroke="var(--ink)"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Breakdown Bars if specified */}
          {entity.bars && entity.bars.length > 0 && (
            <g transform={`translate(${A(u + 16)}, ${A(d + 44 + lines.length * 20)})`}>
              {entity.bars.map((bar, i) => {
                const by = i * 20;
                const sw = boxW - 32;
                const from = bar.from || 0;
                const to = bar.to ?? 1;
                const barTone = bar.tone === 'red' ? '#e5534b' : bar.tone === 'amber' ? '#efb041' : bar.tone === 'green' ? '#9fd28f' : '#cbbae6';
                return (
                  <g key={i}>
                    <text x="0" y={by + 11} fontSize="10.5" fontWeight={bar.bold ? '800' : '500'} fill="#34302b">
                      {bar.label}
                    </text>
                    <rect x="80" y={by + 2} width={sw - 130} height="11" rx="3" fill="#f1e8db" />
                    <rect
                      x={80 + from * (sw - 130)}
                      y={by + 2}
                      width={Math.max(4, (to - from) * (sw - 130))}
                      height="11"
                      rx="3"
                      fill={barTone}
                      stroke="var(--ink)"
                      strokeOpacity="0.55"
                      strokeWidth="1"
                    />
                    {bar.note && (
                      <text x={sw - 45} y={by + 11} fontSize="10" fontWeight="800" fill="var(--ink)">
                        {bar.note}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </g>
      );
    }

    // --- 3. ZONE (Datacenter / Region Boundaries) ---
    if (type === 'zone') {
      const x0 = entity.x0 ?? 0;
      const x1 = entity.x1 ?? 0;
      const y0 = entity.y0 ?? 0;
      const y1 = entity.y1 ?? 0;
      const pts: [number, number][] = [project(x0, y0), project(x0, y1), project(x1, y1), project(x1, y0)];
      const [lx, ly] = project(x0 + 0.9, y0 + 0.55);

      return (
        <g key={id} opacity={opacity}>
          <path d={Sr(pts, 8)} fill="#fffaf2" fillOpacity="0.55" stroke="var(--ink)" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="6 5" />
          {entity.label && (
            <text x={A(lx)} y={A(ly)} fontSize="10.5" fontWeight="800" letterSpacing="1.6" fill="#6f6961">
              {String(entity.label).toUpperCase()}
            </text>
          )}
        </g>
      );
    }

    // --- 4. QUEUE (Message Stream Pipeline) ---
    if (type === 'queue') {
      const qx = entity.x ?? 0;
      const qy = entity.y ?? 0;
      const dir = entity.dir || [0, -1];
      const gap = entity.gap || 1;
      const n = Math.ceil(entity.n ?? 3);
      const color = entity.color || '#efb041';

      const items: Array<{ x: number; y: number; r: number; scale: number }> = [];
      for (let i = n - 1; i >= 0; i--) {
        const falloff = 1 - (i / Math.max(1, n)) * 0.4;
        const [px, py] = project(qx + dir[0] * gap * i, qy + dir[1] * gap * i, 0);
        items.push({ x: px, y: py, r: falloff, scale: 0.5 + falloff * 0.5 });
      }

      return (
        <g key={id} opacity={opacity}>
          {items.map((it, i) => (
            <g key={i} transform={`translate(${A(it.x)} ${A(it.y)}) scale(${A(it.scale)})`}>
              <circle r="4.6" fill={color} stroke="var(--ink)" strokeWidth="1.5" />
            </g>
          ))}
        </g>
      );
    }

    // --- 5. CROWD (User Population Slab) ---
    if (type === 'crowd') {
      const x0 = entity.x0 ?? -5;
      const x1 = entity.x1 ?? 5;
      const y0 = entity.y0 ?? -5;
      const y1 = entity.y1 ?? 5;
      const slab = computeBoxGeometry((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0), 10);
      const count = entity.count ?? 8;
      const [lx, ly] = project(x1, y0, 0);

      return (
        <g key={id} opacity={opacity} transform={`translate(0, ${-lift})`}>
          <path d={slab.sil} transform="translate(0, 8)" fill="rgba(80,60,35,0.18)" filter="url(#blur-md)" />
          <path d={slab.left} fill="url(#g-slab-side)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={slab.right} fill="url(#g-slab-side)" opacity="0.9" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={slab.top} fill="url(#g-slab-top)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Clustered user avatars */}
          {Array.from({ length: Math.min(30, count) }).map((_, i) => {
            const rx = x0 + 1 + ((i * 3.7) % (x1 - x0 - 2));
            const ry = y0 + 1 + (((i * 5.3) + 2) % (y1 - y0 - 2));
            const [ux, uy] = project(rx, ry, 10);
            return (
              <circle
                key={i}
                cx={A(ux)}
                cy={A(uy)}
                r="3.2"
                fill={['#F3B47F', '#A9C5E8', '#B3D79F', '#CBBAE6', '#F6CD82'][i % 5]}
                stroke="var(--ink)"
                strokeWidth="1.2"
              />
            );
          })}

          {entity.label && renderPill(lx, ly + 22, { text: String(entity.label), tone: 'paper', icon: 'users' })}
        </g>
      );
    }

    // --- 6. DEVICE (Client Laptop / Smartphone) ---
    if (type === 'device') {
      const w = entity.w || 6;
      const d = entity.d || 6;
      const isPhone = entity.form === 'phone';
      const base = computeBoxGeometry(entity.x ?? 0, entity.y ?? 0, d, 16);
      const [devX, devY] = project(entity.x ?? 0, entity.y ?? 0, 16);

      return (
        <g key={id} opacity={opacity} transform={`translate(0, ${-lift})`}>
          <path d={base.sil} transform="translate(0, 10)" fill="rgba(80,60,35,0.2)" filter="url(#blur-sm)" />
          <path d={base.left} fill="url(#g-slab-side)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={base.right} fill="url(#g-slab-side)" opacity="0.9" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={base.top} fill="url(#g-slab-top)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Device Screen Frame */}
          <g transform={`translate(${A(devX - 16)} ${A(devY - 32)})`}>
            <rect x="0" y="0" width={isPhone ? 20 : 34} height={isPhone ? 32 : 24} rx="3" fill="#3D3935" stroke="var(--ink)" strokeWidth="1.4" />
            <rect x="2" y="2" width={isPhone ? 16 : 30} height={isPhone ? 28 : 20} rx="2" fill="#faf6f0" />
            <rect x="3" y="3" width={isPhone ? 14 : 28} height={isPhone ? 10 : 8} fill="url(#screen)" />
            <circle cx={isPhone ? 10 : 6} cy="5" r="1.2" fill="#e5534b" />
          </g>

          {/* User Label Badge below */}
          {entity.label && renderPill(devX, base.Bd[1] + 20, { text: String(entity.label), tone: 'paper', icon: 'user' })}

          {/* Floating tags */}
          {entity.tags && (
            <g transform={`translate(${A(devX)}, ${A(devY - 42)})`}>
              {entity.tags.map((tag, i) => (
                <g key={i} transform={`translate(0, ${-i * 24})`}>
                  {renderPill(0, 0, tag)}
                </g>
              ))}
            </g>
          )}
        </g>
      );
    }

    // --- 7. GHOST (Planned / Wireframe Server) ---
    if (type === 'ghost') {
      const s = entity.s || 6;
      const h = entity.h || 40;
      const geo = computeBoxGeometry(entity.x ?? 0, entity.y ?? 0, s, h);

      return (
        <g key={id} opacity={opacity}>
          <path d={geo.sil} fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="5 4" strokeOpacity="0.45" />
          <path d={geo.left} fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="5 4" strokeOpacity="0.3" />
          <path d={geo.right} fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="5 4" strokeOpacity="0.3" />
          <path d={geo.top} fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="5 4" strokeOpacity="0.4" />
          {entity.label && renderPill(geo.T[0], geo.T[1] - 16, { text: String(entity.label), tone: 'gray', icon: 'alert' })}
        </g>
      );
    }

    // --- 8. DB (Database Cylinders) ---
    if (type === 'db') {
      const radius = entity.r || 1.7;
      const height = entity.h || 38;
      const cyl = computeCylinderGeometry(entity.x ?? 0, entity.y ?? 0, radius, height);
      const color = entity.color || 'purple';
      const cx = cyl.cx;
      const topY = cyl.topY;
      const groundY = cyl.groundY;
      const rx = cyl.rx;
      const ry = cyl.ry;

      const fillPct = entity.cpu !== undefined && entity.cpu >= 0 ? Math.min(1, Math.max(0, entity.cpu)) : 0;
      const fillY = groundY - fillPct * height;

      return (
        <g key={id} opacity={opacity} transform={`translate(0, ${-lift})`}>
          {/* Base Shadow */}
          <ellipse cx={A(cx)} cy={A(groundY + 5)} rx={A(rx + 3)} ry={A(ry + 1)} fill="rgba(80,60,35,0.22)" filter="url(#blur-md)" />

          {/* Heat glow pulse */}
          {(entity.heat ?? 0) > 0.05 && (
            <path
              className="pulse"
              d={`M${A(cx - rx)},${A(topY)} V${A(groundY)} A${A(rx)},${A(ry)} 0 0 0 ${A(cx + rx)},${A(groundY)} V${A(topY)} Z`}
              fill="#f0552f"
              opacity={A((entity.heat ?? 0) * 0.7)}
              filter="url(#glow)"
            />
          )}

          {/* Cylinder side body */}
          <path
            d={`M${A(cx - rx)},${A(topY)} V${A(groundY)} A${A(rx)},${A(ry)} 0 0 0 ${A(cx + rx)},${A(groundY)} V${A(topY)} Z`}
            fill={`url(#g-${color}-side)`}
          />

          {/* Storage / CPU fill level */}
          {fillPct > 0.01 && (
            <path
              d={`M${A(cx - rx)},${A(fillY)} A${A(rx)},${A(ry)} 0 0 0 ${A(cx + rx)},${A(fillY)} V${A(groundY)} A${A(rx)},${A(ry)} 0 0 1 ${A(cx - rx)},${A(groundY)} Z`}
              fill={entity.cpu! > 0.85 ? '#f5bdb2' : entity.cpu! > 0.6 ? '#f9dca3' : '#cfe8c0'}
              opacity="0.9"
            />
          )}

          {/* Disk layers */}
          <path
            d={`M${A(cx - rx)},${A(topY + height * 0.35)} A${A(rx)},${A(ry)} 0 0 0 ${A(cx + rx)},${A(topY + height * 0.35)}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
          <path
            d={`M${A(cx - rx)},${A(topY + height * 0.7)} A${A(rx)},${A(ry)} 0 0 0 ${A(cx + rx)},${A(topY + height * 0.7)}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.2"
          />

          {/* Cylinder side outline */}
          <path
            d={`M${A(cx - rx)},${A(topY)} V${A(groundY)} A${A(rx)},${A(ry)} 0 0 0 ${A(cx + rx)},${A(groundY)} V${A(topY)}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />

          {/* Cylinder top face */}
          <ellipse cx={A(cx)} cy={A(topY)} rx={A(rx)} ry={A(ry)} fill={`url(#g-${color}-top)`} stroke="var(--ink)" strokeWidth="1.9" />

          {/* Top face sheen */}
          <path
            d={`M${A(cx - rx + 3)},${A(topY + 2.5)} A${A(rx - 3)},${A(ry - 2)} 0 0 0 ${A(cx + rx - 3)},${A(topY + 2.5)}`}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.75"
            strokeWidth="1.4"
          />

          {/* Database Glyph */}
          {renderIsoIcon(entity.glyph || 'database', cx, topY + ry + height / 2, { size: 19, stroke: 1.8 })}

          {/* Label below */}
          {entity.label && (
            <g transform={`translate(${A(cx)}, ${A(groundY + 22)})`}>
              <text textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
                {Array.isArray(entity.label) ? entity.label.join(' ') : entity.label}
              </text>
            </g>
          )}

          {/* CPU Meter */}
          {typeof entity.cpu === 'number' && entity.cpu >= 0 && (
            <g transform={`translate(0, ${A(topY - 18)})`}>{renderCpuMeter(cx, 0, entity.cpu)}</g>
          )}

          {/* Tags */}
          {entity.tags && (
            <g transform={`translate(${A(cx)}, ${A(topY - (typeof entity.cpu === 'number' && entity.cpu >= 0 ? 42 : 18))})`}>
              {entity.tags.map((tag, i) => (
                <g key={i} transform={`translate(0, ${-i * 24})`}>
                  {renderPill(0, 0, tag)}
                </g>
              ))}
            </g>
          )}
        </g>
      );
    }

    // --- 9. BLOCK (Standard 3D Server Blocks) ---
    const size = entity.s || 4;
    const height = entity.h || 38;
    const color = entity.color || 'blue';
    const geo = computeBoxGeometry(entity.x ?? 0, entity.y ?? 0, size, height);
    const centerTop: [number, number] = [(geo.T[0] + geo.B[0]) / 2, (geo.T[1] + geo.B[1]) / 2];

    const isDead = (entity.dead ?? 0) > 0.1;
    const isHeat = (entity.heat ?? 0) > 0.05;

    return (
      <g key={id} opacity={opacity} transform={`translate(0, ${-lift})`}>
        {/* Drop shadow */}
        <path d={geo.sil} transform="translate(0, 10)" fill="rgba(80,60,35,0.22)" filter="url(#blur-sm)" />

        {/* Heat Glow Pulse */}
        {isHeat && (
          <path
            className="pulse"
            d={geo.sil}
            fill="#f0552f"
            opacity={A((entity.heat ?? 0) * 0.75)}
            filter="url(#glow)"
          />
        )}

        {/* 3D Faces */}
        <path d={geo.left} fill={`url(#g-${color}-side)`} stroke="var(--ink)" strokeWidth="1.9" strokeLinejoin="round" />
        <path d={geo.right} fill={`url(#g-${color}-side)`} opacity="0.88" stroke="var(--ink)" strokeWidth="1.9" strokeLinejoin="round" />
        <path d={geo.top} fill={`url(#g-${color}-top)`} stroke="var(--ink)" strokeWidth="1.9" strokeLinejoin="round" />

        {/* Sheen & Bevels */}
        <path d={geo.sheen} fill="#ffffff" opacity="0.25" filter="url(#blur-sm)" />
        <path d={geo.bevel} transform="translate(0, 1.4)" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" />

        {/* Down indicator */}
        {isDead && (
          <g stroke="#c0392b" strokeWidth="3" strokeLinecap="round">
            <line x1={centerTop[0] - 10} y1={centerTop[1] - 8} x2={centerTop[0] + 10} y2={centerTop[1] + 8} />
            <line x1={centerTop[0] + 10} y1={centerTop[1] - 8} x2={centerTop[0] - 10} y2={centerTop[1] + 8} />
          </g>
        )}

        {/* Glyph / Icon */}
        {!isDead && entity.glyph && renderIsoIcon(entity.glyph, centerTop[0], centerTop[1], { size: 20, stroke: 1.9 })}

        {/* Labels below */}
        {entity.label && (
          <g transform={`translate(${A(centerTop[0])}, ${A(geo.Bd[1] + 20)})`}>
            {Array.isArray(entity.label) ? (
              entity.label.map((line, i) => (
                <text key={i} x="0" y={i * 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
                  {line}
                </text>
              ))
            ) : (
              <text x="0" y="0" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
                {entity.label}
              </text>
            )}
            {entity.sub && (
              <text
                x="0"
                y={Array.isArray(entity.label) ? entity.label.length * 14 : 14}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--muted)"
              >
                {entity.sub}
              </text>
            )}
          </g>
        )}

        {/* CPU Meter */}
        {typeof entity.cpu === 'number' && entity.cpu >= 0 && (
          <g transform={`translate(0, ${A(geo.T[1] - 18)})`}>{renderCpuMeter(centerTop[0], 0, entity.cpu)}</g>
        )}

        {/* Tags */}
        {entity.tags && (
          <g transform={`translate(${A(centerTop[0])}, ${A(geo.T[1] - (typeof entity.cpu === 'number' && entity.cpu >= 0 ? 42 : 18))})`}>
            {entity.tags.map((tag, i) => (
              <g key={i} transform={`translate(0, ${-i * 24})`}>
                {renderPill(0, 0, tag)}
              </g>
            ))}
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      className={`stage-canvas-container ${className || ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg className="stage-svg" viewBox="-480 -320 960 640" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Isometric grid tile pattern */}
          <pattern id="iso-grid" patternUnits="userSpaceOnUse" x="0" y="-7" width="28" height="14">
            <path d="M0 7 L14 0 L28 7 L14 14 Z" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.8" />
          </pattern>

          {/* Color gradients table */}
          <linearGradient id="g-orange-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#fee6cc" /><stop offset="1" stopColor="#fcd4ad" />
          </linearGradient>
          <linearGradient id="g-orange-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f9c697" /><stop offset="1" stopColor="#f3b47f" />
          </linearGradient>

          <linearGradient id="g-green-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#e2f2d7" /><stop offset="1" stopColor="#d1e9c2" />
          </linearGradient>
          <linearGradient id="g-green-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c3e1b2" /><stop offset="1" stopColor="#b3d79f" />
          </linearGradient>

          <linearGradient id="g-blue-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#dfebf9" /><stop offset="1" stopColor="#cde0f5" />
          </linearGradient>
          <linearGradient id="g-blue-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bcd3ef" /><stop offset="1" stopColor="#a9c5e8" />
          </linearGradient>

          <linearGradient id="g-yellow-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#fff3d6" /><stop offset="1" stopColor="#fee7b8" />
          </linearGradient>
          <linearGradient id="g-yellow-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fcdb9c" /><stop offset="1" stopColor="#f6cd82" />
          </linearGradient>

          <linearGradient id="g-purple-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#f2eaf9" /><stop offset="1" stopColor="#e6dbf4" />
          </linearGradient>
          <linearGradient id="g-purple-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9cbef" /><stop offset="1" stopColor="#cbbae6" />
          </linearGradient>

          <linearGradient id="g-sand-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#faf3e9" /><stop offset="1" stopColor="#f1e8db" />
          </linearGradient>
          <linearGradient id="g-sand-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8dfd1" /><stop offset="1" stopColor="#d3c7b6" />
          </linearGradient>

          <linearGradient id="g-slab-top" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#f7f0e7" /><stop offset="1" stopColor="#f0e7dc" />
          </linearGradient>
          <linearGradient id="g-slab-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ece2d5" /><stop offset="1" stopColor="#e3d7c8" />
          </linearGradient>

          <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3D6F3" /><stop offset="1" stopColor="#D5C2ED" />
          </linearGradient>

          {/* Filters */}
          <filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id="blur-md" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          {/* Markers */}
          <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M1,1.5 L9,5 L1,8.5 Z" fill="var(--ink)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round" />
          </marker>
          <marker id="arrow-muted" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M1,1.5 L9,5 L1,8.5 Z" fill="#b0a698" stroke="#b0a698" strokeWidth="1" strokeLinejoin="round" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Ground Grid */}
          <rect x="-1400" y="-900" width="2800" height="1800" fill="url(#iso-grid)" style={{ color: 'var(--line-strong)' }} />

          {/* Cables / Links */}
          {Object.entries(scene.links || {}).map(([k, link]) => {
            if (!link.pts || link.pts.length === 0) return null;

            // Project link points using ip expression parser
            const projected = link.pts.map((p: any) => {
              if (Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number') {
                return project(p[0], p[1], 0);
              }
              const [wx, wy] = ip(p, getEntityCenter);
              return project(wx, wy, 0);
            });

            // Clip against start and end entity boundaries
            let clipped = Tr(projected, link.from ? entityPolys[link.from] : null, 3);
            if (link.to) {
              clipped = Er(clipped, entityPolys[link.to], link.heads === 'none' ? 3 : 4);
            }

            const pathD = Cr(clipped, 9);
            const style = link.style || 'solid';
            const strokeColor = style === 'off' ? '#b0a698' : style === 'cut' ? '#c0392b' : link.color || 'var(--ink)';
            const strokeWidth = style === 'off' ? '1.6' : '1.9';
            const strokeDash = style === 'dashed' ? '5 4.5' : style === 'off' ? '4 5' : style === 'cut' ? '7 6' : style === 'beat' ? '1.5 5.5' : 'none';

            // Calculate label position along path
            const midIdx = Math.floor(clipped.length / 2);
            const labelX = clipped[midIdx] ? clipped[midIdx][0] : 0;
            const labelY = clipped[midIdx] ? clipped[midIdx][1] - 8 : 0;

            return (
              <g key={k}>
                <path
                  id={`link-path-${k}`}
                  d={pathD}
                  className={`link link--${style}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={link.heads !== 'none' ? (style === 'off' ? 'url(#arrow-muted)' : 'url(#arrow)') : undefined}
                  markerStart={link.heads === 'both' ? (style === 'off' ? 'url(#arrow-muted)' : 'url(#arrow)') : undefined}
                />
                {link.label && (
                  <g className="link-label">
                    {renderPill(labelX, labelY, { text: link.label, tone: (link.labelTone as any) || 'paper' })}
                  </g>
                )}
              </g>
            );
          })}

          {/* Animated Flows / Packets */}
          {(scene.flows || []).map((flow, idx) => {
            const firstRouteId = flow.route ? flow.route[0] : flow.routes ? flow.routes[0]?.path[0] : null;
            if (!firstRouteId) return null;
            const dur = `${2.0 / (flow.rate || 1)}s`;

            return (
              <circle
                key={idx}
                r={flow.kind === 'ping' ? 3.6 : 4.4}
                fill={flow.color || (flow.kind === 'ping' ? '#f4fbef' : flow.kind === 'heavy' ? '#e8834d' : '#f3b47f')}
                stroke={flow.kind === 'ping' ? '#2f8a43' : 'var(--ink)'}
                strokeWidth={flow.kind === 'ping' ? 2 : 1.5}
              >
                <animateMotion
                  dur={dur}
                  repeatCount="indefinite"
                  rotate="auto"
                  keyPoints={flow.bounce ? '0;1;0' : '0;1'}
                  keyTimes={flow.bounce ? '0;0.5;1' : '0;1'}
                >
                  <mpath href={`#link-path-${firstRouteId}`} />
                </animateMotion>
              </circle>
            );
          })}

          {/* Depth-sorted Entities */}
          {Object.entries(scene.entities || {})
            .sort(([, a], [, b]) => {
              const depthOf = (e: IsoEntity) => {
                if (e.type === 'zone' || e.type === 'ring') return -10000;
                if (e.type === 'queue') return -1000;
                if (e.type === 'panel') return 10000;
                const center = e.type === 'crowd' ? [((e.x0 ?? 0) + (e.x1 ?? 0)) / 2, ((e.y0 ?? 0) + (e.y1 ?? 0)) / 2] : [e.x ?? 0, e.y ?? 0];
                return center[0] - center[1];
              };
              return depthOf(a) - depthOf(b);
            })
            .map(([id, entity]) => renderEntity(id, entity))}
        </g>
      </svg>

      {/* Floating Zoom & Reset controls */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 6, zIndex: 10 }}>
        <button className="tool-btn" onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))} title="Zoom In">
          +
        </button>
        <button className="tool-btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))} title="Zoom Out">
          -
        </button>
        <button
          className="btn-pop"
          style={{ fontSize: 11, padding: '4px 8px' }}
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset View"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
