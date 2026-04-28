import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="animate-pulse flex flex-col space-y-6 mt-4">
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .shimmer-pulse {
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}</style>
      
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-10 h-10 bg-gray-200 rounded-full shimmer-pulse shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-5 bg-gray-200 rounded shimmer-pulse w-[60%]"></div>
            <div className="h-3 bg-gray-200 rounded shimmer-pulse w-[40%]"></div>
          </div>
        </div>
      </div>
      
      <div className="px-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded shimmer-pulse w-[100%]"></div>
        <div className="h-4 bg-gray-200 rounded shimmer-pulse w-[100%]"></div>
        <div className="h-4 bg-gray-200 rounded shimmer-pulse w-[80%]"></div>
        <div className="h-4 bg-gray-200 rounded shimmer-pulse w-[90%]"></div>
      </div>
    </div>
  );
}
