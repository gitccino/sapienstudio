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
import { usePaginatedQuery, useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useMotionValueEvent,
} from 'motion/react'
import { RESOLUTION_PRESETS, STAGGER_CONTAINER } from '@/constants'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AiImageIcon,
  ArrowLeft01Icon,
  CalendarDownload02Icon,
  Delete02Icon,
  ImageDownload02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import SapiensDisplayV2 from '@/components/sapien-display-v2'

const LazySapiensDisplay = lazy(() => import('@/components/sapien-display-v2'))
import { formatDistance, formatDistanceToNow, subDays } from 'date-fns'
import {
  decodeResourceName,
  decodeResourceNameV2,
  DownloadedAvatarState,
  DownloadedState,
} from '@/lib/sapiens-resource'
import { FunctionReturnType } from 'convex/server'
import { LoadingSquares } from '@/app/register/RegisterClient'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn, formatReadableDate } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type DownloadHistory = FunctionReturnType<
  typeof api.functions.downloads.getDownloadHistory
>
type DownloadHistoryEntry = DownloadHistory[number]
type DownloadHistoryCount =
  | FunctionReturnType<typeof api.functions.downloads.getDownloadHistoryCount>
  | undefined

const PAGINATION_NUMITEMS = 10

export default function HistoryClient() {
  const totalCount: DownloadHistoryCount = useQuery(
    api.functions.downloads.getDownloadHistoryCount,
  )
  const { results, status, loadMore } = usePaginatedQuery(
    api.functions.downloads.getPaginatedDownloadHistory,
    {},
    { initialNumItems: PAGINATION_NUMITEMS },
  )
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Track IDs that are mid-exit-animation so we can filter them out
  // from `results`, letting AnimatePresence see the removal and animate it.
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const deleteMutation = useMutation(
    api.functions.downloads.deleteDownloadHistory,
  )

  const handleDelete = useCallback(
    (id: string) => {
      // 1. Filter the item out of the visible list — AnimatePresence detects
      //    this removal and plays the exit animation defined on motion.li.
      setDeletedIds((prev) => new Set([...prev, id]))
      // 2. Call the Convex mutation after animation has started
      setTimeout(() => {
        // deleteMutation({ id: id as any })
      }, 350)
    },
    [deleteMutation],
  )

  const visibleResults = useMemo(
    () => results.filter((e) => !deletedIds.has(e._id)),
    [results, deletedIds],
  )

  if (isPending)
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <LoadingSquares />
      </div>
    )

  return (
    <motion.main
      // variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="main-container flex flex-col items-start justify-start px-[5%] py-8 md:px-0"
    >
      <motion.div className="flex-row-start mb-10 w-full gap-6">
        <button
          onClick={() => startTransition(() => router.back())}
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

      {totalCount === 0 ? (
        <p className="mx-auto italic">No downloads yet.</p>
      ) : (
        <ul className="w-full">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleResults.map((entry, index) => (
              <HistoryComponent
                key={entry._id}
                historyEntry={entry}
                isFirst={index === 0}
                isLast={index === visibleResults.length - 1}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
      {(status === 'CanLoadMore' || status === 'LoadingMore') &&
        results.length < (totalCount ?? Infinity) && (
          <Button
            variant="ghost"
            size="opticalCenter"
            onClick={() => loadMore(PAGINATION_NUMITEMS)}
            className={cn(
              'text-muted-foreground w-full cursor-pointer',
              status === 'CanLoadMore' && 'underline',
            )}
          >
            <span className="underline">
              {status === 'LoadingMore' ? 'Loading...' : 'Load more'}
            </span>
          </Button>
        )}
    </motion.main>
  )
}

export const HistoryComponent = memo(function HistoryComponent({
  historyEntry,
  isFirst = false,
  isLast = false,
  onDelete,
}: {
  historyEntry: DownloadHistoryEntry
  isFirst?: boolean
  isLast?: boolean
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadResolution, setDownloadResolution] = useState(1024)
  const avatarRef = useRef<HTMLDivElement>(null)
  const sapiensConfig: DownloadedAvatarState | null = useMemo(
    () =>
      historyEntry.resourceName
        ? decodeResourceNameV2(historyEntry.resourceName)
        : null,
    [historyEntry.resourceName],
  )
  // Deletion is owned by the parent — no local state needed here

  const [timeAgo, setTimeAgo] = useState<string>('')
  const [xAsNumber, setXAsNumber] = useState(0)

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

  const x = useMotionValue(0)
  useMotionValueEvent(x, 'change', (latest) => {
    setXAsNumber(latest)
  })
  const deleteIconOpacity = useTransform(x, [0, -100], [0, 1])

  const handleDragEnd = useCallback(
    (_event: any, info: any) => {
      if (info.offset.x < -100 || info.velocity.x < -500) {
        onDelete(historyEntry._id)
      }
    },
    [onDelete, historyEntry._id],
  )

  const handleDragOver = (event: any) => {
    console.log(event)
  }

  if (!sapiensConfig) return null

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        x: '-100vw',
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        transition: {
          x: { type: 'spring', stiffness: 300, damping: 30 },
          height: { delay: 0.1, duration: 0.3 },
          opacity: { duration: 0.2 },
        },
      }}
      className="flex w-full flex-row items-stretch gap-2"
    >
      <div className="relative mr-2 flex flex-col items-center">
        <div className="bg-background border-border absolute top-2.5 h-3 w-3 -translate-y-1/2 rounded-full border-2" />
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
      <div className="relative flex w-full flex-col items-start">
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

        <div className="relative my-2 h-full w-full">
          {/* Delete area */}
          <motion.div
            style={{ opacity: deleteIconOpacity }}
            className="br bg-destructive/20 absolute top-0 right-0 flex h-full w-full flex-row items-center justify-end rounded-2xl px-2 font-bold"
          >
            <motion.div
              style={{ x: xAsNumber / 4, opacity: deleteIconOpacity }}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                className="text-destructive size-6"
                strokeWidth={2}
              />
            </motion.div>
          </motion.div>

          <motion.div
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }} // Snaps back to 0
            dragElastic={{ left: 0.5, right: 0 }} // Allows pulling left, blocks pulling right
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            className="flex-row-start bg-card-background relative w-full gap-0 overflow-hidden rounded-2xl md:gap-4"
          >
            <SapiensDisplayV2
              ref={avatarRef}
              avatarState={sapiensConfig}
              className="shrink-0"
            />
            <div className="flex w-full flex-col justify-between self-stretch p-3 pl-0">
              <div className="flex flex-col items-start justify-start gap-2">
                <span className="font-semibold capitalize">
                  Sapien #{historyEntry._id.slice(1, 7)}
                </span>
                <div className="flex-row-start w-fit gap-1 overflow-hidden">
                  {Object.values(sapiensConfig.colors).length > 1 &&
                    Object.values(sapiensConfig.colors).map((c, index) => (
                      <span
                        key={`${historyEntry._id}-${index}-${c}`}
                        style={{ backgroundColor: c }}
                        className="aspect-square w-5 rounded"
                      ></span>
                    ))}
                </div>
              </div>
              <div className="flex flex-col items-start justify-start">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
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
                  </DialogTrigger>
                  <DialogContent
                    showCloseButton={false}
                    className="bg-card-background w-[92%] rounded-2xl md:w-100"
                  >
                    <DialogHeader>
                      <DialogTitle>
                        <span className="text-lg font-semibold">
                          Resolution
                        </span>
                      </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                      <div className="text-muted-foreground grid h-fit w-full grid-cols-3 p-2">
                        <div className="flex-row-start col-span-2 gap-1">
                          <HugeiconsIcon
                            icon={AiImageIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          <span>Credits/Download</span>
                        </div>
                        <span className="text-reward col-span-1 text-right font-semibold">
                          FREE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {RESOLUTION_PRESETS.map((size) => (
                          <Button
                            key={size}
                            type="button"
                            size="none"
                            variant="outlineDark"
                            onClick={() => {
                              setDownloadResolution(size)
                            }}
                            className={`h-10 rounded-md border-[1.5px] text-sm font-semibold ${
                              downloadResolution === size
                                ? 'border-border'
                                : 'border-card-background opacity-50'
                            } transition-none`}
                          >
                            {size}x{size}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        size="opticalCenter"
                        className="bg-card-background-lv2 h-12 text-base font-semibold"
                        onClick={handleDownload}
                        disabled={isDownloading}
                      >
                        Download
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.li>
  )
})
