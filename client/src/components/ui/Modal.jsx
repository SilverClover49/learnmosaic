import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, title, children, actions }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[var(--bauhaus-black)]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-[var(--bauhaus-white)] border-[4px] border-[var(--bauhaus-black)]"
          >
            {title && (
              <div className="px-6 py-4 border-b-[4px] border-[var(--bauhaus-black)]">
                <h3 className="text-3xl font-black uppercase tracking-tight">
                  {title}
                </h3>
              </div>
            )}
            <div className="p-6 text-sm text-[var(--ink)] leading-relaxed">
              {children}
            </div>
            {actions && (
              <div className="px-6 py-4 border-t-[4px] border-[var(--bauhaus-black)] flex justify-end gap-3">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
