import React, { useState, useEffect } from 'react';
import TimelineSteps from './TimelineSteps';
import FactsStrip from './FactsStrip';
import VoiceButton from './VoiceButton';

function QuizSection({ quiz }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCurrentQ(0);
    setSelectedOpt(null);
    setIsCorrect(null);
    setCompleted(false);
  }, [quiz]);

  if (completed) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🎉 Quiz Completed!</h3>
        <p className="text-gray-500 mb-6">Great job testing your knowledge.</p>
        <button 
          onClick={() => {
            setCurrentQ(0);
            setCompleted(false);
            setSelectedOpt(null);
            setIsCorrect(null);
          }}
          className="px-6 py-2 bg-[#378ADD] text-white rounded-lg font-medium hover:bg-[#2c6eaf] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const question = quiz[currentQ];

  const handleOptionClick = (idx) => {
    if (selectedOpt !== null) return;
    
    setSelectedOpt(idx);
    const correct = idx === question.ans;
    setIsCorrect(correct);

    setTimeout(() => {
      if (currentQ < quiz.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
        setIsCorrect(null);
      } else {
        setCompleted(true);
      }
    }, 1200);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Question {currentQ + 1} of {quiz.length}
        </span>
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-6">{question.q}</h3>
      <div className="space-y-3">
        {question.opts.map((opt, idx) => {
          let btnClass = "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ";
          
          if (selectedOpt === null) {
            btnClass += "border-gray-200 hover:bg-gray-50 text-gray-700";
          } else {
            if (idx === question.ans) {
              btnClass += "bg-green-50 border-green-500 text-green-700";
            } else if (idx === selectedOpt && !isCorrect) {
              btnClass += "bg-red-50 border-red-500 text-red-700";
            } else {
              btnClass += "border-gray-200 text-gray-400 opacity-50";
            }
          }

          return (
            <button 
              key={idx} 
              onClick={() => handleOptionClick(idx)}
              className={btnClass}
              disabled={selectedOpt !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CountryPanel({ country, activeTab, setActiveTab }) {
  if (!country) return null;

  return (
    <div className="bg-white rounded-[8px] border border-black/10 overflow-hidden shadow-sm animate-[slideIn_0.3s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🏳️</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900">{country.name}</h2>
            <p className="text-[13px] text-gray-500">Living Election Dashboard</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#E6F1FB] text-[#378ADD] rounded-full text-xs font-semibold">
          Elections Data
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 space-x-2 border-b border-gray-100">
        {['ai', 'timeline', 'quiz'].map((tab) => {
          const labels = { timeline: 'Timeline', ai: 'AI Explanation', quiz: 'Quiz' };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                isActive 
                  ? 'bg-[#E6F1FB] text-[#378ADD] border-b-2 border-[#378ADD]' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-6 py-6 min-h-[300px]">
        {activeTab === 'timeline' && <TimelineSteps steps={country.steps} accentColor="#378ADD" />}
        
        {activeTab === 'ai' && (
          <div className="mt-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#378ADD]"></span>
              <span className="text-sm font-medium text-gray-700">Gemini AI explanation</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{country.explainer}</p>
            <VoiceButton text={country.explainer} />
            <FactsStrip facts={country.facts} />
          </div>
        )}

        {activeTab === 'quiz' && <QuizSection quiz={country.quiz} />}
      </div>
    </div>
  );
}
