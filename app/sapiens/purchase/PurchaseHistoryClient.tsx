'use client'

import { LoadingSquares } from '@/app/register/RegisterClient'
import { Button } from '@/components/ui/button'
import { STAGGER_CONTAINER } from '@/constants'
import { api } from '@/convex/_generated/api'
import { cn, formatReadableDate } from '@/lib/utils'
import {
  ArrowLeft01Icon,
  Loading03Icon,
  CalendarDownload02Icon,
  AiImageIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { usePaginatedQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { formatDistanceToNow, format } from 'date-fns'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useState, useTransition } from 'react'

const PAGINATION_NUMITEMS = 2

type PurchaseHistory = FunctionReturnType<
  typeof api.functions.purchase.getPaginatedPurchaseHistory
>
type PurchaseHistoryEntry = PurchaseHistory['page'][number]

export default function PurchaseHistoryClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const { results, status, loadMore } = usePaginatedQuery(
    api.functions.purchase.getPaginatedPurchaseHistory,
    {},
    { initialNumItems: PAGINATION_NUMITEMS },
  )

  if (isPending)
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <LoadingSquares />
      </div>
    )

  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      className="main-container flex flex-col items-start justify-start px-[5%] py-8 md:px-0"
    >
      <motion.div className="flex-row-start mb-10 w-full gap-6">
        <button
          onClick={() => startTransition(() => router.push('/sapiens'))}
          disabled={isPending}
          className="flex-row-center bg-card-background h-10 gap-1 rounded-xl pr-3 pl-2 font-medium transition-opacity disabled:opacity-70"
        >
          <HugeiconsIcon
            icon={isPending ? Loading03Icon : ArrowLeft01Icon}
            className={`size-5 ${isPending ? 'animate-spin' : ''}`}
            strokeWidth={2}
          />
          <span>{isPending ? 'Loading...' : 'Back'}</span>
        </button>

        <h1 className="w-full text-lg font-semibold">Purchase History</h1>
      </motion.div>

      {results.map((entry, index) => (
        <ul key={entry._id} className="w-full">
          <PurchaseHistoryComponent
            key={entry._id}
            historyEntry={entry}
            isFirst={index === 0}
            isLast={index === results.length - 1}
          />
        </ul>
      ))}
      {status === 'CanLoadMore' && (
        <Button
          variant="ghost"
          size="opticalCenter"
          onClick={() => loadMore(PAGINATION_NUMITEMS)}
          className="w-full cursor-pointer underline"
        >
          Load more
        </Button>
      )}
    </motion.main>
  )
}

export const PurchaseHistoryComponent = memo(function PurchaseHistoryComponent({
  historyEntry,
  isFirst = false,
  isLast = false,
}: {
  historyEntry: PurchaseHistoryEntry
  isFirst?: boolean
  isLast?: boolean
}) {
  const timeAgo = formatDistanceToNow(new Date(historyEntry.purchasedAt), {
    includeSeconds: true,
  })

  return (
    <li className="flex w-full flex-row items-stretch gap-2">
      <div className="relative mr-2 flex flex-col items-center">
        <div className="bg-background border-card-background absolute top-2.5 h-3 w-3 -translate-y-1/2 rounded-full border-2" />
        <div
          className={cn(
            'w-[2px] flex-1',
            isFirst && 'mt-2',
            isLast
              ? 'from-border via-border/90 to-background bg-linear-to-b'
              : 'bg-border',
          )}
        />
      </div>

      <div className="flex w-full flex-col items-start">
        <div className="flex flex-row items-center gap-1">
          <HugeiconsIcon
            icon={CalendarDownload02Icon}
            className="size-4"
            strokeWidth={2}
          />
          <span className="text-sm font-semibold">
            {formatReadableDate(historyEntry.purchasedAt)}{' '}
            {/* <span className="text-muted-foreground mx-2 text-xs">
              {timeAgo}
            </span> */}
          </span>
        </div>

        <div className="bg-card-background my-2 flex h-fit w-full flex-row items-center justify-start gap-3 rounded-xl p-3">
          <div className="bg-reward/70 rounded-lg p-2">
            <HugeiconsIcon
              icon={AiImageIcon}
              className="size-6"
              strokeWidth={2}
            />
          </div>
          <div className="flex flex-col items-start justify-start">
            <span className="font-medium">
              Purchase {historyEntry.creditsAdded} credits
            </span>
            <span className="text-muted-foreground text-sm">
              {format(historyEntry.purchasedAt, 'h:mm a')}
            </span>
          </div>
          <div className="mr-3 ml-auto text-lg font-bold">
            ${historyEntry.amountPaid.toFixed(2)}
          </div>
        </div>
      </div>
    </li>
  )
})
