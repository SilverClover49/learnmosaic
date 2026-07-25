import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import AmbientBackground from '../components/visuals/AmbientBackground'
import { api } from '../lib/api'

const UNDO_SECONDS = 90

function CountUp({ target, duration = 2, delay = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView || typeof target !== 'number') return
    const timer = setTimeout(() => {
      let start = 0
      const increment = target / (duration * 60)
      const animate = () => {
        start += increment
        if (start >= target) { setCount(target); return }
        setCount(Math.floor(start))
        requestAnimationFrame(animate)
      }
      animate()
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, target, duration, delay])

  return <span ref={ref}>{count}</span>
}

function ConfettiShape({ delay, x, type, color }) {
  const style = {
    position: 'absolute',
    top: 0,
    pointerEvents: 'none',
    left: `calc(50% + ${x}px)`,
  }

  if (type === 'circle') {
    return (
      <motion.div
        initial={{ y: -20, opacity: 1, rotate: 0 }}
        animate={{ y: [0, window.innerHeight + 40], opacity: [1, 1, 0], rotate: [0, 360] }}
        transition={{ duration: 2.5 + Math.random() * 2, delay, ease: 'easeIn' }}
        style={{ ...style, width: 10 + Math.random() * 8, height: 10 + Math.random() * 8, borderRadius: '50%', backgroundColor: color }}
      />
    )
  }
  if (type === 'square') {
    return (
      <motion.div
        initial={{ y: -20, opacity: 1, rotate: 0 }}
        animate={{ y: [0, window.innerHeight + 40], opacity: [1, 1, 0], rotate: [0, 450] }}
        transition={{ duration: 2.5 + Math.random() * 2, delay, ease: 'easeIn' }}
        style={{ ...style, width: 8 + Math.random() * 8, height: 8 + Math.random() * 8, backgroundColor: color }}
      />
    )
  }
  return (
    <motion.div
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: [0, window.innerHeight + 40], opacity: [1, 1, 0], rotate: [0, 540] }}
      transition={{ duration: 2.5 + Math.random() * 2, delay, ease: 'easeIn' }}
      style={{ ...style, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: `10px solid ${color}`, backgroundColor: 'transparent' }}
    />
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: (delay) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay, duration: 0.8, ease: [0.32, 0.72, 0, 1] }
  })
}

const confettiColors = ['var(--bauhaus-red)', 'var(--bauhaus-blue)', 'var(--bauhaus-yellow)']
const shapeTypes = ['circle', 'square', 'triangle']

