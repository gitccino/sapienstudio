import {
  Body,
  Head1,
  Head2,
  Head3,
  Head4,
  Head5,
  Head6,
  Head7,
  Head8,
  Head9,
  Head10,
  Head11,
  Head12,
  Head13,
  Head14,
  Head15,
  Head16,
  Head17,
  Head18,
  Head19,
  Head20,
  Cloth1,
  Cloth2,
  Cloth3,
  Cloth4,
  Cloth5,
  Cloth6,
  Cloth7,
  Cloth8,
  Cloth9,
  Cloth10,
  Cloth11,
} from '@/assets'
import { ColorCategory, SwatchOptions } from '@/types'

const clothOptions = {
  cloth1: Cloth1,
  cloth2: Cloth2,
  cloth3: Cloth3,
  cloth4: Cloth4,
  cloth5: Cloth5,
  cloth6: Cloth6,
  cloth7: Cloth7,
  cloth8: Cloth8,
  cloth9: Cloth9,
  cloth10: Cloth10,
  cloth11: Cloth11,
} as const
type ClothKey = keyof typeof clothOptions

const headOptions = {
  head1: Head1,
  head2: Head2,
  head3: Head3,
  head4: Head4,
  head5: Head5,
  head6: Head6,
  head7: Head7,
  head8: Head8,
  head9: Head9,
  head10: Head10,
  head11: Head11,
  head12: Head12,
  head13: Head13,
  head14: Head14,
  head15: Head15,
  head16: Head16,
  head17: Head17,
  head18: Head18,
  head19: Head19,
  head20: Head20,
} as const
type HeadKey = keyof typeof headOptions

const itemOptions = {
  item1: 'item1',
  item2: 'item2',
  item3: 'item3',
  item4: 'item4',
  item5: 'item5',
  item6: 'item6',
  item7: 'item7',
  item8: 'item8',
  item9: 'item9',
  item10: 'item10',
  item11: 'item11',
  item12: 'item12',
  item13: 'item13',
  item14: 'item14',
  item15: 'item15',
}
type ItemKey = keyof typeof itemOptions

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME!
const RESOLUTION_PRESETS = [256, 512, 1024, 2048] as const
const MIN_RESOLUTION = 64
const MAX_RESOLUTION = 2048

const HERO_COLOR_PRESETS = [
  '#fafaf9',
  '#292927',
  '#a2c7e5',
  '#465a54',
  '#e29847',
  '#83bf7f',
  '#ffa9a9',
]

// Animation with Motion
const STAGGER_CONTAINER = {
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1, // delay all children by ?? second
    },
  },
}
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  none: { opacity: 0, y: 8, scale: 1, height: 0 },
}
const BUTTON_ARROW_ANIMATE = { x: [0, 2, 0] }
const BUTTON_ARROW_TRANSITION = {
  duration: 0.5,
  repeat: Infinity,
  repeatDelay: 0.75,
}
const CATEGORY_TAB_TRANSITION = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
}
const CATEGORY_TAB_VARIANTS = {
  active: {
    opacity: 1,
    scale: 1.05,
    y: -0.8,
    transition: CATEGORY_TAB_TRANSITION,
  },
  inactive: {
    opacity: 0.5,
    scale: 1,
    y: 0.8,
    transition: CATEGORY_TAB_TRANSITION,
  },
}

// Loading page
const LOADING_VARIANTS = {
  enter: {
    opacity: 0,
    filter: 'blur(1px)',
    transition: CATEGORY_TAB_TRANSITION,
  },
  center: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: CATEGORY_TAB_TRANSITION,
  },
  exit: {
    opacity: 0,
    filter: 'blur(1px)',
    transition: CATEGORY_TAB_TRANSITION,
  },
}

// Sapiens Page
const MENU_OPTIONS = {
  head: 'Heads',
  cloth: 'Clothes',
  item: 'Items',
  colors: 'Colors',
} as const
type Menu = keyof typeof MENU_OPTIONS
const HEAD_CLOTH_SWATCH = [
  '#fafaf9',
  '#292927',
  '#b1c991',
  '#465a54',
  '#228997',
  '#6b8ba6',
  '#f19a9a',
  '#B3615F',
  '#CE6258',
  '#ef8e5f',
  '#f3b45c',
  '#a78ec7',
  '#E3D2D4',
  '#846F61',
  '#5F4D42',
]

const SWATCH_OPTIONS: SwatchOptions = {
  background: [
    '#fafaf9',
    '#ebebe6',
    '#C3C3C3',
    '#949494',
    '#545454',
    '#30302E',
    '#e4d3b7',
    '#99BAC3',
    '#6b8ba6',
    '#9FA8A1',
    '#465a54',
    '#266672',
    '#8E8595',
    '#b69d74',
    '#B3615F',
  ],
  body: [
    '#fafaf9',
    '#f4d6be',
    '#f3c9b1',
    '#e6bc98',
    '#C08261',
    '#9C6452',
    '#292927',
  ],
  head: HEAD_CLOTH_SWATCH,
  cloth: HEAD_CLOTH_SWATCH,
}
const COLOR_CONFIG: { category: ColorCategory; label: string }[] = [
  { category: 'background', label: 'Background' },
  { category: 'body', label: 'Skin' },
  { category: 'head', label: 'Hair' },
  { category: 'cloth', label: 'Clothes' },
]

export {
  clothOptions,
  headOptions,
  itemOptions,
  DIST_DOMAIN,
  RESOLUTION_PRESETS,
  MIN_RESOLUTION,
  MAX_RESOLUTION,
  HERO_COLOR_PRESETS,
  STAGGER_CONTAINER,
  CONTAINER_VARIANTS,
  BUTTON_ARROW_ANIMATE,
  BUTTON_ARROW_TRANSITION,
  CATEGORY_TAB_VARIANTS,
  CATEGORY_TAB_TRANSITION,
  SWATCH_OPTIONS,
  MENU_OPTIONS,
  COLOR_CONFIG,
  LOADING_VARIANTS,
}
export type { ClothKey, HeadKey, ItemKey, Menu }
