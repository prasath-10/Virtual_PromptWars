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
    console.error('Failed to save country to IndexedDB', e);
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
    console.error('Failed to load country from IndexedDB', e);
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
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to get cached countries', e);
    return [];
  }
}

// Clear all expired entries on app start
clearExpired();
