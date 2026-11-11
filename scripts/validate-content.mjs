// Validates all content before build: lesson structure, frontmatter, Mermaid syntax,
// quiz/lab JSON shape, source and glossary references. Exits 1 on any error.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { JSDOM } from 'jsdom';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'content');
const SECTION_ORDER = ['analogy', 'architecture', 'exam-alert', 'trenches', 'interview', 'lab', 'quiz', 'references'];

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

// Mermaid needs a DOM to load; parse() itself does not render.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false });

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const sources = readJson(join(CONTENT, 'sources.json'));
const glossary = readJson(join(CONTENT, 'glossary.json'));
const modules = readJson(join(CONTENT, 'modules.json'));
const sourceIds = new Set(sources.map((s) => s.id));
const glossaryIds = new Set(glossary.map((g) => g.id));
const moduleIds = new Set(modules.map((m) => m.id));

for (const s of sources) {
  for (const k of ['id', 'title', 'url', 'type', 'accessed']) if (!s[k]) err('sources.json', `${s.id ?? '?'} missing ${k}`);
}
if (sourceIds.size !== sources.length) err('sources.json', 'duplicate ids');
if (glossaryIds.size !== glossary.length) err('glossary.json', 'duplicate ids');
for (const g of glossary) if (!g.term || !g.ro || !g.en) err('glossary.json', `${g.id} needs term, ro, en`);
for (const m of modules) {
  if (!m.title?.ro) err('modules.json', `${m.id} missing title.ro`);
  if (!Array.isArray(m.chapters) || m.chapters.length === 0) err('modules.json', `${m.id} needs chapters[]`);
  const ids = new Set();
  for (const c of m.chapters ?? []) {
    if (!c.id || ids.has(c.id)) err('modules.json', `${m.id}: chapter id missing/duplicate ${c.id}`);
    ids.add(c.id);
    if (!c.title?.ro) err('modules.json', `${m.id}/${c.id} needs title.ro`);
    if (!Array.isArray(c.exam)) err('modules.json', `${m.id}/${c.id} needs exam[]`);
  }
}
const chapterIds = new Map(modules.map((m) => [m.id, new Set((m.chapters ?? []).map((c) => c.id))]));

