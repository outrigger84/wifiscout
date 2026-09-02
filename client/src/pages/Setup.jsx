import { Smartphone, CheckCircle2 } from 'lucide-react'

export default function Setup() {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Setup</h1>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 font-medium mb-2">
          <Smartphone className="w-4 h-4 text-cyan-600" /> iPhone Shortcut (build once, ~2 minutes)
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          There's no reliable way to pre-package this as a one-tap download — Apple's Shortcuts
          file format isn't something that can be hand-built and verified without a real device.
          The recipe below is confirmed working (tested on-device, including RSSI):
        </p>

        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li>Open the <span className="font-medium">Shortcuts</span> app → <span className="font-medium">+</span> to create a new shortcut.</li>
          <li>Add action <span className="font-medium">"Get Wi-Fi network's ___"</span> (search "wifi"), and set its property dropdown to <span className="font-medium">Name</span>.</li>
          <li>Add the same <span className="font-medium">"Get Wi-Fi network's ___"</span> action again, this time set to <span className="font-medium">RSSI</span> (the dropdown also has BSSID, Wi-Fi Standard, RX/TX Rate, Noise, Channel Number, Hardware MAC Address — none of those are used here).</li>
          <li>Add action <span className="font-medium">"Get Current Location"</span> (search "location").</li>
          <li>Add <span className="font-medium">"Get Latitude from Current Location"</span> and <span className="font-medium">"Get Longitude from Current Location"</span> (search "latitude" / "longitude", then pick the Current Location variable from the step above as the input).</li>
          <li>
            Add a <span className="font-medium">Text</span> action and build the URL, inserting each variable (the blue tokens) from the steps above in place of the brackets:
            <pre className="mt-1 rounded-md bg-muted px-2 py-1.5 text-xs overflow-x-auto">https://YOUR-HOST:8443/wifiscout/log?ssid=[Network Details]&amp;lat=[Latitude]&amp;lng=[Longitude]&amp;rssi=[Network Details 2]</pre>
            Use your Tailscale HTTPS hostname on port <span className="font-medium">8443</span> specifically (a tailnet-private route was set up for this app on that port) — plain <code>http://</code> gets upgraded to https by Safari and lands on the wrong port, and port 443 on this hostname is reserved for a different app.
          </li>
          <li>Add action <span className="font-medium">"Open"</span> and set it to open the Text variable from the step above.</li>
          <li>Rename the shortcut to "Log Wifi Visit", then add it to your Home Screen, set up Back Tap, or turn it into a <span className="font-medium">"When Any Network is Joined"</span> personal automation (leave "Ask Before Running" on so it doesn't jump into Safari unexpectedly every time you reconnect to a familiar network).</li>
        </ol>

        <div className="mt-4 flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Confirmed working: SSID, location, and RSSI all pre-fill correctly in the Log a Visit
          page when opened this way.
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Everything else (speed test, ratings, notes, photo) still happens in the app once it opens.
        </p>
      </div>
    </div>
  )
}
