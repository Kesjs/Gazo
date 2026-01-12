'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'light') {
      return <SunIcon className="h-5 w-5" />
    } else if (theme === 'dark') {
      return <MoonIcon className="h-5 w-5" />
    } else {
      return <ComputerDesktopIcon className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    if (theme === 'light') {
      return 'Mode clair'
    } else if (theme === 'dark') {
      return 'Mode sombre'
    } else {
      return 'Mode système'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 group"
      aria-label={`Changer de thème : ${getLabel()}`}
      title={`Thème actuel : ${getLabel()}`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200 ${
          theme === 'light' ? 'text-yellow-500' :
          theme === 'dark' ? 'text-blue-500' :
          'text-purple-500'
        }`}
      >
        {getIcon()}
      </motion.div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {getLabel()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
      </div>
    </button>
  )
}
