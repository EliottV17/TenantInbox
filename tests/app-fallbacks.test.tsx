// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorFallback from "../src/app/error";
import NotFound from "../src/app/not-found";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    createElement("a", { href, ...props }, children),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

function render(element: React.ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(createElement("div", null, element)));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("app-level fallback pages", () => {
  it("shows a not-found heading and a link back to the inbox", () => {
    render(createElement(NotFound));

    expect(container.querySelector("h1")?.textContent).toBe("Page not found");
    const inboxLink = container.querySelector<HTMLAnchorElement>('a[href="/inbox"]');
    expect(inboxLink?.textContent).toBe("Back to inbox");
  });

  it("shows a generic error, retries via reset, and does not expose the error message", () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("Sensitive server detail"), { digest: "fictional-digest" });
    render(createElement(ErrorFallback, { error, reset }));

    expect(container.querySelector("h1")?.textContent).toBe("Something went wrong");
    expect(container.textContent).toContain("Please try again or return to your inbox.");
    expect(container.textContent).not.toContain(error.message);

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Try again",
    );
    expect(retryButton).toBeDefined();
    act(() => retryButton!.click());
    expect(reset).toHaveBeenCalledOnce();

    const inboxLink = container.querySelector<HTMLAnchorElement>('a[href="/inbox"]');
    expect(inboxLink?.textContent).toBe("Back to inbox");
  });
});
