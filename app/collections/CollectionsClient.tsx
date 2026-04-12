'use client'

import { STAGGER_CONTAINER } from '@/constants'
import { AiImageIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import SapiensDisplay from '@/components/sapien-display'
import type { AvatarConfig } from '@/lib/sapiens-resource'
import SapienCollectionDisplay from '@/components/sapien-collection-display'
import Link from 'next/link'
import Image from 'next/image'
import { SapiensBanner } from '@/assets'
import { COLLECTIONS_CONFIG } from '@/constants/collections'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

type CollectionConfigEntry = (typeof COLLECTIONS_CONFIG)[number]

export default function CollectionsClient() {
  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      animate="visible"
      className="flex w-full flex-col gap-4"
    >
      {COLLECTIONS_CONFIG.map((entry) => (
        <CollectionComponent key={entry.id} {...entry} />
      ))}
    </motion.main>
  )
}

export function CollectionComponent({
  id: collectionId,
  name: collectionName,
  hero,
}: CollectionConfigEntry) {
  const router = useRouter()
  // Reuse the same balance query already subscribed in NavigationBar —
  // null = confirmed unauthenticated, number = signed in, undefined = loading
  const userBalance = useQuery(api.functions.credits.getBalance)
  const isSignedIn = typeof userBalance === 'number'

  const handleClick = () => {
    if (!isSignedIn) {
      router.push('/register')
      return
    }
    router.push(`/collections/${collectionId}`)
  }

  return (
    <button
      onClick={handleClick}
      className="bg-card-background relative flex h-fit w-full flex-col overflow-hidden rounded-2xl text-left"
    >
      <div
        style={{ backgroundColor: hero.themeColor }}
        className="flex-row-center text-foreground absolute top-2 right-2 gap-1 rounded-full px-4 py-2 shadow-xl"
      >
        <HugeiconsIcon icon={AiImageIcon} className="size-4" strokeWidth={2} />
        <span className="text-sm font-semibold">{hero.credit} credit</span>
      </div>
      <div className="flex flex-row justify-center">
        <Image src={hero.banner} alt={`${collectionName} Banner`} />
        <div className="mask-to-t-light absolute bottom-0 left-0 h-20 w-full backdrop-blur-md"></div>
        <div className="absolute bottom-2 left-0 flex h-fit w-full flex-col items-start px-4">
          <span className="text-card-background text-lg leading-4 font-black italic">
            {collectionName} Collection
          </span>
          <span className="text-card-background px-2 text-[.5rem]">
            {hero.description}
          </span>
        </div>
      </div>
    </button>
  )
}
