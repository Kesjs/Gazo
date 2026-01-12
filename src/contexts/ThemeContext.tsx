'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, defaultTheme = 'system' }: { children: ReactNode, defaultTheme?: Theme }) {
  // Initialize theme synchronously to avoid FOUC
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return defaultTheme
    return (localStorage.getItem('theme') as Theme) || defaultTheme
  }

  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const savedTheme = localStorage.getItem('theme') as Theme || defaultTheme
    if (savedTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return savedTheme as 'light' | 'dark'
  })

  // Apply theme immediately on mount
  useEffect(() => {
    const root = window.document.documentElement
    
    // Apply theme synchronously
    const applyTheme = (currentTheme: Theme) => {
      // Remove existing theme attributes/classes
      root.removeAttribute('data-theme')
      root.classList.remove('light', 'dark')
      
      if (currentTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.setAttribute('data-theme', systemTheme)
        setResolvedTheme(systemTheme)
      } else {
        root.setAttribute('data-theme', currentTheme)
        setResolvedTheme(currentTheme as 'light' | 'dark')
      }
    }

    applyTheme(theme)
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
