# ElectIQ — The Living Election Dashboard

> An AI-powered civic education platform that helps users understand the election process, timelines, and voting steps for every country on Earth — interactively and in real time.



---

## What is ElectIQ?

ElectIQ is a real-time, interactive election education platform. Users land on a spinning 3D globe, click any country, and instantly receive an AI-generated breakdown of that country's election process — complete with step-by-step timelines, voice narration, a knowledge quiz, and live election data.

No more confusing government websites. No more guessing. Just click, learn, and vote with confidence.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend Engine | React + Vite |
| 3D Globe | Three.js + @react-three/fiber |
| AI Reasoning | Google Gemini API (Pro) |
| Voice Synthesis | Google Cloud Text-to-Speech (Neural2) |
| Data Acquisition | Node.js + Puppeteer + Cheerio |
| Push Notifications | Web Push API + Service Workers |
| Storage | localStorage + IndexedDB (privacy-first) |
| Styling | Tailwind CSS |

---

## Features

### 🌍 Interactive 3D Globe
- Spinning Earth rendered with Three.js
- Glowing animated hotspot markers on countries with active elections
- Click any country on the globe to explore its election process
- All 195 countries supported — not just a handful

### 🤖 Gemini AI — Dynamic Election Data
- Click any country → Gemini Pro generates that country's full election breakdown on demand
- No hardcoded data — every country is powered by AI
- Four AI functions per country:
  - Election explainer (plain English overview)
  - 6-step election timeline with dates
  - 3-question knowledge quiz
  - 3 surprising election facts

### 🔊 Google Cloud Text-to-Speech
- Every AI explanation can be read aloud
- Uses Google Neural2 voice (en-US-Neural2-D)
- Play, pause, and replay controls
- Works on mobile and desktop

### 📋 Step-by-Step Timeline
- 6 key phases of each country's election process
- Numbered steps with titles, descriptions, and date badges
- Generated dynamically by Gemini — always accurate

### 🧠 Knowledge Quiz
- 3 multiple choice questions per country
- Instant feedback: green for correct, red for wrong
- Auto-advances after each answer
- Completion screen with retry option

### 🔔 Push Notifications
- Subscribe to election deadline reminders
- Notified when voter registration closes
- Notified 7 days before election day
- Service Worker handles delivery even when app is closed

### 💾 Privacy-First Storage
- All user data stored locally (localStorage + IndexedDB)
- No personal data ever sent to external servers
- 24-hour cache for AI responses — reduces API calls
- Cached data loads instantly on repeat visits

### 📡 Live Election Data
- Node.js backend scrapes real-time election news
- Puppeteer + Cheerio extract upcoming election dates
- Globe hotspots update to reflect currently active elections
- REST API serves fresh data to the frontend

---

## Project Structure

```
electiq/
├── public/
│   ├── sw.js                    # Service Worker for push notifications
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Top nav with live badge
│   │   ├── Globe.jsx            # Three.js 3D globe
│   │   ├── CountryPanel.jsx     # Slide-in country detail panel
│   │   ├── TimelineSteps.jsx    # 6-step election timeline
│   │   ├── QuizTab.jsx          # Knowledge quiz
│   │   ├── FactsStrip.jsx       # Did you know cards
│   │   ├── VoiceButton.jsx      # Google TTS button
│   │   ├── SkeletonLoader.jsx   # Shimmer loading UI
│   │   └── NotificationBell.jsx # Push notification toggle
│   ├── services/
│   │   ├── gemini.js            # All Gemini API functions
│   │   ├── tts.js               # Google Cloud TTS
│   │   ├── countryLoader.js     # Dynamic loader with memory cache
│   │   ├── cache.js             # localStorage cache with TTL
│   │   └── notifications.js     # Web Push API logic
│   ├── data/
│   │   └── globeCoords.js       # Lat/lon for all 195 countries
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── index.js                 # Express server
│   ├── scraper.js               # Puppeteer + Cheerio scraper
│   └── routes/
│       └── elections.js         # /api/elections endpoint
├── .env                         # API keys (never commit this)
├── .env.example                 # Safe template to share
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Google Gemini API key
- Google Cloud Text-to-Speech API key

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/electiq.git
cd electiq

# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### Environment Setup

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_TTS_API_KEY=your_google_tts_api_key_here
VITE_API_BASE_URL=http://localhost:3001
```

> Never commit your `.env` file. It is already in `.gitignore`.

### Running the App

```bash
# Start the frontend (React + Vite)
npm run dev

# In a separate terminal, start the backend (Node.js scraper server)
cd server && node index.js
```

Frontend runs at: `http://localhost:5173`
Backend runs at: `http://localhost:3001`

---

## API Reference

### Gemini Functions (`src/services/gemini.js`)

| Function | Description | Returns |
|---|---|---|
| `getElectionExplainer(country)` | 5-sentence overview of election system | Plain text string |
| `getElectionSteps(country)` | 6 key phases with dates | JSON array of steps |
| `getElectionQuiz(country)` | 3 multiple choice questions | JSON array of questions |
| `getElectionFacts(country)` | 3 surprising facts | JSON array of strings |

### Backend Endpoints (`server/`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/elections/upcoming` | GET | List of upcoming elections worldwide |
| `/api/elections/active` | GET | Countries with elections in next 30 days |
| `/api/elections/:country` | GET | Scraped election news for a specific country |

---

## Caching Strategy

ElectIQ uses a two-layer cache to minimize API calls and maximize speed:

**Layer 1 — Memory cache** (session-scoped)
- Stores AI responses in a JS object during the session
- Zero latency on repeated lookups within the same visit

**Layer 2 — localStorage cache** (24-hour TTL)
- Persists AI responses across page refreshes
- Expires after 24 hours to ensure data freshness
- Checked before any Gemini API call is made

```
User clicks country
  → Check memory cache → HIT: render instantly
  → Check localStorage → HIT: render in <50ms
  → Call Gemini API → store in both caches → render
```

---

## Push Notifications

ElectIQ uses the Web Push API with a Service Worker to deliver election reminders:

1. User clicks the notification bell icon
2. Browser requests notification permission
3. Service Worker registers and subscribes to push
4. Backend stores the subscription
5. Reminders sent automatically:
   - 7 days before voter registration closes
   - 3 days before election day
   - Day-of polling reminder

---

## Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

Output in `dist/` — deploy to Vercel, Netlify, or any static host.

---

## Development Roadmap

| Day | Focus | Status |
|---|---|---|
| Day 1 | React setup, Three.js globe, country panel UI, static data | ✅ Complete |
| Day 2 | Gemini AI integration, Google TTS, dynamic all-country support | ✅ Complete |
| Day 3 | Puppeteer scraper, live election data, push notifications | 🔄 In Progress |
| Day 4 | Quiz polish, facts strip, IndexedDB, performance optimization | ⏳ Upcoming |
| Day 5 | Mobile responsive, accessibility, bug fixes, production build | ⏳ Upcoming |
| Day 6 | Demo video, pitch deck, submission | ⏳ Upcoming |

---



---

## Contributing

This project was built for the Google Antigravity Hackathon. Contributions and forks are welcome after the submission deadline.

## Acknowledgements

- Google Gemini API for powering dynamic election content
- Google Cloud Text-to-Speech for voice narration
- Three.js community for globe rendering inspiration
- Natural Earth / World Atlas for GeoJSON country data
