import { LessonData } from '../../types';
import { requestLifecycleLesson } from './request-lifecycle';
import { loadBalancingLesson } from './load-balancing';

export const ALL_LESSONS: Record<string, LessonData> = {
  'request-lifecycle': requestLifecycleLesson,
  'load-balancing': loadBalancingLesson
};

export function getLesson(id: string): LessonData {
  return ALL_LESSONS[id] || requestLifecycleLesson;
}

