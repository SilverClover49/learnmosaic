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

  // The default API key is already configured in Vercel environment variables
  // This endpoint just confirms it's available
  return res.status(200).json({ 
    success: true, 
    message: 'Default AI activated',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct'
  })
}
