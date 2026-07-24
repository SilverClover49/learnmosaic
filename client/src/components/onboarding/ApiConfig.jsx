import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', desc: 'Access GPT-4o, Claude, Llama and 300+ models', icon: '◆' },
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4, GPT-3.5', icon: '●' },
  { id: 'ollama', name: 'Ollama', desc: 'Local models (requires Ollama running)', icon: '◎' },
  { id: 'custom', name: 'Custom', desc: 'Any OpenAI-compatible endpoint', icon: '◇' }
]

const MODELS = {
  openrouter: ['openai/gpt-4o-mini', 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.3-70b', 'google/gemini-2.0-flash-001'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
  ollama: ['llama3.2', 'llama3.1', 'mistral', 'phi3', 'qwen2.5'],
  custom: ['custom']
}

export default function ApiConfig({ onComplete }) {
  const [provider, setProvider] = useState('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('openai/gpt-4o-mini')
  const [baseUrl, setBaseUrl] = useState('')
  const [globalKey, setGlobalKey] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const models = MODELS[provider] || MODELS.openrouter
    if (!models.includes(model)) setModel(models[0])
  }, [provider])

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProvider: provider, aiModel: model, apiKey, baseUrl })
      })
      const data = await res.json()
      setTestResult(data.success ? 'success' : 'error')
    } catch {
      setTestResult('error')
    }
    setTesting(false)
  }

  const handleSaveAndContinue = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: provider,
          aiModel: model,
          apiKey,
          baseUrl,
          global: globalKey
        })
      })
      onComplete({ aiProvider: provider, aiModel: model, apiKey, baseUrl, global: globalKey })
    } catch (e) {
      onComplete({ aiProvider: provider, aiModel: model, apiKey, baseUrl, global: globalKey })
    }
    setSaving(false)
  }

  const handleSkip = () => {
    onComplete(null)
  }

  return (
    <div className="text-center max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 mx-auto mb-6 bg-[var(--bauhaus-blue)] flex items-center justify-center"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" stroke="var(--bauhaus-white)" strokeWidth="2"/>
          <path d="M16 10v6l4 2" stroke="var(--bauhaus-white)" strokeWidth="2" strokeLinecap="square"/>
        </svg>
      </motion.div>

      <h2 className="type-h2 mb-2">CONNECT YOUR AI</h2>
      <p className="text-sm text-[var(--ink-muted)] mb-8">
        LearnMosaic needs an AI provider to generate lessons, answer questions, and create content.
      </p>

      {/* Provider Selection */}
      <div className="text-left mb-6">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-3">AI Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map(p => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProvider(p.id)}
              className={`p-3 text-left border-2 transition-all duration-200 cursor-pointer ${
                provider === p.id
                  ? 'bg-[var(--bauhaus-black)] text-white border-[var(--bauhaus-black)]'
                  : 'bg-[var(--surface)] border-[var(--bauhaus-black)] text-[var(--ink)] hover:bg-[var(--surface-alt)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">{p.name}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{p.desc}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* API Key */}
      {provider !== 'ollama' && (
        <div className="text-left mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-or-v1-... or sk-..."
            className="w-full px-4 py-3 border-2 border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] text-sm focus:outline-none focus:border-[var(--bauhaus-red)] transition-colors"
          />
        </div>
      )}

      {provider === 'ollama' && (
        <div className="text-left mb-4 p-3 border-2 border-[var(--bauhaus-yellow)] bg-[var(--bauhaus-yellow)]/10 text-sm">
          Ollama runs locally on your machine. Make sure it's running on port 11434.
        </div>
      )}

      {/* Model */}
      <div className="text-left mb-4">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">Model</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] text-sm focus:outline-none focus:border-[var(--bauhaus-red)] transition-colors cursor-pointer"
        >
          {(MODELS[provider] || MODELS.openrouter).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Base URL (custom only) */}
      {provider === 'custom' && (
        <div className="text-left mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://your-api.com/v1/chat/completions"
            className="w-full px-4 py-3 border-2 border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] text-sm focus:outline-none focus:border-[var(--bauhaus-red)] transition-colors"
          />
        </div>
      )}

      {/* Global Key Toggle */}
      <div className="text-left mb-6 p-4 border-2 border-[var(--bauhaus-black)] bg-[var(--surface)]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={globalKey}
            onChange={e => setGlobalKey(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[var(--bauhaus-red)] cursor-pointer"
          />
          <div>
            <div className="text-sm font-bold uppercase tracking-wider">Make this available to all profiles</div>
            <div className="text-xs text-[var(--ink-muted)] mt-1">
              {globalKey
                ? 'Other profiles on this device can use this API key. They can choose to use it or set their own.'
                : 'This API key is only for your profile. Other profiles will need to configure their own.'}
            </div>
          </div>
        </label>
      </div>

      {/* Test Result */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 text-sm font-medium ${
            testResult === 'success'
              ? 'border-2 border-green-600 bg-green-50 text-green-800'
              : 'border-2 border-[var(--bauhaus-red)] bg-red-50 text-[var(--bauhaus-red)]'
          }`}
        >
          {testResult === 'success' ? '✓ Connection successful!' : '✗ Connection failed. Check your API key and try again.'}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleTest}
          disabled={testing || (provider !== 'ollama' && !apiKey.trim())}
          className="px-5 py-3 text-xs font-bold uppercase tracking-wider border-2 border-[var(--bauhaus-black)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {testing ? 'TESTING...' : 'TEST CONNECTION'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveAndContinue}
          disabled={saving || (provider !== 'ollama' && !apiKey.trim())}
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[var(--bauhaus-red)] text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
        >
          {saving ? 'SAVING...' : 'CONTINUE →'}
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSkip}
        className="mt-4 text-xs text-[var(--ink-muted)] underline hover:text-[var(--ink)] transition-colors cursor-pointer"
      >
        Skip for now — I'll configure later
      </motion.button>
    </div>
  )
}
