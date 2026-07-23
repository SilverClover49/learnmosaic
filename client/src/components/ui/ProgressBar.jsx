import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, className = '', color = 'red' }) {
  const colors = {
    red: 'bg-[var(--bauhaus-red)]',
    blue: 'bg-[var(--bauhaus-blue)]',
    yellow: 'bg-[var(--bauhaus-yellow)]',
    black: 'bg-[var(--bauhaus-black)]'
  }

  return (
    <div className={`w-full h-3 bg-[var(--surface-alt)] border-[2px] border-[var(--bauhaus-black)] overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${colors[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  )
}
