import { describe, expect, it } from "vitest";
import type { Doc } from "../convex/_generated/dataModel";
import { SEED_MESSAGES } from "../convex/lib/seed_data";
import { seedMessages } from "../convex/seed";

const runSeed = seedMessages as unknown as {
  _handler: (ctx: unknown, args: Record<string, never>) => Promise<{ inserted: number; skipped: number }>;
};

type Message = Omit<Doc<"messages">, "_id" | "_creationTime">;

type Query = {
  filter: (predicate: (q: QueryBuilder) => unknown) => Query;
  take: (count: number) => Promise<Message[]>;
};
type QueryBuilder = {
  field: (name: string) => string;
  eq: (field: string, value: unknown) => unknown;
  and: (...conditions: unknown[]) => unknown;
};

function makeContext(initial: Message[] = []) {
  const messages = [...initial];
  const touchedTables: string[] = [];
  const takeLimits: number[] = [];
  const filterFields: string[][] = [];
  let filtersBeforeTake = false;
  const db = {
    query(table: string): Query {
      touchedTables.push(`query:${table}`);
      let predicates: unknown[] = [];
      return {
        filter(predicate) {
          const fields: string[] = [];
          const builder: QueryBuilder = {
            field: (name) => name,
            eq: (field, value) => {
              fields.push(field);
              return (message: Message) => message[field as keyof Message] === value;
            },
            and: (...conditions) => (message: Message) =>
              conditions.every((condition) =>
                (condition as (value: Message) => boolean)(message),
              ),
          };
          predicates = [predicate(builder)];
          filterFields.push(fields);
          return this;
        },
        async take(count) {
          filtersBeforeTake = predicates.length > 0;
          takeLimits.push(count);
          return messages.filter((message) => predicates.every((p) => (p as (m: Message) => boolean)(message))).slice(0, count);
        },
      };
    },
    async insert(table: string, value: Message) {
      touchedTables.push(`insert:${table}`);
      messages.push(value);
      return `messages:${messages.length}`;
    },
  };
  return { ctx: { db }, messages, touchedTables, takeLimits, filterFields, get filtersBeforeTake() { return filtersBeforeTake; } };
}

async function seed(context: ReturnType<typeof makeContext>) {
  return runSeed._handler(context.ctx, {});
}

describe("seedMessages", () => {
  it("inserts all 30 fixtures into an empty baseline and is idempotent", async () => {
    const context = makeContext();
    expect(await seed(context)).toEqual({ inserted: 30, skipped: 0 });
    expect(context.messages).toEqual(SEED_MESSAGES);
    expect(await seed(context)).toEqual({ inserted: 0, skipped: 30 });
    expect(context.messages).toHaveLength(30);
  });

  it("preserves every pre-existing message field and seeds unrelated baselines", async () => {
    const existing = { ...SEED_MESSAGES[0], sender: "Existing sender", subject: "Existing subject" } as Message;
    const context = makeContext([existing]);
    const before = structuredClone(context.messages);
    expect(await seed(context)).toEqual({ inserted: 30, skipped: 0 });
    expect(context.messages[0]).toEqual(before[0]);
    expect(context.messages).toHaveLength(31);
  });

  it("skips only an exact sender and subject match, regardless of other content", async () => {
    const exactPair = { ...SEED_MESSAGES[0], body: "different body", status: "new" as const } as Message;
    const context = makeContext([exactPair]);
    expect(await seed(context)).toEqual({ inserted: 29, skipped: 1 });
    expect(context.messages[0]).toEqual(exactPair);
  });

  it("does not skip on sender-only or subject-only matches", async () => {
    const sameSender = { ...SEED_MESSAGES[0], subject: "Different subject" } as Message;
    const sameSubject = { ...SEED_MESSAGES[1], sender: SEED_MESSAGES[0].sender } as Message;
    const context = makeContext([sameSender, sameSubject]);
    expect(await seed(context)).toEqual({ inserted: 30, skipped: 0 });
  });

  it("filters both fields before taking one row and touches only messages", async () => {
    const context = makeContext();
    await seed(context);
    expect(context.filtersBeforeTake).toBe(true);
    expect(context.filterFields.every((fields) => fields.sort().join(",") === "sender,subject")).toBe(true);
    expect(context.takeLimits.every((limit) => limit === 1)).toBe(true);
    expect(new Set(context.touchedTables)).toEqual(new Set(["query:messages", "insert:messages"]));
  });
});
