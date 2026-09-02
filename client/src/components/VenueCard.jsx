import { Link } from 'react-router-dom'
import { Download, Upload, Star, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_LABELS = {
  coffee_shop: 'Coffee shop',
  co_working: 'Co-working',
  library: 'Library',
  other: 'Other',
}

export default function VenueCard({ venue }) {
  return (
    <Link
      to={`/venues/${venue.id}`}
      className="block rounded-lg border bg-card p-4 hover:border-cyan-500 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{venue.name}</div>
          <div className="text-xs text-muted-foreground">{venue.address}</div>
        </div>
        <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
          {TYPE_LABELS[venue.venue_type] || venue.venue_type}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <Stat icon={Download} value={venue.latest_download_mbps} unit="Mbps" />
        <Stat icon={Upload} value={venue.latest_upload_mbps} unit="Mbps" />
        {venue.avg_rating != null && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            {venue.avg_rating.toFixed(1)}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Coffee className="w-3.5 h-3.5" />
          {venue.visit_count} visit{venue.visit_count === 1 ? '' : 's'}
        </div>
      </div>
    </Link>
  )
}

function Stat({ icon: Icon, value, unit }) {
  return (
    <div className={cn('flex items-center gap-1', value == null && 'text-muted-foreground')}>
      <Icon className="w-3.5 h-3.5 text-cyan-600" />
      <span className="font-medium tabular-nums">{value != null ? value.toFixed(0) : '—'}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  )
}
