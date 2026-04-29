import cron from 'node-cron'
import webpush from 'web-push'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SUBS_FILE = path.join(__dirname, 'data', 'subscriptions.json')

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:example@yourdomain.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export function initNotificationScheduler() {
  console.log('Notification scheduler initialized (Daily at 8am)')
  
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily notification check...')
    if (!fs.existsSync(SUBS_FILE)) return

    const subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE))
    const today = new Date()

    for (const sub of subscriptions) {
      const electionDate = new Date(sub.electionDate)
      const diffTime = electionDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let payload = null

      if (diffDays === 7) {
        payload = {
          title: 'ElectIQ Reminder',
          body: `The election in ${sub.country} is just 7 days away! Registration closes soon.`,
          url: `http://localhost:5173/country/${sub.country}`
        }
      } else if (diffDays === 3) {
        payload = {
          title: 'ElectIQ Alert',
          body: `Only 3 days until the election in ${sub.country}! Are you ready?`,
          url: `http://localhost:5173/country/${sub.country}`
        }
      } else if (diffDays === 0) {
        payload = {
          title: 'Election Day!',
          body: `Today is election day in ${sub.country}! Make your voice heard.`,
          url: `http://localhost:5173/country/${sub.country}`
        }
      }

      if (payload) {
        try {
          await webpush.sendNotification(sub.subscription, JSON.stringify(payload))
          console.log(`Sent notification to ${sub.country} subscriber`)
        } catch (error) {
          console.error('Error sending push notification:', error)
          // Optionally remove failed subscriptions
        }
      }
    }
  })
}
