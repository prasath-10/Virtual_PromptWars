import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GlobeSection from './components/Globe';
import CountryPanel from './components/CountryPanel';
import { loadCountryData } from './services/countryLoader';
import SkeletonLoader from './components/SkeletonLoader';

export default function App() {
  const [selectedCountryName, setSelectedCountryName] = useState(null);
  const [activeTab, setActiveTab] = useState('ai');
  const [countryData, setCountryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCountrySelect = async (name) => {
    setSelectedCountryName(name);
    setActiveTab('ai'); // AI Explanation tab is default
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadCountryData(name);
      setCountryData({ name, ...data });
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <Navbar />
      
      <GlobeSection 
        selectedCountryId={selectedCountryName} 
        onCountrySelect={handleCountrySelect} 
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mt-4 min-h-[300px]">
          {!selectedCountryName && (
            <div className="text-center text-gray-500 py-12">
              Select a country on the globe to learn about its elections!
            </div>
          )}
          {selectedCountryName && isLoading && (
            <div className="bg-white rounded-[8px] border border-black/10 overflow-hidden shadow-sm animate-[slideIn_0.3s_ease-out] p-6">
               <h2 className="text-lg font-medium text-gray-900 mb-4">{selectedCountryName} - Loading Data...</h2>
               <SkeletonLoader />
            </div>
          )}
          {selectedCountryName && error && !isLoading && (
            <div className="text-center py-8 bg-white rounded-lg border">
              <p className="text-red-500 mb-4">Error loading data for {selectedCountryName}. Make sure your Gemini API key is configured in .env.</p>
              <button 
                onClick={() => handleCountrySelect(selectedCountryName)}
                className="px-4 py-2 bg-[#378ADD] text-white rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}
          {selectedCountryName && !isLoading && !error && countryData && (
            <CountryPanel 
              country={countryData} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
