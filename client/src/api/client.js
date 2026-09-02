const BASE = '/wifiscout/api'

async function request(method, path, body) {
  const opts = { method, headers: {} }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, opts)
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

async function requestForm(method, path, formData) {
  const res = await fetch(`${BASE}${path}`, { method, body: formData })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const venues = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params)
    const suffix = qs.toString() ? `?${qs}` : ''
    return request('GET', `/venues${suffix}`)
  },
  get: (id) => request('GET', `/venues/${id}`),
  create: (data) => request('POST', '/venues', data),
  update: (id, data) => request('PATCH', `/venues/${id}`, data),
  remove: (id) => request('DELETE', `/venues/${id}`),
}

export const visits = {
  create: (formData) => requestForm('POST', '/visits', formData),
  update: (id, data) => request('PATCH', `/visits/${id}`, data),
  remove: (id) => request('DELETE', `/visits/${id}`),
}

export const places = {
  nearby: (lat, lng) => request('GET', `/places/nearby?lat=${lat}&lng=${lng}`),
  search: (query) => request('GET', `/places/search?query=${encodeURIComponent(query)}`),
}
