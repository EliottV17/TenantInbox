import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    // — Tenant details —
    sender: v.string(),
    subject: v.string(),
    body: v.string(),

    // — Ingestion metadata —
    channel: v.union(
      v.literal("form"),
      v.literal("webhook"),
    ),

    // — Classification pipeline status —
    status: v.union(
      v.literal("new"),
      v.literal("classifying"),
      v.literal("classified"),
      v.literal("failed"),
    ),

    // — Classification results (optional until classified) —
    category: v.optional(v.union(
      v.literal("damage"),
      v.literal("maintenance"),
      v.literal("billing"),
      v.literal("complaint"),
      v.literal("general"),
    )),
    urgency: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    )),
    summary: v.optional(v.string()),
    draftReply: v.optional(v.string()),
    failReason: v.optional(v.string()),

    // — Explicit lifecycle timestamps —
    classifyingStartedAt: v.optional(v.number()),
    classifiedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
  })
    // — Indexes —
    .index("by_category", ["category"]),

  // — Daily rate-limiting and usage control —
  usage: defineTable({
    day: v.string(), // "YYYY-MM-DD" in UTC
    count: v.number(), // Accumulated classification attempts for the day
  }).index("by_day", ["day"]),
});
