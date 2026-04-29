import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { scrapeUpcomingElections } from './scraper.js'
import electionsRouter from './routes/elections.js'
import notificationsRouter from './routes/notifications.js'
import aiRouter from './routes/ai.js'
import { initNotificationScheduler } from './notificationScheduler.js'
import dotenv from 'dotenv'

dotenv.config()
initNotificationScheduler()

const app = express()
app.use(cors()) // Simplified for deployment
app.use(express.json())

app.use('/api/elections', electionsRouter);

// Test endpoint – optional, can be removed after verification
app.get('/api/elections/active-test', (req, res) => {
  console.log('Test route hit');
  res.json({ test: true, message: 'Active test endpoint works' });
});

// Existing route registrations (kept unchanged)
console.log('Routes registered for /api/elections')
app.use('/api/notifications', notificationsRouter)
console.log('Routes registered for /api/notifications')
app.use('/api', aiRouter);
console.log('Routes registered for /api');

// -------------------------------------------------
// 2️⃣ Direct fallback for /api/elections/active (bypass router for debugging)
app.get('/api/elections/active', (req, res) => {
  console.log('⚡️ Direct /api/elections/active hit');
  // Return a minimal payload so the frontend can render something
  res.json({ debug: true, message: 'Direct active endpoint works' });
});

// -------------------------------------------------
// Global 404 – return JSON for any unknown endpoint
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'ElectIQ Backend API',
    endpoints: [
      '/api/elections/active',
      '/api/elections/upcoming',
      '/api/country/:name'
    ]
  })
})

// Scrape once on server start
scrapeUpcomingElections()

// Re-scrape every 6 hours
cron.schedule('0 */6 * * *', () => scrapeUpcomingElections())

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`ElectIQ backend running on port ${PORT}`))
