import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import { callAI } from '../services/openrouter.js'
import { generateImage } from '../services/imagegen.js'
import { pb } from '../services/pb.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const promptsDir = path.join(__dirname, '..', 'prompts')
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')

async function loadPrompt(name) {
  return await fs.readFile(path.join(promptsDir, name), 'utf-8')
}

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
  const { userId, name, age, interests, goal, timeframe, materials } = req.body
  if (!name || !age || !goal) return res.status(400).json({ error: 'Missing required fields' })

  const now = new Date().toISOString()

  // Generate curriculum via AI
  const curriculumPrompt = await loadPrompt('curriculum.md')
  const curriculumSystem = curriculumPrompt
    .replace('{name}', name)
    .replace('{age}', String(age))
    .replace('{interests}', (interests || []).join(', '))
    .replace('{goal}', goal)
    .replace('{timeframe}', timeframe || 'flexible')

  let curriculum = ''
  try {
    curriculum = await callAI({
      system: curriculumSystem,
      messages: [{ role: 'user', content: `Generate a personalized curriculum for ${name} to achieve: ${goal}` }],
      sessionId: 'new'
    })
  } catch (e) {
    curriculum = `# Curriculum: ${goal}\n\n*Curriculum generation unavailable.*`
  }

  // Generate checklist via AI
  const checklistPrompt = await loadPrompt('checklist.md')
  const checklistSystem = checklistPrompt
    .replace('{goal}', goal)
    .replace('{curriculum_summary}', curriculum.slice(0, 1000))

  let checklist = ''
  try {
    checklist = await callAI({
      system: checklistSystem,
      messages: [{ role: 'user', content: `Generate a checklist for achieving: ${goal}` }],
      sessionId: 'new'
    })
  } catch (e) {
    checklist = `# Checklist: ${goal}\n\n- [ ] ${goal}`
  }

  const thinkingBoard = `# Thinking Board\n\n**Goal**: ${goal}\n**Started**: ${now}\n\n## Initial Thoughts\n\nThe AI tutor uses this space to log thoughts and observations.\n\n---\n`

  // Save to PocketBase
  const session = await pb.createSession({
    profileId: userId || 'anon',
    name, age: Number(age),
    interests: interests || [],
    goal, timeframe: timeframe || 'flexible',
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

// Chat with AI tutor
router.post('/:id/chat', async (req, res) => {
  const { message, history, currentTime, sessionDuration } = req.body
  let meta
  try { meta = await pb.getSession(req.params.id) } catch {}
  if (!meta) return res.status(404).json({ error: 'Session not found' })

  const now = currentTime ? new Date(currentTime) : new Date()
  const hours = now.getHours()
  let timeOfDay = hours >= 5 && hours < 12 ? 'morning' : hours >= 12 && hours < 17 ? 'afternoon' : hours >= 17 && hours < 21 ? 'evening' : 'night'

  const formatDuration = (secs) => {
    if (secs < 60) return `${secs}s`
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m < 60) return `${m}m${s > 0 ? ` ${s}s` : ''}`
    return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`
  }

  const tutorPrompt = await loadPrompt('tutor.md')
  const system = tutorPrompt
    .replace(/{name}/g, meta.name)
    .replace(/{age}/g, meta.age)
    .replace(/{interests}/g, (meta.interests || []).join(', '))
    .replace(/{goal}/g, meta.goal)
    .replace(/{timeframe}/g, meta.timeframe || 'flexible')
    .replace(/{curriculum_summary}/g, (meta.curriculum || '').slice(0, 800))
    .replace(/{checklist}/g, meta.checklist || '')
    .replace(/{current_date_time}/g, now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }))
    .replace(/{time_of_day}/g, timeOfDay)
    .replace(/{session_duration}/g, formatDuration(sessionDuration || 0))
    .replace(/{message_time}/g, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))

  const aiMessages = (history || []).concat([{ role: 'user', content: message }])

  try {
    const reply = await callAI({ system, messages: aiMessages, sessionId: req.params.id })
    const cleanReply = reply.replace(/\[MILESTONE:[^\]]*\]/g, '').trim()

    // Persist both messages
    await pb.createMessage({ sessionId: req.params.id, role: 'user', content: message })
    await pb.createMessage({ sessionId: req.params.id, role: 'assistant', content: cleanReply })

    // Check for milestones
    const milestoneMatch = reply.match(/\[MILESTONE:\s*(.*?)\]/)
    if (milestoneMatch) {
      await pb.addMilestone({ sessionId: req.params.id, type: 'achievement', description: milestoneMatch[1].trim() })
    }

    // Append to thinking board
    const boardEntry = `\n## ${now.toLocaleString()}\n\n**Student**: ${message.slice(0, 200)}\n\n**Tutor**: ${cleanReply.slice(0, 300)}...\n\n---\n`
    const updatedBoard = (meta.thinkingBoard || '') + boardEntry
    const newCount = (meta.chatCount || 0) + 1

    // Every 5 messages, summarize the thinking board
    let boardSummary = ''
    if (newCount > 0 && newCount % 5 === 0) {
      try {
        const summaryPrompt = await loadPrompt('summarize.md')
        boardSummary = await callAI({
          system: summaryPrompt,
          messages: [{ role: 'user', content: updatedBoard.slice(-3000) }],
          sessionId: req.params.id
        })
        await pb.updateSession(req.params.id, {
          thinkingBoard: `# Thinking Board (Summarized)\n\n${boardSummary}\n\n---\n${boardEntry}`,
          chatCount: newCount
        })
      } catch {
        await pb.updateSession(req.params.id, { thinkingBoard: updatedBoard, chatCount: newCount })
      }
    } else {
      await pb.updateSession(req.params.id, { thinkingBoard: updatedBoard, chatCount: newCount })
    }

    res.json({ reply: cleanReply })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Generate image
router.post('/:id/generate-image', async (req, res) => {
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })
  try {
    const url = await generateImage(prompt)
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
      reviewCards = await callAI({
        system: 'You generate concise review cards from learning sessions. Output plain Q&A pairs.',
        messages: [{ role: 'user', content: reviewPrompt }],
        sessionId: req.params.id
      })
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
    if (req.body.goal) updates.goal = req.body.goal
    if (req.body.favorite !== undefined) updates.favorite = req.body.favorite
    await pb.updateSession(req.params.id, updates)
    res.json({ success: true })
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

export default router
