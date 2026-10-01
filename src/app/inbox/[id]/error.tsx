"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

function isInvalidMessageId(error: Error): boolean {
  const message = error.message;
  return (
    /^ArgumentValidationError:\s*Value does not match validator\./i.test(message) ||
    /^Value does not match validator\.\s*\r?\nPath:\s*\.id(?:\r?\n|$)/i.test(message)
  );
}

export default function MessageRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const invalidLink = isInvalidMessageId(error);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Message not found</h1>
      <p className="text-sm text-muted-foreground">
        {invalidLink
          ? "This message link is invalid. Check the link or return to your inbox."
          : "Unable to load this message. Please try again or return to your inbox."}
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={reset}>Try again</Button>
        <Link href="/inbox" className="inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted">Back to inbox</Link>
      </div>
    </main>
  );
}
