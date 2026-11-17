import React from 'react';
import { CURRICULUM } from '../data/curriculum';
import { Check, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeLessonId,
  onSelectLesson
}) => {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'is-collapsed'}`}>
      <div className="sidebar-header">
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Course Curriculum
        </span>
        <button className="tool-btn" onClick={onClose} title="Close Menu" style={{ width: 26, height: 26 }}>
          <X size={14} />
        </button>
      </div>

      <div className="sidebar-content">
        {CURRICULUM.map((mod) => (
          <div key={mod.id} className="module-group">
            <div className="module-header">
              <span className="module-num">{mod.num}</span>
              <span>{mod.title}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    className={`lesson-item-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      onSelectLesson(lesson.id);
                    }}
                  >
                    <span>{lesson.title}</span>
                    {isActive && <Check size={13} strokeWidth={2.6} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

