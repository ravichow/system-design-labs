import React from 'react';
import { NavTab } from '../types';
import { BookOpen, Sliders, Layout, FileText, Sun, Moon, Maximize2, Menu } from 'lucide-react';
import { VoiceNarration } from './VoiceNarration';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  textToNarrate?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onToggleSidebar,
  textToNarrate = ''
}) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="app-header">
      {/* Brand & Drawer Toggle */}
      <div className="brand-section">
        <button
          className="tool-btn"
          onClick={onToggleSidebar}
          title="Toggle Course Syllabus"
        >
          <Menu size={16} />
        </button>

        <div className="brand-title">
          <span>System Design Labs</span>
          <span className="brand-subtitle">Interactive Architecture & Simulator</span>
        </div>
      </div>

      {/* Main 4 Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${currentTab === 'learn' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('learn')}
        >
          <BookOpen size={14} /> Learn
        </button>
        <button
          className={`nav-tab-btn ${currentTab === 'practice' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('practice')}
        >
          <Sliders size={14} /> Practice
        </button>
        <button
          className={`nav-tab-btn ${currentTab === 'lab' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('lab')}
        >
          <Layout size={14} /> Design Lab
        </button>
        <button
          className={`nav-tab-btn ${currentTab === 'cheatsheets' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('cheatsheets')}
        >
          <FileText size={14} /> Cheatsheets
        </button>
      </nav>

      {/* Tools on right */}
      <div className="header-tools">
        {currentTab === 'learn' && textToNarrate && (
          <VoiceNarration textToRead={textToNarrate} />
        )}

        <button
          className="tool-btn"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          className="tool-btn"
          onClick={toggleFullScreen}
          title="Full Screen Mode"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </header>
  );
};

