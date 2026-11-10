import { useEffect, useId, useState } from 'react';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';

let queue: Promise<unknown> = Promise.resolve();

/** Client-side Mermaid render; re-renders when the theme changes; shows raw code on syntax error. */
export function Mermaid({ code }: { code: string }) {
  const { state } = useStore();
  const t = useT();
  const rid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Mermaid keeps global config, so renders are serialized.
    queue = queue.then(async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: state.theme === 'dark' ? 'dark' : 'default',
          fontFamily: 'inherit',
        });
        const { svg } = await mermaid.render(`mmd-${rid}-${state.theme}`, code);
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setSvg(null);
          setError(e instanceof Error ? e.message : String(e));
        }
        document.getElementById(`dmmd-${rid}-${state.theme}`)?.remove();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, state.theme, rid]);

  if (error) {
    return (
      <div className="not-prose my-4 rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm" data-mermaid="error">
        <p className="mb-2 font-semibold text-red-700 dark:text-red-300">{t('mermaidError')}</p>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{code}</pre>
      </div>
    );
  }
  return (
    <figure
      className="not-prose my-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      data-mermaid={svg ? 'ok' : 'loading'}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : <span className="text-sm text-[var(--muted)]">…</span>}
    </figure>
  );
}
