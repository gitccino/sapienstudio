// app/collections/[id]/CollectionClient.tsx
'use client'

import { useState, useMemo, useEffect, useRef, useTransition } from 'react'
import { motion } from 'motion/react'
import Image, { StaticImageData } from 'next/image'
import { CollectionConfig } from '@/types'
import { useEngineStore } from '@/lib/store-v2'
import {
  DIST_DOMAIN,
  MAX_RESOLUTION,
  MIN_RESOLUTION,
  RESOLUTION_PRESETS,
  VERSION,
} from '@/constants'
import { ColorSection } from '@/components/color-section'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AiImageIcon,
  ImageDownload02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { api } from '@/convex/_generated/api'
import { useMutation } from 'convex/react'
import {
  generateResourceName,
  generateResourceNameV2,
} from '@/lib/sapiens-resource'
import { getSecurePreviewUrl } from '@/lib/utils'
import { toPng } from 'html-to-image'

const CREDITS_PER_DOWNLOAD = 1

export function DownloadPopoverV2({
  avatarRef,
  activeState,
  collectionId,
}: {
  avatarRef: React.RefObject<HTMLDivElement | null>
  activeState: {
    traits: Record<string, string>
    colors: Record<string, string>
  }
  collectionId: string
}) {
  const [open, setOpen] = useState(false)
  const [downloadResolution, setDownloadResolution] = useState(1024)
  const [isDownloading, setIsDownloading] = useState(false)
  const purchaseAndRecordDownload = useMutation(
    api.functions.downloads.purchaseAndRecordDownload,
  )

  const handleDownload = async () => {
    if (!avatarRef.current) return
    const effectiveRes = downloadResolution
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
          pixelRatio: pixelRatio,
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

      await purchaseAndRecordDownload({
        resourceName: generateResourceNameV2(collectionId, activeState),
        cost: CREDITS_PER_DOWNLOAD,
      })
    } catch (err) {
      console.error('Failed to export avatar:', err)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="opticalCenter"
          variant="ghost"
          // disabled={isDownloading}
          data-download-trigger
          className="flex-row-start bg-card-background border-border box-border h-12 rounded-xl border font-semibold dark:box-content"
        >
          <HugeiconsIcon
            strokeWidth={2}
            icon={ImageDownload02Icon}
            className="size-5"
          />
          <span className="text-base">Download</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="bg-card-background w-[92%] rounded-2xl md:w-100"
      >
        <DialogHeader>
          <DialogTitle>
            <span className="text-lg font-semibold">Resolution</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="text-muted-foreground grid h-fit w-full grid-cols-3 p-2">
            <div className="flex-row-start col-span-2 gap-1">
              <HugeiconsIcon
                icon={AiImageIcon}
                className="size-4"
                strokeWidth={1.5}
              />
              <span>Credits/Download</span>
            </div>
            <span className="text-destructive col-span-1 text-right font-semibold">
              -1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {RESOLUTION_PRESETS.map((size) => (
              <Button
                key={size}
                type="button"
                size="none"
                variant="outlineDark"
                onClick={() => {
                  setDownloadResolution(size)
                }}
                className={`h-10 rounded-md border-[1.5px] text-sm font-semibold ${
                  downloadResolution === size
                    ? 'border-border'
                    : 'border-card-background opacity-50'
                } transition-none`}
              >
                {size}x{size}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="opticalCenter"
            className="bg-card-background-lv2 h-12 text-base font-semibold"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CollectionClient<
  TTrait extends string,
  TColor extends string,
>({
  config,
  preloadedBalance,
}: {
  config: CollectionConfig<TTrait, TColor>
  preloadedBalance?: any
}) {
  const avatarRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { collections, updateTrait, updateColor, initializeCollection } =
    useEngineStore()
  const [isRendering, setIsRendering] = useState(false)

  // 1. Initialize state if it's a new user visiting this collection
  useEffect(() => {
    initializeCollection(config.id, config.defaultState as any)
  }, [config, initializeCollection])

  const activeState = collections[config.id] || config.defaultState
  const { traits: selectedTraits, colors: selectedColors } = activeState
  const [activeMenu, setActiveMenu] = useState<TTrait | 'colors' | 'settings'>(
    config.traits[0].id,
  )

  const handleSelectColor = (
    color: string,
    _opacity: number,
    category: any,
  ) => {
    updateColor(config.id, category as string, color)
  }

  useEffect(() => {
    let isMounted = true

    const renderToCanvas = async () => {
      if (!avatarRef.current || !canvasRef.current) return
      setIsRendering(true)

      try {
        const dataUrl = await toPng(avatarRef.current, {
          cacheBust: true,
          skipFonts: true,
          pixelRatio: 2, // Keeps the canvas looking sharp on Retina displays
        })
        const img = new window.Image()
        img.onload = () => {
          if (!isMounted) return
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // 3. Clear the previous drawing and draw the newly flattened image
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          setIsRendering(false)
        }
        img.src = dataUrl
      } catch (error) {
        console.error('Failed to render secure canvas', error)
      }
    }

    const timeoutId = setTimeout(renderToCanvas, 150)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <motion.main className="flex w-full flex-1 flex-col items-center justify-start gap-4">
      {/* --- PREVIEW WINDOW --- */}
      {/* {activeMenu !== 'settings' && (
        <div className="relative isolate aspect-square w-full">
          ✅ Canvas-based secure preview — assets are not directly accessible in devtools
          <SecureCanvasPreview
            config={config as CollectionConfig<string, string>}
            selectedTraits={selectedTraits}
            selectedColors={selectedColors}
          />

          Download button overlaid on top of the canvas
          <div className="pointer-events-auto absolute top-2 right-2 z-50">
            <DownloadPopoverV2
              avatarRef={avatarRef}
              activeState={activeState}
              collectionId={config.id}
            />
          </div>
        </div>
      )} */}

      {/* <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className="h-full w-full rounded-xl object-contain"
        style={{ backgroundColor: selectedColors.background }}
      /> */}

      {/* --- OLD DOM-BASED PREVIEW (commented out, kept for reference) --- */}
      {activeMenu !== 'settings' && (
        <div
          ref={avatarRef}
          style={{ backgroundColor: selectedColors['background'] || '#ffffff' }}
          className="relative aspect-square w-full overflow-hidden rounded-2xl transition-colors duration-500 will-change-transform"
        >
          {/* Base Layer (e.g., Body) */}
          {config.baseLayer && (
            <>
              {(() => {
                if (config.baseLayer.type === 'component') {
                  const BaseComponent = config.baseLayer.component as any
                  return (
                    <BaseComponent
                      color={
                        config.baseLayer.colorCategory
                          ? (selectedColors[
                              config.baseLayer.colorCategory
                            ] as string)
                          : undefined
                      }
                      className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
                    />
                  )
                }
                return (
                  <Image
                    src={config.baseLayer.component as StaticImageData}
                    alt="body"
                    fill
                    priority
                    className="object-contain grayscale"
                  />
                )
              })()}
            </>
          )}

          {/* Dynamic Sorted Traits */}
          {config.traits
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((trait) => {
              const selectedValue = selectedTraits[trait.id as string]
              if (!selectedValue) return null

              if (trait.type === 'component') {
                const TraitComponent = trait.options[selectedValue]
                const color = trait.colorCategory
                  ? selectedColors[trait.colorCategory as string]
                  : undefined
                return TraitComponent ? (
                  <TraitComponent
                    key={trait.id}
                    color={color}
                    className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
                  />
                ) : null
              }

              if (trait.type === 'image') {
                const imageUrl = trait.options[selectedValue]
                return (
                  <Image
                    key={trait.id}
                    src={`https://${DIST_DOMAIN}/${config.id}/${trait.path}/${selectedValue}${trait.extension}${VERSION}`}
                    alt={trait.id as string}
                    fill
                    className="object-contain"
                  />
                )
              }
            })}

          <div className="pointer-events-auto absolute top-2 right-2 z-50">
            <DownloadPopoverV2
              avatarRef={avatarRef}
              activeState={activeState}
              collectionId={config.id}
            />
          </div>
        </div>
      )}

      {/* --- DYNAMIC MENU TABS --- */}
      <div className="flex-row-center h-12 w-full gap-2">
        {config.traits.map((trait) => {
          const isActive = activeMenu === trait.id
          return (
            <Button
              key={trait.id}
              variant="ghost"
              size="none"
              onClick={() => setActiveMenu(trait.id)}
              className={`text-foreground bg-card-background h-12 cursor-pointer rounded-xl px-3 text-base font-semibold ${
                isActive ? 'opacity-100' : 'bg-transparent'
              }`}
            >
              {trait.label}
            </Button>
          )
        })}
        {config.colors.length > 0 && (
          <Button
            variant="ghost"
            size="none"
            onClick={() => setActiveMenu('colors')}
            className={`text-foreground bg-card-background h-12 cursor-pointer rounded-xl px-3 text-base font-semibold ${
              activeMenu === 'colors' ? 'opacity-100' : 'bg-transparent'
            }`}
          >
            Colors
          </Button>
        )}
      </div>

      {/* --- DYNAMIC SELECTION PANELS --- */}
      <div className="relative flex w-full flex-1 flex-col items-center justify-start gap-2 pb-[200px]">
        {/* If a specific trait is active (e.g., Clothes) */}
        {config.traits.map((trait) => {
          if (activeMenu !== trait.id) return null
          const displayType = trait.type
          return (
            <div key={trait.id} className="grid w-full grid-cols-3 gap-2">
              {Object.keys(trait.options).map((key) => {
                const isSelected = selectedTraits[trait.id as string] === key
                const Thumbnail = trait.options[key]
                return (
                  <button
                    key={key}
                    onClick={() =>
                      updateTrait(config.id, trait.id as string, key)
                    }
                    className={`border-background text-foreground relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-transparent p-0 duration-0 ${
                      isSelected ? 'border-foreground/10' : ''
                    }`}
                  >
                    {/* {key} */}
                    {displayType === 'component' ? (
                      <>
                        {/* <Thumbnail color={selectedColors[trait.id]} /> */}
                        <img
                          key={trait.id}
                          // src={`https://${DIST_DOMAIN}/${config.id}/${trait.path}/${key}${trait.extension}${VERSION}`}
                          src={getSecurePreviewUrl(
                            `${config.id}/${trait.path}/${key}${trait.extension}`,
                            150,
                            150,
                          )}
                          alt={trait.id as string}
                          width={500}
                          height={500}
                          className="size-full"
                          crossOrigin="anonymous"
                        />
                      </>
                    ) : (
                      <>
                        {/* <span>
                          {config.id}/{trait.path}/{key}
                          {trait.extension}
                          {VERSION}`
                        </span> */}
                        <img
                          key={trait.id}
                          // src={`https://${DIST_DOMAIN}/${config.id}/${trait.path}/${key}${trait.extension}${VERSION}`}
                          src={getSecurePreviewUrl(
                            `${config.id}/${trait.path}/${key}${trait.extension}`,
                            150,
                            150,
                          )}
                          alt={trait.id as string}
                          width={500}
                          height={500}
                          className="size-full"
                          crossOrigin="anonymous"
                        />
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}

        {/* If Colors menu is active */}
        {activeMenu === 'colors' && (
          <div className="relative flex w-full flex-col items-start justify-start gap-4 px-2">
            {config.colors.map((colorBlock) => (
              <div key={colorBlock.category as string} className="w-full">
                {/* <h3>{colorBlock.label}</h3> */}
                {/* Map over colorBlock.swatches and call updateColor(config.id, colorBlock.category, selectedHex) */}
                <ColorSection
                  category={colorBlock.category}
                  label={colorBlock.label}
                  colorOptions={colorBlock.swatches}
                  value={selectedColors[colorBlock.category]}
                  onSelectColorAction={handleSelectColor}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.main>
  )
}
