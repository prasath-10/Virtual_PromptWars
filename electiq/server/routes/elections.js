import express from 'express'
import { getCachedElections } from '../scraper.js'

const router = express.Router()

router.get('/upcoming', (req, res) => {
  console.log('GET /api/elections/upcoming hit')
  try {
    const { elections, lastScraped } = getCachedElections()
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

router.get('/active', (req, res) => {
  console.log('GET /api/elections/active hit')
  try {
    const { elections } = getCachedElections()
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

router.get('/:country', (req, res) => {
  const { country } = req.params
  console.log(`GET /api/elections/${country} hit`)
  try {
    const { elections } = getCachedElections()
    const filtered = elections.filter(e => e.country.toLowerCase() === country.toLowerCase())
    
    if (filtered.length === 0) {
      console.log(`No elections found for country: ${country}`)
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
