import { create } from 'zustand'

type ThemeStore = {
  theme: string
  setTheme: (value: string) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  setTheme: (value) => set({ theme: value }),
}))
