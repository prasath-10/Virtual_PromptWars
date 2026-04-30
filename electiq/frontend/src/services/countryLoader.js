import { saveCountry, loadCountry } from './db';
import { API } from './api';

const memoryCache = {};

export async function loadCountryData(countryName) {
  if (memoryCache[countryName]) return memoryCache[countryName];
  
  const cached = await loadCountry(countryName);
  if (cached) {
    memoryCache[countryName] = cached;
    return cached;
  }

  const response = await fetch(API.country(encodeURIComponent(countryName)));
  if (!response.ok) {
      throw new Error(`Failed to fetch data for ${countryName}`);
  }
  const data = await response.json();
  
  memoryCache[countryName] = data;
  await saveCountry(countryName, data);
  return data;
}
