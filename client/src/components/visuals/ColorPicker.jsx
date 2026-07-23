import { motion } from 'framer-motion'
import { useTheme } from '../../lib/ThemeProvider'

const textures = [
  { id: 'kandinsky', name: 'Shapes', desc: 'Geometric pattern' },
  { id: 'noise', name: 'Noise', desc: 'Subtle grain' },
  { id: 'grain', name: 'Film', desc: 'Heavy grain' },
  { id: 'none', name: 'Clean', desc: 'No texture' }
]

const densities = [
  { id: 'compact', name: 'Compact', desc: 'Tight spacing' },
  { id: 'standard', name: 'Standard', desc: 'Balanced' },
  { id: 'spacious', name: 'Spacious', desc: 'Open breathing room' }
]

const borderWeights = [
  { value: 2, name: 'Light' },
  { value: 4, name: 'Standard' },
  { value: 6, name: 'Heavy' }
]

const cornerOptions = [
  { value: 0, name: 'Sharp', desc: 'Pure Bauhaus' },
  { value: 2, name: 'Soft', desc: 'Slight ease' },
  { value: 4, name: 'Rounded', desc: 'Gentle corners' }
]

const motionOptions = [
  { id: 'reduced', name: 'Minimal', desc: 'Subtle movement' },
  { id: 'standard', name: 'Standard', desc: 'Natural flow' },
  { id: 'enhanced', name: 'Expressive', desc: 'Dynamic motion' }
]

