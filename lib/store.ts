import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AvatarConfig } from '@/lib/sapiens-resource'

type ThemeStore = {
  theme: string
  setTheme: (value: string) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  setTheme: (value) => set({ theme: value }),
}))

// -- The new Sapiens Config Store --
type SapiensConfig = AvatarConfig
type SapiensConfigStore = {
  sapiensConfig: SapiensConfig
  setSapiensConfig: (
    config: SapiensConfig | ((prev: SapiensConfig) => SapiensConfig),
  ) => void
  resetConfig: () => void
}
const initSapiensConfig: SapiensConfig = {
  cloth: 'cloth1',
  head: 'head1',
  item: 'item1',
  colors: {
    background: '#30302E',
    body: '#f4d6be',
    cloth: '#30302E',
    head: '#30302E',
  },
}

export const useSapiensStore = create<SapiensConfigStore>()(
  persist(
    (set) => ({
      sapiensConfig: initSapiensConfig,
      setSapiensConfig: (config) =>
        set((state) => ({
          sapiensConfig:
            typeof config === 'function' ? config(state.sapiensConfig) : config,
        })),
      resetConfig: () => set({ sapiensConfig: initSapiensConfig }),
    }),
    {
      name: 'sapiens-config-storage',
    },
  ),
)
