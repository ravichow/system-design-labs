import React, { useState, useEffect } from 'react';
import { NavTab } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LearnView } from './components/learn/LearnView';
import { PracticeView } from './components/practice/PracticeView';
import { DesignLabView } from './components/lab/DesignLabView';
import { CheatsheetsView } from './components/cheatsheets/CheatsheetsView';
import { getLesson } from './data/lessons';
import { CURRICULUM } from './data/curriculum';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('learn');
  const [activeLessonId, setActiveLessonId] = useState<string>('request-lifecycle');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('scale_theme') === 'dark';
  });

  // Apply theme to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('scale_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('scale_theme', 'light');
    }
  }, [isDark]);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (!hash) return;

      if (hash === 'practice') {
        setCurrentTab('practice');
      } else if (hash === 'lab' || hash === 'design-lab') {
        setCurrentTab('lab');
      } else if (hash === 'cheatsheets') {
        setCurrentTab('cheatsheets');
      } else if (hash) {
        const parts = hash.split('/');
        const lessonId = parts[0] === 'learn' ? parts[1] : parts[0];
        const stepNum = parts[0] === 'learn' ? parts[2] : parts[1];

        if (lessonId && lessonId !== 'learn') {
          setActiveLessonId(lessonId);
          setCurrentTab('learn');
          if (stepNum) {
            const parsed = parseInt(stepNum, 10);
            if (!isNaN(parsed) && parsed >= 1) {
              setActiveStepIndex(parsed - 1);
            }
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'learn') {
      window.location.hash = `#/${activeLessonId}/${activeStepIndex + 1}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveStepIndex(0);
    setCurrentTab('learn');
    window.location.hash = `#/${lessonId}/1`;
    // On small screens, close sidebar
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectStep = (idx: number) => {
    setActiveStepIndex(idx);
    window.location.hash = `#/${activeLessonId}/${idx + 1}`;
  };

  const handleNextLesson = () => {
    // Find next lesson in curriculum
    const all = CURRICULUM.flatMap((m) => m.lessons);
    const currIdx = all.findIndex((l) => l.id === activeLessonId);
    if (currIdx !== -1 && currIdx < all.length - 1) {
      const nextLesson = all[currIdx + 1];
      handleSelectLesson(nextLesson.id);
    }
  };

  const currentLesson = getLesson(activeLessonId);
  const textToNarrate = currentLesson ? `${currentLesson.title}. ${currentLesson.summary}` : '';

  return (
    <div className="app-container">
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
        textToNarrate={textToNarrate}
      />

      <div className="workspace-body">
        {currentTab === 'learn' && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeLessonId={activeLessonId}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentTab === 'learn' && (
          <LearnView
            lesson={currentLesson}
            stepIndex={activeStepIndex}
            onSelectStep={handleSelectStep}
            onNextLesson={handleNextLesson}
          />
        )}

        {currentTab === 'practice' && <PracticeView />}
        {currentTab === 'lab' && <DesignLabView />}
        {currentTab === 'cheatsheets' && <CheatsheetsView />}
      </div>
    </div>
  );
};
