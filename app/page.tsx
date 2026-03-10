'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'motion/react'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import {
  STAGGER_CONTAINER,
  CONTAINER_VARIANTS,
  BUTTON_ARROW_ANIMATE,
  BUTTON_ARROW_TRANSITION,
} from '@/constants'

// Convex
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Loading from '@/app/Loading'

export default function Home() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const data = useQuery(api.functions.hello.getGreeting)
  if (data === undefined) {
    return <Loading />
  }

  const handleNavigate = () => {
    startTransition(() => {
      router.push('/register')
    })
  }

  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="main-container flex-col-center gap-3"
    >
      <motion.div variants={CONTAINER_VARIANTS as Variants}>
        <Button
          variant="ghost"
          size="none"
          onClick={handleNavigate}
          disabled={isPending}
        >
          <h1 className="text-xl font-black">Sapiens Studio</h1>
          {isPending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <HugeiconsIcon
                icon={Loading03Icon}
                className="mt-1 size-4"
                strokeWidth={4}
              />
            </motion.div>
          ) : (
            <motion.div
              animate={BUTTON_ARROW_ANIMATE}
              transition={BUTTON_ARROW_TRANSITION}
            >
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="mt-1 size-4"
                strokeWidth={4}
              />
            </motion.div>
          )}
        </Button>
      </motion.div>

      <motion.span
        variants={CONTAINER_VARIANTS as Variants}
        className="text-muted-foreground text-xs"
      >
        Made with love by sapiens
      </motion.span>
    </motion.main>
  )
}
