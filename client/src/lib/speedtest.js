import SpeedTest from '@cloudflare/speedtest'

// Cloudflare's default measurement plan (per @cloudflare/speedtest's README) minus the
// `packetLoss` step, which requires our own TURN server + credentials to succeed. Without
// those, the packetLoss measurement errors out and takes the whole test down with it — we
// don't need packet loss for this app, so it's dropped rather than configured.
const MEASUREMENTS = [
  { type: 'latency', numPackets: 1 },
  { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true },
  { type: 'latency', numPackets: 20 },
  { type: 'download', bytes: 1e5, count: 9 },
  { type: 'download', bytes: 1e6, count: 8 },
  { type: 'upload', bytes: 1e5, count: 8 },
  { type: 'upload', bytes: 1e6, count: 6 },
  { type: 'download', bytes: 1e7, count: 6 },
  { type: 'upload', bytes: 1e7, count: 4 },
  { type: 'download', bytes: 2.5e7, count: 4 },
  { type: 'upload', bytes: 2.5e7, count: 4 },
  { type: 'download', bytes: 1e8, count: 3 },
  { type: 'upload', bytes: 5e7, count: 3 },
  { type: 'download', bytes: 2.5e8, count: 2 },
]

// Runs a speed test against Cloudflare's public endpoints (speed.cloudflare.com).
// This measures the real path from the venue's wifi out to the internet — testing
// our own server here would only measure our home broadband, not the venue's connection.
export function runSpeedTest({ onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const engine = new SpeedTest({ autoStart: true, measurements: MEASUREMENTS })

    engine.onResultsChange = () => {
      onProgress?.(engine.results)
    }

    engine.onFinish = (results) => {
      resolve({
        downloadMbps: bpsToMbps(results.getDownloadBandwidth()),
        uploadMbps: bpsToMbps(results.getUploadBandwidth()),
        pingMs: results.getUnloadedLatency(),
        jitterMs: results.getUnloadedJitter(),
      })
    }

    engine.onError = (error) => {
      reject(new Error(typeof error === 'string' ? error : 'Speed test failed'))
    }
  })
}

function bpsToMbps(bps) {
  if (bps == null) return null
  return Math.round((bps / 1e6) * 100) / 100
}
