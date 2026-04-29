import express from 'express'

const router = express.Router()

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SUBS_FILE = path.join(__dirname, '..', 'data', 'subscriptions.json')

// Ensure file exists
if (!fs.existsSync(SUBS_FILE)) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify([]))
}

router.post('/subscribe', (req, res) => {
  const { subscription, country, electionDate } = req.body

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  try {
    const subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE))

    // Check for existing
    const exists = subscriptions.find(s => s.subscription.endpoint === subscription.endpoint)
    if (exists) {
      return res.status(200).json({ message: 'Already subscribed' })
    }

    subscriptions.push({ subscription, country, electionDate })
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2))

    res.status(201).json({ message: 'Subscription successful' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save subscription' })
  }
})

router.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' })
  }

  try {
    let subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE))
    subscriptions = subscriptions.filter(s => s.subscription.endpoint !== endpoint)
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2))

    res.status(200).json({ message: 'Unsubscribed successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe' })
  }
})

export default router
