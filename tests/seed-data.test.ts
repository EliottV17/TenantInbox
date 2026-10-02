import { describe, expect, it } from "vitest";
import { SEED_MESSAGES } from "../convex/lib/seed-data";
import { classificationResponseSchema } from "../convex/lib/schemas";

describe("SEED_MESSAGES", () => {
  it("contains 30 classified messages with the planned category distribution", () => {
    expect(SEED_MESSAGES).toHaveLength(30);
    const counts = Object.fromEntries(
      ["damage", "maintenance", "billing", "complaint", "general"].map(
        (category) => [
          category,
          SEED_MESSAGES.filter((message) => message.category === category).length,
        ],
      ),
    );
    expect(counts).toEqual({
      damage: 6,
      maintenance: 7,
      billing: 6,
      complaint: 5,
      general: 6,
    });
    expect(SEED_MESSAGES.every((message) => message.status === "classified")).toBe(
      true,
    );
  });

  it("validates every classification using the runtime response schema", () => {
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

  it("has non-empty bounded sender, subject, and body fields", () => {
    for (const [index, message] of SEED_MESSAGES.entries()) {
      expect(message.sender.trim(), `sender ${index + 1}`).not.toBe("");
      expect(message.sender.length, `sender ${index + 1}`).toBeLessThanOrEqual(100);
      expect(message.subject.trim(), `subject ${index + 1}`).not.toBe("");
      expect(message.subject.length, `subject ${index + 1}`).toBeLessThanOrEqual(200);
      expect(message.body.trim(), `body ${index + 1}`).not.toBe("");
      expect(message.body.length, `body ${index + 1}`).toBeLessThanOrEqual(5000);
    }
  });

  it("has unique exact sender and subject pairs", () => {
    const keys = SEED_MESSAGES.map((message) =>
      JSON.stringify([message.sender, message.subject]),
    );
    expect(new Set(keys).size).toBe(SEED_MESSAGES.length);
  });

  it("has finite, plausible classification times and only approved lifecycle timestamps", () => {
    const approvedOnly = SEED_MESSAGES.filter(
      (message) => message.approvedAt !== undefined && message.resolvedAt === undefined,
    );
    const approvedAndResolved = SEED_MESSAGES.filter(
      (message) => message.approvedAt !== undefined && message.resolvedAt !== undefined,
    );
    expect(approvedOnly).toHaveLength(4);
    expect(approvedAndResolved).toHaveLength(2);

    for (const message of SEED_MESSAGES) {
      expect(Number.isFinite(message.classifiedAt)).toBe(true);
      expect(message.classifiedAt).toBeGreaterThan(0);
      expect(message.classifiedAt).toBeLessThan(Date.now());
      if (message.approvedAt !== undefined) {
        expect(Number.isFinite(message.approvedAt)).toBe(true);
        expect(message.approvedAt).toBeGreaterThan(message.classifiedAt);
      }
      if (message.resolvedAt !== undefined) {
        expect(Number.isFinite(message.resolvedAt)).toBe(true);
        expect(message.resolvedAt).toBeGreaterThan(message.approvedAt!);
      }
      expect(message).not.toHaveProperty("_id");
      expect(message).not.toHaveProperty("_creationTime");
      expect(message).not.toHaveProperty("classifyingStartedAt");
      expect(message).not.toHaveProperty("failReason");
    }
  });

  it("uses both supported channels and multiple urgency levels", () => {
    expect(new Set(SEED_MESSAGES.map((message) => message.channel))).toEqual(
      new Set(["form", "webhook"]),
    );
    expect(new Set(SEED_MESSAGES.map((message) => message.urgency)).size).toBeGreaterThan(1);
  });

  it("contains the five explicitly identified Spanish fixtures and Spanish replies", () => {
    const spanishSenders = [
      "Tenant Sol-303",
      "Tenant Arroyo-827",
      "Tenant Brisa-194",
      "Tenant Nube-468",
      "Tenant Cielo-739",
    ];
    const spanishMessages = SEED_MESSAGES.filter((message) =>
      spanishSenders.includes(message.sender),
    );

    expect(spanishMessages.map((message) => message.sender).sort()).toEqual(
      [...spanishSenders].sort(),
    );
    expect(spanishMessages).toHaveLength(5);
    for (const message of spanishMessages) {
      expect(message.draftReply).toMatch(/[¿¡áéíóúñ]/i);
    }
    // Remaining language/coherence pairing is a manual content-review responsibility.
  });
});
