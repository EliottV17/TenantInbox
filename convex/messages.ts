import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const MAX_SENDER_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_BODY_LENGTH = 5000;

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
