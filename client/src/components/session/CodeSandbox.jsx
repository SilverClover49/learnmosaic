import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function CodeSandbox({ html, title }) {
  const [height, setHeight] = useState(300)
  const [refreshKey, setRefreshKey] = useState(0)
  const iframeRef = useRef(null)

  const getHistory = () => {
    try { return iframeRef.current?.contentWindow?.history } catch { return null }
  }

  const canGoBack = () => {
    const h = getHistory()
    return h && h.length > 1
  }

  const canGoForward = () => {
    // Browser doesn't expose forward state directly; we track it via a custom stack
    return false
  }

  const handleRefresh = () => setRefreshKey(k => k + 1)

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
        <div className="flex items-center gap-1">
          <button
            onClick={() => { try { iframeRef.current?.contentWindow?.history?.go(-1) } catch {} }}
            className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer transition-colors"
            title="Back"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M19 12H5m7-7l-7 7 7 7"/>
            </svg>
          </button>
          <button
            onClick={() => { try { iframeRef.current?.contentWindow?.history?.go(1) } catch {} }}
            className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer transition-colors"
            title="Forward"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </button>
          <button
            onClick={handleRefresh}
            className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer transition-colors"
            title="Refresh"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </button>
          <div className="w-px h-3 bg-white/20 mx-0.5" />
          <button
            onClick={() => setHeight(h => h === 300 ? 500 : h === 500 ? 200 : 300)}
            className="text-[9px] uppercase tracking-wider text-white/70 hover:text-white cursor-pointer px-1"
          >
            {height === 300 ? 'Expand' : height === 500 ? 'Max' : 'Default'}
          </button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        key={refreshKey}
        title={title || 'sandbox'}
        className="w-full border-0"
        style={{ height, background: '#fff' }}
        sandbox="allow-scripts allow-modals allow-same-origin"
        srcDoc={html}
      />
    </motion.div>
  )
}