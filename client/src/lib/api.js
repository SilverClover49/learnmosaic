// Use Vercel API routes (same domain in production, /api in dev)
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
  listUsers: () => req('/users'),
  createUser: (data) => req('/users', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (id) => req(`/users/${id}`),
  deleteAccount: (id) => req(`/users/${id}`, { method: 'DELETE' }),

  // Sessions
  listSessions: (userId) => req(`/sessions?user_id=${userId}`),
  getSession: (id) => req(`/sessions?id=${id}`),
  createSession: (data) => req('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  updateSession: (id, data) => req(`/sessions?id=${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSession: (id) => req(`/sessions?id=${id}`, { method: 'DELETE' }),

  // Chat
  sendMessage: (sessionId, message) => req('/chat', { method: 'POST', body: JSON.stringify({ session_id: sessionId, message }) }),

  // Settings
  getSettings: () => req('/settings'),
  checkApi: () => req('/settings'),
  useDefaultApiKey: () => req('/settings/use-default', { method: 'POST' }),
}
