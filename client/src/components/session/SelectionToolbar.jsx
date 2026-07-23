import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SelectionToolbar({ containerRef, onAskDoubt }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const toolbarRef = useRef(null)

  useEffect(() => {
    const handleMouseUp = (e) => {
      // Wait a tick for selection to settle
      setTimeout(() => {
        const sel = window.getSelection()
        const text = sel?.toString()?.trim()
        if (!text || text.length < 3) {
          setShow(false)
          return
        }

        // Check selection is inside our container
        const container = containerRef?.current
        if (!container || !container.contains(sel?.anchorNode)) {
          setShow(false)
          return
        }

        // Position toolbar near selection
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        setSelectedText(text)
        setPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 8
        })
        setShow(true)
      }, 10)
    }

    const handleMouseDown = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setShow(false)
      }
    }

    const container = containerRef?.current
    if (container) {
      container.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousedown', handleMouseDown)
    }

    return () => {
      if (container) container.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [containerRef])

  const handleAsk = () => {
    onAskDoubt(selectedText)
    setShow(false)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 pointer-events-auto"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button
            onClick={handleAsk}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bauhaus-black)] text-white text-[11px] uppercase tracking-wider font-bold whitespace-nowrap cursor-pointer hover:bg-[var(--bauhaus-red)] transition-colors shadow-lg"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v3M8 11v-1" strokeLinecap="square" />
            </svg>
            ASK DOUBT
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
