import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import ColorPicker from '../components/visuals/ColorPicker'

const taglines = [
  'ready to learn?',
  'ready to explore?',
  'ready to grow?',
  'ready to create?',
  'ready to discover?'
]

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function Landing() {
  const navigate = useNavigate()
  const [tagline, setTagline] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [hasSessions, setHasSessions] = useState(false)

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('learnmosaic-sessions') || '[]')
    setHasSessions(sessions.length > 0)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTagline(prev => (prev + 1) % taglines.length), 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col relative">
      {/* Color DNA Strip */}
      <div className="color-dna-strip">
        <div /><div /><div /><div /><div />
      </div>

      {/* Theme button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setShowPicker(!showPicker)}
        className="fixed top-8 right-8 z-[var(--z-dropdown)] w-10 h-10 bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] flex items-center justify-center cursor-pointer hover:bg-[var(--bauhaus-red)] transition-all duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {showPicker && <ColorPicker onClose={() => setShowPicker(false)} />}
      </AnimatePresence>

      {/* Main content - Asymmetric 40/60 split */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left column - Typography (40%) */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="lg:w-[40%] p-8 lg:p-16 flex flex-col justify-center border-r-[4px] border-[var(--bauhaus-black)]"
        >
          {/* Logo mark */}
          <motion.div variants={fadeUp} className="mb-12">
            <div className="w-20 h-20 bg-[var(--bauhaus-red)] flex items-center justify-center">
              <span className="text-4xl font-black text-[var(--bauhaus-white)]">L</span>
            </div>
          </motion.div>

          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="mb-6">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              SDG 4 — Quality Education
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={fadeUp}>
            <h1 className="type-display mb-6">
              LEARN
              <br />
              <span className="text-[var(--bauhaus-red)]">MOSAIC</span>
            </h1>
          </motion.div>

          {/* Rotating tagline */}
          <motion.div variants={fadeUp} className="h-16 mb-12">
            <AnimatePresence mode="wait">
              <motion.p
                key={tagline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-xl text-[var(--ink-muted)] font-light"
              >
                {taglines[tagline]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              START
            </Button>
            {hasSessions && (
              <Button variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
                VIEW SESSIONS
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Right column - Geometric composition (60%) */}
        <div className="lg:w-[60%] relative bg-[var(--surface)] flex items-center justify-center p-8 lg:p-16 overflow-hidden">
          {/* Geometric shapes */}
          <div className="relative w-full max-w-lg aspect-square">
            {/* Large circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-0 left-0 w-[70%] aspect-square bg-[var(--bauhaus-yellow)] rounded-full"
            />
            
            {/* Square */}
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute bottom-[10%] right-[10%] w-[50%] aspect-square bg-[var(--bauhaus-blue)]"
            />
            
            {/* Small circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute top-[30%] right-[20%] w-[25%] aspect-square bg-[var(--bauhaus-red)] rounded-full"
            />
            
            {/* Triangle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute bottom-[30%] left-[15%]"
            >
              <svg width="120" height="104" viewBox="0 0 120 104" fill="none">
                <path d="M60 0L120 104H0L60 0Z" fill="var(--bauhaus-black)" />
              </svg>
            </motion.div>

            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-[var(--bauhaus-black)] opacity-20" />
              <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-[var(--bauhaus-black)] opacity-20" />
              <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-[var(--bauhaus-black)] opacity-20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-[var(--bauhaus-black)] opacity-20" />
            </div>
          </div>

          {/* Vertical label */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 vertical-type text-[var(--ink-dim)]">
            FORM FOLLOWS FUNCTION
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="p-6 border-t-[4px] border-[var(--bauhaus-black)] flex justify-between items-center"
      >
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
          LearnMosaic · AI-Powered Learning
        </span>
        <div className="flex gap-4">
          <span className="w-4 h-4 bg-[var(--bauhaus-red)]" />
          <span className="w-4 h-4 bg-[var(--bauhaus-blue)]" />
          <span className="w-4 h-4 bg-[var(--bauhaus-yellow)]" />
        </div>
      </motion.div>
    </PageTransition>
  )
}
