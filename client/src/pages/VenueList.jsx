import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { venues as venuesApi } from '@/api/client'
import VenueCard from '@/components/VenueCard'

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'coffee_shop', label: 'Coffee shop' },
  { value: 'co_working', label: 'Co-working' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
]

const SORTS = [
  { value: 'speed', label: 'Fastest download' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name' },
]

export default function VenueList() {
  const [type, setType] = useState('')
  const [sort, setSort] = useState('speed')

  const params = { sort }
  if (type) params.type = type

  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues', params],
    queryFn: () => venuesApi.list(params),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Venues</h1>
        <Link
          to="/log"
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700"
        >
          <PlusCircle className="w-4 h-4" /> Log a visit
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="text-sm rounded-md border px-2 py-1.5 bg-background"
        >
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm rounded-md border px-2 py-1.5 bg-background"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">{error.message}</div>}

      {venues && venues.length === 0 && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No venues logged yet — <Link to="/log" className="text-cyan-700 hover:underline">log your first visit</Link>.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {venues?.map((v) => <VenueCard key={v.id} venue={v} />)}
      </div>
    </div>
  )
}
