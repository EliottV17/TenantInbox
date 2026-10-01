import { describe, expect, it } from "vitest";
import { canApproveDraft, canEditDraft, canResolve } from "../src/lib/message-actions";

const classified = { status: "classified" as const, draftReply: "Reply" };

describe("message detail action rules", () => {
  it("allows edits only on classified, unapproved, unresolved messages", () => {
    expect(canEditDraft(classified)).toBe(true);
    expect(canEditDraft({ status: "classified" })).toBe(true);
    expect(canEditDraft({ ...classified, approvedAt: 1 })).toBe(false);
    expect(canEditDraft({ ...classified, resolvedAt: 1 })).toBe(false);
    expect(canEditDraft({ status: "classifying" })).toBe(false);
  });

  it("allows approval only when local text matches the saved draft and baseline", () => {
    expect(canApproveDraft(classified, "Reply", "Reply")).toBe(true);
    expect(canApproveDraft(classified, "Edited", "Reply")).toBe(false);
    expect(canApproveDraft({ ...classified, draftReply: "External edit" }, "Reply", "Reply")).toBe(false);
    expect(canApproveDraft({ ...classified, draftReply: "  " }, "  ", "  ")).toBe(false);
    expect(canApproveDraft({ ...classified, resolvedAt: 1 }, "Reply", "Reply")).toBe(false);
  });

  it("permits resolution for any unresolved message", () => {
    expect(canResolve({ status: "new" })).toBe(true);
    expect(canResolve({ ...classified, resolvedAt: 1 })).toBe(false);
  });
});
