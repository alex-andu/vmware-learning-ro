import { useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookA, LayoutDashboard, Menu, Moon, Search, Server, Settings, Sun, X } from 'lucide-react';
import { lessonKeys, loc, modules } from '../lib/content';
import { useStore } from '../lib/storage';
import { useT } from '../lib/i18n';
import { ProgressBar } from './ProgressBar';

export function Layout() {
  const { state, update, persisted } = useStore();
  const t = useT();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-medium' : 'hover:bg-[var(--hover)]'}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-[var(--accent)] focus:px-3 focus:py-1 focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--header)] px-3 text-white sm:px-4">
        <button className="rounded p-2 hover:bg-white/10 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="flex items-center gap-2 font-semibold whitespace-nowrap">
          <Server size={20} aria-hidden="true" />
          <span className="hidden sm:inline">{t('appName')}</span>
        </Link>
        <form onSubmit={onSearch} className="mx-2 flex min-w-0 flex-1 items-center sm:mx-4" role="search">
          <label className="relative w-full max-w-xl">
            <span className="sr-only">{t('search')}</span>
            <Search size={16} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-70" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded border border-white/20 bg-white/10 py-1.5 pl-8 pr-2 text-sm text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
            />
          </label>
        </form>
        <button
          className="rounded px-2 py-1 text-xs font-semibold hover:bg-white/10"
          onClick={() => update((s) => ({ ...s, lang: s.lang === 'ro' ? 'en' : 'ro' }))}
          aria-label={t('language')}
        >
          {state.lang === 'ro' ? 'RO' : 'EN'}
        </button>
        <button
          className="rounded p-2 hover:bg-white/10"
          onClick={() => update((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}
          aria-label={t('theme')}
        >
          {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>
      {!persisted && (
        <div role="alert" className="bg-red-600 px-4 py-2 text-sm text-white">
          {t('storageWarn')}
        </div>
      )}
      <div className="flex">
        <nav
          className={`${open ? 'block' : 'hidden'} fixed inset-x-0 top-14 bottom-0 z-20 overflow-y-auto border-r border-[var(--border)] bg-[var(--sidebar)] p-3 lg:sticky lg:block lg:h-[calc(100vh-3.5rem)] lg:w-72 lg:shrink-0`}
          onClick={() => setOpen(false)}
          aria-label="Main"
        >
          <NavLink to="/" end className={linkCls}>
            <LayoutDashboard size={16} aria-hidden="true" /> {t('dashboard')}
          </NavLink>
          <p className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{t('modules')}</p>
          {modules.map((m) => {
            const keys = lessonKeys(m.id).map((l) => l.key);
            const done = keys.filter((k) => state.completed[k]).length;
            return (
              <NavLink key={m.id} to={`/module/${m.id}`} className={linkCls}>
                <span className="flex-1">
                  <span className="block">{loc(m.title, state.lang)}</span>
                  <ProgressBar value={done} max={keys.length} small />
                </span>
              </NavLink>
            );
          })}
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <NavLink to="/glossary" className={linkCls}>
              <BookA size={16} aria-hidden="true" /> {t('glossary')}
            </NavLink>
            <NavLink to="/settings" className={linkCls}>
              <Settings size={16} aria-hidden="true" /> {t('settings')}
            </NavLink>
          </div>
        </nav>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
