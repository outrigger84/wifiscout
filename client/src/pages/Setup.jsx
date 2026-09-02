import { Smartphone } from 'lucide-react'

export default function Setup() {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Setup</h1>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 font-medium mb-2">
          <Smartphone className="w-4 h-4 text-cyan-600" /> iPhone Shortcut (build once, ~60 seconds)
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          There's no reliable way to pre-package this as a one-tap download — Apple's Shortcuts
          file format isn't something that can be hand-built and verified without a real device,
          and a broken import would be worse than a two-minute manual setup. Building it directly
          in the Shortcuts app is quick and guaranteed to work:
        </p>

        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li>Open the <span className="font-medium">Shortcuts</span> app → <span className="font-medium">+</span> to create a new shortcut.</li>
          <li>Add action <span className="font-medium">"Get Current Wi-Fi Network"</span> (search for "wifi").</li>
          <li>Add action <span className="font-medium">"Get Current Location"</span> (search for "location").</li>
          <li>
            Add action <span className="font-medium">"Open URLs"</span>, and set its URL field to:
            <pre className="mt-1 rounded-md bg-muted px-2 py-1.5 text-xs overflow-x-auto">https://YOUR-HOST/wifiscout/log?ssid=[Wi-Fi Network Name]&amp;lat=[Latitude]&amp;lng=[Longitude]</pre>
            Tap into the URL field and insert the SSID, Latitude and Longitude as variables (the blue
            tokens) from the two actions above, in place of the bracketed placeholders.
          </li>
          <li>Rename the shortcut to "Log Wifi Visit", then add it to your Home Screen or set up Back Tap for one-tap access.</li>
        </ol>

        <p className="text-xs text-muted-foreground mt-4">
          Once opened this way, the Log a Visit page pre-fills the SSID and location automatically —
          everything else (speed test, ratings, notes) still happens in the app.
        </p>
      </div>
    </div>
  )
}
