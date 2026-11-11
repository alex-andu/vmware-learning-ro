import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle } from 'lucide-react';
import { loc } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import type { LabChecklist as Lab } from '../lib/types';

export function LabChecklist({ lessonKey, lab }: { lessonKey: string; lab: Lab }) {
  const { state, update } = useStore();
  const t = useT();
  const done = state.lab[lessonKey] ?? {};
  const count = lab.steps.filter((s) => done[s.id]).length;

  const toggle = (id: string) =>
    update((s) => ({ ...s, lab: { ...s.lab, [lessonKey]: { ...(s.lab[lessonKey] ?? {}), [id]: !done[id] } } }));

  return (
    <div className="not-prose mt-4">
      <p className="mb-2 text-sm text-[var(--muted)]">
        {count}/{lab.steps.length} {t('labDone')}
      </p>
      <ol className="space-y-3">
        {lab.steps.map((step, i) => (
          <li key={step.id} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
                checked={!!done[step.id]}
                onChange={() => toggle(step.id)}
              />
              <span className={`font-medium ${done[step.id] ? 'line-through opacity-70' : ''}`}>
                {i + 1}. {loc(step.title, state.lang)}
              </span>
            </label>
            <div className="prose prose-sm mt-2 max-w-none pl-7 dark:prose-invert">
              {step.path && (
                <p>
                  <strong>{t('uiPath')}:</strong> <code>{loc(step.path, state.lang)}</code>
                </p>
              )}
              <Markdown remarkPlugins={[remarkGfm]}>{loc(step.action, state.lang)}</Markdown>
              <div className="mt-2 rounded border-l-2 border-emerald-500 bg-emerald-500/5 px-3 py-2">
                <p className="m-0 flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <HelpCircle size={16} aria-hidden="true" /> {t('whyStep')}
                </p>
                <Markdown remarkPlugins={[remarkGfm]}>{loc(step.why, state.lang)}</Markdown>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
