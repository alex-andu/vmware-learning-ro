import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { chapterKeys, getLesson, hasLesson, loc, modules } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import { ProgressBar } from '../components/ProgressBar';
import { AbbrLegend, AbbrText, findAbbreviations } from '../components/Abbr';
import { ExamBadge } from './CurriculumPage';
import { NotFound } from './NotFound';

export function ModulePage() {
  const { moduleId } = useParams();
  const { state } = useStore();
  const t = useT();
  const m = modules.find((x) => x.id === moduleId);
  if (!m) return <NotFound />;
  const keys = chapterKeys(m.id);
  const done = keys.filter((k) => state.completed[k]).length;
  const L = state.lang;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">
        <AbbrText text={loc(m.title, L)} />
      </h1>
      <ProgressBar value={done} max={keys.length} />
      <dl className="card my-4 grid gap-2 text-sm">
        <dt className="font-semibold">{t('competency')}</dt>
        <dd className="text-[var(--muted)]">
          <AbbrText text={loc(m.competency, L)} />
        </dd>
        <dt className="font-semibold">{t('labTitle')}</dt>
        <dd className="text-[var(--muted)]">
          <AbbrText text={loc(m.labTitle, L)} />
        </dd>
      </dl>
      <ol className="space-y-2">
        {m.chapters.map((c, i) => {
          const key = `${m.id}/${c.id}`;
          const lesson = hasLesson(key) ? getLesson(key, L) : undefined;
          const inner = (
            <>
              {state.completed[key] ? (
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" aria-label="done" />
              ) : (
                <Circle size={20} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
              )}
              <span className="min-w-0">
                <span className="block font-medium">
                  {m.order}.{i + 1} <AbbrText text={loc(c.title, L)} />
                  {!lesson && <span className="ml-2 text-xs font-normal text-[var(--muted)]">({t('planned')})</span>}
                </span>
                {lesson && <span className="block text-sm text-[var(--muted)]">{lesson.doc.meta.summary}</span>}
                {c.exam.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-1">
                    {c.exam.map((e) => (
                      <ExamBadge key={e} code={e} />
                    ))}
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li key={c.id}>
              {lesson ? (
                <Link to={`/lesson/${key}`} className="card flex items-start gap-3 hover:border-[var(--accent)]">
                  {inner}
                </Link>
              ) : (
                <div className="card flex items-start gap-3 opacity-70">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
      <AbbrLegend
        entries={findAbbreviations([loc(m.title, L), loc(m.competency, L), loc(m.labTitle, L), ...m.chapters.map((c) => loc(c.title, L))])}
        title={t('abbrLegend')}
      />
    </div>
  );
}
