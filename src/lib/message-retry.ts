import { isMessageStuck, type StuckCheckMessage } from "./message-state";

export interface RetryActionState extends StuckCheckMessage {
  approvedAt?: number;
  resolvedAt?: number;
}

export function shouldShowRetryClassification(
  message: RetryActionState,
  now: number | null,
): boolean {
  return message.status === "failed" || (now !== null && isMessageStuck(message, now));
}

export function canRetryClassification(
  message: RetryActionState,
  now: number | null,
): boolean {
  return (
    shouldShowRetryClassification(message, now) &&
    message.approvedAt === undefined &&
    message.resolvedAt === undefined
  );
}
