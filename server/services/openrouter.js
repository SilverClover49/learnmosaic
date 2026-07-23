const PROVIDERS = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'LearnMosaic'
    })
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  ollama: {
    baseUrl: 'http://127.0.0.1:11434/v1/chat/completions',
    headers: () => ({})
  }
}

function resolveSettings(settings) {
  const provider = settings?.aiProvider || process.env.AI_PROVIDER || 'openrouter'
  const apiKey = settings?.apiKey || process.env.OPENROUTER_API_KEY || ''
  const model = settings?.aiModel || process.env.AI_MODEL || 'openai/gpt-4o-mini'
  const baseUrl = settings?.baseUrl || ''

  if (provider === 'custom' && baseUrl) {
    return { url: baseUrl, headers: { 'Authorization': apiKey ? `Bearer ${apiKey}` : '', 'Content-Type': 'application/json' }, model }
  }

  const p = PROVIDERS[provider] || PROVIDERS.openrouter
  return {
    url: baseUrl || p.baseUrl,
    headers: { ...p.headers(apiKey), 'Content-Type': 'application/json' },
    model
  }
}

export async function* streamAI({ system, messages, tools, settings }) {
  const { url, headers, model } = resolveSettings(settings)

  const body = {
    model,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 4096,
    stream: true
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text()
    let msg = err
    try { const j = JSON.parse(err); msg = j.error?.message || j.error || msg } catch {}
    throw new Error(`${model} @ ${url}: ${msg}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) { yield { type: 'done' }; break }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue

      const data = trimmed.slice(6)
      if (data === '[DONE]') { yield { type: 'done' }; break }

      try {
        const parsed = JSON.parse(data)
        const choice = parsed.choices?.[0]
        if (!choice) continue

        const delta = choice.delta || {}

        if (delta.content) {
          yield { type: 'token', text: delta.content }
        }

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            yield { type: 'tool_call_chunk', index: tc.index, id: tc.id, function: tc.function }
          }
        }
      } catch {}
    }
    if (buffer.includes('[DONE]')) break
  }
}

export async function callAI({ system, messages, tools, settings }) {
  const { url, headers, model } = resolveSettings(settings)

  const body = {
    model,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 4096
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text()
    let msg = err
    try { const j = JSON.parse(err); msg = j.error?.message || j.error || msg } catch {}
    throw new Error(`${model} @ ${url}: ${msg}`)
  }

  const data = await res.json()
  return data.choices[0].message
}
