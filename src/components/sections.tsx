import type { ReactNode } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  Lightbulb,
  Library,
  MessagesSquare,
  Network,
  Siren,
  type LucideIcon,
} from 'lucide-react';
import type { SectionType } from '../lib/remark';
import { useT, type I18nKey } from '../lib/i18n';

const STYLE: Record<SectionType, { icon: LucideIcon; cls: string }> = {
  analogy: { icon: Lightbulb, cls: 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
  architecture: { icon: Network, cls: 'border-sky-500 bg-sky-500/5 text-sky-600 dark:text-sky-400' },
  'exam-alert': { icon: Siren, cls: 'border-red-500 bg-red-500/5 text-red-600 dark:text-red-400' },
  trenches: { icon: FlaskConical, cls: 'border-orange-500 bg-orange-500/5 text-orange-600 dark:text-orange-400' },
  interview: { icon: MessagesSquare, cls: 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400' },
  lab: { icon: ClipboardCheck, cls: 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
  quiz: { icon: BookOpen, cls: 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' },
  references: { icon: Library, cls: 'border-slate-500 bg-slate-500/5 text-slate-600 dark:text-slate-300' },
};

export function isSectionType(s: unknown): s is SectionType {
  return typeof s === 'string' && s in STYLE;
}

export function SectionBox({ type, children, extra }: { type: SectionType; children: ReactNode; extra?: ReactNode }) {
  const t = useT();
  const { icon: Icon, cls } = STYLE[type];
  const [border, bg, ...text] = cls.split(' ');
  return (
    <section id={`sec-${type}`} data-section={type} className={`my-8 rounded-lg border-l-4 ${border} ${bg} px-4 py-3 sm:px-6`}>
      <h2 className={`not-prose mb-3 flex items-center gap-2 text-lg font-semibold ${text.join(' ')}`}>
        <Icon size={20} aria-hidden="true" />
        {t(`sec_${type}` as I18nKey)}
      </h2>
      {children}
      {extra}
    </section>
  );
}
