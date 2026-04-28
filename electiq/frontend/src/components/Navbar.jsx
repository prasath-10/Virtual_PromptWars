import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full h-14 bg-[#0a1628] flex items-center justify-between px-6 border-b border-white/10">
      <div className="flex items-baseline space-x-3">
        <h1 className="text-white font-serif font-bold text-2xl tracking-wide">ElectIQ</h1>
        <span className="text-gray-400 text-sm hidden sm:inline">The living election dashboard</span>
      </div>
      <div className="flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-green-400 text-sm font-medium uppercase tracking-wider">Live</span>
      </div>
    </nav>
  );
}
