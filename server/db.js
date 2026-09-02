import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
mkdirSync(dataDir, { recursive: true })
mkdirSync(join(dataDir, 'uploads'), { recursive: true })

const db = new Database(join(dataDir, 'wifiscout.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    lat REAL,
    lng REAL,
    venue_type TEXT NOT NULL DEFAULT 'other' CHECK(venue_type IN ('coffee_shop','co_working','library','other')),
    google_place_id TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    tested_at TEXT DEFAULT (datetime('now')),
    download_mbps REAL,
    upload_mbps REAL,
    ping_ms REAL,
    jitter_ms REAL,
    ssid TEXT,
    rssi REAL,
    auth_method TEXT CHECK(auth_method IN ('open','wpa2','wpa3','captive_portal')),
    wifi_password TEXT,
    toilet_door_code TEXT,
    seating_rating INTEGER CHECK(seating_rating BETWEEN 1 AND 5),
    power_outlets TEXT CHECK(power_outlets IN ('plenty','some','none')),
    noise_level INTEGER CHECK(noise_level BETWEEN 1 AND 5),
    food_quality INTEGER CHECK(food_quality BETWEEN 1 AND 5),
    wifi_cost TEXT CHECK(wifi_cost IN ('free','paid','purchase_required')),
    notes TEXT,
    photo_path TEXT,
    lat REAL,
    lng REAL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_visits_venue_id ON visits(venue_id);
`)

const visitColumns = db.prepare("PRAGMA table_info(visits)").all().map((c) => c.name)
if (!visitColumns.includes('rssi')) {
  db.exec('ALTER TABLE visits ADD COLUMN rssi REAL')
}

export default db
