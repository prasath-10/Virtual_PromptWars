# ElectIQ — The Living Election Dashboard

> An AI-powered civic education platform that helps users understand the election process, timelines, and voting steps for every country on Earth — interactively, accessibly, and in real time

---

## Chosen Vertical

**Civic Education & Democratic Participation**

First-time voters around the world face the same problem: the election process is confusing, government websites are hard to navigate, and there is no single place that explains what to do, when, and why — in plain language.

ElectIQ solves this. It is a living, real-time election dashboard where users land on a spinning 3D globe, click any country on Earth, and instantly receive a full breakdown of that country's election process — step by step, in plain English, with voice narration, a knowledge quiz, and live election data.

**Who it is for:**
- First-time voters who do not know where to start
- Citizens who recently moved to a new country
- Students learning about comparative democratic systems
- Educators teaching civics

---

## Approach and Logic

### The Core Problem
Most civic education tools are static, text-heavy, and built for people who already understand elections. Voter turnout is low globally not because people don't care — but because the process feels inaccessible.

### Why This Approach

**1. Visual before text**
A spinning 3D globe is the entry point. Users click a country rather than filling out a search form. The visual immediately communicates global scale and makes exploration feel natural, not like homework.

**2. AI instead of a database**
Maintaining accurate election data for 195 countries manually is impossible — it goes out of date instantly. Instead, Google Gemini Pro generates each country's election content on demand. One click on Nigeria triggers a live Gemini call that returns a step-by-step Nigerian election timeline, quiz questions, and key facts. No hardcoded data. Always fresh.

**3. Voice for accessibility**
Google Cloud Text-to-Speech reads every AI explanation aloud using a Neural2 voice. This serves users with visual impairments, low literacy, or those who simply prefer audio — expanding the platform's reach significantly.

**4. Progressive engagement**
The user journey is layered deliberately:
```
See the globe → Click a country → Read the timeline
→ Hear the explanation → Take the quiz → Set deadline reminders
```
Each layer deepens understanding without overwhelming. Users who want a 30-second overview get it. Users who want to master the topic can go deeper.

**5. Privacy first**
All user data — quiz scores, notification preferences, cached AI responses — is stored locally on the user's device using localStorage and IndexedDB. Nothing is collected or sent to any external server.

### Key Technical Decisions

| Decision | Reason |
|---|---|
| Gemini over a static database | 195 countries × timeline + quiz + facts = thousands of data points to maintain. Gemini generates it all on demand. |
| Three.js globe over a flat map | The globe is the wow moment. It makes the global scope of democracy tangible in a way a flat map never could. |
| localStorage + IndexedDB | No user accounts needed. Fast, private, works offline after first visit. |
| Node.js + Puppeteer backend | Government election sites don't have APIs. Puppeteer scrapes real upcoming election dates from official sources. |
| Service Worker for push notifications | Election deadlines are time-sensitive. Users need reminders even when the app is closed. |

---

## How the Solution Works

### User Journey
```
User opens ElectIQ
  → Spinning 3D globe loads with glowing hotspots on active election countries
  → User clicks any country on the globe (or selects from pill buttons)
  → Skeleton loading screen appears
  → Gemini API is called in parallel for:
       - 6-step election timeline
       - Plain-English AI explainer
       - 3-question knowledge quiz
       - 3 surprising facts
  → Country panel slides in with 3 tabs: Timeline | AI Explanation | Quiz
  → User taps "Read aloud" → Google TTS narrates the explanation
  → User completes quiz → sees score and can retry
  → User subscribes to push notifications for upcoming election deadlines
```

### Architecture
```
┌──────────────────────────────────────────────┐
│              React Frontend                   │
│                                              │
│  Three.js Globe                              │
│       ↓ country click                        │
│  countryLoader.js                            │
│       ↓ Promise.all                          │
│  gemini.js ──────────────→ Gemini Pro API    │
│  tts.js ─────────────────→ Google TTS API    │
│  cache.js ───────────────→ localStorage      │
└──────────────────────────────────────────────┘
               ↕ REST API
┌──────────────────────────────────────────────┐
│           Node.js Backend                    │
│                                              │
│  Express → Puppeteer → Cheerio               │
│  /api/elections/upcoming                     │
│  /api/elections/active                       │
└──────────────────────────────────────────────┘
               ↕
┌──────────────────────────────────────────────┐
│          Service Worker                      │
│                                              │
│  Web Push API → Election deadline reminders  │
│  Offline cache → Works without internet      │
└──────────────────────────────────────────────┘
```

