"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MAX_SENDER_LENGTH,
  MAX_SUBJECT_LENGTH,
  MAX_BODY_LENGTH,
} from "@/lib/constants";

interface FormErrors {
  sender?: string;
  subject?: string;
  body?: string;
  server?: string;
}

export function MessageForm() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMessage = useMutation(api.messages.create);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const trimmedSender = sender.trim();
    if (!trimmedSender) {
      nextErrors.sender = "Sender is required.";
    } else if (sender.length > MAX_SENDER_LENGTH) {
      nextErrors.sender = `Sender must be ${MAX_SENDER_LENGTH} characters or less.`;
    }

    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      nextErrors.subject = "Subject is required.";
    } else if (subject.length > MAX_SUBJECT_LENGTH) {
      nextErrors.subject = `Subject must be ${MAX_SUBJECT_LENGTH} characters or less.`;
    }

    const trimmedBody = body.trim();
    if (!trimmedBody) {
      nextErrors.body = "Body is required.";
    } else if (body.length > MAX_BODY_LENGTH) {
      nextErrors.body = `Body must be ${MAX_BODY_LENGTH} characters or less.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await createMessage({
        sender: sender.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });

      // Clear the form on success
      setSender("");
      setSubject("");
      setBody("");
      setSuccessMessage("Message sent successfully and queued as new.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while sending the message.";
      setErrors({ server: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">New Tenant Message</CardTitle>
        <CardDescription>
          Submit a new incoming inquiry or report. Messages will be queued for
          classification.
        </CardDescription>
      </CardHeader>
      <div className="px-6">
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-transparent px-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          aria-expanded={isExpanded}
          aria-controls="new-message-form"
          disabled={isSubmitting}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          New message
        </button>
      </div>
      <div id="new-message-form" hidden={!isExpanded}>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {successMessage && (
              <div
                role="status"
                className="rounded-lg border border-emerald-500/20 bg-emerald-50/50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                {successMessage}
              </div>
            )}

            {errors.server && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {errors.server}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="sender"
                  className="text-sm font-medium text-foreground"
                >
                  Sender
                </label>
                <span className="text-xs text-muted-foreground">
                  {sender.length}/{MAX_SENDER_LENGTH}
                </span>
              </div>
              <Input
                id="sender"
                name="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Unit 4B - Jane Doe"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.sender)}
                aria-describedby={errors.sender ? "sender-error" : undefined}
              />
              {errors.sender && (
                <p id="sender-error" className="text-xs text-destructive">
                  {errors.sender}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-foreground"
                >
                  Subject
                </label>
                <span className="text-xs text-muted-foreground">
                  {subject.length}/{MAX_SUBJECT_LENGTH}
                </span>
              </div>
              <Input
                id="subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Water leak under the kitchen sink"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject && (
                <p id="subject-error" className="text-xs text-destructive">
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="body"
                  className="text-sm font-medium text-foreground"
                >
                  Message Body
                </label>
                <span className="text-xs text-muted-foreground">
                  {body.length}/{MAX_BODY_LENGTH}
                </span>
              </div>
              <Textarea
                id="body"
                name="body"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Provide full details regarding the inquiry, maintenance request, or issue..."
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? "body-error" : undefined}
              />
              {errors.body && (
                <p id="body-error" className="text-xs text-destructive">
                  {errors.body}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
}
