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

  const { goal, interests } = req.body
  if (!goal) {
    return res.status(400).json({ error: 'Goal required' })
  }

  try {
    // Create a refinement session
    const sessionId = uuid()
    
    // Call AI to generate refinement questions
    const systemPrompt = `You are a learning goal refinement assistant. 
The user wants to learn: ${goal}
Their interests: ${interests?.join(', ') || 'Not specified'}

Generate 3-5 follow-up questions to refine this learning goal.
Questions should help understand:
1. Specific skill level (beginner/intermediate/advanced)
2. Learning style preference (video/text/practice)
3. Time commitment
4. Specific outcomes they want

Return ONLY a JSON array of questions, no other text.`
    
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
          { role: 'user', content: `Help me refine my goal: ${goal}` }
        ]
      })
    })

    const aiData = await aiRes.json()
    const content = aiData.choices?.[0]?.message?.content || '[]'
    
    // Parse questions
    let questions
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [
        "What's your current skill level?",
        "How do you prefer to learn?",
        "How much time can you dedicate?"
      ]
    } catch {
      questions = [
        "What's your current skill level?",
        "How do you prefer to learn?",
        "How much time can you dedicate?"
      ]
    }

    return res.status(200).json({
      sessionId,
      questions,
      originalGoal: goal
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
