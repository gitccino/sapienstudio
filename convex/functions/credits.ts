import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { authComponent } from '../auth'

// --- Schema ---
// userCredits: defineTable({
// userId: v.string(),
// totalCredits: v.number(),
// updatedAt: v.number(),
// }).index('userId', ['userId']),

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must logged in to get credits.')
    }
    const userId = user.userId || user._id
    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .unique()
    return wallet?.totalCredits ?? -1
  },
})

export const adjustCredits = mutation({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must logged in to add credits.')
    }
    const userId = user.userId || user._id
    const now = Date.now()
    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .unique()
    if (!wallet) {
      /**
       * The wallet does not exist yet: create it for the first time
       * - amount < 0
       *    |- error negative value
       * - amount >= 0
       *    |- insert new wallet
       *    |- return
       */
      if (args.amount < 0) {
        throw new Error('Insufficient credits to adjust')
      }

      await ctx.db.insert('userCredits', {
        userId,
        totalCredits: args.amount,
        updatedAt: now,
      })
      return {
        success: true,
        newBalance: args.amount,
      }
    } else {
      /**
       * The wallet exists: update the existing balance
       * - balance < 0
       *    |- error insufficient
       * - balance >= 0
       *    |- patch balance
       *    |- return
       */
      const newBalance = wallet.totalCredits + args.amount
      if (newBalance < 0) {
        throw new Error('Insufficient credits to adjust')
      }

      await ctx.db.patch(wallet._id, {
        userId,
        totalCredits: newBalance,
        updatedAt: now,
      })
      return {
        success: true,
        newBalance,
      }
    }
  },
})
