const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-4o-mini'

export async function callAI({ system, messages, sessionId }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'LearnMosaic'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error: ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}
