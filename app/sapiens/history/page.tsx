import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-server'
import HistoryClient from './HistoryClient'

export default async function SapiensHistory() {
  let authed = false
  try {
    authed = await isAuthenticated()
  } catch (error) {
    console.error(error)
  }

  if (!authed) redirect('/register')

  return <HistoryClient />
}
