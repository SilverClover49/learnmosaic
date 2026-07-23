const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || res.statusText)
  }
  return res.json()
}

export const api = {
  // User
  listUsers: () => req('/sessions/users'),
  createUser: (data) => req('/users', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (id) => req(`/users/${id}`),
  deleteAccount: (id) => req(`/users/${id}`, { method: 'DELETE' }),

  // Sessions
  listSessions: () => req('/sessions'),
  getSession: (id) => req(`/sessions/${id}`),
  createSession: (data) => req('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  completeSession: (id) => req(`/sessions/${id}/complete`, { method: 'POST' }),
  getCredits: (id) => req(`/sessions/${id}/credits`),
  updateSession: (id, data) => req(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSession: (id) => req(`/sessions/${id}`, { method: 'DELETE' }),
  undoComplete: (id) => req(`/sessions/${id}/undo-complete`, { method: 'POST' }),

  // Chat
  sendMessage: (sessionId, data) => req(`/sessions/${sessionId}/chat`, { method: 'POST', body: JSON.stringify(data) }),

  // Upload
  uploadFile: (sessionId, file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE}/sessions/${sessionId}/upload`, { method: 'POST', body: form }).then(r => r.json())
  },

  // Documents
  getLeanCanvas: () => req('/documents/lean-canvas')
}
