import MiniSearch from 'minisearch';
import { getLesson, glossary, lessonKeys } from './content';
import type { Lang } from './types';

export interface SearchDoc {
  id: string;
  kind: 'lesson' | 'glossary';
  title: string;
  text: string;
  href: string;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^:::.*$/gm, ' ')
    .replace(/[#>*_`|[\]()-]/g, ' ')
    .replace(/\s+/g, ' ');
}

const cache = new Map<Lang, { index: MiniSearch<SearchDoc>; docs: Map<string, SearchDoc> }>();

function build(lang: Lang) {
  const docs: SearchDoc[] = [];
  for (const { key } of lessonKeys()) {
    const l = getLesson(key, lang);
    if (!l) continue;
    docs.push({
      id: `lesson:${key}`,
      kind: 'lesson',
      title: l.doc.meta.title,
      text: `${l.doc.meta.summary ?? ''} ${stripMarkdown(l.doc.body)} ${l.doc.meta.examSummaryEn ?? ''}`,
      href: `/lesson/${key}`,
    });
  }
  for (const g of glossary) {
    docs.push({
      id: `glossary:${g.id}`,
      kind: 'glossary',
      title: g.term,
      text: `${g.expansion ?? ''} ${(g.aliases ?? []).join(' ')} ${g.ro} ${g.en}`,
      href: `/glossary#${g.id}`,
    });
  }
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'text'],
    storeFields: ['id'],
    searchOptions: { boost: { title: 3 }, prefix: true, fuzzy: 0.2 },
    processTerm: (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(),
  });
  index.addAll(docs);
  return { index, docs: new Map(docs.map((d) => [d.id, d])) };
}

export function search(query: string, lang: Lang): (SearchDoc & { snippet: string })[] {
  if (!query.trim()) return [];
  let entry = cache.get(lang);
  if (!entry) {
    entry = build(lang);
    cache.set(lang, entry);
  }
  const { index, docs } = entry;
  return index.search(query).slice(0, 30).map((r) => {
    const d = docs.get(r.id as string)!;
    const term = r.terms[0] ?? '';
    const norm = d.text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const pos = Math.max(0, norm.indexOf(term));
    const snippet = (pos > 60 ? '…' : '') + d.text.slice(Math.max(0, pos - 60), pos + 140).trim() + '…';
    return { ...d, snippet };
  });
}
