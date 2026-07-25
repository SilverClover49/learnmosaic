import { Router } from 'express'
import { createUser, getUser, listUsers, deleteSession, listSessions } from '../db.js'

const router = Router()

router.post('/', async (req, res) => {
  const { name, age } = req.body
  if (!name || !age) return res.status(400).json({ error: 'Name and age required' })
  const ageNum = Number(age)
  if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) return res.status(400).json({ error: 'Age must be 1-120' })
  try {
    // Check if user exists
    const users = listUsers()
    const existing = users.find(u => u.name.toLowerCase() === name.toLowerCase())
    if (existing) return res.json({ id: existing.id, name: existing.name, age: existing.age })
    
    const user = createUser(name, ageNum)
    res.json({ id: user.id, name: user.name, age: user.age })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = getUser(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ id: user.id, name: user.name, age: user.age })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const user = getUser(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    // Delete all sessions for this user
    const sessions = listSessions(req.params.id)
    for (const session of sessions) {
      deleteSession(session.id)
    }
    
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
