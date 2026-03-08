import {
  EvilIcon,
  GiftIcon,
  MinusSignSquareIcon,
  PlusSignSquareIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from './ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type CreditGiftProps = {
  amount?: number
}

export function CreditGift({
  amount = 1,
  className,
}: CreditGiftProps & React.ComponentProps<'div'>) {
  const adjustCredits = useMutation(api.functions.credits.adjustCredits)
  const [isPending, setIsPending] = useState(false)

  const handleAdjustCredits = async () => {
    setIsPending(true)
    try {
      await adjustCredits({ amount })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn('flex-row-center h-full', className)}>
      <Button
        variant="ghost"
        size="none"
        onClick={handleAdjustCredits}
        disabled={isPending}
        className="border-foreground/10 h-[70%] cursor-pointer rounded-none border-l pr-2.5 pl-2"
      >
        {isPending ? (
          <Loader2 className="text-foreground size-3.5 animate-spin" />
        ) : (
          <>
            {amount > 0 ? (
              <HugeiconsIcon
                icon={PlusSignSquareIcon}
                className="size-5 text-[#F9C846]"
                strokeWidth={2}
              />
            ) : (
              <HugeiconsIcon
                icon={MinusSignSquareIcon}
                className="size-5 text-[#e55b5b]"
                strokeWidth={2}
              />
            )}
          </>
        )}
      </Button>
    </div>
  )
}
