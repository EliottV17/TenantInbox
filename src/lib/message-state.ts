/**
 * Pure UI state helpers for message classification status.
 *
 * All functions are pure (no side effects, no Date.now() calls) so they are
 * easily unit-testable and safe to call from React render paths.
 * The caller is responsible for supplying the current timestamp.
 */
import { STUCK_CLASSIFYING_THRESHOLD_MS } from "./constants";

/** Minimal shape of a message document needed to evaluate stuck state. */
export interface StuckCheckMessage {
  status: "new" | "classifying" | "classified" | "failed";
  classifyingStartedAt?: number;
}

/**
 * Returns true when a message is actively classifying and has exceeded the
 * stuck threshold.
 *
 * The caller must supply `now` (e.g. from `useNow()`) so this function
 * remains pure and testable without mocking `Date.now()`.
 *
 * When `classifyingStartedAt` is missing we fall back to 0, making the
 * message immediately stuck — this matches the backend `checkRetryEligibility`
 * semantics and protects against orphaned classifying documents.
 *
 * @param message - The message to evaluate.
 * @param now - The current timestamp in milliseconds (epoch).
 */
export function isMessageStuck(
  message: StuckCheckMessage,
  now: number,
): boolean {
  if (message.status !== "classifying") {
    return false;
  }
  const startedAt = message.classifyingStartedAt ?? 0;
  return now - startedAt > STUCK_CLASSIFYING_THRESHOLD_MS;
}
