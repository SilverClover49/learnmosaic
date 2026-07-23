import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import AmbientBackground from '../components/visuals/AmbientBackground'
import ColorPicker from '../components/visuals/ColorPicker'
import { api } from '../lib/api'

const PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', desc: 'Access GPT-4o, Claude, Llama and 300+ models' },
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4, GPT-3.5' },
  { id: 'ollama', name: 'Ollama', desc: 'Local models (requires Ollama running)' },
  { id: 'custom', name: 'Custom', desc: 'Any OpenAI-compatible endpoint' }
]

const MODELS_BY_PROVIDER = {
  openrouter: ['openai/gpt-4o-mini', 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.3-70b', 'google/gemini-2.0-flash-001'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
  ollama: ['llama3.2', 'llama3.1', 'mistral', 'phi3', 'qwen2.5'],
  custom: ['custom']
}

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    aiProvider: 'openrouter',
    aiModel: 'openai/gpt-4o-mini',
    apiKey: '',
    baseUrl: ''
  })
  const [saved, setSaved] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {})
  }, [])

  const update = (field, value) => {
    setSettings(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'aiProvider') {
        const models = MODELS_BY_PROVIDER[value] || MODELS_BY_PROVIDER.openrouter
        next.aiModel = models[0]
        if (value !== 'custom') next.baseUrl = ''
      }
      return next
    })
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      await api.saveSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  const testConnection = async () => {
    try {
      const res = await fetch('/api/settings/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error('Connection failed')
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // Error is silently handled — user sees no state change
    }
  }

  return (
    <PageTransition className="min-h-[100dvh] relative">
      <AmbientBackground />
      <div className="color-dna-strip z-10 relative">
        <div /><div /><div /><div /><div />
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setShowPicker(!showPicker)}
        className="fixed top-8 right-8 z-[var(--z-dropdown)] w-10 h-10 bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] flex items-center justify-center cursor-pointer hover:bg-[var(--bauhaus-red)] transition-all duration-200"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {showPicker && <ColorPicker onClose={() => setShowPicker(false)} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-6 py-16 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="text-xs uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--bauhaus-red)] mb-8 block cursor-pointer"
        >
          ← Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="type-h1 mb-2">Settings</h1>
          <p className="text-sm text-[var(--ink-muted)] mb-10">Configure your AI provider and API key</p>

          <div className="space-y-8">
            {/* Provider Selection */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-3">AI Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(p => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => update('aiProvider', p.id)}
                    className={`p-3 text-left border-2 transition-all duration-200 cursor-pointer ${
                      settings.aiProvider === p.id
                        ? 'bg-[var(--bauhaus-black)] text-white border-[var(--bauhaus-black)]'
                        : 'bg-[var(--surface)] border-[var(--bauhaus-black)] text-[var(--ink)] hover:bg-[var(--surface-alt)]'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider">{p.name}</div>
                    <div className="text-[10px] mt-1 opacity-70">{p.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">API Key</label>
              <input
                type="password"
                value={settings.apiKey}
                onChange={e => update('apiKey', e.target.value)}
                placeholder={settings.aiProvider === 'ollama' ? 'Not needed for local Ollama' : 'sk-...'}
                className="w-full px-4 py-3 border-2 border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] text-sm focus:outline-none focus:border-[var(--bauhaus-red)] transition-colors"
                disabled={settings.aiProvider === 'ollama'}
              />
            </div>

            {/* Model */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">Model</label>
              <select
                value={settings.aiModel}
                onChange={e => update('aiModel', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] text-sm focus:outline-none focus:border-[var(--bauhaus-red)] transition-colors cursor-pointer"
              >
                {(MODELS_BY_PROVIDER[settings.aiProvider] || MODELS_BY_PROVIDER.openrouter).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Base URL (custom only) */}
            {settings.aiProvider === 'custom' && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">Base URL</label>
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={e => update('baseUrl', e.target.value)}
                  placeholder="https://your-api.com/v1/chat/completions"
                  className="w-full px-4 py-3 border-2 border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] text-sm focus:outline-none focus:border-[var(--bauhaus-red)] transition-colors"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t-2 border-[var(--bauhaus-black)]">
              <Button onClick={handleSave}>
                {saved ? 'SAVED ✓' : 'SAVE'}
              </Button>
              <Button variant="secondary" onClick={testConnection}>
                TEST
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
