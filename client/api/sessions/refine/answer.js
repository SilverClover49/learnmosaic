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

  const { sessionId, answer, history } = req.body
  if (!answer) {
    return res.status(400).json({ error: 'Answer required' })
  }

  try {
    const context = history 
      ? history.map((h, i) => `Q${i+1}: ${h.question}\nA: ${h.answer}`).join('\n')
      : answer

    // Check if we should complete (after 3 questions)
    const questionCount = history?.length || 0
    
    if (questionCount >= 2) {
      // Complete - generate refined goal
      const systemPrompt = `You are a learning goal refinement assistant.
Original context: ${context}
User's final answer: ${answer}

Based on all answers, provide a refined, specific learning goal.
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
            { role: 'user', content: `Refine my learning goal based on: ${context}` }
          ]
        })
      })

      const aiData = await aiRes.json()
      const refinedGoal = aiData.choices?.[0]?.message?.content || 'Learn programming'

      return res.status(200).json({
        complete: true,
        refinedGoal,
        question: null,
        options: []
      })
    }

    // Not complete - generate next question
    const systemPrompt = `You are a learning goal refinement assistant.
Previous context: ${context}
User's latest answer: ${answer}

Generate the next follow-up question with 3-4 multiple choice options.
The question should help understand their learning style or time commitment.

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
          { role: 'user', content: `Next question based on: ${context}` }
        ]
      })
    })

    const aiData = await aiRes.json()
    const content = aiData.choices?.[0]?.message?.content || '{}'
    
    let result
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        question: "How do you prefer to learn?",
        options: ["Video tutorials", "Text documentation", "Hands-on practice"]
      }
    } catch {
      result = {
        question: "How do you prefer to learn?",
        options: ["Video tutorials", "Text documentation", "Hands-on practice"]
      }
    }

    return res.status(200).json({
      complete: false,
      question: result.question,
      options: result.options,
      step: questionCount + 2,
      totalSteps: 3
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
