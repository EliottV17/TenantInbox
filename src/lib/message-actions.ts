export interface DraftActionState {
  status: "new" | "classifying" | "classified" | "failed";
  draftReply?: string;
  approvedAt?: number;
  resolvedAt?: number;
}

export function canEditDraft(message: DraftActionState): boolean {
  return message.status === "classified" && message.approvedAt === undefined && message.resolvedAt === undefined;
}

export function canApproveDraft(
  message: DraftActionState,
  localDraft: string,
  baselineDraft: string,
): boolean {
  return (
    canEditDraft(message) &&
    Boolean(message.draftReply?.trim()) &&
    localDraft === message.draftReply &&
    localDraft === baselineDraft
  );
}

export function canResolve(message: DraftActionState): boolean {
  return message.resolvedAt === undefined;
}
