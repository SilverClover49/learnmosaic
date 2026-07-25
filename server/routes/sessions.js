import { Router } from 'express'
import { createSession, getSession, listSessions, updateSession, deleteSession, createMessage, listMessages } from '../db.js'
import { callAI } from '../services/openrouter.js'

const router = Router()

// List sessions for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id
    if (!userId) return res.status(400).json({ error: 'user_id required' })
    const sessions = listSessions(userId)
    res.json(sessions)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Get single session with messages
router.get('/:id', async (req, res) => {
  try {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    
    const messages = listMessages(req.params.id)
    res.json({ ...session, chatHistory: messages })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Create session
router.post('/', async (req, res) => {
  try {
    const { user_id, goal, interests, timeframe } = req.body
    if (!user_id || !goal) return res.status(400).json({ error: 'user_id and goal required' })
    
    const session = createSession(user_id, goal, interests || [], timeframe || '')
    res.json(session)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update session
router.patch('/:id', async (req, res) => {
  try {
    const session = updateSession(req.params.id, req.body)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    deleteSession(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Send message and get AI response
router.post('/:id/message', async (req, res) => {
  try {
    const { message } = req.body
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    
    // Save user message
    createMessage(req.params.id, 'user', message)
    
    // Get chat history
    const messages = listMessages(req.params.id)
    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }))
    
    // Get AI response
    const systemPrompt = `You are LearnPath AI, a friendly learning assistant. 
    Student goal: ${session.goal}
    Student interests: ${session.interests?.join(', ') || 'Not specified'}
    Timeframe: ${session.timeframe || 'Flexible'}
    
    Be helpful, encouraging, and educational. Use markdown for formatting.`
    
    const aiResponse = await callAI({
      system: systemPrompt,
      messages: chatHistory.slice(-10),
      settings: {}
    })
    
    // Save AI response
    const savedMessage = createMessage(req.params.id, 'assistant', aiResponse.content || aiResponse)
    
    res.json(savedMessage)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
