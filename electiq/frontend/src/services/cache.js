const CACHE_KEY = 'electiq_country_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function saveToCache(countryName, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[countryName] = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save to cache', e);
  }
}

export function loadFromCache(countryName) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[countryName];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch (e) {
    console.error('Failed to load from cache', e);
    return null;
  }
}
