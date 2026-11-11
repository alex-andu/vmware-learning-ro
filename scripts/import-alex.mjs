// Imports Alex's chapter files into the platform, without changing the text.
//
//   node scripts/import-alex.mjs <folder>
//
// <folder> holds cuprins.md (the table of contents) and capitolul_X_Y_*.md files.
// - cuprins.md            -> content/modules.json (Piloni = modules, Capitole = chapters)
// - capitolul_X_Y_*.md    -> content/pilon-X/<chapter>.ro.md + .quiz.json + .lab.json
//
// The lesson text is Alex's own. The script only moves it into the platform's sections
// (:::analogy, :::architecture, ...), splits out the quiz and lab steps, and tags Mermaid
// fences that were written without the `mermaid` language.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'content');
const SRC = process.argv[2];
if (!SRC || !existsSync(SRC)) {
  console.error('usage: node scripts/import-alex.mjs <folder with cuprins.md and capitolul_*.md>');
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const read = (p) => readFileSync(p, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

const slug = (s, words = 6) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, words)
    .join('-');

const plain = (s) =>
  s
    .replace(/\$\\text\{([^}]*)\}\$/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// ---------- 1. cuprins.md -> modules.json ----------
const modulesPath = join(CONTENT, 'modules.json');
let modules = existsSync(modulesPath) ? JSON.parse(read(modulesPath)) : [];
if (existsSync(join(SRC, 'cuprins.md'))) {
  const lines = read(join(SRC, 'cuprins.md')).split('\n');
  modules = [];
  let mod = null;
  let chap = null;
  for (const line of lines) {
    let m;
    if ((m = /^##\s+PILONUL\s+(\d+):\s*(.+)$/.exec(line))) {
      mod = {
        id: `pilon-${m[1]}`,
        order: Number(m[1]),
        title: { ro: `Pilonul ${m[1]}: ${m[2].trim()}` },
        chapters: [],
      };
      modules.push(mod);
      chap = null;
    } else if (mod && (m = /^_Obiectiv:\s*(.+?)_\s*$/.exec(line))) {
      mod.target = { ro: m[1].trim() };
    } else if (mod && (m = /^###\s+Capitolul\s+(\d+)\.(\d+):\s*(.+)$/.exec(line))) {
      const title = m[3].trim();
      chap = { id: `${m[1]}-${m[2]}-${slug(title)}`, number: `${m[1]}.${m[2]}`, title: { ro: title }, exam: [], topics: [] };
      mod.chapters.push(chap);
    } else if (chap && (m = /^-\s+\*\*(\d+\.\d+\.\d+)\.\*\*\s*(.+)$/.exec(line))) {
      chap.topics.push(`${m[1]} ${plain(m[2])}`);
    } else if (/^###\s/.test(line)) {
      chap = null; // e.g. "Cum procedăm acum?" closes the last chapter
    }
  }
  writeFileSync(modulesPath, JSON.stringify(modules, null, 2) + '\n');
  console.log(`modules.json: ${modules.length} piloni, ${modules.reduce((n, m) => n + m.chapters.length, 0)} capitole`);
}
const chapterByNumber = new Map(modules.flatMap((m) => m.chapters.map((c) => [c.number, { mod: m, chap: c }])));

// ---------- 2. capitolul_X_Y_*.md -> lessons ----------
const MERMAID_START = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|mindmap|timeline|journey|gitGraph|quadrantChart|block-beta|xychart-beta)\b/;

function tagMermaid(md) {
  return md.replace(/^```[ \t]*\n([\s\S]*?)^```[ \t]*$/gm, (all, code) => {
    const first = code.split('\n').find((l) => l.trim()) ?? '';
    return MERMAID_START.test(first.trim()) ? '```mermaid\n' + code + '```' : all;
  });
}

/** Splits markdown into blocks at lines matching `re`, ignoring lines inside code fences. */
function splitAt(md, re) {
  const out = [];
  let cur = { head: null, lines: [] };
  let fence = false;
  for (const line of md.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    const m = !fence && re.exec(line);
    if (m) {
      out.push(cur);
      cur = { head: m, lines: [] };
    } else cur.lines.push(line);
  }
  out.push(cur);
  return out.map((b) => ({ head: b.head, body: b.lines.join('\n') }));
}

const trimRules = (s) => s.replace(/^(\s*---\s*\n)+/, '').replace(/(\n\s*---\s*)+\s*$/, '').trim();

function dedent(s) {
  const lines = s.split('\n');
  const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)[0].length));
  return lines.map((l) => l.slice(Number.isFinite(ind) ? ind : 0)).join('\n');
}