export default function Credits() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [undoTimeLeft, setUndoTimeLeft] = useState(UNDO_SECONDS)
  const [undoExpired, setUndoExpired] = useState(false)
  const [undoing, setUndoing] = useState(false)

  useEffect(() => {
    api.getCredits(id).then(d => { setData(d); setLoading(false); setShowConfetti(true) }).catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  useEffect(() => {
    if (undoExpired) return
    const interval = setInterval(() => {
      setUndoTimeLeft(prev => {
        if (prev <= 1) {
          setUndoExpired(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [undoExpired])

  const handleUndo = useCallback(async () => {
    if (undoing) return
    setUndoing(true)
    try {
      await api.undoComplete(id)
      navigate(`/session/${id}`)
    } catch {
      setUndoExpired(true)
      setUndoing(false)
    }
  }, [id, undoing, navigate])

  const undoMinutes = Math.floor(undoTimeLeft / 60)
  const undoSecs = undoTimeLeft % 60

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative">
        <AmbientBackground />
        <div className="relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-[3px] border-[var(--bauhaus-red)] border-t-transparent"
          />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <PageTransition className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
        <AmbientBackground />
        <div className="relative z-10 text-center">
          <h2 className="type-h2 mb-4">Journey not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </PageTransition>
    )
  }

  const duration = data.createdAt && data.completedAt
    ? Math.max(1, Math.round((new Date(data.completedAt) - new Date(data.createdAt)) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      <AmbientBackground />

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiShape
                key={i}
                delay={Math.random() * 2}
                x={(Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerWidth : 1200)}
                type={shapeTypes[i % 3]}
                color={confettiColors[i % 3]}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(230,57,70,0.08) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(29,53,87,0.05) 0%, transparent 50%)'
        }}
      />

      {/* Undo Banner */}
      <AnimatePresence>
        {!undoExpired && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[var(--z-toast)] bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]"
          >
            <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--bauhaus-red)] animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-white/70">
                  Undo available: <span className="text-[var(--bauhaus-white)] font-bold">{undoMinutes}:{undoSecs.toString().padStart(2, '0')}</span>
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUndo}
                disabled={undoing}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[var(--bauhaus-red)] text-[var(--bauhaus-white)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                {undoing ? 'RESTORING...' : 'UNDO'}
              </motion.button>
            </div>
            <div className="h-[2px] bg-[var(--bauhaus-red)]" style={{ width: `${(undoTimeLeft / UNDO_SECONDS) * 100}%`, transition: 'width 1s linear' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Floating Shapes (Kandinsky decoration) */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { type: 'circle', size: 24, color: 'var(--bauhaus-blue)' },
            { type: 'square', size: 22, color: 'var(--bauhaus-red)' },
            { type: 'triangle', size: 21, color: 'var(--bauhaus-yellow)' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 0.3 + i * 0.15 }, y: { delay: 0.3 + i * 0.15, duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
              className="flex items-center justify-center"
              style={{ width: s.size + 8, height: s.size + 8 }}
            >
              {s.type === 'circle' && <div style={{ width: s.size, height: s.size, borderRadius: '50%', backgroundColor: s.color }} />}
              {s.type === 'square' && <div style={{ width: s.size, height: s.size, backgroundColor: s.color }} />}
              {s.type === 'triangle' && <div style={{ width: 0, height: 0, borderLeft: `${s.size/2}px solid transparent`, borderRight: `${s.size/2}px solid transparent`, borderBottom: `${s.size}px solid ${s.color}` }} />}
            </motion.div>
          ))}
        </div>

        {/* Trophy */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 mx-auto bg-[var(--bauhaus-yellow)] flex items-center justify-center relative"
          >
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path d="M16 8h24v20c0 8-5.4 14-12 14s-12-6-12-14V8Z" stroke="var(--bauhaus-black)" strokeWidth="2.5"/>
              <path d="M16 14H8c0 8 4 12 8 12" stroke="var(--bauhaus-black)" strokeWidth="2"/>
              <path d="M40 14h8c0 8-4 12-8 12" stroke="var(--bauhaus-black)" strokeWidth="2"/>
              <rect x="22" y="42" width="12" height="4" fill="var(--bauhaus-black)"/>
              <rect x="18" y="46" width="20" height="3" fill="var(--bauhaus-black)"/>
              <path d="M24 18l4 4 4-4" stroke="var(--bauhaus-black)" strokeWidth="2" strokeLinecap="square"/>
            </svg>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-[3px] border-[var(--bauhaus-yellow)]"
              style={{ margin: '-12px' }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          custom={0.15}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--bauhaus-yellow)] mb-3"
        >
          Milestone Reached
        </motion.div>

        <motion.h1
          custom={0.3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="type-display mb-4"
        >
          JOURNEY COMPLETE
        </motion.h1>

        <motion.p
          custom={0.5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-xl text-[var(--ink-muted)] mb-12"
        >
          Congratulations, {data.name}!
        </motion.p>

        {/* Stats */}
        <motion.div
          custom={0.7}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-3 gap-0 mb-16 border-[4px] border-[var(--border-color)]"
        >
          {[
            { shape: 'circle', color: 'var(--bauhaus-blue)', label: 'Messages', value: data.chatCount || 0, isNumber: true },
            { shape: 'square', color: 'var(--bauhaus-red)', label: 'Milestones', value: data.milestones?.length || 0, isNumber: true },
            { shape: 'triangle', color: 'var(--bauhaus-yellow)', label: 'Days', value: duration, isNumber: true },
          ].map((stat, i) => (
            <div key={i} className={`p-6 ${i < 2 ? 'border-r-[4px] border-[var(--border-color)]' : ''}`}>
              <div className="flex justify-center mb-3">
                {stat.shape === 'circle' && <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: stat.color }} />}
                {stat.shape === 'square' && <div style={{ width: 14, height: 14, backgroundColor: stat.color }} />}
                {stat.shape === 'triangle' && <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `14px solid ${stat.color}` }} />}
              </div>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>
                {stat.isNumber ? <CountUp target={stat.value} delay={0.8 + i * 0.2} /> : stat.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--ink-muted)]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Journey Timeline */}
        <motion.div
          custom={0.9}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-left mb-16"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-6 text-center">YOUR JOURNEY SO FAR</h3>
          <div className="space-y-0 border-[4px] border-[var(--border-color)]">
            {(data.milestones || []).slice(0, 8).map((m, i) => {
              const colors = ['var(--bauhaus-blue)', 'var(--bauhaus-red)', 'var(--bauhaus-yellow)']
              const c = colors[i % 3]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className={`flex items-center gap-4 p-4 ${i < Math.min(data.milestones.length, 8) - 1 ? 'border-b-[1px] border-[var(--border-color)]' : ''}`}
                >
                  <div className="w-4 h-4 shrink-0" style={{
                    borderRadius: m.type === 'session_start' ? '50%' : m.type === 'achievement' ? '0' : '0',
                    backgroundColor: m.type === 'session_start' ? c : m.type === 'achievement' ? 'var(--bauhaus-yellow)' : c,
                    ...(m.type === 'achievement' ? {} : {})
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate"><strong className="font-bold">Step {(i + 1).toString().padStart(2, '0')}</strong> — {m.description}</p>
                  </div>
                </motion.div>
              )
            })}
            {(!data.milestones || data.milestones.length === 0) && (
              <div className="p-8 text-center text-[var(--ink-muted)] text-sm">No milestones recorded.</div>
            )}
          </div>
        </motion.div>

        {/* Review Cards */}
        {data.reviewCards && (
          <motion.div
            custom={1.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-left mb-16"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-6 text-center">REVIEW</h3>
            <div className="p-[2px] rounded-[var(--radius-xl)]" style={{ background: 'var(--glass-border)' }}>
              <div className="rounded-[calc(var(--radius-xl)-2px)] p-6"
                style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}
              >
                <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={{ color: 'var(--ink)' }}
                >
                  {data.reviewCards}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          custom={1.4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            View All Sessions
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/onboarding')}>
            Start New Journey
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          custom={1.6}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-16 pt-8 border-t-[1px] border-[var(--border-color)] flex items-center justify-between"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--ink-muted)]">
            LearnMosaic — SDG 4 Quality Education
          </span>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--bauhaus-blue)]" />
            <div className="w-3 h-3 bg-[var(--bauhaus-red)]" />
            <div className="w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid var(--bauhaus-yellow)' }} />
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
