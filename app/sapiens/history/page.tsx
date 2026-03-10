import { redirect } from 'next/navigation'
import { isAuthenticated, preloadAuthQuery } from '@/lib/auth-server'
import { api } from '@/convex/_generated/api'
import HistoryClient from './HistoryClient'

export default async function SapiensHistory() {
  let authed = false
  try {
    authed = await isAuthenticated()
  } catch (error) {
    console.error(error)
  }

  if (!authed) redirect('/register')

  let preloadedHistory
  try {
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
