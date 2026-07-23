import { useState } from 'react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'

export default function ArtifactRenderer({ language, code, imageUrl, onReference }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isImage = language === 'image'
  const isSvg = language === 'svg'
  const isDiagram = language === 'diagram' || language === 'mermaid'
  const isVisual = language === 'html'

  const referenceLabel = isSvg ? `SVG diagram${code.match(/viewBox="[^"]*"?\s*width="([^"]*)"/)?.[1] ? ` (${code.match(/viewBox="[^"]*"?\s*width="([^"]*)"/)[1]})` : ''}` : null

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
          </div>
        </div>
        <div className="overflow-x-auto">
          {isImage ? (
            <div className="p-4 flex justify-center">
              <img
                src={imageUrl}
                alt="Generated visual"
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: '60vh', objectFit: 'contain' }}
              />
            </div>
          ) : isSvg ? (
            <div className="p-4 flex justify-center"
              style={{ minHeight: 100 }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(code.replace('<svg', '<svg style="max-width:100%;height:auto;max-height:60vh"'))
              }}
            />
          ) : isVisual ? (
            <div className="p-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(code) }} />
          ) : isDiagram ? (
            <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--accent2)' }}>
              {code}
            </pre>
          ) : (
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    </motion.div>
  )
}
