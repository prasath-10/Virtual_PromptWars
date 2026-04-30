import React, { useState, useEffect } from 'react';
import { speakText, stopSpeaking } from '../services/tts';

export default function VoiceButton({ text }) {
  const [state, setState] = useState('default'); // 'default', 'playing'

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleClick = () => {
    if (state === 'playing') {
      stopSpeaking();
      setState('default');
      return;
    }

    const utterance = speakText(text);
    if (!utterance) return;
    
    setState('playing');
    
    utterance.onend = () => setState('default');
    utterance.onerror = () => setState('default');
  };

  if (!window.speechSynthesis) {
    return null;
  }

  return (
    <button 
      onClick={handleClick}
      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
    >
      {state === 'default' && (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 19l-7-7h-4V12h4l7-7v14z"></path>
          </svg>
          <span>Read aloud</span>
        </>
      )}
      {state === 'playing' && (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Stop</span>
          <div className="flex space-x-0.5 items-end h-4 ml-2">
            <div className="w-1 bg-[#378ADD] animate-[pulse_1s_infinite] h-2"></div>
            <div className="w-1 bg-[#378ADD] animate-[pulse_0.8s_infinite] h-4"></div>
            <div className="w-1 bg-[#378ADD] animate-[pulse_1.2s_infinite] h-3"></div>
          </div>
        </>
      )}
    </button>
  );
}
