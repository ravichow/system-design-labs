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
      } else if (hash.startsWith('learn') || hash) {
        const lessonId = hash.split('/')[0];
        if (lessonId && lessonId !== 'learn') {
          setActiveLessonId(lessonId);
          setCurrentTab('learn');
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
      window.location.hash = `#/${activeLessonId}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentTab('learn');
    window.location.hash = `#/${lessonId}`;
    // On small screens, close sidebar
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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
          <LearnView lesson={currentLesson} onNextLesson={handleNextLesson} />
        )}

        {currentTab === 'practice' && <PracticeView />}
        {currentTab === 'lab' && <DesignLabView />}
        {currentTab === 'cheatsheets' && <CheatsheetsView />}
      </div>
    </div>
  );
};

