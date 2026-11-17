import React, { useState, useEffect } from 'react';
import { LessonData } from '../../types';
import { IsoStage } from '../isometric/IsoStage';
import { GuidePanel } from './GuidePanel';
import { MetricChips } from './MetricChips';
import { StepTimeline } from './StepTimeline';

interface LearnViewProps {
  lesson: LessonData;
  stepIndex?: number;
  onSelectStep?: (index: number) => void;
  onNextLesson?: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  lesson,
  stepIndex: externalStepIndex,
  onSelectStep: externalOnSelectStep,
  onNextLesson
}) => {
  const [internalStepIndex, setInternalStepIndex] = useState(0);

  const stepIndex = externalStepIndex !== undefined ? externalStepIndex : internalStepIndex;
  const setStepIndex = (idx: number) => {
    if (externalOnSelectStep) {
      externalOnSelectStep(idx);
    } else {
      setInternalStepIndex(idx);
    }
  };

  // Ensure step index stays in valid range
  const safeStepIndex = Math.min(Math.max(0, stepIndex), Math.max(0, lesson.steps.length - 1));
  const currentStep = lesson.steps[safeStepIndex] || lesson.steps[0];

  const handleNext = () => {
    if (safeStepIndex < lesson.steps.length - 1) {
      setStepIndex(safeStepIndex + 1);
    } else if (onNextLesson) {
      onNextLesson();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (safeStepIndex < lesson.steps.length - 1) {
          setStepIndex(safeStepIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (safeStepIndex > 0) {
          setStepIndex(safeStepIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeStepIndex, lesson.steps.length]);

  return (
    <div className="learn-viewport">
      <div className="stage-wrapper">
        <MetricChips metrics={currentStep.metrics} />
        <IsoStage scene={currentStep.scene} />
        <StepTimeline
          steps={lesson.steps}
          currentStepIndex={safeStepIndex}
          onSelectStep={setStepIndex}
        />
      </div>

      <GuidePanel
        lesson={lesson}
        step={currentStep}
        stepIndex={safeStepIndex}
        totalSteps={lesson.steps.length}
        onNext={handleNext}
      />
    </div>
  );
};
