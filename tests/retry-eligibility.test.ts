import { describe, expect, it } from "vitest";
import {
  checkRetryEligibility,
  STUCK_CLASSIFYING_THRESHOLD_MS,
} from "../convex/messages";

describe("checkRetryEligibility", () => {
  const baseMessage = {
    status: "failed" as const,
    classifyingStartedAt: undefined,
    approvedAt: undefined,
    resolvedAt: undefined,
  };

  it("allows retry for failed messages", () => {
    const result = checkRetryEligibility(baseMessage);
    expect(result.eligible).toBe(true);
  });

  it("rejects retry if message is resolved", () => {
    const result = checkRetryEligibility({
      ...baseMessage,
      resolvedAt: Date.now(),
    });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain("resolved");
    }
  });

  it("rejects retry if message is already approved", () => {
    const result = checkRetryEligibility({
      ...baseMessage,
      approvedAt: Date.now(),
    });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain("approved");
    }
  });

  it("rejects retry if message is new (already pending)", () => {
    const result = checkRetryEligibility({
      ...baseMessage,
      status: "new",
    });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain("pending");
    }
  });

  it("rejects retry if message is already successfully classified", () => {
    const result = checkRetryEligibility({
      ...baseMessage,
      status: "classified",
    });
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain("classified");
    }
  });

  it("rejects retry if classifying was started recently (< 2 minutes)", () => {
    const now = 1_000_000;
    const result = checkRetryEligibility(
      {
        ...baseMessage,
        status: "classifying",
        classifyingStartedAt: now - 30_000, // 30 seconds ago
      },
      now,
    );
    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toContain("in progress");
    }
  });

  it("allows retry if classifying is stuck (> 2 minutes)", () => {
    const now = 1_000_000;
    const result = checkRetryEligibility(
      {
        ...baseMessage,
        status: "classifying",
        classifyingStartedAt: now - (STUCK_CLASSIFYING_THRESHOLD_MS + 1_000), // > 2 minutes
      },
      now,
    );
    expect(result.eligible).toBe(true);
  });

  it("allows retry if classifying is stuck without classifyingStartedAt timestamp", () => {
    const now = 1_000_000;
    const result = checkRetryEligibility(
      {
        ...baseMessage,
        status: "classifying",
        classifyingStartedAt: undefined, // defaults to 0, which is > 2 min ago relative to 1M
      },
      now,
    );
    expect(result.eligible).toBe(true);
  });
});
