// Compares latest vs previous download_mbps and returns a trend descriptor, or null
// when there isn't enough data (fewer than 2 visits, or either value missing).
export function computeTrend(latest, previous) {
  if (latest == null || previous == null) return null
  const deltaMbps = latest - previous
  const deltaPercent = previous === 0 ? null : (deltaMbps / previous) * 100
  const FLAT_THRESHOLD_MBPS = 1
  const direction =
    Math.abs(deltaMbps) < FLAT_THRESHOLD_MBPS ? 'flat' : deltaMbps > 0 ? 'up' : 'down'
  return { direction, deltaMbps, deltaPercent }
}
