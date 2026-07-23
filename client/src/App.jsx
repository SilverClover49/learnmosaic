import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'
import Curriculum from './pages/Curriculum'
import Board from './pages/Board'
import Checklist from './pages/Checklist'
import Credits from './pages/Credits'
import ToastContainer from './components/ui/Toast'
import CursorFollower from './components/visuals/CursorFollower'
import { useTheme } from './lib/ThemeProvider'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { theme } = useTheme()

  return (
    <>
      <CursorFollower />
      <ToastContainer />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/session/:id/curriculum" element={<Curriculum />} />
          <Route path="/session/:id/board" element={<Board />} />
          <Route path="/session/:id/checklist" element={<Checklist />} />
          <Route path="/session/:id/credits" element={<Credits />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
