import { CollectionConfig } from '@/types'
import {
  Body,
  VegetrBody,
  SapiensBanner,
  VegetrBanner,
  VegetrHideBody,
  VegetrHideBanner,
} from '@/assets'
import { clothOptions, headOptions, itemOptions } from '@/constants/sapiens'
import {
  vegetrClothOptions,
  vegetrEyesOptions,
  vegetrItemOptions,
} from '@/constants/vegetr'
import {
  vegetrHideSkinOptions,
  vegetrHideClothOptions,
  vegetrHideHeadOptions,
} from '@/constants/vegetr-hide'
import { SWATCH_OPTIONS, VEGETR_SWATCH_OPTIONS } from '@/constants'

// --- Sapiens Config ---
export type SapiensTrait = 'cloth' | 'head' | 'item'
export type SapiensColor = 'background' | 'body' | 'cloth' | 'head'

export const SAPIENS_CONFIG: CollectionConfig<SapiensTrait, SapiensColor> = {
  id: 'sapiens',
  name: 'Sapiens',
  baseLayer: { type: 'component', component: Body, colorCategory: 'body' },
  hero: {
    banner: SapiensBanner,
    themeColor: '#D88896',
    credit: 1,
    description:
      'Getting started and express your identity with a minimal character',
  },
  traits: [
    {
      id: 'cloth',
      path: 'clothes',
      extension: '.svg',
      label: 'Clothes',
      type: 'component',
      options: clothOptions,
      colorCategory: 'cloth',
      zIndex: 10,
    },
    {
      id: 'head',
      path: 'heads',
      extension: '.svg',
      label: 'Heads',
      type: 'component',
      options: headOptions,
      colorCategory: 'head',
      zIndex: 20,
    },
    {
      id: 'item',
      path: 'items',
      extension: '.svg',
      label: 'Items',
      type: 'image',
      options: itemOptions,
      zIndex: 30,
    },
  ],
  colors: [
    {
      category: 'background',
      label: 'Background',
      swatches: SWATCH_OPTIONS.background,
    },
    { category: 'body', label: 'Skin', swatches: SWATCH_OPTIONS.body },
    { category: 'cloth', label: 'Clothes', swatches: SWATCH_OPTIONS.cloth },
    { category: 'head', label: 'Hair', swatches: SWATCH_OPTIONS.head },
  ],
  defaultState: {
    traits: { cloth: 'cloth1', head: 'head1', item: 'item1' },
    colors: {
      background: '#f1f1f1',
      body: '#f4d6be',
      cloth: '#292927',
      head: '#292927',
    },
  },
}

// --- Vegetr Config ---
export type VegetrTrait = 'cloth' | 'eyes' | 'item'
export type VegetrColor = 'background' | 'body' | 'cloth' | 'eyes'

// (Assuming you have imported these options from your assets)
export const VEGETR_CONFIG: CollectionConfig<VegetrTrait, VegetrColor> = {
  id: 'vegetr',
  name: 'Vegetr',
  baseLayer: {
    type: 'component',
    component: VegetrBody,
    colorCategory: 'body',
  },
  hero: {
    banner: VegetrBanner,
    themeColor: '#d46350',
    credit: 2,
    description:
      'Collection of nonsense vegetables. Create them and let your craziness shine',
  },
  traits: [
    {
      id: 'cloth',
      path: 'clothes',
      extension: '.svg',
      label: 'Clothes',
      type: 'component',
      options: vegetrClothOptions,
      colorCategory: 'cloth',
      zIndex: 10,
    },
    {
      id: 'eyes',
      path: 'eyes',
      extension: '.svg',
      label: 'Eyes',
      type: 'component',
      options: vegetrEyesOptions,
      colorCategory: 'eyes',
      zIndex: 20,
    },
    {
      id: 'item',
      path: 'items',
      extension: '.svg',
      label: 'Items',
      type: 'image',
      options: vegetrItemOptions,
      zIndex: 30,
    },
  ],
  colors: [
    {
      category: 'background',
      label: 'Background',
      swatches: VEGETR_SWATCH_OPTIONS.background,
    },
    {
      category: 'body',
      label: 'Skin',
      swatches: VEGETR_SWATCH_OPTIONS.body,
    },
    {
      category: 'cloth',
      label: 'Clothes',
      swatches: VEGETR_SWATCH_OPTIONS.cloth,
    },
    { category: 'eyes', label: 'Eyes', swatches: VEGETR_SWATCH_OPTIONS.eyes },
  ],
  defaultState: {
    traits: { cloth: 'cloth1', eyes: 'eyes1', item: 'item1' },
    colors: {
      background: '#ff6a5f',
      body: '#a3d168',
      cloth: '#ffffff',
      eyes: '#292927',
    },
  },
}

// --- Vegetr Hide Config ---
export type VegetrHideTrait = 'skin' | 'cloth' | 'head'
export type VegetrHideColor = 'background'
export const VEGETR_HIDE_CONFIG: CollectionConfig<
  VegetrHideTrait,
  VegetrHideColor
> = {
  id: 'vegetr-hide',
  name: 'Vegetr Hi-De',
  baseLayer: {
    type: 'image',
    component: VegetrHideBody,
    // colorCategory: '',
  },
  hero: {
    banner: VegetrHideBanner,
    themeColor: '#50774B',
    credit: 3,
    description:
      'Nonsense vegetables is back!! Create them and let your craziness shine (Hi-De)',
  },
  traits: [
    {
      id: 'skin',
      path: 'skins',
      extension: '.png',
      label: 'Skins',
      type: 'image',
      options: vegetrHideSkinOptions,
      zIndex: 10,
    },
    {
      id: 'cloth',
      path: 'clothes',
      extension: '.png',
      label: 'Clothes',
      type: 'image',
      options: vegetrHideClothOptions,
      zIndex: 10,
    },
    {
      id: 'head',
      path: 'heads',
      extension: '.png',
      label: 'Heads',
      type: 'image',
      options: vegetrHideHeadOptions,
      zIndex: 10,
    },
  ],
  colors: [
    {
      category: 'background',
      label: 'Background',
      swatches: VEGETR_SWATCH_OPTIONS.background,
    },
  ],
  defaultState: {
    traits: { skin: 'skin1', cloth: 'cloth1', head: 'head1' },
    colors: {
      background: '#fff',
      // body: '#fff',
    },
  },
}

export const COLLECTIONS_CONFIG = [
  SAPIENS_CONFIG,
  VEGETR_CONFIG,
  VEGETR_HIDE_CONFIG,
]
export const COLLECTION_CONFIG_OBJ = {
  sapiens: SAPIENS_CONFIG,
  vegetr: VEGETR_CONFIG,
  'vegetr-hide': VEGETR_HIDE_CONFIG,
} as const
