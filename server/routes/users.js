import { Router } from 'express'
import { pb } from '../services/pb.js'

const router = Router()

router.post('/', async (req, res) => {
  const { name, age } = req.body
  if (!name || !age) return res.status(400).json({ error: 'Name and age required' })
  const ageNum = Number(age)
  if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) return res.status(400).json({ error: 'Age must be a number between 1 and 120' })
  try {
    const existing = await pb.findProfileByName(name)
    if (existing) return res.json({ id: existing.id, name: existing.name, age: existing.age, createdAt: existing.created })
    const profile = await pb.createProfile({ name, age: ageNum })
    res.json({ id: profile.id, name: profile.name, age: profile.age, createdAt: profile.created })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const profile = await pb.getProfile(req.params.id)
    if (!profile) return res.status(404).json({ error: 'User not found' })
    res.json({ id: profile.id, name: profile.name, age: profile.age, createdAt: profile.created })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const profile = await pb.getProfile(req.params.id)
    if (!profile) return res.status(404).json({ error: 'User not found' })

    // Delete all sessions + messages + milestones for this profile
    const sessions = await pb.listSessionsByProfile(req.params.id)
    for (const session of sessions) {
      await pb.deleteMessagesBySession(session.id)
      await pb.deleteMilestonesBySession(session.id)
      await pb.deleteSession(session.id)
    }

    // Delete profile
    await pb.deleteProfile(req.params.id)

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