// Abbreviations: the first use in a lesson must be explained (expansion nearby).
const abbrs = glossary.filter((g) => g.abbr && g.expansion);
const escapeRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function checkAbbreviations(f, body) {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/^:::.*$/gm, ' ');
  for (const a of abbrs) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(a.abbr)}(?![\\p{L}\\p{N}_])`, 'u');
    const m = re.exec(text);
    if (!m) continue;
    const win = text.slice(Math.max(0, m.index - 200), m.index + a.abbr.length + 250).toLowerCase();
    if (!win.includes(a.expansion.toLowerCase())) {
      err(f, `abbreviation ${a.abbr} first used without its expansion "${a.expansion}" nearby: …${text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}…`);
    }
  }
}

const localized = (v) => v && typeof v.ro === 'string' && v.ro.length > 0;

function splitFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { data: null, body: text };
  return { data: parseYaml(m[1]) ?? {}, body: text.slice(m[0].length) };
}

let lessonCount = 0;
let diagramCount = 0;

for (const dir of readdirSync(CONTENT)) {
  const dpath = join(CONTENT, dir);
  if (!statSync(dpath).isDirectory()) continue;
  for (const file of readdirSync(dpath)) {
    const f = `${dir}/${file}`;
    const full = join(dpath, file);
    const md = /^(.+)\.(ro|en)\.md$/.exec(file);
    if (md) {
      lessonCount++;
      const [, lessonId, lang] = md;
      if (!moduleIds.has(dir)) err(f, `module "${dir}" not in modules.json`);
      else if (!chapterIds.get(dir).has(lessonId)) err(f, `lesson "${lessonId}" is not a chapter of ${dir} in modules.json`);
      const { data, body } = splitFrontmatter(readFileSync(full, 'utf8'));
      if (!data) {
        err(f, 'missing frontmatter');
        continue;
      }
      // origin: alex = Alex's own chapter, imported unchanged: only the platform format is checked.
      const alex = data.origin === 'alex';
      for (const k of ['title', 'summary', 'order']) if (data[k] === undefined) err(f, `frontmatter missing ${k}`);
      if (!alex && lang === 'ro' && !data.examSummaryEn) err(f, 'RO lesson needs examSummaryEn');
      for (const id of data.sources ?? []) if (!sourceIds.has(id)) err(f, `unknown source ${id}`);
      for (const id of data.glossaryTerms ?? []) if (!glossaryIds.has(id)) err(f, `unknown glossary term ${id}`);
      for (const m of body.matchAll(/\[(S\d{2,})\]/g)) if (!sourceIds.has(m[1])) err(f, `inline citation ${m[1]} not in sources.json`);
      if (!alex && data.status !== 'test' && (data.sources ?? []).length < 10) err(f, `needs >= 10 sources (has ${(data.sources ?? []).length})`);
      if (lang === 'en' && !existsSync(join(dpath, `${lessonId}.ro.md`))) err(f, 'EN lesson without RO original');

      if (!alex) checkAbbreviations(f, body);

      // Section structure: exactly the 8 container directives, in order (outside code fences).
      const noCode = body.replace(/```[\s\S]*?```/g, '');
      const found = [...noCode.matchAll(/^:::([a-z-]+)\s*$/gm)].map((m) => m[1]);
      const inOrder = found.every((s, i) => SECTION_ORDER.includes(s) && (i === 0 || SECTION_ORDER.indexOf(s) > SECTION_ORDER.indexOf(found[i - 1])));
      if (alex ? !inOrder || found.length === 0 : JSON.stringify(found) !== JSON.stringify(SECTION_ORDER)) {
        err(f, `sections must be exactly [${SECTION_ORDER.join(', ')}], found [${found.join(', ')}]`);
      }

      // Mermaid: at least 2 in architecture, all must parse.
      const blocks = [...body.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
      const arch = /:::architecture\n([\s\S]*?)\n:::\s*$/m.exec(body)?.[1] ?? '';
      const archDiagrams = (arch.match(/```mermaid/g) ?? []).length;
      if (!alex && archDiagrams < 2) err(f, `architecture needs >= 2 Mermaid diagrams (has ${archDiagrams})`);
      for (const [i, code] of blocks.entries()) {
        diagramCount++;
        try {
          await mermaid.parse(code);
        } catch (e) {
          err(f, `Mermaid diagram #${i + 1} invalid: ${String(e.message ?? e).split('\n').slice(0, 3).join(' ')}`);
        }
      }
      continue;
    }

    const js = /^(.+)\.(lab|quiz)\.json$/.exec(file);
    if (js) {
      let data;
      try {
        data = readJson(full);
      } catch (e) {
        err(f, `invalid JSON: ${e.message}`);
        continue;
      }
      if (!existsSync(join(dpath, `${js[1]}.ro.md`))) err(f, 'no matching .ro.md lesson');
      if (js[2] === 'lab') {
        if (!Array.isArray(data.steps) || data.steps.length === 0) err(f, 'steps[] required');
        const ids = new Set();
        for (const s of data.steps ?? []) {
          if (!s.id || ids.has(s.id)) err(f, `step id missing/duplicate: ${s.id}`);
          ids.add(s.id);
          for (const k of ['title', 'action']) if (!localized(s[k])) err(f, `step ${s.id} needs ${k}.ro`);
        }
      } else {
        const qs = data.questions ?? [];
        if (qs.length !== 5) err(f, `quiz needs exactly 5 questions (has ${qs.length})`);
        const ids = new Set();
        for (const q of qs) {
          if (!q.id || ids.has(q.id)) err(f, `question id missing/duplicate: ${q.id}`);
          ids.add(q.id);
          if (!localized(q.question)) err(f, `${q.id} needs question.ro`);
          if (q.options?.length !== 4) err(f, `${q.id} needs 4 options`);
          if ((q.options ?? []).filter((o) => o.correct).length !== 1) err(f, `${q.id} needs exactly 1 correct option`);
          for (const [i, o] of (q.options ?? []).entries()) {
            if (!localized(o.text)) err(f, `${q.id} option ${i} needs text.ro`);
            if (o.correct && !localized(o.explanation)) err(f, `${q.id} correct option ${i} needs explanation.ro`);
            if (o.explanation && !localized(o.explanation)) err(f, `${q.id} option ${i} explanation needs .ro`);
          }
        }
      }
      continue;
    }
    if (!['sources.json', 'glossary.json', 'modules.json'].includes(file)) warn(f, 'unrecognized file');
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`validate-content: ${lessonCount} lesson files, ${diagramCount} Mermaid diagrams, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
