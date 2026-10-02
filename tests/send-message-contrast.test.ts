import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync("src/app/globals.css", "utf8");
const buttonSource = readFileSync("src/components/ui/button.tsx", "utf8");
const formSource = readFileSync("src/components/message-form.tsx", "utf8");

function darkToken(name: string): number {
  const darkBlock = globalsCss.match(/\.dark\s*\{([^}]+)\}/)?.[1];
  expect(darkBlock, "dark theme token block should exist").toBeDefined();
  const match = darkBlock!.match(
    new RegExp(`--${name}:\\s*oklch\\(([\\d.]+)\\s+0\\s+0\\)`),
  );
  expect(match, `${name} should be a zero-chroma OKLCH token`).toBeTruthy();
  // For neutral OKLCH, relative luminance equals L cubed.
  return Number(match![1]) ** 3;
}

function contrastRatio(first: number, second: number): number {
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("dark Send Message button contrast contract", () => {
  it("keeps dark primary and foreground tokens at WCAG AA normal-text contrast", () => {
    expect(
      contrastRatio(darkToken("primary"), darkToken("primary-foreground")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("uses the theme default button without a form-level color override", () => {
    expect(buttonSource).toMatch(/default:\s*["']bg-primary text-primary-foreground hover:bg-primary\/80["']/);
    expect(formSource).toMatch(/<Button\s+type="submit"\s+disabled=\{isSubmitting\}\s+className="w-full sm:w-auto"/);
    expect(formSource).not.toMatch(/<Button[\s\S]*?\b(?:bg|text)-(?:primary|foreground|black|white|\[#)/);
  });
});
