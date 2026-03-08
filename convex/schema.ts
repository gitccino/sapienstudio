import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * App schema: user credits (for future payments) and download history.
 * userId references the Better Auth user id (string).
 */
export default defineSchema({
  userCredits: defineTable({
    userId: v.string(),
    totalCredits: v.number(),
    updatedAt: v.number(),
  }).index('userId', ['userId']),
  downloadHistory: defineTable({
    userId: v.string(),
    downloadedAt: v.number(),
    resourceName: v.optional(v.string()),
  })
    .index('userId', ['userId'])
    .index('userId_downloadedAt', ['userId', 'downloadedAt']),
})
