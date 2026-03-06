import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { itemOptions } from '@/constants'
import type { ItemKey } from '@/constants'

type SapiensItemsProps = {
  selectedItem: string
  setSelectedTrait: (triat: ItemKey) => void
}

const DIST_DOMAIN = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME

export function SapiensItems({
  selectedItem,
  setSelectedTrait,
}: SapiensItemsProps) {
  return (
    <div className="w-full grid grid-cols-3 gap2">
      {Object.keys(itemOptions).map((itemKey) => (
        <Button
          key={itemKey}
          type="button"
          size="none"
          variant="default"
          onClick={() => setSelectedTrait(itemKey as ItemKey)}
          className={cn(
            'overflow-hidden relative rounded-xl border-2 border-background bg-transparent w-full aspect-square',
            selectedItem === itemKey && 'border-foreground/10',
          )}
        >
          <Image
            width={500}
            height={500}
            src={`https://${DIST_DOMAIN}/items/${itemKey}.svg`}
            alt={`${itemKey} Display`}
            className="size-full scale-200 translate-y-1/2"
          />
        </Button>
      ))}
    </div>
  )
}
