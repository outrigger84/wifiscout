const API_KEY = process.env.GOOGLE_PLACES_API_KEY
const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'

function trim(result) {
  return {
    place_id: result.place_id,
    name: result.name,
    address: result.vicinity || result.formatted_address || '',
    lat: result.geometry?.location?.lat ?? null,
    lng: result.geometry?.location?.lng ?? null,
    types: result.types || [],
  }
}

export async function nearbySearch(lat, lng) {
  if (!API_KEY) throw new Error('GOOGLE_PLACES_API_KEY is not configured')
  const url = new URL(NEARBY_URL)
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', '150')
  url.searchParams.set('type', 'cafe')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message || `Places API error: ${data.status}`)
  }
  return (data.results || []).map(trim)
}

export async function textSearch(query) {
  if (!API_KEY) throw new Error('GOOGLE_PLACES_API_KEY is not configured')
  const url = new URL(TEXT_SEARCH_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message || `Places API error: ${data.status}`)
  }
  return (data.results || []).map(trim)
}
