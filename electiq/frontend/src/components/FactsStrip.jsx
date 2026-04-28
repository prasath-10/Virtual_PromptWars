import React from 'react';

export default function FactsStrip({ facts }) {
  if (!facts || facts.length === 0) return null;

  return (
    <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div className="flex overflow-x-auto space-x-4 pb-4 snap-x">
        {facts.map((fact, idx) => (
          <div key={idx} className="snap-center shrink-0 w-[240px] bg-[#E6F1FB] rounded-lg p-4 shadow-sm border border-blue-100">
            <h4 className="text-xs font-bold text-[#0C447C] uppercase mb-2">Did you know?</h4>
            <p className="text-sm text-[#1A2E44] leading-relaxed">{fact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
