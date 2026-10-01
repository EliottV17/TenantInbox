"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { canRetryClassification, shouldShowRetryClassification, type RetryActionState } from "@/lib/message-retry";
import { mutationErrorMessage } from "@/lib/mutation-error";

export function RetryClassificationButton({
  message,
  now,
}: {
  message: RetryActionState & { _id: Id<"messages"> };
  now: number | null;
}) {
  const retryClassification = useMutation(api.messages.retryClassification);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!shouldShowRetryClassification(message, now)) return null;

  async function retry() {
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      await retryClassification({ id: message._id });
      setSuccess(true);
    } catch (cause) {
      setError(mutationErrorMessage(cause, "Unable to retry classification. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-2">
      <Button type="button" variant="outline" onClick={retry} disabled={pending || !canRetryClassification(message, now)}>
        {pending ? "Retrying…" : "Retry classification"}
      </Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && message.status === "new" && <p role="status" className="text-sm text-muted-foreground">Waiting for classification.</p>}
      {success && message.status === "classifying" && <p role="status" className="text-sm text-muted-foreground">Classification restarted.</p>}
    </section>
  );
}
