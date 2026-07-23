import { useState, useEffect } from 'react'

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function Timer() {
  const [clock, setClock] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-2 px-3 py-1 border border-white/20">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="1" y="1" width="8" height="8" stroke="var(--bauhaus-blue)" strokeWidth="1.5"/>
      </svg>
      <span className="text-xs font-mono tracking-wider">{formatTime(clock)}</span>
    </div>
  )
}
