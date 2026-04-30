import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import GlobeSection from './components/Globe';
import ElectionsStrip from './components/ElectionsStrip';
import { loadCountryData } from './services/countryLoader';
import SkeletonLoader from './components/SkeletonLoader';
import RecentlyViewed from './components/RecentlyViewed';
import ToastContainer, { toast } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const CountryPanel = lazy(() => import('./components/CountryPanel'));

export default function App() {
  const [selectedCountryName, setSelectedCountryName] = useState(null);
  const [activeTab, setActiveTab] = useState('ai');
  const [countryData, setCountryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [electionDate, setElectionDate] = useState(null);
  const [backendReady, setBackendReady] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!backendReady) setShowSlowWarning(true);
    }, 5000);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/health`)
      .then(() => { 
        setBackendReady(true); 
        setShowSlowWarning(false);
        clearTimeout(timeout); 
      })
      .catch(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, [backendReady]);

  const handleCountrySelect = async (name) => {
    setSelectedCountryName(name);
    setActiveTab('ai');
    setIsLoading(true);
    setError(null);
    setElectionDate(null);
    try {
      const data = await loadCountryData(name);
      setCountryData({ name, ...data });

      // Fetch election date from our new API
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/elections/${encodeURIComponent(name)}`);
      if (res.ok) {
        const electData = await res.json();
        if (electData.found && electData.elections.length > 0) {
          setElectionDate(electData.elections[0].date);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error("Could not load election data. Retrying...");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCountryReset = () => {
    setSelectedCountryName(null);
    setCountryData(null);
    setElectionDate(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <ToastContainer />
      
      {showSlowWarning && !backendReady && (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-center text-sm font-medium animate-[slideIn_0.3s_ease-out]">
          ⏳ Backend is waking up — this takes ~30s on first load. Hang tight!
        </div>
      )}

      <Navbar country={selectedCountryName} electionDate={electionDate} />
      
      <ErrorBoundary name="Globe" fallback={<div className="h-[400px] bg-[#0a1628] flex items-center justify-center text-white/40">3D Visualization Unavailable</div>}>
        <GlobeSection 
          selectedCountryId={selectedCountryName} 
          onCountrySelect={handleCountrySelect} 
        />
      </ErrorBoundary>

      <RecentlyViewed 
        currentCountry={selectedCountryName} 
        onCountrySelect={handleCountrySelect} 
      />

      <ErrorBoundary name="Elections Strip">
        <ElectionsStrip onCountrySelect={handleCountrySelect} />
      </ErrorBoundary>

      <main id="main-content" className="w-full sm:max-w-5xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="mt-4 min-h-[300px]">
          {!selectedCountryName && (
            <div className="text-center text-gray-500 py-12 px-4">
              Select a country on the globe to learn about its elections!
            </div>
          )}
          {selectedCountryName && isLoading && (
            <div className="bg-white sm:rounded-[8px] sm:border border-y border-black/10 overflow-hidden shadow-sm animate-[slideIn_0.3s_ease-out] p-6">
               <h2 className="text-lg font-medium text-gray-900 mb-4">{selectedCountryName} - Loading Data...</h2>
               <SkeletonLoader />
            </div>
          )}
          {selectedCountryName && error && !isLoading && (
            <div className="text-center py-8 bg-white sm:rounded-lg border-y sm:border px-4">
              <p className="text-red-500 mb-4">Error loading data for {selectedCountryName}. Make sure your Gemini API key is configured in .env.</p>
              <button 
                onClick={() => handleCountrySelect(selectedCountryName)}
                className="px-4 py-2 bg-[#378ADD] text-white rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}
          {selectedCountryName && countryData && !isLoading && !error && (
            <Suspense fallback={<SkeletonLoader />}>
              <ErrorBoundary name="Country Information Panel">
                <CountryPanel 
                  country={countryData} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  onCountryReset={handleCountryReset}
                />
              </ErrorBoundary>
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
