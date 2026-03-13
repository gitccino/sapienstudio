import { CREDIT_OPTIONS } from '../constants/billing'
import Stripe from 'stripe'

// We need to access .env directly for this standalone script to work
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from .env.local')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const createPriceId = async (credit: number, amount: number) => {
  return await stripe.prices.create({
    product_data: {
      name: `${credit} Credits`,
    },
    unit_amount: amount,
    currency: 'usd',
  })
}

const main = async () => {
  const prePriceId = []
  for (const creditOption of CREDIT_OPTIONS) {
    // Stripe expects unit_amount in cents! Multiply dollars by 100.
    const priceId = await createPriceId(
      creditOption.credit,
      creditOption.price * 100,
    )
    prePriceId.push(priceId.id)
    console.log(
      `${creditOption.credit} Credits $${creditOption.price}: ${priceId.id}`,
    )
  }
}

main().catch(console.error)

// npx tsx scripts/preGeneratedPriceId.ts
