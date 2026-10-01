/**
 * format-date.ts — deterministic date formatting helpers for the inbox UI.
 *
 * Motivation: Next.js App Router renders server components on the server and
 * hydrates them on the client. `Date.toLocaleString()` without explicit
 * `locale` and `timeZone` options produces different output depending on the
 * host locale (server vs. browser), causing a hydration mismatch. By pinning
 * both, server and client always produce identical strings.
 *
 * This module is purely functional (no side effects) and safe to import from
 * both server components and client components.
 */

/** Stable locale used for all date/time formatting in this app. */
const LOCALE = "en-US";

/**
 * UTC is used as the display timezone.
 *
 * Rationale: property management messages can come from tenants in any
 * timezone. Displaying in UTC avoids ambiguity and ensures server/client
 * rendering always produce the same string.
 */
const TIMEZONE = "UTC";

/**
 * Formats an epoch-millisecond timestamp as a short, readable date+time
 * string (e.g. "Jun 15, 2025, 14:32 UTC").
 *
 * Uses explicit `locale` and `timeZone` options so the output is identical
 * on the server and on the client, preventing React hydration mismatches.
 *
 * @param epochMs - Epoch milliseconds (e.g. `_creationTime` from Convex).
 * @returns A human-readable date string.
 */
export function formatDate(epochMs: number): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(epochMs));
}
