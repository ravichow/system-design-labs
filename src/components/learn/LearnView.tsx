import React, { useState, useEffect } from 'react';
import { LessonData } from '../../types';
import { IsoStage } from '../isometric/IsoStage';
import { GuidePanel } from './GuidePanel';
import { MetricChips } from './MetricChips';
import { StepTimeline } from './StepTimeline';

interface LearnViewProps {
  lesson: LessonData;
  onNextLesson?: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ lesson, onNextLesson }) => {
  const [stepIndex, setStepIndex] = useState(0);

  // Reset to step 0 when lesson changes
  useEffect(() => {
    setStepIndex(0);
  }, [lesson.id]);

  const currentStep = lesson.steps[stepIndex] || lesson.steps[0];

  const handleNext = () => {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex(stepIndex + 1);
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
        if (stepIndex < lesson.steps.length - 1) {
          setStepIndex((s) => s + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (stepIndex > 0) {
          setStepIndex((s) => s - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex, lesson.steps.length]);

  return (
    <div className="learn-viewport">
      <div className="stage-wrapper">
        <MetricChips metrics={currentStep.metrics} />
        <IsoStage scene={currentStep.scene} />
        <StepTimeline
          steps={lesson.steps}
          currentStepIndex={stepIndex}
          onSelectStep={setStepIndex}
        />
      </div>

      <GuidePanel
        lesson={lesson}
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={lesson.steps.length}
        onNext={handleNext}
      />
    </div>
  );
};

