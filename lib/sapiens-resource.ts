import type { ClothKey, HeadKey, ItemKey } from '@/constants'
import {
  SAPIENS_CONFIG,
  VEGETR_CONFIG,
  COLLECTIONS_CONFIG,
} from '@/constants/collections'

/**
 * Avatar configuration used to encode/decode a resource name.
 *
 * Format:  cloth1-head1-item1_f1f1f1-f4d6be-292927-292927
 *          ^--- traits ---^   ^---- colors (no #) ----^
 *
 * Traits order : cloth → head → item
 * Colors order : background → body → cloth → head
 */
export type AvatarConfig = {
  cloth: ClothKey
  head: HeadKey
  item: ItemKey
  colors: {
    background: string
    body: string
    cloth: string
    head: string
  }
}

const TRAIT_SEP = '-'
const SECTION_SEP = '_'
const COLOR_ORDER = ['background', 'body', 'cloth', 'head'] as const

/** Strip the leading `#` (and optional whitespace) from a hex color. */
const stripHash = (hex: string) => hex.replace(/^#/, '')

/** Encode an avatar configuration into a compact resource-name string. */
export function generateResourceName(config: AvatarConfig): string {
  const traits = [config.cloth, config.head, config.item].join(TRAIT_SEP)
  const colors = COLOR_ORDER.map((key) => stripHash(config.colors[key])).join(
    TRAIT_SEP,
  )
  return `${traits}${SECTION_SEP}${colors}`
}

/** Decode a resource-name string back into an `AvatarConfig`. Returns `null` on invalid input. */
export function decodeResourceName(name: string): AvatarConfig | null {
  const sections = name.split(SECTION_SEP)
  if (sections.length !== 2) return null

  const [traitsPart, colorPart] = sections
  const traits = traitsPart.split(TRAIT_SEP)
  const colors = colorPart.split(TRAIT_SEP)

  if (traits.length !== 3 || colors.length !== 4) return null

  return {
    cloth: traits[0] as ClothKey,
    head: traits[1] as HeadKey,
    item: traits[2] as ItemKey,
    colors: {
      background: `#${colors[0]}`,
      body: `#${colors[1]}`,
      cloth: `#${colors[2]}`,
      head: `#${colors[3]}`,
    },
  }
}

// {
//   "traits": {
//     "cloth": "cloth12",
//     "head": "head1",
//     "item": "item9"
//   },
//   "colors": {
//     "background": "#b69d74",
//     "body": "#875d4f",
//     "cloth": "#B3615F",
//     "head": "#252523"
//   }
// }
/**
 * Generate a resource name for V2 engine state.
 * Format: collection_trait1-trait2-bgHex_color2-color3
 */
export function generateResourceNameV2(
  collectionId: string,
  state: {
    traits: Record<string, string>
    colors: Record<string, string>
  },
): string {
  console.log('generateResourceNameV2', state)
  const traitValues = Object.values(state.traits).join(TRAIT_SEP)
  const colorValues = Object.values(state.colors).map(stripHash)
  const [bgHex, ...otherHexes] = colorValues

  return `${collectionId}_${traitValues}_${bgHex}${otherHexes.length > 0 ? '-' : ''}${otherHexes.join(TRAIT_SEP)}`
}

/**
 * Decode a V2 resource name.
 * Note: Since traits/colors keys are dynamic, this returns the values in the order they were encoded.
 */
// "sapiens_cloth12-head1-item9-b69d74_875d4f-B3615F-252523"
export function decodeResourceNameV2(name: string) {
  const [collectionId, traitsPart, colorsPart] = name.split(SECTION_SEP)
  if (!collectionId || !traitsPart || !colorsPart) return null

  // Find collection from CollectionID
  const collectionConfig = COLLECTIONS_CONFIG.find((c) => c.id === collectionId)
  if (!collectionConfig) return null

  const traitsRaw = traitsPart.split(TRAIT_SEP)
  const colorsRaw = colorsPart.split(TRAIT_SEP)

  const traits = Object.fromEntries(
    traitsRaw.map((t, i) => [collectionConfig.traits[i].id, t]),
  )
  const colors = Object.fromEntries(
    [...colorsRaw.map((c) => `#${c}`)].map((c, i) => [
      collectionConfig.colors[i].category,
      c,
    ]),
  )

  return {
    collectionId,
    traits,
    colors,
  }
}
export type DownloadedAvatarState = NonNullable<
  ReturnType<typeof decodeResourceNameV2>
>
