import { Router } from 'express'
import { pb } from '../services/pb.js'
import { callAI } from '../services/openrouter.js'
import { getSettings, getSettingsSafe, saveGlobalSettings, saveProfileSettings, clearSettingsCache } from '../services/settings.js'

const router = Router()

// GET /api/settings — return settings (masked keys, never raw)
router.get('/', async (req, res) => {
  try {
    const s = await getSettingsSafe()
    res.json(s)
  } catch (e) {
    res.json({ aiProvider: 'openrouter', aiModel: 'openai/gpt-4o-mini', apiKey: '', baseUrl: '', hasApiKey: false })
  }
})

// GET /api/settings/check — quick check if API is configured
router.get('/check', async (req, res) => {
  try {
    const s = await getSettings()
    res.json({
      configured: !!(s.apiKey || s.aiProvider === 'ollama'),
      provider: s.aiProvider,
      hasGlobalKey: s._hasGlobalKey,
      hasProfileKey: s._hasProfileKey
    })
  } catch {
    res.json({ configured: false })
  }
})

// PUT /api/settings — update settings (global or profile-specific)
router.put('/', async (req, res) => {
  const { aiProvider, aiModel, apiKey, baseUrl, global: isGlobal } = req.body
  try {
    const profiles = await pb.listProfiles()

    if (isGlobal) {
      // Save to global settings collection
      await saveGlobalSettings({ aiProvider, aiModel, apiKey, baseUrl })
    } else {
      // Save to first profile (or create one if none exists)
      if (profiles.length > 0) {
        await saveProfileSettings(profiles[0].id, { aiProvider, aiModel, apiKey, baseUrl })
      } else {
        await saveGlobalSettings({ aiProvider, aiModel, apiKey, baseUrl })
      }
    }

    clearSettingsCache()
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/settings/test-ai — test AI provider connection
router.post('/test-ai', async (req, res) => {
  const { aiProvider, aiModel, apiKey, baseUrl } = req.body
  try {
    const reply = await callAI({
      system: 'You are a test bot. Reply with exactly: "OK"',
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      settings: { aiProvider, aiModel, apiKey, baseUrl }
    })
    res.json({ success: true, reply })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

export default router
