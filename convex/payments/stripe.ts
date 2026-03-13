import Stripe from 'stripe'
import { action } from '../_generated/server'
import { authComponent } from '../auth'
import { v } from 'convex/values'
import { CREDIT_OPTIONS } from '../../constants/billing'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const ERROR_401 = 'Unauthorized: You must logged in to get credits'

type BuyCreditOptionType = (typeof CREDIT_OPTIONS)[number]

export const createCheckoutSession = action({
  args: {
    creditOptionId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) throw new Error(ERROR_401)
    const userId = user.userId || user._id

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const domain = process.env.NEXT_PUBLIC_SITE_URL!

    // Look up the selected option by its ID
    const selectedOption = CREDIT_OPTIONS.find(
      (opt) => opt.id === args.creditOptionId,
    )

    if (!selectedOption) {
      throw new Error('Invalid credit option selected')
    }

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedOption.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Required parameter for one-time payments
      success_url: `${domain}/sapiens?success=true`,
      cancel_url: `${domain}/sapiens?canceled=true`,
      metadata: {
        convexUserId: userId,
        creditOptionId: args.creditOptionId,
      },
    })

    return session.url
  },
})
