import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { loc } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import type { Quiz } from '../lib/types';
import { Md } from './Md';

export function QuizView({ lessonKey, quiz }: { lessonKey: string; quiz: Quiz }) {
  const { state, update } = useStore();
  const t = useT();
  const history = state.quiz[lessonKey] ?? [];
  const lastWrong = history.length ? history[history.length - 1].wrong : [];

  const [subset, setSubset] = useState<string[] | null>(null); // null = all questions
  const questions = useMemo(
    () => (subset ? quiz.questions.filter((q) => subset.includes(q.id)) : quiz.questions),
    [quiz, subset],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const q = questions[idx];
  const reset = (ids: string[] | null) => {
    setSubset(ids);
    setIdx(0);
    setPicked(null);
    setAnswers({});
    setFinished(false);
  };

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setAnswers((a) => ({ ...a, [q.id]: q.options[i].correct }));
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    const wrong = questions.filter((x) => !answers[x.id]).map((x) => x.id);
    const score = questions.length - wrong.length;
    update((s) => ({
      ...s,
      quiz: { ...s.quiz, [lessonKey]: [...(s.quiz[lessonKey] ?? []), { ts: Date.now(), score, total: questions.length, wrong }] },
    }));
    setFinished(true);
  };

  const scoreNow = Object.values(answers).filter(Boolean).length;

  return (
    <div className="not-prose mt-4" data-quiz={lessonKey}>
      {finished ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
          <p className="text-lg font-semibold">
            {t('score')}: {scoreNow}/{questions.length}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn" onClick={() => reset(null)}>
              {t('restart')}
            </button>
            {lastWrong.length > 0 && (
              <button className="btn" onClick={() => reset(lastWrong)}>
                {t('retryWrong')} ({lastWrong.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        q && (
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">
              {t('question')} {idx + 1} {t('of')} {questions.length}
            </p>
            <div className="prose prose-sm mb-3 max-w-none font-medium dark:prose-invert">
              <Md>{loc(q.question, state.lang)}</Md>
            </div>
            <ul className="space-y-2" role="list">
              {q.options.map((o, i) => {
                const show = picked !== null;
                const state_ = show ? (o.correct ? 'correct' : i === picked ? 'wrong' : 'other') : 'idle';
                const cls = {
                  idle: 'border-[var(--border)] hover:border-[var(--accent)]',
                  correct: 'border-emerald-500 bg-emerald-500/10',
                  wrong: 'border-red-500 bg-red-500/10',
                  other: 'border-[var(--border)] opacity-80',
                }[state_];
                return (
                  <li key={i}>
                    <button
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm ${cls}`}
                      onClick={() => choose(i)}
                      disabled={show}
                      aria-pressed={picked === i}
                    >
                      <span className="flex items-start gap-2">
                        <span className="font-mono font-semibold">{String.fromCharCode(65 + i)}.</span>
                        <span className="flex-1">
                          <Md inline>{loc(o.text, state.lang)}</Md>
                        </span>
                        {show && o.correct && <CheckCircle2 size={18} className="text-emerald-500" aria-label={t('correct')} />}
                        {show && !o.correct && i === picked && (
                          <XCircle size={18} className="text-red-500" aria-label={t('wrong')} />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {picked !== null &&
              q.options
                .filter((o, i) => o.explanation && (o.correct || i === picked))
                .map((o, i) => (
                  <div
                    key={i}
                    data-testid="quiz-explanation"
                    className={`prose prose-sm mt-3 max-w-none rounded-md border-l-4 px-3 py-2 dark:prose-invert ${o.correct ? 'border-emerald-500 bg-emerald-500/5' : 'border-red-500 bg-red-500/5'}`}
                  >
                    <Md>{loc(o.explanation, state.lang)}</Md>
                  </div>
                ))}
            {picked !== null && (
              <button className="btn mt-3" onClick={next}>
                {idx + 1 < questions.length ? t('next') : t('finish')}
              </button>
            )}
          </div>
        )
      )}
      {history.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-[var(--muted)]">
            {t('history')} ({history.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {history
              .slice()
              .reverse()
              .map((h) => (
                <li key={h.ts}>
                  {new Date(h.ts).toLocaleString(state.lang)} — {h.score}/{h.total}
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}
