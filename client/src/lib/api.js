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

  // Chat — streaming SSE
  sendMessageStream: (sessionId, data, { onToken, onBlocks, onDone, onError }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${BASE}/sessions/${sessionId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (!res.ok) {
          const err = await res.text()
          onError?.(err)
          reject(new Error(err))
          return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let streamEnded = false

        const processLine = (line) => {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) return
          try {
            const parsed = JSON.parse(trimmed.slice(6))
            if (parsed.type === 'token') onToken?.(parsed.text)
            if (parsed.type === 'blocks') onBlocks?.(parsed.blocks)
            if (parsed.type === 'done') { streamEnded = true; onDone?.(); resolve() }
            if (parsed.type === 'error') { onError?.(parsed.text); reject(new Error(parsed.text)) }
          } catch {}
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) processLine(line)
        }

        // Flush remaining buffer (last event without trailing newline)
        if (buffer.trim()) processLine(buffer)

        // If stream closed without a 'done' event, resolve anyway
        if (!streamEnded) { onDone?.(); resolve() }
      } catch (e) {
        onError?.(e.message)
        reject(e)
      }
    })
  },

  // Upload
  uploadFile: (sessionId, file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE}/sessions/${sessionId}/upload`, { method: 'POST', body: form }).then(r => r.json())
  },

  // Settings
  getSettings: () => req('/settings'),
  saveSettings: (data) => req('/settings', { method: 'PUT', body: JSON.stringify(data) }),

}
