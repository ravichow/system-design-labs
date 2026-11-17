import React, { useState, useMemo } from 'react';
import { IsoStage } from '../isometric/IsoStage';
import { SceneGraph } from '../../types';
import { Activity, Flame, ShieldAlert, Cpu, Database, Plus, RefreshCw, Zap } from 'lucide-react';

export const DesignLabView: React.FC = () => {
  // Simulator State
  const [trafficRps, setTrafficRps] = useState(2500);
  const [cacheHitRate, setCacheHitRate] = useState(0.85); // 85%
  const [serverCount, setServerCount] = useState(2);
  const [hasCache, setHasCache] = useState(true);
  const [hasCdn, setHasCdn] = useState(true);
  const [killedNodes, setKilledNodes] = useState<Record<string, boolean>>({});

  // Architecture preset
  const [preset, setPreset] = useState<'custom' | 'monolith' | 'scale' | 'event'>('scale');

  const toggleKillNode = (nodeId: string) => {
    setKilledNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const applyPreset = (p: 'monolith' | 'scale' | 'event') => {
    setPreset(p);
    setKilledNodes({});
    if (p === 'monolith') {
      setHasCdn(false);
      setHasCache(false);
      setServerCount(1);
      setTrafficRps(1200);
    } else if (p === 'scale') {
      setHasCdn(true);
      setHasCache(true);
      setServerCount(3);
      setTrafficRps(4500);
      setCacheHitRate(0.9);
    } else if (p === 'event') {
      setHasCdn(true);
      setHasCache(true);
      setServerCount(2);
      setTrafficRps(6000);
    }
  };

  // Compute live telemetry based on architecture & failures
  const telemetry = useMemo(() => {
    const isDbKilled = !!killedNodes['db'];
    const isLbKilled = !!killedNodes['lb'];
    const aliveServers = Array.from({ length: serverCount }).filter((_, i) => !killedNodes[`srv-${i}`]).length;

    if (isLbKilled || aliveServers === 0) {
      return {
        latency: 0,
        throughput: 0,
        errorRate: 100,
        bottleneck: 'CRITICAL: No active compute or load balancer. 100% of requests dropping with 502/504 errors.'
      };
    }

    if (isDbKilled) {
      return {
        latency: 1800,
        throughput: Math.round(trafficRps * 0.1),
        errorRate: 90,
        bottleneck: 'CRITICAL: Primary Database is DOWN! Only cached static reads succeed. Writes are failing.'
      };
    }

    // Effective capacity per server: ~1500 RPS without cache, ~4000 RPS with cache
    const capacityPerServer = hasCache ? 3500 : 1200;
    const totalCapacity = aliveServers * capacityPerServer;
    const loadRatio = trafficRps / Math.max(1, totalCapacity);

    const baseLat = hasCdn ? 20 : 60;
    const cacheLat = hasCache ? 8 : 45;
    const dbLat = 25 * (1 - (hasCache ? cacheHitRate : 0));
    const congestionFactor = Math.max(1, Math.pow(loadRatio, 2));

    const latency = Math.round((baseLat + cacheLat + dbLat) * congestionFactor);
    const errorRate = loadRatio > 1.3 ? Math.min(95, Math.round((loadRatio - 1.2) * 50)) : 0;
    const throughput = Math.round(trafficRps * (1 - errorRate / 100));

    let bottleneck = 'System healthy and operational.';
    if (loadRatio > 1.2) {
      bottleneck = `App server cluster overloaded (${Math.round(loadRatio * 100)}% capacity). Add more server instances!`;
    } else if (hasCache && cacheHitRate < 0.3) {
      bottleneck = 'Low cache hit rate causing database contention. Warm up the Redis cache!';
    } else if (!hasCache && trafficRps > 2000) {
      bottleneck = 'Direct database reads are bottlenecking throughput. Introduce a Redis cache layer.';
    }

    return {
      latency,
      throughput,
      errorRate,
      bottleneck
    };
  }, [trafficRps, cacheHitRate, serverCount, hasCache, hasCdn, killedNodes]);

  // Dynamically generate the 2.5D Isometric Scene Graph
  const scene: SceneGraph = useMemo(() => {
    const entities: SceneGraph['entities'] = {
      client: {
        x: 0,
        y: -14,
        type: 'block',
        color: 'sand',
        glyph: 'user',
        label: 'Clients',
        tags: [{ text: `${trafficRps.toLocaleString()} RPS`, tone: 'amber' }]
      }
    };

    const links: SceneGraph['links'] = {};
    const flows: SceneGraph['flows'] = [];

    let currentY = -7;

    // Optional CDN
    if (hasCdn) {
      entities['cdn'] = {
        x: 0,
        y: currentY,
        type: 'block',
        color: 'orange',
        glyph: 'globe',
        label: ['Cloudflare', 'Edge CDN'],
        tags: [{ text: 'Edge PoP', tone: 'paper' }]
      };
      links['client-cdn'] = {
        pts: [[0, -12], [0, currentY - 2]],
        heads: 'end'
      };
      flows.push({ route: ['client-cdn'], kind: 'req', rate: 1.5 });
      currentY += 6;
    }

    // Load Balancer
    const isLbDead = !!killedNodes['lb'];
    entities['lb'] = {
      x: 0,
      y: currentY,
      type: 'block',
      color: 'orange',
      glyph: 'balancer',
      label: ['Load', 'Balancer'],
      dead: isLbDead ? 1 : 0,
      tags: isLbDead ? [{ text: 'DOWN', tone: 'red' }] : [{ text: 'ALB OK', tone: 'green' }]
    };

    if (hasCdn) {
      links['cdn-lb'] = {
        pts: [[0, currentY - 6], [0, currentY - 2]],
        heads: 'end'
      };
      flows.push({ route: ['cdn-lb'], kind: 'req', rate: 1.5 });
    } else {
      links['client-lb'] = {
        pts: [[0, -12], [0, currentY - 2]],
        heads: 'end'
      };
      flows.push({ route: ['client-lb'], kind: 'req', rate: 1.5 });
    }

    currentY += 8;

    // App Servers
    const serverSpacing = 8;
    const startX = -((serverCount - 1) * serverSpacing) / 2;

    for (let i = 0; i < serverCount; i++) {
      const srvId = `srv-${i}`;
      const isDead = !!killedNodes[srvId];
      const srvX = startX + i * serverSpacing;

      entities[srvId] = {
        x: srvX,
        y: currentY,
        type: 'block',
        color: 'blue',
        glyph: 'server',
        label: `Server #${i + 1}`,
        dead: isDead ? 1 : 0,
        cpu: isDead ? undefined : Math.min(0.99, (trafficRps / (serverCount * 2500))),
        tags: isDead ? [{ text: 'OFFLINE', tone: 'red' }] : undefined
      };

      if (!isLbDead) {
        const linkKey = `lb-srv-${i}`;
        links[linkKey] = {
          pts: [[0, currentY - 6], [srvX, currentY - 2]],
          heads: 'end',
          color: isDead ? '#c0392b' : '#2f8a43'
        };
        if (!isDead) {
          flows.push({ route: [linkKey], kind: 'req', rate: 1.2 });
        }
      }
    }

    currentY += 8;

    // In-memory Cache (Redis)
    if (hasCache) {
      const isCacheDead = !!killedNodes['cache'];
      entities['cache'] = {
        x: -9,
        y: currentY,
        type: 'block',
        color: 'violet',
        glyph: 'cache',
        label: 'Redis Cache',
        dead: isCacheDead ? 1 : 0,
        tags: [{ text: `${Math.round(cacheHitRate * 100)}% Hit`, tone: 'violet' }]
      };

      for (let i = 0; i < serverCount; i++) {
        const srvX = startX + i * serverSpacing;
        links[`srv-${i}-cache`] = {
          pts: [[srvX, currentY - 6], [-9, currentY - 2]],
          heads: 'both',
          color: '#7c63d0'
        };
      }
    }

    // Database Primary
    const isDbDead = !!killedNodes['db'];
    entities['db'] = {
      x: hasCache ? 9 : 0,
      y: currentY,
      type: 'db',
      color: 'violet',
      glyph: 'database',
      label: 'Postgres Primary',
      dead: isDbDead ? 1 : 0,
      tags: isDbDead ? [{ text: 'DOWN', tone: 'red' }] : [{ text: 'WAL OK', tone: 'green' }]
    };

    for (let i = 0; i < serverCount; i++) {
      const srvX = startX + i * serverSpacing;
      links[`srv-${i}-db`] = {
        pts: [[srvX, currentY - 6], [hasCache ? 9 : 0, currentY - 2]],
        heads: 'both',
        color: isDbDead ? '#c0392b' : '#1d1b18'
      };
    }

    return { entities, links, flows };
  }, [trafficRps, cacheHitRate, serverCount, hasCache, hasCdn, killedNodes]);

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left Control Bar */}
      <div style={{ width: 340, background: 'var(--sheet)', borderRight: '1.5px solid var(--line-strong)', padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Zap size={18} color="var(--rust)" />
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Design Lab Studio</h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Build, scale, and stress test live distributed architectures.
          </p>
        </div>

        {/* Preset Selector */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
            Architecture Blueprint Presets
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className={`btn-pop ${preset === 'monolith' ? 'is-active' : ''}`}
              onClick={() => applyPreset('monolith')}
              style={{ fontSize: 12 }}
            >
              Single Monolith (No Cache/CDN)
            </button>
            <button
              className={`btn-pop ${preset === 'scale' ? 'is-active' : ''}`}
              onClick={() => applyPreset('scale')}
              style={{ fontSize: 12 }}
            >
              High-Scale 3-Tier (CDN + Redis + Replicas)
            </button>
          </div>
        </div>

        {/* Traffic Load Slider */}
        <div style={{ background: 'var(--card)', border: '1.2px solid var(--line-strong)', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Inbound Traffic Load:</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--rust)' }}>
              {trafficRps.toLocaleString()} req/s
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="15000"
            step="200"
            value={trafficRps}
            onChange={(e) => setTrafficRps(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Component Topology Controls */}
        <div style={{ background: 'var(--card)', border: '1.2px solid var(--line-strong)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Components & Scale
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>App Server Nodes:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="tool-btn"
                style={{ width: 24, height: 24 }}
                disabled={serverCount <= 1}
                onClick={() => setServerCount((c) => Math.max(1, c - 1))}
              >
                -
              </button>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{serverCount}</span>
              <button
                className="tool-btn"
                style={{ width: 24, height: 24 }}
                disabled={serverCount >= 4}
                onClick={() => setServerCount((c) => Math.min(4, c + 1))}
              >
                +
              </button>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasCache}
              onChange={(e) => setHasCache(e.target.checked)}
            />
            <span>Enable In-Memory Cache (Redis)</span>
          </label>

          {hasCache && (
            <div style={{ paddingLeft: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span>Cache Hit Rate:</span>
                <strong>{Math.round(cacheHitRate * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={cacheHitRate}
                onChange={(e) => setCacheHitRate(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasCdn}
              onChange={(e) => setHasCdn(e.target.checked)}
            />
            <span>Enable Cloudflare Edge CDN</span>
          </label>
        </div>

        {/* Chaos Engineering / Node Failure Simulator */}
        <div style={{ background: 'var(--card)', border: '1.2px solid var(--line-strong)', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Flame size={14} color="#c0392b" />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Chaos Simulator (Kill Nodes)
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              className={`btn-pop ${killedNodes['lb'] ? 'tone-red' : ''}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => toggleKillNode('lb')}
            >
              {killedNodes['lb'] ? 'Revive LB' : 'Kill LB'}
            </button>
            <button
              className={`btn-pop ${killedNodes['srv-0'] ? 'tone-red' : ''}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => toggleKillNode('srv-0')}
            >
              {killedNodes['srv-0'] ? 'Revive Srv #1' : 'Kill Srv #1'}
            </button>
            <button
              className={`btn-pop ${killedNodes['db'] ? 'tone-red' : ''}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => toggleKillNode('db')}
            >
              {killedNodes['db'] ? 'Revive DB' : 'Kill Primary DB'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Live Telemetry Stage */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Top Live Telemetry Bar */}
        <div style={{ height: 50, background: 'var(--card-2)', borderBottom: '1.5px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Activity size={14} color="var(--rust)" />
            <span style={{ color: 'var(--muted)' }}>Throughput:</span>
            <strong>{telemetry.throughput.toLocaleString()} req/s</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Cpu size={14} color="#1f63a0" />
            <span style={{ color: 'var(--muted)' }}>p99 Latency:</span>
            <strong style={{ color: telemetry.latency > 500 ? '#c0392b' : '#2f8a43' }}>
              {telemetry.latency} ms
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <ShieldAlert size={14} color={telemetry.errorRate > 0 ? '#c0392b' : '#2f8a43'} />
            <span style={{ color: 'var(--muted)' }}>5xx Errors:</span>
            <strong style={{ color: telemetry.errorRate > 0 ? '#c0392b' : '#2f8a43' }}>
              {telemetry.errorRate}%
            </strong>
          </div>
        </div>

        {/* Bottleneck Warning Ribbon if degraded */}
        {telemetry.errorRate > 0 || telemetry.latency > 300 ? (
          <div style={{ background: '#f8d5cf', borderBottom: '1px solid #c0392b', padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#8f2a22', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={14} /> {telemetry.bottleneck}
          </div>
        ) : (
          <div style={{ background: '#dcefd2', borderBottom: '1px solid #7fc278', padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#24521c', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✓ {telemetry.bottleneck}
          </div>
        )}

        {/* Real-time Isometric Stage */}
        <IsoStage scene={scene} />
      </div>
    </div>
  );
};

