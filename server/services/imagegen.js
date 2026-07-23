import 'dotenv/config'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function generateImage(prompt) {
  if (!OPENROUTER_API_KEY) return null
  try {
    const res = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Educational illustration for a child: ${prompt}`,
        n: 1,
        size: '1024x1024'
      })
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('Image gen error:', data)
      return null
    }
    return data.data?.[0]?.url || null
  } catch (e) {
    console.error('Image gen failed:', e.message)
    return null
  }
}
