'use client'

import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Body } from '@/assets'
import { clothOptions, headOptions, DIST_DOMAIN } from '@/constants'
import type { AvatarConfig } from '@/lib/sapiens-resource'

export default function SecureCanvasDisplay({
  config,
}: {
  config: AvatarConfig
}) {
  const hiddenLayerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRendering, setIsRendering] = useState(true)

  const { colors, cloth, head, item } = config
  const Cloth = clothOptions[cloth]
  const Head = headOptions[head]

  useEffect(() => {
    let isMounted = true

    const renderToCanvas = async () => {
      if (!hiddenLayerRef.current || !canvasRef.current) return
      setIsRendering(true)

      try {
        // 1. Generate a flat PNG data URL from the hidden DOM elements
        const dataUrl = await toPng(hiddenLayerRef.current, {
          cacheBust: true,
          skipFonts: true,
          pixelRatio: 2, // Keeps the canvas looking sharp on Retina displays
        })

        // 2. Load the flat PNG into a native Image object
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
        setIsRendering(false)
      }
    }

    // Add a tiny debounce. If the user drags a color picker quickly,
    // we don't want to trigger 50 snapshots a second!
    const timeoutId = setTimeout(renderToCanvas, 150)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [config]) // Re-run this effect whenever the config changes

  return (
    <div className="relative isolate aspect-square w-full overflow-hidden rounded-2xl">
      {/* VISIBLE LAYER: Only the flattened Canvas is accessible to the user */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className="h-full w-full object-contain"
        style={{ backgroundColor: colors.background }}
      />

      {/* LOADING OVERLAY: Smooths the visual transition while html-to-image processes the layers */}
      {isRendering && (
        <div className="absolute inset-0 z-50 flex animate-pulse items-center justify-center bg-black/5 backdrop-blur-sm">
          <span className="text-sm font-semibold opacity-50">Rendering...</span>
        </div>
      )}

      {/* HIDDEN SECURE LAYER: 
        Rendered completely off-screen.
        We cannot use `display: none` because html-to-image cannot read hidden elements.
        It must physically exist in the layout, just far outside the viewport. 
      */}
      <div
        ref={hiddenLayerRef}
        className="absolute top-[-9999px] left-[-9999px] h-[1024px] w-[1024px]"
      >
        <Body
          color={colors.body}
          className="absolute top-0 left-0 h-full w-full"
        />
        {Cloth && (
          <Cloth
            color={colors.cloth}
            className="absolute top-0 left-0 h-full w-full"
          />
        )}
        {Head && (
          <Head
            color={colors.head}
            className="absolute top-0 left-0 h-full w-full"
          />
        )}

        {/* Note: We use a standard <img> tag here instead of next/image to avoid CORS and lazy-load issues inside html-to-image */}
        <img
          src={`https://${DIST_DOMAIN}/items/${item}.svg`}
          alt="Item"
          crossOrigin="anonymous"
          className="absolute top-0 left-0 h-full w-full"
        />
      </div>
    </div>
  )
}
