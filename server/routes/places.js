import { Router } from 'express'
import { nearbySearch, textSearch } from '../lib/googlePlaces.js'

export const placesRouter = Router()

placesRouter.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' })
  try {
    const results = await nearbySearch(Number(lat), Number(lng))
    res.json(results)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

placesRouter.get('/search', async (req, res) => {
  const { query } = req.query
  if (!query) return res.status(400).json({ error: 'query is required' })
  try {
    const results = await textSearch(query)
    res.json(results)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})
