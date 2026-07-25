// Default API key is stored in Vercel environment variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      apiKey: process.env.OPENROUTER_API_KEY ? '••••••••' : '',
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
      hasDefaultKey: true,
      defaultKeyMasked: 'sk-or-v1••••••••'
    })
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { apiKey } = req.body
    if (apiKey) {
      process.env.OPENROUTER_API_KEY = apiKey
    }
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
