// Contract for the iOS Shortcut / any external launcher of the Log Visit page.
// Supported params (all optional): ssid, lat, lng
export function readLogVisitParams(searchParams) {
  const ssid = searchParams.get('ssid') || ''
  const latRaw = searchParams.get('lat')
  const lngRaw = searchParams.get('lng')
  const lat = latRaw !== null ? Number(latRaw) : null
  const lng = lngRaw !== null ? Number(lngRaw) : null
  return {
    ssid,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  }
}
