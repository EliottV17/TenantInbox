// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MessageForm } from "../src/components/message-form";

const { createMessage } = vi.hoisted(() => ({ createMessage: vi.fn() }));

vi.mock("convex/react", () => ({
  useMutation: () => createMessage,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

function renderForm() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(createElement(MessageForm)));
}

function getInput(id: string) {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  expect(input).not.toBeNull();
  return input!;
}

function changeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function fillForm(values = { sender: "  Unit 4B  ", subject: "  Leaky faucet  ", body: "  Please take a look.  " }) {
  changeValue(getInput("sender"), values.sender);
  changeValue(getInput("subject"), values.subject);
  const body = container.querySelector<HTMLTextAreaElement>("#body");
  expect(body).not.toBeNull();
  changeValue(body!, values.body);
}

async function submitForm() {
  const form = container.querySelector("form");
  expect(form).not.toBeNull();
  await act(async () => {
    form!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  createMessage.mockReset();
  createMessage.mockResolvedValue({ messageId: "fictional-message-id" });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("MessageForm and submission", () => {
  it("shows the form immediately without a New message disclosure control", () => {
    renderForm();

    expect(
      Array.from(container.querySelectorAll("button")).some(
        (button) => button.textContent?.trim() === "New message",
      ),
    ).toBe(false);
    expect(getInput("sender").isConnected).toBe(true);
    expect(getInput("subject").isConnected).toBe(true);
    expect(container.querySelector<HTMLTextAreaElement>("#body")).not.toBeNull();
    expect(container.querySelector<HTMLDivElement>("#new-message-form")?.hidden).toBe(false);
    expect(container.querySelector("form")?.hidden).toBe(false);
  });

  it("shows existing validation errors without calling the mutation", async () => {
    renderForm();

    await submitForm();

    expect(createMessage).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Sender is required.");
    expect(container.textContent).toContain("Subject is required.");
    expect(container.textContent).toContain("Body is required.");
  });

  it("submits trimmed values, protects the pending request, then clears only on success", async () => {
    renderForm();
    fillForm();
    let resolveMutation!: (value: unknown) => void;
    createMessage.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutation = resolve;
      }),
    );

    await submitForm();

    expect(createMessage).toHaveBeenCalledWith({
      sender: "Unit 4B",
      subject: "Leaky faucet",
      body: "Please take a look.",
    });
    expect(container.textContent).toContain("Sending...");
    expect(createMessage).toHaveBeenCalledTimes(1);

    await act(async () => resolveMutation({ messageId: "fictional-message-id" }));

    expect(getInput("sender").value).toBe("");
    expect(getInput("subject").value).toBe("");
    expect(container.querySelector<HTMLTextAreaElement>("#body")?.value).toBe("");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Message sent successfully");
  });

  it("retains inputs after server failure and permits a successful retry", async () => {
    renderForm();
    fillForm();
    createMessage
      .mockRejectedValueOnce(new Error("Temporary fictional failure"))
      .mockResolvedValueOnce({ messageId: "fictional-message-id" });

    await submitForm();

    expect(container.querySelector('[role="alert"]')?.textContent).toBe("Temporary fictional failure");
    expect(getInput("sender").value).toBe("  Unit 4B  ");
    expect(getInput("subject").value).toBe("  Leaky faucet  ");
    expect(container.querySelector<HTMLTextAreaElement>("#body")?.value).toBe("  Please take a look.  ");

    await submitForm();

    expect(createMessage).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(getInput("sender").value).toBe("");
  });
});
