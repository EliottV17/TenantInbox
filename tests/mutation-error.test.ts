import { describe, expect, it } from "vitest";
import { mutationErrorMessage } from "../src/lib/mutation-error";

const fallback = "The operation failed.";

describe("mutationErrorMessage", () => {
  it("returns allowlisted plain backend guard messages", () => {
    expect(mutationErrorMessage(new Error("Message not found"), fallback)).toBe("Message not found");
    expect(mutationErrorMessage(new Error("Cannot approve a resolved message"), fallback)).toBe("Cannot approve a resolved message");
    expect(mutationErrorMessage(new Error("Cannot retry classification of an approved message"), fallback)).toBe("Cannot retry classification of an approved message");
  });

  it("extracts allowlisted messages after Convex wrapper metadata", () => {
    expect(mutationErrorMessage(
      new Error("[CONVEX M(messages:updateDraft)] [Request ID: example] Server Error\nUncaught Error: Draft reply cannot be empty\n at handler (convex/messages.ts:1:2)\n Called by client"),
      fallback,
    )).toBe("Draft reply cannot be empty");
    expect(mutationErrorMessage(
      new Error("[CONVEX M(messages:retryClassification)] [Request ID: example] Server Error\nUncaught Error: Cannot retry classification of an approved message\n at handler\n Called by client"),
      fallback,
    )).toBe("Cannot retry classification of an approved message");
    expect(mutationErrorMessage(
      new Error("[CONVEX M(messages:updateDraft)] [Request ID: private] Server Error\nUncaught Error: Internal credential failure\n at handler\n Called by client"),
      fallback,
    )).toBe(fallback);
  });

  it("uses fallback for unknown, sensitive, or stack/request metadata", () => {
    expect(mutationErrorMessage(new Error("Database unavailable"), fallback)).toBe(fallback);
    expect(mutationErrorMessage(new Error("Uncaught Error: Message not found\nRequest headers: Authorization: secret"), fallback)).toBe("Message not found");
    expect(mutationErrorMessage(new Error("Uncaught Error: Message not found; requestId=private"), fallback)).toBe(fallback);
    expect(mutationErrorMessage(new Error("token expired"), fallback)).toBe(fallback);
    expect(mutationErrorMessage("Message not found", fallback)).toBe(fallback);
  });
});
