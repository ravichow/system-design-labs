import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SceneGraph, IsoEntity, IsoLink, IsoFlow } from '../../types';
import {
  planFor,
  getThemeDefs,
  renderEntity,
  getDepth,
  project,
  Tr,
  Er,
  Cr,
  ip,
  A,
  zr,
  k
} from './IsoRenderer';

interface IsoStageProps {
  scene: SceneGraph;
  className?: string;
}

interface ActivePacket {
  id: number;
  route: string[];
  seg: number;
  d: number;
  kind: string;
  back: boolean;
  bounce: boolean;
  speed: number;
  dwell: number;
  x: number;
  y: number;
  opacity: number;
}

interface ActiveBurst {
  id: number;
  x: number;
  y: number;
  kind: 'ok' | 'fail';
  born: number;
}

const SPEED_BASE = 155;
const SPEED_MODIFIERS: Record<string, number> = {
  heavy: 0.7,
  ping: 0.85,
  slow: 0.32
};

export const IsoStage: React.FC<IsoStageProps> = ({ scene, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 580 });
  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [userZoom, setUserZoom] = useState(1);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Track link SVG path elements to measure exact path lengths & points
  const linkPathRefs = useRef<Map<string, SVGPathElement>>(new Map());

  // Packet animation state
  const packetsRef = useRef<ActivePacket[]>([]);
  const burstsRef = useRef<ActiveBurst[]>([]);
  const [, setFrameCount] = useState(0);
  const flowAccRef = useRef<Map<number, number>>(new Map());
  const packetIdGen = useRef(1);
  const lastTimeRef = useRef(performance.now());

  // ResizeObserver to track container size snugly
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDims({ w: rect.width, h: rect.height });
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute camera plan based on current scene & container dimensions
  const plan = useMemo(() => {
    return planFor(scene, dims.w, dims.h);
  }, [scene, dims.w, dims.h]);

  const baseCam = plan.cam;
  const activeCam = useMemo(() => {
    const k = userZoom;
    const viewW = baseCam.w / k;
    const viewH = baseCam.h / k;
    const cx = baseCam.x + baseCam.w / 2 - userPan.x / k;
    const cy = baseCam.y + baseCam.h / 2 - userPan.y / k;
    return {
      x: cx - viewW / 2,
      y: cy - viewH / 2,
      w: viewW,
      h: viewH
    };
  }, [baseCam, userZoom, userPan]);

  // Center coordinate resolver for entities
  const getEntityCenter = useCallback(
    (id: string): [number, number] => {
      const ent = scene.entities[id];
      if (!ent) return [0, 0];
      if (ent.type === 'crowd' || ent.type === 'zone') {
        return [((ent.x0 ?? 0) + (ent.x1 ?? 0)) / 2, ((ent.y0 ?? 0) + (ent.y1 ?? 0)) / 2];
      }
      return [ent.x ?? 0, ent.y ?? 0];
    },
    [scene.entities]
  );

  // Precompute link paths and endpoints
  const computedLinks = useMemo(() => {
    const links = scene.links || {};
    const result: Record<
      string,
      {
        id: string;
        spec: IsoLink;
        pts: [number, number][];
        d: string;
        labelPos: [number, number];
        style: string;
        heads: string;
      }
    > = {};

    for (const [id, spec] of Object.entries(links)) {
      let pts = (spec.pts || []).map((pt: any) => project(...ip(pt, getEntityCenter)));
      if (spec.from && plan.polys[spec.from]) {
        pts = Tr(pts, plan.polys[spec.from], 3);
      }
      if (spec.to && plan.polys[spec.to]) {
        pts = Er(pts, plan.polys[spec.to], spec.heads === 'none' ? 3 : 4);
      }

      const d = Cr(pts, 9);

      // Label position: middle of path or labelAt fraction
      const labelAt = spec.labelAt ?? 0.5;
      let labelPos: [number, number] = [0, 0];
      if (pts.length >= 2) {
        const midIdx = Math.floor((pts.length - 1) * labelAt);
        const p1 = pts[midIdx];
        const p2 = pts[Math.min(pts.length - 1, midIdx + 1)];
        labelPos = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 - 4];
      }

      result[id] = {
        id,
        spec,
        pts,
        d,
        labelPos,
        style: spec.style || 'solid',
        heads: spec.heads || 'end'
      };
    }
    return result;
  }, [scene.links, plan.polys, getEntityCenter]);

  // Render individual entities and classify into floor vs 3D ents
  const { floorEnts, normalEnts, hudEnts } = useMemo(() => {
    const floor: Array<{ id: string; ent: IsoEntity; body: string; over: string }> = [];
    const normal: Array<{ id: string; ent: IsoEntity; body: string; over: string; depth: number }> = [];
    const hud: Array<{ id: string; ent: IsoEntity; over: string }> = [];

    for (const [id, ent] of Object.entries(scene.entities || {})) {
      const rendered = renderEntity(ent);
      if (ent.type === 'zone' || ent.type === 'ring') {
        floor.push({ id, ent, body: rendered.body, over: rendered.over });
      } else if (ent.type === 'panel') {
        hud.push({ id, ent, over: rendered.over });
      } else {
        normal.push({
          id,
          ent,
          body: rendered.body,
          over: rendered.over,
          depth: getDepth(ent)
        });
      }
    }

    // Sort 3D entities by isometric depth (Mi)
    normal.sort((a, b) => a.depth - b.depth);

    return { floorEnts: floor, normalEnts: normal, hudEnts: hud };
  }, [scene.entities]);

  // Pick packet route based on weights or round robin
  const pickRoute = useCallback(
    (flow: IsoFlow, flowIdx: number): { route: string[]; kind: string } => {
      const defaultKind = flow.kind || 'req';
      if (flow.routes && flow.routes.length > 0) {
        if (flow.pick === 'weights') {
          const weights = flow.routes.map((r) => r.weight ?? 1);
          const total = weights.reduce((acc, w) => acc + w, 0);
          let rnd = Math.random() * total;
          let pickedIdx = 0;
          for (let i = 0; i < weights.length; i++) {
            rnd -= weights[i];
            if (rnd <= 0) {
              pickedIdx = i;
              break;
            }
          }
          const chosen = flow.routes[pickedIdx];
          return { route: chosen.path, kind: chosen.kind || defaultKind };
        } else {
          const acc = flowAccRef.current.get(flowIdx) || 0;
          const chosen = flow.routes[Math.floor(acc) % flow.routes.length];
          return { route: chosen.path, kind: chosen.kind || defaultKind };
        }
      }

      if (flow.route && flow.route.length > 0) {
        const segs: string[] = [];
        for (const item of flow.route) {
          if (typeof item === 'string') {
            segs.push(item);
          } else if (Array.isArray(item)) {
            const chosen = item[Math.floor(Math.random() * item.length)];
            segs.push(chosen);
          }
        }
        return { route: segs, kind: defaultKind };
      }

      return { route: [], kind: defaultKind };
    },
    []
  );

  // Spawn new packet
  const spawnPacket = useCallback(
    (flow: IsoFlow, flowIdx: number) => {
      const { route, kind } = pickRoute(flow, flowIdx);
      if (!route.length) return;
      const firstLink = computedLinks[route[0]];
      if (!firstLink || firstLink.pts.length < 2) return;

      const p0 = firstLink.pts[0];
      packetsRef.current.push({
        id: packetIdGen.current++,
        route,
        seg: 0,
        d: 0,
        kind,
        back: false,
        bounce: !!flow.bounce,
        speed: flow.speed || 1,
        dwell: 0,
        x: p0[0],
        y: p0[1],
        opacity: 1
      });
    },
    [pickRoute, computedLinks]
  );

  // Reset packets on scene changes
  useEffect(() => {
    packetsRef.current = [];
    burstsRef.current = [];
    flowAccRef.current.clear();
  }, [scene]);

  // 60FPS Packet Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // 1. Spawning packets for flows
      const flows = scene.flows || [];
      flows.forEach((flow, idx) => {
        const rate = flow.rate || 2;
        let acc = (flowAccRef.current.get(idx) || 0) + dt * rate;
        while (acc >= 1) {
          acc -= 1;
          spawnPacket(flow, idx);
        }
        flowAccRef.current.set(idx, acc);
      });

      // 2. Stepping packets along paths
      const remainingPackets: ActivePacket[] = [];
      const linkRefs = linkPathRefs.current;

      for (const pkt of packetsRef.current) {
        if (pkt.dwell > 0) {
          pkt.dwell -= dt;
          if (pkt.dwell > 0) {
            remainingPackets.push(pkt);
            continue;
          }
          pkt.opacity = 1;
        }

        const linkId = pkt.route[pkt.seg];
        const pathEl = linkRefs.get(linkId);
        const linkInfo = computedLinks[linkId];

        if (!pathEl || !linkInfo) {
          continue;
        }

        let totalLen = 0;
        try {
          totalLen = pathEl.getTotalLength();
        } catch {
          totalLen = 100;
        }

        const speedMod = SPEED_MODIFIERS[pkt.kind] || 1;
        const stepDist = SPEED_BASE * pkt.speed * speedMod * dt;
        pkt.d += stepDist;

        // Clearance for arrowheads
        const hasStartArrow = linkInfo.heads === 'both';
        const hasEndArrow = linkInfo.heads !== 'none';
        const startOffset = hasStartArrow ? 8 : 0;
        const endOffset = hasEndArrow ? 8 : 0;
        const effectiveLen = Math.max(10, totalLen - startOffset - endOffset);

        if (pkt.d >= effectiveLen) {
          // Reached end of current link segment
          if (!pkt.back && pkt.seg < pkt.route.length - 1) {
            // Hop to next segment
            pkt.seg += 1;
            pkt.d = 0;
            pkt.dwell = 0.12;
            remainingPackets.push(pkt);
            continue;
          }

          if (pkt.bounce && !pkt.back) {
            // Bounce back
            pkt.back = true;
            pkt.d = 0;
            pkt.dwell = 0.15;
            remainingPackets.push(pkt);
            continue;
          }

          if (pkt.back && pkt.seg > 0) {
            // Returning along previous segment
            pkt.seg -= 1;
            pkt.d = 0;
            pkt.dwell = 0.12;
            remainingPackets.push(pkt);
            continue;
          }

          // Arrived at destination: Burst effect!
          try {
            const burstPt = pathEl.getPointAtLength(pkt.back ? startOffset : totalLen - endOffset);
            burstsRef.current.push({
              id: packetIdGen.current++,
              x: burstPt.x,
              y: burstPt.y,
              kind: 'ok',
              born: now
            });
          } catch {
            // Ignore
          }
          continue;
        }

        // Calculate current position along the path
        try {
          const travelDistance = pkt.back
            ? totalLen - endOffset - pkt.d
            : startOffset + pkt.d;
          const clampedDist = Math.max(0, Math.min(totalLen, travelDistance));
          const pt = pathEl.getPointAtLength(clampedDist);
          pkt.x = pt.x;
          pkt.y = pt.y;
          remainingPackets.push(pkt);
        } catch {
          remainingPackets.push(pkt);
        }
      }

      packetsRef.current = remainingPackets;

      // Clean up bursts older than 650ms
      burstsRef.current = burstsRef.current.filter((b) => now - b.born < 650);

      setFrameCount((c) => (c + 1) % 100000);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [scene, computedLinks, spawnPacket]);

  // Mouse pan & zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - userPan.x, y: e.clientY - userPan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setUserPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = Math.exp(-e.deltaY * 0.002);
    const newZoom = Math.max(0.4, Math.min(3.5, userZoom * zoomFactor));
    setUserZoom(newZoom);
  };

  const handleDoubleClick = () => {
    setUserPan({ x: 0, y: 0 });
    setUserZoom(1);
  };

  const camCenter = {
    x: activeCam.x + activeCam.w / 2,
    y: activeCam.y + activeCam.h / 2
  };
  const fadeRadius = activeCam.w * 0.56;

  return (
    <div
      ref={containerRef}
      className={`stage-canvas-container ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <svg
        className="stage-svg"
        viewBox={`${A(activeCam.x)} ${A(activeCam.y)} ${A(activeCam.w)} ${A(activeCam.h)}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        {/* Authentic Theme Gradients & Filters */}
        <defs
          className="defs-theme"
          dangerouslySetInnerHTML={{ __html: getThemeDefs() }}
        />

        {/* Dynamic Grid Mask Centered on Camera */}
        <defs>
          <radialGradient
            id="grid-fade"
            gradientUnits="userSpaceOnUse"
            cx={A(camCenter.x)}
            cy={A(camCenter.y)}
            r={A(fadeRadius)}
            gradientTransform={`translate(${A(camCenter.x)} ${A(camCenter.y)}) scale(1 0.6) translate(${A(-camCenter.x)} ${A(-camCenter.y)})`}
          >
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.42" stopColor="#fff" stopOpacity="0.92" />
            <stop offset="0.78" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask
            id="grid-mask"
            maskUnits="userSpaceOnUse"
            x="-5000"
            y="-5000"
            width="10000"
            height="10000"
          >
            <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid-fade)" />
          </mask>
        </defs>

        {/* Isometric Grid Floor */}
        <rect
          className="stage-grid"
          x="-5000"
          y="-5000"
          width="10000"
          height="10000"
          fill="url(#iso-grid)"
          mask="url(#grid-mask)"
        />

        {/* 1. LAYER-FLOOR (Zones, Hash Rings, Ground Shadows) */}
        <g className="layer-floor">
          {floorEnts.map(({ id, body }) => (
            <g key={id} data-id={id} dangerouslySetInnerHTML={{ __html: body }} />
          ))}
        </g>

        {/* 2. LAYER-LINKS (Cables & Paths) */}
        <g className="layer-links">
          {Object.values(computedLinks).map((link) => {
            const hasEndArrow = link.heads !== 'none';
            const hasStartArrow = link.heads === 'both';
            const markerEnd = hasEndArrow
              ? link.style === 'off'
                ? 'url(#arrow-muted)'
                : 'url(#arrow)'
              : undefined;
            const markerStart = hasStartArrow
              ? link.style === 'off'
                ? 'url(#arrow-muted)'
                : 'url(#arrow)'
              : undefined;

            return (
              <path
                key={link.id}
                ref={(el) => {
                  if (el) linkPathRefs.current.set(link.id, el);
                  else linkPathRefs.current.delete(link.id);
                }}
                className={`link link--${link.style}`}
                d={link.d}
                markerEnd={markerEnd}
                markerStart={markerStart}
              />
            );
          })}
        </g>

        {/* 3. LAYER-PACKETS (Live Packet Stream & Arrival FX) */}
        <g className="layer-packets">
          {packetsRef.current.map((pkt) => {
            const kind = pkt.kind;
            return (
              <g
                key={pkt.id}
                className={`pkt pkt--${kind} ${pkt.back ? 'pkt--back' : ''}`}
                transform={`translate(${A(pkt.x)} ${A(pkt.y)})`}
                style={{ opacity: pkt.opacity }}
              >
                {kind === 'ping' || kind === 'kill' ? (
                  <circle r="3.6" />
                ) : kind === 'heavy' ? (
                  <rect x="-6" y="-6" width="12" height="12" rx="3.5" />
                ) : kind === 'write' ? (
                  <rect x="-4.2" y="-4.2" width="8.4" height="8.4" rx="2" />
                ) : kind === 'msg' || kind === 'poison' ? (
                  <rect x="-4.8" y="-4.8" width="9.6" height="9.6" rx="2.4" />
                ) : (
                  <circle r="4.3" />
                )}
              </g>
            );
          })}

          {/* Arrival Bursts */}
          {burstsRef.current.map((burst) => (
            <g
              key={burst.id}
              className={`fx fx--${burst.kind}`}
              transform={`translate(${A(burst.x)} ${A(burst.y)})`}
            >
              {burst.kind === 'fail' ? (
                <>
                  <circle r="5" className="fx-ring" />
                  <path d="M-3.6,-3.6 L3.6,3.6 M3.6,-3.6 L-3.6,3.6" className="fx-x" />
                </>
              ) : (
                <circle r="4.3" className="fx-ring" />
              )}
            </g>
          ))}
        </g>

        {/* 4. LAYER-ENTS (3D Cuboids, Cylinders, Avatars Sorted by Isometric Depth) */}
        <g className="layer-ents">
          {normalEnts.map(({ id, body }) => (
            <g key={id} data-id={id} dangerouslySetInnerHTML={{ __html: body }} />
          ))}
        </g>

        {/* 5. LAYER-OVER (Floating Pills, Tags, CPU Meters, Link Labels on Top) */}
        <g className="layer-over">
          {/* Entity Overlays (Tags & CPU Bars) */}
          {[...floorEnts, ...normalEnts].map(({ id, over }) =>
            over ? (
              <g key={`over-${id}`} data-id={id} dangerouslySetInnerHTML={{ __html: over }} />
            ) : null
          )}

          {/* Link Labels */}
          {Object.values(computedLinks).map((link) => {
            if (!link.spec.label) return null;
            return (
              <g
                key={`label-${link.id}`}
                className="link-label"
                dangerouslySetInnerHTML={{
                  __html: zr(link.labelPos[0], link.labelPos[1], link.spec.label, {
                    tone: link.spec.labelTone || 'paper',
                    size: 10.5
                  })
                }}
              />
            );
          })}
        </g>

        {/* 6. LAYER-HUD (Floating Metrics / Calculation Panels) */}
        <g className="layer-hud">
          {hudEnts.map(({ id, over }) => (
            <g key={id} data-id={id} dangerouslySetInnerHTML={{ __html: over }} />
          ))}
        </g>
      </svg>
    </div>
  );
};
