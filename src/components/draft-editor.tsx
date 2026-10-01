"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canApproveDraft, canEditDraft, type DraftActionState } from "@/lib/message-actions";
import { mutationErrorMessage } from "@/lib/mutation-error";

type MessageDraft = DraftActionState & { _id: Id<"messages"> };

export function DraftEditor({ message }: { message: MessageDraft }) {
  const initialDraft = message.draftReply ?? "";
  const [draft, setDraft] = useState(initialDraft);
  const [baseline, setBaseline] = useState(initialDraft);
  const [pending, setPending] = useState<"save" | "approve" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const updateDraft = useMutation(api.messages.updateDraft);
  const approve = useMutation(api.messages.approve);
  const editable = canEditDraft(message);
  const changed = draft !== baseline || draft !== initialDraft;
  const approveAllowed = canApproveDraft(message, draft, baseline) && draft === initialDraft;

  async function save() {
    setPending("save");
    setError(null);
    setSuccess(null);
    try {
      await updateDraft({ id: message._id, draftReply: draft });
      setBaseline(draft.trim());
      setDraft(draft.trim());
      setSuccess("Draft saved.");
    } catch (cause) {
      setError(mutationErrorMessage(cause, "Unable to save the draft. Please try again."));
    } finally {
      setPending(null);
    }
  }

  async function approveDraft() {
    setPending("approve");
    setError(null);
    setSuccess(null);
    try {
      await approve({ id: message._id });
      setSuccess("Draft approved.");
    } catch (cause) {
      setError(mutationErrorMessage(cause, "Unable to approve the draft. Please try again."));
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="space-y-3" aria-labelledby="draft-heading">
      <h2 id="draft-heading" className="text-lg font-semibold">Draft reply</h2>
      <Textarea
        value={draft}
        onChange={(event) => { setDraft(event.target.value); setSuccess(null); }}
        rows={7}
        disabled={!editable || pending !== null}
        aria-label="Draft reply"
      />
      {!editable && <p className="text-sm text-muted-foreground">This draft can no longer be edited.</p>}
      <div className="flex flex-wrap gap-2">
        {editable && <Button type="button" variant="outline" onClick={save} disabled={pending !== null || !changed || !draft.trim()}>
          {pending === "save" ? "Saving…" : "Save draft"}
        </Button>}
        <Button type="button" onClick={approveDraft} disabled={pending !== null || !approveAllowed}>
          {pending === "approve" ? "Approving…" : "Approve draft"}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>}
    </section>
  );
}
