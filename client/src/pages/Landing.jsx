import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { useTheme } from '../lib/ThemeProvider'

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
  const { theme, setTheme } = useTheme()
  const [tagline, setTagline] = useState(0)
  const [users, setUsers] = useState([])
  const [showUsers, setShowUsers] = useState(false)

  useEffect(() => {
    api.listUsers().then(setUsers).catch(() => console.warn('Failed to load users'))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTagline(prev => (prev + 1) % taglines.length), 3500)
    return () => clearInterval(interval)
  }, [])

  const handleContinue = (user) => {
    localStorage.setItem('learnmosaic-user', JSON.stringify(user))
    navigate('/dashboard')
  }

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col relative">
      {/* Dark/Light mode toggle - top right */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme({ darkMode: !theme.darkMode })}
        className={`absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center border-[3px] border-[var(--bauhaus-black)] cursor-pointer transition-all duration-200 ${
          theme.darkMode ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-yellow)]' : 'bg-[var(--bauhaus-white)] text-[var(--bauhaus-black)]'
        }`}
        title={theme.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          {theme.darkMode ? (
            <>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </>
          ) : (
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          )}
        </svg>
      </motion.button>

      {/* Color DNA Strip */}
      <div className="color-dna-strip">
        <div /><div /><div /><div /><div />
      </div>

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
            {users.length > 0 && (
              <Button variant="secondary" size="md" onClick={() => setShowUsers(!showUsers)}>
                {showUsers ? 'HIDE PROFILES' : 'CONTINUE'}
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Right column - Geometric composition (60%) */}
        <div className="lg:w-[60%] relative bg-[var(--surface)] flex items-center justify-center p-8 lg:p-16 overflow-hidden">
          {showUsers && users.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <h3 className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-6 font-bold">Your Profiles</h3>
              <div className="space-y-3">
                {users.map((u, i) => (
                  <motion.button
                    key={u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContinue(u)}
                    className="w-full flex items-center gap-4 p-5 border-[2px] border-[var(--bauhaus-black)] bg-[var(--surface)] hover:bg-[var(--bauhaus-yellow)] text-left cursor-pointer transition-all duration-200"
                  >
                    <div className="w-14 h-14 bg-[var(--bauhaus-red)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-[var(--bauhaus-white)]">{u.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold uppercase tracking-wider">{u.name}</div>
                      <div className="text-xs text-[var(--ink-muted)]">Age {u.age}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                    </svg>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="relative w-full max-w-lg aspect-square">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-0 left-0 w-[70%] aspect-square bg-[var(--bauhaus-yellow)] rounded-full"
              />
              <motion.div
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 45 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute bottom-[10%] right-[10%] w-[50%] aspect-square bg-[var(--bauhaus-blue)]"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute top-[30%] right-[20%] w-[25%] aspect-square bg-[var(--bauhaus-red)] rounded-full"
              />
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
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-[var(--bauhaus-black)] opacity-20" />
                <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-[var(--bauhaus-black)] opacity-20" />
                <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-[var(--bauhaus-black)] opacity-20" />
                <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-[var(--bauhaus-black)] opacity-20" />
              </div>
            </div>
          )}
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
        className="p-6 border-t-[4px] border-[var(--bauhaus-black)] bg-[var(--bg)] flex justify-between items-center"
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
