import { query } from '../_generated/server'

export const getGreeting = query({
  args: {},
  handler: async () => {
    return {
      status: 'success',
      message: 'Hello from your Convex backend!',
      timestamp: Date.now(),
    }
  },
})
