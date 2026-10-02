import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { SEED_MESSAGES } from "./lib/seed_data";

export const seedMessages = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const message of SEED_MESSAGES) {
      const existing = await ctx.db
        .query("messages")
        .filter((q) =>
          q.and(
            q.eq(q.field("sender"), message.sender),
            q.eq(q.field("subject"), message.subject),
          ),
        )
        .take(1);

      if (existing.length > 0) {
        skipped += 1;
      } else {
        await ctx.db.insert("messages", message);
        inserted += 1;
      }
    }

    return { inserted, skipped };
  },
});
