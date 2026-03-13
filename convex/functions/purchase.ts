import { paginationOptsValidator } from 'convex/server'
import { query } from '../_generated/server'
import { authComponent } from '../auth'

export const getPaginatedPurchaseHistory = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must logged in to view history.')
    }
    const userId = user.userId || user._id

    return ctx.db
      .query('purchaseHistory')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})
