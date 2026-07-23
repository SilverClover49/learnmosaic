import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let toastId = 0
let addToastFn = null

export function toast({ message, action, duration = 8000 }) {
  if (addToastFn) addToastFn({ id: ++toastId, message, action, duration })
}

function ToastItem({ item, onDismiss }) {
  const [progress, setProgress] = useState(100)
  const startTime = useRef(Date.now())

  useEffect(() => {
    if (item.duration <= 0) return
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current
      const remaining = Math.max(0, 100 - (elapsed / item.duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onDismiss(item.id)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [item.duration, item.id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)] overflow-hidden relative"
    >
      <div className="px-5 py-3 flex items-center gap-4 relative z-10">
        <p className="text-sm font-medium flex-1">{item.message}</p>
        {item.action && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { item.action.onClick(); onDismiss(item.id) }}
            className="text-sm font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors text-[var(--bauhaus-yellow)] hover:text-[var(--bauhaus-white)]"
          >
            {item.action.label}
          </motion.button>
        )}
        <motion.button
          whileHover={{ rotate: 90, color: 'var(--bauhaus-red)' }}
          onClick={() => onDismiss(item.id)}
          className="cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </motion.button>
      </div>
      {/* Progress bar */}
      {item.duration > 0 && (
        <div className="h-[2px] bg-white/10">
          <motion.div
            className="h-full bg-[var(--bauhaus-yellow)]"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default function ToastContainer() {
  const [items, setItems] = useState([])

  const add = useCallback((item) => {
    setItems(prev => [...prev, item])
  }, [])

  useEffect(() => { addToastFn = add; return () => { addToastFn = null } }, [add])

  const dismiss = (id) => setItems(prev => prev.filter(t => t.id !== id))

  return (
    <div className="fixed bottom-6 right-6 z-[var(--z-toast)] flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {items.map(item => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
