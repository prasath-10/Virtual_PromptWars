import React, { useState, useRef, useEffect } from 'react';
import { speakText } from '../services/tts';

export default function VoiceButton({ text }) {
  const [state, setState] = useState('default'); // 'default', 'loading', 'playing'
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleClick = async () => {
    if (state === 'playing') {
      if (audioRef.current) audioRef.current.pause();
      setState('default');
      return;
    }

    if (state === 'loading') return;

    try {
      setState('loading');
      const audio = await speakText(text);
      audioRef.current = audio;
      
      audio.onplay = () => setState('playing');
      audio.onended = () => setState('default');
      audio.onpause = () => {
        if (audio.currentTime !== audio.duration) {
          setState('default');
        }
      };
    } catch (error) {
      console.error(error);
      setState('default');
      alert("Failed to load voice. Check your API key.");
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={state === 'loading'}
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
      {state === 'loading' && (
        <>
          <svg className="animate-spin w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Preparing voice...</span>
        </>
      )}
      {state === 'playing' && (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Playing...</span>
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
