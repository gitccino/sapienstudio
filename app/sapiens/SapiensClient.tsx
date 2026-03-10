'use client'

import {
  useState,
  useRef,
  useCallback,
  memo,
  useTransition,
  useEffect,
  useMemo,
  lazy,
  Suspense,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Body } from '@/assets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { LoadingSquares } from '@/app/register/RegisterClient'
import { usePreloadedQuery, useMutation } from 'convex/react'
import type { Preloaded } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { ColorSection } from '@/components/color-section'
import { CreditDisplay } from '@/components/credit-display'
import type { ColorCategory } from '@/types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ImageDownload02Icon,
  Layers01Icon,
  Settings03Icon,
  SparklesIcon,
  SunriseIcon,
  SunsetIcon,
  TransactionHistoryIcon,
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
import { useThemeStore, useSapiensStore } from '@/lib/store'
import { generateResourceName, type AvatarConfig } from '@/lib/sapiens-resource'
import Link from 'next/link'
import { useLinkStatus } from 'next/link'
// Lazy load non-critical fixed preview (code-split)
const LazySapiensDisplay = lazy(() => import('@/components/sapien-display'))

// --- Module-level constants --- (Just in case)

export const SELECTED_COLOR_LIGHT_INIT: SelectedColors = {
  background: '#f1f1f1',
  body: '#f4d6be',
  cloth: '#292927',
  head: '#292927',
}
export const SELECTED_COLOR_DARK_INIT: SelectedColors = {
  background: '#30302E',
  body: '#f4d6be',
  cloth: '#30302E',
  head: '#30302E',
}

// --- Memoized subcomponents ---

