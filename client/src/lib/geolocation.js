export function getCurrentPosition({ timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not available in this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: 'Location permission denied — enter the venue manually.',
          2: 'Location unavailable — enter the venue manually.',
          3: 'Location request timed out — enter the venue manually.',
        }
        reject(new Error(messages[err.code] || 'Could not get location.'))
      },
      { enableHighAccuracy: true, timeout, maximumAge: 60000 }
    )
  })
}
