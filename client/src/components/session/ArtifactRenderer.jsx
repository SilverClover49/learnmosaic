import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'

export default function ArtifactRenderer({ language, code, imageUrl, onReference }) {
  const [copied, setCopied] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isImage = language === 'image'
  const isSvg = language === 'svg'
  const isDiagram = language === 'diagram' || language === 'mermaid'
  const isVisual = language === 'html'
  const isCode = !isImage && !isVisual

  const renderContent = () => {
    if (isImage) {
      return (
        <div className="p-4 flex justify-center">
          <img
            src={imageUrl}
            alt="Generated visual"
            className="max-w-full h-auto rounded-md"
            style={{ maxHeight: '60vh', objectFit: 'contain' }}
          />
        </div>
      )
    }
    if (isSvg) {
      return (
        <div className="p-4 flex justify-center"
          style={{ minHeight: 100 }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(code.replace('<svg', '<svg style="max-width:100%;height:auto;max-height:60vh"'))
          }}
        />
      )
    }
    if (isVisual) {
      return <div className="p-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(code) }} />
    }
    if (isDiagram) {
      return (
        <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--accent2)' }}>
          {code}
        </pre>
      )
    }
    return (
      <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    )
  }

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--glass-border)]"
      style={{ backgroundColor: 'var(--surface-alt)' }}>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500/50" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <span className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className="text-xs text-[var(--ink-muted)] ml-2 font-mono">
          {isImage ? 'image' : isSvg ? 'svg' : language || 'code'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {!isImage && onReference && (
          <button onClick={() => onReference(`\`\`\`${language}\n${code.slice(0, 500)}${code.length > 500 ? '\n...' : ''}\n\`\`\``)}
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded-md hover:bg-[var(--glass-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer">
            Reference
          </button>
        )}
        {!isImage && (
          <button onClick={handleCopy}
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded-md hover:bg-[var(--glass-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        {!isImage && !fullscreen && (
          <button onClick={() => setFullscreen(true)}
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded-md hover:bg-[var(--glass-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
            title="Full screen">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[var(--z-modal)] bg-[var(--bg)] flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b-[3px] border-[var(--bauhaus-black)]"
            style={{ backgroundColor: 'var(--surface-alt)' }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/50" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <span className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="text-xs text-[var(--ink-muted)] ml-2 font-mono">
                {isSvg ? 'svg' : language || 'code'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onReference && (
                <button onClick={() => onReference(`\`\`\`${language}\n${code.slice(0, 500)}${code.length > 500 ? '\n...' : ''}\n\`\`\``)}
                  className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded-md hover:bg-[var(--glass-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer">
                  Reference
                </button>
              )}
              <button onClick={handleCopy}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded-md hover:bg-[var(--glass-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => setFullscreen(false)}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded-md hover:bg-[var(--glass-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                title="Exit full screen">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-[var(--bg)]">
            {renderContent()}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="my-4 p-[2px] rounded-[var(--radius-xl)] group/artifact"
      style={{ background: 'var(--glass-border)' }}
    >
      <div className="rounded-[calc(var(--radius-xl)-2px)] overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-inner)' }}>
        {toolbar}
        <div className="overflow-x-auto">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  )
}