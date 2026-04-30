const DB_NAME = 'electiq';
const DB_VERSION = 1;
const STORE_NAME = 'countries';
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'countryName' });
      }
    };
  });
}

export async function saveCountry(countryName, data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ countryName, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to save country to IndexedDB, falling back to localStorage', e);
    try {
      localStorage.setItem(`electiq_${countryName}`, JSON.stringify({
        data, timestamp: Date.now()
      }));
    } catch (err) {
      console.error('localStorage fallback failed', err);
    }
  }
}

export async function loadCountry(countryName) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(countryName);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) return resolve(null);
        
        if (Date.now() - result.timestamp > TTL) {
          resolve(null);
        } else {
          resolve(result.data);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to load country from IndexedDB, falling back to localStorage', e);
    try {
      const stored = localStorage.getItem(`electiq_${countryName}`);
      if (stored) {
        const result = JSON.parse(stored);
        if (Date.now() - result.timestamp <= TTL) {
          return result.data;
        }
      }
    } catch (err) {
      console.error('localStorage fallback failed', err);
    }
    return null;
  }
}

export async function clearExpired() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (Date.now() - cursor.value.timestamp > TTL) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to clear expired entries', e);
  }
}

export async function getCachedCountries() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        // Sort by timestamp descending
        results.sort((a, b) => b.timestamp - a.timestamp);
        // Return countryNames
        resolve(results.map(r => r.countryName));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to get cached countries, falling back to localStorage', e);
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('electiq_')) {
          const item = JSON.parse(localStorage.getItem(key));
          keys.push({ countryName: key.replace('electiq_', ''), timestamp: item.timestamp });
        }
      }
      keys.sort((a, b) => b.timestamp - a.timestamp);
      return keys.map(k => k.countryName);
    } catch (err) {
      return [];
    }
  }
}

// Clear all expired entries on app start
clearExpired();
