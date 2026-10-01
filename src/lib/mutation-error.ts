const SAFE_BACKEND_MESSAGES = new Set([
  "Message not found",
  "Cannot edit draft of an unclassified message",
  "Cannot edit draft of a resolved message",
  "Cannot edit draft of an already approved message",
  "Draft reply cannot be empty",
  "Only classified messages with a draft reply can be approved",
  "Cannot approve a resolved message",
  "Message is already approved",
  "Sender must be between 1 and 100 characters",
  "Subject must be between 1 and 200 characters",
  "Body must be between 1 and 5000 characters",
  "Cannot retry classification of a resolved message",
  "Cannot retry classification of an approved message",
  "Classification is currently in progress; retry is only allowed if stuck for > 2 minutes",
  "Message is already pending classification",
  "Message is already successfully classified",
  "Message is not eligible for classification retry",
]);

function safeMessage(error: Error): string | null {
  const message = error.message.trim();
  if (SAFE_BACKEND_MESSAGES.has(message)) return message;

  const decorated = /^Uncaught Error:\s*([^\r\n]+)/m.exec(message);
  const backendMessage = decorated?.[1]?.trim();
  return backendMessage && SAFE_BACKEND_MESSAGES.has(backendMessage)
    ? backendMessage
    : null;
}

export function mutationErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  return safeMessage(error) ?? fallback;
}
