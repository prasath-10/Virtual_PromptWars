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
app.use(cors())
app.use(express.json())

// ✅ 1. Health check FIRST (before everything)
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

// ✅ 2. Register all routers
app.use('/api/elections', electionsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api', aiRouter)

// ✅ 3. Global 404 handler LAST (after all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Scrape once on server start
scrapeUpcomingElections()

// Re-scrape every 6 hours
cron.schedule('0 */6 * * *', () => scrapeUpcomingElections())

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`ElectIQ backend running on port ${PORT}`))