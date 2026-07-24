import { pb } from './pb.js'

export async function storeMemory(sessionId, type, key, value, importance = 5) {
  return await pb.createMemory({ sessionId, type, key, value, importance })
}

export async function recallMemories(sessionId, query = '') {
  const all = await pb.getMemories(sessionId)
  if (!query) return all.sort((a, b) => (b.importance || 0) - (a.importance || 0)).slice(0, 20)
  const q = query.toLowerCase()
  const scored = all.map(m => {
    let score = 0
    if (m.key.toLowerCase().includes(q)) score += 10
    if (m.value.toLowerCase().includes(q)) score += 5
    if (m.type.toLowerCase().includes(q)) score += 3
    score += (m.importance || 0) * 0.5
    return { ...m, score }
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, 20)
}

export async function recallCrossSessionMemories(profileId, query = '') {
  const all = await pb.getMemoriesByProfile(profileId)
  if (!query) return all.sort((a, b) => (b.importance || 0) - (a.importance || 0)).slice(0, 30)
  const q = query.toLowerCase()
  const scored = all.map(m => {
    let score = 0
    if (m.key.toLowerCase().includes(q)) score += 10
    if (m.value.toLowerCase().includes(q)) score += 5
    if (m.type.toLowerCase().includes(q)) score += 3
    score += (m.importance || 0) * 0.5
    return { ...m, score }
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, 30)
}

export async function deleteMemory(id) {
  return await pb.deleteMemory(id)
}

export async function getSessionSummary(sessionId) {
  const sum = await pb.getMemoryByKey(sessionId, 'session_summary')
  return sum ? sum.value : ''
}

export async function updateSessionSummary(sessionId, summary) {
  const existing = await pb.getMemoryByKey(sessionId, 'session_summary')
  if (existing) {
    return await pb.updateMemory(existing.id, { value: summary })
  }
  return await storeMemory(sessionId, 'summary', 'session_summary', summary, 10)
}
