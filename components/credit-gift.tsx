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
import { useState, useCallback, memo } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type CreditGiftProps = {
  amount?: number
}

// ⚡ Master Memoization: Prevent rerendering unimpacted components
export const CreditGift = memo(function CreditGift({
  amount = 1,
  className,
}: CreditGiftProps & React.ComponentProps<'div'>) {
  const adjustCredits = useMutation(api.functions.credits.adjustCredits)
  const [isPending, setIsPending] = useState(false)

  // ⚡ Stabilize Your Prop References: Protect inline function bindings from creating garbage references
  const handleAdjustCredits = useCallback(async () => {
    if (isPending) return
    setIsPending(true)
    try {
      await adjustCredits({ amount })
    } finally {
      setIsPending(false)
    }
  }, [amount, adjustCredits, isPending])

  return (
    <div className={cn('flex-row-center h-full', className)}>
      <Button
        variant="ghost"
        size="none"
        onClick={handleAdjustCredits}
        disabled={isPending}
        className="h-[70%] cursor-pointer rounded-none"
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
})
