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
  Cloth12,
  Cloth13,
  Cloth14,
  Cloth15,
  Cloth16,
} from '@/assets'
import { ColorCategory, SwatchOptions } from '@/types'

// Query string indicate version parameter
const VERSION = '?v=1773686901'
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
const SAPIENS_BACKGROUND_SWATCHES = [
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
]
const SAPIENS_BODY_SWATCHES = [
  '#fafaf9',
  '#f4d6be',
  '#f3c9b1',
  '#e6bc98',
  '#C08261',
  '#9C6452',
  '#292927',
]

const SWATCH_OPTIONS = {
  background: SAPIENS_BACKGROUND_SWATCHES,
  body: SAPIENS_BODY_SWATCHES,
  cloth: HEAD_CLOTH_SWATCH,
  head: HEAD_CLOTH_SWATCH,
}
const COLOR_CONFIG: { category: ColorCategory; label: string }[] = [
  { category: 'background', label: 'Background' },
  { category: 'body', label: 'Skin' },
  { category: 'head', label: 'Hair' },
  { category: 'cloth', label: 'Clothes' },
]

// Vegetr
const VEGETR_BODY_SWATCHES = [
  '#e26847',
  '#d46350',
  '#9b644e',
  '#d8a159',
  '#849962',
  '#455A55',
  '#8E8595',
  '#F19A9A',
  '#a06e9c',
  '#ddc6ba',
  '#5F4D42',
  '#d6854d',
  '#f27f4c',
  '#FFD7BF',
  '#292928',
]
const VEGETR_CLOTH_SWATCH = [
  '#FAFAF9',
  '#5F4D42',
  '#3e3432',
  '#30302E',
  '#B3615F',
  '#d46350',
  '#6B8BA6',
  '#36546D',
  '#F19A9B',
  '#D8A059',
  '#849962',
  '#455A55',
  '#228998',
  '#A78EC7',
  '#E3D2D4',
]

const VEGETR_SWATCH_OPTIONS = {
  background: SAPIENS_BACKGROUND_SWATCHES,
  body: VEGETR_BODY_SWATCHES,
  cloth: VEGETR_CLOTH_SWATCH,
  eyes: VEGETR_CLOTH_SWATCH,
}

export {
  VERSION,
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
  VEGETR_SWATCH_OPTIONS,
  MENU_OPTIONS,
  COLOR_CONFIG,
  LOADING_VARIANTS,
}
export type { Menu }
