import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

import express from 'express'
import { venuesRouter } from './routes/venues.js'
import { visitsRouter } from './routes/visits.js'
import { placesRouter } from './routes/places.js'

const app = express()
const PORT = 3010
const BASE = '/wifiscout'

app.use(express.json())

app.use(`${BASE}/api/venues`, venuesRouter)
app.use(`${BASE}/api/visits`, visitsRouter)
app.use(`${BASE}/api/places`, placesRouter)

app.use(`${BASE}/uploads`, express.static(join(__dirname, 'data', 'uploads')))

app.use(BASE, express.static(join(__dirname, 'public')))

app.get(`${BASE}/*`, (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'))
})

app.get('/', (req, res) => res.redirect(BASE + '/'))

app.listen(PORT, () => {
  console.log(`wifiscout running on port ${PORT} at ${BASE}/`)
})
