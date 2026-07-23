import { motion, AnimatePresence } from 'framer-motion'

export default function ReferencePanel({ references, onRemove, onAskDoubt }) {
  return (
    <AnimatePresence>
      {references.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t-2 border-[var(--bauhaus-black)] bg-[var(--surface-alt)]"
        >
          <div className="px-6 py-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                References ({references.length})
              </span>
              <button
                onClick={() => onRemove(-1)}
                className="text-[10px] text-[var(--ink-dim)] hover:text-[var(--bauhaus-red)] uppercase tracking-wider cursor-pointer"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {references.map((ref, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative max-w-[200px] border-2 border-[var(--bauhaus-black)] bg-[var(--surface)]"
                >
                  <div className="px-2 py-1.5 pr-6">
                    <span className="text-[10px] leading-tight line-clamp-2 text-[var(--ink)] block">
                      "{ref.slice(0, 80)}{ref.length > 80 ? '...' : ''}"
                    </span>
                  </div>
                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={() => onAskDoubt(ref)}
                      className="w-4 h-4 flex items-center justify-center bg-[var(--bauhaus-yellow)] cursor-pointer"
                      title="Ask about this"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M4 1v6M1 4h6" stroke="var(--bauhaus-black)" strokeWidth="1.5"/>
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={() => onRemove(i)}
                      className="w-4 h-4 flex items-center justify-center bg-[var(--bauhaus-red)] cursor-pointer"
                      title="Remove"
                    >
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 1l4 4M5 1l-4 4" stroke="white" strokeWidth="1.5"/>
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
