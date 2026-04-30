import React from 'react';

export default function TimelineSteps({ steps, accentColor }) {
  return (
    <div className="flex flex-col space-y-6 mt-4 relative">
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
      {(steps || []).map((step, idx) => (
        <div key={idx} className="flex relative items-start">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm z-10 shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {step.n}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-800">{step.title}</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#DBEAFE] text-[#0C447C]">
                {step.date}
              </span>
            </div>
            <p className="text-sm text-gray-600">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
