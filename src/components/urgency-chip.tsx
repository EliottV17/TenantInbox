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
  low: cn("border-[#87a987]/40 bg-[#87a987]/[0.14] text-[#87a987]"),
  medium: cn("border-[#e6c384]/40 bg-[#e6c384]/[0.14] text-[#e6c384]"),
  high: cn("border-[#e46876]/40 bg-[#e46876]/[0.14] text-[#e46876]"),
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