function parseQuiz(body, file) {
  const [questionsPart, answersPart = ''] = body.split(/^###\s+Răspunsuri.*$/m);
  const qs = splitAt(questionsPart, /^###\s+Întrebarea\s+(\d+)/).filter((b) => b.head);
  const answers = new Map();
  for (const b of splitAt(answersPart, /^(\d+)\.\s+\*\*Răspuns(?:ul)? Corect:\s*([A-D])\b(.*)$/).filter((b) => b.head)) {
    const summary = b.head[3].replace(/\*\*\s*$/, '').trim();
    const expl = dedent(trimRules(b.body));
    answers.set(b.head[1], { letter: b.head[2], text: [`**Răspuns corect: ${b.head[2]}${summary ? ' ' + summary : ''}**`, expl].filter(Boolean).join('\n\n') });
  }
  return {
    questions: qs.map((b) => {
      const n = b.head[1];
      const parts = splitAt(b.body, /^\s*[*-]\s+\*\*([A-D])[.)]\*\*\s*(.*)$/);
      const question = trimRules(parts[0].body);
      const opts = parts.filter((p) => p.head).map((p) => ({ letter: p.head[1], text: [p.head[2], trimRules(p.body)].filter(Boolean).join('\n') }));
      const ans = answers.get(n);
      if (!ans) throw new Error(`${file}: no answer for question ${n}`);
      return {
        id: `q${n}`,
        question: { ro: question },
        options: opts.map((o) => ({
          text: { ro: o.text },
          correct: o.letter === ans.letter,
          // Alex explains the correct answer; the app shows it next to the correct option.
          ...(o.letter === ans.letter ? { explanation: { ro: ans.text } } : {}),
        })),
      };
    }),
  };
}

function parseLab(body) {
  const blocks = splitAt(body, /^###\s+Pasul\s+(\d+):\s*(.+)$/);
  const intro = trimRules(blocks[0].body);
  const steps = blocks
    .filter((b) => b.head)
    .map((b) => ({ id: `pas-${b.head[1]}`, title: { ro: b.head[2].trim() }, action: { ro: trimRules(b.body) } }));
  return { intro, steps };
}

const SECTION_OF = [
  [/INTRODUCEREA/i, 'analogy'],
  [/ARHITECTUR/i, 'architecture'],
  [/CUTIA CU SECRETE/i, 'exam-alert'],
  [/INTERVIU/i, 'interview'],
  [/LABORATOR/i, 'lab'],
  [/QUIZ/i, 'quiz'],
  [/BIBLIOGRAFIE/i, 'references'],
];

let imported = 0;
for (const file of readdirSync(SRC).sort()) {
  const fm = /^capitolul_(\d+)_(\d+)_.*\.md$/.exec(file);
  if (!fm) continue;
  const num = `${fm[1]}.${fm[2]}`;
  const target = chapterByNumber.get(num);
  if (!target) {
    console.error(`skip ${file}: chapter ${num} is not in cuprins.md`);
    continue;
  }
  const raw = tagMermaid(read(join(SRC, file)));
  const blocks = splitAt(raw, /^##\s+(\d+)\.\s+(.+)$/);
  const header = blocks[0].body;
  const titleMatch = /^##\s+Capitolul\s+\d+\.\d+:\s*(.+)$/m.exec(header);
  const title = `${num} ${plain(titleMatch ? titleMatch[1] : target.chap.title.ro)}`;
  const preface = trimRules(header.replace(/^#{1,2}\s.*$/gm, ''));
  const objective = /\*\*Obiectivul Capitolului:\*\*\s*([^\n]+)/.exec(header)?.[1] ?? '';
  let summary = plain(objective);
  if (summary.length > 260) summary = summary.slice(0, 260).replace(/\s+\S*$/, '') + '…';

  const sections = {};
  const parts = {};
  let quiz = null;
  let lab = null;
  for (const b of blocks.filter((x) => x.head)) {
    const type = SECTION_OF.find(([re]) => re.test(b.head[2]))?.[1];
    if (!type) throw new Error(`${file}: unknown section "${b.head[2]}"`);
    let body = trimRules(b.body);
    if (type === 'quiz') {
      quiz = parseQuiz(body, file);
      body = '';
    } else if (type === 'lab') {
      lab = parseLab(body);
      body = lab.intro;
    }
    if (type === 'exam-alert') {
      const [exam, trenches] = body.split(/^(?=###\s+Din Tranșee)/m);
      sections['exam-alert'] = trimRules(exam);
      if (trenches) sections.trenches = trimRules(trenches);
      continue;
    }
    // A chapter can spread one part over several "##" headings (e.g. Arhitectură partea I și II).
    (parts[type] ??= []).push({ title: b.head[2].trim(), body });
  }
  for (const [type, list] of Object.entries(parts)) {
    sections[type] = list.length === 1 ? list[0].body : list.map((p) => `### ${p.title}\n\n${p.body}`).join('\n\n');
  }

  const order = ['analogy', 'architecture', 'exam-alert', 'trenches', 'interview', 'lab', 'quiz', 'references'];
  const bodyOut = order
    .filter((t) => t in sections)
    .map((t) => `:::${t}\n${sections[t]}\n:::`)
    .join('\n\n');

  const yamlStr = (s) => JSON.stringify(s);
  const front = [
    '---',
    `title: ${yamlStr(title)}`,
    `summary: ${yamlStr(summary)}`,
    `order: ${Number(fm[2])}`,
    'origin: alex',
    `updated: ${yamlStr(today)}`,
    '---',
  ].join('\n');

  const dir = join(CONTENT, target.mod.id);
  mkdirSync(dir, { recursive: true });
  const base = join(dir, target.chap.id);
  writeFileSync(`${base}.ro.md`, `${front}\n\n${preface}\n\n${bodyOut}\n`);
  if (quiz) writeFileSync(`${base}.quiz.json`, JSON.stringify(quiz, null, 2) + '\n');
  if (lab?.steps.length) writeFileSync(`${base}.lab.json`, JSON.stringify({ steps: lab.steps }, null, 2) + '\n');
  imported++;
  console.log(`${file} -> ${target.mod.id}/${target.chap.id} (${Object.keys(sections).join(', ')}; quiz ${quiz?.questions.length ?? 0}, lab ${lab?.steps.length ?? 0})`);
}
console.log(`imported ${imported} chapter(s)`);
