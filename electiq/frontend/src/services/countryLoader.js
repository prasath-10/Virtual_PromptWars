import { saveToCache, loadFromCache } from './cache';

const memoryCache = {};

export async function loadCountryData(countryName) {
  if (memoryCache[countryName]) return memoryCache[countryName];
  
  const cached = loadFromCache(countryName);
  if (cached) {
    memoryCache[countryName] = cached;
    return cached;
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/country/${encodeURIComponent(countryName)}`);
  if (!response.ok) {
      throw new Error(`Failed to fetch data for ${countryName}`);
  }
  const data = await response.json();
  
  memoryCache[countryName] = data;
  saveToCache(countryName, data);
  return data;
}
