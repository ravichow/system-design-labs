import { LessonData } from '../../types';
import allLessonsData from '../allLessons.json';
import { findLesson } from '../curriculum';

export const ALL_LESSONS: Record<string, LessonData> = allLessonsData as unknown as Record<string, LessonData>;

export function getLesson(id: string): LessonData {
  const lesson = ALL_LESSONS[id] || ALL_LESSONS['request-lifecycle'];
  const cur = findLesson(id);
  return {
    ...lesson,
    moduleId: cur?.module?.id || 'foundations'
  };
}
