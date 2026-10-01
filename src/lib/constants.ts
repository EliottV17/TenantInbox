/**
 * Frontend constants for message display.
 *
 * STUCK_CLASSIFYING_THRESHOLD_MS is a documented copy of the backend constant.
 * The backend module (convex/messages.ts) imports runtime functions and cannot
 * be imported directly from the Next.js frontend bundle. Both values must stay
 * in sync; the source of truth is docs/PLAN.md (2 minutes / 120 000 ms).
 */
export const STUCK_CLASSIFYING_THRESHOLD_MS = 120_000; // 2 minutes — keep in sync with convex/messages.ts

// ---------------------------------------------------------------------------
// Form field limits (mirrored from convex/messages.ts for client-side validation)
// ---------------------------------------------------------------------------

export const MAX_SENDER_LENGTH = 100;
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_BODY_LENGTH = 5000;

// ---------------------------------------------------------------------------
// Message status
// ---------------------------------------------------------------------------

export type MessageStatus =
  | "new"
  | "classifying"
  | "classified"
  | "failed";

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export type Category =
  | "damage"
  | "maintenance"
  | "billing"
  | "complaint"
  | "general";

export const CATEGORY_LABELS: Record<Category, string> = {
  damage: "Damage",
  maintenance: "Maintenance",
  billing: "Billing",
  complaint: "Complaint",
  general: "General",
};

/** All category values in a stable order for use in selects / filter bars. */
export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "damage", label: CATEGORY_LABELS.damage },
  { value: "maintenance", label: CATEGORY_LABELS.maintenance },
  { value: "billing", label: CATEGORY_LABELS.billing },
  { value: "complaint", label: CATEGORY_LABELS.complaint },
  { value: "general", label: CATEGORY_LABELS.general },
];

// ---------------------------------------------------------------------------
// Urgency
// ---------------------------------------------------------------------------

export type Urgency = "low" | "medium" | "high";

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** All urgency values in ascending severity order. */
export const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: "low", label: URGENCY_LABELS.low },
  { value: "medium", label: URGENCY_LABELS.medium },
  { value: "high", label: URGENCY_LABELS.high },
];
