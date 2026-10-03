import { describe, expect, it } from "vitest";
import { SEED_MESSAGES } from "../convex/lib/seed_data";
import {
  classificationResponseSchema,
  getClassificationJsonSchema,
} from "../convex/lib/schemas";

// ---------------------------------------------------------------------------
// Valid response
// ---------------------------------------------------------------------------

describe("classificationResponseSchema", () => {
  const validResponse = {
    category: "maintenance",
    urgency: "medium",
    summary: "Tenant reports a broken dishwasher in unit 4B.",
    draftReply:
      "Thank you for letting us know. We will schedule a technician visit within 48 hours.",
  };

  it("accepts a valid classification response", () => {
    const result = classificationResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validResponse);
    }
  });

  it.each([
    ["empty", ""],
    ["whitespace-only", " \t\n "],
  ])("rejects a %s summary", (_description, summary) => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      summary,
    });
    expect(result.success).toBe(false);
  });

  it.each([
    ["empty", ""],
    ["whitespace-only", " \t\n "],
  ])("rejects a %s draftReply", (_description, draftReply) => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      draftReply,
    });
    expect(result.success).toBe(false);
  });

  it("rejects summary values over 500 characters", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      summary: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects draftReply values over 3000 characters", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      draftReply: "a".repeat(3001),
    });
    expect(result.success).toBe(false);
  });

  it("preserves surrounding whitespace in valid summary and draftReply values", () => {
    const withSurroundingWhitespace = {
      ...validResponse,
      summary: "  A valid summary.  ",
      draftReply: "  A valid reply.  ",
    };
    const result = classificationResponseSchema.safeParse(withSurroundingWhitespace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(withSurroundingWhitespace);
    }
  });

  it("accepts all 30 seed fixture classifications", () => {
    expect(SEED_MESSAGES).toHaveLength(30);
    for (const [index, message] of SEED_MESSAGES.entries()) {
      const result = classificationResponseSchema.safeParse({
        category: message.category,
        urgency: message.urgency,
        summary: message.summary,
        draftReply: message.draftReply,
      });
      expect(result.success, `fixture ${index + 1}: ${message.sender}`).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // Missing fields
  // -------------------------------------------------------------------------

  it("rejects when category is missing", () => {
    const { category: _, ...without } = validResponse;
    void _;
    const result = classificationResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects when urgency is missing", () => {
    const { urgency: _, ...without } = validResponse;
    void _;
    const result = classificationResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects when summary is missing", () => {
    const { summary: _, ...without } = validResponse;
    void _;
    const result = classificationResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it("rejects when draftReply is missing", () => {
    const { draftReply: _, ...without } = validResponse;
    void _;
    const result = classificationResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Invalid enum values
  // -------------------------------------------------------------------------

  it("rejects an invalid category", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      category: "plumbing", // not in the enum
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid urgency", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      urgency: "critical", // not in the enum
    });
    expect(result.success).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Wrong types
  // -------------------------------------------------------------------------

  it("rejects when summary is a number instead of string", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      summary: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when category is a number instead of string", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      category: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when draftReply is a boolean instead of string", () => {
    const result = classificationResponseSchema.safeParse({
      ...validResponse,
      draftReply: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when input is null", () => {
    const result = classificationResponseSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects when input is an array", () => {
    const result = classificationResponseSchema.safeParse([validResponse]);
    expect(result.success).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Broken JSON (simulated: parse then validate)
  // -------------------------------------------------------------------------

  it("rejects broken JSON (simulated via invalid parse)", () => {
    const brokenJson = "{ category: maintenance }"; // not valid JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(brokenJson);
    } catch {
      // JSON.parse throws — this is the expected path
      parsed = undefined;
    }
    const result = classificationResponseSchema.safeParse(parsed);
    expect(result.success).toBe(false);
  });

  // -------------------------------------------------------------------------
  // All categories and urgencies are accepted
  // -------------------------------------------------------------------------

  const categories = ["damage", "maintenance", "billing", "complaint", "general"] as const;
  const urgencies = ["low", "medium", "high"] as const;

  for (const category of categories) {
    it(`accepts category '${category}'`, () => {
      const result = classificationResponseSchema.safeParse({
        ...validResponse,
        category,
      });
      expect(result.success).toBe(true);
    });
  }

  for (const urgency of urgencies) {
    it(`accepts urgency '${urgency}'`, () => {
      const result = classificationResponseSchema.safeParse({
        ...validResponse,
        urgency,
      });
      expect(result.success).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// JSON Schema generation
// ---------------------------------------------------------------------------

describe("getClassificationJsonSchema", () => {
  it("does not include $schema key", () => {
    const schema = getClassificationJsonSchema();
    expect(schema).not.toHaveProperty("$schema");
  });

  it("has required fields and additionalProperties false", () => {
    const schema = getClassificationJsonSchema() as {
      required: string[];
      additionalProperties: boolean;
    };
    expect(schema.required).toEqual(
      expect.arrayContaining(["category", "urgency", "summary", "draftReply"]),
    );
    expect(schema.additionalProperties).toBe(false);
  });

  it("does not include minLength or maxLength constraints", () => {
    const schema = getClassificationJsonSchema() as {
      properties: Record<string, Record<string, unknown>>;
    };
    for (const [, prop] of Object.entries(schema.properties)) {
      expect(prop).not.toHaveProperty("minLength");
      expect(prop).not.toHaveProperty("maxLength");
    }
  });
});
