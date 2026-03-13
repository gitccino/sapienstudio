import { v } from 'convex/values'
import { internalMutation, mutation, query } from '../_generated/server'
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

export const fulfillPurchase = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    amountPaid: v.number(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // 1. Find the user's wallet
    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .unique()

    if (wallet) {
      // 2a. Wallet exists: Update balance
      await ctx.db.patch(wallet._id, {
        totalCredits: wallet.totalCredits + args.amount,
        updatedAt: now,
      })
    } else {
      // 2b. First-time buyer: Create wallet
      await ctx.db.insert('userCredits', {
        userId: args.userId,
        totalCredits: args.amount,
        updatedAt: now,
      })
    }

    await ctx.db.insert('purchaseHistory', {
      userId: args.userId,
      creditsAdded: args.amount,
      amountPaid: args.amountPaid,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      purchasedAt: now,
    })
  },
})

// export const fulfillAndRecordPurchase = internalMutation({
//   args: {
//     userId: v.string(),
//     amount:
//   },
//   handler: async (ctx, args) => {

//   }
// })

// Hardcoded for now, but abstracting as a constant to easily change or
// hook up to a database settings table in the future.
const DAILY_REWARD_AMOUNT = 1

export const claimDailyReward = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must logged in to claim daily reward.')
    }
    const userId = user.userId || user._id

    // Using server time securely prevents client-side timezone manipulation
    const now = Date.now()

    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .unique()

    if (!wallet) {
      await ctx.db.insert('userCredits', {
        userId,
        totalCredits: DAILY_REWARD_AMOUNT,
        lastDailyClaimAt: now,
        updatedAt: now,
      })
      return {
        success: true,
        newBalance: DAILY_REWARD_AMOUNT,
        message: 'Daily reward claimed successfully',
      }
    }

    if (wallet.lastDailyClaimAt !== undefined) {
      // Check if last claim was today in UTC
      const lastClaimDate = new Date(wallet.lastDailyClaimAt)
      const nowDate = new Date(now)

      const isSameDayUTC =
        lastClaimDate.getUTCFullYear() === nowDate.getUTCFullYear() &&
        lastClaimDate.getUTCMonth() === nowDate.getUTCMonth() &&
        lastClaimDate.getUTCDate() === nowDate.getUTCDate()

      if (isSameDayUTC) {
        return {
          success: false,
          newBalance: wallet.totalCredits,
          message: 'Already claimed today',
        }
      }
    }

    const newBalance = wallet.totalCredits + DAILY_REWARD_AMOUNT
    await ctx.db.patch(wallet._id, {
      totalCredits: newBalance,
      lastDailyClaimAt: now,
      updatedAt: now,
    })

    return {
      success: true,
      newBalance,
      message: 'Daily reward claimed successfully',
    }
  },
})

function verifySameDayUTC(lastClaimDate: Date) {
  const nowDate = new Date(Date.now())
  return (
    lastClaimDate.getUTCFullYear() === nowDate.getUTCFullYear() &&
    lastClaimDate.getUTCMonth() === nowDate.getUTCMonth() &&
    lastClaimDate.getUTCDate() === nowDate.getUTCDate()
  )
}

export const getDailyClaimStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error(
        'Unauthorized: You must logged in to get daily claim status',
      )
    }

    const userId = user.userId || user._id
    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .unique()

    if (!wallet || wallet.lastDailyClaimAt === undefined) {
      return { canClaim: true }
    }

    const lastClaimDate = new Date(wallet.lastDailyClaimAt)
    const isSameDayUTC = verifySameDayUTC(lastClaimDate)
    return { canClaim: !isSameDayUTC }
  },
})

/**
 * Testing purpose
 * > Clear lastClaimDate
 */
export const refreshLastClaimDate = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error(
        'Unauthorized: You must logged in to refresh daily credit quota.',
      )
    }

    const userId = user.userId || user._id
    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .unique()
    if (!wallet || wallet.lastDailyClaimAt === undefined) {
      // Do nothing
      return { refreshStatus: 'true' }
    }

    // In Convex, patching an optional property with undefined drops it from the document
    await ctx.db.patch(wallet._id, {
      lastDailyClaimAt: undefined,
    })

    return { refreshStatus: 'true' }
  },
})
