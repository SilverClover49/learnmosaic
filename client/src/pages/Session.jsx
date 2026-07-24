import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import Modal from '../components/ui/Modal'
import { toast } from '../components/ui/Toast'
import FileUploader from '../components/session/FileUploader'
import ArtifactRenderer from '../components/session/ArtifactRenderer'
import SelectionToolbar from '../components/session/SelectionToolbar'
import ReferencePanel from '../components/session/ReferencePanel'
import CodeSandbox from '../components/session/CodeSandbox'
import Timer from '../components/session/Timer'
import QuizPanel from '../components/session/QuizPanel'
import PresentationViewer from '../components/session/PresentationViewer'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
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

function ChecklistPanel({ checklist, sessionId }) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`checklist-${sessionId}`) || '[]') } catch { return [] }
  })
  const items = checklist.split('\n').reduce((acc, line) => {
    const match = line.match(/^-\s\[.\]\s(.+)/)
    if (match) acc.push({ text: match[1], index: acc.length })
    return acc
  }, [])

  const toggleItem = (idx) => {
    setChecked(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      localStorage.setItem(`checklist-${sessionId}`, JSON.stringify(next))
      return next
    })
  }

  if (items.length === 0) {
    return <div className="flex items-center justify-center h-full text-[var(--ink-muted)] text-sm">No checklist items yet.</div>
  }

  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-4 font-bold">YOUR PROGRESS</div>
      {items.map((item) => (
        <motion.div
          key={item.index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="p-[2px] rounded-[var(--radius-md)] cursor-pointer transition-all duration-300"
          style={checked.includes(item.index) ? { background: 'var(--accent2)' } : { background: 'var(--glass-border)' }}
          onClick={() => toggleItem(item.index)}
        >
          <div className="rounded-[calc(var(--radius-md)-2px)] px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-300
              ${checked.includes(item.index) ? 'border-[var(--accent2)] bg-[var(--accent2)]' : 'border-[var(--ink-dim)]'}`}>
              {checked.includes(item.index) && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${checked.includes(item.index) ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink)]'}`}>
              {item.text}
            </span>
          </div>
        </motion.div>
      ))}
      <div className="text-[10px] text-[var(--ink-muted)] text-center pt-2">
        {checked.length}/{items.length} completed
      </div>
    </div>
  )
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
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(null)
  const [references, setReferences] = useState([])
  const [activeTest, setActiveTest] = useState(null)
  const [testMinimized, setTestMinimized] = useState(false)
  const chatEnd = useRef(null)
  const chatContainerRef = useRef(null)
  const streamingRef = useRef(false)
  const streamVersionRef = useRef(0)

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
      if (data.chatHistory?.length > 0 && !streamingRef.current) {
        setChat(data.chatHistory)
        const lastTest = data.chatHistory.reduce((found, msg) => {
          const tb = (msg.blocks || []).find(b => b.type === 'test')
          return tb || found
        }, null)
        if (lastTest) setActiveTest(lastTest)
        if (data.chatHistory[0].created) {
          setSessionStarted(new Date(data.chatHistory[0].created).getTime())
        }
      }
    } catch (e) {
      console.warn('Failed to load session:', e)
    }
    setLoading(false)
  }

  const handleReference = (text) => {
    setReferences(prev => [...prev, text])
    setTimeout(() => {
      const inputEl = document.querySelector('input, textarea')
      if (inputEl) inputEl.focus()
    }, 100)
  }

  const handleRemoveReference = (index) => {
    if (index === -1) { setReferences([]); return }
    setReferences(prev => prev.filter((_, i) => i !== index))
  }

  const handleAskDoubtAboutReference = (refText) => {
    setInput(`About "${refText.slice(0, 100)}": `)
    setTimeout(() => {
      const inputEl = document.querySelector('input, textarea')
      if (inputEl) {
        inputEl.focus()
        const len = inputEl.value.length
        inputEl.setSelectionRange(len, len)
      }
    }, 100)
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    let msg = input.trim()
    if (references.length > 0) {
      const refContext = references.slice(0, 5).map((r, i) => `[Ref ${i + 1}]: ${r.slice(0, 200)}`).join('\n')
      msg = `${refContext}\n\n---\n\n${msg}`
    }
    streamingRef.current = true
    streamVersionRef.current += 1
    const myVersion = streamVersionRef.current
    setInput('')
    setReferences([])
    const now = new Date()
    if (!sessionStarted) setSessionStarted(now.getTime())
    const assistantId = `ast-${Date.now()}`
    setChat(prev => [...prev,
      { role: 'user', content: msg, timestamp: now.toISOString(), _id: `usr-${Date.now()}` },
      { role: 'assistant', content: '', blocks: [], _id: assistantId, streaming: true }
    ])
    setSending(true)
    let accumulatedText = ''
    try {
      await api.sendMessageStream(id, {
        message: msg,
        history: chat.map(c => ({ role: c.role, content: c.content })),
        currentTime: new Date().toISOString(),
        sessionDuration: sessionStarted ? Math.floor((Date.now() - sessionStarted) / 1000) : 0
      }, {
        onToken: (text) => {
          accumulatedText += text
          setChat(prev => prev.map(c =>
            c._id === assistantId ? { ...c, content: accumulatedText } : c
          ))
        },
        onBlocks: (blocks) => {
          const testBlock = blocks.find(b => b.type === 'test')
          if (testBlock) {
            setActiveTest(testBlock)
            setTestMinimized(false)
          }
          setChat(prev => prev.map(c =>
            c._id === assistantId ? { ...c, blocks } : c
          ))
        },
        onDone: () => {
          setChat(prev => prev.map(c =>
            c._id === assistantId ? { ...c, timestamp: new Date().toISOString(), streaming: false } : c
          ))
          streamingRef.current = false
          setSending(false)
          api.getSession(id).then(data => { if (myVersion === streamVersionRef.current) setSession(data) })
        },
        onError: () => {
          setChat(prev => prev.map(c =>
            c._id === assistantId ? { ...c, content: accumulatedText || 'Sorry, I had trouble responding. Try again?', streaming: false } : c
          ))
          streamingRef.current = false
          setSending(false)
        }
      })
    } catch {
      setChat(prev => prev.map(c =>
        c._id === assistantId ? { ...c, content: accumulatedText || 'Sorry, I had trouble responding. Try again?', streaming: false } : c
      ))
      streamingRef.current = false
      setSending(false)
    }
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

  const renderMessage = (content, role, blocks) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('```')) {
            const match = part.match(/```(\w*)\n([\s\S]*?)```/)
            if (match) {
              const lang = match[1] || 'text'
              const code = match[2]
              if (lang === 'html' || lang === 'sandbox') {
                return <CodeSandbox key={i} html={code} title="Interactive Example" />
              }
              return <ArtifactRenderer key={i} language={lang} code={code} onReference={(t) => handleReference(t)} />
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
          }}><ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown></div>
        })}
        {blocks && blocks.filter(b => b.type !== 'test').map((block, i) => (
          <div key={`block-${i}`} className="mt-4">
            {block.type === 'svg' && (
              <ArtifactRenderer language="svg" code={block.code} onReference={(t) => handleReference(t)} />
            )}
            {block.type === 'image' && (
              <div className="border-[3px] border-[var(--bauhaus-black)] overflow-hidden bg-[var(--bauhaus-white)]">
                <div className="relative">
                  <img src={block.url} alt={block.prompt || ''} className="w-full h-auto max-h-[60vh] object-contain" />
                  <button
                    onClick={() => handleReference(`Image: ${block.prompt || block.url}`)}
                    className="absolute bottom-2 right-2 px-2 py-1 bg-[var(--bauhaus-black)] text-white text-[9px] font-bold uppercase tracking-wider opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  >
                    Reference
                  </button>
                </div>
              </div>
            )}
            {block.type === 'sandbox' && (
              <CodeSandbox html={block.html} title={block.title} />
            )}
            {block.type === 'presentation' && (
              <PresentationViewer title={block.title} slides={block.slides} />
            )}
            {block.type === 'download' && (
              <div className="border-[2px] border-[var(--bauhaus-black)] p-4 bg-[var(--surface-alt)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">{block.filename}</div>
                    <div className="text-[10px] text-[var(--ink-muted)] mt-1">{block.description}</div>
                  </div>
                  <a
                    href={`data:text/plain;base64,${block.base64}`}
                    download={block.filename}
                    className="px-3 py-1.5 bg-[var(--bauhaus-red)] text-white text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
                  >
                    Download
                  </a>
                </div>
              </div>
            )}
            {block.type === 'artifact' && block.data && (
              <div className="border-[2px] border-[var(--bauhaus-black)] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bauhaus-black)] text-white">
                  <span className="text-xs font-bold uppercase tracking-wider">{block.data.name}</span>
                  <span className="text-[9px] uppercase text-white/70">{block.data.type}</span>
                </div>
                <div className="p-3 bg-[var(--surface)] max-h-[300px] overflow-y-auto">
                  <pre className="text-[11px] whitespace-pre-wrap font-mono text-[var(--ink)]">{block.data.content}</pre>
                </div>
              </div>
            )}
            {block.type === 'memories' && block.data && block.data.length > 0 && (
              <div className="border-[2px] border-[var(--bauhaus-black)] p-3 bg-[var(--surface-alt)]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">Stored Facts</div>
                <div className="space-y-1">
                  {block.data.map((m, j) => (
                    <div key={j} className="text-[11px] flex items-start gap-2">
                      <span className="font-bold text-[var(--bauhaus-red)] whitespace-nowrap">{m.key}:</span>
                      <span className="text-[var(--ink)]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {block.type === 'search' && block.data?.results && (
              <div className="border-[2px] border-[var(--bauhaus-black)] p-4 bg-[var(--surface-alt)]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-3">Search Results</div>
                {block.data.abstract && (
                  <p className="text-xs text-[var(--ink-muted)] mb-3 italic">{block.data.abstract}</p>
                )}
                <div className="space-y-2">
                  {block.data.results.map((r, j) => (
                    <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="block text-xs hover:text-[var(--bauhaus-red)] transition-colors group">
                      <div className="font-bold truncate group-hover:underline">{r.title}</div>
                      <div className="text-[var(--ink-dim)] truncate">{r.snippet}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {block.type === 'images' && block.data && block.data.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {block.data.map((img, j) => (
                  <div key={j} className="border-[2px] border-[var(--bauhaus-black)] overflow-hidden bg-[var(--bauhaus-white)] group/img relative">
                    <img src={img.url} alt={img.title || ''} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-end justify-end p-1 bg-gradient-to-t from-black/30 to-transparent">
                      <button
                        onClick={() => handleReference(`Image${img.title ? ': ' + img.title : ''} ${img.url}`)}
                        className="px-2 py-1 bg-[var(--bauhaus-black)] text-white text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Ref
                      </button>
                    </div>
                    {img.title && <div className="text-[10px] p-1 truncate text-[var(--ink-dim)]">{img.title}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </>
    )
  }

  if (loading) {
    return (
      <PageTransition className="min-h-[100dvh] flex flex-col">
        <AmbientBackground />
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
          <img src="/logo.svg" alt="LearnMosaic" className="w-12 h-12 mb-6" />
          <div className="w-48 h-1 bg-[var(--surface-alt)] overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full w-1/2 bg-[var(--bauhaus-black)]"
            />
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-4 uppercase tracking-wider">Loading session...</p>
        </div>
      </PageTransition>
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
            className="w-20 h-20 mx-auto mb-8"
          >
            <img src="/logo.svg" alt="LearnMosaic" className="w-full h-full" />
          </motion.div>
          <h2 className="type-h2 mb-4">SESSION NOT FOUND</h2>
          <Button onClick={() => navigate('/dashboard')}>BACK TO DASHBOARD</Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="h-[100dvh] overflow-hidden flex flex-col relative">
      <AmbientBackground variant="subtle" />
      <div className="color-dna-strip z-10 relative flex-shrink-0">
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
      <div className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] px-6 py-3 flex items-center justify-between relative z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="LearnMosaic" className="w-6 h-6" />
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
          <Timer />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const text = chat.map(m => `${m.role === 'user' ? 'You' : 'MentorMind'} (${m.created ? new Date(m.created).toLocaleString() : ''}):\n${m.content}`).join('\n\n---\n\n')
              const blob = new Blob([`# LearnMosaic Chat Export\n\n${text}`], { type: 'text/markdown' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `chat-${id.slice(0, 8)}.md`; a.click()
              URL.revokeObjectURL(url)
              toast('Chat exported as markdown')
            }}
            className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            EXPORT
          </motion.button>
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
      <div className="flex-1 min-h-0 flex relative z-10">
        <div className="flex-1 min-h-0 flex flex-col">
          <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-8 space-y-5 relative">
            <SelectionToolbar containerRef={chatContainerRef} onReference={handleReference} />
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
                key={msg._id || i}
                initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] md:max-w-[65%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
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
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    className={`${
                      msg.role === 'user'
                        ? 'chat-user-bubble bg-[var(--bauhaus-blue)] text-[var(--bauhaus-white)] rounded-t-[20px] rounded-bl-[20px] rounded-br-[4px]'
                        : 'chat-ai-bubble bg-[var(--bauhaus-white)] text-[var(--ink)] border-[3px] border-[var(--bauhaus-red)] rounded-tl-[4px] rounded-tr-[20px] rounded-b-[20px]'
                    }`}
                  >
                    <div className="px-5 py-3">
                      {msg.streaming && !msg.content ? (
                        <div className="flex gap-3 items-center py-1">
                          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}>
                            <div className="w-2.5 h-2.5 bg-[var(--bauhaus-red)]" />
                          </motion.div>
                          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}>
                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[var(--bauhaus-yellow)]" />
                          </motion.div>
                          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}>
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--bauhaus-blue)]" />
                          </motion.div>
                        </div>
                      ) : (
                        <>
                          {renderMessage(msg.content, msg.role, msg.blocks)}
                          {msg.streaming && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="inline-block w-[2px] h-[1em] bg-[var(--bauhaus-red)] ml-0.5 align-middle"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    {!msg.streaming && (
                      <button
                        onClick={() => { navigator.clipboard.writeText(msg.content); toast('Copied!') }}
                        className="text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 hover:opacity-100 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-all duration-200 cursor-pointer"
                      >
                        Copy
                      </button>
                    )}
                    {!msg.streaming && msg.role === 'assistant' && (
                      <button
                        onClick={() => handleReference(msg.content.slice(0, 300))}
                        className="text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 hover:opacity-100 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-all duration-200 cursor-pointer"
                      >
                        Reference
                      </button>
                    )}
                    {msg.created && (
                      <span className="text-[9px] font-semibold tracking-[0.1em] uppercase opacity-30">
                        {formatTime(new Date(msg.created))}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={chatEnd} />
          </div>

          {/* Reference Panel */}
          <ReferencePanel
            references={references}
            onRemove={handleRemoveReference}
            onAskDoubt={handleAskDoubtAboutReference}
          />

          {/* Input bar */}
          <div className="border-t-[4px] border-[var(--bauhaus-black)] px-6 py-4 bg-[var(--surface)]/80 backdrop-blur-sm relative z-10 flex-shrink-0">
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
              className="border-l-[4px] border-[var(--bauhaus-black)] bg-[var(--surface)]/90 backdrop-blur-sm flex flex-col min-w-0"
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
              <div className="flex-1 min-h-0 overflow-y-auto p-5 min-w-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {tab === 'curriculum' && (
                      session.curriculum ? (
                        <div className="p-[2px] rounded-[var(--radius-lg)]" style={{ background: 'var(--glass-border)' }}>
                          <div className="rounded-[calc(var(--radius-lg)-2px)] p-5" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
                            <div className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-4 font-bold">LEARNING PATH</div>
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed" style={{
                              '--tw-prose-body': 'var(--ink)',
                              '--tw-prose-headings': 'var(--ink)',
                              '--tw-prose-bold': 'var(--ink)',
                              '--tw-prose-links': 'var(--accent2)',
                            }}>
                              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{session.curriculum}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[var(--ink-muted)] text-sm">Curriculum being generated...</div>
                      )
                    )}
                    {tab === 'board' && (
                      session.thinkingBoard ? (
                        <div className="p-[2px] rounded-[var(--radius-lg)]" style={{ background: 'var(--glass-border)' }}>
                          <div className="rounded-[calc(var(--radius-lg)-2px)] p-5" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
                            <div className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-4 font-bold">BEHIND THE SCENES</div>
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap" style={{
                              '--tw-prose-body': 'var(--ink)',
                              '--tw-prose-headings': 'var(--ink)',
                              '--tw-prose-bold': 'var(--ink)',
                              '--tw-prose-links': 'var(--accent2)',
                            }}>
                              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{session.thinkingBoard}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[var(--ink-muted)] text-sm">Thinking board...</div>
                      )
                    )}
                    {tab === 'checklist' && (
                      session.checklist ? (
                        <ChecklistPanel checklist={session.checklist} sessionId={id} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[var(--ink-muted)] text-sm">Checklist being generated...</div>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeTest && (
          <QuizPanel
            test={activeTest}
            onClose={() => setActiveTest(null)}
            onMinimize={() => setTestMinimized(!testMinimized)}
            minimized={testMinimized}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
