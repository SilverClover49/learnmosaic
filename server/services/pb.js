import 'dotenv/config'

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@learnmosaic.io'
const ADMIN_PASS = process.env.PB_ADMIN_PASS || 'LearnMosaic2026!'

let _token = null
let _tokenExpires = 0

async function getToken() {
  if (_token && Date.now() < _tokenExpires) return _token
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`PB auth failed: ${data.message}`)
  _token = data.token
  _tokenExpires = Date.now() + 60 * 60 * 1000 // 1 hour
  return _token
}

async function api(method, path, body) {
  const token = await getToken()
  const opts = { method, headers: { Authorization: `Bearer ${token}` } }
  if (body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${PB_URL}${path}`, opts)
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) {
    console.error('PB API ERROR:', method, path, res.status, JSON.stringify(data))
    const msg = data?.data?.message || data?.message || data?.data?.data?.message || `PB error ${res.status}`
    throw new Error(msg)
  }
  return data
}

export const pb = {
  // Profiles
  createProfile: (data) => api('POST', '/api/collections/profiles/records', data),

  listProfiles: async () => {
    const res = await api('GET', '/api/collections/profiles/records?sort=-created')
    return res?.items || []
  },

  getProfile: (id) => api('GET', `/api/collections/profiles/records/${id}`),

  updateProfile: (id, data) => api('PATCH', `/api/collections/profiles/records/${id}`, data),

  findProfileByName: async (name) => {
    const res = await api('GET', `/api/collections/profiles/records?filter=(name~'${encodeURIComponent(name)}')&perPage=1`)
    return res?.items?.[0] || null
  },

  // Sessions
  listSessions: async (profileId) => {
    const fields = 'id,name,goal,status,favorite,timeframe,created,interests,profileId,completedAt'
    const filter = profileId ? `&filter=(profileId='${profileId}')` : ''
    const res = await api('GET', `/api/collections/sessions/records?sort=-created&fields=${fields}${filter}`)
    return res?.items || []
  },

  getSession: (id) => api('GET', `/api/collections/sessions/records/${id}`),

  createSession: (data) => api('POST', '/api/collections/sessions/records', data),

  updateSession: (id, data) => api('PATCH', `/api/collections/sessions/records/${id}`, data),

  deleteSession: (id) => api('DELETE', `/api/collections/sessions/records/${id}`),

  // Messages
  getMessages: async (sessionId) => {
    const res = await api('GET', `/api/collections/messages/records?filter=(sessionId='${sessionId}')&sort=created&perPage=500`)
    return res?.items || []
  },

  createMessage: (data) => api('POST', '/api/collections/messages/records', data),

  // Milestones
  getMilestones: async (sessionId) => {
    const res = await api('GET', `/api/collections/milestones/records?filter=(sessionId='${sessionId}')&sort=created&perPage=100`)
    return res?.items || []
  },

  addMilestone: (data) => api('POST', '/api/collections/milestones/records', data),

  // Profile deletion helpers
  listSessionsByProfile: async (profileId) => {
    const res = await api('GET', `/api/collections/sessions/records?filter=(profileId='${profileId}')&perPage=500`)
    return res?.items || []
  },

  deleteProfile: (id) => api('DELETE', `/api/collections/profiles/records/${id}`),

  deleteMessagesBySession: async (sessionId) => {
    const res = await api('GET', `/api/collections/messages/records?filter=(sessionId='${sessionId}')&perPage=500`)
    for (const msg of (res?.items || [])) {
      await api('DELETE', `/api/collections/messages/records/${msg.id}`)
    }
  },

  deleteMilestonesBySession: async (sessionId) => {
    const res = await api('GET', `/api/collections/milestones/records?filter=(sessionId='${sessionId}')&perPage=500`)
    for (const m of (res?.items || [])) {
      await api('DELETE', `/api/collections/milestones/records/${m.id}`)
    }
  },

  // Memories
  getMemories: async (sessionId) => {
    const res = await api('GET', `/api/collections/memories/records?filter=(sessionId='${sessionId}')&sort=-created&perPage=200`)
    return res?.items || []
  },

  getMemoriesByProfile: async function (profileId) {
    const sessions = await this.listSessionsByProfile(profileId)
    const allMemories = []
    for (const s of sessions) {
      const m = await api('GET', `/api/collections/memories/records?filter=(sessionId='${s.id}')&sort=-created&perPage=200`)
      if (m?.items) allMemories.push(...m.items)
    }
    return allMemories
  },

  createMemory: (data) => api('POST', '/api/collections/memories/records', data),

  updateMemory: (id, data) => api('PATCH', `/api/collections/memories/records/${id}`, data),

  deleteMemory: (id) => api('DELETE', `/api/collections/memories/records/${id}`),

  getMemoryByKey: async (sessionId, key) => {
    const res = await api('GET', `/api/collections/memories/records?filter=(sessionId='${sessionId}'%26%26key='${encodeURIComponent(key)}')&perPage=1`)
    return res?.items?.[0] || null
  },

  deleteMemoriesBySession: async (sessionId) => {
    const res = await api('GET', `/api/collections/memories/records?filter=(sessionId='${sessionId}')&perPage=500`)
    for (const m of (res?.items || [])) {
      await api('DELETE', `/api/collections/memories/records/${m.id}`)
    }
  },

  // Artifacts
  getArtifacts: async (sessionId) => {
    const res = await api('GET', `/api/collections/artifacts/records?filter=(sessionId='${sessionId}')&sort=-created&perPage=100`)
    return res?.items || []
  },

  createArtifact: (data) => api('POST', '/api/collections/artifacts/records', data),

  getArtifact: (id) => api('GET', `/api/collections/artifacts/records/${id}`),

  deleteArtifact: (id) => api('DELETE', `/api/collections/artifacts/records/${id}`),

  deleteArtifactsBySession: async (sessionId) => {
    const res = await api('GET', `/api/collections/artifacts/records?filter=(sessionId='${sessionId}')&perPage=500`)
    for (const a of (res?.items || [])) {
      await api('DELETE', `/api/collections/artifacts/records/${a.id}`)
    }
  },

  // Settings (global)
  getGlobalSettings: async () => {
    const res = await api('GET', '/api/collections/settings/records?perPage=1')
    return res?.items?.[0] || null
  },

  updateGlobalSettings: async (id, data) => api('PATCH', `/api/collections/settings/records/${id}`, data),

  createGlobalSettings: (data) => api('POST', '/api/collections/settings/records', data),
}
