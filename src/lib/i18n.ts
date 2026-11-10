import type { Lang } from './types';
import { useStore } from './storage';

const dict = {
  appName: { ro: 'VMware Study LMS', en: 'VMware Study LMS' },
  dashboard: { ro: 'Panou', en: 'Dashboard' },
  modules: { ro: 'Module', en: 'Modules' },
  glossary: { ro: 'Glosar', en: 'Glossary' },
  settings: { ro: 'Setări & backup', en: 'Settings & backup' },
  search: { ro: 'Caută în lecții și glosar…', en: 'Search lessons and glossary…' },
  searchResults: { ro: 'Rezultate căutare', en: 'Search results' },
  noResults: { ro: 'Niciun rezultat.', en: 'No results.' },
  globalProgress: { ro: 'Progres global', en: 'Overall progress' },
  continue: { ro: 'Continuă de unde ai rămas', en: 'Continue where you left off' },
  start: { ro: 'Începe cu prima lecție', en: 'Start with the first lesson' },
  lessons: { ro: 'lecții', en: 'lessons' },
  lesson: { ro: 'Lecție', en: 'Lesson' },
  competency: { ro: 'Competență pentru CV', en: 'CV competency' },
  labTitle: { ro: 'Laboratorul modulului', en: 'Module lab' },
  markDone: { ro: 'Marchează lecția ca terminată', en: 'Mark lesson as done' },
  markUndone: { ro: 'Lecție terminată (anulează)', en: 'Lesson done (undo)' },
  fallbackBanner: {
    ro: 'Varianta în engleză a acestei lecții nu există încă. Afișez varianta în română.',
    en: 'The English version of this lesson is not available yet. Showing the Romanian version.',
  },
  notes: { ro: 'Notițele mele', en: 'My notes' },
  notesPlaceholder: { ro: 'Scrie aici ce vrei să reții…', en: 'Write what you want to remember…' },
  // section titles
  sec_analogy: { ro: 'Analogia Profesorului', en: "The Professor's Analogy" },
  sec_architecture: { ro: 'Arhitectură & Deep Dive', en: 'Architecture & Deep Dive' },
  'sec_exam-alert': { ro: 'Exam Alert', en: 'Exam Alert' },
  sec_trenches: { ro: 'Din tranșee', en: 'From the Trenches' },
  sec_interview: { ro: 'Interview Q&A', en: 'Interview Q&A' },
  sec_lab: { ro: 'Home Lab pas-cu-pas', en: 'Home Lab step by step' },
  sec_quiz: { ro: 'Quiz', en: 'Quiz' },
  sec_references: { ro: 'Referințe & KB-uri', en: 'References & KBs' },
  examSummary: { ro: 'Exam summary & glossary (EN)', en: 'Exam summary & glossary (EN)' },
  whyStep: { ro: 'De ce facem asta?', en: 'Why do we do this?' },
  uiPath: { ro: 'Calea în UI', en: 'UI path' },
  labDone: { ro: 'pași bifați', en: 'steps checked' },
  // quiz
  check: { ro: 'Verifică', en: 'Check' },
  next: { ro: 'Următoarea', en: 'Next' },
  finish: { ro: 'Termină quiz-ul', en: 'Finish quiz' },
  restart: { ro: 'Refă tot quiz-ul', en: 'Retake full quiz' },
  retryWrong: { ro: 'Refă doar greșelile', en: 'Retry only mistakes' },
  correct: { ro: 'Corect', en: 'Correct' },
  wrong: { ro: 'Greșit', en: 'Wrong' },
  score: { ro: 'Scor', en: 'Score' },
  history: { ro: 'Istoric încercări', en: 'Attempt history' },
  question: { ro: 'Întrebarea', en: 'Question' },
  of: { ro: 'din', en: 'of' },
  // settings
  language: { ro: 'Limba', en: 'Language' },
  theme: { ro: 'Tema', en: 'Theme' },
  dark: { ro: 'Întunecată', en: 'Dark' },
  light: { ro: 'Luminoasă', en: 'Light' },
  exportBtn: { ro: 'Exportă progresul (JSON)', en: 'Export progress (JSON)' },
  importBtn: { ro: 'Importă progres din JSON', en: 'Import progress from JSON' },
  importOk: { ro: 'Import reușit.', en: 'Import succeeded.' },
  importFail: { ro: 'Fișier invalid: nu e un backup vmw-lms v1.', en: 'Invalid file: not a vmw-lms v1 backup.' },
  backupHint: {
    ro: 'Progresul stă doar în acest browser (LocalStorage). Exportă periodic un backup.',
    en: 'Progress lives only in this browser (LocalStorage). Export a backup regularly.',
  },
  storageWarn: {
    ro: 'Atenție: progresul nu poate fi salvat în acest browser (LocalStorage blocat).',
    en: 'Warning: progress cannot be saved in this browser (LocalStorage blocked).',
  },
  mermaidError: { ro: 'Diagrama are o eroare de sintaxă. Cod brut:', en: 'Diagram has a syntax error. Raw code:' },
  notFound: { ro: 'Pagina nu există.', en: 'Page not found.' },
  sourcesTitle: { ro: 'Surse folosite (din registru)', en: 'Sources used (from registry)' },
  testLesson: { ro: 'Lecție de test pentru schelet', en: 'Skeleton test lesson' },
} satisfies Record<string, Record<Lang, string>>;

export type I18nKey = keyof typeof dict;

export function translate(key: I18nKey, lang: Lang): string {
  return dict[key][lang];
}

export function useT() {
  const { state } = useStore();
  return (key: I18nKey) => translate(key, state.lang);
}
