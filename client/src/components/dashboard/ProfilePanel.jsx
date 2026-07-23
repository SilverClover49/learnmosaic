import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/MagneticButton'
import { toast } from '../ui/Toast'
import { api } from '../../lib/api'

export default function ProfilePanel({ user, sessions, open, onClose }) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const total = sessions.length
  const completed = sessions.filter(s => s.status === 'completed').length
  const favorites = sessions.filter(s => s.favorite).length

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false)
    setDeleting(true)
    try {
      await api.deleteAccount(user.id)
      localStorage.removeItem('learnmosaic-user')
      toast({ message: 'Account deleted', duration: 3000 })
      navigate('/')
    } catch {
      toast({ message: 'Failed to delete account', duration: 4000 })
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 h-full w-72 z-30 flex flex-col"
            style={{ backgroundColor: 'var(--bg)', borderRight: '4px solid var(--bauhaus-black)' }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-8 h-8 bg-[var(--bauhaus-black)] text-white flex items-center justify-center cursor-pointer z-10"
              onClick={onClose}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Avatar */}
              <div className="mb-8 mt-4">
                <div className="w-20 h-20 bg-[var(--bauhaus-yellow)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-black text-[var(--bauhaus-black)]">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <h2 className="text-center text-xl font-bold uppercase">{user?.name || 'Learner'}</h2>
                {user?.age && (
                  <p className="text-center text-sm text-[var(--ink-muted)] mt-1">Age {user.age}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-0 border-[3px] border-[var(--bauhaus-black)] mb-8">
                {[
                  { label: 'Sessions', value: total },
                  { label: 'Done', value: completed },
                  { label: 'Saved', value: favorites }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 text-center ${i < 2 ? 'border-r-[3px] border-[var(--bauhaus-black)]' : ''}`}>
                    <div className="text-2xl font-black" style={{ color: 'var(--bauhaus-red)' }}>{stat.value}</div>
                    <div className="text-[9px] text-[var(--ink-muted)] uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Exit */}
              <div className="mb-8">
                <button
                  onClick={() => { localStorage.removeItem('learnmosaic-user'); navigate('/') }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm uppercase tracking-wider border-[2px] border-[var(--bauhaus-black)] text-[var(--bauhaus-red)] hover:bg-[var(--bauhaus-red)] hover:text-white transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" strokeLinecap="square"/>
                  </svg>
                  EXIT
                </button>
              </div>

              {/* Danger zone */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] mb-3">DANGER ZONE</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className="w-full px-4 py-3 text-sm uppercase tracking-wider border-[2px] border-[var(--bauhaus-red)] text-[var(--bauhaus-red)] text-center hover:bg-[var(--bauhaus-red)] hover:text-white transition-all cursor-pointer disabled:opacity-40"
                >
                  {deleting ? 'DELETING...' : 'DELETE ACCOUNT'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t-[3px] border-[var(--bauhaus-black)]">
              <p className="text-[9px] text-[var(--ink-muted)] uppercase tracking-wider text-center">
                LearnMosaic
              </p>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <Modal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="DELETE ACCOUNT?"
            actions={
              <>
                <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>CANCEL</Button>
                <Button size="sm" onClick={handleDeleteAccount}>YES, DELETE EVERYTHING</Button>
              </>
            }
          >
            <p>This will permanently delete your profile, all {total} session{total !== 1 ? 's' : ''}, messages, milestones, and learning data. This cannot be undone.</p>
          </Modal>
        </>
      )}
    </AnimatePresence>
  )
}
