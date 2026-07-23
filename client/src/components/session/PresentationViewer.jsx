import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

export default function PresentationViewer({ title, slides }) {
  const [current, setCurrent] = useState(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-[3px] border-[var(--bauhaus-black)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bauhaus-black)] text-white">
        <span className="text-xs font-bold uppercase tracking-wider truncate">{title}</span>
        <span className="text-[10px] text-white/70 ml-2">{current + 1} / {slides.length}</span>
      </div>
      <div className="relative min-h-[250px] bg-[var(--bauhaus-white)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <div className="prose max-w-none text-sm" style={{
              '--tw-prose-body': '#1a1a1a',
              '--tw-prose-headings': '#1a1a1a',
              '--tw-prose-bold': '#1a1a1a',
              '--tw-prose-links': '#cc3333',
              '--tw-prose-code': '#cc3333',
              '--tw-prose-code-bg': '#f0f0f0',
            }}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{slides[current]}</ReactMarkdown>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t-[2px] border-[var(--bauhaus-black)] bg-[var(--surface-alt)]">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrent(i => Math.max(0, i - 1))}
          disabled={current === 0}
          className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-[var(--bauhaus-black)] disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[var(--bauhaus-yellow)] transition-colors"
        >
          ← Prev
        </motion.button>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 border-2 border-[var(--bauhaus-black)] transition-colors cursor-pointer ${i === current ? 'bg-[var(--bauhaus-black)]' : 'bg-transparent hover:bg-[var(--bauhaus-yellow)]'}`}
            />
          ))}
        </div>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrent(i => Math.min(slides.length - 1, i + 1))}
          disabled={current === slides.length - 1}
          className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-2 border-[var(--bauhaus-black)] disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[var(--bauhaus-yellow)] transition-colors"
        >
          Next →
        </motion.button>
      </div>
    </motion.div>
  )
}
