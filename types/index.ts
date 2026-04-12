type ColorCategory = 'background' | 'body' | 'head' | 'cloth' | 'eyes'
type SwatchOptions = Record<ColorCategory, string[]>

export type { ColorCategory, SwatchOptions }

import { StaticImageData } from 'next/image'
// Reusable Avatar Engine
import type { ComponentType } from 'react'

export type CollectionId = 'sapiens' | 'vegetr' | 'vegetr-hide'
export type TraitRenderType = 'component' | 'image'
export type FileExtensionType = '.svg' | '.png'

export interface TraitDefinition<TTrait extends string, TColor extends string> {
  id: TTrait
  label: string
  path: string
  extension: FileExtensionType
  type: TraitRenderType
  options: Record<string, any>
  colorCategory?: TColor
  zIndex: number
}

export interface CollectionConfig<
  TTrait extends string,
  TColor extends string,
> {
  id: CollectionId
  name: string
  baseLayer?: {
    type: TraitRenderType
    component:
      | ComponentType<{ color?: string; className?: string }>
      | StaticImageData
    colorCategory?: TColor
  }
  hero: {
    banner: StaticImageData
    themeColor: string
    credit: number
    description: string
  }
  traits: TraitDefinition<TTrait, TColor>[]
  colors: { category: TColor; label: string; swatches: string[] }[]
  defaultState: {
    traits: Record<TTrait, string>
    colors: Record<TColor, string>
  }
}
