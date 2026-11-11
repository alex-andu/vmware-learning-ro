# CLAUDE.md — convențiile proiectului VMware Study LMS

LMS personal (Vite + React + TypeScript + Tailwind) plus cursul VMware de la Nivel 0 la VCP-VVF / VCP-VCF.
Rulează local, fără backend și fără bază de date. Utilizatorul e începător absolut.

## Comenzi

| Comandă | Ce face |
|---|---|
| `npm install && npm run dev` | Pornește aplicația local (http://localhost:5173) |
| `npm run validate` | Validează tot conținutul (structură lecții, frontmatter, Mermaid, quiz/lab JSON, surse, glosar) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint pe `src/` și `scripts/` |
| `npm run build` | `validate` + `typecheck` + `vite build`. Eșuează dacă vreo diagramă Mermaid e invalidă. |
| `npm run test:e2e` | Test în browser (Playwright): toate funcțiile LMS + Mermaid fără erori + layout pe telefon. Local cere `npm i -D playwright && npx playwright install chromium`. |

La fiecare etapă: rulează `build`, `lint`, `test:e2e` înainte de commit.

## Conținutul vine de la Alex (din 2026-11-11)

Teoria cursului o scrie Alex. Claude se ocupă **doar de integrarea ei în platformă**: nu scrie, nu cercetează și nu rescrie lecții.

- Capitolele lui Alex sunt în `/mnt/project-files/surse-alex/` (`cuprins.md` + `capitolul_X_Y_*.md`).
- Import: `node scripts/import-alex.mjs <folder>`. Scriptul:
  - transformă `cuprins.md` în `content/modules.json` (Pilonii = module, Capitolele = capitole, cu subiectele din cuprins);
  - pune fiecare `capitolul_X_Y_*.md` în `content/pilon-X/<capitol>.ro.md`, cu secțiunile `:::` ale platformei, plus `.quiz.json` (din „QUIZ DE CERTIFICARE”) și `.lab.json` (din „Pasul N”);
  - marchează lecția cu `origin: alex` și etichetează ca `mermaid` blocurile de diagramă scrise fără limbaj.
- Textul lui Alex rămâne neschimbat. Greșelile de formatare (de exemplu o formulă `$…$` neînchisă) i le semnalăm lui Alex, nu le corectăm în tăcere.
- Formulele `$…$` se afișează cu KaTeX; diagramele Mermaid trebuie să fie valide (build-ul eșuează altfel).
- Capitolele din cuprins fără fișier apar „planificat” pe `/curriculum`, cu subiectele lor.
- Lecțiile vechi scrise de Claude (modulele 01–04) au fost scoase; sunt în istoricul git până la commitul c3692df.

## Structura conținutului

```
content/
  modules.json                 # generat din cuprins.md: id pilon-N, title, target (obiectivul), chapters[{id, number, title, topics, exam}]
  glossary.json                # glosar (tooltip-uri pentru abrevieri)
  sources.json                 # registru de surse (gol pentru lecțiile lui Alex; bibliografia e în secțiunea :::references)
  pilon-N/<capitol>.ro.md      # lecția (RO); lipsa EN afișează RO cu banner
  pilon-N/<capitol>.lab.json   # pașii de laborator (title + action; „why” e opțional)
  pilon-N/<capitol>.quiz.json  # întrebările lui Alex; explicația stă la varianta corectă
```

Validatorul verifică pentru `origin: alex` doar formatul: secțiunile `:::` în ordinea de mai jos (cele lipsă sunt permise), Mermaid valid, quiz cu 5 întrebări × 4 variante și exact una corectă, cu explicație. Regulile mai stricte (10 surse, abrevieri, `examSummaryEn`, 2 diagrame) rămân doar pentru lecții care nu sunt ale lui Alex.

Ordinea secțiunilor: `analogy` (Introducerea profesorului), `architecture` (Arhitectură), `exam-alert` (Cutia cu secrete), `trenches` (Din tranșee), `interview`, `lab`, `quiz`, `references` (Bibliografie).

Lecțiile NU se hardcodează în componente; loader-ul (`src/lib/content.ts`) le citește prin `import.meta.glob`.

## Cod

- Persistență doar în LocalStorage, cheia `vmw-lms:v1` (`src/lib/storage.tsx`), cu try/catch la fiecare acces și export/import JSON.
- Textele UI în `src/lib/i18n.ts` (RO + EN). Secțiunile vizuale în `src/components/sections.tsx`.
- Harta `components` din `LessonMarkdown` trebuie să rămână stabilă (definită la nivel de modul); altfel quiz-ul se resetează la fiecare update de stare.
- Fără funcții în plus față de cerințe. Deciziile noi se notează în `docs/DECISIONS.md`.
