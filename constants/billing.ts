// Determine environment natively based on your public site URL
// This securely switches between Dev and Prod Stripe IDs automatically
const isProd = process.env.NEXT_PUBLIC_SITE_URL === 'https://sapienstudio.art'

export const CREDIT_OPTIONS = [
  {
    credit: 5,
    price: 1,
    // Provide the LIVE "price_..." ID when you generate it for production
    // NOTE: Do not use the Product ID (prod_...). Stripe Checkout strictly requires Price IDs!
    priceId: isProd
      ? 'price_1T9VHmBP1kK4GGixHUPXjsNy'
      : 'price_1T9TJKBP1kK4GGixwiTQh1Ja',
    lineItem: {
      price_data: {
        currency: 'usd',
        product_data: {
          name: '5 Credits',
          description: 'Credits to export premium high-res avatars.',
        },
        unit_amount: 100, // cents
      },
      quantity: 1,
    },
  },
  {
    credit: 20,
    price: 3,
    priceId: isProd
      ? 'price_1T9UYqBP1kK4GGixu38kLIGI'
      : 'price_1T9TJKBP1kK4GGix0F2bCNud',
    lineItem: {
      price_data: {
        currency: 'usd',
        product_data: {
          name: '20 Credits',
          description: 'Credits to export premium high-res avatars.',
        },
        unit_amount: 300, // cents
      },
      quantity: 1,
    },
  },
  {
    credit: 40,
    price: 5,
    priceId: isProd
      ? 'price_1T9UZSBP1kK4GGixmVbYPiF3'
      : 'price_1T9TJLBP1kK4GGixUL1mEGVR',
    lineItem: {
      price_data: {
        currency: 'usd',
        product_data: {
          name: '40 Credits',
          description: 'Credits to export premium high-res avatars.',
        },
        unit_amount: 500, // cents
      },
      quantity: 1,
    },
  },
].map((option, id) => ({ id, ...option }))
