import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/MagneticButton'
import Modal from '../components/ui/Modal'
import BauhausConfetti from '../components/ui/BauhausConfetti'
import { toast } from '../components/ui/Toast'
import AmbientBackground from '../components/visuals/AmbientBackground'
import RevealText, { StaggerReveal, StaggerItem } from '../components/ui/Reveal'
import SessionMenu from '../components/session/SessionMenu'
import ProfilePanel from '../components/dashboard/ProfilePanel'
import ColorPicker from '../components/visuals/ColorPicker'
import { useTheme } from '../lib/ThemeProvider'
import { api } from '../lib/api'

const cardColors = ['red', 'blue', 'yellow', 'black']

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [sessions, setSessions] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('learnmosaic-user') || 'null')
    setUser(u)
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await api.listSessions()
      setSessions(data || [])
    } catch (e) {
      console.warn('Failed to load sessions:', e)
    }
    setLoading(false)
  }

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    setDeleteTarget(null)
    setDeletingId(targetId)
    setTimeout(async () => {
      try {
        await api.deleteSession(targetId)
        setSessions(prev => prev.filter(s => s.id !== targetId))
        toast({ message: 'Session deleted', duration: 3000 })
      } catch {}
      setDeletingId(null)
    }, 650)
  }, [deleteTarget])

  const handleRename = async (id, newName) => {
    try {
      await api.updateSession(id, { name: newName })
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s))
      toast({ message: 'Renamed!', duration: 2000 })
    } catch {}
  }

  const handleToggleFavorite = async (id, favorite) => {
    try {
      await api.updateSession(id, { favorite })
      setSessions(prev => prev.map(s => s.id === id ? { ...s, favorite } : s))
    } catch {}
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    return 0
  })

  return (
    <PageTransition className="min-h-[100dvh] relative overflow-hidden">
      <AmbientBackground />
      <div className="color-dna-strip z-10 relative">
        <div /><div /><div /><div /><div />
      </div>

      <ProfilePanel user={user} sessions={sessions} open={showProfile} onClose={() => setShowProfile(false)} />

      <AnimatePresence>
        {showPicker && <ColorPicker onClose={() => setShowPicker(false)} />}
      </AnimatePresence>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="DELETE?"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>CANCEL</Button>
            <Button size="sm" onClick={confirmDelete}>DELETE FOREVER</Button>
          </>
        }
      >
        <p>This will permanently delete <strong>"{deleteTarget?.goal}"</strong>. Cannot be undone.</p>
      </Modal>

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="flex items-end justify-between mb-12 border-b-[4px] border-[var(--bauhaus-black)] pb-6">
          <div className="flex items-end gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-[var(--bauhaus-yellow)] flex items-center justify-center cursor-pointer mb-1"
              onClick={() => setShowProfile(!showProfile)}
            >
              <span className="text-lg font-black text-[var(--bauhaus-black)]">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </motion.button>
            <RevealText>
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)] mb-1 block">
                Dashboard
              </span>
              <h1 className="type-h1">
                Welcome back{user ? `, ${user.name}` : ''}
              </h1>
            </RevealText>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme({ darkMode: !theme.darkMode })}
              className={`w-10 h-10 flex items-center justify-center border-[3px] border-[var(--bauhaus-black)] cursor-pointer transition-all duration-200
                ${theme.darkMode ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-yellow)]' : 'bg-[var(--bauhaus-white)] text-[var(--bauhaus-black)]'}`}
              title={theme.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                {theme.darkMode ? (
                  <>
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </>
                ) : (
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                )}
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPicker(!showPicker)}
              className="w-10 h-10 bg-[var(--bauhaus-yellow)] border-[3px] border-[var(--bauhaus-black)] flex items-center justify-center cursor-pointer hover:bg-[var(--bauhaus-red)] transition-all duration-200"
              title="Design settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </motion.button>
            <Button onClick={() => navigate('/onboarding')}>
              NEW SESSION +
            </Button>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-[var(--surface)] border-[2px] border-[var(--bauhaus-black)] animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-32"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 mx-auto mb-8 bg-[var(--bauhaus-yellow)] flex items-center justify-center"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="4" width="14" height="14" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                <rect x="22" y="4" width="14" height="14" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                <rect x="4" y="22" width="14" height="14" stroke="var(--bauhaus-black)" strokeWidth="2"/>
                <rect x="22" y="22" width="14" height="14" fill="var(--bauhaus-black)"/>
              </svg>
            </motion.div>
            <h2 className="type-h2 mb-3">NO SESSIONS YET</h2>
            <p className="text-[var(--ink-muted)] mb-10 max-w-sm mx-auto">Start your first learning adventure — your AI tutor is ready.</p>
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              BEGIN LEARNING
            </Button>
          </motion.div>
        ) : (
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {sortedSessions.map((session, i) => {
              const isDeleting = deletingId === session.id
              return (
                <StaggerItem key={session.id}>
                  <div className="group relative">
                    <BauhausConfetti active={isDeleting} />

                    <motion.div
                      onClick={() => !isDeleting && navigate(`/session/${session.id}`)}
                      animate={isDeleting ? {
                        scale: [1, 1.08, 0],
                        opacity: [1, 1, 0],
                        rotate: [0, -3, 8],
                        filter: ['blur(0px)', 'blur(0px)', 'blur(6px)']
                      } : {}}
                      transition={isDeleting ? { duration: 0.6, ease: [0.4, 0, 0.2, 1] } : {}}
                      whileHover={!isDeleting ? { scale: 1.01, zIndex: 10 } : {}}
                      whileTap={!isDeleting ? { scale: 0.99 } : {}}
                      className={`
                        p-8 border-[2px] border-[var(--bauhaus-black)] cursor-pointer
                        transition-all duration-200 relative overflow-visible
                        ${cardColors[i % cardColors.length] === 'red' ? 'bg-[var(--bauhaus-red)] text-[var(--bauhaus-white)]' : ''}
                        ${cardColors[i % cardColors.length] === 'blue' ? 'bg-[var(--bauhaus-blue)] text-[var(--bauhaus-white)]' : ''}
                        ${cardColors[i % cardColors.length] === 'yellow' ? 'bg-[var(--bauhaus-yellow)] text-[var(--bauhaus-black)]' : ''}
                        ${cardColors[i % cardColors.length] === 'black' ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]' : ''}
                      `}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)'
                        }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <motion.div
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="w-10 h-10 bg-white/20 flex items-center justify-center"
                          >
                            {session.favorite ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--bauhaus-yellow)" stroke="currentColor" strokeWidth="1.5">
                                <path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5Z" strokeLinecap="square"/>
                              </svg>
                            ) : session.status === 'completed' ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                              </svg>
                            )}
                          </motion.div>
                          <span className="text-[10px] uppercase tracking-wider font-medium">
                            {session.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 line-clamp-1 uppercase">{session.goal}</h3>
                        <p className="text-sm opacity-70 mb-6 line-clamp-2">
                          {session.interests?.join(', ') || 'Personalized learning'}
                        </p>
                        <div className="flex items-center justify-between text-xs opacity-60 uppercase tracking-wider">
                          <span>{session.timeframe || 'flexible'}</span>
                          <span>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    </motion.div>

                    <SessionMenu
                      session={session}
                      onDelete={setDeleteTarget}
                      onRename={handleRename}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerReveal>
        )}
      </div>
    </PageTransition>
  )
}
