import { splitFrontmatter } from './frontmatter';
import type {
  GlossaryEntry,
  LabChecklist,
  Lang,
  LessonDoc,
  LessonFrontmatter,
  Localized,
  ModuleMeta,
  Quiz,
  Source,
} from './types';
import modulesJson from '../../content/modules.json';
import glossaryJson from '../../content/glossary.json';
import sourcesJson from '../../content/sources.json';

// All lesson files: content/<module>/<lesson>.<ro|en>.md
const mdFiles = import.meta.glob('/content/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Lab checklists and quizzes: content/<module>/<lesson>.lab.json / .quiz.json
const jsonFiles = import.meta.glob('/content/*/*.{lab,quiz}.json', {
  import: 'default',
  eager: true,
}) as Record<string, unknown>;

const FILE_RE = /^\/content\/([^/]+)\/([^/]+)\.(ro|en)\.md$/;

const lessons: LessonDoc[] = [];
for (const [path, raw] of Object.entries(mdFiles)) {
  const m = FILE_RE.exec(path);
  if (!m) continue;
  const [, module, id, lang] = m;
  const { data, body } = splitFrontmatter(raw);
  const meta = { ...(data as unknown as LessonFrontmatter), id, module };
  lessons.push({ key: `${module}/${id}`, lang: lang as Lang, meta, body });
}

export const modules: ModuleMeta[] = (modulesJson as ModuleMeta[])
  .slice()
  .sort((a, b) => a.order - b.order);

export const glossary: GlossaryEntry[] = glossaryJson as GlossaryEntry[];
export const sources: Source[] = sourcesJson as Source[];
export const sourceById = new Map(sources.map((s) => [s.id, s]));

/** One entry per lesson key, RO metadata as the canonical one (RO is the reference language). */
export function lessonKeys(moduleId?: string): { key: string; meta: LessonFrontmatter }[] {
  return lessons
    .filter((l) => l.lang === 'ro' && (!moduleId || l.meta.module === moduleId))
    .sort((a, b) => a.meta.module.localeCompare(b.meta.module) || a.meta.order - b.meta.order)
    .map((l) => ({ key: l.key, meta: l.meta }));
}

/** Returns the lesson in the requested language, falling back to RO. */
export function getLesson(key: string, lang: Lang): { doc: LessonDoc; fallback: boolean } | undefined {
  const wanted = lessons.find((l) => l.key === key && l.lang === lang);
  if (wanted) return { doc: wanted, fallback: false };
  const ro = lessons.find((l) => l.key === key && l.lang === 'ro');
  return ro ? { doc: ro, fallback: lang !== 'ro' } : undefined;
}

export function getLab(key: string): LabChecklist | undefined {
  return jsonFiles[`/content/${key}.lab.json`] as LabChecklist | undefined;
}

export function getQuiz(key: string): Quiz | undefined {
  return jsonFiles[`/content/${key}.quiz.json`] as Quiz | undefined;
}

export function loc(v: Localized | undefined, lang: Lang): string {
  if (!v) return '';
  return (lang === 'en' && v.en) || v.ro;
}
