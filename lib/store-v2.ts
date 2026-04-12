import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type DynamicCollectionState = {
  traits: Record<string, string>
  colors: Record<string, string>
}

type EngineStore = {
  collections: Record<string, DynamicCollectionState>
  updateTrait: (collectionId: string, traitKey: string, value: string) => void
  updateColor: (collectionId: string, colorKey: string, value: string) => void
  initializeCollection: (
    collectionId: string,
    defaultState: DynamicCollectionState,
  ) => void
}

export const useEngineStore = create<EngineStore>()(
  persist(
    (set) => ({
      collections: {},
      updateTrait: (colId, traitKey, value) =>
        set((state) => ({
          collections: {
            ...state.collections,
            [colId]: {
              ...state.collections[colId],
              traits: { ...state.collections[colId].traits, [traitKey]: value },
            },
          },
        })),
      updateColor: (colId, colorKey, value) =>
        set((state) => ({
          collections: {
            ...state.collections,
            [colId]: {
              ...state.collections[colId],
              colors: { ...state.collections[colId].colors, [colorKey]: value },
            },
          },
        })),
      initializeCollection: (colId, defaultState) =>
        set((state) => {
          if (state.collections[colId]) return state // Don't overwrite if it exists in local storage
          return {
            collections: { ...state.collections, [colId]: defaultState },
          }
        }),
    }),
    { name: 'avatar-engine-storage-1773679603' },
  ),
)
