'use client'

import { memo, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { usePreloadedQuery } from 'convex/react'
import type { Preloaded } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion } from 'motion/react'
import { STAGGER_CONTAINER } from '@/constants'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import SapiensDisplay from '@/components/sapien-display'
import { formatDistance, subDays } from 'date-fns'
import { decodeResourceName } from '@/lib/sapiens-resource'
import { FunctionReturnType } from 'convex/server'
import { LoadingSquares } from '@/app/register/RegisterClient'

type DownloadHistory = FunctionReturnType<
  typeof api.functions.downloads.getDownloadHistory
>
type DownloadHistoryEntry = DownloadHistory[number]

export default function HistoryClient({
  preloadedHistory,
}: {
  preloadedHistory: Preloaded<typeof api.functions.downloads.getDownloadHistory>
}) {
  const history: DownloadHistory = usePreloadedQuery(preloadedHistory)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (isPending)
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <LoadingSquares />
      </div>
    )

  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="main-container flex flex-col items-start justify-start gap-4 px-[5%] py-8 md:px-0"
    >
      <motion.div className="flex-row-start w-full gap-4">
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

        <h1 className="w-full text-lg font-medium">Download History</h1>
      </motion.div>
      {history.length === 0 ? (
        <p>No downloads yet.</p>
      ) : (
        <ul className="w-full space-y-4">
          {history.map((entry) => (
            <HistoryComponent key={entry._id} historyEntry={entry} />
          ))}
        </ul>
      )}
    </motion.main>
  )
}

export const HistoryComponent = memo(function HistoryComponent({
  historyEntry,
}: {
  historyEntry: DownloadHistoryEntry
}) {
  const sapiensConfig = useMemo(
    () =>
      historyEntry.resourceName
        ? decodeResourceName(historyEntry.resourceName)
        : null,
    [historyEntry.resourceName],
  )

  const timeAgo = useMemo(
    () =>
      formatDistance(
        subDays(new Date(), 1),
        new Date(historyEntry.downloadedAt),
        { addSuffix: true },
      ),
    [historyEntry.downloadedAt],
  )

  if (!sapiensConfig) return null

  return (
    <li className="flex-row-start bg-card-background relative gap-2 rounded-2xl">
      <SapiensDisplay sapiensConfig={sapiensConfig} className="shrink-0" />
      <div className="flex w-full flex-col justify-between self-stretch p-3 pl-0">
        <div className="flex flex-col items-start justify-start gap-2">
          <span className="font-medium">
            Sapiens{' '}
            <span className="text-muted-foreground text-xs">
              #{historyEntry._id.slice(0, 5)}
            </span>
          </span>
          <div className="flex-row-start w-fit gap-1 overflow-hidden">
            {Object.values(sapiensConfig.colors).map((c, index) => (
              <span
                key={`${historyEntry._id}-${index}-${c}`}
                style={{ backgroundColor: c }}
                className="border-foreground/10 aspect-square w-5 border-2"
              ></span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-muted-foreground text-xs font-medium">
            {timeAgo}
          </span>
        </div>
      </div>
    </li>
  )
})
