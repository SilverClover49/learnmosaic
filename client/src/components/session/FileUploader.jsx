import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../lib/api'

export default function FileUploader({ sessionId }) {
  const [uploading, setUploading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    setUploading(true)
    try { await api.uploadFile(sessionId, file) } catch {}
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setShowMenu(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={uploading}
        className="w-10 h-10 border-[3px] border-[var(--bauhaus-black)] bg-[var(--bauhaus-white)] flex items-center justify-center cursor-pointer hover:bg-[var(--bauhaus-yellow)] transition-all duration-200 shrink-0 disabled:opacity-50"
        title="Attach materials"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-[var(--bauhaus-black)] border-t-transparent animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bauhaus-black)" strokeWidth="2" strokeLinecap="square">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        )}
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="absolute bottom-full left-0 mb-2 w-56 p-[2px] rounded-[var(--radius-xl)] shadow-2xl"
            style={{ background: 'var(--glass-border)' }}
          >
            <div className="rounded-[calc(var(--radius-xl)-2px)] p-4"
              style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
              <p className="text-xs text-[var(--ink-muted)] mb-3">Upload learning materials</p>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-[var(--glass-border)] rounded-[var(--radius-lg)] p-5 text-center text-xs text-[var(--ink-muted)] mb-3 cursor-pointer hover:border-[var(--accent)] transition-all duration-700"
                onClick={() => inputRef.current?.click()}
              >
                Drop files here or click to browse
              </div>
              <input ref={inputRef} type="file" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleFile(f); setShowMenu(false) }}}
                accept=".pdf,.doc,.docx,.txt,.mp4,.mov,.png,.jpg,.md" />
              <p className="text-[10px] text-[var(--ink-dim)]">Supports PDF, DOC, TXT, MP4, images, markdown</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
