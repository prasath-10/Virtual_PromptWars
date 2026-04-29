import React, { useState, useEffect } from 'react';

export default function ElectionsStrip({ onCountrySelect }) {
  const [elections, setElections] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/elections/active`)
      .then(res => res.json())
      .then(data => {
        const sorted = (data.elections || []).sort((a, b) => a.daysUntil - b.daysUntil);
        setElections(sorted);
      })
      .catch(() => setElections([]));
  }, []);

  if (elections === null) {
    return (
      <div className="w-full bg-white border-b border-black/5 py-6 px-6 overflow-hidden">
        <div className="flex gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[200px] h-32 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (elections.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-black/5 py-6 shadow-sm overflow-hidden group">
      <div className="max-w-5xl mx-auto px-6 mb-3 flex items-center justify-between">
        <h2 className="text-gray-900 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          Elections This Month
        </h2>
        <span className="text-gray-400 text-xs font-medium uppercase tracking-tighter">
          {elections.length} {elections.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar scroll-smooth">
        {elections.map((election, idx) => (
          <div 
            key={`${election.country}-${idx}`}
            className="min-w-[240px] bg-gray-50 rounded-2xl p-4 border border-black/5 hover:border-[#378ADD]/30 hover:bg-blue-50/30 transition-all duration-300 group/card cursor-pointer"
            onClick={() => onCountrySelect(election.country)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 text-base">{election.country}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                election.daysUntil <= 7 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {election.daysUntil === 0 ? 'TODAY' : `IN ${election.daysUntil}D`}
              </span>
            </div>
            <p className="text-gray-500 text-xs mb-4 line-clamp-1">{election.electionType}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                {new Date(election.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button className="text-[#378ADD] text-xs font-bold flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                Explore <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
