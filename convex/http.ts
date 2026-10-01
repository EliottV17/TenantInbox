import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { validateMessageContent } from "./messages";

const http = httpRouter();

/**
 * Compares two strings in constant time using SHA-256 digests and XOR accumulation.
 * This runs natively in the standard Convex V8 runtime using crypto.subtle and prevents
 * timing attacks without leaking secret length.
 */
async function timingSafeEqualString(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);

  let mismatch = 0;
  for (let i = 0; i < bytesA.length; i++) {
    mismatch |= bytesA[i] ^ bytesB[i];
  }

  return mismatch === 0;
}

http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const expectedSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = req.headers.get("x-webhook-secret");

    if (!expectedSecret || !providedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isMatch = await timingSafeEqualString(providedSecret, expectedSecret);
    if (!isMatch) {
      return new Response("Unauthorized", { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    if (typeof payload !== "object" || payload === null) {
      return new Response("Payload must be a JSON object", { status: 400 });
    }

    const { sender, subject, body } = payload as Record<string, unknown>;

    if (
      typeof sender !== "string" ||
      typeof subject !== "string" ||
      typeof body !== "string"
    ) {
      return new Response(
        "Fields 'sender', 'subject', and 'body' are required and must be strings",
        { status: 400 }
      );
    }

    let validated: { sender: string; subject: string; body: string };
    try {
      validated = validateMessageContent({ sender, subject, body });
    } catch (err) {
      return new Response(
        err instanceof Error ? err.message : "Validation error",
        { status: 400 }
      );
    }

    const messageId: string = await ctx.runMutation(
      internal.messages.createFromWebhook,
      {
        sender: validated.sender,
        subject: validated.subject,
        body: validated.body,
      }
    );

    return new Response(JSON.stringify({ success: true, messageId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
