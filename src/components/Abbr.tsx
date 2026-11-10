import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { abbreviations } from '../lib/content';
import { useStore } from '../lib/storage';
import type { GlossaryEntry } from '../lib/types';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const byAbbr = new Map(abbreviations.map((a) => [a.abbr!, a]));
const RE = new RegExp(
  `(?<![\\p{L}\\p{N}_])(${abbreviations
    .map((a) => a.abbr!)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join('|')})(?![\\p{L}\\p{N}_])`,
  'gu',
);

/** Abbreviations found in the given texts, in first-seen order. */
export function findAbbreviations(texts: string[]): GlossaryEntry[] {
  const seen = new Map<string, GlossaryEntry>();
  for (const t of texts) for (const m of t.matchAll(RE)) if (!seen.has(m[1])) seen.set(m[1], byAbbr.get(m[1])!);
  return [...seen.values()];
}

/** Renders text with every known abbreviation wrapped in <abbr title="expansion">. */
export function AbbrText({ text }: { text: string }) {
  const parts: (string | GlossaryEntry)[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    parts.push(byAbbr.get(m[1])!);
    last = m.index! + m[1].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <abbr key={i} title={p.expansion} className="cursor-help underline decoration-dotted underline-offset-2">
            {p.abbr}
          </abbr>
        ),
      )}
    </>
  );
}

/** Table of the abbreviations used on a page, with expansion and short explanation. */
export function AbbrLegend({ entries, title }: { entries: GlossaryEntry[]; title: string }) {
  const { state } = useStore();
  if (entries.length === 0) return null;
  const sorted = entries.slice().sort((a, b) => a.abbr!.localeCompare(b.abbr!));
  return (
    <section className="card my-8" data-testid="abbr-legend">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
        {sorted.map((a) => (
          <div key={a.id} className="contents">
            <dt className="font-semibold">
              <Link to={`/glossary#${a.id}`} className="text-[var(--accent)]">
                {a.abbr}
              </Link>
            </dt>
            <dd>
              <span className="font-medium">{a.expansion}</span>
              <span className="text-[var(--muted)]"> — {state.lang === 'en' ? a.en : a.ro}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
