import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import Input from '../components/ui/Input'
import ProgressBar from '../components/ui/ProgressBar'
import AmbientBackground from '../components/visuals/AmbientBackground'
import { api } from '../lib/api'

const interests = [
  'Science', 'Technology', 'Mathematics', 'Art', 'Music',
  'Literature', 'History', 'Languages', 'Programming', 'Design',
  'Engineering', 'Business', 'Philosophy', 'Psychology'
]

const goals = [
  'Learn a new skill from scratch',
  'Prepare for an exam or certification',
  'Deepen knowledge in a field I already know',
  'Complete a specific project',
  'Explore a subject out of curiosity'
]

const stepIcons = [
  // Circle - identity
  <svg key="0" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2"/><circle cx="14" cy="10" r="4" fill="currentColor"/><path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2"/></svg>,
  // Triangle - interests
  <svg key="1" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3L26 25H2L14 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="14" cy="17" r="3" fill="currentColor"/></svg>,
  // Square - goal
  <svg key="2" width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="4" width="20" height="20" stroke="currentColor" strokeWidth="2"/><path d="M10 14l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/></svg>,
  // Diamond - timeframe
  <svg key="3" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 14L14 26L2 14L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="14" cy="14" r="4" fill="currentColor"/></svg>,
  // Star - review
  <svg key="4" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2l3.5 7.5L26 11l-6 5.5L21.5 25 14 20.5 6.5 25 8 16.5 2 11l8.5-1.5L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
]

