import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GlobeSection from './components/Globe';
import CountryPanel from './components/CountryPanel';
import { countries } from './data/countries';

export default function App() {
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  const handleCountrySelect = (id) => {
    setSelectedCountryId(id);
    setActiveTab('timeline'); // Reset tab when country changes
  };

  const selectedCountry = countries.find(c => c.id === selectedCountryId);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <Navbar />
      
      <GlobeSection 
        selectedCountry={selectedCountry} 
        onCountrySelect={handleCountrySelect} 
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Country Selector Pills */}
        <div className="flex overflow-x-auto space-x-3 pb-4 no-scrollbar">
          {countries.map(country => {
            const isSelected = selectedCountryId === country.id;
            return (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2 rounded-full border text-sm font-medium transition whitespace-nowrap
                  ${isSelected 
                    ? 'bg-[#E6F1FB] border-[#378ADD] text-[#0C447C]' 
                    : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
              </button>
            );
          })}
        </div>

        {/* Country Detail Panel */}
        <div className="mt-4">
          <CountryPanel 
            country={selectedCountry} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </div>
      </main>
    </div>
  );
}
