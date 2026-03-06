// e.g. components/theme-sync.tsx
'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store'

export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return null
}
