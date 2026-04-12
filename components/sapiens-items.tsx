import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { itemOptions } from '@/constants/sapiens'
import type { ItemKey } from '@/constants'

type SapiensItemsProps = {
  selectedItem: string
  setSelectedTrait: (triat: ItemKey) => void
}

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME

export const SapiensItems = memo(function SapiensItems({
  selectedItem,
  setSelectedTrait,
}: SapiensItemsProps) {
  return (
    <div className="gap2 grid w-full grid-cols-3">
      {Object.keys(itemOptions).map((itemKey) => (
        <Button
          key={itemKey}
          type="button"
          size="none"
          variant="default"
          onClick={() => setSelectedTrait(itemKey as ItemKey)}
          className={cn(
            'border-background relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-transparent',
            selectedItem === itemKey && 'border-foreground/10',
          )}
        >
          <Image
            width={500}
            height={500}
            src={`https://${DIST_DOMAIN}/sapiens/items/${itemKey}.svg`}
            alt={`${itemKey} Display`}
            className="size-full translate-y-1/2 scale-200"
          />
        </Button>
      ))}
    </div>
  )
})
