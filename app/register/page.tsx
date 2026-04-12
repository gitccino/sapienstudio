import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-server'
import RegisterClient from './RegisterClient'

export default async function RegisterPage() {
  let authed = false
  try {
    authed = await isAuthenticated()
  } catch (error) {
    console.error(error)
  }

  if (authed) redirect('/collections')

  return <RegisterClient />
}
