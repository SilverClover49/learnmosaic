import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

export default function MagneticButton({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type, ...props }) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * 0.15
    const deltaY = (e.clientY - centerY) * 0.15
    x.set(deltaX)
    y.set(deltaY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const base = 'group inline-flex items-center justify-center font-medium transition-colors duration-200 uppercase tracking-wider relative overflow-hidden'

  const variants = {
    primary: 'bg-[var(--bauhaus-red)] text-[var(--bauhaus-white)]',
    secondary: 'bg-transparent border-[4px] border-[var(--bauhaus-black)] text-[var(--ink)]',
    ghost: 'text-[var(--ink)]',
    accent: 'bg-[var(--bauhaus-blue)] text-[var(--bauhaus-white)]',
    yellow: 'bg-[var(--bauhaus-yellow)] text-[var(--bauhaus-black)]'
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  }

  return (
    <motion.button
      ref={ref}
      type={type || 'button'}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {/* Ripple effect */}
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={isHovered ? { scale: 2.5, opacity: 0 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ borderRadius: '50%', transformOrigin: 'center' }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {typeof children === 'string' && /[→]/.test(children) && (
          <span className="w-5 h-5 bg-white/15 flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-105">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        )}
      </span>
    </motion.button>
  )
}
