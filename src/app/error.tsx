"use client";

import Link from "next/link";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        Please try again or return to your inbox.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          Try again
        </button>
        <Link
          href="/inbox"
          className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          Back to inbox
        </Link>
      </div>
    </main>
  );
}
