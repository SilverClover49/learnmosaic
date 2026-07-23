import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import Modal from '../components/ui/Modal'
import { toast } from '../components/ui/Toast'
import FileUploader from '../components/session/FileUploader'
import ArtifactRenderer from '../components/session/ArtifactRenderer'
import SelectionToolbar from '../components/session/SelectionToolbar'
import ReactMarkdown from 'react-markdown'
import AmbientBackground from '../components/visuals/AmbientBackground'
import { api } from '../lib/api'

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Session() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [tab, setTab] = useState('chat')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(null)
  const chatEnd = useRef(null)
  const chatContainerRef = useRef(null)

  // Real-world clock — ticks every second
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Session timer — counts up from first message
  useEffect(() => {
    if (!sessionStarted) return
    const interval = setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - sessionStarted) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStarted])

  useEffect(() => { loadSession() }, [id])
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  const loadSession = async () => {
    try {
      const data = await api.getSession(id)
      setSession(data)
      if (data.chatHistory?.length > 0) {
        setChat(data.chatHistory)
        setSessionStarted(new Date(data.chatHistory[0].timestamp).getTime())
      }
    } catch {}
    setLoading(false)
  }

  const handleAskDoubt = (selectedText) => {
    setInput(`"${selectedText}"\n\nIn reference to this, `)
    // Focus the input
    setTimeout(() => {
      const inputEl = document.querySelector('input, textarea')
      if (inputEl) {
        inputEl.focus()
        // Place cursor at the end
        const len = inputEl.value.length
        inputEl.setSelectionRange(len, len)
      }
    }, 100)
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const msg = input.trim()
    setInput('')
    const now = new Date()
    if (!sessionStarted) setSessionStarted(now.getTime())
    setChat(prev => [...prev, { role: 'user', content: msg, timestamp: now.toISOString() }])
    setSending(true)
    try {
      const data = await api.sendMessage(id, {
        message: msg,
        history: chat.map(c => ({ role: c.role, content: c.content })),
        currentTime: new Date().toISOString(),
        sessionDuration: sessionStarted ? Math.floor((Date.now() - sessionStarted) / 1000) : 0
      })
      setChat(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() }])
      if (data.milestones) setSession(prev => ({ ...prev, milestones: data.milestones }))
    } catch {
      setChat(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Try again?', timestamp: new Date().toISOString() }])
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const confirmComplete = async () => {
    setShowCompleteModal(false)
    try {
      await api.completeSession(id)
      setSession(prev => ({ ...prev, status: 'completed' }))
      toast({
        message: 'Session completed!',
        duration: 12000,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await api.undoComplete(id)
              setSession(prev => ({ ...prev, status: 'active' }))
              toast({ message: 'Session restored!', duration: 3000 })
            } catch {
              toast({ message: 'Undo window expired (60s)', duration: 4000 })
            }
          }
        }
      })
    } catch {}
  }

  const confirmDelete = async () => {
    setShowDeleteModal(false)
    try {
      await api.deleteSession(id)
      toast({ message: 'Session deleted', duration: 3000 })
      navigate('/dashboard')
    } catch {}
  }

  const renderMessage = (content, role) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/)
        if (match) {
          return <ArtifactRenderer key={i} language={match[1] || 'text'} code={match[2]} />
        }
      }
      const isUser = role === 'user'
      return <div key={i} className="prose prose-invert max-w-none text-sm leading-relaxed" style={{
        '--tw-prose-body': isUser ? 'var(--bauhaus-white)' : 'var(--ink)',
        '--tw-prose-bold': isUser ? 'var(--bauhaus-white)' : 'var(--ink)',
        '--tw-prose-headings': isUser ? 'var(--bauhaus-white)' : 'var(--ink)',
        '--tw-prose-links': isUser ? 'var(--bauhaus-yellow)' : 'var(--accent)',
        '--tw-prose-counters': isUser ? 'rgba(255,255,255,0.6)' : undefined,
        '--tw-prose-bullets': isUser ? 'rgba(255,255,255,0.6)' : undefined,
        '--tw-prose-hr': isUser ? 'rgba(255,255,255,0.2)' : undefined,
        '--tw-prose-quotes': isUser ? 'rgba(255,255,255,0.8)' : undefined,
        '--tw-prose-quote-borders': isUser ? 'var(--bauhaus-yellow)' : undefined,
        '--tw-prose-code': isUser ? 'var(--bauhaus-yellow)' : undefined,
      }}><ReactMarkdown>{part}</ReactMarkdown></div>
    })
  }

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

  if (!session) {
    return (
      <PageTransition className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
        <AmbientBackground />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-8 bg-[var(--bauhaus-red)] flex items-center justify-center"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="var(--bauhaus-white)" strokeWidth="2"/>
              <path d="M12 12l8 8M20 12l-8 8" stroke="var(--bauhaus-white)" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </motion.div>
          <h2 className="type-h2 mb-4">SESSION NOT FOUND</h2>
          <Button onClick={() => navigate('/dashboard')}>BACK TO DASHBOARD</Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-[100dvh] flex flex-col relative">
      <AmbientBackground variant="subtle" />
      <div className="color-dna-strip z-10 relative">
        <div /><div /><div /><div /><div />
      </div>

      <Modal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="COMPLETE SESSION?"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCompleteModal(false)}>CANCEL</Button>
            <Button size="sm" onClick={confirmComplete}>YES, COMPLETE</Button>
          </>
        }
      >
        <p>You'll see your end-credits summary. You can undo this within 60 seconds.</p>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="DELETE SESSION?"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>CANCEL</Button>
            <Button size="sm" onClick={confirmDelete}>DELETE FOREVER</Button>
          </>
        }
      >
        <p>This will permanently remove all session files. Cannot be undone.</p>
      </Modal>

      {/* Top Navigation Bar */}
      <div className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] px-6 py-3 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate('/dashboard')}
            className="text-xs uppercase tracking-wider hover:text-[var(--bauhaus-yellow)] transition-colors cursor-pointer"
          >
            ← Dashboard
          </motion.button>
          <div className="w-[1px] h-4 bg-white/30" />
          <span className="text-sm font-medium truncate max-w-[300px]">{session.goal}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Session Timer */}
          {sessionStarted && (
            <div className="flex items-center gap-2 px-3 py-1 border border-white/20">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="var(--bauhaus-yellow)" strokeWidth="1.5"/>
                <path d="M5 2.5V5L6.5 6.5" stroke="var(--bauhaus-yellow)" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
              <span className="text-xs font-mono tracking-wider text-[var(--bauhaus-yellow)]">{formatTimer(sessionSeconds)}</span>
            </div>
          )}
          {/* Real-World Clock */}
          <div className="flex items-center gap-2 px-3 py-1 border border-white/20">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" stroke="var(--bauhaus-blue)" strokeWidth="1.5"/>
            </svg>
            <span className="text-xs font-mono tracking-wider">{formatTime(clock)}</span>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="px-3 py-1 text-xs uppercase tracking-wider hover:text-[var(--bauhaus-yellow)] transition-colors cursor-pointer"
          >
            {showSidebar ? 'CLOSE' : 'PANELS'}
          </button>
          {session.status !== 'completed' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCompleteModal(true)}
              className="px-4 py-1 text-xs uppercase tracking-wider bg-[var(--bauhaus-red)] hover:brightness-110 transition-all cursor-pointer"
            >
              COMPLETE
            </motion.button>
          )}
          <motion.button
            whileHover={{ rotate: 90, color: 'var(--bauhaus-red)' }}
            onClick={() => setShowDeleteModal(true)}
            className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--bauhaus-black)] flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {[
                { label: 'Dashboard', onClick: () => navigate('/dashboard') },
                { label: 'Curriculum', onClick: () => { setShowSidebar(true); setTab('curriculum'); setNavOpen(false) } },
                { label: 'Thinking Board', onClick: () => { setShowSidebar(true); setTab('board'); setNavOpen(false) } },
                { label: 'Checklist', onClick: () => { setShowSidebar(true); setTab('checklist'); setNavOpen(false) } }
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => { item.onClick(); setNavOpen(false) }}
                  className="text-2xl text-[var(--bauhaus-white)] hover:text-[var(--bauhaus-red)] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex relative z-10">
        <div className="flex-1 flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-5 relative">
            <SelectionToolbar containerRef={chatContainerRef} onAskDoubt={handleAskDoubt} />
            {chat.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6 }}
                className="text-center py-24"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 mx-auto mb-6 bg-[var(--bauhaus-yellow)] flex items-center justify-center"
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="4" y="4" width="28" height="20" rx="0" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                    <path d="M10 28l6-4h-4" fill="var(--bauhaus-black)"/>
                    <line x1="10" y1="12" x2="26" y2="12" stroke="var(--bauhaus-black)" strokeWidth="1.5"/>
                    <line x1="10" y1="17" x2="22" y2="17" stroke="var(--bauhaus-black)" strokeWidth="1.5"/>
                  </svg>
                </motion.div>
                <h3 className="type-h3 mb-3">START LEARNING!</h3>
                <p className="text-[var(--ink-muted)] max-w-md mx-auto mb-8">Ask me anything about {session.goal}.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Where should I start?', 'Give me an overview', 'What do I need to know first?'].map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setInput(q); setTimeout(sendMessage, 100) }}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm border-[2px] border-[var(--bauhaus-black)] text-[var(--ink)] hover:bg-[var(--bauhaus-yellow)] hover:border-[var(--bauhaus-yellow)] cursor-pointer transition-all duration-200"
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M5 0L10 8H0L5 0Z" fill="var(--bauhaus-yellow)" className="group-hover:fill-black transition-colors"/>
                      </svg>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            {chat.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] md:max-w-[65%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  {/* Sender label with Kandinsky shape */}
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    {msg.role === 'assistant' && (
                      <div className="w-3 h-3 bg-[var(--bauhaus-red)] flex-shrink-0" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-50">
                      {msg.role === 'user' ? 'You' : 'MentorMind'}
                    </span>
                    {msg.role === 'user' && (
                      <div className="w-3 h-3 rounded-full bg-[var(--bauhaus-blue)] flex-shrink-0" />
                    )}
                  </div>
                  {/* Message bubble */}
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    className={`${
                      msg.role === 'user'
                        ? 'bg-[var(--bauhaus-blue)] text-[var(--bauhaus-white)] rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px]'
                        : 'bg-[var(--bauhaus-white)] text-[var(--ink)] border-[3px] border-[var(--bauhaus-red)] rounded-tl-[4px] rounded-tr-[20px] rounded-b-[20px]'
                    }`}
                  >
                    <div className="px-5 py-3">
                      {renderMessage(msg.content, msg.role)}
                    </div>
                  </motion.div>
                  {/* Timestamp */}
                  {msg.timestamp && (
                    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase opacity-30 mt-1 px-1">
                      {formatTime(new Date(msg.timestamp))}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <div className="w-3 h-3 bg-[var(--bauhaus-red)] flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-50">MentorMind</span>
                  </div>
                  <div className="bg-[var(--bauhaus-white)] border-[3px] border-[var(--bauhaus-red)] px-5 py-3 rounded-tl-[4px] rounded-tr-[20px] rounded-b-[20px]">
                    <div className="flex gap-3 items-center">
                      <motion.div
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        className="w-2.5 h-2.5 bg-[var(--bauhaus-red)]"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[var(--bauhaus-yellow)]"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                        className="w-2.5 h-2.5 rounded-full bg-[var(--bauhaus-blue)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Input bar */}
          <div className="border-t-[4px] border-[var(--bauhaus-black)] px-6 py-4 bg-[var(--surface)]/80 backdrop-blur-sm relative z-10">
            <div className="w-full max-w-3xl mx-auto flex gap-3">
              <FileUploader sessionId={id} />
              <motion.input
                whileFocus={{ borderColor: 'var(--bauhaus-red)' }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything, learn everything..."
                className="flex-1 px-4 py-3 bg-[var(--bauhaus-white)] border-[2px] border-[var(--bauhaus-black)] text-[var(--ink)] placeholder-[var(--ink-dim)] focus:outline-none text-sm transition-colors duration-200"
                disabled={sending}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="px-6 py-3 bg-[var(--bauhaus-red)] text-[var(--bauhaus-white)] font-bold uppercase tracking-wider text-sm cursor-pointer disabled:opacity-40 hover:brightness-110 transition-all"
              >
                SEND →
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="border-l-[4px] border-[var(--bauhaus-black)] bg-[var(--surface)]/90 backdrop-blur-sm flex flex-col overflow-hidden"
            >
              <div className="flex border-b-[4px] border-[var(--bauhaus-black)] min-w-[320px]">
                {[
                  { key: 'curriculum', label: 'Curriculum' },
                  { key: 'board', label: 'Board' },
                  { key: 'checklist', label: 'Checklist' }
                ].map(t => (
                  <motion.button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    whileHover={{ backgroundColor: tab !== t.key ? 'var(--surface-alt)' : undefined }}
                    className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                      ${tab === t.key ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]' : 'text-[var(--ink-muted)]'}`}
                  >
                    {t.label}
                  </motion.button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed whitespace-pre-wrap min-w-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab === 'curriculum' && (session.curriculum || 'Curriculum being generated...')}
                    {tab === 'board' && (session.board || 'Thinking board...')}
                    {tab === 'checklist' && (session.checklist || 'Checklist being generated...')}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
