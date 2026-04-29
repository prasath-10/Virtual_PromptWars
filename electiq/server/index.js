import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { scrapeUpcomingElections } from './scraper.js'
import electionsRouter from './routes/elections.js'
import notificationsRouter from './routes/notifications.js'
import { initNotificationScheduler } from './notificationScheduler.js'
import dotenv from 'dotenv'

dotenv.config()
initNotificationScheduler()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/elections', electionsRouter)
app.use('/api/notifications', notificationsRouter)

// Scrape once on server start
scrapeUpcomingElections()

// Re-scrape every 6 hours
cron.schedule('0 */6 * * *', () => scrapeUpcomingElections())

const PORT = 3001
app.listen(PORT, () => console.log(`ElectIQ backend running on port ${PORT}`))
