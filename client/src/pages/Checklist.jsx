import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import { api } from '../lib/api'

export default function Checklist_() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`checklist-${id}`) || '[]')
    setChecked(saved)
    api.getSession(id).then(d => { setRaw(d.checklist || ''); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const toggleItem = (idx) => {
    setChecked(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      localStorage.setItem(`checklist-${id}`, JSON.stringify(next))
      return next
    })
  }

  const extractItems = () => {
    const lines = raw.split('\n')
    const items = []
    let idx = 0
    for (const line of lines) {
      const match = line.match(/^-\s\[.\]\s(.+)/)
      if (match) items.push({ text: match[1], index: idx++ })
    }
    return items
  }

  const items = extractItems()

  return (
    <PageTransition className="min-h-[100dvh] px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium mb-3"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>Checklist</span>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Your Progress</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/session/${id}`)}>← Back</Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-[2px] rounded-[var(--radius-xl)]" style={{ background: 'var(--glass-border)' }}>
                <div className="h-12 rounded-[calc(var(--radius-xl)-2px)] bg-[var(--surface)] animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 text-[var(--ink-muted)]">
            <p>No checklist items yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="p-[2px] rounded-[var(--radius-xl)] cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={checked.includes(item.index) ? { background: 'var(--accent2)' } : { background: 'var(--glass-border)' }}
                onClick={() => toggleItem(item.index)}
              >
                <div className="rounded-[calc(var(--radius-xl)-2px)] px-5 py-4 flex items-center gap-4"
                  style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${checked.includes(item.index) ? 'border-[var(--accent2)] bg-[var(--accent2)]' : 'border-[var(--ink-dim)]'}`}>
                    {checked.includes(item.index) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={checked.includes(item.index) ? 'line-through text-[var(--ink-muted)]' : ''}>
                    {item.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
