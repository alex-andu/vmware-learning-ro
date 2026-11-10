import { visit, SKIP } from 'unist-util-visit';
import type { GlossaryEntry } from './types';

export const SECTION_ORDER = [
  'analogy',
  'architecture',
  'exam-alert',
  'trenches',
  'interview',
  'lab',
  'quiz',
  'references',
] as const;
export type SectionType = (typeof SECTION_ORDER)[number];

/* Minimal mdast typing, enough for our two plugins. */
interface MdNode {
  type: string;
  name?: string;
  value?: string;
  url?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

/** Turns `:::analogy … :::` container directives into <section data-section="analogy">. */
export function remarkSections() {
  return (tree: MdNode) => {
    visit(tree as never, (node: MdNode) => {
      if (node.type === 'containerDirective' && node.name) {
        node.data = { ...(node.data ?? {}), hName: 'section', hProperties: { 'data-section': node.name } };
      } else if (node.type === 'leafDirective' || node.type === 'textDirective') {
        // Unknown inline directives (e.g. "10:30") are restored as plain text.
        const text = (node.type === 'textDirective' ? ':' : '::') + (node.name ?? '');
        node.type = 'text';
        node.value = text;
        delete node.children;
      }
    });
  };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Links the first occurrence of each glossary term in a lesson to /glossary#id. */
export function remarkGlossaryLinks(entries: GlossaryEntry[]) {
  const terms = entries
    .flatMap((e) => [e.term, ...(e.aliases ?? [])].map((t) => ({ t, id: e.id })))
    .sort((a, b) => b.t.length - a.t.length);
  if (terms.length === 0) return () => () => undefined;
  const byLower = new Map(terms.map((x) => [x.t.toLowerCase(), x.id]));
  const re = new RegExp(`(?<![\\p{L}\\p{N}_-])(${terms.map((x) => escapeRe(x.t)).join('|')})(?![\\p{L}\\p{N}_-])`, 'giu');

  return () => (tree: MdNode) => {
    const seen = new Set<string>();
    visit(tree as never, (node: MdNode, index: number | undefined, parent: MdNode | undefined) => {
      if (['link', 'code', 'inlineCode', 'heading', 'definition'].includes(node.type)) return SKIP;
      if (node.type !== 'text' || !parent || index === undefined || !node.value) return;
      const value = node.value;
      const out: MdNode[] = [];
      let last = 0;
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(value))) {
        const id = byLower.get(m[1].toLowerCase());
        if (!id || seen.has(id)) continue;
        seen.add(id);
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
        out.push({
          type: 'link',
          url: `/glossary#${id}`,
          children: [{ type: 'text', value: m[1] }],
          data: { hProperties: { className: 'glossary-link', title: id } },
        });
        last = m.index + m[1].length;
      }
      if (out.length === 0) return;
      if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
      parent.children!.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}
