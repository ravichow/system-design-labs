import React, { useState } from 'react';
import { PRACTICE_QUIZZES } from '../../data/practiceData';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';

export const QuizChallenge: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const quiz = PRACTICE_QUIZZES[currentIdx];

  const handleSelect = (optId: string) => {
    if (isSubmitted) return;
    setSelectedOpt(optId);
  };

  const handleSubmit = () => {
    if (!selectedOpt) return;
    setIsSubmitted(true);
    if (selectedOpt === quiz.correctId) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsSubmitted(false);
    if (currentIdx < PRACTICE_QUIZZES.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sheet)', padding: '12px 18px', borderRadius: 10, border: '1.5px solid var(--line-strong)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="pill-badge tone-sand">Scenario {currentIdx + 1} of {PRACTICE_QUIZZES.length}</span>
          <span className="pill-badge tone-amber">{quiz.category}</span>
          <span className={`pill-badge tone-${quiz.difficulty === 'Hard' ? 'red' : 'green'}`}>{quiz.difficulty}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          Score: <span style={{ color: 'var(--rust)' }}>{score}</span> / {PRACTICE_QUIZZES.length}
        </div>
      </div>

      {/* Scenario Card */}
      <div style={{ background: 'var(--card)', border: '1.5px solid var(--ink)', borderRadius: 12, padding: 22, boxShadow: 'var(--pop-shadow-lg)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: 'var(--ink)' }}>
          {quiz.title}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 16 }}>
          {quiz.scenario}
        </p>

        {quiz.metricsGiven && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {Object.entries(quiz.metricsGiven).map(([k, v]) => (
              <div key={k} className="pill-badge tone-sand" style={{ padding: '4px 10px', fontSize: 11 }}>
                <span style={{ color: 'var(--muted)' }}>{k}:</span> <strong>{v}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quiz.options.map((opt) => {
            const isSelected = selectedOpt === opt.id;
            const isCorrect = isSubmitted && opt.id === quiz.correctId;
            const isWrong = isSubmitted && isSelected && opt.id !== quiz.correctId;

            let borderColor = 'var(--line-strong)';
            let bgColor = 'var(--paper)';
            if (isSelected) {
              borderColor = 'var(--ink)';
              bgColor = 'var(--sheet)';
            }
            if (isCorrect) {
              borderColor = '#2f8a43';
              bgColor = '#dcefd2';
            } else if (isWrong) {
              borderColor = '#c0392b';
              bgColor = '#f8d5cf';
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  border: `1.8px solid ${borderColor}`,
                  background: bgColor,
                  borderRadius: 10,
                  padding: '12px 16px',
                  cursor: isSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: isSelected ? 'var(--pop-shadow)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 2 }}>
                    {isCorrect ? (
                      <CheckCircle2 size={18} color="#24521c" />
                    ) : isWrong ? (
                      <XCircle size={18} color="#8f2a22" />
                    ) : (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '2px solid var(--ink)',
                          background: isSelected ? 'var(--ink)' : 'transparent'
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4 }}>
                      {opt.text}
                    </div>
                    {isSubmitted && (
                      <div style={{ fontSize: 11.5, marginTop: 6, color: 'var(--muted)', fontWeight: 600 }}>
                        <strong>Trade-off:</strong> {opt.tradeoff}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {!isSubmitted ? (
            <button
              className="btn-pop is-active"
              disabled={!selectedOpt}
              onClick={handleSubmit}
              style={{ opacity: selectedOpt ? 1 : 0.5, padding: '8px 20px', fontSize: 13 }}
            >
              Confirm Choice <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="btn-pop is-active"
              onClick={handleNext}
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              {currentIdx < PRACTICE_QUIZZES.length - 1 ? (
                <>Next Challenge <ArrowRight size={15} /></>
              ) : (
                <>Restart Quiz <RotateCcw size={15} /></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Explanation Reveal */}
      {isSubmitted && (
        <div style={{ background: 'var(--sheet)', border: '1.5px solid var(--ink)', borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, color: 'var(--ink)', fontWeight: 800 }}>
            <Lightbulb size={18} color="var(--rust)" />
            <span>Architectural Explanation & Trade-offs</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 12 }}>
            {quiz.explanation}
          </p>
          <div className="callout-box kind-insight" style={{ fontSize: 12 }}>
            <strong>Rule of Thumb:</strong> {quiz.architectureInsight}
          </div>
        </div>
      )}
    </div>
  );
};

