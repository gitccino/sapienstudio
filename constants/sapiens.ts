'use client'

import {
  createRemoteSvg,
  createRemoteSvgWithoutInherit,
} from '@/components/remote-svg'
import { VERSION } from './'

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME!

export type TraitType = 'cloth' | 'head' | 'item'

type SvgComponent = ReturnType<typeof createRemoteSvg>
type TraitOptions<T extends TraitType> = Record<
  `${T}${number}`,
  SvgComponent | null
>
interface TraitConfig {
  folder: string
  loader: (url: string) => SvgComponent | null
}
const TRAIT_MAP: Record<TraitType, TraitConfig> = {
  cloth: { folder: 'clothes', loader: createRemoteSvg },
  head: { folder: 'heads', loader: createRemoteSvg },
  item: { folder: 'items', loader: createRemoteSvgWithoutInherit },
}
const generateTraitOptions = <T extends TraitType>(
  traitType: T,
  totalGenerated: number,
): TraitOptions<T> => {
  const options = {} as TraitOptions<T>
  if (totalGenerated <= 0) return options

  const { folder, loader } = TRAIT_MAP[traitType]
  for (let i = 1; i <= totalGenerated; i++) {
    const key = `${traitType}${i}` as `${T}${number}`

    if (!DIST_DOMAIN) {
      options[key] = null
      continue
    }

    const url = `https://${DIST_DOMAIN}/sapiens/${folder}/${traitType}${i}.svg${VERSION}`
    options[key] = loader(url)
  }

  return options
}

// Generates { cloth1: Cloth1, cloth2: Cloth2, ..., cloth16: Cloth16 }
const clothOptions = generateTraitOptions('cloth', 16)
const headOptions = generateTraitOptions('head', 20)
const itemOptions = generateTraitOptions('item', 23)

export { clothOptions, headOptions, itemOptions }
