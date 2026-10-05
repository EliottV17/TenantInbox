import { describe, expect, it, vi } from "vitest";
import { handleClassificationResponse } from "../convex/classify";

describe("handleClassificationResponse", () => {
  it("fails a length-finished response before parsing content or saving", async () => {
    const markFailed = vi.fn();
    const saveResult = vi.fn();

    await handleClassificationResponse(
      { finish_reason: "length", message: { content: "not complete JSON" } },
      { markFailed, saveResult },
    );

    expect(markFailed).toHaveBeenCalledWith(
      "Model response was truncated by the token limit",
    );
    expect(saveResult).not.toHaveBeenCalled();
  });

  it.each(["content_filter", "tool_calls", null])(
    "fails non-stop finish reason %s without saving",
    async (finish_reason) => {
      const markFailed = vi.fn();
      const saveResult = vi.fn();

      await handleClassificationResponse(
        {
          finish_reason,
          message: {
            content: JSON.stringify({
              category: "maintenance",
              urgency: "medium",
              summary: "Broken dishwasher.",
              draftReply: "We will arrange a repair.",
            }),
          },
        },
        { markFailed, saveResult },
      );

      expect(markFailed).toHaveBeenCalledWith(expect.any(String));
      expect(markFailed.mock.calls[0][0]).not.toBe("");
      expect(saveResult).not.toHaveBeenCalled();
    },
  );

  it("saves a valid response that finished with stop", async () => {
    const markFailed = vi.fn();
    const saveResult = vi.fn();
    const classification = {
      category: "maintenance",
      urgency: "medium",
      summary: "Broken dishwasher.",
      draftReply: "We will arrange a repair.",
    };

    await handleClassificationResponse(
      { finish_reason: "stop", message: { content: JSON.stringify(classification) } },
      { markFailed, saveResult },
    );

    expect(markFailed).not.toHaveBeenCalled();
    expect(saveResult).toHaveBeenCalledWith(classification);
  });
});
