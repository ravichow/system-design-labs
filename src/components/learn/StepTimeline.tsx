import React from 'react';
import { LessonStep } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepTimelineProps {
  steps: LessonStep[];
  currentStepIndex: number;
  onSelectStep: (idx: number) => void;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  steps,
  currentStepIndex,
  onSelectStep
}) => {
  return (
    <div className="timeline-bar">
      <button
        className="btn-pop"
        disabled={currentStepIndex === 0}
        onClick={() => onSelectStep(currentStepIndex - 1)}
        style={{ opacity: currentStepIndex === 0 ? 0.4 : 1, padding: '4px 8px', fontSize: 11 }}
      >
        <ChevronLeft size={14} /> Prev
      </button>

      <div className="timeline-steps">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const toneClass =
            step.chapter === 'problem'
              ? 'tone-red'
              : step.chapter === 'solution'
              ? 'tone-green'
              : step.chapter === 'insight'
              ? 'tone-violet'
              : 'tone-sand';

          return (
            <button
              key={idx}
              className={`timeline-step-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectStep(idx)}
            >
              <span className={`pill-badge ${toneClass}`} style={{ fontSize: 9, padding: '1px 5px' }}>
                {idx + 1}
              </span>
              <span>{step.short}</span>
            </button>
          );
        })}
      </div>

      <button
        className="btn-pop"
        disabled={currentStepIndex === steps.length - 1}
        onClick={() => onSelectStep(currentStepIndex + 1)}
        style={{ opacity: currentStepIndex === steps.length - 1 ? 0.4 : 1, padding: '4px 8px', fontSize: 11 }}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
};

