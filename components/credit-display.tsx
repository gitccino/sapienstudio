'use client'

import { Preloaded, usePreloadedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { HugeiconsIcon } from '@hugeicons/react'
import { Wallet01Icon } from '@hugeicons/core-free-icons'
import { CreditGift } from './credit-gift'
import { cn } from '@/lib/utils'

export function CreditDisplay({
  preloadedBalance,
  className,
}: React.ComponentProps<'div'> & {
  preloadedBalance: Preloaded<typeof api.functions.credits.getBalance>
}) {
  // This hook takes the instant server data, but subscribes to WebSocket updates!
  const balance = usePreloadedQuery(preloadedBalance)
  return (
    <div
      className={cn(
        'flex-row-start bg-card-background gap-2 rounded-xl pl-4',
        className,
      )}
    >
      <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} className="size-5" />
      <div className="flex-row-center gap-1 pb-0.5 text-base">
        <span className="font-semibold">
          {balance === -1
            ? 'Empty'
            : balance === 0
              ? 'No credits'
              : `${balance} credits`}
        </span>
      </div>
      <div className="flex-row-start">
        <CreditGift />
        <CreditGift amount={-1} />
      </div>
    </div>
  )
}
