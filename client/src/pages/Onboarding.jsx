import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import Input from '../components/ui/Input'
import ProgressBar from '../components/ui/ProgressBar'
import AmbientBackground from '../components/visuals/AmbientBackground'
import ApiConfig from '../components/onboarding/ApiConfig'
import { api } from '../lib/api'
import { useTheme } from '../lib/ThemeProvider'

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
  <svg key="-1" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2"/><circle cx="14" cy="14" r="4" fill="currentColor"/><path d="M14 2v4M14 22v4M2 14h4M22 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>,
  <svg key="0" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2"/><circle cx="14" cy="10" r="4" fill="currentColor"/><path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2"/></svg>,
  <svg key="1" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3L26 25H2L14 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="14" cy="17" r="3" fill="currentColor"/></svg>,
  <svg key="2" width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="4" width="20" height="20" stroke="currentColor" strokeWidth="2"/><path d="M10 14l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/></svg>,
  <svg key="3" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 14L14 26L2 14L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="14" cy="14" r="4" fill="currentColor"/></svg>,
  <svg key="4" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2l3.5 7.5L26 11l-6 5.5L21.5 25 14 20.5 6.5 25 8 16.5 2 11l8.5-1.5L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
]

const goalPrompts = {
  'Learn a new skill from scratch': "What skill would you like to learn? Tell me what excites you about it.",
  'Prepare for an exam or certification': "Which exam or certification are you preparing for? When is it?",
  'Deepen knowledge in a field I already know': "What field do you want to go deeper in? What level are you at now?",
  'Complete a specific project': "What project do you want to build? Describe what you have in mind.",
  'Explore a subject out of curiosity': "What subject are you curious about? What got you interested?"
}

