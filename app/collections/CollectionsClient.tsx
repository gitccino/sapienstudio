'use client'

import { STAGGER_CONTAINER } from '@/constants'
import { AiImageIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'motion/react'
import SapiensDisplay from '@/components/sapien-display'
import type { AvatarConfig } from '@/lib/sapiens-resource'
import SapienCollectionDisplay from '@/components/sapien-collection-display'

const COLLECTIONS_CONFIG = [
  {
    collectionName: 'Sapiens',
    collectionDesc:
      'Getting started and express your identity with a minimal character',
    credit: 1,
    themeColor: '#465a54',
  },
  {
    collectionName: 'Vegetr',
    collectionDesc:
      'Vegetr, a collection of nonsense vegetables. Create them and let your craziness shine',
    credit: 2,
    themeColor: '#ff6a5f',
  },
]
type CollectionConfigEntry = (typeof COLLECTIONS_CONFIG)[number]

export default function CollectionsClient() {
  return (
    <motion.main
      variants={STAGGER_CONTAINER}
      animate="visible"
      className="main-container flex-col-start gap-4 px-[5%] py-8 md:px-0"
    >
      {COLLECTIONS_CONFIG.map((entry) => (
        <CollectionComponent key={entry.collectionName} {...entry} />
      ))}
    </motion.main>
  )
}

export function CollectionComponent({
  collectionName,
  collectionDesc,
  credit,
  themeColor,
}: CollectionConfigEntry) {
  return (
    <motion.div className="bg-card-background relative flex h-55 w-full flex-col overflow-hidden rounded-2xl">
      <div className="bg-reward flex-row-center text-background absolute top-2 right-4 gap-1 rounded-full px-2 py-1">
        <HugeiconsIcon icon={AiImageIcon} className="size-3" strokeWidth={2} />
        <span className="text-[0.65rem] font-semibold">{credit} credit</span>
      </div>
      <div className="flex flex-1 flex-row">
        {/* <SapiensDisplay
          sapiensConfig={{
            cloth: 'cloth1',
            head: 'head1',
            item: 'item1',
            colors: {
              background: '#f3c9b1',
              body: '#f3c9b1',
              cloth: '#465a54',
              head: '#5F4D42',
            },
          }}
          className="h-full"
        /> */}
        <SapienCollectionDisplay className="h-full" />
        <div className="flex h-full flex-1 items-end py-6 pr-2 pl-0">
          <span className="indent-4 text-[0.65rem] text-pretty">
            {collectionDesc}
          </span>
        </div>
      </div>
      <div className="flex-row-start gap-2 bg-[#252523] p-3">
        <div
          style={{ backgroundColor: themeColor }}
          className="flex-col-center aspect-square h-8 rounded-lg"
        >
          <HugeiconsIcon
            icon={SparklesIcon}
            className="size-4"
            strokeWidth={2}
          />
        </div>
        <span className="text-sm font-semibold">{collectionName}</span>
      </div>
    </motion.div>
  )
}
