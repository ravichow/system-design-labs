import React from 'react';
import { LessonData, LessonStep } from '../../types';
import { Lightbulb, Info, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GuidePanelProps {
  lesson: LessonData;
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
}

export const GuidePanel: React.FC<GuidePanelProps> = ({
  lesson,
  step,
  stepIndex,
  totalSteps,
  onNext
}) => {
  const isLastStep = stepIndex === totalSteps - 1;

  const renderCalloutIcon = (kind: string) => {
    switch (kind) {
      case 'tip':
        return <Lightbulb size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />;
      case 'warn':
        return <AlertTriangle size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />;
      case 'insight':
      default:
        return <Info size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />;
    }
  };

  return (
    <aside className="guide-panel">
      {/* Header with chapter metadata */}
      <div className="guide-header">
        <div className="guide-meta">
          <span className="pill-badge tone-sand" style={{ fontSize: 10 }}>
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className={`pill-badge tone-${step.chapter === 'problem' ? 'red' : step.chapter === 'solution' ? 'green' : 'violet'}`} style={{ textTransform: 'capitalize' }}>
            {step.chapter}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
          {lesson.title}
        </span>
      </div>

      {/* Main text content */}
      <div className="guide-body-scroll">
        <h2 className="guide-step-title">{step.title}</h2>

        {step.body.map((paragraph, i) => (
          <p
            key={i}
            className="guide-step-text"
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        ))}

        {/* Callout Notice */}
        {step.callout && (
          <div className={`callout-box kind-${step.callout.kind}`}>
            {renderCalloutIcon(step.callout.kind)}
            <div>
              <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>
                {step.callout.kind === 'insight' ? 'Key Insight' : step.callout.kind === 'tip' ? 'Pro Tip' : 'Warning'}
              </div>
              <div>{step.callout.text}</div>
            </div>
          </div>
        )}

        {/* Diff Changes */}
        {step.changes && step.changes.length > 0 && (
          <div className="changes-card">
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>
              Architectural Changes
            </div>
            {step.changes.map((ch, idx) => {
              const isAdd = ch.startsWith('+');
              const isMod = ch.startsWith('~');
              const isDel = ch.startsWith('-') || ch.startsWith('!');
              return (
                <div
                  key={idx}
                  className={`change-item ${isAdd ? 'add' : isMod ? 'mod' : isDel ? 'del' : ''}`}
                >
                  <span>{ch}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Next Step / Complete button */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', background: 'var(--card-2)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-pop is-active"
          onClick={onNext}
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 13 }}
        >
          {isLastStep ? (
            <>
              <CheckCircle2 size={16} /> Lesson Complete! Next Topic
            </>
          ) : (
            <>
              Continue to Step {stepIndex + 2} <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

