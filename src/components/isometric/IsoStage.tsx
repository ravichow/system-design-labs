import React, { useState, useRef } from 'react';
import { SceneGraph, IsoEntity } from '../../types';
import { project, computeBoxGeometry, computeCylinderGeometry, buildCablePath } from './IsoEngine';
import { renderGlyph } from './IsoGlyphs';

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
    const newZoom = Math.min(2.0, Math.max(0.6, zoom - e.deltaY * 0.0015));
    setZoom(newZoom);
  };

  const renderEntity = (id: string, entity: IsoEntity) => {
    const isDb = entity.type === 'db' || entity.glyph === 'database';
    const size = entity.s || 4;
    const height = entity.h || (isDb ? 42 : 38);
    const color = entity.color || 'blue';
    const lift = entity.lift || 0;

    if (isDb) {
      const cyl = computeCylinderGeometry(entity.x, entity.y, size / 2, height);
      const topCenter = cyl.topCenter;
      const rx = cyl.rx;
      const ry = cyl.ry;
      const bottomCenter = cyl.bottomCenter;

      return (
        <g key={id} opacity={entity.opacity ?? 1} transform={`translate(0, ${-lift})`}>
          {/* Base shadow */}
          <ellipse cx={bottomCenter[0]} cy={bottomCenter[1] + 6} rx={rx} ry={ry} fill="rgba(80,60,35,0.22)" filter="url(#blur-sm)" />

          {/* Cylinder side */}
          <path
            d={`M ${bottomCenter[0] - rx} ${topCenter[1]} 
                A ${rx} ${ry} 0 0 0 ${bottomCenter[0] + rx} ${topCenter[1]} 
                v ${height} 
                A ${rx} ${ry} 0 0 1 ${bottomCenter[0] - rx} ${bottomCenter[1]} Z`}
            fill={`url(#g-${color}-side)`}
            stroke="var(--ink)"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />

          {/* Disk layers for DB appearance */}
          <ellipse cx={topCenter[0]} cy={topCenter[1] + height * 0.35} rx={rx} ry={ry} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
          <ellipse cx={topCenter[0]} cy={topCenter[1] + height * 0.7} rx={rx} ry={ry} fill="none" stroke="var(--ink)" strokeWidth="1.5" />

          {/* Cylinder Top */}
          <ellipse cx={topCenter[0]} cy={topCenter[1]} rx={rx} ry={ry} fill={`url(#g-${color}-top)`} stroke="var(--ink)" strokeWidth="1.9" />

          {/* Sheen */}
          <ellipse cx={topCenter[0]} cy={topCenter[1] - 1} rx={rx * 0.85} ry={ry * 0.75} fill="#fff" opacity="0.25" filter="url(#blur-sm)" />

          {/* Glyph */}
          {renderGlyph(entity.glyph || 'db', topCenter[0], topCenter[1] - 3, 'var(--ink)')}

          {/* Label below */}
          {entity.label && (
            <text x={bottomCenter[0]} y={bottomCenter[1] + 24} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
              {Array.isArray(entity.label) ? entity.label.join(' ') : entity.label}
            </text>
          )}

          {/* Tags */}
          {renderTags(entity, topCenter[0], topCenter[1] - 22)}
        </g>
      );
    }

    // Standard 3D Isometric Box
    const geo = computeBoxGeometry(entity.x, entity.y, size, height);
    const centerTop = [(geo.T[0] + geo.B[0]) / 2, (geo.T[1] + geo.B[1]) / 2];

    return (
      <g key={id} opacity={entity.opacity ?? 1} transform={`translate(0, ${-lift})`}>
        {/* Soft shadow */}
        <path d={geo.sil} transform="translate(0, 10)" fill="rgba(80,60,35,0.2)" filter="url(#blur-sm)" />

        {/* Heat Glow pulse */}
        {(entity.heat ?? 0) > 0.05 && (
          <path d={geo.sil} fill="#f0552f" opacity={entity.heat! * 0.75} filter="url(#glow)">
            <animate attributeName="opacity" values="0.4;0.85;0.4" dur="1.4s" repeatCount="indefinite" />
          </path>
        )}

        {/* 3D Box faces */}
        <path d={geo.left} fill={`url(#g-${color}-side)`} stroke="var(--ink)" strokeWidth="1.9" strokeLinejoin="round" />
        <path d={geo.right} fill={`url(#g-${color}-side)`} opacity="0.88" stroke="var(--ink)" strokeWidth="1.9" strokeLinejoin="round" />
        <path d={geo.top} fill={`url(#g-${color}-top)`} stroke="var(--ink)" strokeWidth="1.9" strokeLinejoin="round" />

        {/* Top Glare Sheen */}
        <path d={geo.sheen} fill="#ffffff" opacity="0.28" filter="url(#blur-sm)" />

        {/* Down Indicator */}
        {(entity.dead ?? 0) > 0.1 && (
          <g stroke="#c0392b" strokeWidth="3" strokeLinecap="round">
            <line x1={centerTop[0] - 12} y1={centerTop[1] - 10} x2={centerTop[0] + 12} y2={centerTop[1] + 10} />
            <line x1={centerTop[0] + 12} y1={centerTop[1] - 10} x2={centerTop[0] - 12} y2={centerTop[1] + 10} />
          </g>
        )}

        {/* Glyph / Icon on top face */}
        {renderGlyph(entity.glyph, centerTop[0], centerTop[1], 'var(--ink)')}

        {/* Labels */}
        {entity.label && (
          <g transform={`translate(${centerTop[0]}, ${geo.Bd[1] + 20})`}>
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
              <text x="0" y={Array.isArray(entity.label) ? entity.label.length * 14 : 14} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--muted)">
                {entity.sub}
              </text>
            )}
          </g>
        )}

        {/* CPU Gauge if specified */}
        {typeof entity.cpu === 'number' && entity.cpu >= 0 && (
          <g transform={`translate(${centerTop[0] - 30}, ${geo.T[1] - 22})`}>
            <rect x="0" y="0" width="60" height="15" rx="7.5" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.2" />
            <rect
              x="2"
              y="2"
              width={Math.max(4, 56 * Math.min(1, entity.cpu))}
              height="11"
              rx="5.5"
              fill={entity.cpu > 0.8 ? '#e5534b' : entity.cpu > 0.5 ? '#e8a33a' : '#7fc278'}
            />
            <text x="30" y="11" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="var(--ink)">
              CPU {Math.round(entity.cpu * 100)}%
            </text>
          </g>
        )}

        {/* Tags */}
        {renderTags(entity, centerTop[0], geo.T[1] - (typeof entity.cpu === 'number' && entity.cpu >= 0 ? 32 : 14))}
      </g>
    );
  };

  const renderTags = (entity: IsoEntity, cx: number, cy: number) => {
    if (!entity.tags || entity.tags.length === 0) return null;
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        {entity.tags.map((tag, i) => {
          const width = Math.max(38, tag.text.length * 7.5 + 16);
          const bgTone = tag.tone === 'red' ? '#f8d5cf' : tag.tone === 'amber' ? '#fbe5bd' : tag.tone === 'green' ? '#dcefd2' : '#f7efe4';
          const fgTone = tag.tone === 'red' ? '#8f2a22' : tag.tone === 'amber' ? '#6d4a0c' : tag.tone === 'green' ? '#24521c' : '#1d1b18';

          return (
            <g key={i} transform={`translate(${-width / 2}, ${-i * 22})`}>
              <rect x="0" y="0" width={width} height="19" rx="9.5" fill={bgTone} stroke="var(--ink)" strokeWidth="1.3" />
              <text x={width / 2} y="13" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={fgTone}>
                {tag.text}
              </text>
            </g>
          );
        })}
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
      <svg
        className="stage-svg"
        viewBox="-480 -320 960 640"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Isometric grid tile pattern */}
          <pattern id="iso-grid" patternUnits="userSpaceOnUse" x="0" y="-7" width="28" height="14">
            <path d="M0 7 L14 0 L28 7 L14 14 Z" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.8" />
          </pattern>

          {/* Gradients for node colors */}
          <linearGradient id="g-sand-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#faf3e9" /><stop offset="100%" stopColor="#f1e8db" />
          </linearGradient>
          <linearGradient id="g-sand-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8dfd1" /><stop offset="100%" stopColor="#d3c7b6" />
          </linearGradient>

          <linearGradient id="g-blue-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eaf3fd" /><stop offset="100%" stopColor="#cfe3fa" />
          </linearGradient>
          <linearGradient id="g-blue-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bad7f7" /><stop offset="100%" stopColor="#96beeb" />
          </linearGradient>

          <linearGradient id="g-orange-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#feeedf" /><stop offset="100%" stopColor="#fcdcbd" />
          </linearGradient>
          <linearGradient id="g-orange-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5c79e" /><stop offset="100%" stopColor="#e6ab79" />
          </linearGradient>

          <linearGradient id="g-green-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eef6e4" /><stop offset="100%" stopColor="#dcefd2" />
          </linearGradient>
          <linearGradient id="g-green-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c5e4b6" /><stop offset="100%" stopColor="#a7d292" />
          </linearGradient>

          <linearGradient id="g-violet-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4effb" /><stop offset="100%" stopColor="#e7ddf5" />
          </linearGradient>
          <linearGradient id="g-violet-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d5c2ed" /><stop offset="100%" stopColor="#bfa5e0" />
          </linearGradient>

          <linearGradient id="g-red-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fdf0ed" /><stop offset="100%" stopColor="#f8d5cf" />
          </linearGradient>
          <linearGradient id="g-red-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0b6ac" /><stop offset="100%" stopColor="#e39183" />
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

          {/* Arrow markers */}
          <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M1,1.5 L9,5 L1,8.5 Z" fill="var(--ink)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Isometric grid ground plane */}
          <rect x="-1400" y="-900" width="2800" height="1800" fill="url(#iso-grid)" style={{ color: 'var(--line-strong)' }} />

          {/* Cables / Links */}
          {Object.entries(scene.links).map(([k, link]) => {
            const pathD = buildCablePath(link.pts, 0);
            return (
              <g key={k}>
                <path
                  id={`link-path-${k}`}
                  d={pathD}
                  fill="none"
                  stroke={link.color || 'var(--ink)'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={link.dashed ? '5,5' : 'none'}
                  markerEnd={link.heads === 'end' || link.heads === 'both' ? 'url(#arrow)' : undefined}
                />
                {link.label && link.pts.length >= 2 && (
                  <text
                    x={project((link.pts[0][0] + link.pts[1][0]) / 2, (link.pts[0][1] + link.pts[1][1]) / 2)[0]}
                    y={project((link.pts[0][0] + link.pts[1][0]) / 2, (link.pts[0][1] + link.pts[1][1]) / 2)[1] - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="var(--ink)"
                    stroke="var(--paper)"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Animated Flows / Packets along links */}
          {scene.flows.map((flow, idx) => {
            const firstRouteId = flow.route[0];
            return (
              <circle key={idx} r={flow.kind === 'ping' ? 4 : 5.5} fill={flow.color || (flow.kind === 'ping' ? '#e8834d' : '#2f8a43')} stroke="var(--ink)" strokeWidth="1.5">
                <animateMotion
                  dur={`${1.8 / (flow.rate || 1)}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  keyPoints={flow.bounce ? "0;1;0" : "0;1"}
                  keyTimes={flow.bounce ? "0;0.5;1" : "0;1"}
                >
                  <mpath href={`#link-path-${firstRouteId}`} />
                </animateMotion>
              </circle>
            );
          })}

          {/* Entities sorted by depth (x - y) so closer objects overlap farther objects */}
          {Object.entries(scene.entities)
            .sort(([, a], [, b]) => (b.x - b.y) - (a.x - a.y))
            .map(([id, entity]) => renderEntity(id, entity))}
        </g>
      </svg>

      {/* Floating Zoom / Reset Controls */}
      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 6, zIndex: 10 }}>
        <button className="tool-btn" onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))} title="Zoom In">
          +
        </button>
        <button className="tool-btn" onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))} title="Zoom Out">
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

