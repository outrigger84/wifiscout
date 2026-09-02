import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function TrendBadge({ trend }) {
  if (!trend) return null

  if (trend.direction === 'flat') {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="w-3.5 h-3.5" /> Flat
      </div>
    )
  }

  const up = trend.direction === 'up'
  const Icon = up ? TrendingUp : TrendingDown
  const label = `${up ? '+' : ''}${trend.deltaMbps.toFixed(0)} Mbps`

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-destructive'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
  )
}
