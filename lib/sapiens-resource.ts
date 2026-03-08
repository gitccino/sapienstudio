import type { ClothKey, HeadKey, ItemKey } from '@/constants'

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

  const [traitPart, colorPart] = sections
  const traits = traitPart.split(TRAIT_SEP)
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
