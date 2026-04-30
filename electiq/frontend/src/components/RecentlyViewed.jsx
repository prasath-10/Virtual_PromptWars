import React, { useEffect, useState } from 'react';
import { getCachedCountries } from '../services/db';

export default function RecentlyViewed({ currentCountry, onCountrySelect }) {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const loadCountries = async () => {
      const cached = await getCachedCountries();
      // Keep only up to 5 countries
      setCountries(cached.slice(0, 5));
    };
    loadCountries();
  }, [currentCountry]);

  if (countries.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
      <div className="flex items-center space-x-3 overflow-x-auto whitespace-nowrap">
        <span className="text-sm font-medium text-gray-500">Recently viewed:</span>
        <div className="flex space-x-2">
          {countries.map(country => (
            <button
              key={country}
              onClick={() => onCountrySelect(country)}
              className="px-3 py-1 bg-white border border-gray-200 hover:border-[#378ADD] text-sm text-gray-700 rounded-full transition shadow-sm"
            >
              {country}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
