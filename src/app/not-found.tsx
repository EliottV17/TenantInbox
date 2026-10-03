import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl space-y-3 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you’re looking for could not be found.
      </p>
      <Link
        href="/inbox"
        className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium text-foreground hover:bg-muted"
      >
        Back to inbox
      </Link>
    </main>
  );
}
