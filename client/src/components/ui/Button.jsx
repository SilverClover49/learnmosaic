import { motion } from 'framer-motion'

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type, icon, ...props }) {
  const base = 'group inline-flex items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] active:scale-[0.98] uppercase tracking-wider'

  const variants = {
    primary: 'bg-[var(--bauhaus-red)] text-[var(--bauhaus-white)] hover:brightness-110',
    secondary: 'bg-transparent border-[4px] border-[var(--bauhaus-black)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bauhaus-white)]',
    ghost: 'text-[var(--ink)] hover:text-[var(--bauhaus-red)] border-b-2 border-transparent hover:border-[var(--bauhaus-red)]',
    accent: 'bg-[var(--bauhaus-blue)] text-[var(--bauhaus-white)] hover:brightness-110',
    yellow: 'bg-[var(--bauhaus-yellow)] text-[var(--bauhaus-black)] hover:brightness-105'
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  }

  const hasIcon = icon || (typeof children === 'string' && /[→↗➔]/.test(children))

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type || 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {hasIcon ? (
        <span className="flex items-center gap-3">
          <span>{children}</span>
          {icon ? (
            <span className="w-6 h-6 bg-white/20 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
              {icon}
            </span>
          ) : (
            <span className="w-6 h-6 bg-white/20 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          )}
        </span>
      ) : children}
    </motion.button>
  )
}
