import { useEffect, useRef } from 'react'
import { useTheme } from '../../lib/ThemeProvider'

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

    const speedMultiplier = theme.motionSpeed === 'reduced' ? 0.5 : theme.motionSpeed === 'enhanced' ? 1.5 : 1

    const shapes = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 60,
      speedX: (Math.random() - 0.5) * 0.15 * speedMultiplier,
      speedY: (Math.random() - 0.5) * 0.15 * speedMultiplier,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.003 * speedMultiplier,
      type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
      color: ['rgba(230,57,70,0.06)', 'rgba(29,53,87,0.06)', 'rgba(244,211,94,0.06)', 'rgba(0,0,0,0.03)'][Math.floor(Math.random() * 4)],
      opacity: 0.3 + Math.random() * 0.5
    }))

    const draw = () => {
      time += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach(s => {
        s.x += s.speedX
        s.y += s.speedY
        s.rotation += s.rotSpeed

        if (s.x < -s.size) s.x = canvas.width + s.size
        if (s.x > canvas.width + s.size) s.x = -s.size
        if (s.y < -s.size) s.y = canvas.height + s.size
        if (s.y > canvas.height + s.size) s.y = -s.size

        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(s.rotation)
        ctx.globalAlpha = s.opacity * (0.7 + 0.3 * Math.sin(time + s.x * 0.01))
        ctx.fillStyle = s.color

        const radius = theme.cornerRadius || 0

        if (s.type === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (s.type === 'square') {
          if (radius > 0) {
            ctx.beginPath()
            ctx.roundRect(-s.size / 2, -s.size / 2, s.size, s.size, radius)
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
      })

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
      style={{ opacity: 0.8 }}
    />
  )
}
