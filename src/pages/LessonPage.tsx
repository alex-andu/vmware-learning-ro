import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { getLesson, glossary, loc, modules, sourceById } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import { LessonMarkdown } from '../components/LessonMarkdown';
import { NotFound } from './NotFound';
import { AbbrLegend, AbbrText, findAbbreviations } from '../components/Abbr';

export function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const key = `${moduleId}/${lessonId}`;
  const { state, update } = useStore();
  const t = useT();
  const found = getLesson(key, state.lang);

  useEffect(() => {
    if (found) update((s) => (s.lastLesson === key ? s : { ...s, lastLesson: key }));
  }, [key, found, update]);

  if (!found) return <NotFound />;
  const { doc, fallback } = found;
  const meta = doc.meta;
  const mod = modules.find((m) => m.id === meta.module);
  const done = !!state.completed[key];
  const terms = (meta.glossaryTerms ?? []).map((id) => glossary.find((g) => g.id === id)).filter((g) => !!g);

  const references = (
    <div className="not-prose mt-4 text-sm">
      <p className="mb-1 font-semibold">{t('sourcesTitle')}</p>
      <ol className="list-decimal space-y-1 pl-5">
        {(meta.sources ?? []).map((id) => {
          const s = sourceById.get(id);
          return (
            <li key={id}>
              {s ? (
                <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-[var(--accent)] underline">
                  [{id}] {s.title}
                </a>
              ) : (
                <span>[{id}] ⚠</span>
              )}
              {s && <span className="text-[var(--muted)]"> — {s.type}, {s.accessed}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <article>
      <nav className="mb-2 text-sm text-[var(--muted)]" aria-label="Breadcrumb">
        {mod && <Link to={`/module/${mod.id}`} className="hover:underline">{loc(mod.title, state.lang)}</Link>}
      </nav>
      <h1 className="mb-1 text-2xl font-semibold">
        <AbbrText text={meta.title} />
      </h1>
      <p className="mb-3 text-[var(--muted)]">
        <AbbrText text={meta.summary ?? ''} />
      </p>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {meta.status === 'test' && <span className="tag border-amber-500 text-amber-600 dark:text-amber-400">{t('testLesson')}</span>}
        {(meta.examTargets ?? []).map((e) => (
          <span key={e} className="tag">{e}</span>
        ))}
        {meta.updated && <span className="tag">{meta.updated}</span>}
      </div>
      {fallback && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-md border border-amber-500 bg-amber-500/10 px-3 py-2 text-sm">
          <AlertTriangle size={16} aria-hidden="true" /> {t('fallbackBanner')}
        </div>
      )}

      <LessonMarkdown lessonKey={key} body={doc.body} footer={references} />

      {(meta.examSummaryEn || terms.length > 0) && (
        <section className="card my-8" lang="en" data-section="exam-summary">
          <h2 className="mb-2 text-lg font-semibold">{t('examSummary')}</h2>
          {meta.examSummaryEn && <p className="mb-3 text-sm">{meta.examSummaryEn}</p>}
          {terms.length > 0 && (
            <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
              {terms.map((g) => (
                <div key={g.id} className="contents">
                  <dt className="font-semibold">
                    <Link to={`/glossary#${g.id}`} className="text-[var(--accent)]">{g.term}</Link>
                  </dt>
                  <dd className="text-[var(--muted)]">{g.en}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      <AbbrLegend
        entries={findAbbreviations([meta.title, meta.summary ?? '', doc.body.replace(/```[\s\S]*?```/g, ' ')])}
        title={t('abbrLegendLesson')}
      />

      <section className="card my-8">
        <label htmlFor="notes" className="mb-2 block font-semibold">{t('notes')}</label>
        <textarea
          id="notes"
          rows={5}
          className="w-full rounded border border-[var(--border)] bg-[var(--bg)] p-2 text-sm"
          placeholder={t('notesPlaceholder')}
          value={state.notes[key] ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            update((s) => ({ ...s, notes: { ...s.notes, [key]: v } }));
          }}
        />
      </section>

      <button
        className={`btn inline-flex items-center gap-2 ${done ? 'btn-done' : ''}`}
        onClick={() =>
          update((s) => {
            const completed = { ...s.completed };
            if (completed[key]) delete completed[key];
            else completed[key] = Date.now();
            return { ...s, completed };
          })
        }
      >
        {done ? <CheckCircle2 size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
        {done ? t('markUndone') : t('markDone')}
      </button>
    </article>
  );
}
