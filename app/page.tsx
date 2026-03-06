'use client'

import Link from 'next/link'
import { motion, Variants } from 'motion/react'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import {
  STAGGER_CONTAINER,
  CONTAINER_VARIANTS,
  BUTTON_ARROW_ANIMATE,
  BUTTON_ARROW_TRANSITION,
} from '@/constants'

export default function Home() {
  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="main-container gap-3"
    >
      <motion.div variants={CONTAINER_VARIANTS as Variants}>
        <Button variant="ghost" size="none" asChild>
          <Link href="/register" className="">
            <h1 className="text-xl font-black">Sapiens Studio</h1>
            <motion.div
              animate={BUTTON_ARROW_ANIMATE}
              transition={BUTTON_ARROW_TRANSITION}
            >
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="size-4 mt-1"
                strokeWidth={4}
              />
            </motion.div>
          </Link>
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
