import { Router } from 'express'
import { unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import db from '../db.js'
import { getVenuesWithSummary, getVenueWithVisits } from '../lib/repo.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDir = join(__dirname, '..', 'data', 'uploads')

export const venuesRouter = Router()

venuesRouter.get('/', (req, res) => {
  const { type, sort } = req.query
  res.json(getVenuesWithSummary({ type, sort }))
})

venuesRouter.get('/:id', (req, res) => {
  const venue = getVenueWithVisits(req.params.id)
  if (!venue) return res.status(404).json({ error: 'Not found' })
  res.json(venue)
})

venuesRouter.post('/', (req, res) => {
  const { name, address, lat, lng, venue_type, google_place_id } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  if (google_place_id) {
    const existing = db.prepare('SELECT * FROM venues WHERE google_place_id = ?').get(google_place_id)
    if (existing) return res.status(409).json({ error: 'Venue already exists', venue: existing })
  }

  const result = db.prepare(`
    INSERT INTO venues (name, address, lat, lng, venue_type, google_place_id)
    VALUES (@name, @address, @lat, @lng, @venue_type, @google_place_id)
  `).run({
    name,
    address: address || null,
    lat: lat ?? null,
    lng: lng ?? null,
    venue_type: venue_type || 'other',
    google_place_id: google_place_id || null,
  })

  res.status(201).json(db.prepare('SELECT * FROM venues WHERE id = ?').get(result.lastInsertRowid))
})

venuesRouter.patch('/:id', (req, res) => {
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id)
  if (!venue) return res.status(404).json({ error: 'Not found' })

  const updated = { ...venue, ...req.body }
  db.prepare(`
    UPDATE venues SET name = @name, address = @address, lat = @lat, lng = @lng,
      venue_type = @venue_type, updated_at = datetime('now')
    WHERE id = @id
  `).run(updated)

  res.json(db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id))
})

venuesRouter.delete('/:id', (req, res) => {
  const photos = db.prepare('SELECT photo_path FROM visits WHERE venue_id = ? AND photo_path IS NOT NULL').all(req.params.id)
  db.prepare('DELETE FROM venues WHERE id = ?').run(req.params.id)
  for (const { photo_path } of photos) {
    const p = join(uploadsDir, photo_path)
    if (existsSync(p)) unlinkSync(p)
  }
  res.status(204).end()
})
