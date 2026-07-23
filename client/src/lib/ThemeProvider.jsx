import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('learnmosaic-theme')
    return saved ? JSON.parse(saved) : {
      texture: 'kandinsky',
      density: 'standard',
      borderWeight: 4,
      cornerRadius: 0,
      motionSpeed: 'standard',
      ambientShapes: true
    }
  })

  const setTheme = useCallback((updates) => {
    setThemeState(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('learnmosaic-theme', JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement

    // Texture
    root.classList.remove('texture-noise', 'texture-grain', 'texture-kandinsky')
    if (theme.texture !== 'none') root.classList.add(`texture-${theme.texture}`)

    // Density — affects spacing via CSS variable
    const densityMap = {
      compact: '0.75',
      standard: '1',
      spacious: '1.33'
    }
    root.style.setProperty('--density-scale', densityMap[theme.density] || '1')

    // Border weight
    root.style.setProperty('--border-weight', `${theme.borderWeight || 4}px`)

    // Corner radius
    root.style.setProperty('--corner-radius', `${theme.cornerRadius || 0}px`)

    // Motion speed
    const speedMap = {
      reduced: '0.5',
      standard: '1',
      enhanced: '1.5'
    }
    root.style.setProperty('--motion-speed', speedMap[theme.motionSpeed] || '1')

  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
