import { describe, expect, it } from "vitest";
import { isMessageStuck } from "../src/lib/message-state";
import { STUCK_CLASSIFYING_THRESHOLD_MS } from "../src/lib/constants";

// ---------------------------------------------------------------------------
// STUCK_CLASSIFYING_THRESHOLD_MS contract
// ---------------------------------------------------------------------------

describe("STUCK_CLASSIFYING_THRESHOLD_MS", () => {
  it("equals exactly 120 000 ms (2 minutes per docs/PLAN.md)", () => {
    expect(STUCK_CLASSIFYING_THRESHOLD_MS).toBe(120_000);
  });
});

// ---------------------------------------------------------------------------
// isMessageStuck — pure helper
// ---------------------------------------------------------------------------

describe("isMessageStuck", () => {
  const BASE_NOW = 1_000_000; // arbitrary epoch ms reference point

  // -----------------------------------------------------------------------
  // Non-classifying statuses are never stuck
  // -----------------------------------------------------------------------

  it("returns false for status 'new'", () => {
    expect(
      isMessageStuck({ status: "new" }, BASE_NOW),
    ).toBe(false);
  });

  it("returns false for status 'classified'", () => {
    expect(
      isMessageStuck({ status: "classified" }, BASE_NOW),
    ).toBe(false);
  });

  it("returns false for status 'failed'", () => {
    expect(
      isMessageStuck({ status: "failed" }, BASE_NOW),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Classifying: elapsed < threshold → not stuck
  // -----------------------------------------------------------------------

  it("returns false when classifying started 1 ms ago", () => {
    expect(
      isMessageStuck(
        { status: "classifying", classifyingStartedAt: BASE_NOW - 1 },
        BASE_NOW,
      ),
    ).toBe(false);
  });

  it("returns false when classifying started exactly at the threshold boundary", () => {
    // elapsed === STUCK_CLASSIFYING_THRESHOLD_MS — NOT strictly greater
    expect(
      isMessageStuck(
        {
          status: "classifying",
          classifyingStartedAt: BASE_NOW - STUCK_CLASSIFYING_THRESHOLD_MS,
        },
        BASE_NOW,
      ),
    ).toBe(false);
  });

  it("returns false when classifying started 30 seconds ago", () => {
    expect(
      isMessageStuck(
        { status: "classifying", classifyingStartedAt: BASE_NOW - 30_000 },
        BASE_NOW,
      ),
    ).toBe(false);
  });

  it("returns false when classifying started 119 999 ms ago (just under threshold)", () => {
    expect(
      isMessageStuck(
        {
          status: "classifying",
          classifyingStartedAt: BASE_NOW - (STUCK_CLASSIFYING_THRESHOLD_MS - 1),
        },
        BASE_NOW,
      ),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Classifying: elapsed > threshold → stuck
  // -----------------------------------------------------------------------

  it("returns true when classifying started 120 001 ms ago (just over threshold)", () => {
    expect(
      isMessageStuck(
        {
          status: "classifying",
          classifyingStartedAt: BASE_NOW - (STUCK_CLASSIFYING_THRESHOLD_MS + 1),
        },
        BASE_NOW,
      ),
    ).toBe(true);
  });

  it("returns true when classifying started 5 minutes ago", () => {
    expect(
      isMessageStuck(
        { status: "classifying", classifyingStartedAt: BASE_NOW - 300_000 },
        BASE_NOW,
      ),
    ).toBe(true);
  });

  it("returns true when classifying started 1 hour ago", () => {
    expect(
      isMessageStuck(
        { status: "classifying", classifyingStartedAt: BASE_NOW - 3_600_000 },
        BASE_NOW,
      ),
    ).toBe(true);
  });

  // -----------------------------------------------------------------------
  // Missing classifyingStartedAt: fallback to 0 → immediately stuck
  // -----------------------------------------------------------------------

  it("returns true when classifyingStartedAt is undefined (orphaned doc fallback to 0)", () => {
    // now = 1_000_000; startedAt = 0; elapsed = 1_000_000 >> 120_000
    expect(
      isMessageStuck({ status: "classifying" }, BASE_NOW),
    ).toBe(true);
  });

  it("returns false for 'new' even when classifyingStartedAt is undefined", () => {
    expect(
      isMessageStuck({ status: "new" }, BASE_NOW),
    ).toBe(false);
  });

  // -----------------------------------------------------------------------
  // now parameter: strict threshold boundary checks
  // -----------------------------------------------------------------------

  it("is not stuck 1 ms before threshold even with a different now", () => {
    const startedAt = 5_000;
    const nowAtExact = startedAt + STUCK_CLASSIFYING_THRESHOLD_MS;
    // elapsed === threshold → NOT stuck (strict >)
    expect(
      isMessageStuck(
        { status: "classifying", classifyingStartedAt: startedAt },
        nowAtExact,
      ),
    ).toBe(false);
  });

  it("is stuck 1 ms after threshold", () => {
    const startedAt = 5_000;
    const nowJustOver = startedAt + STUCK_CLASSIFYING_THRESHOLD_MS + 1;
    expect(
      isMessageStuck(
        { status: "classifying", classifyingStartedAt: startedAt },
        nowJustOver,
      ),
    ).toBe(true);
  });
});
