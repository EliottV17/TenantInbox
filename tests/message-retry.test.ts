import { describe, expect, it } from "vitest";
import { canRetryClassification, shouldShowRetryClassification } from "../src/lib/message-retry";
import { STUCK_CLASSIFYING_THRESHOLD_MS } from "../src/lib/constants";

const now = 1_000_000;

describe("message retry UI rules", () => {
  it("shows and enables retry for failed messages even before the clock starts", () => {
    const failed = { status: "failed" as const };
    expect(shouldShowRetryClassification(failed, null)).toBe(true);
    expect(canRetryClassification(failed, null)).toBe(true);
  });

  it("shows retry only strictly after the stuck threshold", () => {
    const atBoundary = { status: "classifying" as const, classifyingStartedAt: now - STUCK_CLASSIFYING_THRESHOLD_MS };
    const pastBoundary = { ...atBoundary, classifyingStartedAt: now - STUCK_CLASSIFYING_THRESHOLD_MS - 1 };
    expect(shouldShowRetryClassification(atBoundary, now)).toBe(false);
    expect(shouldShowRetryClassification(pastBoundary, now)).toBe(true);
  });

  it("does not classify a classifying message as stuck before the clock is available", () => {
    expect(shouldShowRetryClassification({ status: "classifying" }, null)).toBe(false);
  });

  it("uses the zero timestamp fallback for missing classification start", () => {
    expect(shouldShowRetryClassification({ status: "classifying" }, now)).toBe(true);
  });

  it.each([
    { status: "new" as const },
    { status: "classified" as const },
  ])("does not show retry for non-retryable status $status", (message) => {
    expect(shouldShowRetryClassification(message, now)).toBe(false);
    expect(canRetryClassification(message, now)).toBe(false);
  });

  it.each([
    { approvedAt: 12 },
    { resolvedAt: 13 },
  ])("keeps retry visible but disables the approved/resolved guard", (guard) => {
    const message = { status: "failed" as const, ...guard };
    expect(shouldShowRetryClassification(message, now)).toBe(true);
    expect(canRetryClassification(message, now)).toBe(false);
  });
});
