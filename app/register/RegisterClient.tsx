'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Unauthenticated } from 'convex/react'
import { motion, type Variants } from 'motion/react'
import { CONTAINER_VARIANTS, STAGGER_CONTAINER } from '@/constants'

const UnauthenticatedContent = dynamic(
  () => import('./UnauthenticatedContent'),
  { ssr: false },
)

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
    <div className="flex justify-center items-center gap-1">
      <motion.span
        animate={SQUARE_ANIMATE}
        transition={SQUARE_TRANSITION_0}
        className={cn(
          'w-2 aspect-square bg-foreground/95 rounded-xs',
          className,
        )}
      />
      <motion.span
        animate={SQUARE_ANIMATE}
        transition={SQUARE_TRANSITION_1}
        className={cn(
          'w-2 aspect-square bg-foreground/95 rounded-xs',
          className,
        )}
      />
      <motion.span
        animate={SQUARE_ANIMATE}
        transition={SQUARE_TRANSITION_2}
        className={cn(
          'w-2 aspect-square bg-foreground/95 rounded-xs',
          className,
        )}
      />
    </div>
  )
})

export default function RegisterClient() {
  const { data, isPending } = authClient.useSession()

  if (isPending)
    return (
      <div className="w-full min-h-dvh flex items-center justify-center">
        <LoadingSquares />
      </div>
    )

  if (data) {
    redirect('/sapiens')
  }

  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="main-container pt-4 md:py-0 px-[5%] md:px-0"
    >
      <motion.div variants={CONTAINER_VARIANTS as Variants}>
        <Link href="/">
          <h1 className="font-black text-foreground text-7xl md:text-8xl">
            SAPIENS
          </h1>
        </Link>
      </motion.div>

      <motion.div
        variants={CONTAINER_VARIANTS as Variants}
        className="relative overflow-hidden w-full aspect-square"
      >
        <Image src="/artwork.svg" alt="Artwork" width={1000} height={1000} />
      </motion.div>

      <motion.div variants={CONTAINER_VARIANTS as Variants} className="w-full">
        <Unauthenticated>
          <UnauthenticatedContent />
        </Unauthenticated>
      </motion.div>
    </motion.main>
  )
}
