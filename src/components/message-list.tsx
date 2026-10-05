"use client";

/**
 * MessageList — reactive inbox list for the Tenant Inbox.
 *
 * Design decisions:
 * - `useQuery(api.messages.list, { category, urgency })` subscribes
 *   reactively; Convex pushes updates automatically without polling.
 * - A single `useNow()` call is shared across all rows so stuck detection uses
 *   a consistent timestamp without one timer per row.
 * - `category` and `urgency` are typed optional props; no filter UI is
 *   rendered here (T4). When undefined they map to the query's optional args,
 *   which the backend interprets as "no filter".
 * - Loading state uses `aria-busy` and an accessible text placeholder; no
 *   extra spinner component is introduced.
 * - A latest-50 note is always shown because the query is bounded, even when
 *   the current result set contains fewer than 50 messages.
 * - Timestamps are formatted with `formatDate` (stable en-US / UTC locale)
 *   to prevent hydration mismatches.
 * - Approved/Resolved indicators render only when the respective timestamp
 *   field is defined on the document.
 * - Responsive layout: stacked on mobile, with wrapping metadata on desktop.
 */

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNow } from "@/hooks/use-now";
import { StatusChip, ApprovedIndicator, ResolvedIndicator } from "@/components/status-chip";
import { UrgencyChip } from "@/components/urgency-chip";
import { formatDate } from "@/lib/format-date";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category, Urgency } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MessageListProps {
  /** Filter to a specific category. When undefined, all categories are shown. */
  category?: Category;
  /** Filter to a specific urgency level. When undefined, all urgencies are shown. */
  urgency?: Urgency;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The backend returns at most this many messages per query. */
const LIST_LIMIT = 50;

const CATEGORY_COLORS: Record<string, string> = {
  damage: "#c4746e",
  maintenance: "#7fb4ca",
  complaint: "#e6c384",
  general: "#938aa9",
};

// ---------------------------------------------------------------------------
// MessageList
// ---------------------------------------------------------------------------

export function MessageList({ category, urgency }: MessageListProps) {
  // Single clock shared across all rows; avoids one interval per row.
  const now = useNow();

  // `useQuery` returns `undefined` while loading, then the array.
  // Passing `category` / `urgency` as optional args maps directly to the
  // backend `list` query signature which accepts `v.optional(...)` for both.
  const messages = useQuery(api.messages.list, { category, urgency });

  // --- Loading state ---
  if (messages === undefined) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading messages"
        className="py-12 text-center text-sm text-muted-foreground"
      >
        <span className="sr-only">Loading messages…</span>
        <span aria-hidden="true">Loading messages…</span>
      </div>
    );
  }

  // --- Message list and empty state ---
  return (
    <section aria-label="Message list">
      <p className="mb-3 text-right text-xs text-muted-foreground">
        Showing the latest {LIST_LIMIT} messages.
      </p>

      {messages.length === 0 ? (
        <div
          role="status"
          className="rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            {category !== undefined || urgency !== undefined
              ? "No messages match these filters"
              : "No messages yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {category !== undefined || urgency !== undefined
              ? "Try changing or clearing the filters."
              : "Messages submitted through the form will appear here."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
        {messages.map((message) => (
          <li key={message._id}>
            <Link
              href={`/inbox/${message._id}`}
              className={[
                "group block rounded-md border border-border bg-card px-3.5 py-3",
                "transition-colors hover:bg-muted focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              ].join(" ")}
              aria-label={`Message from ${message.sender}: ${message.subject}`}
            >
              {/*
               * Responsive row layout:
               *   Mobile  → stacked (flex-col)
               *   sm+     → horizontal (flex-row) with subject/sender on left,
               *             chips + date on right
               */}
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:items-start">
                {/* Left: sender + subject */}
                <div className="min-w-0 flex-1">
                  <p title={message.sender} className="truncate text-sm font-semibold text-foreground group-hover:text-foreground">
                    {message.sender}
                  </p>
                  <p title={message.subject} className="mt-0.5 truncate text-sm text-muted-foreground">
                    {message.subject}
                  </p>
                </div>

                {/* Right: chips + date */}
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:justify-end">
                  <span
                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: message.category === undefined
                        ? "#A4A7A4"
                        : CATEGORY_COLORS[message.category] ?? "#A4A7A4",
                      backgroundColor: `color-mix(in srgb, ${message.category === undefined ? "#A4A7A4" : CATEGORY_COLORS[message.category] ?? "#A4A7A4"} 14%, transparent)`,
                      borderColor: `color-mix(in srgb, ${message.category === undefined ? "#A4A7A4" : CATEGORY_COLORS[message.category] ?? "#A4A7A4"} 35%, #393B44)`,
                    }}
                  >
                    {message.category === undefined
                      ? "Not classified"
                      : CATEGORY_LABELS[message.category] ?? String(message.category)}
                  </span>

                  {/* Urgency chip */}
                  <UrgencyChip urgency={message.urgency} />

                  {/* Pipeline status */}
                  <StatusChip
                    status={message.status}
                    classifyingStartedAt={message.classifyingStartedAt}
                    now={now}
                  />

                  {/* Human-action indicators — only when timestamps are defined */}
                  {message.approvedAt !== undefined && <ApprovedIndicator />}
                  {message.resolvedAt !== undefined && <ResolvedIndicator />}

                  {/* Created time */}
                  <time
                    dateTime={new Date(message._creationTime).toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDate(message._creationTime)}
                  </time>
                </div>
              </div>
            </Link>
          </li>
        ))}
        </ul>
      )}
    </section>
  );
}
