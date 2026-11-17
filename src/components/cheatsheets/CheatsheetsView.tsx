import React, { useState } from 'react';
import {
  LATENCY_NUMBERS,
  POWERS_OF_TWO,
  PROTOCOL_COMPARISON,
  CACHING_PATTERNS
} from '../../data/cheatsheetsData';
import { Clock, Database, Layers, CheckSquare, Search, Zap, Shield } from 'lucide-react';

export const CheatsheetsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'latency' | 'caching' | 'protocols' | 'interview'>('latency');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', background: 'var(--paper)' }}>
      {/* Title & Navigation */}
      <div style={{ maxWidth: 960, margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>System Design Cheatsheets</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            Instant reference for latencies, architecture trade-offs, caching patterns, and interview templates.
          </p>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeCategory === 'latency' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('latency')}
          >
            <Clock size={14} /> Latency Numbers
          </button>
          <button
            className={`nav-tab-btn ${activeCategory === 'caching' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('caching')}
          >
            <Zap size={14} /> Caching Patterns
          </button>
          <button
            className={`nav-tab-btn ${activeCategory === 'protocols' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('protocols')}
          >
            <Layers size={14} /> API Protocols
          </button>
          <button
            className={`nav-tab-btn ${activeCategory === 'interview' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('interview')}
          >
            <CheckSquare size={14} /> 45-Min Interview Template
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* CATEGORY 1: LATENCY NUMBERS */}
        {activeCategory === 'latency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Human scale analogy banner */}
            <div className="callout-box kind-insight">
              <div>
                <strong>The Human Time Analogy:</strong> If 1 CPU cycle (0.3 ns) was scaled to <strong>1 human second</strong>:
                RAM access is like waiting <strong>1.7 minutes</strong>, SSD read is <strong>14 hours</strong>, and a transatlantic packet is <strong>4.8 years</strong>!
              </div>
            </div>

            {/* Latency table */}
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--line-strong)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--pop-shadow)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--card-2)', borderBottom: '1.5px solid var(--line-strong)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Operation</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Raw Latency</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Scaled (1ns = 1s)</th>
                    <th style={{ padding: '10px 14px', fontWeight: 800 }}>Architectural Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {LATENCY_NUMBERS.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--line)',
                        background: idx % 2 === 0 ? 'var(--card)' : 'var(--paper)'
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--ink)' }}>{row.operation}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font)', fontWeight: 800, color: 'var(--rust)' }}>
                        {row.timeFormatted}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--muted)', fontWeight: 600 }}>{row.scaledSeconds}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--ink-2)' }}>{row.insight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Powers of Two */}
            <div style={{ marginTop: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Powers of Two & Data Sizing</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                {POWERS_OF_TWO.map((p, i) => (
                  <div key={i} style={{ background: 'var(--card)', border: '1.2px solid var(--line-strong)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--rust)' }}>{p.power}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', margin: '4px 0' }}>{p.unit}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.val} bytes</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY 2: CACHING PATTERNS */}
        {activeCategory === 'caching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CACHING_PATTERNS.map((pat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--line-strong)',
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: 'var(--pop-shadow)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{pat.name}</h3>
                  <span className="pill-badge tone-violet" style={{ fontSize: 11 }}>Caching Pattern</span>
                </div>

                <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
                  <code>{pat.flow}</code>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5, marginBottom: 10 }}>
                  <div style={{ background: '#dcefd2', border: '1px solid #a7d292', borderRadius: 6, padding: 10, color: '#24521c' }}>
                    <strong>✓ Advantages:</strong> {pat.pros}
                  </div>
                  <div style={{ background: '#f8d5cf', border: '1px solid #e39183', borderRadius: 6, padding: 10, color: '#8f2a22' }}>
                    <strong>✗ Trade-offs:</strong> {pat.cons}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                  <strong>Best For:</strong> {pat.bestFor}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY 3: API PROTOCOLS */}
        {activeCategory === 'protocols' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PROTOCOL_COMPARISON.map((proto, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--line-strong)',
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: 'var(--pop-shadow)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{proto.protocol}</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="pill-badge tone-sand" style={{ fontSize: 10 }}>{proto.payload}</span>
                    <span className="pill-badge tone-blue" style={{ fontSize: 10 }}>{proto.transport}</span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 6 }}>
                  <strong>Ideal Use Case:</strong> {proto.bestFor}
                </p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  <strong>Watch out:</strong> {proto.drawbacks}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY 4: 45-MINUTE INTERVIEW BLUEPRINT */}
        {activeCategory === 'interview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              {
                phase: 'Phase 1: Scope & Clarify Requirements',
                time: '0 – 5 mins',
                tone: 'tone-sand',
                tips: [
                  'Clarify functional requirements: What are the 2-3 core features users can perform?',
                  'Clarify non-functional requirements: DAU, Read vs Write heavy, Latency targets (p99 < 100ms), Availability (99.99%), Consistency expectations (Strict ACID vs Eventual).',
                  'Explicitly state what is OUT of scope to avoid rabbit holes.'
                ]
              },
              {
                phase: 'Phase 2: Capacity Estimation (Napkin Math)',
                time: '5 – 10 mins',
                tone: 'tone-teal',
                tips: [
                  'Convert DAU to QPS: 10M DAU × 10 requests = 100M/day ≈ 1,200 QPS (Peak 2.5K QPS).',
                  'Storage calculation: 100M items/day × 500 bytes = 50 GB/day × 365 ≈ 18 TB/year.',
                  'Bandwidth estimation: Incoming QPS × payload size (e.g. 1.2K × 2KB = 2.4 MB/s).'
                ]
              },
              {
                phase: 'Phase 3: High-Level Architecture & Data Model',
                time: '10 – 25 mins',
                tone: 'tone-blue',
                tips: [
                  'Draw the end-to-end request path: Client → CDN → Load Balancer → API Gateway → Stateless Services → Database.',
                  'Define key entity schemas and database selection (SQL vs NoSQL with justification).',
                  'Define primary REST/gRPC endpoints (e.g. POST /v1/tweets, GET /v1/feed).'
                ]
              },
              {
                phase: 'Phase 4: Deep Dive, Bottlenecks & SPOFs',
                time: '25 – 40 mins',
                tone: 'tone-rose',
                tips: [
                  'Identify Single Points of Failure: What happens when the primary DB dies? (Failover replica + Raft quorum).',
                  'Caching layer: Where can we place Redis? Cache-aside strategy and cache eviction policy (LRU).',
                  'Database Scaling: Partitioning / Sharding key selection to prevent hot spots.',
                  'Rate Limiting & DDoS: Token bucket at API Gateway to reject abuse.'
                ]
              }
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--line-strong)',
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: 'var(--pop-shadow)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{step.phase}</h3>
                  <span className={`pill-badge ${step.tone}`}>{step.time}</span>
                </div>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}>
                  {step.tips.map((t, i) => (
                    <li key={i} style={{ lineHeight: 1.5 }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

