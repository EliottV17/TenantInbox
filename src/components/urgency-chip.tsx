"use client";

/**
 * UrgencyChip — displays the urgency level of a classified message.
 *
 * Semantic colour mapping (light/dark):
 *   low    → green  (no immediate action needed)
 *   medium → amber  (impacts daily life but not a safety risk)
 *   high   → red    (safety risk or legal deadline within 48 hours)
 *
 * When urgency is undefined (message is not yet classified) this component
 * renders nothing, so it is safe to unconditionally render in a list row.
 */

import { Badge } from "@/components/ui/badge";
import { URGENCY_LABELS, type Urgency } from "@/lib/constants";
import { cn } from "cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UrgencyChipProps {
  urgency: Urgency | undefined;
  className?: string;
}

// ---------------------------------------------------------------------------
// Style map
// ---------------------------------------------------------------------------

const URGENCY_STYLES: Record<Urgency, string> = {
  low: cn(
    "bg-green-100 text-green-700 border-green-200",
    "dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  ),
  medium: cn(
    "bg-amber-100 text-amber-700 border-amber-200",
    "dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  ),
  high: cn(
    "bg-red-100 text-red-700 border-red-200",
    "dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  ),
};

// ---------------------------------------------------------------------------
// UrgencyChip
// ---------------------------------------------------------------------------

export function UrgencyChip({ urgency, className }: UrgencyChipProps) {
  if (urgency === undefined) {
    return null;
  }

  return (
    <Badge
      className={cn(URGENCY_STYLES[urgency], "font-medium", className)}
    >
      {URGENCY_LABELS[urgency]}
    </Badge>
  );
}
