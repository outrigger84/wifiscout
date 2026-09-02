import SpeedTest from '@cloudflare/speedtest'

// Runs a speed test against Cloudflare's public endpoints (speed.cloudflare.com).
// This measures the real path from the venue's wifi out to the internet — testing
// our own server here would only measure our home broadband, not the venue's connection.
export function runSpeedTest({ onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const engine = new SpeedTest({ autoStart: true })

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
