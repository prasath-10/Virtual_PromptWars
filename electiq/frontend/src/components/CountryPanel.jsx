import React, { useState, useEffect } from 'react';
import TimelineSteps from './TimelineSteps';
import FactsStrip from './FactsStrip';
import { toast } from './Toast';
import VoiceButton from './VoiceButton';

function QuizSection({ quiz, onCountryReset }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    setCurrentQ(0);
    setSelectedOpt(null);
    setIsCorrect(null);
    setCompleted(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
  }, [quiz]);

  useEffect(() => {
    if (completed && score === quiz.length && quiz.length > 0) {
      toast.success("Perfect score! 🎉");
    }
  }, [completed, score, quiz.length]);

  if (completed) {
    let ratingStr = "📚 Read the timeline first!";
    let stars = "";
    const ratio = score / quiz.length;
    if (ratio === 1) {
      ratingStr = "Perfect score!";
      stars = "⭐⭐⭐";
    } else if (ratio >= 0.66) {
      ratingStr = "Good effort!";
      stars = "⭐⭐";
    } else if (ratio > 0) {
      ratingStr = "Keep learning!";
      stars = "⭐";
    }

    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Quiz Complete!</h3>
        <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto mb-6 space-y-4">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Score:</span>
            <span className="font-bold">{score} / {quiz.length}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Best streak:</span>
            <span className="font-bold">{bestStreak} in a row</span>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="text-2xl mb-1">{stars}</div>
            <div className="text-gray-800 font-medium">{ratingStr}</div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onCountryReset}
            className="px-6 py-2 bg-[#378ADD] text-white rounded-lg font-medium hover:bg-[#2c6eaf] transition"
          >
            Try another country
          </button>
          <button 
            onClick={() => {
              setCurrentQ(0);
              setCompleted(false);
              setSelectedOpt(null);
              setIsCorrect(null);
              setScore(0);
              setStreak(0);
              setBestStreak(0);
            }}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Retry this quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quiz[currentQ];

  const handleOptionClick = (idx) => {
    if (selectedOpt !== null) return;
    
    setSelectedOpt(idx);
    const correct = idx === question.ans;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQ < quiz.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
        setIsCorrect(null);
      } else {
        setCompleted(true);
      }
    }, 2000); // give time to read feedback
  };

  return (
    <div className="mt-4 relative">
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {isCorrect === true ? 'Correct!' : isCorrect === false && selectedOpt !== null ? `Wrong — the correct answer was ${question.opts[question.ans]}` : ''}
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Question {currentQ + 1} of {quiz.length}
        </span>
        <span className="text-sm font-bold text-[#378ADD]">
          Score: {score} / {quiz.length}
        </span>
      </div>
      
      {/* Feedback Banner */}
      {selectedOpt !== null && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out] ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect 
            ? "✓ Correct!" 
            : `✗ Wrong — the correct answer was ${question.opts[question.ans]}`
          }
        </div>
      )}

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
              aria-pressed={selectedOpt === idx}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function CountryPanel({ country, activeTab, setActiveTab, onCountryReset }) {
  if (!country) return null;

  return (
    <div 
      className="bg-white sm:rounded-[8px] sm:border border-y border-black/10 overflow-hidden sm:shadow-sm animate-[slideIn_0.3s_ease-out]"
      role="region"
      aria-label={`Election information for ${country.name}`}
      aria-live="polite"
    >
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
            <p className="text-[13px] text-gray-600">Living Election Dashboard</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#E6F1FB] text-[#378ADD] rounded-full text-xs font-semibold">
          Elections Data
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 space-x-2 border-b border-gray-100">
        {['ai', 'timeline', 'quiz'].map((tab) => {
          const labels = { 
            timeline: <><span className="hidden sm:inline">Timeline</span><span className="sm:hidden">Steps</span></>, 
            ai: <><span className="hidden sm:inline">AI Explanation</span><span className="sm:hidden">AI</span></>, 
            quiz: 'Quiz' 
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab}-panel`}
              id={`${tab}-tab`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                isActive 
                  ? 'bg-[#E6F1FB] text-[#378ADD] border-b-2 border-[#378ADD]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div 
        className="px-4 sm:px-6 py-6 min-h-[300px]"
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        {activeTab === 'timeline' && <TimelineSteps steps={country.steps} accentColor="#378ADD" />}
        
        {activeTab === 'ai' && (
          <div className="mt-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#378ADD]"></span>
              <span className="text-sm font-medium text-gray-700">Gemini AI explanation</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{country.explainer}</p>
              <div className="shrink-0 w-full sm:w-auto">
                <VoiceButton text={country.explainer} />
              </div>
            </div>
            <FactsStrip facts={country.facts} />
          </div>
        )}

        {activeTab === 'quiz' && <QuizSection quiz={country.quiz} onCountryReset={onCountryReset} />}
      </div>
    </div>
  );
}
