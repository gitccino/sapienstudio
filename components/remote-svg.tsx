'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const svgCache = new Map<string, string>()

async function fetchSvg(url: string): Promise<string> {
  const cached = svgCache.get(url)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`)
  const text = await res.text()
  svgCache.set(url, text)
  return text
}

/** Injects width/height and size-full so SVG fills its container; fixes #currentColor typo */
function prepareSvg(svg: string): string {
  return svg
    .replace(
      /<svg([^>]*)>/,
      '<svg$1 class="size-full" width="100%" height="100%">',
    )
    .replace(/#currentColor/g, 'currentColor')
}

function prepareSvgWithoutInherit(svg: string): string {
  return svg.replace(
    /<svg([^>]*)>/,
    '<svg$1 class="size-full" width="100%" height="100%">',
  )
  // .replace(/#currentColor/g, 'currentColor')
}

export interface RemoteSvgProps {
  url: string
  color?: string
  className?: string
  style?: React.CSSProperties
}

export function RemoteSvg({ url, color, className, style }: RemoteSvgProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchSvg(url)
      .then((text) => setSvg(prepareSvg(text)))
      .catch(setError)
  }, [url])

  if (error) return null
  if (!svg) return null

  return (
    <div
      className={cn(className, '')}
      style={{ color, width: '100%', height: '100%', ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export function RemoteSvgWithoutInherit({
  url,
  color,
  className,
  style,
}: RemoteSvgProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchSvg(url)
      .then((text) => setSvg(prepareSvgWithoutInherit(text)))
      .catch(setError)
  }, [url])

  if (error) return null
  if (!svg) return null

  return (
    <div
      className={cn(className, '')}
      style={{ color, width: '100%', height: '100%', ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/** Creates a RemoteSvg component bound to a specific URL (drop-in for SVGR components) */
export function createRemoteSvg(url: string) {
  const Component = (props: Omit<RemoteSvgProps, 'url'>) => (
    <RemoteSvg url={url} {...props} />
  )
  Component.displayName = 'RemoteSvg'
  return Component
}

export function createRemoteSvgWithoutInherit(url: string) {
  const Component = (props: Omit<RemoteSvgProps, 'url'>) => (
    <RemoteSvgWithoutInherit url={url} {...props} />
  )
  Component.displayName = 'RemoteSvg'
  return Component
}
