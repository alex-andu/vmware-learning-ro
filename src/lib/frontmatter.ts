import { parse } from 'yaml';

/** Splits a Markdown file into YAML frontmatter and body. Shared with scripts/validate-content.mjs logic. */
export function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = (parse(m[1]) ?? {}) as Record<string, unknown>;
  return { data, body: text.slice(m[0].length) };
}
