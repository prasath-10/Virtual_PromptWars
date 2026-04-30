import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Load fallback election data ─────────────────────────
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fallbackElections = require('./data/elections-fallback.json')

let cachedElections = fallbackElections.elections || fallbackElections

// ── Root health check ───────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'ElectIQ Backend API',
    endpoints: [
      '/health',
      '/api/elections/active',
      '/api/elections/upcoming',
      '/api/country/:name'
    ]
  })
})

// ── Health check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Elections — active (next 30 days) ───────────────────
app.get('/api/elections/active', (req, res) => {
  try {
    const active = cachedElections.filter(e => e.daysUntil <= 30)
    res.json({ elections: active, count: active.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Elections — upcoming (all) ──────────────────────────
app.get('/api/elections/upcoming', (req, res) => {
  try {
    const sorted = [...cachedElections].sort((a, b) => a.daysUntil - b.daysUntil)
    res.json({ elections: sorted, total: sorted.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Country specific ────────────────────────────────────
app.get('/api/country/:name', (req, res) => {
  try {
    const name = req.params.name.toLowerCase()
    const match = cachedElections.filter(
      e => e.country.toLowerCase() === name
    )
    if (match.length === 0) {
      return res.status(404).json({
        found: false,
        country: req.params.name,
        message: 'No elections found for this country'
      })
    }
    res.json({ found: true, country: req.params.name, elections: match })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Push notification subscribe ─────────────────────────
app.post('/api/notifications/subscribe', (req, res) => {
  try {
    const { subscription, country } = req.body
    if (!subscription) {
      return res.status(400).json({ error: 'subscription is required' })
    }
    // Store subscription (in memory for now)
    console.log(`New subscription for: ${country}`)
    res.status(201).json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── 404 catch-all — MUST be last ────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method
  })
})

// ── Start server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ElectIQ backend running on port ${PORT}`)
  console.log(`Routes registered:`)
  console.log(`  GET /health`)
  console.log(`  GET /api/elections/active`)
  console.log(`  GET /api/elections/upcoming`)
  console.log(`  GET /api/country/:name`)
})