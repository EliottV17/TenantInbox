"use client";

/**
 * useNow — a React hook that returns the current timestamp (ms) updated on a
 * regular interval.
 *
 * Design constraints:
 * - `Date.now()` is NEVER called outside a `useEffect` or `setInterval`
 *   callback. This keeps the hook lint-clean (no impure render body, no
 *   impure state initializer).
 * - The hook initializes to `null` and sets the first value via an immediate
 *   `setTimeout(..., 0)` inside the effect. The brief null window is visible
 *   only on the very first render; consumers should treat `null` as "clock not
 *   yet started" and skip stuck-detection until a value is available.
 * - The interval is cleared in the effect cleanup, preventing memory leaks
 *   when the component unmounts.
 *
 * Interval: 15 seconds — short enough to catch stuck messages within one
 * display cycle beyond the 2-minute threshold, long enough to avoid
 * excessive re-renders in a list view.
 *
 * Usage:
 *   const now = useNow();
 *   // now is null on the first render, then a number after the first tick
 *   const stuck = now !== null && isMessageStuck(message, now);
 */

import { useEffect, useState } from "react";

const INTERVAL_MS = 15_000; // 15 seconds

export function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Schedule initial clock tick immediately (outside render path) so the
    // first value is set asynchronously, satisfying the lint rule that
    // Date.now() must not run during render or synchronous state initializer.
    const initialTimer = setTimeout(() => {
      setNow(Date.now());
    }, 0);

    // Subsequent updates on a fixed interval.
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, []); // runs once on mount

  return now;
}
