import { paginationOptsValidator } from 'convex/server'
import { mutation, query } from '../_generated/server'
import { authComponent } from '../auth'
import { TableAggregate } from '@convex-dev/aggregate'
import { components } from '../_generated/api'
import { DataModel } from '../_generated/dataModel'

/**
 * Aggregate counting purchase history rows, namespaced per user.
 * Namespace: userId  → isolated counter per user, high write throughput
 * Key: null          → total count only, no ordering needed
 */
export const purchaseCountAggregate = new TableAggregate<{
  Namespace: string
  Key: null
  DataModel: DataModel
  TableName: 'purchaseHistory'
}>(components.purchaseHistoryCount, {
  namespace: (doc) => doc.userId,
  sortKey: (_doc) => null,
})

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

/**
 * O(log n) count via the aggregate component — no document bodies transferred.
 * Reactive: UI updates automatically when purchase history grows.
 */
export const getPurchaseHistoryCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) return 0
    const userId = user.userId || user._id

    return await purchaseCountAggregate.count(ctx, { namespace: userId })
  },
})

/**
 * One-time backfill: seeds the aggregate from existing purchaseHistory rows.
 * Run once from the Convex dashboard. Safe to re-run (insertIfDoesNotExist).
 */
export const backfillPurchaseHistoryCount = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('purchaseHistory').collect()
    for (const doc of all) {
      await purchaseCountAggregate.insertIfDoesNotExist(ctx, doc)
    }
    return { seeded: all.length }
  },
})
