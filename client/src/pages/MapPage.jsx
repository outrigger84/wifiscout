import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { venues as venuesApi } from '@/api/client'
import { getCurrentPosition } from '@/lib/geolocation'

const DEFAULT_CENTER = [20, 0]
const DEFAULT_ZOOM = 2

function speedColor(mbps) {
  if (mbps == null) return '#94a3b8'
  if (mbps >= 100) return '#059669'
  if (mbps >= 40) return '#65a30d'
  if (mbps >= 15) return '#d97706'
  return '#dc2626'
}

function speedRadius(mbps) {
  if (mbps == null) return 5
  return Math.min(6 + mbps / 25, 16)
}

// Weighted by visit_count so venues you've tested more often pull the centroid harder —
// a cheap proxy for "the area you're usually in" when we can't just ask the browser.
function mostVisitedCentroid(venues) {
  const points = venues.filter((v) => v.lat != null && v.lng != null && v.visit_count > 0)
  if (points.length === 0) return null
  const totalWeight = points.reduce((sum, v) => sum + v.visit_count, 0)
  const lat = points.reduce((sum, v) => sum + v.lat * v.visit_count, 0) / totalWeight
  const lng = points.reduce((sum, v) => sum + v.lng * v.visit_count, 0) / totalWeight
  return [lat, lng]
}

// Recenters the map once, after mount: tries the browser's geolocation first (most accurate —
// this is genuinely where you are right now), falling back to the visit-weighted centroid of
// logged venues (roughly where you tend to be), and finally a world view if neither is available.
function AutoLocate({ venues }) {
  const map = useMap()

  useEffect(() => {
    let cancelled = false

    getCurrentPosition({ timeout: 6000 })
      .then((pos) => {
        if (!cancelled) map.setView([pos.lat, pos.lng], 13)
      })
      .catch(() => {
        const centroid = mostVisitedCentroid(venues)
        if (!cancelled && centroid) map.setView(centroid, 12)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default function MapPage() {
  const navigate = useNavigate()
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues', {}],
    queryFn: () => venuesApi.list({}),
  })

  const points = (venues || []).filter((v) => v.lat != null && v.lng != null)

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>
  if (error) return <div className="text-sm text-destructive">{error.message}</div>

  return (
    <div className="h-[calc(100vh-6rem)] rounded-lg overflow-hidden border">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          subdomains="abc"
          maxZoom={19}
        />
        <AutoLocate venues={venues || []} />
        {points.map((v) => (
          <CircleMarker
            key={v.id}
            center={[v.lat, v.lng]}
            radius={speedRadius(v.latest_download_mbps)}
            pathOptions={{
              color: speedColor(v.latest_download_mbps),
              fillColor: speedColor(v.latest_download_mbps),
              fillOpacity: 0.8,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{v.name}</div>
                <div className="text-gray-500 mb-2">
                  {v.latest_download_mbps != null ? `${v.latest_download_mbps.toFixed(0)} Mbps down` : 'No speed test yet'}
                </div>
                <button onClick={() => navigate(`/venues/${v.id}`)} className="text-cyan-700 hover:underline text-xs">
                  View details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
