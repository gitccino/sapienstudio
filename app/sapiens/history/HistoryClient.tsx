'use client'

import {
  memo,
  useMemo,
  useRef,
  useState,
  useTransition,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import { useRouter } from 'next/navigation'
import { usePaginatedQuery, usePreloadedQuery } from 'convex/react'
import type { Preloaded } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { motion } from 'motion/react'
import { RESOLUTION_PRESETS, STAGGER_CONTAINER } from '@/constants'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  CalendarDownload02Icon,
  ImageDownload02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'

const LazySapiensDisplay = lazy(() => import('@/components/sapien-display'))
import { formatDistance, formatDistanceToNow, subDays } from 'date-fns'
import { decodeResourceName } from '@/lib/sapiens-resource'
import { FunctionReturnType } from 'convex/server'
import { LoadingSquares } from '@/app/register/RegisterClient'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn, formatReadableDate } from '@/lib/utils'

type DownloadHistory = FunctionReturnType<
  typeof api.functions.downloads.getDownloadHistory
>
type DownloadHistoryEntry = DownloadHistory[number]

const PAGINATION_NUMITEMS = 2

export default function HistoryClient({
  preloadedHistory,
}: {
  preloadedHistory: Preloaded<typeof api.functions.downloads.getDownloadHistory>
}) {
  const history: DownloadHistory = usePreloadedQuery(preloadedHistory)
  const { results, status, loadMore } = usePaginatedQuery(
    api.functions.downloads.getPaginatedDownloadHistory,
    {},
    { initialNumItems: PAGINATION_NUMITEMS },
  )
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

        <h1 className="w-full text-lg font-semibold">Download History</h1>
      </motion.div>

      {history.length === 0 ? (
        <p>No downloads yet.</p>
      ) : (
        <>
          {results.map((entry, index) => (
            <ul key={entry._id} className="w-full">
              <HistoryComponent
                key={entry._id}
                historyEntry={entry}
                isFirst={index === 0}
                isLast={index === results.length - 1}
              />
            </ul>
          ))}
        </>
      )}
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

export const HistoryComponent = memo(function HistoryComponent({
  historyEntry,
  isFirst = false,
  isLast = false,
}: {
  historyEntry: DownloadHistoryEntry
  isFirst?: boolean
  isLast?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadResolution, setDownloadResolution] = useState(1024)
  const avatarRef = useRef<HTMLDivElement>(null)
  const sapiensConfig = useMemo(
    () =>
      historyEntry.resourceName
        ? decodeResourceName(historyEntry.resourceName)
        : null,
    [historyEntry.resourceName],
  )

  const [timeAgo, setTimeAgo] = useState<string>('')

  useEffect(() => {
    setTimeAgo(
      formatDistanceToNow(new Date(historyEntry.downloadedAt), {
        includeSeconds: true,
      }),
    )
  }, [historyEntry.downloadedAt])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const avatarEl = avatarRef.current
      if (!avatarEl || !sapiensConfig) return

      const rect = avatarEl.getBoundingClientRect()
      const elementSize = Math.min(rect.width, rect.height)
      const pixelRatio = downloadResolution / elementSize
      avatarEl.style.backgroundColor = sapiensConfig.colors.background

      const dataUrl = await toPng(avatarEl, {
        cacheBust: true,
        skipFonts: true,
        pixelRatio: pixelRatio,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.closest('[data-download-trigger]')
          }
          return true
        },
      })
      const link = document.createElement('a')
      link.download = `sapiens-${historyEntry._id.slice(1, 7)}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setIsDownloading(false)
      if (avatarRef.current) {
        avatarRef.current.style.backgroundColor = 'transparent'
      }
    }
  }, [downloadResolution, historyEntry._id, sapiensConfig])

  if (!sapiensConfig) return null

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
            {formatReadableDate(historyEntry.downloadedAt)}{' '}
            <span className="text-muted-foreground mx-2 text-xs">
              {timeAgo}
            </span>
          </span>
        </div>

        <div className="flex-row-start bg-card-background relative my-2 w-full gap-0 overflow-hidden rounded-2xl md:gap-4">
          <Suspense
            fallback={
              <div className="bg-muted h-40 w-40 shrink-0 animate-pulse rounded-xl" />
            }
          >
            <LazySapiensDisplay
              ref={avatarRef}
              sapiensConfig={sapiensConfig}
              className="shrink-0"
            />
          </Suspense>
          <div className="flex w-full flex-col justify-between self-stretch p-3 pl-0">
            <div className="flex flex-col items-start justify-start gap-2">
              <span className="text-sm font-semibold capitalize">
                Sapien #{historyEntry._id.slice(1, 7)}
              </span>
              <div className="flex-row-start w-fit gap-1 overflow-hidden">
                {Object.values(sapiensConfig.colors).map((c, index) => (
                  <span
                    key={`${historyEntry._id}-${index}-${c}`}
                    style={{ backgroundColor: c }}
                    className="border-foreground/10 aspect-square w-5 rounded border-2"
                  ></span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end justify-start">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="none"
                    className="gap-0.75 text-xs md:gap-1"
                  >
                    <HugeiconsIcon
                      strokeWidth={1.75}
                      icon={ImageDownload02Icon}
                      className="size-4"
                    />
                    <span>Free Download</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="center"
                  className="flex h-fit w-60 flex-col items-start gap-2 rounded-xl border-2 shadow-lg"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {RESOLUTION_PRESETS.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        size="none"
                        variant="outlineDark"
                        onClick={() => setDownloadResolution(size)}
                        className={`rounded-md px-2 py-0.5 text-sm font-semibold ${downloadResolution === size ? 'border-foreground/80' : 'opacity-30'}`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="none"
                    onClick={handleDownload}
                    className="w-full rounded-md py-1 dark:font-semibold"
                  >
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Button>
                </PopoverContent>
              </Popover>
              {/* <span className="text-muted-foreground w-full text-right text-xs font-medium">
                {timeAgo}
              </span> */}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
})
