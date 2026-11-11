# State of the Art — verificare (Pasul 0)

**Data verificării:** 10 noiembrie 2026
**Metodă:** web search + citirea paginilor (WebFetch și un browser real pentru paginile Broadcom randate în JavaScript).
**Regulă:** tot ce e marcat `⚠ neverificat` nu a putut fi confirmat dintr-o sursă oficială și NU trebuie predat ca fapt.

> Rezumat pentru grabă: certificările VCP actuale sunt pe **VCF/VVF 9.0** (coduri `.25`). **VCP-DCV (2V0-21.23)** și **VCP-NV (2V0-41.24)** sunt încă listate de Broadcom, dar în grupa **„VMware Legacy Certifications”**, cu link de înregistrare activ la data verificării. Ultima versiune de produs este **VCF 9.1.1** (3 sept. 2026), dar examenele VCP-VVF/VCP-VCF acoperă oficial **9.0**.

---

## 1. Certificări VMware / Broadcom

### 1.1 Ce listează Broadcom azi (pagina oficială, citită în browser pe 10.11.2026)

Sursă: [broadcom.com/support/education/vmware/certification](https://www.broadcom.com/support/education/vmware/certification) [S01]

| Grupă | Certificare | Cod examen | Produs vizat |
|---|---|---|---|
| VCF – Professional | VCP-VVF Administrator | **2V0-16.25** | VMware vSphere Foundation **9.0** |
| VCF – Professional | VCP-VCF Administrator | **2V0-17.25** | VMware Cloud Foundation **9.0** |
| VCF – Professional | VCP-VCF Architect | 2V0-13.25 | VCF 9.0 (din titlul cursului) |
| VCF – Professional | VCP-VCF Support | 2V0-15.25 | VCF 9.0 |
| VCF – Professional | VCP-VVF Support | 2V0-18.25 | VVF 9.0 |
| VCF – Advanced | VCAP Automation / Operations / Storage / VKS / Networking | 3V0-21.25 / 22.25 / 23.25 / 24.25 / **25.25** | VCF 9.0 |
| VCF – Advanced | VCAP-VCF Architect / Administrator / Support | 3V0-12.26 / 11.26 / 13.26 | VCF 9 |
| **Legacy** | **VCP-DCV** | **2V0-21.23** (vSphere 8.x Professional) | vSphere 8 |
| **Legacy** | **VCP-NV** | **2V0-41.24** (NSX 4.x Professional) | NSX 4.x |

### 1.2 Detalii examene țintă

| | 2V0-16.25 (VCP-VVF Admin) | 2V0-17.25 (VCP-VCF Admin) | 2V0-21.23 (VCP-DCV, legacy) | 2V0-41.24 (VCP-NV, legacy) |
|---|---|---|---|---|
| Întrebări | 60 | 60 | 70 | 70 |
| Durată | 135 min | 135 min | 135 min | 135 min |
| Prag | 300 (scaled) | 300 (scaled) | 300 (scaled) | 300 (scaled) |
| Preț | $250 | ⚠ neverificat pe pagina proprie (probabil $250) | $250 | $250 |
| Livrare | Pearson VUE, proctored | Pearson VUE, proctored | proctored | proctored |
| Surse | [S02], [S04] | [S03] | [S05] | [S06] |

Structura ambelor exam guide-uri 9.0 (VVF și VCF) este aceeași: Secțiunea 2 „Fundamentals” (compute, storage, network, **VKS** — vSphere Kubernetes Service) și Secțiunea 4 „Deploy, Configure, Operate” (deploy/manage/operate/consume & automate). Secțiunile 1, 3 și 5 nu au obiective testabile. [S02][S03]

**Implicații pentru curriculum (semnalate explicit):**
- Ambele examene noi cer **cunoștințe Kubernetes de bază** (VKS / vSphere Supervisor). Promptul inițial nu menționa Kubernetes → îl adaug ca subcapitol în Modulul 2 (vezi `DECISIONS.md`).
- Examenul VCF 9.0 Admin **nu numește NSX direct** în obiective; networking-ul apare ca „VCF Networking”, „VCF Network Gateway”, „VCF Operations for Networks”. NSX rămâne relevant ca tehnologie, dar terminologia examenului e VCF. [S03]
- VVF 9.0 include în competențe **VCF Operations** și **VCF Operations for Logs** — de adăugat la Modulul 2. [S02]

### 1.3 Contradicția privind retragerea VCP-DCV — ce am găsit

| Sursă | Ce spune | Tip |
|---|---|---|
| Pagina oficială VCP-DCV [S05], citită 10.11.2026 | Examen 2V0-21.23 cu buton „Register for Exam” activ, **fără dată de retragere** | Oficial |
| Pagina principală Certification [S01] | VCP-DCV și VCP-NV mutate în **„VMware Legacy Certifications”** | Oficial |
| „Retired Exams and Certifications” [S07], ultima actualizare **iulie 2025** | **Nu** conține 2V0-21.23, 2V0-41.24, VCP-VVF, VCP-VCF. Conține doar exame mai vechi (ex. 2V0-21.20 retras 31.01.2024) | Oficial (dar vechi) |
| Postare r/vmware (snapshot 15.12.2025) [S08] | Citează o notificare: „retiring on Dec 15, 2025”, înregistrări închise 31.10.2025 | Comunitate |
| Trainingcamp (28.07.2026) [S09] | Nu a putut verifica data de 15.12.2025; singura retragere Broadcom la acea dată e 2V0-12.24 (VVF 5.2 Admin) | Blog terț |
| CertCrush (01.09.2026) [S10] | VCP-DCV mutat la Legacy, pagina are încă link de înregistrare; „still sittable but not being extended” | Blog terț |

**Concluzie:** la 10.11.2026 Broadcom listează încă VCP-DCV ca disponibil (legacy). Anunțul de retragere din 15.12.2025 citat pe Reddit **nu se confirmă** pe sursele oficiale actuale. `⚠ neverificat`: dacă înregistrarea chiar funcționează la Pearson VUE (nu am încercat, ar necesita cont). **Recomandare:** ținta principală e **VCP-VVF Administrator (2V0-16.25)**; VCP-DCV doar ca hartă de conținut, nu ca obiectiv de examen.

### 1.4 Versiuni de produs

Sursă: KB 314608 „Correlating VMware Cloud Foundation version…” [S11]

| VCF | Data lansării |
|---|---|
| 9.0 | 17 iun. 2025 |
| 9.0.1.0 | 29 sep. 2025 |
| 9.0.2.0 | 20 ian. 2026 |
| 9.1.0 | 12 mai 2026 |
| 9.1.1 | 3 sep. 2026 |

- Versiunile exacte ESX/vCenter/NSX/vSAN per release: `⚠ neverificat` (KB-ul trimite la release notes; nu le-am citit încă). În VCF 9, componenta „ESXi” e denumită **ESX** în documentație și pe blogurile oficiale. [S29]
- Există mențiuni (bloguri, Udemy) despre exame „9.1” — `⚠ neverificat`, Broadcom nu listează niciun cod pentru 9.1 la data verificării.

### 1.5 N-VDS în NSX 4.x — confirmat

KB 410467 [S13]: suportul N-VDS pe **hosturi ESXi** a fost eliminat începând cu **NSX 4.0.0.1**; NSX necesită **VDS** pe ESXi. N-VDS rămâne doar pe **NSX Edge**, bare-metal și agenți de public cloud. → Promptul spune „depreciat”; realitatea e mai strictă: **eliminat** pe ESXi.

---

## 2. Licențiere pentru home lab

| Opțiune | Status verificat | Limitări | Surse |
|---|---|---|---|
| **VMware Workstation Pro** | **Gratuit pentru toți** (personal, educațional **și comercial**) din **11 nov. 2024**. Nu se mai vinde licență Pro. | Fără suport cu tichet pentru utilizatorii noi (doar forum/docs) | [S14] |
| **ESXi 8.0 Update 3e Free** (build 24677879) | Disponibil gratuit din Broadcom Support Portal → My Downloads → Free Software Downloads → „VMware vSphere Hypervisor” | Max **8 vCPU/VM**; **nu** se poate adăuga în vCenter; fără vMotion/DRS/HA; fără backup VADP; API-uri nesuportate sau read-only; fără suport | [S15], [S16] |
| ESXi ISO normal (24674464) | Pornește cu **evaluare de 60 de zile** (toate funcțiile) | Expiră; hostul instalat cu ISO-ul Free **nu** poate intra în trial | [S16] |
| **VMUG Advantage** | Din 2025, licențele VVF/VCF pentru membri cer **membership activ + certificare VCP-VVF sau VCP-VCF**. EvalExperience vechi s-a închis la 30.11.2024 | Preț `⚠ neverificat` (nu apare în documentele citite) | [S17] |

**Contradicție de semnalat:** KB-ul oficial 399823 spune „up to **2 physical CPUs** per host” pentru ESXi Free; NAKIVO (actualizat 2.06.2026) spune „unlimited physical CPUs”. **Prevalează KB-ul oficial** → 2 socket-uri. Pentru un home lab nu contează (un singur socket).

**Implicație practică (important):** ESXi Free nu poate fi gestionat de vCenter → un lab real de vCenter/HA/DRS/vSAN cere fie **evaluare 60 zile** (refăcută periodic), fie licențe **VMUG Advantage** (după ce iei VCP). Nested ESXi nu consumă licențe în plus față de hostul fizic doar pentru că e nested — dar hosturile nested au nevoie și ele de licență/evaluare. `⚠ de verificat` detaliul de licențiere nested pentru 9.x.

---

## 3. Cerințe de resurse pentru lab nested

### 3.1 Politica de suport

KB 313547 [S18]: Broadcom **nu suportă** ESXi nested în producție; e încurajat pentru învățare, testare, demo. Singurul scenariu suportat: **vSAN Witness Appliance** pe ESXi fizic (nu pe Workstation/Fusion). → Tot labul acestui curs este **home-lab only / not supported**.

### 3.2 Componente — cifre verificate

**vCenter Server Appliance 8.0** (TechDocs [S19]):

| Mărime | Hosturi | VM-uri | vCPU | RAM |
|---|---|---|---|---|
| **Tiny** | 10 | 100 | 2 | **14 GB** |
| Small | 100 | 1.000 | 4 | 21 GB |
| Medium | 400 | 4.000 | 8 | 30 GB |

(KB 435110 confirmă 14 GB pentru Tiny în 8.0, față de 12 GB în 7.0. [S20]) Storage per mărime: `⚠ neverificat` (pagină separată, necitită).

**ESX 9** minim: 2 nuclee CPU x64, 8 GB RAM (12 GB+ recomandat), 1 NIC compatibil (2+ recomandat) — sursă secundară NEC care citează documentația Broadcom [S21]. `⚠ de verificat` direct pe TechDocs 9.x.

**VCF 9.0 minimal lab (William Lam, iun. 2025) [S22]:**

| Componentă | vCPU | RAM | Disc provizionat | Disc folosit |
|---|---|---|---|---|
| vCenter | 4 | 21 GB | 642 GB | ~30 GB |
| NSX Manager | 6 | 24 GB | 300 GB | ~14 GB |
| SDDC Manager | 4 | 16 GB | 931 GB | ~77 GB |
| VCF Operations | 4 | 16 GB | 290 GB | ~13 GB |
| VCF Ops Fleet Manager | 4 | 12 GB | 206 GB | ~117 GB |
| VCF Ops Collector | 4 | 16 GB | 280 GB | ~11 GB |
| VCF Automation | 24 | 96 GB | 626 GB | ~72 GB |

Totalul declarat în articol (48 vCPU / 194 GB) **nu se potrivește** cu suma rândurilor (50 vCPU / 201 GB) — semnalez, folosim suma rândurilor. VCF Automation cere un host cu ≥12 nuclee/24 fire; vCPU-ul poate fi redus manual la 16 (neoficial). Fără workaround pentru RAM.

**vSAN:**
- ESA nested (Lam, 2022) [S23]: min. **16 GB RAM/host** pentru 1 disc ESA (pre-check dur), 18 GB pentru 2; avertismentul de 25 GbE se ignoră (vNIC-ul apare ca 10 GbE). OSA nested: 8 GB/host. ESA suportat doar pe ReadyNode HCL.
- ESA cerințe oficiale reduse (blog VMware, nov. 2025) [S24]: profilul HCI minim pornește de la 16 nuclee și ≥1 NVMe/host; 10 Gb suportat pe cel mai mic ReadyNode, 25 Gb+ recomandat.
- Workaround HCL pentru VCF 9.0 [S25]: „vSAN ESA Hardware Mock VIB”; din **VCF 9.0.1** nu mai e necesar (bypass direct în VCF Installer). **Not supported.**

### 3.3 Trucurile lui William Lam (verificate pe blog)

| Truc | Ce face | Status | Sursă |
|---|---|---|---|
| **Nested ESXi Virtual Appliance** | OVA preconfigurat pentru nested; 8.x gratuit din BSP → Free Downloads → Flings; **9.x cere entitlement VVF/VCF** (sau VMUG Advantage + VCP-VCF) | Fling, nesuportat | [S26] |
| **MAC Learning** în loc de Promiscuous | Pe **VDS** (vSphere 7/8+) sau segment NSX (MAC Discovery profile). Pe **VSS nu există** → rămâi la Promiscuous + Forged Transmits | Recomandat | [S27] |
| **NVMe Memory Tiering** | Suportat oficial din VCF 9.0 pentru producție. În 9.0, VM-urile nested ESXi/VHV **nu porneau** cu tiering activ; în **9.1** merge, cu setarea VM `sched.mem.enableNestedTiering = true` | Tiering: supported; nested: lab-only | [S28], [S29], [S30] |
| AMD Ryzen + NVMe Tiering | `monitor_control.disable_apichv = "TRUE"`; Ryzen nu e pe Compatibility Guide | Lab-only | [S31], [S30] |
| AMD Ryzen + NSX Edge | DPDK nu merge pe Ryzen consumer → mascare `cpuid.brandstring` ca EPYC | Lab-only | [S30] |
| VCF pe 1 host | Flag în `/home/vcf/feature.properties` pe VCF Installer + deploy din JSON | Nesuportat | [S32] |
| Deployment scripts | `github.com/lamw/vcf-fleet-automated-lab-deployment` (VCF/VVF 9.1, 3 nested ESX, ~25 min) | Comunitate | [S33] |

### 3.4 Intel vs AMD / CPU în VCF 9

- VCF 9.0 **elimină suportul pentru mai multe generații de CPU** vechi; lista oficială e în **KB 318697** (`⚠ necitit încă`, de verificat în Etapa 2). [S34]
- Hardware consumer din ultimii 2–3 ani, cu ≤8 nuclee/16 fire, rulează ESX 9 dar **nu** poate rula VCF Automation. [S22], [S35]
- AMD Ryzen are mai multe workaround-uri specifice (entropie, tiering, DPDK). Intel Core/Xeon și AMD EPYC nu sunt afectate de problema de tiering. [S30], [S31]

---

## 4. Ce contrazice promptul inițial (prioritate pe datele verificate)

1. **VCP-DCV nu e retras** la 10.11.2026; e „Legacy” cu înregistrare activă. Data de 15.12.2025 nu se confirmă oficial.
2. **N-VDS** nu e doar depreciat: e **eliminat pe hosturi ESXi** din NSX 4.0.0.1.
3. **Workstation Pro** e gratuit și pentru uz **comercial**, nu doar personal (din 11.11.2024).
4. **ESXi Free 8.0U3e**: pe lângă limitele din prompt, e limitat la **2 CPU fizice** și **nu se poate adăuga în vCenter** — deci nu ajunge pentru laboratoarele de vCenter/HA/DRS.
5. Examenele 9.0 cer **Kubernetes de bază (VKS)** și **VCF Operations** — lipsesc din curriculumul propus.
6. Există **VCF 9.1** (mai 2026), dar examenele acoperă **9.0**. Lecțiile vor preda 9.0 și vor semnala diferențele 9.1.

## 5. Lista de neverificate (de închis în etapele următoare)

- Prețul 2V0-17.25 pe pagina proprie; prețul VMUG Advantage.
- Versiunile exacte ESX/vCenter/NSX/vSAN din VCF 9.0 și 9.1 (release notes).
- Cerințele de storage ale vCenter per mărime; cerințele ESX 9 direct pe TechDocs.
- Conținutul KB 318697 (CPU deprecate în VCF 9).
- Specificațiile implicite (vCPU/RAM/discuri) ale Nested ESXi Virtual Appliance 9.x.
- Licențierea hosturilor nested în VCF 9.

Registrul complet al surselor: `content/sources.json`.
