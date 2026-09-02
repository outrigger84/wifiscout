import db from '../db.js'

// One row per venue with aggregates from its visits, for the catalogue list view.
export function getVenuesWithSummary({ type, sort } = {}) {
  let sql = `
    SELECT
      v.*,
      COUNT(vi.id) AS visit_count,
      MAX(vi.tested_at) AS last_visit_at,
      (SELECT download_mbps FROM visits WHERE venue_id = v.id ORDER BY tested_at DESC LIMIT 1) AS latest_download_mbps,
      (SELECT download_mbps FROM visits WHERE venue_id = v.id ORDER BY tested_at DESC LIMIT 1 OFFSET 1) AS previous_download_mbps,
      (SELECT upload_mbps FROM visits WHERE venue_id = v.id ORDER BY tested_at DESC LIMIT 1) AS latest_upload_mbps,
      (SELECT ping_ms FROM visits WHERE venue_id = v.id ORDER BY tested_at DESC LIMIT 1) AS latest_ping_ms,
      AVG((COALESCE(vi.seating_rating,0) + COALESCE(vi.noise_level,0) + COALESCE(vi.food_quality,0)) * 1.0 /
          NULLIF((CASE WHEN vi.seating_rating IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN vi.noise_level IS NOT NULL THEN 1 ELSE 0 END +
                  CASE WHEN vi.food_quality IS NOT NULL THEN 1 ELSE 0 END), 0)) AS avg_rating
    FROM venues v
    LEFT JOIN visits vi ON vi.venue_id = v.id
  `
  const params = []
  if (type) {
    sql += ' WHERE v.venue_type = ?'
    params.push(type)
  }
  sql += ' GROUP BY v.id'

  const order = {
    speed: 'latest_download_mbps DESC NULLS LAST',
    rating: 'avg_rating DESC NULLS LAST',
    name: 'v.name COLLATE NOCASE ASC',
  }[sort] || 'v.name COLLATE NOCASE ASC'
  sql += ` ORDER BY ${order}`

  return db.prepare(sql).all(...params)
}

export function getVenueWithVisits(id) {
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(id)
  if (!venue) return null
  const visits = db.prepare('SELECT * FROM visits WHERE venue_id = ? ORDER BY tested_at DESC').all(id)
  return { ...venue, visits }
}
