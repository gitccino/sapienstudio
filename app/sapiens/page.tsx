import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-server'
import SapiensClient from './SapiensClient'

export default async function SapiensPage() {
  try {
    const authed = await isAuthenticated()
    if (!authed) redirect('/register')
  } catch {
    // Fall through to client-side auth check in SapiensClient
  }

  return <SapiensClient />
}
