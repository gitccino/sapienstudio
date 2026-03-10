import { redirect } from 'next/navigation'
import { isAuthenticated, preloadAuthQuery } from '@/lib/auth-server'
import SapiensClient from './SapiensClient'
import { api } from '@/convex/_generated/api'
import { HugeiconsIcon } from '@hugeicons/react'
import { HotspotOfflineIcon } from '@hugeicons/core-free-icons'

export default async function SapiensPage() {
  let authed = false
  try {
    console.log('isAuthenticated:')
    authed = await isAuthenticated()
    console.log('├─ Status: DONE')
  } catch (error) {
    console.error(error)
    console.log('├─ Status: ERROR')
  }

  if (!authed) redirect('/register')

  let preloadedBalance
  let preloadedCurrentUser
  try {
    console.log('preloadedBalance:')
    ;[preloadedBalance, preloadedCurrentUser] = await Promise.all([
      preloadAuthQuery(api.functions.credits.getBalance),
      preloadAuthQuery(api.auth.getCurrentUser),
    ])
    console.log('├─ Status: DONE')
  } catch (error) {
    // Fall through to client-side auth check in SapiensClient
    console.error(error)
    console.log('├─ Status: ERROR')
  }

  return preloadedBalance && preloadedCurrentUser ? (
    <SapiensClient
      preloadedBalance={preloadedBalance}
      preloadedCurrentUser={preloadedCurrentUser}
    />
  ) : (
    <main className="main-container flex-row-center gap-2">
      <HugeiconsIcon
        icon={HotspotOfflineIcon}
        strokeWidth={2}
        className="size-6"
      />
      <span className="font-medium">Something went wrong</span>
    </main>
  )
}
