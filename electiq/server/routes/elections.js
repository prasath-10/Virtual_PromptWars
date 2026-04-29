import express from 'express'
import { getCachedElections } from '../scraper.js'

const router = express.Router()

router.get('/', (req, res) => {
  const data = getCachedElections()
  res.json(data)
})

export default router
