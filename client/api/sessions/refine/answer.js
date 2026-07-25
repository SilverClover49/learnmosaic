import { client, uuid } from '../db.js'

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

  const { sessionId, question, answer, originalGoal, allAnswers } = req.body
  if (!answer) {
    return res.status(400).json({ error: 'Answer required' })
  }

  try {
    // Build context from all answers
    const context = allAnswers 
      ? allAnswers.map((a, i) => `Question ${i+1}: ${a.question}\nAnswer: ${a.answer}`).join('\n')
      : answer

    // Call AI to refine the goal
    const systemPrompt = `You are a learning goal refinement assistant.
Original goal: ${originalGoal || 'Unknown'}
User context: ${context}

Based on the user's answers, provide a refined, specific learning goal.
The refined goal should be:
1. Specific and actionable
2. Aligned with their skill level
3. Realistic for their time commitment

Return ONLY the refined goal text, no other formatting.`
    
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
          { role: 'user', content: `Refine my learning goal based on my answers: ${context}` }
        ]
      })
    })

    const aiData = await aiRes.json()
    const refinedGoal = aiData.choices?.[0]?.message?.content || originalGoal

    return res.status(200).json({
      refinedGoal,
      originalGoal
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
