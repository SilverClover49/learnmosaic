import { motion } from 'framer-motion'
import { useTheme } from '../../lib/ThemeProvider'

export default function DarkModeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme()

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme({ darkMode: !theme.darkMode })}
      className={`w-10 h-10 flex items-center justify-center border-[3px] border-[var(--bauhaus-black)] cursor-pointer transition-all duration-200 ${
        theme.darkMode ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-yellow)]' : 'bg-[var(--bauhaus-white)] text-[var(--bauhaus-black)]'
      } ${className}`}
      title={theme.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        {theme.darkMode ? (
          <>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        )}
      </svg>
    </motion.button>
  )
}
