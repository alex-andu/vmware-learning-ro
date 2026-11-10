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

## Structura conținutului

```
content/
  modules.json                 # module: id, order, title, target, competency (CV), labTitle, chapters[{id,title,exam[],examNote}] — RO + EN
  glossary.json                # glosar global: id, term, aliases, abbr, expansion, ro, en
  sources.json                 # registrul de surse: id (S01…), title, url, type, accessed, read, usedBy
  <modul>/<lecție>.ro.md       # lecția (RO e varianta de referință, obligatorie)
  <modul>/<lecție>.en.md       # varianta EN (opțională; lipsa ei afișează RO cu banner)
  <modul>/<lecție>.lab.json    # checklist-ul de lab (pași cu title/path/action/why, RO+EN)
  <modul>/<lecție>.quiz.json   # exact 5 întrebări, 4 variante, 1 corectă, explicație la FIECARE variantă
docs/
  STATE_OF_THE_ART.md          # rezultatul Pasului 0 (verificare web, cu dată)
  DECISIONS.md                 # decizii luate fără a întreba
```

Lecțiile NU se hardcodează în componente; loader-ul (`src/lib/content.ts`) le citește prin `import.meta.glob`.

## Șablonul lecției (strict, validat la build)

Frontmatter obligatoriu: `title`, `summary`, `order`; recomandat `level`, `examTargets`, `sources` (id-uri din `sources.json`), `updated`, `glossaryTerms`. Varianta RO cere `examSummaryEn` (rezumatul în engleză pentru examen). `status: test` doar pentru lecția de test.

Corpul are exact aceste 8 blocuri `:::`, în ordinea asta (ele formează cele 6 părți ale lecției):

1. `:::analogy` — Introducerea Profesorului & analogia (durerea din data center + analogie din viața de zi cu zi)
2. `:::architecture` — teorie de la simplu la complex; **minim 2 diagrame Mermaid** (arhitectură + flux/decizie), tabel comparativ, sugestii `[IMAGE SEARCH / PROMPT]`
3. `:::exam-alert` — De memorat (porturi, limite, cerințe, cu sursă) + 3 capcane de examen
   `:::trenches` — 2 greșeli din producție, cu remediere și concept/KB oficial
4. `:::interview` — 1 întrebare Junior/Mid + 1 scenariu de troubleshooting, cu răspunsul ideal
5. `:::lab` — scenariu, test de avarie/validare; pașii bifabili stau în `.lab.json` (fiecare cu „De ce?”)
6. `:::quiz` — intro scurt; întrebările stau în `.quiz.json`
   `:::references` — 5–10 resurse specifice; lista din `sources` se afișează automat dedesubt

## Reguli de conținut (nenegociabile)

- **Fără KB-uri, porturi, limite sau comenzi inventate.** Totul se verifică în documentația oficială a versiunii vizate. Ce nu se poate verifica primește `⚠ de verificat` în text.
- Fiecare lecție: minim 10 surse citite efectiv (țintă 20+ la modulele grele), adăugate în `content/sources.json`. Validatorul refuză lecțiile non-test cu sub 10 surse.
- Citările inline folosesc `[Sxx]`; validatorul verifică că id-ul există.
- Parafrazează. Citate sub 15 cuvinte, doar cu atribuire. Fără exam dumps; quiz-urile sunt originale, în stil VCP.
- Quiz-ul NU amestecă variantele la afișare: poziția răspunsului corect (`correct`) se variază manual de la o întrebare la alta (nu mereu prima variantă).
- Marchează clar „supported” vs „home-lab only / not supported”.
- Explicații în română; termenii tehnici în engleză, explicați la prima apariție.
- **Orice abreviere se explică la prima apariție** (forma completă imediat lângă ea). Validatorul verifică asta pentru toate abrevierile din `glossary.json` (`abbr` + `expansion`); o abreviere nouă se adaugă întâi în glosar.
- Id-ul lecției (numele fișierului) trebuie să fie un capitol din `modules.json`. Pagina `/curriculum` arată toate capitolele; cele fără fișier apar „planificat”.
- Home Lab-ul nu face parte din curs: lecțiile presupun că lab-ul există.
- Versiunea predată: VCF/VVF **9.0** (ce acoperă examenele), cu diferențele 9.1 semnalate. Vezi `docs/STATE_OF_THE_ART.md`.

## Cod

- Persistență doar în LocalStorage, cheia `vmw-lms:v1` (`src/lib/storage.tsx`), cu try/catch la fiecare acces și export/import JSON.
- Textele UI în `src/lib/i18n.ts` (RO + EN). Secțiunile vizuale în `src/components/sections.tsx`.
- Harta `components` din `LessonMarkdown` trebuie să rămână stabilă (definită la nivel de modul); altfel quiz-ul se resetează la fiecare update de stare.
- Fără funcții în plus față de cerințe. Deciziile noi se notează în `docs/DECISIONS.md`.
