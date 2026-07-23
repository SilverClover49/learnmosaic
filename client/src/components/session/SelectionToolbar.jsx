import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SelectionToolbar({ containerRef, onReference }) {
  const [selection, setSelection] = useState(null)

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection(null)
      return
    }
    const text = sel.toString().trim()
    if (text.length < 3 || text.length > 500) return

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top - 10 })
  }, [])

  useEffect(() => {
    const container = containerRef?.current || document
    container.addEventListener('mouseup', handleMouseUp)
    return () => container.removeEventListener('mouseup', handleMouseUp)
  }, [containerRef, handleMouseUp])

  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{ left: selection.x, top: selection.y }}
          className="fixed z-[var(--z-dropdown)] -translate-x-1/2 -translate-y-full"
        >
          <div className="flex gap-1 bg-[var(--bauhaus-black)] border-2 border-[var(--bauhaus-yellow)]">
            <motion.button
              whileHover={{ backgroundColor: 'var(--bauhaus-yellow)', color: 'var(--bauhaus-black)' }}
              onClick={() => { onReference(selection.text); setSelection(null); window.getSelection()?.removeAllRanges() }}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer transition-colors"
            >
              + Reference
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
