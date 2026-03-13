import PurchaseHistoryClient from '@/app/sapiens/purchase/PurchaseHistoryClient'
import { isAuthenticated } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export default async function PurchaseHistory() {
  let authed = false
  try {
    authed = await isAuthenticated()
  } catch (error) {
    console.log(error)
  }

  if (!authed) redirect('/register')

  return <PurchaseHistoryClient />
}