export default function ColorPicker({ onClose }) {
  const { theme, setTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-20 right-6 z-[var(--z-dropdown)] w-80 border-[4px] border-[var(--bauhaus-black)] bg-[var(--surface)]"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider">Design System</h3>
          <motion.button
            whileHover={{ rotate: 90, color: 'var(--bauhaus-red)' }}
            onClick={onClose}
            className="cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
            </svg>
          </motion.button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b-[2px] border-[var(--bauhaus-black)]">
          <div>
            <span className="text-[10px] text-[var(--ink)] uppercase tracking-[0.15em] font-bold block">Dark Mode</span>
            <span className="text-[9px] text-[var(--ink-muted)]">Switch color theme</span>
          </div>
          <motion.button
            onClick={() => setTheme({ darkMode: !theme.darkMode })}
            className={`w-11 h-5 transition-all duration-200 cursor-pointer relative border-[2px] border-[var(--bauhaus-black)]
              ${theme.darkMode ? 'bg-[var(--bauhaus-black)]' : 'bg-[var(--surface)]'}`}
          >
            <motion.div
              animate={{ x: theme.darkMode ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-3 h-3 bg-[var(--bauhaus-yellow)] absolute top-[3px]"
            />
          </motion.button>
        </div>

        {/* Texture */}
        <div className="mb-5">
          <label className="text-[10px] text-[var(--ink-muted)] block mb-2 uppercase tracking-[0.15em] font-bold">Texture</label>
          <div className="grid grid-cols-4 gap-0 border-[2px] border-[var(--bauhaus-black)]">
            {textures.map(t => (
              <motion.button
                key={t.id}
                onClick={() => setTheme({ texture: t.id })}
                whileHover={{ backgroundColor: theme.texture !== t.id ? 'var(--surface-alt)' : undefined }}
                className={`px-2 py-2 text-center transition-all duration-200 cursor-pointer border-r-[2px] border-[var(--bauhaus-black)] last:border-r-0
                  ${theme.texture === t.id
                    ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                    : 'text-[var(--ink-muted)]'}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">{t.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Density */}
        <div className="mb-5">
          <label className="text-[10px] text-[var(--ink-muted)] block mb-2 uppercase tracking-[0.15em] font-bold">Density</label>
          <div className="grid grid-cols-3 gap-0 border-[2px] border-[var(--bauhaus-black)]">
            {densities.map(d => (
              <motion.button
                key={d.id}
                onClick={() => setTheme({ density: d.id })}
                whileHover={{ backgroundColor: theme.density !== d.id ? 'var(--surface-alt)' : undefined }}
                className={`px-2 py-2 text-center transition-all duration-200 cursor-pointer border-r-[2px] border-[var(--bauhaus-black)] last:border-r-0
                  ${theme.density === d.id
                    ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                    : 'text-[var(--ink-muted)]'}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">{d.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Border Weight */}
        <div className="mb-5">
          <label className="text-[10px] text-[var(--ink-muted)] block mb-2 uppercase tracking-[0.15em] font-bold">Border Weight</label>
          <div className="grid grid-cols-3 gap-0 border-[2px] border-[var(--bauhaus-black)]">
            {borderWeights.map(b => (
              <motion.button
                key={b.value}
                onClick={() => setTheme({ borderWeight: b.value })}
                whileHover={{ backgroundColor: theme.borderWeight !== b.value ? 'var(--surface-alt)' : undefined }}
                className={`px-2 py-2 text-center transition-all duration-200 cursor-pointer border-r-[2px] border-[var(--bauhaus-black)] last:border-r-0
                  ${theme.borderWeight === b.value
                    ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                    : 'text-[var(--ink-muted)]'}`}
              >
                <div className="flex items-center justify-center gap-1">
                  <div className="bg-current" style={{ width: 12, height: b.value }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{b.name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Corner Radius */}
        <div className="mb-5">
          <label className="text-[10px] text-[var(--ink-muted)] block mb-2 uppercase tracking-[0.15em] font-bold">Corners</label>
          <div className="grid grid-cols-3 gap-0 border-[2px] border-[var(--bauhaus-black)]">
            {cornerOptions.map(c => (
              <motion.button
                key={c.value}
                onClick={() => setTheme({ cornerRadius: c.value })}
                whileHover={{ backgroundColor: theme.cornerRadius !== c.value ? 'var(--surface-alt)' : undefined }}
                className={`px-2 py-2 text-center transition-all duration-200 cursor-pointer border-r-[2px] border-[var(--bauhaus-black)] last:border-r-0
                  ${theme.cornerRadius === c.value
                    ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                    : 'text-[var(--ink-muted)]'}`}
              >
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-current" style={{ borderRadius: c.value }} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider mt-1">{c.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Motion */}
        <div className="mb-5">
          <label className="text-[10px] text-[var(--ink-muted)] block mb-2 uppercase tracking-[0.15em] font-bold">Motion</label>
          <div className="grid grid-cols-3 gap-0 border-[2px] border-[var(--bauhaus-black)]">
            {motionOptions.map(m => (
              <motion.button
                key={m.id}
                onClick={() => setTheme({ motionSpeed: m.id })}
                whileHover={{ backgroundColor: theme.motionSpeed !== m.id ? 'var(--surface-alt)' : undefined }}
                className={`px-2 py-2 text-center transition-all duration-200 cursor-pointer border-r-[2px] border-[var(--bauhaus-black)] last:border-r-0
                  ${theme.motionSpeed === m.id
                    ? 'bg-[var(--bauhaus-black)] text-[var(--bauhaus-white)]'
                    : 'text-[var(--ink-muted)]'}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">{m.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Ambient Shapes Toggle */}
        <div className="flex items-center justify-between py-3 border-t-[2px] border-[var(--bauhaus-black)]">
          <div>
            <span className="text-[10px] text-[var(--ink)] uppercase tracking-[0.15em] font-bold block">Ambient Shapes</span>
            <span className="text-[9px] text-[var(--ink-muted)]">Floating background geometry</span>
          </div>
          <motion.button
            onClick={() => setTheme({ ambientShapes: !theme.ambientShapes })}
            className={`w-11 h-5 transition-all duration-200 cursor-pointer relative border-[2px] border-[var(--bauhaus-black)]
              ${theme.ambientShapes ? 'bg-[var(--bauhaus-red)]' : 'bg-[var(--surface)]'}`}
          >
            <motion.div
              animate={{ x: theme.ambientShapes ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-3 h-3 bg-[var(--bauhaus-black)] absolute top-[3px]"
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
