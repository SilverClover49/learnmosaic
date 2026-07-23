import { motion } from 'framer-motion'

export default function Card({ children, className = '', color = 'default', hover = true, onClick, cornerRule = false, ...props }) {
  const colors = {
    default: 'bg-[var(--surface)]',
    red: 'bg-[var(--bauhaus-red)] text-[var(--bauhaus-white)]',
    blue: 'bg-[var(--bauhaus-blue)] text-[var(--bauhaus-white)]',
    yellow: 'bg-[var(--bauhaus-yellow)] text-[var(--bauhaus-black)]',
    black: 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]',
    white: 'bg-[var(--bauhaus-white)] border-[4px] border-[var(--bauhaus-black)]'
  }

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className={`
        ${colors[color]}
        ${onClick ? 'cursor-pointer' : ''}
        ${cornerRule ? 'corner-rule' : ''}
        transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
