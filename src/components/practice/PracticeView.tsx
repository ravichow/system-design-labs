import React, { useState } from 'react';
import { QuizChallenge } from './QuizChallenge';
import { NapkinMathTrainer } from './NapkinMathTrainer';
import { COMPONENT_MATCHES } from '../../data/practiceData';
import { BookOpen, Calculator, Layers, CheckCircle2 } from 'lucide-react';

export const PracticeView: React.FC = () => {
  const [subTab, setSubTab] = useState<'scenarios' | 'math' | 'components'>('scenarios');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', background: 'var(--paper)' }}>
      {/* Sub tabs */}
      <div style={{ maxWidth: 840, margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>System Design Practice Arena</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            Stress test your architectural intuition with realistic production incidents and sizing math.
          </p>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${subTab === 'scenarios' ? 'is-active' : ''}`}
            onClick={() => setSubTab('scenarios')}
          >
            <BookOpen size={14} /> Incidents & Trade-offs
          </button>
          <button
            className={`nav-tab-btn ${subTab === 'math' ? 'is-active' : ''}`}
            onClick={() => setSubTab('math')}
          >
            <Calculator size={14} /> Napkin Math
          </button>
          <button
            className={`nav-tab-btn ${subTab === 'components' ? 'is-active' : ''}`}
            onClick={() => setSubTab('components')}
          >
            <Layers size={14} /> Tech Matcher
          </button>
        </div>
      </div>

      {subTab === 'scenarios' && <QuizChallenge />}
      {subTab === 'math' && <NapkinMathTrainer />}
      {subTab === 'components' && (
        <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {COMPONENT_MATCHES.map((cm, i) => (
            <div
              key={i}
              style={{
                background: 'var(--card)',
                border: '1.5px solid var(--line-strong)',
                borderRadius: 10,
                padding: '16px 20px',
                boxShadow: 'var(--pop-shadow)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20
              }}
            >
              <div style={{ flex: 1 }}>
                <span className="pill-badge tone-sand" style={{ fontSize: 10, marginBottom: 6 }}>
                  Requirement #{i + 1}
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                  {cm.requirement}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {cm.reason}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--rust)' }}>
                  {cm.technology}
                </div>
                <span className="pill-badge tone-green" style={{ fontSize: 10, marginTop: 4 }}>
                  <CheckCircle2 size={10} /> {cm.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

