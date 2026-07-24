import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let activeMenus = new Set()

function closeAllMenus() {
  activeMenus.forEach(fn => fn(false))
  activeMenus.clear()
}

export default function SessionMenu({ session, onDelete, onRename, onToggleFavorite }) {
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(session.name || '')
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      activeMenus.add(setOpen)
      const handler = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          closeAllMenus()
        }
      }
      document.addEventListener('mousedown', handler, { once: true })
      return () => {
        document.removeEventListener('mousedown', handler)
        activeMenus.delete(setOpen)
      }
    }
  }, [open])

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renaming])

  const handleRename = () => {
    if (newName.trim() && newName !== session.name) {
      onRename(session.id, newName.trim())
    }
    setRenaming(false)
    setOpen(false)
  }

  return (
    <div ref={ref} className="absolute bottom-4 right-4 z-30">
      <button
        className="w-8 h-8 bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-90"
        onClick={(e) => {
          e.stopPropagation()
          if (open) {
            closeAllMenus()
          } else {
            closeAllMenus()
            setOpen(true)
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="7" cy="2.5" r="1.5" />
          <circle cx="7" cy="7" r="1.5" />
          <circle cx="7" cy="11.5" r="1.5" />
        </svg>
      </button>

      <AnimatePresence>
        {open && !renaming && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-44 bg-[var(--bauhaus-black)] border-[2px] border-[var(--bauhaus-black)] shadow-xl z-40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-[var(--bauhaus-white)] hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => { onToggleFavorite(session.id, !session.favorite); closeAllMenus() }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill={session.favorite ? 'var(--bauhaus-yellow)' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5Z" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
              {session.favorite ? 'REMOVE FAVORITE' : 'FAVORITE'}
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-[var(--bauhaus-white)] hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setRenaming(true)}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12v2h2l9-9-2-2-9 9Z" strokeLinecap="square"/>
                <path d="M11 3l2 2" strokeLinecap="square"/>
              </svg>
              RENAME
            </button>
            <div className="border-t-[1px] border-white/20" />
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-[var(--bauhaus-red)] hover:bg-red-500/10 transition-colors cursor-pointer"
              onClick={() => { closeAllMenus(); onDelete(session) }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M5 4V2a1 1 0 011-1h4a1 1 0 011 1v2M13 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4" strokeLinecap="square"/>
              </svg>
              DELETE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {renaming && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-56 bg-[var(--surface)] border-[2px] border-[var(--bauhaus-black)] shadow-xl z-40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] mb-2">RENAME SESSION</p>
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false) }}
                className="w-full px-3 py-2 text-sm border-[2px] border-[var(--bauhaus-black)] outline-none mb-2"
                placeholder="Session name"
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 text-[10px] uppercase tracking-wider bg-[var(--bauhaus-black)] text-white cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleRename}
                >SAVE</button>
                <button
                  className="flex-1 py-2 text-[10px] uppercase tracking-wider border-[2px] border-[var(--bauhaus-black)] cursor-pointer hover:bg-[var(--surface-alt)] transition-colors"
                  onClick={() => { setRenaming(false); setNewName(session.name); closeAllMenus() }}
                >CANCEL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
