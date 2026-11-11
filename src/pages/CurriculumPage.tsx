import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, FlaskConical, GraduationCap, Target } from 'lucide-react';
import { hasLesson, loc, modules } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import { AbbrLegend, AbbrText, findAbbreviations } from '../components/Abbr';

/** Exam prefixes used in modules.json → exam code and certification. Verified 2026-11-10 (docs/STATE_OF_THE_ART.md). */
export const EXAMS: { key: string; code: string; name: { ro: string; en: string } }[] = [
  { key: 'VVF', code: '2V0-16.25', name: { ro: 'VCP-VVF Administrator (VMware vSphere Foundation 9.0), ținta principală', en: 'VCP-VVF Administrator (VMware vSphere Foundation 9.0), main target' } },
  { key: 'VCF', code: '2V0-17.25', name: { ro: 'VCP-VCF Administrator (VMware Cloud Foundation 9.0)', en: 'VCP-VCF Administrator (VMware Cloud Foundation 9.0)' } },
  { key: 'DCV', code: '2V0-21.23', name: { ro: 'VCP-DCV (vSphere 8), certificare Legacy, folosită doar ca hartă de conținut', en: 'VCP-DCV (vSphere 8), Legacy certification, used only as a content map' } },
  { key: 'NV', code: '2V0-41.24', name: { ro: 'VCP-NV (NSX 4.x), certificare Legacy, folosită doar ca hartă de conținut', en: 'VCP-NV (NSX 4.x), Legacy certification, used only as a content map' } },
];

export function ExamBadge({ code }: { code: string }) {
  const exam = EXAMS.find((e) => code === e.key || code.startsWith(`${e.key} `));
  return (
    <span className="tag whitespace-nowrap text-[11px]" title={exam ? `${exam.code} · ${exam.name.en}` : undefined}>
      {code}
    </span>
  );
}

export function CurriculumPage() {
  const { state } = useStore();
  const t = useT();
  const L = state.lang;

  const texts = modules.flatMap((m) => [
    loc(m.title, L),
    loc(m.target, L),
    loc(m.competency, L),
    loc(m.labTitle, L),
    ...m.chapters.flatMap((c) => [loc(c.title, L), loc(c.examNote, L), ...(c.topics ?? [])]),
    ...EXAMS.map((e) => loc(e.name, L)),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">{t('curriculum')}</h1>
      <p className="mb-4 text-[var(--muted)]">{t('curriculumIntro')}</p>

      <section className="card mb-6">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <GraduationCap size={18} aria-hidden="true" /> {t('examLegend')}
        </h2>
        <ul className="space-y-1 text-sm">
          {EXAMS.map((e) => (
            <li key={e.key}>
              <span className="font-mono font-semibold">{e.key}</span> = {t('exam')} <span className="font-mono">{e.code}</span>:{' '}
              <AbbrText text={loc(e.name, L)} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--muted)]">{t('examLegendHint')}</p>
      </section>

      {modules.map((m) => (
        <section key={m.id} className="card mb-6" data-module={m.id}>
          <h2 className="mb-1 text-xl font-semibold">
            <Link to={`/module/${m.id}`} className="hover:text-[var(--accent)]">
              <AbbrText text={loc(m.title, L)} />
            </Link>
          </h2>
          {m.target && (
            <p className="mb-3 text-sm text-[var(--muted)]">
              <AbbrText text={loc(m.target, L)} />
            </p>
          )}
          {(m.competency || m.labTitle) && (
            <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
              {m.competency && (
                <div className="rounded border border-[var(--border)] p-3">
                  <dt className="mb-1 flex items-center gap-1 font-semibold">
                    <Target size={16} aria-hidden="true" /> {t('competency')}
                  </dt>
                  <dd>
                    <AbbrText text={loc(m.competency, L)} />
                  </dd>
                </div>
              )}
              {m.labTitle && (
                <div className="rounded border border-[var(--border)] p-3">
                  <dt className="mb-1 flex items-center gap-1 font-semibold">
                    <FlaskConical size={16} aria-hidden="true" /> {t('labTitle')}
                  </dt>
                  <dd>
                    <AbbrText text={loc(m.labTitle, L)} />
                  </dd>
                </div>
              )}
            </dl>
          )}
          <ol className="space-y-2">
            {m.chapters.map((c, i) => {
              const key = `${m.id}/${c.id}`;
              const available = hasLesson(key);
              const done = !!state.completed[key];
              const title = (
                <>
                  {m.order}.{i + 1} <AbbrText text={loc(c.title, L)} />
                </>
              );
              return (
                <li key={c.id} className="flex items-start gap-2 text-sm" data-chapter={key}>
                  {done ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" aria-label="done" />
                  ) : (
                    <Circle size={16} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    {available ? (
                      <Link to={`/lesson/${key}`} className="font-medium text-[var(--accent)] hover:underline">
                        {title}
                      </Link>
                    ) : (
                      <span>
                        {title} <span className="text-xs text-[var(--muted)]">({t('planned')})</span>
                      </span>
                    )}
                    {c.exam.length > 0 && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {c.exam.map((e) => (
                          <ExamBadge key={e} code={e} />
                        ))}
                      </span>
                    )}
                    {(c.topics?.length ?? 0) > 0 && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-[var(--muted)]">
                        {c.topics!.map((x) => (
                          <li key={x}>
                            <AbbrText text={x} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.examNote && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        <AbbrText text={loc(c.examNote, L)} />
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <AbbrLegend entries={findAbbreviations(texts)} title={t('abbrLegend')} />
    </div>
  );
}
