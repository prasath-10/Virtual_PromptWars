import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="flex flex-col w-full">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            #f3f4f6 25%,
            #e5e7eb 50%,
            #f3f4f6 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
      `}</style>
      
      {/* Header (flag, name, badge) */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between mt-4">
        <div className="flex items-center space-x-3">
          <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
          <div className="skeleton w-40 h-6"></div>
        </div>
        <div className="skeleton w-24 h-6 rounded-full"></div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 space-x-2 border-b border-gray-100">
        <div className="skeleton w-20 h-8 rounded-t-lg"></div>
        <div className="skeleton w-24 h-8 rounded-t-lg"></div>
        <div className="skeleton w-16 h-8 rounded-t-lg"></div>
      </div>

      {/* Steps */}
      <div className="px-6 py-6 space-y-4">
        <div className="skeleton w-full h-4"></div>
        <div className="skeleton w-full h-4"></div>
        <div className="skeleton w-[80%] h-4"></div>
        <div className="skeleton w-[90%] h-4"></div>
        <div className="skeleton w-[70%] h-4"></div>
        <div className="skeleton w-[85%] h-4"></div>
      </div>
    </div>
  );
}
