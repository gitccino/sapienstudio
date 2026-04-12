'use client'

import { StaticImageData } from 'next/image'
import { VERSION } from '.'
import type { VegetrHideTrait } from './collections'

// Defined here (not imported from collections.ts) to avoid a circular dependency:
// vegetr-hide.ts is imported by collections.ts to build VEGETR_HIDE_CONFIG,
// so vegetr-hide.ts cannot import from collections.ts in return.
const VEGETR_HIDE_ID = 'vegetr-hide'
import { createRemoteSvg } from '@/components/remote-svg'

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME!

type VegetrHideTraitType = VegetrHideTrait
type TraitOptions<T extends VegetrHideTraitType> = Record<
  `${T}${number}`,
  StaticImageData | null
>
type SvgComponent = ReturnType<typeof createRemoteSvg>
interface TraitConfig {
  folder: string
  loader: (url: string) => SvgComponent | null
}
const TRAIT_MAP: Record<VegetrHideTraitType, TraitConfig> = {
  skin: { folder: 'skins', loader: () => null },
  cloth: { folder: 'clothes', loader: () => null },
  head: { folder: 'heads', loader: () => null },
}

const generateTraitOptions = <T extends VegetrHideTraitType>(
  traitType: T,
  totalGenerated: number,
): TraitOptions<T> => {
  const options = {} as TraitOptions<T>
  const { folder, loader: _loader } = TRAIT_MAP[traitType]
  for (let i = 1; i <= totalGenerated; i++) {
    const key = `${traitType}${i}` as `${T}${number}`

    if (!DIST_DOMAIN) {
      options[key] = null
      continue
    }

    const url = `https://${DIST_DOMAIN}/${VEGETR_HIDE_ID}/${folder}/${traitType}${i}.png${VERSION}`
    options[key] = {
      src: url,
      width: 500,
      height: 500,
    } as StaticImageData
  }

  return options
}

const vegetrHideSkinOptions = generateTraitOptions('skin', 8)
const vegetrHideClothOptions = generateTraitOptions('cloth', 3)
const vegetrHideHeadOptions = generateTraitOptions('head', 3)

export { vegetrHideSkinOptions, vegetrHideClothOptions, vegetrHideHeadOptions }
