import express from 'express'
import { getCachedElections } from '../scraper.js'

const router = express.Router()

router.get('/upcoming', (req, res) => {
  try {
    const { elections, lastScraped } = getCachedElections()
    const filtered = elections.filter(e => e.daysUntil >= 0 && e.daysUntil <= 365)
    res.json({
      elections: filtered,
      lastScraped,
      total: filtered.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming elections' })
  }
})

router.get('/active', (req, res) => {
  try {
    const { elections } = getCachedElections()
    const filtered = elections.filter(e => e.daysUntil >= 0 && e.daysUntil <= 30)
    res.json({
      elections: filtered,
      count: filtered.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active elections' })
  }
})

router.get('/:country', (req, res) => {
  try {
    const { country } = req.params
    const { elections } = getCachedElections()
    const filtered = elections.filter(e => e.country.toLowerCase() === country.toLowerCase())
    
    if (filtered.length === 0) {
      return res.status(404).json({ country, elections: [], found: false })
    }

    res.json({
      country: filtered[0].country,
      elections: filtered,
      found: true
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch country elections' })
  }
})

export default router
