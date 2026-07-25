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
    const systemPrompt = `You are a learning goal refinement assistant.
The user wants to learn: ${goal}
Their interests: ${interests?.join(', ') || 'Not specified'}

Generate a follow-up question with 3-4 multiple choice options to refine this learning goal.
The question should help understand their skill level.

Return ONLY a JSON object with:
{
  "question": "the question text",
  "options": ["option1", "option2", "option3"]
}`
    
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
    const content = aiData.choices?.[0]?.message?.content || '{}'
    
    let result
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        question: "What's your current skill level?",
        options: ["Beginner", "Intermediate", "Advanced"]
      }
    } catch {
      result = {
        question: "What's your current skill level?",
        options: ["Beginner", "Intermediate", "Advanced"]
      }
    }

    return res.status(200).json({
      sessionId: 'refine-' + Date.now(),
      question: result.question,
      options: result.options,
      step: 1,
      totalSteps: 3
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
