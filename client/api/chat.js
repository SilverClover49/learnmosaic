import { client, uuid } from './db.js'

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { session_id, message } = req.body
  if (!session_id || !message) {
    return res.status(400).json({ error: 'session_id and message required' })
  }

  try {
    // Get session
    const session = await client.execute({
      sql: 'SELECT * FROM sessions WHERE id = ?',
      args: [session_id]
    })
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }
    const sess = session.rows[0]

    // Save user message
    const userMsgId = uuid()
    await client.execute({
      sql: 'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      args: [userMsgId, session_id, 'user', message]
    })

    // Get chat history
    const messages = await client.execute({
      sql: 'SELECT * FROM messages WHERE session_id = ?',
      args: [session_id]
    })
    const chatHistory = messages.rows.map(m => ({ role: m.role, content: m.content }))

    // Call OpenRouter
    const systemPrompt = `You are LearnPath AI, a friendly learning assistant.
Student goal: ${sess.goal}
Student interests: ${sess.interests || 'Not specified'}
Timeframe: ${sess.timeframe || 'Flexible'}

Be helpful, encouraging, and educational. Use markdown for formatting.`

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-10)
        ]
      })
    })

    const aiData = await aiRes.json()
    const aiContent = aiData.choices?.[0]?.message?.content || 'Sorry, I had trouble responding.'

    // Save AI message
    const aiMsgId = uuid()
    await client.execute({
      sql: 'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      args: [aiMsgId, session_id, 'assistant', aiContent]
    })

    return res.status(200).json({ id: aiMsgId, role: 'assistant', content: aiContent })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
