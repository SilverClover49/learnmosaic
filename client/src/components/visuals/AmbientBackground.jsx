import { useEffect, useRef } from 'react'
import { useTheme } from '../../lib/ThemeProvider'

const COLORS_LIGHT = [
  'rgba(230,57,70,0.32)',
  'rgba(29,53,87,0.28)',
  'rgba(244,211,94,0.30)',
  'rgba(0,0,0,0.08)'
]

const COLORS_DARK = [
  'rgba(255,77,90,0.22)',
  'rgba(90,141,184,0.20)',
  'rgba(255,217,102,0.18)',
  'rgba(255,255,255,0.05)'
]

const GLOW_COLORS_DARK = [
  'rgba(255,77,90,0.35)',
  'rgba(90,141,184,0.30)',
  'rgba(255,217,102,0.28)',
  'rgba(255,255,255,0.08)'
]

const TYPES = ['circle', 'square', 'triangle']

export default function AmbientBackground({ variant = 'default' }) {
  const { theme } = useTheme()
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!theme.ambientShapes) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let time = 0

    const speedMul = theme.motionSpeed === 'reduced' ? 0.3 : theme.motionSpeed === 'enhanced' ? 2 : 1

    const isDark = document.documentElement.classList.contains('dark-mode')
    const colors = isDark ? COLORS_DARK : COLORS_LIGHT
    const glowColors = isDark ? GLOW_COLORS_DARK : colors

    const shapes = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 40 + Math.random() * 100,
      speedX: (Math.random() - 0.5) * 0.2 * speedMul,
      speedY: (Math.random() - 0.5) * 0.2 * speedMul,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004 * speedMul,
      type: TYPES[Math.floor(Math.random() * 3)],
      color: colors[Math.floor(Math.random() * colors.length)],
      glowColor: glowColors[Math.floor(Math.random() * glowColors.length)],
      glowSize: isDark ? 15 + Math.random() * 20 : 0
    }))

    const preResize = () => {
      const oldW = canvas.width
      const oldH = canvas.height
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (oldW > 0 && oldH > 0) {
        const sx = canvas.width / oldW
        const sy = canvas.height / oldH
        for (const s of shapes) {
          s.x *= sx
          s.y *= sy
        }
      }
    }
    preResize()
    window.addEventListener('resize', preResize)

    const draw = () => {
      time += 0.004
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of shapes) {
        s.x += s.speedX
        s.y += s.speedY
        s.rotation += s.rotSpeed

        const wrap = s.size * 2
        if (s.x < -wrap) s.x = canvas.width + wrap
        if (s.x > canvas.width + wrap) s.x = -wrap
        if (s.y < -wrap) s.y = canvas.height + wrap
        if (s.y > canvas.height + wrap) s.y = -wrap

        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(s.rotation)
        ctx.fillStyle = s.color

        if (isDark) {
          ctx.strokeStyle = 'rgba(255,255,255,0.25)'
          ctx.lineWidth = 1.5
        }

        if (s.glowSize > 0) {
          ctx.shadowColor = s.glowColor
          ctx.shadowBlur = s.glowSize
        }

        ctx.beginPath()

        if (s.type === 'circle') {
          ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2)
        } else if (s.type === 'square') {
          const r = theme.cornerRadius || 0
          if (r > 0) {
            ctx.roundRect(-s.size / 2, -s.size / 2, s.size, s.size, r)
          } else {
            ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size)
          }
        } else {
          ctx.moveTo(0, -s.size / 2)
          ctx.lineTo(s.size / 2, s.size / 2)
          ctx.lineTo(-s.size / 2, s.size / 2)
          ctx.closePath()
        }

        ctx.fill()
        if (isDark) ctx.stroke()

        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', preResize)
    }
  }, [theme.ambientShapes, theme.motionSpeed, theme.cornerRadius, variant])

  if (!theme.ambientShapes) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
