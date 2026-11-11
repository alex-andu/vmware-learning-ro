import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Download, Upload } from 'lucide-react';
import { glossary } from '../lib/content';
import { search } from '../lib/search';
import { STORAGE_KEY, sanitizeState, useStore } from '../lib/storage';
import { useT } from '../lib/i18n';

export function GlossaryPage() {
  const { state } = useStore();
  const t = useT();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'center' });
  }, [hash]);
  const sorted = glossary.slice().sort((a, b) => a.term.localeCompare(b.term));
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{t('glossary')}</h1>
      <dl className="space-y-3">
        {sorted.map((g) => (
          <div
            key={g.id}
            id={g.id}
            className={`card scroll-mt-20 ${hash === `#${g.id}` ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : ''}`}
          >
            <dt className="font-semibold">
              {g.term}
              {g.expansion && <span className="ml-2 font-normal">= {g.expansion}</span>}
              {g.aliases?.length ? <span className="ml-2 text-sm font-normal text-[var(--muted)]">({g.aliases.join(', ')})</span> : null}
            </dt>
            <dd className="mt-1 text-sm">{state.lang === 'en' ? g.en : g.ro}</dd>
            <dd className="mt-1 text-xs text-[var(--muted)]" lang={state.lang === 'en' ? 'ro' : 'en'}>
              {state.lang === 'en' ? g.ro : g.en}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { state } = useStore();
  const t = useT();
  const results = search(q, state.lang);
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">{t('searchResults')}</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">„{q}”</p>
      {results.length === 0 ? (
        <p>{t('noResults')}</p>
      ) : (
        <ul className="space-y-2">
          {results.map((r) => (
            <li key={r.id}>
              <Link to={r.href} className="card block hover:border-[var(--accent)]">
                <span className="mr-2 rounded bg-[var(--hover)] px-1.5 py-0.5 text-xs uppercase">{r.kind === 'lesson' ? t('lesson') : t('glossary')}</span>
                <span className="font-medium">{r.title}</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">{r.snippet}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { state, update, replace } = useStore();
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const doExport = () => {
    const blob = new Blob([JSON.stringify({ key: STORAGE_KEY, exportedAt: new Date().toISOString(), state }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vmw-lms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const s = sanitizeState(parsed?.state ?? parsed);
      if (!s) throw new Error('bad');
      replace(s);
      setMsg({ ok: true, text: t('importOk') });
    } catch {
      setMsg({ ok: false, text: t('importFail') });
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{t('settings')}</h1>
      <div className="card mb-4 grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">{t('language')}</legend>
          {(['ro', 'en'] as const).map((l) => (
            <label key={l} className="mr-4 text-sm">
              <input type="radio" name="lang" checked={state.lang === l} onChange={() => update((s) => ({ ...s, lang: l }))} /> {l.toUpperCase()}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">{t('theme')}</legend>
          {(['dark', 'light'] as const).map((th) => (
            <label key={th} className="mr-4 text-sm">
              <input type="radio" name="theme" checked={state.theme === th} onChange={() => update((s) => ({ ...s, theme: th }))} /> {t(th)}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="card">
        <p className="mb-3 text-sm text-[var(--muted)]">{t('backupHint')}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn inline-flex items-center gap-2" onClick={doExport}>
            <Download size={16} aria-hidden="true" /> {t('exportBtn')}
          </button>
          <button className="btn inline-flex items-center gap-2" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden="true" /> {t('importBtn')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="import-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
              e.target.value = '';
            }}
          />
        </div>
        {msg && (
          <p role="status" className={`mt-3 text-sm ${msg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
