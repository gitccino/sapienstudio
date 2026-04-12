'use client'

import { Body } from '@/assets'
import {
  DIST_DOMAIN,
  SWATCH_OPTIONS,
  type ClothKey,
  type HeadKey,
  type ItemKey,
} from '@/constants'
import { clothOptions, headOptions, itemOptions } from '@/constants/sapiens'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { forwardRef, useEffect, useState } from 'react'

type RandomConfig = {
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

const clothKeys = Object.keys(clothOptions) as ClothKey[]
const headKeys = Object.keys(headOptions) as HeadKey[]
const itemKeys = Object.keys(itemOptions) as ItemKey[]

function getRandomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function createRandomConfig(): RandomConfig {
  return {
    cloth: getRandomElement(clothKeys),
    head: getRandomElement(headKeys),
    item: getRandomElement(itemKeys),
    colors: {
      background: getRandomElement(SWATCH_OPTIONS.background),
      // body: getRandomElement(SWATCH_OPTIONS.body),
      body: '#f3c9b1',
      cloth: getRandomElement(SWATCH_OPTIONS.cloth),
      head: getRandomElement(SWATCH_OPTIONS.head),
    },
  }
}

export default forwardRef(function SapiensCollectionDisplay(
  { className, ...props }: React.ComponentProps<'div'>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [config, setConfig] = useState<RandomConfig | null>(null)

  useEffect(() => {
    // Initialize on mount (client-only) to avoid SSR/client mismatch
    const initId = setTimeout(() => {
      setConfig(createRandomConfig())
    }, 0)

    const intervalId = setInterval(() => {
      setConfig(createRandomConfig())
    }, 3000)

    return () => {
      clearTimeout(initId)
      clearInterval(intervalId)
    }
  }, [])

  const selectedColor = config?.colors
  const Cloth = config ? clothOptions[config.cloth] : null
  const Head = config ? headOptions[config.head] : null
  const selectedItem = config?.item

  return (
    <div
      ref={ref}
      className={cn('relative h-40 w-40 overflow-hidden', className)}
      {...props}
    >
      {config && (
        <>
          <Body
            color={selectedColor!.body}
            className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
          />
          {Cloth && (
            <Cloth
              color={selectedColor!.cloth}
              className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
            />
          )}
          {Head && (
            <Head
              color={selectedColor!.head}
              className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
            />
          )}
          <Image
            key={selectedItem}
            src={`https://${DIST_DOMAIN}/sapiens/items/${selectedItem}.svg`}
            alt="Item"
            width={500}
            height={500}
            loading="eager"
            crossOrigin="anonymous"
            className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
          />
        </>
      )}
    </div>
  )
})
