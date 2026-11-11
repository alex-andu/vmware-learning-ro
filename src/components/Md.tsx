import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export const remarkPluginsBase = [remarkGfm, remarkMath];
export const rehypePluginsBase = [[rehypeKatex, { throwOnError: false, strict: false }]] as const;

const inlineComponents = { p: ({ children }: { children?: React.ReactNode }) => <>{children}</> };

/** Markdown with tables and $…$ formulas, for quiz and lab text. `inline` drops the <p> wrapper. */
export function Md({ children, inline = false }: { children: string; inline?: boolean }) {
  return (
    <Markdown
      remarkPlugins={remarkPluginsBase}
      rehypePlugins={rehypePluginsBase as never}
      components={inline ? inlineComponents : undefined}
    >
      {children}
    </Markdown>
  );
}
