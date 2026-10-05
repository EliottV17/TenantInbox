import { Suspense } from "react";
import { Activity } from "lucide-react";
import { MessageForm } from "@/components/message-form";
import { InboxContent } from "@/components/inbox-content";

export default function InboxPage() {
  return (
    <div className="min-h-screen flex-1 bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Inbox
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Property management inbox for receiving and classifying tenant communications.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 pt-1 text-xs font-medium text-[#7aa89f]">
            <Activity aria-hidden="true" className="size-3.5" />
            AI Classifier active
          </div>
        </div>
        <MessageForm />
        <Suspense fallback={<p role="status">Loading filters…</p>}>
          <InboxContent />
        </Suspense>
      </div>
    </div>
  );
}
