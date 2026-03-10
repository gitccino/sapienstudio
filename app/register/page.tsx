import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-server'
import RegisterClient from './RegisterClient'

export default async function RegisterPage() {
  let authed = false
  try {
    console.log('isAuthenticated:')
    authed = await isAuthenticated()
    console.log('├─ Status: DONE')
  } catch (error) {
    console.error(error)
    console.log('├─ Status: ERROR')
  }

  if (authed) redirect('/sapiens')

  return <RegisterClient />
}