const DownloadPopover = memo(function DownloadPopover({
  avatarRef,
  preloadedBalance,
  avatarConfig,
}: {
  avatarRef: React.RefObject<HTMLDivElement | null>
  preloadedBalance: Preloaded<typeof api.functions.credits.getBalance>
  avatarConfig: AvatarConfig
}) {
  const balance = usePreloadedQuery(preloadedBalance)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadResolution, setDownloadResolution] = useState(1024)
  const [customResolution, setCustomResolution] = useState('')
  const [open, setOpen] = useState(false)

  const purchaseAndRecordDownload = useMutation(
    api.functions.downloads.purchaseAndRecordDownload,
  )

  const isInsufficient = balance < 1

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

      const avatarEl = avatarRef.current
      if (!avatarEl) return

      const previousBorderRadius = avatarEl.style.borderRadius
      const previousOverflow = avatarEl.style.overflow

      avatarEl.style.borderRadius = '0'
      avatarEl.style.overflow = 'visible'

      let dataUrl: string
      try {
        dataUrl = await toPng(avatarEl, {
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

        // --- Previous ---
        const link = document.createElement('a')
        link.download = 'sapiens-avatar.png'
        link.href = dataUrl
        link.click()
      } finally {
        avatarEl.style.borderRadius = previousBorderRadius
        avatarEl.style.overflow = previousOverflow
      }

      // Convert to blob once so we can either share (mobile) or open in a new tab (desktop)
      // const response = await fetch(dataUrl)
      // const blob = await response.blob()

      // Prefer native share sheet when available (iOS / mobile browsers)
      // const file = new File([blob], 'sapiens-avatar.png', { type: 'image/png' })
      // const canShareFile =
      //   typeof navigator !== 'undefined' &&
      //   'canShare' in navigator &&
      //   navigator.canShare?.({ files: [file] })
      // const blobUrl = URL.createObjectURL(blob)
      // const canShareFile =
      //   navigator.canShare && navigator.canShare({ url: blobUrl })
      // if (!canShareFile) {
      //   alert('Sharing is not supported on this browser.')
      //   return
      // }

      // if (canShareFile) {
      //   try {
      //     await navigator.share({
      //       files: [file],
      //       title: 'Sapienstudio',
      //     })
      //     return
      //   } catch (shareError) {
      //     if (shareError instanceof Error && shareError.name === 'AbortError') {
      //       // User cancelled the share sheet; don't fall back to opening a tab.
      //       return
      //     }
      //     console.error('Share failed, falling back to new tab:', shareError)
      //   }
      // }

      // Pre-record and charge the download amount
      await purchaseAndRecordDownload({
        resourceName: generateResourceName(avatarConfig),
        cost: 1,
      })

      // Fallback: open generated image (desktop: new tab, iOS: same tab)
      // const blobUrl = URL.createObjectURL(blob)
      // const isIOS =
      //   typeof navigator !== 'undefined' &&
      //   /iPad|iPhone|iPod/.test(navigator.userAgent)

      // if (isIOS) {
      //   // iOS Safari often blocks async window.open; navigating the current tab is more reliable.
      //   window.location.href = blobUrl
      // } else {
      //   window.open(blobUrl, '_blank')
      // }
    } catch (err) {
      console.error('Failed to export avatar:', err)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
      setOpen(false)
    }
  }, [
    avatarRef,
    avatarConfig,
    customResolution,
    downloadResolution,
    purchaseAndRecordDownload,
  ])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="none"
          variant="ghost"
          disabled={isDownloading}
          data-download-trigger
          className="bg-background border-foreground/10 box-border size-12 rounded-xl border-2 dark:box-content"
        >
          <HugeiconsIcon
            strokeWidth={2}
            icon={ImageDownload02Icon}
            className="size-5"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-60 rounded-xl border-2 p-3 shadow-lg"
      >
        <div className="flex flex-col gap-2">
          <div className="flex-row-start gap-1 text-base font-semibold">
            <HugeiconsIcon
              icon={SparklesIcon}
              className="size-5"
              strokeWidth={1.5}
            />
            <span>Resolution</span>
          </div>
          <div className="text-muted-foreground grid h-fit w-full grid-cols-3 p-2 text-sm">
            <span className="col-span-2">Total credits</span>
            <span className="col-span-1 text-right font-semibold">
              {balance < 0 ? 'Empty' : balance}
            </span>
            <span className="col-span-2">Credits/Download</span>
            <span className="text-destructive col-span-1 text-right font-semibold">
              -1
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
                className={`rounded-md px-2 py-0.5 text-sm font-semibold ${
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
            disabled={isDownloading || balance < 1}
            className="bg-foreground/95 w-full rounded-md py-1 text-base dark:font-semibold"
          >
            {isDownloading
              ? 'Downloading...'
              : balance < 1
                ? 'Insufficient Credits'
                : 'Download'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
})

const SettingsPanel = memo(function SettingsPanel({
  onBack,
  startTransition,
}: {
  onBack: (category: Menu | 'settings') => void
  startTransition: React.TransitionStartFunction
}) {
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
    <div className="flex w-[80%] flex-col items-start justify-center gap-2 py-8 md:flex-none">
      <motion.div className="w-full">
        <Button
          variant="ghost"
          className="flex-row-center bg-card-background h-10 w-full gap-2 rounded-md text-base font-medium"
          onClick={() => onBack('head')}
        >
          <HugeiconsIcon
            icon={Layers01Icon}
            className="size-5"
            strokeWidth={2}
          />
          <span>Back to main</span>
        </Button>
      </motion.div>
      <motion.div className="w-full">
        {/* <Link
          href="/sapiens/history"
          className="flex-row-center bg-card-background h-10 w-full gap-2 rounded-md font-medium"
        > */}
        <button
          onClick={() => startTransition(() => router.push('/sapiens/history'))}
          className="flex-row-center bg-card-background h-10 w-full gap-2 rounded-md font-medium"
        >
          <HugeiconsIcon
            icon={TransactionHistoryIcon}
            className="size-5"
            strokeWidth={2}
          />
          <span>Transaction History</span>
        </button>
        {/* </Link> */}
      </motion.div>
      <span className="text-muted-foreground mx-auto text-sm">
        Hope you enjoyed your experience here
      </span>
      <Button
        type="button"
        size="none"
        variant="default"
        onClick={handleSignOut}
        className="bg-destructive dark:text-foreground w-full rounded-md px-3 py-2 text-base"
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
    <div className="flex-row-center h-12 w-full gap-2">
      {(Object.keys(MENU_OPTIONS) as Menu[]).map((key) => (
        <motion.div
          key={key}
          variants={CATEGORY_TAB_VARIANTS}
          animate={selectedCategory === key ? 'active' : 'inactive'}
          className="h-full"
        >
          <Button
            type="button"
            size="none"
            variant="default"
            className={cn(
              'text-foreground bg-card-background cursor-pointer rounded-md px-3 py-2 text-base font-medium will-change-transform',
              selectedCategory === key
                ? 'bg-card-background opacity-100'
                : 'bg-transparent',
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
  const optionKeys = useMemo(
    () =>
      category === 'cloth'
        ? (Object.keys(clothOptions) as ClothKey[])
        : (Object.keys(headOptions) as HeadKey[]),
    [category],
  )

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

export default function SapiensClient({
  preloadedBalance,
  preloadedCurrentUser,
}: {
  preloadedBalance: Preloaded<typeof api.functions.credits.getBalance>
  preloadedCurrentUser: Preloaded<typeof api.auth.getCurrentUser>
}) {
  const { theme, setTheme } = useThemeStore()
  const currentUser = usePreloadedQuery(preloadedCurrentUser)

  const { sapiensConfig, setSapiensConfig } = useSapiensStore()
  const {
    colors: selectedColor,
    cloth: selectedCloth,
    head: selectedHead,
    item: selectedItem,
  } = sapiensConfig

  // const [selectedColor, setSelectedColor] = useState<SelectedColors>(
  //   theme === 'dark' ? SELECTED_COLOR_DARK_INIT : SELECTED_COLOR_LIGHT_INIT,
  // )
  // const [selectedCloth, setSelectedCloth] = useState<ClothKey>('cloth1')
  // const [selectedHead, setSelectedHead] = useState<HeadKey>('head1')
  // const [selectedItem, setSelectedItem] = useState<ItemKey>('item1')

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [selectedCategory, setSelectedCategory] = useState<Menu | 'settings'>(
    'head',
  )

  const setSelectedColor = useCallback(
    (updater: React.SetStateAction<SelectedColors>) => {
      setSapiensConfig((prev) => ({
        ...prev,
        colors: typeof updater === 'function' ? updater(prev.colors) : updater,
      }))
    },
    [setSapiensConfig],
  )

  const setSelectedCloth = useCallback(
    (cloth: ClothKey) => {
      setSapiensConfig((prev) => ({ ...prev, cloth }))
    },
    [setSapiensConfig],
  )

  const setSelectedHead = useCallback(
    (head: HeadKey) => {
      setSapiensConfig((prev) => ({ ...prev, head }))
    },
    [setSapiensConfig],
  )

  const setSelectedItem = useCallback(
    (item: ItemKey) => {
      setSapiensConfig((prev) => ({ ...prev, item }))
    },
    [setSapiensConfig],
  )

  const avatarRef = useRef<HTMLDivElement>(null)

  const ClothComponent = clothOptions[selectedCloth]
  const HeadComponent = headOptions[selectedHead]

  const [isPending, startTransition] = useTransition()

  // Stabilize the config object reference across renders
  const avatarConfig = useMemo<AvatarConfig>(
    () => ({
      cloth: selectedCloth,
      head: selectedHead,
      item: selectedItem,
      colors: selectedColor,
    }),
    [selectedCloth, selectedHead, selectedItem, selectedColor],
  )

  const handleToggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    setSelectedColor(
      nextTheme === 'dark'
        ? SELECTED_COLOR_DARK_INIT
        : SELECTED_COLOR_LIGHT_INIT,
    )
  }, [setTheme, theme, setSelectedColor])

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
    [setSelectedColor],
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
    [selectedCategory, setSelectedCloth, setSelectedHead],
  )

  if (!currentUser || isPending || !mounted)
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
      className="main-container flex-col-center gap-4 px-[5%] py-8 md:px-0"
    >
      {/* SpaiensClient Navigation bar */}
      <motion.div
        variants={CONTAINER_VARIANTS}
        className="flex h-12 w-full justify-end gap-2"
      >
        <CreditDisplay preloadedBalance={preloadedBalance} />
        <Button
          type="button"
          variant="default"
          size="none"
          className="bg-card-background text-foreground size-12 rounded-xl"
          onClick={handleToggleTheme}
          data-download-trigger
        >
          {theme === 'dark' ? (
            <HugeiconsIcon
              strokeWidth={2}
              icon={SunriseIcon}
              className="size-5"
            />
          ) : (
            <HugeiconsIcon
              strokeWidth={2}
              icon={SunsetIcon}
              className="size-5"
            />
          )}
        </Button>
        <Button
          type="button"
          variant="default"
          size="none"
          className="text-foreground bg-card-background size-12 rounded-xl"
          onClick={() => setSelectedCategory('settings')}
          data-download-trigger
        >
          <HugeiconsIcon
            strokeWidth={2}
            icon={Settings03Icon}
            className="size-5"
          />
        </Button>
      </motion.div>

      {selectedCategory !== 'settings' && (
        <motion.div
          variants={CONTAINER_VARIANTS}
          ref={avatarRef}
          // animate={selectedCategory === 'settings' ? 'none' : 'visible'}
          animate="visible"
          style={{ backgroundColor: selectedColor.background }}
          className="relative isolate aspect-square w-full overflow-hidden rounded-2xl transition-colors duration-500 will-change-transform"
        >
          <div className="text-foreground absolute top-2 right-2 z-50 flex flex-col items-center gap-2 text-sm">
            <DownloadPopover
              avatarRef={avatarRef}
              preloadedBalance={preloadedBalance}
              avatarConfig={avatarConfig}
            />
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
            loading="eager"
            crossOrigin="anonymous"
            className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
          />
        </motion.div>
      )}

      <motion.div
        variants={CONTAINER_VARIANTS}
        className="relative flex w-full flex-1 flex-col items-center justify-start gap-2 pb-[200px]"
      >
        {selectedCategory !== 'settings' && (
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelect={handleSelectCategory}
          />
        )}

        {selectedCategory === 'settings' && (
          <SettingsPanel
            onBack={setSelectedCategory}
            startTransition={startTransition}
          />
        )}

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

      <Suspense>
        <LazySapiensDisplay
          sapiensConfig={avatarConfig}
          className="pointer-events-none fixed right-0 bottom-0 h-70 w-70 translate-x-[20%]"
        />
      </Suspense>
    </motion.main>
  )
}
