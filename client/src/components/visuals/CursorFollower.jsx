import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'

export default function CursorFollower() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  const springX = useSpring(cursorX, { damping: 25, stiffness: 300 })
  const springY = useSpring(cursorY, { damping: 25, stiffness: 300 })

  const scale = useTransform(
    springX,
    [-100, window.innerWidth / 2, window.innerWidth],
    [1.2, 1, 1.2]
  )

  useEffect(() => {
    const handleMove = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const handleEnter = (e) => {
      if (e.target.closest('button, a, [data-cursor-hover]')) {
        setHovering(true)
      }
    }

    const handleLeave = (e) => {
      if (e.target.closest('button, a, [data-cursor-hover]')) {
        setHovering(false)
      }
    }

    const handleDown = () => setClicking(true)
    const handleUp = () => setClicking(false)
    const handleLeaveWindow = () => setVisible(false)
    const handleEnterWindow = () => setVisible(true)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleEnter)
    window.addEventListener('mouseout', handleLeave)
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)
    document.addEventListener('mouseleave', handleLeaveWindow)
    document.addEventListener('mouseenter', handleEnterWindow)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleEnter)
      window.removeEventListener('mouseout', handleLeave)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      document.removeEventListener('mouseleave', handleLeaveWindow)
      document.removeEventListener('mouseenter', handleEnterWindow)
    }
  }, [])

  if (!visible) return null

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        animate={{
          width: hovering ? 48 : clicking ? 8 : 16,
          height: hovering ? 48 : clicking ? 8 : 16,
          borderRadius: hovering ? '0%' : '50%',
          backgroundColor: hovering ? 'var(--bauhaus-red)' : 'var(--bauhaus-white)',
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />
    </motion.div>
  )
}
