import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

export default function SpeedTrendChart({ visits }) {
  // visits comes in DESC (latest first) from the API — the chart wants ascending order.
  const data = [...visits]
    .filter((v) => v.download_mbps != null || v.upload_mbps != null)
    .reverse()
    .map((v) => ({
      label: format(new Date(v.tested_at), 'MMM d'),
      download_mbps: v.download_mbps,
      upload_mbps: v.upload_mbps,
    }))

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">Speed over time</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit=" Mbps" width={60} />
          <Tooltip />
          <Line type="monotone" dataKey="download_mbps" name="Download" stroke="hsl(189 75% 38%)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="upload_mbps" name="Upload" stroke="hsl(189 40% 65%)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
