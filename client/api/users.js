import { client, uuid } from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    // List users
    const result = await client.execute('SELECT * FROM users')
    return res.status(200).json(result.rows)
  }

  if (req.method === 'POST') {
    const { name, age } = req.body
    if (!name || !age) return res.status(400).json({ error: 'Name and age required' })

    // Check if user exists
    const existing = await client.execute({
      sql: 'SELECT * FROM users WHERE name = ?',
      args: [name]
    })
    if (existing.rows.length > 0) {
      return res.status(200).json(existing.rows[0])
    }

    // Create new user
    const id = uuid()
    await client.execute({
      sql: 'INSERT INTO users (id, name, age) VALUES (?, ?, ?)',
      args: [id, name, Number(age)]
    })

    return res.status(201).json({ id, name, age: Number(age) })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
