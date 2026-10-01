"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { DraftEditor } from "@/components/draft-editor";
import { RetryClassificationButton } from "@/components/retry-classification-button";
import { MessageNotFound } from "@/components/message-not-found";
import { StatusChip, ApprovedIndicator, ResolvedIndicator } from "@/components/status-chip";
import { UrgencyChip } from "@/components/urgency-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNow } from "@/hooks/use-now";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format-date";
import { canResolve } from "@/lib/message-actions";
import { isMessageStuck } from "@/lib/message-state";
import { mutationErrorMessage } from "@/lib/mutation-error";

export function MessageDetail({ id }: { id: string }) {
  // The backend validator is the authoritative ID parser. Keep URL IDs opaque
  // and let the route error boundary handle malformed values.
  const message = useQuery(api.messages.get, { id: id as Id<"messages"> });
  const now = useNow();
  const resolve = useMutation(api.messages.resolve);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (message === undefined) return <p role="status" className="mx-auto max-w-3xl px-4 py-10">Loading message…</p>;
  if (message === null) return <MessageNotFound />;

  async function resolveMessage() {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      await resolve({ id: id as Id<"messages"> });
      setSuccess("Message resolved.");
    } catch (cause) {
      setError(mutationErrorMessage(cause, "Unable to resolve this message. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/inbox" className="text-sm text-primary underline-offset-4 hover:underline">← Back to inbox</Link>
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <StatusChip status={message.status} classifyingStartedAt={message.classifyingStartedAt} now={now} />
              <UrgencyChip urgency={message.urgency} />
              {message.approvedAt !== undefined && <ApprovedIndicator />}
              {message.resolvedAt !== undefined && <ResolvedIndicator />}
            </div>
            <CardTitle className="text-2xl wrap-anywhere">{message.subject}</CardTitle>
            <p className="text-sm text-muted-foreground wrap-anywhere">From {message.sender}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {message.status === "new" && <p role="status" className="text-sm text-muted-foreground">Waiting for classification.</p>}
            {message.status === "classifying" && (
              <p role="status" className="text-sm text-muted-foreground">
                {now !== null && isMessageStuck(message, now)
                  ? "Classification is taking longer than expected; progress may have stopped."
                  : "Classifying message…"}
              </p>
            )}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-medium">Channel</dt><dd className="text-muted-foreground">{message.channel}</dd></div>
              <div><dt className="font-medium">Created</dt><dd className="text-muted-foreground">{formatDate(message._creationTime)}</dd></div>
              {message.category && <div><dt className="font-medium">Category</dt><dd className="text-muted-foreground">{CATEGORY_LABELS[message.category]}</dd></div>}
              {message.classifyingStartedAt !== undefined && <div><dt className="font-medium">Classification started</dt><dd className="text-muted-foreground">{formatDate(message.classifyingStartedAt)}</dd></div>}
              {message.classifiedAt !== undefined && <div><dt className="font-medium">Classified</dt><dd className="text-muted-foreground">{formatDate(message.classifiedAt)}</dd></div>}
              {message.approvedAt !== undefined && <div><dt className="font-medium">Approved</dt><dd className="text-muted-foreground">{formatDate(message.approvedAt)}</dd></div>}
              {message.resolvedAt !== undefined && <div><dt className="font-medium">Resolved</dt><dd className="text-muted-foreground">{formatDate(message.resolvedAt)}</dd></div>}
            </dl>
            <section className="space-y-2"><h2 className="font-semibold">Message</h2><p className="whitespace-pre-wrap text-sm wrap-anywhere">{message.body}</p></section>
            {message.summary && <section className="space-y-2"><h2 className="font-semibold">Summary</h2><p className="text-sm text-muted-foreground wrap-anywhere">{message.summary}</p></section>}
            {message.failReason && <section className="space-y-2"><h2 className="font-semibold">Classification issue</h2><p className="text-sm text-destructive wrap-anywhere">{message.failReason}</p></section>}
            {(message.status === "classified" || message.draftReply !== undefined) && (
              <DraftEditor key={message._id} message={message} />
            )}
            <RetryClassificationButton message={message} now={now} />
            <div className="space-y-2">
              <Button type="button" variant="outline" onClick={resolveMessage} disabled={pending || !canResolve(message)}>
                {pending ? "Resolving…" : message.resolvedAt !== undefined ? "Resolved" : "Resolve message"}
              </Button>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
