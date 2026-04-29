import express from 'express'

const router = express.Router()

// Placeholder for notification routes
router.post('/subscribe', (req, res) => {
  res.status(201).json({ message: 'Subscription received' })
})

export default router
