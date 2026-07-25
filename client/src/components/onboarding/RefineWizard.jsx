import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import { api } from '../../lib/api'

const chipColors = ['red', 'blue', 'yellow']

const chipColorMap = {
  red: { bg: 'var(--bauhaus-red)', text: 'var(--bauhaus-white)' },
  blue: { bg: 'var(--bauhaus-blue)', text: 'var(--bauhaus-white)' },
  yellow: { bg: 'var(--bauhaus-yellow)', text: 'var(--bauhaus-black)' },
}

export default function RefineWizard({ goal, interests, onComplete, onBack }) {
  const [sessionId, setSessionId] = useState(null)
  const [history, setHistory] = useState([])
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState([])
  const [step, setStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(4)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState('Asking the AI...')
  const [customMode, setCustomMode] = useState(false)
  const [customText, setCustomText] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    startRefinement()
  }, [])

  const startRefinement = async () => {
    setLoading(true)
    setLoadingMsg('Analyzing your goal...')
    try {
      const res = await fetch('/api/sessions/refine/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, interests })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSessionId(data.sessionId)
      setQuestion(data.question)
      setOptions(data.options || [])
      setStep(data.step || 1)
      setTotalSteps(data.totalSteps || 3)
    } catch (e) {
      setError('Failed to start refinement: ' + e.message)
    }
    setLoading(false)
  }

  const handleAnswer = async (answer) => {
    setLoading(true)
    setLoadingMsg('Thinking...')
    setCustomMode(false)
    setCustomText('')
    try {
      const res = await fetch('/api/sessions/refine/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer, history })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setHistory(prev => [...prev, { question, answer }])

      if (data.complete) {
        setLoadingMsg('Building your curriculum...')
        onComplete({
          refinedGoal: data.refinedGoal || goal,
          curriculum: data.curriculum,
          checklist: data.checklist,
        })
      } else {
        setQuestion(data.question)
        setOptions(data.options || [])
        setStep(data.step || step + 1)
        setTotalSteps(data.totalSteps || totalSteps)
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      handleAnswer(customText.trim())
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto mb-6 border-[3px] border-[var(--bauhaus-blue)] border-t-transparent"
        />
        <p className="text-sm text-[var(--ink-muted)] uppercase tracking-wider">{loadingMsg}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-[var(--bauhaus-red)] mb-4">{error}</p>
        <Button variant="secondary" onClick={startRefinement}>TRY AGAIN</Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-3 h-3 transition-all duration-300 ${
              i < step ? 'bg-[var(--bauhaus-black)]' :
              i === step - 1 ? 'bg-[var(--bauhaus-red)] scale-125' :
              'bg-[var(--surface-alt)] border-[2px] border-[var(--bauhaus-black)]'
            }`}
          />
        ))}
        <span className="text-xs text-[var(--ink-muted)] ml-2 uppercase tracking-wider">
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* AI Question bubble */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-8"
      >
        <div className="inline-flex items-start gap-3 max-w-lg text-left">
          <div className="w-10 h-10 bg-[var(--bauhaus-red)] flex-shrink-0 flex items-center justify-center mt-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" fill="var(--bauhaus-white)"/>
              <circle cx="14" cy="6" r="3" fill="var(--bauhaus-white)"/>
              <polygon points="5,13 10,19 1,19" fill="var(--bauhaus-white)"/>
            </svg>
          </div>
          <div className="p-[2px] rounded-[var(--radius-lg)]" style={{ background: 'var(--glass-border)' }}>
            <div className="rounded-[calc(var(--radius-lg)-2px)] px-6 py-5"
              style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
              <p className="text-[var(--ink)] font-medium leading-relaxed">{question}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Option chips */}
      <div className="flex flex-wrap gap-3 justify-center max-w-lg mx-auto mb-4">
        {options.filter(o => !o.toLowerCase().includes('other')).map((option, idx) => {
          const colorKey = chipColors[idx % chipColors.length]
          const colors = chipColorMap[colorKey]
          return (
            <motion.button
              key={option}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
              className="px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 border-[2px] border-[var(--bauhaus-black)]"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {/* "Type your own" option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: options.length * 0.08 + 0.2 }}
        className="max-w-lg mx-auto"
      >
        {!customMode ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCustomMode(true); setTimeout(() => inputRef.current?.focus(), 100) }}
            className="px-6 py-3 text-sm font-medium uppercase tracking-wider cursor-pointer
              border-[2px] border-dashed border-[var(--bauhaus-black)] text-[var(--ink-muted)]
              hover:border-[var(--bauhaus-red)] hover:text-[var(--bauhaus-red)] transition-all duration-200"
          >
            Type your own...
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-3 border-[2px] border-[var(--bauhaus-black)] bg-[var(--surface)]
                text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--bauhaus-blue)] transition-colors"
              autoFocus
            />
            <Button size="sm" onClick={handleCustomSubmit} disabled={!customText.trim()}>
              GO
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Back button */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <button
            onClick={async () => {
              const prev = history[history.length - 1]
              setHistory(h => h.slice(0, -1))
              setLoading(true)
              setLoadingMsg('Going back...')
              try {
                const res = await fetch('/api/sessions/refine/answer', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId, answer: '__back__' })
                })
                if (res.ok) {
                  const data = await res.json()
                  setQuestion(data.question)
                  setOptions(data.options || [])
                  setStep(data.step || step - 1)
                  setTotalSteps(data.totalSteps || totalSteps)
                } else {
                  setQuestion(prev.question)
                  setStep(s => s - 1)
                }
              } catch {
                setQuestion(prev.question)
                setStep(s => s - 1)
              }
              setLoading(false)
            }}
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors uppercase tracking-wider cursor-pointer"
          >
            ← Go back to previous question
          </button>
        </motion.div>
      )}
    </div>
  )
}
