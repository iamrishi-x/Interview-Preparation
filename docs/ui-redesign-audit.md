# UI Redesign Audit

Date: 2026-08-16  
Scope: Phase 1 audit only (no application code changes)

## 1) Architecture

### 1.1 Current app surfaces
- Primary study site: static multi-page site under `code/`.
- Secondary legacy tool: standalone question manager at `Interview question/questions.html`.

### 1.2 Primary study site (`code/`)
- Rendering model: static HTML pages with shared CSS and one shared JS file.
- Routing model: file-based links (`index.html` + `pages/*.html`), no client-side router.
- State model: browser `localStorage` (`genai_prep_progress_v1`) for checklist progress and JSON import/export.
- Theming: light/dark via `data-theme` attribute and token overrides in CSS.
- Shared UI primitives are CSS class-based (`panel`, `button`, `checklist`, `question-list`, etc.), not componentized in JS.

### 1.3 Legacy question manager (`Interview question/questions.html`)
- Single-page app in one HTML file.
- Uses CDN dependencies: Tailwind, Chart.js, Font Awesome.
- State/data: `localStorage` (`genai_questions_db`) with CRUD + import/export JSON.
- Heavy inline JS + inline CSS in one document.

### 1.4 Architectural observation
- There are effectively two separate products with different UI systems and different interaction models.
- Current `code/` app is content-led and roadmap/checklist oriented.
- Legacy question manager is operational/CRUD oriented.

## 2) Pages

### 2.1 Primary study site pages
- `code/index.html` (home/hero + project stories)
- `code/pages/roadmap.html` (phase timeline + P0 checklist + story sections)
- `code/pages/rag.html` (topic deep dive)
- `code/pages/agentic-ai.html` (topic deep dive)
- `code/pages/mcp.html` (topic deep dive)

### 2.2 Legacy page
- `Interview question/questions.html` (question CRUD + filters + chart)

### 2.3 Coverage gap vs target IA
Target IA from redesign plan expects a compact Interview OS with:
- HOME: Dashboard
- PREPARE: Roadmap, Topics, Questions, Flashcards
- PRACTICE: AI Interview, Mock Interview, Coding
- ANALYZE: Progress, Weak Areas, Performance
- SYSTEM: Settings

Current implementation only partially covers:
- Prepare-like content (roadmap and 3 topic pages)
- Basic progress checklists
- No dashboard command center, no dedicated practice flows, no analytics surfaces, no settings page.

## 3) Components

### 3.1 Current reusable patterns (primary site)
- Header/nav shell with mobile toggle
- Theme toggle
- Hero block
- Panel/card (`.panel`)
- Button variants (`.button-primary`, `.button-secondary`)
- Checklist rows (`.check-item` with checkbox)
- Question list blocks
- Timeline rail (`.priority-rail`, `.rail-step`)
- On-this-page aside (`details` + generated links)
- Progress tools (import/export controls)

### 3.2 Current reusable patterns (legacy page)
- Filter chips
- Search input
- Question cards with edit/copy/delete actions
- Chart panel
- Add/Edit modal

### 3.3 Component maturity issues
- Reuse is CSS-convention reuse, not a formal design-system primitive set.
- No standardized states for loading/empty/error in primary site flows.
- No consistent button hierarchy across both surfaces.
- Different systems for comparable controls between `code/` and legacy page.

## 4) Current Styling

### 4.1 Primary study site style system
- Custom tokens in `code/css/tokens.css`.
- Cyan-accented, very light background in light mode and dark blue in dark mode.
- Typography: Sora (display), Source Sans 3 (body), IBM Plex Mono (meta).
- Layout: top navigation + centered content container (`min(1200px, 100%-2rem)`).
- Card/panel heavy sections, dashed flow blocks, bright cyan accents.

### 4.2 Legacy page style system
- Tailwind utility styling with independent color language.
- Distinct visual tone from primary site (separate spacing, radius, typography, visual density).
- Chart-heavy management dashboard aesthetics.

### 4.3 Style-system fragmentation
- Two visual languages coexist.
- Token naming and visual grammar do not align with redesign target palette.
- Current design feels educational/content-site first, not Interview OS/command center first.

## 5) UX Issues

### 5.1 Navigation and information architecture
- No persistent product-level IA matching target (Home/Prepare/Practice/Analyze/System).
- Current nav is topic-oriented only and does not expose clear “what next” workflow.
- No global “continue preparation” or prioritized next action logic.

### 5.2 Workflow clarity
- Roadmap checklists are useful but isolated by page.
- User cannot see readiness, weak areas, and next best action in one place.
- No interview-mode flow (answer -> reveal -> feedback -> next).

### 5.3 Learning progression
- Topic pages are largely static content blocks with checklist/questions lists.
- Lack of progressive state model per topic (not started/in progress/mastered).
- No cross-page reinforcement loop from weak areas back to practice.

