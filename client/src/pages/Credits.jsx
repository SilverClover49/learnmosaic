import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import AmbientBackground from '../components/visuals/AmbientBackground'
import { api } from '../lib/api'

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

function ConfettiPiece({ delay, x, color }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{
        y: [0, 600],
        x: [x, x + (Math.random() - 0.5) * 200],
        opacity: [1, 1, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
      }}
      transition={{ duration: 2 + Math.random() * 2, delay, ease: 'easeIn' }}
      className="absolute top-0 pointer-events-none"
      style={{
        width: 8 + Math.random() * 8,
        height: 8 + Math.random() * 8,
        backgroundColor: color,
        left: '50%'
      }}
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

const confettiColors = ['var(--bauhaus-red)', 'var(--bauhaus-blue)', 'var(--bauhaus-yellow)', 'var(--bauhaus-black)']

export default function Credits() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    api.getCredits(id).then(d => { setData(d); setLoading(false); setShowConfetti(true) }).catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

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
    ? Math.round((new Date(data.completedAt) - new Date(data.createdAt)) / (1000 * 60 * 60 * 24))
    : 'ongoing'

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-32 relative overflow-hidden">
      <AmbientBackground />

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={Math.random() * 1.5}
              x={(Math.random() - 0.5) * window.innerWidth}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </div>
      )}

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(230,57,70,0.08) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(29,53,87,0.05) 0%, transparent 50%)'
        }}
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Trophy */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-10"
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
          className="text-xl text-[var(--ink-muted)] mb-16"
        >
          Congratulations, {data.name}!
        </motion.p>

        {/* Stats */}
        <motion.div
          custom={0.7}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-3 gap-0 mb-16 border-[4px] border-[var(--bauhaus-black)]"
        >
          {[
            { label: 'Goal', value: data.goal?.slice(0, 22) + '...', isNumber: false },
            { label: 'Duration', value: duration, suffix: duration === 'ongoing' ? '' : ' days', isNumber: typeof duration === 'number' },
            { label: 'Milestones', value: data.milestones?.length || 0, suffix: '', isNumber: true }
          ].map((stat, i) => (
            <div key={i} className={`p-6 ${i < 2 ? 'border-r-[4px] border-[var(--bauhaus-black)]' : ''}`}>
              <div className="text-3xl font-black mb-1" style={{ color: 'var(--bauhaus-red)' }}>
                {stat.isNumber ? <CountUp target={stat.value} delay={0.8 + i * 0.2} /> : stat.value}
                {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
              </div>
              <div className="text-xs text-[var(--ink-muted)] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          custom={0.9}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-left mb-16"
        >
          <h3 className="type-h3 mb-8 text-center">YOUR MILESTONES</h3>
          <div className="space-y-0 border-[4px] border-[var(--bauhaus-black)]">
            {(data.milestones || []).map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.15, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className={`flex items-start gap-4 p-5 ${i < data.milestones.length - 1 ? 'border-b-[2px] border-[var(--bauhaus-black)]' : ''}`}
              >
                <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-[var(--accent-soft)]">
                  {m.type === 'session_start' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v12M2 8l6-6 6 6" stroke="var(--bauhaus-red)" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                  ) : m.type === 'achievement' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5Z" fill="var(--bauhaus-yellow)"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2v12h12" stroke="var(--bauhaus-blue)" strokeWidth="1.5" strokeLinecap="square"/>
                      <path d="M5 10l3-3 3 3" stroke="var(--bauhaus-blue)" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-sm">{m.description}</p>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">{new Date(m.timestamp).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
            {(!data.milestones || data.milestones.length === 0) && (
              <div className="p-8 text-center text-[var(--ink-muted)] text-sm">No milestones recorded.</div>
            )}
          </div>
        </motion.div>

        {/* Review Cards */}
        {data.reviewCards && (
          <motion.div
            custom={1.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-left mb-16"
          >
            <h3 className="type-h3 mb-8 text-center">REVIEW</h3>
            <div className="p-[2px] rounded-[var(--radius-xl)]" style={{ background: 'var(--glass-border)' }}>
              <div className="rounded-[calc(var(--radius-xl)-2px)] p-6"
                style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}
              >
                <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ '--tw-prose-body': 'var(--ink)', '--tw-prose-headings': 'var(--ink)', '--tw-prose-bold': 'var(--ink)' }}
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
      </div>
    </PageTransition>
  )
}
