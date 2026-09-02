import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Download, Upload, Wifi, KeyRound, DoorClosed, PlusCircle, Trash2 } from 'lucide-react'
import { venues as venuesApi, visits as visitsApi } from '@/api/client'
import { computeTrend } from '@/lib/trend'
import TrendBadge from '@/components/TrendBadge'
import SpeedTrendChart from '@/components/SpeedTrendChart'

const POWER_LABELS = { plenty: 'Plenty of outlets', some: 'Some outlets', none: 'No outlets' }
const COST_LABELS = { free: 'Free', paid: 'Paid', purchase_required: 'Purchase required' }

export default function VenueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: venue, isLoading, error } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => venuesApi.get(id),
  })

  async function deleteVisit(visitId) {
    if (!confirm('Delete this visit?')) return
    await visitsApi.remove(visitId)
    queryClient.invalidateQueries({ queryKey: ['venue', id] })
    queryClient.invalidateQueries({ queryKey: ['venues'] })
  }

  async function deleteVenue() {
    const visitCount = venue.visits.length
    const warning = visitCount > 0
      ? `Delete "${venue.name}" and all ${visitCount} visit${visitCount === 1 ? '' : 's'} logged against it? This can't be undone.`
      : `Delete "${venue.name}"? This can't be undone.`
    if (!confirm(warning)) return
    await venuesApi.remove(id)
    queryClient.invalidateQueries({ queryKey: ['venues'] })
    navigate('/')
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>
  if (error) return <div className="text-sm text-destructive">{error.message}</div>
  if (!venue) return null

  const trend = venue.visits.length >= 2
    ? computeTrend(venue.visits[0].download_mbps, venue.visits[1].download_mbps)
    : null

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{venue.name}</h1>
          <div className="text-sm text-muted-foreground">{venue.address}</div>
          {trend && <div className="mt-1"><TrendBadge trend={trend} /></div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/venues/${venue.id}/log`}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700"
          >
            <PlusCircle className="w-4 h-4" /> Log a visit here
          </Link>
          <button
            onClick={deleteVenue}
            title="Delete venue"
            className="p-2 rounded-md border text-muted-foreground hover:text-destructive hover:border-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {venue.visits.length >= 2 && (
        <div className="mb-4">
          <SpeedTrendChart visits={venue.visits} />
        </div>
      )}

      <h2 className="text-sm font-semibold text-muted-foreground mb-2">Visit history</h2>
      <div className="space-y-3">
        {venue.visits.length === 0 && (
          <div className="text-sm text-muted-foreground">No visits logged yet.</div>
        )}
        {venue.visits.map((v) => (
          <div key={v.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(v.tested_at).toLocaleString()}
              </div>
              <button onClick={() => deleteVisit(v.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-sm">
              <Metric icon={Download} label="Download" value={v.download_mbps} unit="Mbps" />
              <Metric icon={Upload} label="Upload" value={v.upload_mbps} unit="Mbps" />
              <Metric label="Ping" value={v.ping_ms} unit="ms" />
              <Metric label="Jitter" value={v.jitter_ms} unit="ms" />
            </div>

            {(v.ssid || v.wifi_password || v.auth_method || v.rssi != null) && (
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {v.ssid && (
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-cyan-600" /> {v.ssid}
                    {v.auth_method && <span className="text-xs text-muted-foreground">({v.auth_method})</span>}
                    {v.rssi != null && <span className="text-xs text-muted-foreground">{v.rssi} dBm</span>}
                  </div>
                )}
                {v.wifi_password && (
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-600" /> {v.wifi_password}
                  </div>
                )}
              </div>
            )}

            {v.toilet_door_code && (
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                <DoorClosed className="w-3.5 h-3.5 text-cyan-600" /> Toilet code: {v.toilet_door_code}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {v.seating_rating != null && <Tag>Seating {v.seating_rating}/5</Tag>}
              {v.power_outlets && <Tag>{POWER_LABELS[v.power_outlets]}</Tag>}
              {v.noise_level != null && <Tag>Noise {v.noise_level}/5</Tag>}
              {v.food_quality != null && <Tag>Food/coffee {v.food_quality}/5</Tag>}
              {v.wifi_cost && <Tag>{COST_LABELS[v.wifi_cost]}</Tag>}
            </div>

            {v.notes && <div className="mt-2 text-sm">{v.notes}</div>}

            {v.photo_path && (
              <img
                src={`/wifiscout/uploads/${v.photo_path}`}
                alt="Visit photo"
                className="mt-3 rounded-md max-h-48 object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value, unit }) {
  return (
    <div>
      <div className="flex items-center gap-1 font-medium tabular-nums">
        {Icon && <Icon className="w-3.5 h-3.5 text-cyan-600" />}
        {value != null ? value.toFixed(1) : '—'} <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  )
}

function Tag({ children }) {
  return <span className="px-2 py-0.5 rounded-full bg-muted">{children}</span>
}
