import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Pencil, CheckCircle2 } from 'lucide-react'
import { places, venues as venuesApi } from '@/api/client'

// Sorts already-logged venues to the front (stable otherwise), so a place you've
// visited before doesn't get buried below unfamiliar nearby suggestions.
function prioritize(results, loggedByPlaceId) {
  return [...results].sort((a, b) => {
    const aLogged = loggedByPlaceId.has(a.place_id) ? 0 : 1
    const bLogged = loggedByPlaceId.has(b.place_id) ? 0 : 1
    return aLogged - bLogged
  })
}

export default function PlacesSuggestPicker({ lat, lng, onSelect, onManual }) {
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const { data: loggedVenues } = useQuery({
    queryKey: ['venues', {}],
    queryFn: () => venuesApi.list({}),
  })
  const loggedByPlaceId = useMemo(() => {
    const map = new Map()
    for (const v of loggedVenues || []) {
      if (v.google_place_id) map.set(v.google_place_id, v)
    }
    return map
  }, [loggedVenues])

  useEffect(() => {
    if (lat == null || lng == null) return
    setLoading(true)
    setError(null)
    places.nearby(lat, lng)
      .then(setNearby)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [lat, lng])

  async function runSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const results = await places.search(query)
      setSearchResults(results)
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  const nearbySorted = useMemo(() => prioritize(nearby, loggedByPlaceId), [nearby, loggedByPlaceId])
  const searchSorted = useMemo(() => prioritize(searchResults, loggedByPlaceId), [searchResults, loggedByPlaceId])

  return (
    <div className="space-y-4">
      {lat != null && lng != null && (
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-600" /> Nearby venues
          </div>
          {loading && <div className="text-sm text-muted-foreground">Looking nearby…</div>}
          {!loading && nearby.length === 0 && !error && (
            <div className="text-sm text-muted-foreground">No venues found nearby — try search or enter manually.</div>
          )}
          <div className="space-y-1.5">
            {nearbySorted.map((p) => (
              <PlaceOption key={p.place_id} place={p} logged={loggedByPlaceId.get(p.place_id)} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div>
        <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-cyan-600" /> Search by name
        </div>
        <form onSubmit={runSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Blue Bottle Coffee"
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-3 py-2 rounded-md border text-sm font-medium hover:bg-accent"
          >
            {searching ? '…' : 'Search'}
          </button>
        </form>
        {searchSorted.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {searchSorted.map((p) => (
              <PlaceOption key={p.place_id} place={p} logged={loggedByPlaceId.get(p.place_id)} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onManual}
        className="flex items-center gap-1.5 text-sm text-cyan-700 hover:underline"
      >
        <Pencil className="w-3.5 h-3.5" /> Enter venue manually instead
      </button>
    </div>
  )
}

function PlaceOption({ place, logged, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(place)}
      className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
        logged
          ? 'border-cyan-500 bg-accent hover:bg-accent/70'
          : 'bg-card hover:border-cyan-500 hover:bg-accent'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <div className="font-medium text-sm">{place.name}</div>
        {logged && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-700 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Logged · {logged.visit_count} visit{logged.visit_count === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <div className="text-xs text-muted-foreground">{place.address}</div>
    </button>
  )
}
