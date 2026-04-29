import express from 'express'
import { getCachedElections } from '../scraper.js'

const router = express.Router()

// ✅ /upcoming — elections in next 365 days
router.get('/upcoming', (req, res) => {
  console.log('GET /api/elections/upcoming hit')
  try {
    const { elections, lastScraped } = getCachedElections()

    if (!elections || !Array.isArray(elections)) {
      return res.status(503).json({ error: 'Election data not yet available, scraper may still be initializing' })
    }

    const filtered = elections.filter(e => e.daysUntil >= 0 && e.daysUntil <= 365)
    res.json({
      elections: filtered,
      lastScraped,
      total: filtered.length
    })
  } catch (error) {
    console.error('Error in /upcoming:', error)
    res.status(500).json({ error: 'Failed to fetch upcoming elections' })
  }
})

// ✅ /active — elections in next 30 days
router.get('/active', (req, res) => {
  console.log('GET /api/elections/active hit')
  try {
    const { elections } = getCachedElections()

    if (!elections || !Array.isArray(elections)) {
      return res.status(503).json({
        error: 'Election data not yet available, scraper may still be initializing',
        elections: [],
        count: 0
      })
    }

    const filtered = elections.filter(e => e.daysUntil >= 0 && e.daysUntil <= 30)
    res.json({
      elections: filtered,
      count: filtered.length
    })
  } catch (error) {
    console.error('Error in /active:', error)
    res.status(500).json({ error: 'Failed to fetch active elections' })
  }
})

// ✅ /:country — MUST stay last to avoid swallowing /active and /upcoming
router.get('/:country', (req, res) => {
  const { country } = req.params

  // Guard: prevent "active" or "upcoming" from falling into this if ever mis-ordered
  const reserved = ['active', 'upcoming']
  if (reserved.includes(country.toLowerCase())) {
    return res.status(400).json({ error: `"${country}" is a reserved route, not a country name` })
  }

  console.log(`GET /api/elections/${country} hit`)
  try {
    const { elections } = getCachedElections()

    if (!elections || !Array.isArray(elections)) {
      return res.status(503).json({ error: 'Election data not yet available' })
    }

    const filtered = elections.filter(
      e => e.country.toLowerCase() === country.toLowerCase()
    )

    if (filtered.length === 0) {
      return res.status(404).json({ country, elections: [], found: false })
    }

    res.json({
      country: filtered[0].country,
      elections: filtered,
      found: true
    })
  } catch (error) {
    console.error(`Error in /:country (${country}):`, error)
    res.status(500).json({ error: 'Failed to fetch country elections' })
  }
})

export default router