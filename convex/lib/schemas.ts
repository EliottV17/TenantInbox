import { z } from "zod";

/**
 * Zod schema for the AI model's classification response.
 *
 * This is the single source of truth: the JSON Schema sent to OpenRouter is
 * derived from this schema via `z.toJSONSchema()`, and the same schema is used
 * to validate the model's response at runtime.
 *
 * The JSON Schema is intentionally kept simple (string + enum, no $schema,
 * no minLength/maxLength) to maximise provider compatibility. Fine-grained
 * length and content rules are enforced by Zod after the response is received.
 */
export const classificationResponseSchema = z.object({
  category: z.enum(["damage", "maintenance", "billing", "complaint", "general"]),
  urgency: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  draftReply: z.string(),
});

export type ClassificationResponse = z.infer<typeof classificationResponseSchema>;

/**
 * Generate a clean JSON Schema for OpenRouter's `response_format.json_schema.schema`.
 *
 * Strips `$schema` (some providers reject it) and keeps only primitive types
 * and enums — no minLength, maxLength, or pattern constraints.
 */
export function getClassificationJsonSchema(): Record<string, unknown> {
  const full = z.toJSONSchema(classificationResponseSchema);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, ...clean } = full as Record<string, unknown>;
  return clean;
}
