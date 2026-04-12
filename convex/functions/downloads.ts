import { authComponent } from '../auth'
import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { TableAggregate } from '@convex-dev/aggregate'
import { components } from '../_generated/api'
import { DataModel } from '../_generated/dataModel'

/**
 * Aggregate that counts download history rows, namespaced per user.
 * - Namespace: userId  → each user gets its own isolated counter
 * - Key: null          → we only need count, no ordering within the namespace
 *
 * Use `insertIfDoesNotExist` / `deleteIfExists` so backfilling existing rows
 * is safe to re-run without double-counting.
 */
const downloadCountAggregate = new TableAggregate<{
  Namespace: string
  Key: null
  DataModel: DataModel
  TableName: 'downloadHistory'
}>(components.downloadHistoryCount, {
  namespace: (doc) => doc.userId,
  sortKey: (_doc) => null,
})

/**
 * Creates a new download history entry for the current user.
 * Call this when a user completes a download (e.g. export).
 * Requires the user to be signed in.
 */
export const recordDownloadHistory = mutation({
  args: {
    resourceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must be logged in to record download.')
    }
    const now = Date.now()
    const userId =
      (user as { id?: string }).id ?? String((user as { _id?: string })._id)
    const id = await ctx.db.insert('downloadHistory', {
      userId,
      downloadedAt: now,
      resourceName: args.resourceName,
    })
    const doc = await ctx.db.get(id)
    await downloadCountAggregate.insertIfDoesNotExist(ctx, doc!)
  },
})

export const purchaseAndRecordDownload = mutation({
  args: {
    resourceName: v.string(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify that user is authenticated
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must be logged in to download.')
    }
    const userId = user.userId || user._id // userId must be included

    // Fetch user wallet using the hight-performance index
    const wallet = await ctx.db
      .query('userCredits')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .unique()

    if (!wallet) {
      throw new Error('Wallet not found. Please contact support.')
    }

    // Prevent over-drafting
    if (wallet.totalCredits < args.cost) {
      throw new Error('Insufficient credits to download this asset.')
    }

    const now = Date.now()

    // Transaction Part A: Deduct the credits
    await ctx.db.patch(wallet._id, {
      totalCredits: wallet.totalCredits - args.cost,
      updatedAt: now,
    })

    // Transaction Part B: Log the download history
    const id = await ctx.db.insert('downloadHistory', {
      userId,
      downloadedAt: now,
      resourceName: args.resourceName,
    })
    const doc = await ctx.db.get(id)
    await downloadCountAggregate.insertIfDoesNotExist(ctx, doc!)

    // Return the new balance to the frontend so the UI updates instantly
    return {
      sucess: true,
      remainingCredit: wallet.totalCredits - args.cost,
    }
  },
})

/**
 * Returns all download history entries for the current user,
 * sorted by most recent first.
 */
export const getDownloadHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must be logged in to view history.')
    }
    const userId = user.userId || user._id

    return await ctx.db
      .query('downloadHistory')
      .withIndex('userId_downloadedAt', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
  },
})

/**
 * Pagination
 */
export const getPaginatedDownloadHistory = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized: You must logged in to view history.')
    }
    const userId = user.userId || user._id

    return await ctx.db
      .query('downloadHistory')
      .withIndex('userId_downloadedAt', (q) => q.eq('userId', userId))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

/**
 * O(log n) count via the aggregate component — no document bodies transferred.
 * Reactive: UI updates automatically when history grows.
 */
export const getDownloadHistoryCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) return 0
    const userId = user.userId || user._id

    return await downloadCountAggregate.count(ctx, {
      namespace: userId,
    })
  },
})

/**
 * One-time backfill mutation: seeds the aggregate from existing rows.
 * Run this once from the Convex dashboard after deploying.
 * Safe to re-run — uses insertIfDoesNotExist.
 */
export const backfillDownloadHistoryCount = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('downloadHistory').collect()
    for (const doc of all) {
      await downloadCountAggregate.insertIfDoesNotExist(ctx, doc)
    }
    return { seeded: all.length }
  },
})
/**
 * Deletes a download history entry for the current user.
 * Decrements the aggregate count to keep it in sync.
 */
export const deleteDownloadHistory = mutation({
  args: {
    id: v.id('downloadHistory'),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new Error('Unauthorized')
    }

    const existing = await ctx.db.get(args.id)
    if (!existing) return

    const userId = user.userId || user._id
    if (existing.userId !== userId) {
      throw new Error('Forbidden')
    }

    // Decrement the aggregate count
    await downloadCountAggregate.deleteIfExists(ctx, existing)

    // Delete the record
    await ctx.db.delete(args.id)

    return { success: true }
  },
})