### 5.4 Interaction and state
- Import/export is present but surfaced as utility controls, not integrated progress UX.
- No explicit empty/error/loading states for key user journeys in primary app.

### 5.5 Mobile UX
- Responsive behavior works structurally, but dense content still feels long-scroll and low-priority.
- Mobile nav supports menu toggle, but IA depth remains shallow.

## 6) Visual Issues

### 6.1 Hierarchy
- Hero messaging is strong but secondary sections become card/list-heavy quickly.
- Important strategic actions are not visually dominant after first fold.

### 6.2 Card usage and density
- Frequent use of bordered panels/cards for many sections creates visual sameness.
- Limited contrast between primary and secondary information regions.

### 6.3 Target mismatch
- Current aesthetic reads as polished study microsite, not premium technical command center.
- Lacks dark-first Interview OS character and focused “control room” framing.

### 6.4 Consistency across surfaces
- Legacy page visual language diverges from primary app significantly.
- Inconsistent control styling (buttons, chips, cards, inputs) between two surfaces.

## 7) Technical Constraints

- Static HTML/CSS/JS architecture must be preserved unless explicitly changed.
- No backend/API currently in `code/`; existing functionality is browser-local state.
- Existing data contracts to preserve:
  - `genai_prep_progress_v1` state shape/version in `code/js/main.js`
  - Import/export JSON compatibility for checklist state
  - `genai_questions_db` + import/export behavior in legacy page if retained
- File-based routes should remain stable to avoid broken links/bookmarks.
- Progressive enhancement is required for mobile nav, on-page links, and theme toggle.
- Keep accessibility baseline (skip link, semantic headings, focus visibility).
- If legacy page is integrated or redesigned, dependency strategy must be decided (retain CDN utilities vs migrate into shared CSS/JS system).

## 8) Redesign Mapping (Current -> Target)

### 8.1 Product shell
- Current: top nav + page content per route.
- Target: sticky sidebar + top bar + constrained command-center main layout.

### 8.2 Home
- Current: marketing-like hero + links.
- Target: operational dashboard answering “what should I do now?” with continue prep/readiness/weak areas/today challenge.

### 8.3 Prepare surfaces
- Current: roadmap + 3 topic pages with checklists.
- Target: roadmap + topic catalog + topic detail modes + interview-style question experience + flashcards.

### 8.4 Practice surfaces
- Current: none in primary site (legacy question manager partly overlaps as CRUD).
- Target: AI interview, mock interview, coding practice shell (only if supported by existing functionality).

### 8.5 Analyze surfaces
- Current: no dedicated progress analytics page.
- Target: progress trends, weak areas queue, performance surfaces (honest data only).

### 8.6 System
- Current: theme toggle only.
- Target: settings/system area (at minimum profile/preferences/progress controls).

### 8.7 Design language
- Current: cyan-heavy study aesthetic + mixed secondary app style.
- Target: dark-first, restrained premium developer workspace using redesign token set and unified primitives.

## 9) Implementation Phases (Recommended)

### Phase 1 (done)
- Complete audit and target mapping.

### Phase 2
- Establish token foundation and shared primitives in existing CSS system.
- Define canonical components: buttons, inputs, badges, tabs, progress, empty/error/loading.

### Phase 3
- Rework global app shell (sidebar/topbar/mobile drawer) without breaking routes and existing page content.

### Phase 4
- Redesign Home into dashboard command center using real available progress data only.

### Phase 5
- Redesign Roadmap + topic flows.
- Introduce explicit topic states and stronger “next action” affordances.

### Phase 6
- Introduce/reshape Practice surfaces (AI/mock/coding) based only on supported functionality.

### Phase 7
- Add Analyze surfaces (progress/weak areas/performance) with honest data states.

### Phase 8
- Full polish pass: responsive QA, a11y QA, focus/hover/empty/error/loading states, visual consistency checks.

## 10) Files Likely to Change

### High likelihood (primary site)
- `code/index.html`
- `code/pages/roadmap.html`
- `code/pages/rag.html`
- `code/pages/agentic-ai.html`
- `code/pages/mcp.html`
- `code/css/tokens.css`
- `code/css/base.css`
- `code/css/components.css`
- `code/css/pages.css`
- `code/js/main.js`

### Potentially affected (depending on integration decision)
- `Interview question/questions.html` (if folded into shared Interview OS IA or restyled to unified system)
- `Interview question/genai_questions_backup.json` (schema should remain stable if legacy import/export retained)

## 11) Notes on Requested Plan File

- `interview-prep-codex-redesign-plan.md` was not found in the repository.
- Audit target was mapped to the available redesign source:
  - `.codex/skills/interview-prep-redesign/SKILL.md`
  - `.codex/skills/interview-prep-redesign/references/phases.md`
  - `.codex/skills/interview-prep-redesign/references/screens.md`
  - `.codex/skills/interview-prep-redesign/references/full-plan.md`