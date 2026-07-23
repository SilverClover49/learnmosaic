import { Router } from 'express'
import { pb } from '../services/pb.js'
import { callAI } from '../services/openrouter.js'
import { getSettings, clearSettingsCache } from '../services/settings.js'

const router = Router()

// GET /api/settings — return first profile's AI settings (or env fallback)
router.get('/', async (req, res) => {
  try {
    const s = await getSettings()
    res.json(s)
  } catch (e) {
    res.json({ aiProvider: 'openrouter', aiModel: 'openai/gpt-4o-mini', apiKey: '', baseUrl: '' })
  }
})

// PUT /api/settings — update first profile's AI settings
router.put('/', async (req, res) => {
  const { aiProvider, aiModel, apiKey, baseUrl } = req.body
  try {
    const profiles = await pb.listProfiles()
    if (profiles.length > 0) {
      await pb.updateProfile(profiles[0].id, { aiProvider, aiModel, apiKey, baseUrl })
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
