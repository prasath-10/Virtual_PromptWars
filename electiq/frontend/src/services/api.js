const BASE = import.meta.env.VITE_API_BASE_URL

export const API = {
  health:   `${BASE}/health`,
  active:   `${BASE}/api/elections/active`,
  upcoming: `${BASE}/api/elections/upcoming`,
  country:  (name) => `${BASE}/api/country/${name}`,
}
