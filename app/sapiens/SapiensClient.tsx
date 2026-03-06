'use client'

import { useState, useRef, useCallback, memo } from 'react'
import { motion } from 'motion/react'
import { Body } from '@/assets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { LoadingSquares } from '@/app/register/RegisterClient'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { ColorSection } from '@/components/color-section'
import type { ColorCategory } from '@/types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ImageDownload02Icon,
  Settings03Icon,
  SunriseIcon,
  SunsetIcon,
} from '@hugeicons/core-free-icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import Image from 'next/image'
import { SapiensItems } from '@/components/sapiens-items'
import {
  clothOptions,
  headOptions,
  DIST_DOMAIN,
  RESOLUTION_PRESETS,
  MIN_RESOLUTION,
  MAX_RESOLUTION,
  STAGGER_CONTAINER,
  CONTAINER_VARIANTS,
  CATEGORY_TAB_VARIANTS,
  SWATCH_OPTIONS,
  MENU_OPTIONS,
  COLOR_CONFIG,
} from '@/constants'
import type { ClothKey, HeadKey, ItemKey, Menu } from '@/constants'
import { useThemeStore } from '@/lib/store'

// --- Module-level constants --- (Just in case)

const SELECTED_COLOR_LIGHT_INIT: SelectedColors = {
  background: '#fafaf9',
  body: '#f4d6be',
  cloth: '#292927',
  head: '#292927',
}
const SELECTED_COLOR_DARK_INIT: SelectedColors = {
  background: '#141413',
  body: '#f4d6be',
  cloth: '#30302E',
  head: '#30302E',
}

// --- Memoized subcomponents ---

const DownloadPopover = memo(function DownloadPopover({
  avatarRef,
}: {
  avatarRef: React.RefObject<HTMLDivElement | null>
}) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadResolution, setDownloadResolution] = useState(1024)
  const [customResolution, setCustomResolution] = useState('')
  const [open, setOpen] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!avatarRef.current) return
    const effectiveRes = customResolution
      ? Math.max(
          MIN_RESOLUTION,
          Math.min(
            MAX_RESOLUTION,
            Math.round(Number(customResolution)) || 1024,
          ),
        )
      : downloadResolution
    const rect = avatarRef.current.getBoundingClientRect()
    const elementSize = Math.min(rect.width, rect.height) || effectiveRes
    const pixelRatio = effectiveRes / elementSize

    setIsDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(avatarRef.current, {
        cacheBust: true,
        skipFonts: true,
        pixelRatio: pixelRatio + 1,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.closest('[data-download-trigger]')
          }
          return true
        },
      })
      const link = document.createElement('a')
      link.download = 'sapiens-avatar.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export avatar:', err)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
      setOpen(false)
    }
  }, [avatarRef, customResolution, downloadResolution])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="none"
          variant="ghost"
          disabled={isDownloading}
          data-download-trigger
          className="bg-background border-foreground/10 rounded-sm border-2 p-2"
        >
          <HugeiconsIcon
            strokeWidth={2}
            icon={ImageDownload02Icon}
            className="size-4"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 rounded-lg border-2 p-3 shadow-lg"
      >
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Resolution</span>
          <div className="flex flex-wrap gap-1">
            {RESOLUTION_PRESETS.map((size) => (
              <Button
                key={size}
                type="button"
                size="none"
                variant="outlineDark"
                onClick={() => {
                  setCustomResolution('')
                  setDownloadResolution(size)
                }}
                className={`rounded-sm px-2 py-0.5 text-xs ${
                  !customResolution && downloadResolution === size
                    ? 'border-foreground/80'
                    : 'opacity-30'
                } transition-none`}
              >
                {size}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            size="none"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-foreground/95 w-full rounded-sm py-1"
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
})

const SettingsPanel = memo(function SettingsPanel() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 pb-8 md:flex-none">
      <span className="text-foreground w-[80%] text-sm">
        Hope you enjoyed your experience here. Sapiens Studio is a free-to-use
        platform for creating and sharing your own Sapiens characters. Thank you
        for using Sapiens Studio! and have a great day!
      </span>
      <Button
        type="button"
        size="none"
        variant="default"
        onClick={handleSignOut}
        className="bg-destructive dark:text-foreground w-50 rounded-sm px-3 py-2 text-base"
        disabled={isLoading}
      >
        <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
      </Button>
    </div>
  )
})

