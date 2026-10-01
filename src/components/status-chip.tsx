"use client";

/**
 * StatusChip — displays the classification pipeline status of a message.
 *
 * Semantic colour mapping (light/dark):
 *   new          → gray   (neutral, not yet processed)
 *   classifying  → blue   (active / in-progress)
 *   classified   → green  (success)
 *   failed       → red    (error)
 *   stuck        → amber  (warning — classifying but exceeded 2-minute threshold)
 *
 * The component accepts an explicit `now` prop so a parent component (e.g. a
 * list) can share a single `useNow()` value across all rows, avoiding one
 * timer per row. When `now` is null (clock not yet started) stuck detection
 * is skipped and the message is shown as "Classifying…".
 *
 * Also exports two small indicator components:
 *   ApprovedIndicator  — shown when a message has been approved
 *   ResolvedIndicator  — shown when a message has been resolved
 */

import { LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isMessageStuck } from "@/lib/message-state";
import type { MessageStatus } from "@/lib/constants";
import { cn } from "cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatusChipProps {
  /** Classification pipeline status of the message. */
  status: MessageStatus;
  /** Epoch ms timestamp when classifying started (needed for stuck detection). */
  classifyingStartedAt?: number;
  /**
   * Current timestamp from the shared clock (useNow).
   * Pass null to skip stuck detection (first render before clock ticks).
   */
  now: number | null;
  className?: string;
}

// ---------------------------------------------------------------------------
// Style maps — Tailwind classes for each visual state
// ---------------------------------------------------------------------------

/**
 * Tailwind class strings for each chip variant.
 * Using explicit utility classes instead of cva variants so we keep full
 * control over light/dark without depending on shadcn semantic tokens that
 * may not be wired in this project.
 */
const CHIP_STYLES = {
  /**
   * gray — "new": neutral, message queued but not yet classifying.
   * Uses muted background so it doesn't compete with coloured chips.
   */
  gray: cn(
    "bg-gray-100 text-gray-600 border-gray-200",
    "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  ),

  /**
   * blue — "classifying": active, pulsing activity.
   */
  blue: cn(
    "bg-blue-100 text-blue-700 border-blue-200",
    "dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  ),

  /**
   * green — "classified": success.
   */
  green: cn(
    "bg-green-100 text-green-700 border-green-200",
    "dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  ),

  /**
   * red — "failed": error requiring user attention.
   */
  red: cn(
    "bg-red-100 text-red-700 border-red-200",
    "dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  ),

  /**
   * amber — "stuck": classifying exceeded the 2-minute threshold;
   * user should retry.
   */
  amber: cn(
    "bg-amber-100 text-amber-700 border-amber-200",
    "dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  ),
} as const;

type ChipColor = keyof typeof CHIP_STYLES;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ResolvedChipState {
  color: ChipColor;
  label: string;
  /** When true, render a spinning LoaderCircle activity indicator. */
  spinning: boolean;
}

function resolveChipState(
  status: MessageStatus,
  classifyingStartedAt: number | undefined,
  now: number | null,
): ResolvedChipState {
  switch (status) {
    case "new":
      return { color: "gray", label: "New", spinning: false };

    case "classifying": {
      // Only evaluate stuck when the clock has ticked (now !== null).
      const stuck =
        now !== null &&
        isMessageStuck({ status, classifyingStartedAt }, now);
      if (stuck) {
        // Stuck: show icon without spin — motion has stalled, spinning would
        // falsely signal active progress.
        return { color: "amber", label: "Stuck", spinning: false };
      }
      return { color: "blue", label: "Classifying…", spinning: true };
    }

    case "classified":
      return { color: "green", label: "Classified", spinning: false };

    case "failed":
      return { color: "red", label: "Failed", spinning: false };

    default: {
      // Exhaustiveness guard — TypeScript narrows status to never here.
      const _exhaustive: never = status;
      return { color: "gray", label: String(_exhaustive), spinning: false };
    }
  }
}

// ---------------------------------------------------------------------------
// StatusChip
// ---------------------------------------------------------------------------

export function StatusChip({
  status,
  classifyingStartedAt,
  now,
  className,
}: StatusChipProps) {
  const { color, label, spinning } = resolveChipState(
    status,
    classifyingStartedAt,
    now,
  );

  return (
    <Badge className={cn(CHIP_STYLES[color], "font-medium", className)}>
      {/*
       * Activity indicator: rendered for both classifying and stuck states.
       * `aria-hidden` keeps the icon out of the accessibility tree — the text
       * label is the sole accessible content.
       * `motion-reduce:animate-none` honours the OS/browser "reduce motion"
       * preference (prefers-reduced-motion: reduce).
       */}
      {(status === "classifying") && (
        <LoaderCircle
          aria-hidden="true"
          className={cn(
            "size-3 shrink-0",
            spinning
              ? "animate-spin motion-reduce:animate-none"
              : "opacity-70",
          )}
        />
      )}
      {label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// ApprovedIndicator
// ---------------------------------------------------------------------------

/**
 * Small inline indicator shown when a message has been approved.
 * Intentionally lightweight — just a short coloured label, not a full chip.
 */
export function ApprovedIndicator({ className }: { className?: string }) {
  return (
    <Badge
      className={cn(
        "bg-emerald-100 text-emerald-700 border-emerald-200",
        "dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        "font-medium",
        className,
      )}
    >
      Approved
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// ResolvedIndicator
// ---------------------------------------------------------------------------

/**
 * Small inline indicator shown when a message has been resolved.
 */
export function ResolvedIndicator({ className }: { className?: string }) {
  return (
    <Badge
      className={cn(
        "bg-slate-100 text-slate-600 border-slate-200",
        "dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        "font-medium",
        className,
      )}
    >
      Resolved
    </Badge>
  );
}