const fadeSlide = {
  initial: { opacity: 0, x: 40, filter: 'blur(6px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -40, filter: 'blur(6px)' }
}

function FloatingShape({ type, size, color, x, y, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      {type === 'circle' && (
        <div className="rounded-full animate-float" style={{ width: size, height: size, backgroundColor: color, animationDelay: `${delay}s` }} />
      )}
      {type === 'square' && (
        <div className="animate-drift" style={{ width: size, height: size, backgroundColor: color, animationDelay: `${delay}s` }} />
      )}
      {type === 'triangle' && (
        <svg className="animate-float" style={{ animationDelay: `${delay}s` }} width={size} height={size} viewBox="0 0 100 100" fill="none">
          <path d="M50 0L100 100H0L50 0Z" fill={color} />
        </svg>
      )}
    </motion.div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [profile, setProfile] = useState({
    name: '', age: '', interests: [], goal: '', customGoal: '',
    timeframe: '', customInterest: ''
  })
  const [error, setError] = useState('')

  const totalSteps = 5

  const update = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const toggleInterest = (item) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter(i => i !== item)
        : [...prev.interests, item]
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 0: return profile.name.trim() && profile.age.trim()
      case 1: return profile.interests.length > 0 || profile.customInterest.trim()
      case 2: return profile.goal || profile.customGoal.trim()
      case 3: return profile.timeframe.trim()
      default: return true
    }
  }

  const nextStep = () => {
    if (!canProceed()) { setError('Please fill in all fields'); return }
    if (step < totalSteps - 1) setStep(s => s + 1)
    else handleCreate()
  }

  const handleCreate = async () => {
    setLoading(true)
    setLoadingMsg('MentorMind is building your learning world...')
    setLoadingProgress(10)

    const allInterests = [...profile.interests]
    if (profile.customInterest.trim()) allInterests.push(profile.customInterest.trim())
    const finalGoal = profile.goal === 'custom' ? profile.customGoal : profile.goal

    try {
      setLoadingMsg('Creating your profile...'); setLoadingProgress(25)
      const user = await api.createUser({ name: profile.name, age: parseInt(profile.age) })
      setLoadingMsg('Designing your curriculum...'); setLoadingProgress(50)
      const session = await api.createSession({
        userId: user.id, name: profile.name, age: parseInt(profile.age),
        interests: allInterests, goal: finalGoal, timeframe: profile.timeframe
      })
      setLoadingMsg('Setting up your personalized dashboard...'); setLoadingProgress(80)
      localStorage.setItem('learnmosaic-user', JSON.stringify(user))
      localStorage.setItem('learnmosaic-last-session', session.id)
      setLoadingProgress(100); setLoadingMsg('Ready! Taking you there...')
      setTimeout(() => navigate(`/session/${session.id}`), 600)
    } catch (e) {
      setError(e.message); setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageTransition className="min-h-[100dvh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <AmbientBackground />
        <div className="color-dna-strip fixed top-0 left-0 right-0 z-10">
          <div /><div /><div /><div /><div />
        </div>

        {/* Floating background shapes */}
        <FloatingShape type="circle" size={120} color="var(--bauhaus-yellow)" x="10%" y="20%" delay={0} />
        <FloatingShape type="square" size={80} color="var(--bauhaus-red)" x="80%" y="30%" delay={0.2} />
        <FloatingShape type="triangle" size={100} color="var(--bauhaus-blue)" x="70%" y="70%" delay={0.4} />

        <div className="relative z-10 text-center max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-24 h-24 mx-auto mb-10 bg-[var(--bauhaus-red)] flex items-center justify-center relative"
          >
            <div className="w-10 h-10 border-[3px] border-[var(--bauhaus-white)] border-t-transparent animate-spin" />
            <div className="absolute inset-0 border-[3px] border-[var(--bauhaus-red)] animate-spin-slow opacity-30" style={{ animationDirection: 'reverse', margin: '-8px' }} />
          </motion.div>
          <motion.p
            key={loadingMsg}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="text-lg font-medium mb-8"
          >
            {loadingMsg}
          </motion.p>
          <ProgressBar value={loadingProgress} color="red" className="mb-4" />
          <p className="text-xs text-[var(--ink-muted)] uppercase tracking-wider">
            {loadingProgress < 50 ? 'Analyzing your goals...' :
             loadingProgress < 80 ? 'Generating curriculum...' : 'Almost there...'}
          </p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <AmbientBackground />
      <div className="color-dna-strip z-10 relative">
        <div /><div /><div /><div /><div />
      </div>

      {/* Top bar with back button */}
      <div className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] px-6 py-3 flex items-center justify-between relative z-20">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => navigate('/dashboard')}
          className="text-xs uppercase tracking-wider hover:text-[var(--bauhaus-yellow)] transition-colors cursor-pointer"
        >
          ← Dashboard
        </motion.button>
        <span className="text-xs font-medium uppercase tracking-wider opacity-60">
          New Session
        </span>
        <div className="w-20" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {/* Left column - Step indicator (20%) */}
        <div className="lg:w-[20%] p-8 border-r-[4px] border-[var(--bauhaus-black)] bg-[var(--surface)]/80 backdrop-blur-sm hidden lg:flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              Step {step + 1} of {totalSteps}
            </span>
            <div className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bauhaus-red)' }}>
              {Math.round(((step + 1) / totalSteps) * 100)}%
            </div>
          </div>

          <div className="space-y-6">
            {['You', 'Interests', 'Goal', 'Timeframe', 'Review'].map((label, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{
                    backgroundColor: i === step ? 'var(--bauhaus-red)' : i < step ? 'var(--bauhaus-black)' : 'transparent',
                    scale: i === step ? 1.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-4 h-4 flex items-center justify-center border-[2px] border-[var(--bauhaus-black)]"
                >
                  {i < step && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      width="8" height="8" viewBox="0 0 8 8" fill="none"
                    >
                      <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
                    </motion.svg>
                  )}
                </motion.div>
                <span className={`text-xs uppercase tracking-wider transition-all duration-200 ${
                  i === step ? 'font-bold' : 'text-[var(--ink-muted)]'
                }`}>
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-xs text-[var(--ink-dim)] uppercase tracking-wider">
            LearnMosaic
          </div>
        </div>

        {/* Right column - Content (80%) */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile progress */}
            <div className="lg:hidden mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
                  Step {step + 1} of {totalSteps}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bauhaus-red)' }}>
                  {Math.round(((step + 1) / totalSteps) * 100)}%
                </span>
              </div>
              <ProgressBar value={((step + 1) / totalSteps) * 100} color="red" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={fadeSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Step 0: Name & Age */}
                {step === 0 && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-yellow)] flex items-center justify-center"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="12" r="6" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                        <path d="M6 30c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                      </svg>
                    </motion.div>
                    <h2 className="type-h2 mb-3">NICE TO MEET YOU!</h2>
                    <p className="text-[var(--ink-muted)] mb-10">Tell us a bit about yourself so we can personalize your learning.</p>
                    <div className="space-y-5">
                      <Input label="WHAT'S YOUR NAME?" placeholder="Enter your name..." value={profile.name} onChange={e => update('name', e.target.value)} autoFocus />
                      <Input label="HOW OLD ARE YOU?" type="number" placeholder="Your age..." value={profile.age} onChange={e => update('age', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* Step 1: Interests */}
                {step === 1 && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: 90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-blue)] flex items-center justify-center"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="10" stroke="var(--bauhaus-white)" strokeWidth="2"/>
                        <circle cx="16" cy="16" r="4" fill="var(--bauhaus-white)"/>
                      </svg>
                    </motion.div>
                    <h2 className="type-h2 mb-3">WHAT INTERESTS YOU?</h2>
                    <p className="text-[var(--ink-muted)] mb-8">Pick a few things you're curious about.</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-5">
                      {interests.map((item, idx) => (
                        <motion.button
                          key={item}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03, duration: 0.3 }}
                          onClick={() => toggleInterest(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-2.5 text-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-medium
                            ${profile.interests.includes(item)
                              ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                              : 'border-[2px] border-[var(--bauhaus-black)] text-[var(--ink)] hover:bg-[var(--surface-alt)]'}`}
                        >
                          {item}
                        </motion.button>
                      ))}
                    </div>
                    <Input placeholder="Or type your own interest..." value={profile.customInterest} onChange={e => update('customInterest', e.target.value)} />
                  </div>
                )}

                {/* Step 2: Goal */}
                {step === 2 && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-red)] flex items-center justify-center"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect x="6" y="6" width="20" height="20" stroke="var(--bauhaus-white)" strokeWidth="2"/>
                        <path d="M12 16l3 3 5-6" stroke="var(--bauhaus-white)" strokeWidth="2" strokeLinecap="square"/>
                      </svg>
                    </motion.div>
                    <h2 className="type-h2 mb-3">WHAT'S YOUR GOAL?</h2>
                    <p className="text-[var(--ink-muted)] mb-8">What do you want to achieve?</p>
                    <div className="space-y-3">
                      {goals.map((item, idx) => (
                        <motion.button
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06, duration: 0.3 }}
                          onClick={() => update('goal', item)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left px-5 py-4 transition-all duration-200 cursor-pointer uppercase tracking-wider font-medium border-[2px] border-[var(--bauhaus-black)]
                            ${profile.goal === item
                              ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                              : 'text-[var(--ink)] hover:bg-[var(--surface-alt)]'}`}
                        >
                          {item}
                        </motion.button>
                      ))}
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: goals.length * 0.06, duration: 0.3 }}
                        onClick={() => update('goal', 'custom')}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-5 py-4 transition-all duration-200 cursor-pointer uppercase tracking-wider font-medium border-[2px] border-[var(--bauhaus-black)]
                          ${profile.goal === 'custom'
                            ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                            : 'text-[var(--ink)] hover:bg-[var(--surface-alt)]'}`}
                      >
                        SOMETHING ELSE...
                      </motion.button>
                      <AnimatePresence>
                        {profile.goal === 'custom' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Input placeholder="Describe your goal..." value={profile.customGoal} onChange={e => update('customGoal', e.target.value)} autoFocus />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Step 3: Timeframe */}
                {step === 3 && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-yellow)] flex items-center justify-center"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="12" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                        <path d="M16 8v8l5 5" stroke="var(--bauhaus-black)" strokeWidth="2" strokeLinecap="square"/>
                      </svg>
                    </motion.div>
                    <h2 className="type-h2 mb-3">WHAT'S YOUR TIMEFRAME?</h2>
                    <p className="text-[var(--ink-muted)] mb-8">How long do you want to spend on this?</p>
                    <div className="grid grid-cols-2 gap-0">
                      {[
                        { value: '1 day', label: '1', desc: 'Quick session' },
                        { value: '1 week', label: '7', desc: 'One week' },
                        { value: '1 month', label: '30', desc: 'One month' },
                        { value: '3 months', label: '90', desc: 'Deep dive' },
                        { value: '6 months', label: '180', desc: 'Long journey' },
                        { value: 'flexible', label: '∞', desc: 'No rush' }
                      ].map((t, idx) => (
                        <motion.button
                          key={t.value}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.06, duration: 0.3 }}
                          onClick={() => update('timeframe', t.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`px-4 py-5 text-center transition-all duration-200 cursor-pointer border-[2px] border-[var(--bauhaus-black)]
                            ${profile.timeframe === t.value
                              ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                              : 'bg-[var(--bauhaus-white)] hover:bg-[var(--surface-alt)]'}`}
                        >
                          <div className="text-2xl font-black mb-1">{t.label}</div>
                          <div className="text-xs font-bold uppercase tracking-wider">{t.value}</div>
                          <div className="text-[10px] text-[var(--ink-muted)] mt-1 uppercase tracking-wider">{t.desc}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-red)] flex items-center justify-center"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M6 16l7 7 13-14" stroke="var(--bauhaus-white)" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
                      </svg>
                    </motion.div>
                    <h2 className="type-h2 mb-3">READY TO BEGIN?</h2>
                    <p className="text-[var(--ink-muted)] mb-8">Here's your learning profile:</p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="border-[4px] border-[var(--bauhaus-black)] mb-8 text-left"
                    >
                      <div className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] px-5 py-3 text-xs font-bold uppercase tracking-wider">
                        Your Profile
                      </div>
                      <div className="p-5 space-y-3">
                        {[
                          { label: 'Name', value: profile.name },
                          { label: 'Age', value: profile.age },
                          { label: 'Interests', value: profile.interests.join(', ') || profile.customInterest },
                          { label: 'Goal', value: profile.goal === 'custom' ? profile.customGoal : profile.goal },
                          { label: 'Timeframe', value: profile.timeframe }
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className="flex justify-between py-2 border-b border-[var(--border-color)] last:border-0"
                          >
                            <span className="text-[var(--ink-muted)] text-sm uppercase tracking-wider">{item.label}</span>
                            <span className="font-medium text-right max-w-[60%]">{item.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex justify-between mt-10"
            >
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
                  ← BACK
                </Button>
              ) : <div />}
              <Button onClick={nextStep} disabled={!canProceed()}>
                {step === totalSteps - 1 ? 'BEGIN LEARNING' : 'CONTINUE →'}
              </Button>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[var(--bauhaus-red)] text-sm text-center mt-4 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