const CategoryTabs = memo(function CategoryTabs({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: Menu | 'settings'
  onSelect: (key: Menu) => void
}) {
  return (
    <div className="flex w-full flex-row justify-center gap-0 overflow-hidden">
      {(Object.keys(MENU_OPTIONS) as Menu[]).map((key) => (
        <motion.div
          key={key}
          variants={CATEGORY_TAB_VARIANTS}
          animate={selectedCategory === key ? 'active' : 'inactive'}
        >
          <Button
            type="button"
            size="none"
            variant="default"
            className={cn(
              'text-foreground cursor-pointer bg-transparent px-2 py-4 text-base font-medium opacity-50 will-change-transform',
              selectedCategory === key && 'opacity-100',
            )}
            onClick={() => onSelect(key)}
          >
            <span>{MENU_OPTIONS[key]}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  )
})

type SapiensTraitsProps = {
  category: 'head' | 'cloth'
  color: string
  selectedKey: string
  onSelect: (trait: ClothKey | HeadKey) => void
}

const SapiensTraits = memo(function SapiensTraits({
  category,
  color,
  selectedKey,
  onSelect,
}: SapiensTraitsProps) {
  const optionKeys =
    category === 'cloth'
      ? (Object.keys(clothOptions) as ClothKey[])
      : (Object.keys(headOptions) as HeadKey[])

  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {optionKeys.map((key) => {
        const Icon =
          category === 'cloth'
            ? clothOptions[key as ClothKey]
            : headOptions[key as HeadKey]

        return (
          <Button
            key={key}
            type="button"
            size="none"
            variant="default"
            onClick={() => onSelect(key)}
            className={`border-background text-foreground relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-transparent p-0 duration-0 ${
              selectedKey === key ? 'border-foreground/10' : ''
            }`}
          >
            {Icon && (
              <Icon
                color={color}
                className="bt size-full min-w-0 shrink-0 scale-125"
              />
            )}
          </Button>
        )
      })}
    </div>
  )
})

// --- Main component ---

type SelectedColors = {
  background: string
  body: string
  cloth: string
  head: string
}

export default function SapiensClient() {
  const { theme, setTheme } = useThemeStore()
  const currentUser = useQuery(api.auth.getCurrentUser)

  const [selectedCategory, setSelectedCategory] = useState<Menu | 'settings'>(
    'head',
  )
  const [selectedColor, setSelectedColor] = useState<SelectedColors>(
    theme === 'dark' ? SELECTED_COLOR_DARK_INIT : SELECTED_COLOR_LIGHT_INIT,
  )
  const [selectedCloth, setSelectedCloth] = useState<ClothKey>('cloth1')
  const [selectedHead, setSelectedHead] = useState<HeadKey>('head1')
  const [selectedItem, setSelectedItem] = useState<ItemKey>('item1')
  const avatarRef = useRef<HTMLDivElement>(null)

  const ClothComponent = clothOptions[selectedCloth]
  const HeadComponent = headOptions[selectedHead]

  const handleSelectColor = useCallback(
    (color: string, opacity = 100, category: ColorCategory) => {
      const finalColor =
        opacity === 100
          ? color
          : opacity.toString().length === 1
            ? `${color}0${opacity}`
            : `${color}${opacity}`
      setSelectedColor((prev) => ({ ...prev, [category]: finalColor }))
    },
    [],
  )

  const handleSelectCategory = useCallback(
    (key: Menu) => setSelectedCategory(key),
    [],
  )

  const handleSelectTrait = useCallback(
    (trait: ClothKey | HeadKey) => {
      if (selectedCategory === 'cloth') setSelectedCloth(trait as ClothKey)
      else setSelectedHead(trait as HeadKey)
    },
    [selectedCategory],
  )

  if (!currentUser)
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <LoadingSquares />
      </div>
    )

  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="main-container px-[5%] py-8 md:px-0"
    >
      <motion.div
        variants={CONTAINER_VARIANTS}
        ref={avatarRef}
        style={{ backgroundColor: selectedColor.background }}
        className="relative isolate aspect-square w-full overflow-hidden rounded-xl"
      >
        <div className="text-foreground absolute top-2 right-2 z-50 flex flex-col items-center gap-2 text-sm">
          <Button
            type="button"
            variant="default"
            size="none"
            className="bg-background text-foreground border-foreground/10 rounded-sm border-2 p-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            data-download-trigger
          >
            {theme === 'dark' ? (
              <HugeiconsIcon
                strokeWidth={2}
                icon={SunriseIcon}
                className="size-4"
              />
            ) : (
              <HugeiconsIcon
                strokeWidth={2}
                icon={SunsetIcon}
                className="size-4"
              />
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            size="none"
            className="bg-background text-foreground border-foreground/10 rounded-sm border-2 p-2"
            onClick={() => setSelectedCategory('settings')}
            data-download-trigger
          >
            <HugeiconsIcon
              strokeWidth={2}
              icon={Settings03Icon}
              className="size-4"
            />
          </Button>
          <DownloadPopover avatarRef={avatarRef} />
        </div>

        <Body
          color={selectedColor.body}
          className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
        />
        {ClothComponent && (
          <ClothComponent
            color={selectedColor.cloth}
            className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {HeadComponent && (
          <HeadComponent
            color={selectedColor.head}
            className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
          />
        )}
        <Image
          key={selectedItem}
          src={`https://${DIST_DOMAIN}/items/${selectedItem}.svg`}
          alt="Item"
          width={500}
          height={500}
          crossOrigin="anonymous"
          className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
        />
      </motion.div>

      <motion.div
        variants={CONTAINER_VARIANTS}
        className="relative flex w-full flex-1 flex-col items-center justify-start gap-2"
      >
        <CategoryTabs
          selectedCategory={selectedCategory}
          onSelect={handleSelectCategory}
        />

        {selectedCategory === 'settings' && <SettingsPanel />}

        {selectedCategory === 'colors' && (
          <div className="relative flex w-full flex-col items-start justify-start gap-4 px-2">
            {COLOR_CONFIG.map(({ category, label }) => (
              <ColorSection
                key={category}
                category={category}
                label={label}
                colorOptions={SWATCH_OPTIONS[category]}
                value={selectedColor[category]}
                onSelectColorAction={handleSelectColor}
              />
            ))}
          </div>
        )}

        {(selectedCategory === 'cloth' || selectedCategory === 'head') && (
          <SapiensTraits
            category={selectedCategory}
            color={selectedColor[selectedCategory]}
            selectedKey={
              selectedCategory === 'cloth' ? selectedCloth : selectedHead
            }
            onSelect={handleSelectTrait}
          />
        )}

        {selectedCategory === 'item' && (
          <SapiensItems
            selectedItem={selectedItem}
            setSelectedTrait={setSelectedItem}
          />
        )}
      </motion.div>
    </motion.main>
  )
}
