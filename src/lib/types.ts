export type Lang = 'ro' | 'en';
export type Theme = 'dark' | 'light';
export type Localized = { ro: string; en?: string };

export interface Chapter {
  id: string;
  title: Localized;
  exam: string[];
  examNote?: Localized;
  /** Sub-topics from Alex's table of contents (cuprins.md). */
  topics?: string[];
  number?: string;
}

export interface ModuleMeta {
  id: string;
  order: number;
  title: Localized;
  target?: Localized;
  competency?: Localized;
  labTitle?: Localized;
  chapters: Chapter[];
}

export interface LessonFrontmatter {
  id: string;
  module: string;
  order: number;
  title: string;
  summary: string;
  level?: string;
  examTargets?: string[];
  sources?: string[];
  status?: string;
  updated?: string;
  examSummaryEn?: string;
  glossaryTerms?: string[];
  /** 'alex' = text written by Alex and imported unchanged with scripts/import-alex.mjs */
  origin?: string;
}

export interface LessonDoc {
  key: string; // `${module}/${id}`
  lang: Lang;
  meta: LessonFrontmatter;
  body: string;
}

export interface LabStep {
  id: string;
  title: Localized;
  path?: Localized;
  action: Localized;
  why?: Localized;
}

export interface LabChecklist {
  steps: LabStep[];
}

export interface QuizOption {
  text: Localized;
  correct: boolean;
  explanation?: Localized;
}

export interface QuizQuestion {
  id: string;
  question: Localized;
  options: QuizOption[];
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases?: string[];
  abbr?: string;
  expansion?: string;
  ro: string;
  en: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  type: string;
  accessed: string;
  read: boolean;
  usedBy: string[];
}
