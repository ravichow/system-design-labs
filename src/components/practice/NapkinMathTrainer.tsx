import React, { useState } from 'react';
import { MATH_CHALLENGES } from '../../data/practiceData';
import { Calculator, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const NapkinMathTrainer: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userVal, setUserVal] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const challenge = MATH_CHALLENGES[currentIdx];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(userVal.trim());
    if (isNaN(num)) return;

    const lower = challenge.correctAnswer * (1 - challenge.tolerancePct / 100);
    const upper = challenge.correctAnswer * (1 + challenge.tolerancePct / 100);

    if (num >= lower && num <= upper) {
      setFeedback('correct');
      confetti({ particleCount: 40, spread: 50 });
    } else {
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    setUserVal('');
    setFeedback('idle');
    if (currentIdx < MATH_CHALLENGES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sheet)', padding: '12px 18px', borderRadius: 10, border: '1.5px solid var(--line-strong)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="pill-badge tone-sand">Napkin Math #{currentIdx + 1}</span>
          <span className="pill-badge tone-teal">Capacity Estimation</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
          Back-of-the-Envelope Interview Trainer
        </div>
      </div>

      {/* Problem Card */}
      <div style={{ background: 'var(--card)', border: '1.5px solid var(--ink)', borderRadius: 12, padding: 22, boxShadow: 'var(--pop-shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Calculator size={20} color="var(--rust)" />
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>{challenge.title}</h3>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 16 }}>
          {challenge.problem}
        </p>

        {/* Given variables table */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
          {challenge.variables.map((v, i) => (
            <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--line-strong)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{v.name}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{v.val}</div>
              <div style={{ fontSize: 10, color: 'var(--muted-2)' }}>{v.desc}</div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {challenge.question}
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="number"
              step="any"
              placeholder="e.g. 5"
              value={userVal}
              disabled={feedback !== 'idle'}
              onChange={(e) => setUserVal(e.target.value)}
              style={{
                fontFamily: 'var(--font)',
                background: 'var(--paper)',
                border: '1.5px solid var(--ink)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 15,
                fontWeight: 700,
                width: 160
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
              {challenge.unit}
            </span>

            {feedback === 'idle' ? (
              <button
                type="submit"
                className="btn-pop is-active"
                disabled={!userVal}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                Validate Estimation
              </button>
            ) : (
              <button
                type="button"
                className="btn-pop is-active"
                onClick={handleNext}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                Next Challenge <ArrowRight size={15} />
              </button>
            )}
          </div>
        </form>

        {/* Result banner */}
        {feedback !== 'idle' && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 8,
              border: '1.5px solid var(--ink)',
              background: feedback === 'correct' ? '#dcefd2' : '#fbe5bd',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}
          >
            {feedback === 'correct' ? (
              <CheckCircle2 size={22} color="#24521c" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={22} color="#8f2a22" style={{ flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: feedback === 'correct' ? '#24521c' : '#6d4a0c' }}>
                {feedback === 'correct'
                  ? 'Spot on! Accurate estimation.'
                  : `Close! Expected ~${challenge.correctAnswer} ${challenge.unit}.`}
              </div>
              <div style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.5, color: 'var(--ink)' }}>
                <strong>Formula:</strong> <code>{challenge.formula}</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step by Step Breakdown */}
      {feedback !== 'idle' && (
        <div style={{ background: 'var(--sheet)', border: '1.5px solid var(--ink)', borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Step-by-Step Interview Calculation:</div>
          <pre style={{ fontFamily: 'var(--font)', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--ink-2)' }}>
            {challenge.explanation}
          </pre>
        </div>
      )}
    </div>
  );
};

