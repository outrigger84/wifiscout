import { Gauge } from 'lucide-react'

export default function SpeedTestGauge({ status, result, onStart }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Gauge className="w-4 h-4 text-cyan-600" />
          Speed test
        </div>
        {status === 'idle' && (
          <button
            type="button"
            onClick={onStart}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-cyan-600 text-white hover:bg-cyan-700"
          >
            Run test
          </button>
        )}
        {status === 'running' && (
          <span className="text-xs text-muted-foreground animate-pulse">Testing…</span>
        )}
        {status === 'error' && (
          <button
            type="button"
            onClick={onStart}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-destructive text-white hover:opacity-90"
          >
            Retry
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        <Metric label="Download" value={result?.downloadMbps} unit="Mbps" />
        <Metric label="Upload" value={result?.uploadMbps} unit="Mbps" />
        <Metric label="Ping" value={result?.pingMs} unit="ms" />
        <Metric label="Jitter" value={result?.jitterMs} unit="ms" />
      </div>
    </div>
  )
}

function Metric({ label, value, unit }) {
  return (
    <div className="rounded-md bg-muted py-2">
      <div className="text-lg font-semibold tabular-nums">
        {value != null ? value.toFixed(1) : '—'}
      </div>
      <div className="text-[11px] text-muted-foreground">{label} {unit}</div>
    </div>
  )
}
