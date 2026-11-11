import { createContext, useContext, useMemo, type ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { Link } from 'react-router-dom';
import { glossary, getLab, getQuiz } from '../lib/content';
import { remarkGlossaryLinks, remarkSections } from '../lib/remark';
import { Mermaid } from './Mermaid';
import { SectionBox, isSectionType } from './sections';
import { LabChecklist } from './LabChecklist';
import { QuizView } from './QuizView';

const glossaryPlugin = remarkGlossaryLinks(glossary);

// Passed via context so the `components` map stays referentially stable:
// a new map would remount sections (and reset quiz state) on every store update.
const LessonCtx = createContext<{ lessonKey: string; footer?: ReactNode }>({ lessonKey: '' });

function Section({ type, children }: { type: unknown; children: ReactNode }) {
  const { lessonKey, footer } = useContext(LessonCtx);
  if (!isSectionType(type)) return <section>{children}</section>;
  let extra: ReactNode = null;
  if (type === 'lab') {
    const lab = getLab(lessonKey);
    if (lab) extra = <LabChecklist key={lessonKey} lessonKey={lessonKey} lab={lab} />;
  } else if (type === 'quiz') {
    const quiz = getQuiz(lessonKey);
    if (quiz) extra = <QuizView key={lessonKey} lessonKey={lessonKey} quiz={quiz} />;
  } else if (type === 'references') {
    extra = footer;
  }
  return (
    <SectionBox type={type} extra={extra}>
      {children}
    </SectionBox>
  );
}

const components: Components = {
      section: ({ node, children, ...rest }) => {
        void node;
        return <Section type={(rest as Record<string, unknown>)['data-section']}>{children}</Section>;
      },
      code: ({ node, className, children, ...rest }) => {
        void node;
        if (/language-mermaid/.test(className ?? '')) return <Mermaid code={String(children).trim()} />;
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      },
      pre: ({ node, children, ...rest }) => {
        // Mermaid blocks render their own container; unwrap the <pre>.
        const child = node?.children?.[0];
        if (child && 'tagName' in child && child.tagName === 'code') {
          const cls = (child.properties?.className as string[] | undefined) ?? [];
          if (cls.includes('language-mermaid')) return <>{children}</>;
        }
        return <pre {...rest}>{children}</pre>;
      },
      a: ({ node, href, children, ...rest }) => {
        void node;
        if (href?.startsWith('/'))
          return (
            <Link to={href} {...rest}>
              {children}
            </Link>
          );
        return (
          <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
            {children}
          </a>
        );
      },
      table: ({ node, children, ...rest }) => {
        void node;
        return (
          <div className="overflow-x-auto">
            <table {...rest}>{children}</table>
          </div>
        );
      },
};

export function LessonMarkdown({ lessonKey, body, footer }: { lessonKey: string; body: string; footer?: ReactNode }) {
  const ctx = useMemo(() => ({ lessonKey, footer }), [lessonKey, footer]);
  return (
    <LessonCtx.Provider value={ctx}>
    <div className="prose max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-[var(--accent)] prose-code:before:content-none prose-code:after:content-none [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none">
      <Markdown remarkPlugins={[remarkGfm, remarkDirective, remarkSections, glossaryPlugin]} components={components}>
        {body}
      </Markdown>
    </div>
    </LessonCtx.Provider>
  );
}
