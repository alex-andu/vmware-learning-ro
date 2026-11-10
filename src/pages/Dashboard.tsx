import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { chapterKeys, getLesson, lessonKeys, loc, modules } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import { ProgressBar } from '../components/ProgressBar';

export function Dashboard() {
  const { state } = useStore();
  const t = useT();
  const all = lessonKeys();
  const allChapters = chapterKeys();
  const done = allChapters.filter((k) => state.completed[k]).length;

  const nextKey =
    (state.lastLesson && all.some((l) => l.key === state.lastLesson) && state.lastLesson) ||
    all.find((l) => !state.completed[l.key])?.key ||
    all[0]?.key;
  const next = nextKey ? getLesson(nextKey, state.lang) : undefined;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{t('dashboard')}</h1>
      <div className="card mb-6">
        <p className="mb-2 text-sm font-medium">{t('globalProgress')}</p>
        <ProgressBar value={done} max={allChapters.length} />
        {next && (
          <Link to={`/lesson/${nextKey}`} className="btn mt-4 inline-flex items-center gap-2">
            <PlayCircle size={18} aria-hidden="true" />
            {state.lastLesson ? t('continue') : t('start')}: {next.doc.meta.title}
          </Link>
        )}
      </div>
      <h2 className="mb-3 text-lg font-semibold">{t('modules')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => {
          const keys = chapterKeys(m.id);
          const d = keys.filter((k) => state.completed[k]).length;
          return (
            <Link key={m.id} to={`/module/${m.id}`} className="card block hover:border-[var(--accent)]">
              <p className="font-semibold">{loc(m.title, state.lang)}</p>
              <p className="mb-2 mt-1 text-sm text-[var(--muted)]">
                {keys.length} {t('chapters')} · {lessonKeys(m.id).length} {t('lessons')}
              </p>
              <ProgressBar value={d} max={keys.length} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
