import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { extname, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { unlinkSync, existsSync } from 'fs'
import db from '../db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDir = join(__dirname, '..', 'data', 'uploads')

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

export const visitsRouter = Router()

const NUMERIC_FIELDS = ['download_mbps', 'upload_mbps', 'ping_ms', 'jitter_ms', 'lat', 'lng']
const RATING_FIELDS = ['seating_rating', 'noise_level', 'food_quality']
const TEXT_FIELDS = ['ssid', 'auth_method', 'wifi_password', 'toilet_door_code', 'power_outlets', 'wifi_cost', 'notes']

function toNullableNumber(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toNullableText(v) {
  return v === undefined || v === null || v === '' ? null : v
}

visitsRouter.post('/', upload.single('photo'), (req, res) => {
  const { venue_id } = req.body
  if (!venue_id) return res.status(400).json({ error: 'venue_id is required' })

  const venue = db.prepare('SELECT id FROM venues WHERE id = ?').get(venue_id)
  if (!venue) return res.status(404).json({ error: 'Venue not found' })

  const row = { venue_id: Number(venue_id), photo_path: req.file ? req.file.filename : null }
  for (const f of NUMERIC_FIELDS) row[f] = toNullableNumber(req.body[f])
  for (const f of RATING_FIELDS) row[f] = toNullableNumber(req.body[f])
  for (const f of TEXT_FIELDS) row[f] = toNullableText(req.body[f])

  const result = db.prepare(`
    INSERT INTO visits (
      venue_id, download_mbps, upload_mbps, ping_ms, jitter_ms,
      ssid, auth_method, wifi_password, toilet_door_code,
      seating_rating, power_outlets, noise_level, food_quality, wifi_cost,
      notes, photo_path, lat, lng
    ) VALUES (
      @venue_id, @download_mbps, @upload_mbps, @ping_ms, @jitter_ms,
      @ssid, @auth_method, @wifi_password, @toilet_door_code,
      @seating_rating, @power_outlets, @noise_level, @food_quality, @wifi_cost,
      @notes, @photo_path, @lat, @lng
    )
  `).run(row)

  res.status(201).json(db.prepare('SELECT * FROM visits WHERE id = ?').get(result.lastInsertRowid))
})

visitsRouter.patch('/:id', (req, res) => {
  const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(req.params.id)
  if (!visit) return res.status(404).json({ error: 'Not found' })

  const updated = { ...visit, ...req.body }
  db.prepare(`
    UPDATE visits SET
      download_mbps = @download_mbps, upload_mbps = @upload_mbps, ping_ms = @ping_ms, jitter_ms = @jitter_ms,
      ssid = @ssid, auth_method = @auth_method, wifi_password = @wifi_password, toilet_door_code = @toilet_door_code,
      seating_rating = @seating_rating, power_outlets = @power_outlets, noise_level = @noise_level,
      food_quality = @food_quality, wifi_cost = @wifi_cost, notes = @notes
    WHERE id = @id
  `).run(updated)

  res.json(db.prepare('SELECT * FROM visits WHERE id = ?').get(req.params.id))
})

visitsRouter.delete('/:id', (req, res) => {
  const visit = db.prepare('SELECT photo_path FROM visits WHERE id = ?').get(req.params.id)
  db.prepare('DELETE FROM visits WHERE id = ?').run(req.params.id)
  if (visit?.photo_path) {
    const p = join(uploadsDir, visit.photo_path)
    if (existsSync(p)) unlinkSync(p)
  }
  res.status(204).end()
})
