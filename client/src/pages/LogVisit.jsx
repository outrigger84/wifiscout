import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MapPin, Loader2 } from 'lucide-react'
import { venues as venuesApi, visits as visitsApi } from '@/api/client'
import { getCurrentPosition } from '@/lib/geolocation'
import { readLogVisitParams } from '@/lib/urlParams'
import { runSpeedTest } from '@/lib/speedtest'
import PlacesSuggestPicker from '@/components/PlacesSuggestPicker'
import SpeedTestGauge from '@/components/SpeedTestGauge'

const VENUE_TYPES = [
  { value: 'coffee_shop', label: 'Coffee shop' },
  { value: 'co_working', label: 'Co-working space' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
]

const emptyVenue = { name: '', address: '', lat: null, lng: null, venue_type: 'coffee_shop', google_place_id: null }

export default function LogVisit() {
  const { id: venueIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(venueIdParam ? 'details' : 'venue')
  const [locStatus, setLocStatus] = useState('idle') // idle | locating | error
  const [locError, setLocError] = useState(null)
  const [coords, setCoords] = useState(null)
  const [manualEntry, setManualEntry] = useState(false)
  const [venue, setVenue] = useState(emptyVenue)
  const [existingVenue, setExistingVenue] = useState(null)

  const [speedStatus, setSpeedStatus] = useState('idle') // idle | running | done | error
  const [speedResult, setSpeedResult] = useState(null)

  const [form, setForm] = useState({
    ssid: '', rssi: '', auth_method: 'wpa2', wifi_password: '', toilet_door_code: '',
    seating_rating: '', power_outlets: '', noise_level: '', food_quality: '',
    wifi_cost: '', notes: '',
  })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Load existing venue if navigated from a venue's detail page.
  useEffect(() => {
    if (!venueIdParam) return
    venuesApi.get(venueIdParam).then((v) => setExistingVenue(v))
  }, [venueIdParam])

  // Seed from URL params (iOS Shortcut) and/or try in-page GPS.
  useEffect(() => {
    if (venueIdParam) return
    const params = readLogVisitParams(searchParams)
    if (params.ssid || params.rssi != null) {
      setForm((f) => ({
        ...f,
        ssid: params.ssid || f.ssid,
        rssi: params.rssi != null ? params.rssi : f.rssi,
      }))
    }
    if (params.lat != null && params.lng != null) {
      setCoords({ lat: params.lat, lng: params.lng })
    } else {
      attemptGeolocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function attemptGeolocation() {
    setLocStatus('locating')
    setLocError(null)
    try {
      const pos = await getCurrentPosition()
      setCoords(pos)
      setLocStatus('idle')
    } catch (err) {
      setLocError(err.message)
      setLocStatus('error')
    }
  }

  function selectPlace(p) {
    setVenue({
      name: p.name,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      venue_type: 'coffee_shop',
      google_place_id: p.place_id,
    })
    setManualEntry(true) // reveal the confirm/edit form pre-filled
  }

  function chooseManual() {
    setVenue({ ...emptyVenue, lat: coords?.lat ?? null, lng: coords?.lng ?? null })
    setManualEntry(true)
  }

  async function runTest() {
    setSpeedStatus('running')
    try {
      const result = await runSpeedTest()
      setSpeedResult(result)
      setSpeedStatus('done')
    } catch (err) {
      setSpeedStatus('error')
    }
  }

  // Kick off the speed test as soon as the details screen is reached, so it runs in the
  // background while the user fills in the rest of the form instead of blocking a dedicated step.
  useEffect(() => {
    if (step === 'details' && speedStatus === 'idle') runTest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      let venueId = venueIdParam
      if (!venueId) {
        const created = await venuesApi.create(venue)
        venueId = created.id
      }

      const fd = new FormData()
      fd.append('venue_id', venueId)
      if (speedResult) {
        fd.append('download_mbps', speedResult.downloadMbps ?? '')
        fd.append('upload_mbps', speedResult.uploadMbps ?? '')
        fd.append('ping_ms', speedResult.pingMs ?? '')
        fd.append('jitter_ms', speedResult.jitterMs ?? '')
      }
      for (const [key, value] of Object.entries(form)) fd.append(key, value)
      if (coords) {
        fd.append('lat', coords.lat)
        fd.append('lng', coords.lng)
      }
      if (photo) fd.append('photo', photo)

      await visitsApi.create(fd)
      navigate(`/venues/${venueId}`)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const venueConfirmed = venueIdParam ? !!existingVenue : (venue.name && manualEntry)

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Log a visit</h1>

      {step === 'venue' && !venueIdParam && (
        <div className="space-y-4">
          {locStatus === 'locating' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Getting your location…
            </div>
          )}
          {locError && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {locError}
            </div>
          )}

          {!manualEntry && (
            <PlacesSuggestPicker lat={coords?.lat} lng={coords?.lng} onSelect={selectPlace} onManual={chooseManual} />
          )}

          {manualEntry && (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="w-4 h-4 text-cyan-600" /> Confirm venue
              </div>
              <Field label="Name">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                />
              </Field>
              <Field label="Address">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={venue.address}
                  onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                />
              </Field>
              <Field label="Type">
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={venue.venue_type}
                  onChange={(e) => setVenue({ ...venue, venue_type: e.target.value })}
                >
                  {VENUE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <button
                type="button"
                disabled={!venue.name}
                onClick={() => setStep('details')}
                className="w-full text-sm font-medium py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          {venueIdParam && existingVenue && (
            <div className="text-sm text-muted-foreground">Logging a visit to <span className="font-medium text-foreground">{existingVenue.name}</span></div>
          )}
          {!venueIdParam && venueConfirmed && (
            <div className="text-sm text-muted-foreground">Logging a visit to <span className="font-medium text-foreground">{venue.name}</span></div>
          )}

          <SpeedTestGauge status={speedStatus} result={speedResult} onStart={runTest} />

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="text-sm font-medium">Wifi & access</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SSID">
                <input className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.ssid}
                  onChange={(e) => setForm({ ...form, ssid: e.target.value })} />
              </Field>
              <Field label="Auth method">
                <select className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.auth_method}
                  onChange={(e) => setForm({ ...form, auth_method: e.target.value })}>
                  <option value="open">Open</option>
                  <option value="wpa2">WPA2</option>
                  <option value="wpa3">WPA3</option>
                  <option value="captive_portal">Captive portal</option>
                </select>
              </Field>
              <Field label="Signal strength (RSSI, dBm)">
                <input type="number" className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.rssi}
                  placeholder="e.g. -55" onChange={(e) => setForm({ ...form, rssi: e.target.value })} />
              </Field>
            </div>
            <Field label="Wifi password">
              <input className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.wifi_password}
                onChange={(e) => setForm({ ...form, wifi_password: e.target.value })} />
            </Field>
            <Field label="Toilet door code">
              <input className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.toilet_door_code}
                onChange={(e) => setForm({ ...form, toilet_door_code: e.target.value })} />
            </Field>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="text-sm font-medium">Ratings</div>
            <div className="grid grid-cols-2 gap-3">
              <RatingField label="Seating" value={form.seating_rating} onChange={(v) => setForm({ ...form, seating_rating: v })} />
              <RatingField label="Noise" value={form.noise_level} onChange={(v) => setForm({ ...form, noise_level: v })} />
              <RatingField label="Food/coffee" value={form.food_quality} onChange={(v) => setForm({ ...form, food_quality: v })} />
              <Field label="Power outlets">
                <select className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.power_outlets}
                  onChange={(e) => setForm({ ...form, power_outlets: e.target.value })}>
                  <option value="">—</option>
                  <option value="plenty">Plenty</option>
                  <option value="some">Some</option>
                  <option value="none">None</option>
                </select>
              </Field>
            </div>
            <Field label="Wifi cost">
              <select className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={form.wifi_cost}
                onChange={(e) => setForm({ ...form, wifi_cost: e.target.value })}>
                <option value="">—</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="purchase_required">Purchase required</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea className="w-full rounded-md border px-3 py-2 text-sm bg-background" rows={3} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
            <Field label="Photo">
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="text-sm" />
            </Field>
          </div>

          {speedStatus === 'running' && (
            <div className="text-xs text-muted-foreground">
              Speed test still running — saving now will save the visit without a speed result.
            </div>
          )}

          {saveError && <div className="text-sm text-destructive">{saveError}</div>}

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full text-sm font-medium py-2.5 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save visit'}
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  )
}

function RatingField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <select className="w-full rounded-md border px-3 py-2 text-sm bg-background" value={value}
        onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </Field>
  )
}
