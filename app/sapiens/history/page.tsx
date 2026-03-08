import { redirect } from 'next/navigation'
import { isAuthenticated, preloadAuthQuery } from '@/lib/auth-server'
import { api } from '@/convex/_generated/api'
import HistoryClient from './HistoryClient'

export default async function SapiensHistory() {
  let preloadedHistory
  try {
    const authed = await isAuthenticated()
    if (!authed) redirect('/register')

    preloadedHistory = await preloadAuthQuery(
      api.functions.downloads.getDownloadHistory,
    )
  } catch {
    // Fall through to client-side auth check in HistoryClient
  }

  return preloadedHistory ? (
    <HistoryClient preloadedHistory={preloadedHistory} />
  ) : null
}