const timeframes = [
  { value: '1 day', label: '1', desc: 'Quick session' },
  { value: '1 week', label: '7', desc: 'One week' },
  { value: '1 month', label: '30', desc: 'One month' },
  { value: '3 months', label: '90', desc: 'Deep dive' },
  { value: '6 months', label: '180', desc: 'Long journey' },
  { value: 'flexible', label: '\u221e', desc: 'No rush' }
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
  const { theme, setTheme } = useTheme()
  const [existingUser, setExistingUser] = useState(null)
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [apiConfigDone, setApiConfigDone] = useState(false)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [profile, setProfile] = useState({
    name: '', age: '', interests: [], goal: '', customGoal: '',
    subGoal: '', timeframe: '', customTimeframe: '', customInterest: ''
  })
  const [materials, setMaterials] = useState([])
  const [showMaterials, setShowMaterials] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const existingUserRaw = (() => {
    try { return JSON.parse(localStorage.getItem('learnmosaic-user')) } catch { return null }
  })()

  useEffect(() => {
    if (existingUserRaw) {
      setExistingUser(existingUserRaw)
      setStep(0)
    }
    // Check if API key is configured
    api.checkApi().then(s => {
      if (!s.configured) {
        setShowApiConfig(true)
      } else {
        setApiConfigDone(true)
      }
    }).catch(() => {
      setShowApiConfig(true)
    })
  }, [])

  const handleApiConfigComplete = (config) => {
    setApiConfigDone(true)
    setShowApiConfig(false)
  }

  const stepOffset = existingUser ? 1 : 0
  const hasApiStep = showApiConfig || apiConfigDone
  const totalSteps = hasApiStep ? (existingUser ? 6 : 7) : (existingUser ? 5 : 6)

  const stepLabels = hasApiStep
    ? (existingUser
        ? ['API', 'Interests', 'Goal', 'Refine', 'Timeframe', 'Review']
        : ['API', 'You', 'Interests', 'Goal', 'Refine', 'Timeframe', 'Review'])
    : (existingUser
        ? ['Interests', 'Goal', 'Refine', 'Timeframe', 'Review']
        : ['You', 'Interests', 'Goal', 'Refine', 'Timeframe', 'Review'])

  const stepIconsList = hasApiStep
    ? (existingUser ? stepIcons.slice(0, 6) : stepIcons.slice(0, 7))
    : (existingUser ? stepIcons.slice(1) : stepIcons.slice(1))

  const getDisplayStep = () => existingUser ? step : step

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
    const s = hasApiStep ? step - 1 : step
    if (existingUser) {
      switch (s) {
        case 0: return profile.interests.length > 0 || profile.customInterest.trim()
        case 1: return profile.goal || profile.customGoal.trim()
        case 2: return profile.subGoal.trim().length >= 3
        case 3: return profile.timeframe || profile.customTimeframe.trim()
        case 4: return true
        default: return true
      }
    }
    switch (s) {
      case 0: return profile.name.trim() && profile.age.trim()
      case 1: return profile.interests.length > 0 || profile.customInterest.trim()
      case 2: return profile.goal || profile.customGoal.trim()
      case 3: return profile.subGoal.trim().length >= 3
      case 4: return profile.timeframe || profile.customTimeframe.trim()
      case 5: return true
      default: return true
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    setMaterials(prev => [...prev, ...files])
  }

  const removeMaterial = (idx) => {
    setMaterials(prev => prev.filter((_, i) => i !== idx))
  }

  const nextStep = () => {
    if (!canProceed()) { setError('Please fill in all fields'); return }
    const lastStep = hasApiStep ? (existingUser ? 5 : 6) : (existingUser ? 4 : 5)
    if (step < lastStep) setStep(s => s + 1)
    else handleCreate()
  }

  const handleCreate = async () => {
    setLoading(true)
    setLoadingMsg('MentorMind is building your learning world...')
    setLoadingProgress(10)

    const allInterests = [...profile.interests]
    if (profile.customInterest.trim()) allInterests.push(profile.customInterest.trim())
    const finalGoal = profile.goal === 'custom' ? profile.customGoal : profile.goal
    const finalTimeframe = profile.timeframe === 'custom' ? profile.customTimeframe : profile.timeframe

    try {
      let user = existingUser
      if (!user) {
        setLoadingMsg('Creating your profile...'); setLoadingProgress(15)
        user = await api.createUser({ name: profile.name, age: parseInt(profile.age) })
        localStorage.setItem('learnmosaic-user', JSON.stringify(user))
      }

      setLoadingMsg('Designing your curriculum...'); setLoadingProgress(35)
      const session = await api.createSession({
        userId: user.id, name: existingUser ? 'Learning Session' : profile.name,
        age: existingUser ? existingUser.age : parseInt(profile.age),
        interests: allInterests, goal: finalGoal,
        subGoal: profile.subGoal,
        timeframe: finalTimeframe
      })
      localStorage.setItem('learnmosaic-last-session', session.id)

      // Upload materials if any
      if (materials.length > 0) {
        setLoadingMsg('Uploading your materials...'); setLoadingProgress(65)
        for (let i = 0; i < materials.length; i++) {
          const form = new FormData()
          form.append('file', materials[i])
          await fetch(`/api/sessions/${session.id}/upload`, { method: 'POST', body: form })
          setLoadingProgress(65 + Math.round((i + 1) / materials.length * 20))
        }
      }

      setLoadingProgress(90); setLoadingMsg('Setting up your dashboard...')
      setTimeout(() => {
        setLoadingProgress(100); setLoadingMsg('Ready! Taking you there...')
        setTimeout(() => navigate(`/session/${session.id}`), 500)
      }, 300)
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
            {loadingProgress < 35 ? 'Analyzing your goals...' :
             loadingProgress < 65 ? 'Generating curriculum...' :
             loadingProgress < 90 ? 'Uploading materials...' : 'Almost there...'}
          </p>
        </div>
      </PageTransition>
    )
  }

  const lastStep = hasApiStep ? (existingUser ? 5 : 6) : (existingUser ? 4 : 5)
  const displayStep = step
  const contentStep = hasApiStep ? step - 1 : step

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <AmbientBackground />
      <div className="color-dna-strip z-10 relative">
        <div /><div /><div /><div /><div />
      </div>

      <div className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] px-6 py-3 flex items-center justify-between relative z-20">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="text-xs uppercase tracking-wider text-white/60 hover:text-[var(--bauhaus-red)] transition-colors cursor-pointer"
        >
          ← Exit
        </motion.button>
        <span className="text-xs font-medium uppercase tracking-wider opacity-60">
          {existingUser ? 'New Session' : 'Get Started'}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme({ darkMode: !theme.darkMode })}
          className={`w-10 h-10 flex items-center justify-center border-[3px] border-[var(--bauhaus-black)] cursor-pointer transition-all duration-200 ${
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
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        <div className="lg:w-[20%] p-8 border-r-[4px] border-[var(--bauhaus-black)] bg-[var(--surface)]/80 backdrop-blur-sm hidden lg:flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              Step {displayStep + 1} of {totalSteps}
            </span>
            <div className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bauhaus-red)' }}>
              {Math.round(((displayStep + 1) / totalSteps) * 100)}%
            </div>
          </div>

          <div className="space-y-6">
            {stepLabels.map((label, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{
                    backgroundColor: i === displayStep ? 'var(--bauhaus-red)' : i < displayStep ? 'var(--bauhaus-black)' : 'transparent',
                    scale: i === displayStep ? 1.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-4 h-4 flex items-center justify-center border-[2px] border-[var(--bauhaus-black)]"
                >
                  {i < displayStep && (
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
                  i === displayStep ? 'font-bold' : 'text-[var(--ink-muted)]'
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

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg mx-auto">
            <div className="lg:hidden mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
                  Step {displayStep + 1} of {totalSteps}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bauhaus-red)' }}>
                  {Math.round(((displayStep + 1) / totalSteps) * 100)}%
                </span>
              </div>
              <ProgressBar value={((displayStep + 1) / totalSteps) * 100} color="red" />
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
                {/* Step: API Configuration */}
                {hasApiStep && step === 0 && (
                  <ApiConfig onComplete={handleApiConfigComplete} />
                )}

                {/* Step 0: Name & Age (only if no existing user) */}
                {!existingUser && contentStep === 0 && (
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

                {/* Step: Interests */}
                {(existingUser ? contentStep === 0 : contentStep === 1) && (
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

                {/* Step: Goal (with resource upload toggle) */}
                {(existingUser ? contentStep === 1 : contentStep === 2) && (
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
                    <p className="text-[var(--ink-muted)] mb-6">What do you want to achieve?</p>
                    <div className="space-y-3 mb-6">
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

                    {/* Material upload toggle */}
                    <div className="border-t-[2px] border-[var(--border-color)] pt-5">
                      <motion.button
                        onClick={() => setShowMaterials(!showMaterials)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 mx-auto px-5 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer border-[2px] border-[var(--bauhaus-black)]
                          bg-[var(--bauhaus-white)] hover:bg-[var(--surface-alt)]"
                      >
                        <motion.div
                          animate={{ rotate: showMaterials ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v12M1 7h12" stroke="var(--bauhaus-black)" strokeWidth="2" strokeLinecap="square"/>
                          </svg>
                        </motion.div>
                        ADD YOUR OWN MATERIALS
                      </motion.button>

                      <AnimatePresence>
                        {showMaterials && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, y: -10 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden mt-4"
                          >
                            <div
                              className="border-[3px] border-dashed border-[var(--bauhaus-black)] p-6 rounded-[var(--radius-lg)] cursor-pointer hover:bg-[var(--surface-alt)] transition-all duration-300"
                              style={{ background: 'var(--surface)' }}
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--bauhaus-red)' }}
                              onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bauhaus-black)' }}
                              onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--bauhaus-black)'; handleFileSelect(e) }}
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bauhaus-black)" strokeWidth="1.5" className="mx-auto mb-3">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                              </svg>
                              <p className="text-sm font-medium mb-1">Drop your learning materials here</p>
                              <p className="text-xs text-[var(--ink-muted)]">PDF, DOC, TXT, images, markdown</p>
                              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.mp4,.mov" />
                            </div>

                            <AnimatePresence>
                              {materials.map((file, idx) => (
                                <motion.div
                                  key={`${file.name}-${idx}`}
                                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                                  className="flex items-center gap-3 mt-2 px-4 py-3 border-[2px] border-[var(--bauhaus-black)] bg-[var(--surface)]"
                                >
                                  <div className="w-8 h-8 bg-[var(--bauhaus-yellow)] flex items-center justify-center flex-shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                      <path d="M3 1h5l4 4v8H3V1Z" stroke="var(--bauhaus-black)" strokeWidth="1.5"/>
                                      <path d="M8 1v4h4" stroke="var(--bauhaus-black)" strokeWidth="1.5"/>
                                    </svg>
                                  </div>
                                  <span className="text-sm truncate flex-1 text-left">{file.name}</span>
                                  <button
                                    onClick={() => removeMaterial(idx)}
                                    className="text-[var(--bauhaus-red)] hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                      <path d="M2 2l10 10M12 2l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                                    </svg>
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Step: Goal Refinement (AI-guided) */}
                {(existingUser ? contentStep === 2 : contentStep === 3) && (profile.goal || profile.customGoal) && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-blue)] flex items-center justify-center relative"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="11" stroke="var(--bauhaus-white)" strokeWidth="2"/>
                        <path d="M16 10v6l4 2" stroke="var(--bauhaus-white)" strokeWidth="2" strokeLinecap="square"/>
                      </svg>
                    </motion.div>
                    <h2 className="type-h2 mb-3">TELL ME MORE</h2>
                    <div className="p-[2px] rounded-[var(--radius-lg)] mb-6" style={{ background: 'var(--glass-border)' }}>
                      <div className="rounded-[calc(var(--radius-lg)-2px)] p-5 text-left text-sm leading-relaxed"
                        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
                        <p className="text-[var(--ink)]">
                          {goalPrompts[profile.goal] || 'Tell me more about what you want to learn:'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Type your answer here..."
                        value={profile.subGoal}
                        onChange={e => update('subGoal', e.target.value)}
                        autoFocus
                      />
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={async () => {
                            setLoadingSuggestions(true); setSuggestions([])
                            try {
                              const res = await api.suggestRefine(profile.customGoal || profile.goal)
                              setSuggestions(res.suggestions || [])
                            } catch {}
                            setLoadingSuggestions(false)
                          }}
                          disabled={loadingSuggestions}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 border-[var(--bauhaus-black)]
                            bg-[var(--bauhaus-white)] hover:bg-[var(--bauhaus-yellow)] transition-colors duration-200
                            disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loadingSuggestions ? 'Thinking...' : 'AI Suggest'}
                        </button>
                        {suggestions.length > 0 && (
                          <button
                            onClick={() => { setSuggestions([]) }}
                            className="text-xs text-[var(--ink-muted)] underline hover:text-[var(--ink)] transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2 pt-1"
                        >
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => { update('subGoal', s); setSuggestions([]) }}
                              className="w-full text-left p-3 border-2 border-[var(--bauhaus-black)] text-sm leading-snug
                                bg-[var(--bauhaus-white)] hover:bg-[var(--bauhaus-yellow)] transition-colors duration-200"
                            >
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Timeframe (with custom option) */}
                {(existingUser ? contentStep === 3 : contentStep === 4) && (
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
                    <p className="text-[var(--ink-muted)] mb-6">How long do you want to spend on this?</p>
                    <div className="grid grid-cols-2 gap-0 mb-4">
                      {timeframes.map((t, idx) => (
                        <motion.button
                          key={t.value}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.06, duration: 0.3 }}
                          onClick={() => { update('timeframe', t.value); update('customTimeframe', '') }}
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
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => update('timeframe', 'custom')}
                      className={`w-full px-5 py-3 text-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-medium border-[2px] border-[var(--bauhaus-black)]
                        ${profile.timeframe === 'custom'
                          ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                          : 'bg-[var(--bauhaus-white)] text-[var(--ink)] hover:bg-[var(--surface-alt)]'}`}
                    >
                      CUSTOM...
                    </motion.button>
                    <AnimatePresence>
                      {profile.timeframe === 'custom' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3"
                        >
                          <Input placeholder="e.g., 2 weeks, by December..." value={profile.customTimeframe} onChange={e => update('customTimeframe', e.target.value)} autoFocus />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Step: Review */}
                {(existingUser ? contentStep === 4 : contentStep === 5) && (
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
                    <p className="text-[var(--ink-muted)] mb-8">Here's your learning plan:</p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="border-[4px] border-[var(--bauhaus-black)] mb-8 text-left"
                    >
                      <div className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] px-5 py-3 text-xs font-bold uppercase tracking-wider">
                        Your Plan
                      </div>
                      <div className="p-5 space-y-3">
                        {!existingUser && [
                          { label: 'Name', value: profile.name },
                          { label: 'Age', value: profile.age },
                        ].map((item, i) => (
                          <motion.div key={item.label} className="flex justify-between py-2 border-b border-[var(--border-color)] last:border-0"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                            <span className="text-[var(--ink-muted)] text-sm uppercase tracking-wider">{item.label}</span>
                            <span className="font-medium text-right max-w-[60%]">{item.value}</span>
                          </motion.div>
                        ))}
                        {[
                          { label: 'Goal', value: profile.goal === 'custom' ? profile.customGoal : profile.goal },
                          { label: 'Focus', value: profile.subGoal },
                          { label: 'Interests', value: profile.interests.join(', ') || profile.customInterest },
                          { label: 'Timeframe', value: profile.timeframe === 'custom' ? profile.customTimeframe : profile.timeframe },
                        ].map((item, i) => (
                          <motion.div key={item.label} className="flex justify-between py-2 border-b border-[var(--border-color)] last:border-0"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                            <span className="text-[var(--ink-muted)] text-sm uppercase tracking-wider">{item.label}</span>
                            <span className="font-medium text-right max-w-[60%]">{item.value}</span>
                          </motion.div>
                        ))}
                        <motion.div className="flex justify-between py-2"
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                          <span className="text-[var(--ink-muted)] text-sm uppercase tracking-wider">Materials</span>
                          <span className="font-medium text-right">{materials.length > 0 ? `${materials.length} files` : 'None'}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex justify-between mt-10"
            >
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
                  {'\u2190 BACK'}
                </Button>
              ) : <div />}
              <Button onClick={nextStep} disabled={!canProceed()}>
                {step === lastStep ? 'BEGIN LEARNING' : 'CONTINUE \u2192'}
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
