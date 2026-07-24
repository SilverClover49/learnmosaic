import { pb } from './pb.js'

let _cached = null

function maskKey(key) {
  if (!key) return ''
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••' + key.slice(-4)
}

export async function getSettings() {
  if (_cached) return _cached

  try {
    // 1. Check global settings collection first
    const global = await pb.getGlobalSettings()

    // 2. Check first profile for profile-specific overrides
    const profiles = await pb.listProfiles()
    const profile = profiles[0] || {}

    // Profile-specific key takes precedence over global
    const profileKey = profile.apiKey || ''
    const globalKey = global?.apiKey || ''

    _cached = {
      aiProvider: profile.aiProvider || global?.aiProvider || 'openrouter',
      aiModel: profile.aiModel || global?.aiModel || 'openai/gpt-4o-mini',
      apiKey: profileKey || globalKey || process.env.OPENROUTER_API_KEY || '',
      baseUrl: profile.baseUrl || global?.baseUrl || '',
      // Metadata (not sent to client)
      _hasGlobalKey: !!globalKey,
      _hasProfileKey: !!profileKey,
      _globalKeyMasked: maskKey(globalKey),
      _profileKeyMasked: maskKey(profileKey)
    }
  } catch {
    _cached = {
      aiProvider: process.env.AI_PROVIDER || 'openrouter',
      aiModel: process.env.AI_MODEL || 'openai/gpt-4o-mini',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: '',
      _hasGlobalKey: false,
      _hasProfileKey: false,
      _globalKeyMasked: '',
      _profileKeyMasked: ''
    }
  }
  return _cached
}

export async function getSettingsSafe() {
  const s = await getSettings()
  return {
    aiProvider: s.aiProvider,
    aiModel: s.aiModel,
    apiKey: s.apiKey ? '••••••••' : '',
    baseUrl: s.baseUrl,
    hasApiKey: !!(s.apiKey),
    hasGlobalKey: s._hasGlobalKey,
    hasProfileKey: s._hasProfileKey,
    globalKeyMasked: s._globalKeyMasked,
    profileKeyMasked: s._profileKeyMasked
  }
}

export async function saveGlobalSettings(data) {
  const existing = await pb.getGlobalSettings()
  if (existing) {
    await pb.updateGlobalSettings(existing.id, data)
  } else {
    await pb.createGlobalSettings(data)
  }
  clearSettingsCache()
}

export async function saveProfileSettings(profileId, data) {
  await pb.updateProfile(profileId, data)
  clearSettingsCache()
}

export function clearSettingsCache() {
  _cached = null
}
