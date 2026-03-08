import { redirect } from 'next/navigation'
import { isAuthenticated, preloadAuthQuery } from '@/lib/auth-server'
import SapiensClient from './SapiensClient'
import { api } from '@/convex/_generated/api'

export default async function SapiensPage() {
  let preloadedBalance
  try {
    const authed = await isAuthenticated()
    if (!authed) redirect('/register')

    preloadedBalance = await preloadAuthQuery(api.functions.credits.getBalance)
  } catch {
    // Fall through to client-side auth check in SapiensClient
  }

  return preloadedBalance ? (
    <SapiensClient preloadedBalance={preloadedBalance} />
  ) : null
}
