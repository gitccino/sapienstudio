import { httpRouter } from 'convex/server'
import { authComponent, createAuth } from './auth'
import Stripe from 'stripe'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import { CREDIT_OPTIONS } from '../constants/billing'

const http = httpRouter()

http.route({
  path: '/stripe',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Grab the Stripe signature from the headers
    const signature = request.headers.get('stripe-signature') as string
    // Stripe requires the raw, unparsed text body to verify the cryptographic signature
    const payload = await request.text()

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      )
    } catch (error) {
      if (error instanceof Error)
        console.error(
          `⚠️ Webhook signature verification failed.`,
          error.message,
        )
      return new Response('Webhook signature verification failed', {
        status: 400,
      })
    }

    // Handle the successful checkout event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract the exact user ID we passed into the metadata
      const userId = session.metadata?.convexUserId
      const creditOptionId = session.metadata
        ?.creditOptionId as keyof typeof CREDIT_OPTIONS
      const creditOption = CREDIT_OPTIONS.find(
        (opt) => opt.id === Number(creditOptionId),
      )

      if (userId && creditOption) {
        // Securely trigger the internal mutation to grant the credits
        await ctx.runMutation(internal.functions.credits.fulfillPurchase, {
          userId,
          amount: creditOption.credit,
          amountPaid: creditOption.price,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string | undefined,
        })
        console.log(
          `✅ Successfully added ${creditOption.credit} credits for user ${userId}`,
        )
      }
    }

    // Always return a 200 OK so Stripe knows we received it
    // Otherwise, Stripe will keep retrying the webhook for days
    return new Response(null, { status: 200 })
  }),
})

authComponent.registerRoutes(http, createAuth)

export default http
