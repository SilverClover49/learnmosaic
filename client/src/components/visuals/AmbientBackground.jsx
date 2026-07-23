import { useEffect, useRef } from 'react'
import { useTheme } from '../../lib/ThemeProvider'

const COLORS = [
  'rgba(230,57,70,0.25)',
  'rgba(29,53,87,0.22)',
  'rgba(244,211,94,0.20)',
  'rgba(0,0,0,0.10)'
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

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const speedMul = theme.motionSpeed === 'reduced' ? 0.3 : theme.motionSpeed === 'enhanced' ? 2 : 1

    const shapes = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 40 + Math.random() * 100,
      speedX: (Math.random() - 0.5) * 0.2 * speedMul,
      speedY: (Math.random() - 0.5) * 0.2 * speedMul,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004 * speedMul,
      type: TYPES[Math.floor(Math.random() * 3)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }))

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

        if (s.type === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (s.type === 'square') {
          const r = theme.cornerRadius || 0
          if (r > 0) {
            ctx.beginPath()
            ctx.roundRect(-s.size / 2, -s.size / 2, s.size, s.size, r)
            ctx.fill()
          } else {
            ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size)
          }
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -s.size / 2)
          ctx.lineTo(s.size / 2, s.size / 2)
          ctx.lineTo(-s.size / 2, s.size / 2)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
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
