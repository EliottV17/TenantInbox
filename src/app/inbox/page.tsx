import { MessageForm } from "@/components/message-form";
import { MessageList } from "@/components/message-list";

export default function InboxPage() {
  return (
    <div className="flex-1 min-h-screen bg-muted/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tenant Inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Property management inbox for receiving and classifying tenant communications.
          </p>
        </div>
        <MessageForm />
        <MessageList />
      </div>
    </div>
  );
}
