import { pb } from './pb.js'

let _cached = null

export async function getSettings() {
  if (_cached) return _cached
  try {
    const profiles = await pb.listProfiles()
    const p = profiles[0] || {}
    _cached = {
      aiProvider: p.aiProvider || 'openrouter',
      aiModel: p.aiModel || 'openai/gpt-4o-mini',
      apiKey: p.apiKey || process.env.OPENROUTER_API_KEY || '',
      baseUrl: p.baseUrl || ''
    }
  } catch {
    _cached = {
      aiProvider: process.env.AI_PROVIDER || 'openrouter',
      aiModel: process.env.AI_MODEL || 'openai/gpt-4o-mini',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: ''
    }
  }
  return _cached
}

export function clearSettingsCache() {
  _cached = null
}
