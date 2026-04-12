'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Unauthenticated } from 'convex/react'
import { motion, type Variants } from 'motion/react'
import { CONTAINER_VARIANTS, STAGGER_CONTAINER } from '@/constants'
import UnauthenticatedContent from './UnauthenticatedContent'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

// const UnauthenticatedContent = dynamic(
//   () => import('./UnauthenticatedContent'),
//   { ssr: false },
// )

// --- LoadingSquares with hoisted transitions ---

const SQUARE_DURATION = 0.2
const SQUARE_DISTANCE = 3
const SQUARE_ANIMATE = {
  y: [SQUARE_DISTANCE, -SQUARE_DISTANCE, SQUARE_DISTANCE],
}
const SQUARE_TRANSITION_0 = {
  duration: SQUARE_DURATION,
  repeat: Infinity,
  repeatDelay: SQUARE_DURATION * 3,
}
const SQUARE_TRANSITION_1 = {
  ...SQUARE_TRANSITION_0,
  delay: SQUARE_DURATION,
}
const SQUARE_TRANSITION_2 = {
  ...SQUARE_TRANSITION_0,
  delay: SQUARE_DURATION * 2,
}

export const LoadingSquares = memo(function LoadingSquares({
  className,
}: {
  className?: string
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <motion.span
        animate={SQUARE_ANIMATE}
        transition={SQUARE_TRANSITION_0}
        className={cn(
          'bg-foreground/95 aspect-square w-2 rounded-xs',
          className,
        )}
      />
      <motion.span
        animate={SQUARE_ANIMATE}
        transition={SQUARE_TRANSITION_1}
        className={cn(
          'bg-foreground/95 aspect-square w-2 rounded-xs',
          className,
        )}
      />
      <motion.span
        animate={SQUARE_ANIMATE}
        transition={SQUARE_TRANSITION_2}
        className={cn(
          'bg-foreground/95 aspect-square w-2 rounded-xs',
          className,
        )}
      />
    </div>
  )
})

export default function RegisterClient() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()

  if (isPending)
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <LoadingSquares />
      </div>
    )

  if (data) {
    redirect('/collections')
  }

  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="main-container relative flex flex-col justify-between gap-10 px-[5%] py-8 md:px-0"
    >
      <motion.div>
        <Button
          type="button"
          variant="ghost"
          size="none"
          className="bg-card-background mr-auto h-12 cursor-pointer gap-1 rounded-xl pr-4 pl-3 text-base"
          onClick={() => router.back()}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className={`size-5`}
            strokeWidth={2}
          />
          <span>{isPending ? 'Loading...' : 'Back'}</span>
        </Button>
      </motion.div>

      <motion.div
        variants={CONTAINER_VARIANTS as Variants}
        className="flex flex-1"
      >
        <Unauthenticated>
          <UnauthenticatedContent />
        </Unauthenticated>
      </motion.div>
    </motion.main>
  )
}