### Google Gemini Integration
Four prompt functions power all country content:

```js
// 1. Plain-English overview (5 sentences, returned as text)
getElectionExplainer(countryName)

// 2. Step-by-step process (returns JSON array of 6 steps)
getElectionSteps(countryName)

// 3. Knowledge quiz (returns JSON array of 3 questions)
getElectionQuiz(countryName)

// 4. Surprising facts (returns JSON array of 3 strings)
getElectionFacts(countryName)
```

All four run simultaneously with `Promise.all` — total wait time equals the slowest single call, not all four combined.

### Caching
```
User clicks country
  → Check memory cache      → HIT: instant (0ms)
  → Check localStorage      → HIT: <50ms (24hr TTL)
  → Call Gemini API         → store in both caches → render
```

A returning user who visited the same country yesterday sees results instantly. Fresh countries trigger one Gemini call, then are cached for 24 hours.

### Google TTS Integration
```js
// Calls Google Cloud TTS REST API
// Returns base64 MP3 → plays via new Audio()
// Voice: en-US-Neural2-D (natural, authoritative)
speakText(explanationText)
```

### Push Notifications
```
User clicks bell icon
  → Browser requests permission
  → Service Worker registers and subscribes
  → Backend schedules reminders:
      7 days before voter registration closes
      3 days before election day
      Morning of election day
```

### Project Structure
```
electiq/
├── src/
│   ├── components/
│   │   ├── Globe.jsx              # Three.js 3D globe
│   │   ├── CountryPanel.jsx       # Country detail panel
│   │   ├── TimelineSteps.jsx      # 6-step timeline
│   │   ├── QuizTab.jsx            # Knowledge quiz
│   │   ├── VoiceButton.jsx        # Google TTS controls
│   │   └── SkeletonLoader.jsx     # Loading state UI
│   ├── services/
│   │   ├── gemini.js              # All Gemini prompt functions
│   │   ├── tts.js                 # Google Cloud TTS
│   │   ├── countryLoader.js       # Parallel loader + memory cache
│   │   └── cache.js               # localStorage with 24hr TTL
│   ├── data/
│   │   └── globeCoords.js         # Lat/lon for all 195 countries
│   └── App.jsx
├── server/
│   ├── index.js                   # Express server
│   ├── scraper.js                 # Puppeteer + Cheerio
│   └── routes/elections.js        # REST endpoints
├── public/
│   └── sw.js                      # Service Worker
├── .env.example
└── package.json
```

### Running the Project
```bash
# Clone
git clone https://github.com/yourusername/electiq.git
cd electiq

# Install
npm install
cd server && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Add your Gemini and Google TTS API keys to .env

# Run
npm run dev          # Frontend → http://localhost:5173
cd server && node index.js  # Backend → http://localhost:3001
```

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_TTS_API_KEY=your_tts_api_key
VITE_API_BASE_URL=http://localhost:3001
```

---

## Assumptions Made

| Assumption | Reasoning |
|---|---|
| Gemini Pro has reliable knowledge of global electoral systems | Gemini's training includes extensive coverage of election law and civic processes worldwide. Content is presented as educational overview, not legal advice. |
| Broad election steps are stable year-to-year | Registration → campaigning → voting → counting does not change frequently. Specific dates are clearly labelled as approximate. |
| Users are on a modern browser | Three.js (WebGL), Service Workers, Web Push, and IndexedDB all require a modern browser. A fallback message is shown on unsupported environments. |
| English is sufficient for v1.0 | The architecture supports multilingual Gemini prompts — passing a `language` parameter is a one-line change. Multilingual support is a v2 priority. |
| The scraper backend is supplementary | If live election data is unavailable, the app still functions fully. Gemini handles all educational content independently of the scraper. |
| Notification permission is opt-in only | The app never requests notification permission automatically. Users must explicitly click the bell icon, following browser best practices and user trust principles. |

---

*ElectIQ — Making democracy understandable, one country at a time.*
