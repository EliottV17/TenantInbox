import { describe, expect, it } from "vitest";
import {
  clearInboxFilters,
  parseInboxFilters,
  updateInboxFilter,
} from "../src/lib/inbox-filters";

describe("inbox URL filters", () => {
  it("accepts only existing category and urgency values", () => {
    expect(parseInboxFilters(new URLSearchParams("category=damage&urgency=high"))).toEqual({
      category: "damage",
      urgency: "high",
    });
    expect(parseInboxFilters(new URLSearchParams("category=unknown&urgency=urgent"))).toEqual({});
    expect(parseInboxFilters(new URLSearchParams("category=&urgency="))).toEqual({});
  });

  it("updates and clears filters while preserving unrelated parameters", () => {
    const current = new URLSearchParams("page=2&category=billing&urgency=low");
    expect(updateInboxFilter(current, "category", "maintenance").toString()).toBe(
      "page=2&category=maintenance&urgency=low",
    );
    expect(updateInboxFilter(current, "urgency", "all").toString()).toBe(
      "page=2&category=billing",
    );
    expect(clearInboxFilters(current).toString()).toBe("page=2");
    expect(current.toString()).toBe("page=2&category=billing&urgency=low");
  });

  it("ignores invalid values when updating", () => {
    expect(updateInboxFilter(new URLSearchParams("keep=yes"), "category", "bogus").toString())
      .toBe("keep=yes");
  });
});
