import { motion } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = ['var(--bauhaus-red)', 'var(--bauhaus-blue)', 'var(--bauhaus-yellow)', 'var(--bauhaus-black)']

function Shape({ type, color, size, angle, distance, delay }) {
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * distance
  const y = Math.sin(rad) * distance

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        x, y,
        opacity: [1, 1, 0],
        scale: [0.5, 1.2, 0.3],
        rotate: angle * 2
      }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute pointer-events-none"
      style={{ left: '50%', top: '50%', marginLeft: -size / 2, marginTop: -size / 2 }}
    >
      {type === 'circle' && (
        <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />
      )}
      {type === 'square' && (
        <div style={{ width: size, height: size, backgroundColor: color }} />
      )}
      {type === 'triangle' && (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <path d="M50 0L100 100H0L50 0Z" fill={color} />
        </svg>
      )}
      {type === 'diamond' && (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <path d="M50 0L100 50L50 100L0 50Z" fill={color} />
        </svg>
      )}
    </motion.div>
  )
}

export default function BauhausConfetti({ active, originX = '50%', originY = '50%' }) {
  const pieces = useMemo(() => {
    const types = ['circle', 'square', 'triangle', 'diamond']
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 10,
      angle: (i / 18) * 360 + (Math.random() - 0.5) * 30,
      distance: 60 + Math.random() * 80,
      delay: Math.random() * 0.1
    }))
  }, [])

  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30" style={{ overflow: 'visible' }}>
      <div className="absolute" style={{ left: originX, top: originY }}>
        {pieces.map(p => (
          <Shape key={p.id} {...p} />
        ))}
      </div>
    </div>
  )
}
