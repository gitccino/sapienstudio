'use client'

import {
  createRemoteSvg,
  createRemoteSvgWithoutInherit,
} from '@/components/remote-svg'
import { VERSION } from '.'

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME!

type VegetrTraitType = 'cloth' | 'eyes' | 'item'
type SvgComponent = ReturnType<typeof createRemoteSvg>
type TraitOptions<T extends VegetrTraitType> = Record<
  `${T}${number}`,
  SvgComponent | null
>
interface TraitConfig {
  folder: string
  loader: (url: string) => SvgComponent | null
}
const TRAIT_MAP: Record<VegetrTraitType, TraitConfig> = {
  cloth: { folder: 'clothes', loader: createRemoteSvg },
  eyes: { folder: 'eyes', loader: createRemoteSvg },
  item: { folder: 'items', loader: createRemoteSvgWithoutInherit },
}
const generateTraitOptions = <T extends VegetrTraitType>(
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

    const url = `https://${DIST_DOMAIN}/vegetr/${folder}/${traitType}${i}.svg${VERSION}`
    options[key] = loader(url)
  }

  return options
}

const vegetrClothOptions = generateTraitOptions('cloth', 4)
const vegetrEyesOptions = generateTraitOptions('eyes', 7)
const vegetrItemOptions = generateTraitOptions('item', 12)

export { vegetrClothOptions, vegetrEyesOptions, vegetrItemOptions }
