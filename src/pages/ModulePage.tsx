import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { getLesson, lessonKeys, loc, modules } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import { ProgressBar } from '../components/ProgressBar';
import { NotFound } from './NotFound';

export function ModulePage() {
  const { moduleId } = useParams();
  const { state } = useStore();
  const t = useT();
  const m = modules.find((x) => x.id === moduleId);
  if (!m) return <NotFound />;
  const keys = lessonKeys(m.id);
  const done = keys.filter((l) => state.completed[l.key]).length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">{loc(m.title, state.lang)}</h1>
      <ProgressBar value={done} max={keys.length} />
      <dl className="card my-4 grid gap-2 text-sm">
        <dt className="font-semibold">{t('competency')}</dt>
        <dd className="text-[var(--muted)]">{loc(m.competency, state.lang)}</dd>
        <dt className="font-semibold">{t('labTitle')}</dt>
        <dd className="text-[var(--muted)]">{loc(m.labTitle, state.lang)}</dd>
      </dl>
      <ol className="space-y-2">
        {keys.map(({ key }) => {
          const l = getLesson(key, state.lang)!;
          return (
            <li key={key}>
              <Link to={`/lesson/${key}`} className="card flex items-start gap-3 hover:border-[var(--accent)]">
                {state.completed[key] ? (
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" aria-label="done" />
                ) : (
                  <Circle size={20} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
                )}
                <span>
                  <span className="block font-medium">{l.doc.meta.title}</span>
                  <span className="block text-sm text-[var(--muted)]">{l.doc.meta.summary}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
