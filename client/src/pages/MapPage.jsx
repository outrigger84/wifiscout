import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { venues as venuesApi } from '@/api/client'

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
      <MapContainer center={[51.5074, -0.1278]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
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
