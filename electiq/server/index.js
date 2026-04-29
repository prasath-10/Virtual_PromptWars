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

// Debug route directly on app
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Direct app route works' })
})

console.log('Registering routes...')
app.use('/api/elections', electionsRouter)
console.log('Routes registered for /api/elections')
app.use('/api/notifications', notificationsRouter)
console.log('Routes registered for /api/notifications')
app.use('/api', aiRouter)
console.log('Routes registered for /api')

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
