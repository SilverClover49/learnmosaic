import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { callAI } from '../services/openrouter.js'
import { generateImage } from '../services/imagegen.js'
import { getSettings } from '../services/settings.js'
import { pb } from '../services/pb.js'
import { handleChat } from '../services/chat.js'
import { loadPrompt } from '../services/prompts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

const upload = multer({ dest: UPLOAD_DIR })

const router = Router()

// List all sessions
router.get('/', async (req, res) => {
  try {
    const data = await pb.listSessions()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// List all users (profiles)
router.get('/users', async (req, res) => {
  try {
    const data = await pb.listProfiles()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Get single session
router.get('/:id', async (req, res) => {
  try {
    const session = await pb.getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const messages = await pb.getMessages(req.params.id)
    res.json({ id: session.id, ...session, chatHistory: messages })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Create session
router.post('/', async (req, res) => {
  const { userId, name, age, interests, goal, subGoal, timeframe, materials } = req.body
  if (!goal) return res.status(400).json({ error: 'Missing required fields' })
  const displayName = name || 'Learner'
  let ageNum = null
  if (age != null && age !== '') {
    ageNum = Number(age)
    if (!Number.isFinite(ageNum) || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120)
      return res.status(400).json({ error: 'Age must be a whole number between 1 and 120' })
  }

  const now = new Date().toISOString()
  const fullGoal = goal + (subGoal ? ` — ${subGoal}` : '')

  // Generate curriculum via AI
  const curriculumPrompt = await loadPrompt('curriculum.md')
  const curriculumSystem = curriculumPrompt
    .replace('{name}', displayName)
    .replace('{age}', ageNum != null ? String(ageNum) : 'unknown')
    .replace('{interests}', (interests || []).join(', '))
    .replace('{goal}', fullGoal)
    .replace('{timeframe}', timeframe || 'flexible')

  const settings = await getSettings()
  let curriculum = ''
  try {
    const result = await callAI({
      system: curriculumSystem,
      messages: [{ role: 'user', content: `Generate a personalized curriculum for ${displayName} to achieve: ${fullGoal}` }],
      settings
    })
    curriculum = result.content || ''
  } catch (e) {
    curriculum = `# Curriculum: ${fullGoal}\n\n*Curriculum generation unavailable.*`
  }

  // Generate checklist via AI
  const checklistPrompt = await loadPrompt('checklist.md')
  const checklistSystem = checklistPrompt
    .replace('{goal}', fullGoal)
    .replace('{curriculum_summary}', curriculum.slice(0, 1000))

  let checklist = ''
  try {
    const result = await callAI({
      system: checklistSystem,
      messages: [{ role: 'user', content: `Generate a checklist for achieving: ${fullGoal}` }],
      settings
    })
    checklist = result.content || ''
  } catch (e) {
    checklist = `# Checklist: ${fullGoal}\n\n- [ ] ${fullGoal}`
  }

  const thinkingBoard = `# Thinking Board\n\n**Goal**: ${fullGoal}\n**Started**: ${now}\n\n## Initial Thoughts\n\nThe AI tutor uses this space to log thoughts and observations.\n\n---\n`

  // Save to PocketBase
  const session = await pb.createSession({
    profileId: userId || 'anon',
    name: displayName, age: ageNum,
    interests: interests || [],
    goal: fullGoal,
    timeframe: timeframe || 'flexible',
    subGoal: subGoal || '',
    status: 'active',
    materials: materials || [],
    curriculum, thinkingBoard, checklist
  })

  // Add start milestone
  await pb.addMilestone({
    sessionId: session.id,
    type: 'session_start',
    description: `Started learning journey: ${goal}`
  })

  res.json({ id: session.id, ...session })
})

// Chat with AI tutor — delegated to chat service
router.post('/:id/chat', handleChat)

// Generate image
router.post('/:id/generate-image', async (req, res) => {
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })
  try {
    const settings = await getSettings()
    const url = await generateImage(prompt, settings)
    if (!url) return res.status(503).json({ error: 'Image generation unavailable' })
    res.json({ url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Upload file
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })
  try {
    const meta = await pb.getSession(req.params.id)
    const materials = meta.materials || []
    materials.push({ filename: req.file.originalname, path: req.file.path, size: req.file.size })
    await pb.updateSession(req.params.id, { materials })
    res.json({ filename: req.file.originalname, size: req.file.size })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Complete session
router.post('/:id/complete', async (req, res) => {
  try {
    const meta = await pb.getSession(req.params.id)
    if (!meta) return res.status(404).json({ error: 'Session not found' })

    // Generate review cards
    let reviewCards = ''
    try {
      const messages = await pb.getMessages(req.params.id)
      const chatLog = messages.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n')
      const reviewPrompt = `Based on this learning session about "${meta.goal}" for ${meta.name}, generate 3-5 review questions and answers. Format each as:\n\nQ: [question]\nA: [answer]\n\nCurriculum covered:\n${(meta.curriculum || '').slice(0, 1500)}\n\nChat log:\n${chatLog.slice(0, 2000)}`
      const result = await callAI({
        system: 'You generate concise review cards from learning sessions. Output plain Q&A pairs.',
        messages: [{ role: 'user', content: reviewPrompt }],
        settings: await getSettings()
      })
      reviewCards = result.content || ''
    } catch {
      reviewCards = ''
    }

    await pb.updateSession(req.params.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      reviewCards
    })
    await pb.addMilestone({ sessionId: req.params.id, type: 'session_complete', description: `Completed learning journey: ${meta.goal}` })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Get end credits
router.get('/:id/credits', async (req, res) => {
  try {
    const meta = await pb.getSession(req.params.id)
    if (!meta) return res.status(404).json({ error: 'Session not found' })
    const milestones = await pb.getMilestones(req.params.id)
    res.json({
      name: meta.name, goal: meta.goal,
      createdAt: meta.created, completedAt: meta.completedAt || null,
      status: meta.status, milestones,
      curriculum: (meta.curriculum || '').slice(0, 500),
      board: (meta.thinkingBoard || '').slice(0, 500),
      reviewCards: meta.reviewCards || ''
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update session (rename, favorite toggle)
router.patch('/:id', async (req, res) => {
  try {
    const meta = await pb.getSession(req.params.id)
    if (!meta) return res.status(404).json({ error: 'Session not found' })
    const updates = {}
    if (req.body.name) updates.name = req.body.name
    if (req.body.goal) updates.goal = req.body.goal
    if (req.body.favorite !== undefined) updates.favorite = req.body.favorite
    await pb.updateSession(req.params.id, updates)
    const updated = await pb.getSession(req.params.id)
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    await pb.getSession(req.params.id) // verify exists
    await pb.deleteSession(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Undo complete (within 60 seconds)
router.post('/:id/undo-complete', async (req, res) => {
  try {
    const meta = await pb.getSession(req.params.id)
    if (!meta) return res.status(404).json({ error: 'Session not found' })
    if (meta.status !== 'completed') return res.status(400).json({ error: 'Session is not completed' })
    const elapsed = Date.now() - new Date(meta.completedAt).getTime()
    if (elapsed > 60000) return res.status(400).json({ error: 'Undo window expired (60s)' })
    await pb.updateSession(req.params.id, { status: 'active', completedAt: null })
    await pb.addMilestone({ sessionId: req.params.id, type: 'session_undo', description: 'Undid session completion' })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Suggest goal refinement prompts
router.post('/suggest-refine', async (req, res) => {
  const { goal } = req.body
  if (!goal) return res.status(400).json({ error: 'Goal is required' })
  const settings = await getSettings()
  try {
    const result = await callAI({
      system: 'You are a learning advisor. Given a learning goal, suggest 3-4 specific, actionable ways the student could refine or narrow down their focus. Keep each suggestion to 1 sentence, concise and specific. Number them 1-4.',
      messages: [{ role: 'user', content: `The student wants to: ${goal}\n\nSuggest 3-4 ways they could refine this goal.` }],
      settings
    })
    const lines = (result.content || '').split('\n').filter(l => l.trim())
    const suggestions = lines.map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
    res.json({ suggestions })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
