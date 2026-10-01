import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/** Maximum number of classification attempts per UTC day. */
export const DAILY_LIMIT = 100;

/**
 * Transition a message to "classifying".
 *
 * State guard: only acts when status is "new" or "failed".
 * Side-effects:
 * - Sets classifyingStartedAt to Date.now().
 * - Increments the daily usage counter. If the counter >= DAILY_LIMIT,
 *   marks the message as "failed" instead with a clear reason.
 */
export const setClassifying = internalMutation({
  args: { messageId: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;
    if (message.status !== "new" && message.status !== "failed") return null;

    // --- Daily usage check ---
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" UTC
    const usageDoc = await ctx.db
      .query("usage")
      .withIndex("by_day", (q) => q.eq("day", today))
      .unique();

    if (usageDoc) {
      if (usageDoc.count >= DAILY_LIMIT) {
        // Exceeded daily limit — fail immediately, don't call OpenRouter
        await ctx.db.patch(args.messageId, {
          status: "failed",
          failReason: "Daily classification limit reached",
          classifyingStartedAt: undefined,
        });
        return null;
      }
      await ctx.db.patch(usageDoc._id, { count: usageDoc.count + 1 });
    } else {
      await ctx.db.insert("usage", { day: today, count: 1 });
    }

    await ctx.db.patch(args.messageId, {
      status: "classifying",
      classifyingStartedAt: Date.now(),
      // Clear previous failure reason when retrying
      failReason: undefined,
    });

    return null;
  },
});

/**
 * Save a successful classification result.
 *
 * State guard: only acts when status is "classifying".
 * Writes all classification fields atomically — never partial data.
 * Clears classifyingStartedAt.
 */
export const saveResult = internalMutation({
  args: {
    messageId: v.id("messages"),
    category: v.union(
      v.literal("damage"),
      v.literal("maintenance"),
      v.literal("billing"),
      v.literal("complaint"),
      v.literal("general"),
    ),
    urgency: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    summary: v.string(),
    draftReply: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;
    if (message.status !== "classifying") return null;

    await ctx.db.patch(args.messageId, {
      status: "classified",
      category: args.category,
      urgency: args.urgency,
      summary: args.summary,
      draftReply: args.draftReply,
      classifiedAt: Date.now(),
      classifyingStartedAt: undefined,
    });

    return null;
  },
});

/**
 * Mark a classification as failed.
 *
 * State guard: only acts when status is "classifying".
 * Clears classifyingStartedAt and writes a human-readable failReason.
 */
export const markFailed = internalMutation({
  args: {
    messageId: v.id("messages"),
    failReason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;
    if (message.status !== "classifying") return null;

    await ctx.db.patch(args.messageId, {
      status: "failed",
      failReason: args.failReason,
      classifyingStartedAt: undefined,
    });

    return null;
  },
});
