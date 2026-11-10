import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Theme } from './types';

export const STORAGE_KEY = 'vmw-lms:v1';
export const STORAGE_VERSION = 1;

export interface QuizAttempt {
  ts: number;
  score: number;
  total: number;
  wrong: string[];
}

export interface AppState {
  version: number;
  completed: Record<string, number>; // lessonKey -> timestamp
  lab: Record<string, Record<string, boolean>>; // lessonKey -> stepId -> done
  quiz: Record<string, QuizAttempt[]>; // lessonKey -> history
  notes: Record<string, string>; // lessonKey -> text
  lang: Lang;
  theme: Theme;
  lastLesson?: string;
}

export const defaultState: AppState = {
  version: STORAGE_VERSION,
  completed: {},
  lab: {},
  quiz: {},
  notes: {},
  lang: 'ro',
  theme: 'dark',
};

/** Accepts any parsed object and returns a valid AppState, or null if it is not ours. */
export function sanitizeState(input: unknown): AppState | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Partial<AppState>;
  if (o.version !== STORAGE_VERSION) return null;
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  return {
    version: STORAGE_VERSION,
    completed: obj(o.completed) as AppState['completed'],
    lab: obj(o.lab) as AppState['lab'],
    quiz: obj(o.quiz) as AppState['quiz'],
    notes: obj(o.notes) as AppState['notes'],
    lang: o.lang === 'en' ? 'en' : 'ro',
    theme: o.theme === 'light' ? 'light' : 'dark',
    lastLesson: typeof o.lastLesson === 'string' ? o.lastLesson : undefined,
  };
}

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return sanitizeState(JSON.parse(raw)) ?? defaultState;
  } catch {
    return defaultState;
  }
}

function save(state: AppState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

interface Store {
  state: AppState;
  persisted: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    setPersisted(save(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.lang = state.lang;
  }, [state.theme, state.lang]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);
  const replace = useCallback((s: AppState) => setState(s), []);
  const value = useMemo(() => ({ state, persisted, update, replace }), [state, persisted, update, replace]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
