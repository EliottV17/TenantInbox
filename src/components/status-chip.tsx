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
  gray: "border-[#393B44] bg-[#A4A7A4]/10 text-[#A4A7A4]",
  blue: "border-[#7fb4ca]/40 bg-[#7fb4ca]/[0.14] text-[#7fb4ca]",
  green: "border-[#7aa89f]/40 bg-[#7aa89f]/[0.14] text-[#7aa89f]",
  red: "border-[#c4746e]/40 bg-[#c4746e]/[0.14] text-[#c4746e]",
  amber: "border-[#e6c384]/40 bg-[#e6c384]/[0.14] text-[#e6c384]",
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
        "border-[#87a987]/40 bg-[#87a987]/[0.14] text-[#87a987]",
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
        "border-[#393B44] bg-[#A4A7A4]/10 text-[#A4A7A4]",
        "font-medium",
        className,
      )}
    >
      Resolved
    </Badge>
  );
}
