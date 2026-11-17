import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface VoiceNarrationProps {
  textToRead: string;
}

export const VoiceNarration: React.FC<VoiceNarrationProps> = ({ textToRead }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  // Stop speaking if step/text changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [textToRead]);

  if (!supported) return null;

  const toggleSpeak = () => {
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      window.speechSynthesis.cancel();
      // Strip HTML tags for clean speech
      const cleanText = textToRead.replace(/<[^>]+>/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  return (
    <button
      className={`tool-btn ${isSpeaking ? 'tone-green' : ''}`}
      onClick={toggleSpeak}
      title={isSpeaking ? (isPaused ? 'Resume Voice Narration' : 'Pause Voice Narration') : 'Read Step Aloud'}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {!isSpeaking ? (
        <Volume2 size={16} />
      ) : isPaused ? (
        <Play size={14} />
      ) : (
        <Pause size={14} />
      )}
    </button>
  );
};

