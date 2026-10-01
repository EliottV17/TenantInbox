import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const MAX_SENDER_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_BODY_LENGTH = 5000;

const categoryValidator = v.union(
  v.literal("damage"),
  v.literal("maintenance"),
  v.literal("billing"),
  v.literal("complaint"),
  v.literal("general"),
);

const urgencyValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const create = mutation({
  args: {
    sender: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    if (args.sender.trim().length === 0 || args.sender.length > MAX_SENDER_LENGTH) {
      throw new Error(`Sender must be between 1 and ${MAX_SENDER_LENGTH} characters`);
    }
    if (args.subject.trim().length === 0 || args.subject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(`Subject must be between 1 and ${MAX_SUBJECT_LENGTH} characters`);
    }
    if (args.body.trim().length === 0 || args.body.length > MAX_BODY_LENGTH) {
      throw new Error(`Body must be between 1 and ${MAX_BODY_LENGTH} characters`);
    }

    const messageId = await ctx.db.insert("messages", {
      sender: args.sender.trim(),
      subject: args.subject.trim(),
      body: args.body.trim(),
      channel: "form",
      status: "new",
    });

    return messageId;
  },
});

export const list = query({
  args: {
    category: v.optional(categoryValidator),
    urgency: v.optional(urgencyValidator),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const q = ctx.db
        .query("messages")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc");

      if (args.urgency) {
        return await q
          .filter((q) => q.eq(q.field("urgency"), args.urgency))
          .take(50);
      }

      return await q.take(50);
    }

    const q = ctx.db.query("messages").order("desc");

    if (args.urgency) {
      return await q
        .filter((q) => q.eq(q.field("urgency"), args.urgency))
        .take(50);
    }

    return await q.take(50);
  },
});

export const get = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateDraft = mutation({
  args: {
    id: v.id("messages"),
    draftReply: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.status !== "classified") {
      throw new Error("Cannot edit draft of an unclassified message");
    }
    if (message.resolvedAt !== undefined) {
      throw new Error("Cannot edit draft of a resolved message");
    }
    if (message.approvedAt !== undefined) {
      throw new Error("Cannot edit draft of an already approved message");
    }
    if (args.draftReply.trim().length === 0) {
      throw new Error("Draft reply cannot be empty");
    }

    await ctx.db.patch(args.id, {
      draftReply: args.draftReply.trim(),
    });
  },
});

export const approve = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.status !== "classified" || !message.draftReply?.trim()) {
      throw new Error("Only classified messages with a draft reply can be approved");
    }
    if (message.resolvedAt !== undefined) {
      throw new Error("Cannot approve a resolved message");
    }
    if (message.approvedAt !== undefined) {
      throw new Error("Message is already approved");
    }

    await ctx.db.patch(args.id, {
      approvedAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }
    // Idempotent: do not overwrite an existing resolution timestamp
    if (message.resolvedAt !== undefined) {
      return;
    }

    await ctx.db.patch(args.id, {
      resolvedAt: Date.now(),
    });
  },
});
