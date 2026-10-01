import Link from "next/link";

export function MessageNotFound() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Message not found</h1>
      <p className="text-sm text-muted-foreground">
        This message may have been removed, or the link may be invalid.
      </p>
      <Link href="/inbox" className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted">
        Back to inbox
      </Link>
    </main>
  );
}
