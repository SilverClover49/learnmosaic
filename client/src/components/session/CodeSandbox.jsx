import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CodeSandbox({ html, title }) {
  const iframeRef = useRef(null)
  const [height, setHeight] = useState(300)

  useEffect(() => {
    if (!iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
  }, [html])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-[3px] border-[var(--bauhaus-black)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bauhaus-black)] text-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--bauhaus-red)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--bauhaus-yellow)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--bauhaus-blue)]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider ml-2 truncate">{title || 'Code Sandbox'}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setHeight(h => h === 300 ? 500 : h === 500 ? 200 : 300)}
            className="text-[9px] uppercase tracking-wider text-white/70 hover:text-white cursor-pointer"
          >
            {height === 300 ? 'Expand' : height === 500 ? 'Max' : 'Default'}
          </button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title={title || 'sandbox'}
        className="w-full border-0"
        style={{ height, background: '#fff' }}
        sandbox="allow-scripts allow-modals"
      />
    </motion.div>
  )
}
