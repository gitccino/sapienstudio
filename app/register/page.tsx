import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-server'
import RegisterClient from './RegisterClient'

export default async function RegisterPage() {
  try {
    const authed = await isAuthenticated()
    if (authed) redirect('/sapiens')
  } catch {
    // Fall through to client-side auth check in RegisterClient
  }

  return <RegisterClient />
}
