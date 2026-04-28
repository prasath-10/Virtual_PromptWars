import { saveToCache, loadFromCache } from './cache';

const memoryCache = {};

export async function loadCountryData(countryName) {
  if (memoryCache[countryName]) return memoryCache[countryName];
  
  const cached = loadFromCache(countryName);
  if (cached) {
    memoryCache[countryName] = cached;
    return cached;
  }

  const response = await fetch(`http://localhost:5000/api/country/${encodeURIComponent(countryName)}`);
  if (!response.ok) {
      throw new Error(`Failed to fetch data for ${countryName}`);
  }
  const data = await response.json();
  
  memoryCache[countryName] = data;
  saveToCache(countryName, data);
  return data;
}
