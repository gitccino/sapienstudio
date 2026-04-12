'use client'

import { useParams, notFound, useRouter } from 'next/navigation'
import CollectionClient from '@/app/collections/[slug]/CollectionClient'
import { COLLECTION_CONFIG_OBJ } from '@/constants/collections'
import { CollectionId } from '@/types'
import { authClient } from '@/lib/auth-client'
import { useEffect } from 'react'

export default function ReusableAvatarEngine() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  // Guard: redirect to /collections if not signed in
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/collections')
    }
  }, [isPending, session, router])

  const initConfig = COLLECTION_CONFIG_OBJ[slug as CollectionId]

  if (!initConfig) notFound()

  // Don't render until auth is confirmed to avoid a flash of the protected page
  if (isPending || !session) return null

  return <CollectionClient config={initConfig as any} />
}
