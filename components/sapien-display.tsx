import { Body } from '@/assets'
import { DIST_DOMAIN } from '@/constants'
import { clothOptions, headOptions } from '@/constants/sapiens'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { AvatarConfig } from '@/lib/sapiens-resource'
import { forwardRef } from 'react'

export default forwardRef(function SapiensDisplay(
  {
    sapiensConfig,
    className,
    ...props
  }: { sapiensConfig: AvatarConfig } & React.ComponentProps<'div'>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const selectedColor = sapiensConfig.colors
  const selectedCloth = sapiensConfig.cloth
  const selectedHead = sapiensConfig.head
  const selectedItem = sapiensConfig.item
  const Cloth = clothOptions[selectedCloth]
  const Head = headOptions[selectedHead]

  return (
    <div
      ref={ref}
      className={cn('relative h-40 w-40 overflow-hidden', className)}
      {...props}
    >
      <Body
        color={selectedColor.body}
        className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
      />
      {Cloth && (
        <Cloth
          color={selectedColor.cloth}
          className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
        />
      )}
      {Head && (
        <Head
          color={selectedColor.head}
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
    </div>
  )
})
