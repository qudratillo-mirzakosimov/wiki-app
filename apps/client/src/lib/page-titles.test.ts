import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// On React 19, react-helmet-async renders a real <title> that React hoists
// into <head>, and React only accepts a single string as its child. Children
// like `{t("Login")} - {getAppName()}` are three nodes: React leaves the title
// EMPTY, and because it sits before index.html's static <title>, the browser
// tab falls back to showing the URL. Every <title> must hold exactly one
// expression, e.g. {`${t("Login")} - ${getAppName()}`}.

const SRC = join(__dirname, "..");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === "node_modules" ? [] : tsxFiles(path);
    }
    return path.endsWith(".tsx") ? [path] : [];
  });
}

function isSingleExpression(children: string): boolean {
  const s = children.trim();
  if (!s.startsWith("{") || !s.endsWith("}")) return false;
  // Balanced braces from the first to the last character means one {...}.
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") depth++;
    if (s[i] === "}") depth--;
    if (depth === 0 && i < s.length - 1) return false;
  }
  return depth === 0;
}

describe("page titles", () => {
  it("every <title> has a single string expression as its child", () => {
    const offenders: string[] = [];
    for (const file of tsxFiles(SRC)) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/<title>([\s\S]*?)<\/title>/g)) {
        if (!isSingleExpression(m[1])) {
          offenders.push(`${relative(SRC, file)}: <title>${m[1].trim()}</title>`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
