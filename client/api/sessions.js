import { client, uuid } from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query || {}

  if (req.method === 'GET' && !id) {
    // List sessions for user
    const userId = req.query.user_id
    if (!userId) return res.status(400).json({ error: 'user_id required' })
    const result = await client.execute({
      sql: 'SELECT * FROM sessions WHERE user_id = ?',
      args: [userId]
    })
    return res.status(200).json(result.rows)
  }

  if (req.method === 'GET' && id) {
    // Get session with messages
    const session = await client.execute({
      sql: 'SELECT * FROM sessions WHERE id = ?',
      args: [id]
    })
    if (session.rows.length === 0) return res.status(404).json({ error: 'Session not found' })

    const messages = await client.execute({
      sql: 'SELECT * FROM messages WHERE session_id = ?',
      args: [id]
    })

    return res.status(200).json({ ...session.rows[0], chatHistory: messages.rows })
  }

  if (req.method === 'POST') {
    const { user_id, goal, interests, timeframe } = req.body
    if (!user_id || !goal) return res.status(400).json({ error: 'user_id and goal required' })

    const id = uuid()
    await client.execute({
      sql: 'INSERT INTO sessions (id, user_id, goal, interests, timeframe) VALUES (?, ?, ?, ?, ?)',
      args: [id, user_id, goal, interests?.join(',') || '', timeframe || '']
    })

    return res.status(201).json({ id, user_id, goal, interests, timeframe, status: 'active' })
  }

  if (req.method === 'PATCH' && id) {
    const updates = req.body
    const fields = []
    const values = []
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') {
        fields.push(`${key} = ?`)
        values.push(typeof value === 'object' ? JSON.stringify(value) : value)
      }
    }
    if (fields.length > 0) {
      values.push(id)
      await client.execute({
        sql: `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
        args: values
      })
    }
    const updated = await client.execute({ sql: 'SELECT * FROM sessions WHERE id = ?', args: [id] })
    return res.status(200).json(updated.rows[0])
  }

  if (req.method === 'DELETE' && id) {
    await client.execute({ sql: 'DELETE FROM messages WHERE session_id = ?', args: [id] })
    await client.execute({ sql: 'DELETE FROM milestones WHERE session_id = ?', args: [id] })
    await client.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [id] })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
