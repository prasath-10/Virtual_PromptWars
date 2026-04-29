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
app.use('/api/elections', electionsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api', aiRouter)

// Scrape once on server start
scrapeUpcomingElections()

// Re-scrape every 6 hours
cron.schedule('0 */6 * * *', () => scrapeUpcomingElections())

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`ElectIQ backend running on port ${PORT}`))
