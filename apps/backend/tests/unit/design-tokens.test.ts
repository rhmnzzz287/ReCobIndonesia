import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const GENERATOR = join(ROOT, "scripts", "export-design-tokens.mjs");
const THEME = join(ROOT, "apps", "web", "styles", "theme.css");

describe("generator token desain", () => {
  it("menghasilkan berkas yang identik saat dijalankan ulang", () => {
    execFileSync("node", [GENERATOR], { cwd: ROOT });
    const first = readFileSync(THEME, "utf8");
    execFileSync("node", [GENERATOR], { cwd: ROOT });
    const second = readFileSync(THEME, "utf8");
    expect(second).toBe(first);
  });

  it("memuat seluruh warna DESIGN.md ke dalam @theme", () => {
    const css = readFileSync(THEME, "utf8");
    for (const line of [
      "--color-surface: #ffffff;",
      "--color-cream: #fff8ee;",
      "--color-primary: #0b6e3b;",
      "--color-primary-strong: #084f2a;",
      "--color-accent: #7dbe35;",
      "--color-corn: #edc22e;",
      "--color-tan: #d9c89a;",
      "--color-ink: #0d1216;",
      "--color-ink-deep: #123326;",
      "--color-border: #ddebd2;",
      "--color-amber-soft: #fff3d1;",
      "--color-amber-ink: #7a5c12;",
    ]) {
      expect(css).toContain(line);
    }
  });

  it("membuat kelas komposit untuk setiap token tipografi", () => {
    const css = readFileSync(THEME, "utf8");
    for (const name of [
      "display-xl",
      "h1",
      "h2",
      "h3",
      "body-lg",
      "body-md",
      "body-sm",
      "label-md",
      "caption",
      "metric-lg",
      "metric-md",
      "mono-data",
    ]) {
      expect(css).toContain(`.type-${name} {`);
    }
    expect(css).toMatch(/\.type-metric-md \{[\s\S]*?font-feature-settings: "tnum";/);
  });

  it("meloloskan mode --check pada keadaan bersih", () => {
    expect(() => execFileSync("node", [GENERATOR, "--check"], { cwd: ROOT })).not.toThrow();
  });
});
