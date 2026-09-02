import { useEffect, useState } from 'react'
import { Search, MapPin, Pencil } from 'lucide-react'
import { places } from '@/api/client'

export default function PlacesSuggestPicker({ lat, lng, onSelect, onManual }) {
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

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
            {nearby.map((p) => (
              <button
                type="button"
                key={p.place_id}
                onClick={() => onSelect(p)}
                className="w-full text-left px-3 py-2 rounded-md border bg-card hover:border-cyan-500 hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.address}</div>
              </button>
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
        {searchResults.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {searchResults.map((p) => (
              <button
                type="button"
                key={p.place_id}
                onClick={() => onSelect(p)}
                className="w-full text-left px-3 py-2 rounded-md border bg-card hover:border-cyan-500 hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.address}</div>
              </button>
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
