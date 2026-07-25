import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://learnmosaic-storage40.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODc1ODcxNzYsImlhdCI6MTc4NDk5NTE3NiwiaWQiOiIwMTlmOWEwMC00ZTAxLTdlNTAtYjNhOS0yZjI0NzUyNzc1ZWIiLCJraWQiOiJtbmZ1b09mU0l3a3RpOTUwZ3hsWlhCZ19nU0tpNHllX01LS1g5Z1VzbHBrIiwicmlkIjoiOWRiMmE3YzAtM2U3OC00YWQ5LThmNGYtNjY3MDVlNGJkOWQ0In0.TbJ53ySLFh61pKvO__1dX5W0AdF67gvJVTMXg6AxoLlv25kFxBmAl4sSscWyQYGZu38iirUb0Irj584IUGwHCw'
})

// Generate UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// Users
export async function createUser(name, age) {
  const id = uuid()
  await client.execute({
    sql: 'INSERT INTO users (id, name, age) VALUES (?, ?, ?)',
    args: [id, name, age]
  })
  return { id, name, age }
}

export async function getUser(id) {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  })
  return result.rows[0] || null
}

export async function listUsers() {
  const result = await client.execute('SELECT * FROM users')
  return result.rows
}

// Sessions
export async function createSession(userId, goal, interests, timeframe) {
  const id = uuid()
  const interestsStr = Array.isArray(interests) ? interests.join(',') : interests || ''
  await client.execute({
    sql: 'INSERT INTO sessions (id, user_id, goal, interests, timeframe) VALUES (?, ?, ?, ?, ?)',
    args: [id, userId, goal, interestsStr, timeframe || '']
  })
  return { id, user_id: userId, goal, interests: interestsStr, timeframe, status: 'active' }
}

export async function getSession(id) {
  const result = await client.execute({
    sql: 'SELECT * FROM sessions WHERE id = ?',
    args: [id]
  })
  return result.rows[0] || null
}

export async function listSessions(userId) {
  const result = await client.execute({
    sql: 'SELECT * FROM sessions WHERE user_id = ?',
    args: [userId]
  })
  return result.rows
}

export async function updateSession(id, updates) {
  const fields = []
  const values = []
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id') {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  }
  if (fields.length > 0) {
    values.push(id)
    await client.execute({
      sql: `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
      args: values
    })
  }
  return await getSession(id)
}

export async function deleteSession(id) {
  await client.execute({ sql: 'DELETE FROM messages WHERE session_id = ?', args: [id] })
  await client.execute({ sql: 'DELETE FROM milestones WHERE session_id = ?', args: [id] })
  await client.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [id] })
}

// Messages
export async function createMessage(sessionId, role, content) {
  const id = uuid()
  await client.execute({
    sql: 'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
    args: [id, sessionId, role, content]
  })
  return { id, session_id: sessionId, role, content }
}

export async function listMessages(sessionId) {
  const result = await client.execute({
    sql: 'SELECT * FROM messages WHERE session_id = ?',
    args: [sessionId]
  })
  return result.rows
}

// Milestones
export async function createMilestone(sessionId, title) {
  const id = uuid()
  await client.execute({
    sql: 'INSERT INTO milestones (id, session_id, title) VALUES (?, ?, ?)',
    args: [id, sessionId, title]
  })
  return { id, session_id: sessionId, title, completed: 0 }
}

export async function listMilestones(sessionId) {
  const result = await client.execute({
    sql: 'SELECT * FROM milestones WHERE session_id = ?',
    args: [sessionId]
  })
  return result.rows
}

export async function completeMilestone(id) {
  await client.execute({
    sql: 'UPDATE milestones SET completed = 1 WHERE id = ?',
    args: [id]
  })
  const result = await client.execute({
    sql: 'SELECT * FROM milestones WHERE id = ?',
    args: [id]
  })
  return result.rows[0] || null
}
