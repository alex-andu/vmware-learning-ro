# Decizii

Decizii luate fără a întreba (reversibile). Cea mai nouă sus.

## 2026-11-10 — Etapa 2

13. **Home Lab scos din curs.** Alex se ocupă singur de cerințele de sistem și de construirea lab-ului; lecțiile presupun că lab-ul există (un host ESXi, apoi un cluster nested). Înlocuiește punctul 12 pentru partea de Home Lab.
14. **Capitolele stau în `modules.json` (`chapters`)**, cu codurile de obiectiv din exam guide (`exam`, ex. „VVF 2.2.3”) și o notă opțională (`examNote`). Un capitol fără fișier `.ro.md` apare ca „planificat”. Validatorul refuză o lecție al cărei id nu e capitol al modulului.
15. **Capitolul-pilot este 1.1** („Ce este virtualizarea”), rescris complet (19 surse); `status: test` a fost scos. Validarea lui Alex după pilot a fost sărită la cererea lui; capitolele următoare se scriu direct.
16. **Regula abrevierilor e verificată automat.** Orice abreviere din glosar (câmpul `abbr`) trebuie să aibă forma completă (`expansion`) la cel mult ~200 de caractere înainte sau ~250 după prima apariție în lecție. În UI, abrevierile primesc `<abbr title>` și o legendă la final (lecție și curriculum).
17. **Varianta EN** se scrie pentru fiecare capitol nou; dacă lipsește, aplicația afișează RO cu banner (comportamentul din Etapa 1 rămâne).
18. **Maparea pe examene:** codurile DCV și NV sunt din ghidurile Legacy (2V0-21.23, 2V0-41.24), folosite doar ca hartă de conținut. Unde ghidul 9.0 folosește alt nume decât produsul (ex. „VCF Network Gateway” pentru NSX Edge), nota de capitol o marchează `⚠ de verificat`.

## 2026-11-10 — Etapa 1

1. **Ținta principală de examen: VCP-VVF Administrator (2V0-16.25).** VCP-DCV (2V0-21.23) e încă listat, dar în grupa „Legacy”; îl folosim doar ca hartă de conținut. VCP-VCF Administrator (2V0-17.25) e a doua țintă. Motiv: `STATE_OF_THE_ART.md` §1.
2. **Versiunea predată: 9.0**, cu note pentru 9.1. Examenele acoperă 9.0, deși VCF 9.1.1 e ultima versiune.
3. **Kubernetes (VKS / vSphere Supervisor) și VCF Operations intră în Modulul 2.** Ambele exam guide-uri 9.0 le cer; promptul nu le menționa.
4. **Networking-ul din Modulul 4 folosește terminologia VCF 9** („VCF Networking”, „VCF Network Gateway”), cu NSX ca tehnologie de bază, pentru că exam guide-ul 2V0-17.25 nu numește NSX direct.
5. **Secțiunile lecției sunt blocuri `:::` (remark-directive)** în Markdown, nu componente. Ordinea e verificată la build. Cele 6 părți cerute devin 8 blocuri vizuale (partea 3 = Exam Alert + Din tranșee; partea 6 = Quiz + Referințe), ca să corespundă celor 8 secțiuni colorate cerute.
6. **Rezumatul și glosarul în engleză** stau în frontmatter (`examSummaryEn`, `glossaryTerms`) și se afișează la finalul lecției, după cele 6 părți, ca să nu strice ordinea strictă.
7. **Validarea Mermaid la build** se face cu `mermaid.parse()` sub jsdom (`scripts/validate-content.mjs`), fără browser headless. Testul în browser (`npm run test:e2e`) verifică randarea efectivă.
8. **Căutare: MiniSearch**, index construit în browser la prima căutare, per limbă, cu diacriticele ignorate.
9. **Versiuni de pachete:** Vite 8, React 18, Tailwind 4, ESLint 9 (ESLint 10 nu e încă compatibil cu pluginurile folosite).
10. **Playwright nu e în `devDependencies`**: e instalat global în mediul de dezvoltare cloud. Local se instalează separat (vezi `CLAUDE.md`).
11. **Lecția de test** („Ce este virtualizarea”) are `status: test` și doar 7 surse; validatorul o scutește de pragul de 10. Va fi rescrisă complet în Etapa 3 sau înlocuită de capitolul-pilot.
12. **Modulele 2–5 și Home Lab nu apar încă în `modules.json`**; se adaugă în Etapa 2, odată cu curriculumul complet.

## 2026-11-11 — Capitolele scrise de Alex (0.1–2.1 + cuprins)
Le folosim ca sursă de idei, nu ca text: se suprapun cu modulele 1–2 deja scrise. Am adăugat doar ce lipsea și am putut verifica oficial (compatibilitatea hardware și procesoarele deprecated/EOL în 9.0 la lecția 1.4; fișierele snapshot, SEsparse și memorie vs quiesce la lecția 1.6). KB-urile, porturile și limitele din fișiere nu au fost copiate. Partea de dimensionare a home lab-ului (0.3) rămâne în afara cursului.

## 2026-11-11 — Cursul trece pe capitolele lui Alex
Alex: „vreau sa folosesti exact ce-ti dau de acum inainte ca si knowledge base” și „te vei ocupa doar de partea de integrare in platforma a teoriei pe care ti-o dau”.
- Structura urmează `cuprins.md` (Pilonii 0–5, 26 de capitole); lecțiile vechi (modulele 01–04, scrise de Claude) au fost scoase și rămân în istoricul git (ultimul commit cu ele: c3692df).
- Capitolele 0.1–2.1 sunt importate neschimbate cu `scripts/import-alex.mjs`; capitolul 0.3 (home lab) intră acum în curs, fiind textul lui Alex.
- Formulele LaTeX (`$…$`) se afișează cu KaTeX (remark-math + rehype-katex); pe telefon, formulele lungi, codul și tabelele se derulează în cutia lor.
- Quiz-ul păstrează ordinea variantelor lui Alex; explicația lui apare sub întrebare după răspuns.
- Lecțiile lui Alex sunt doar în română; comutarea pe EN afișează RO cu banner.
