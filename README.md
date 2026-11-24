# Rehearse

Timed practice tests for finance interviews: https://antonlft.github.io/rehearse/

It's a static website: plain HTML, CSS and JavaScript, with no framework, no build step and no dependencies. Everything a user does is saved in their own browser; there is no server or account.

## Running it locally

From the project folder:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765/site/ (in Claude Code this is the `quiz-static` entry in `.claude/launch.json`).

## Checking the question bank

```bash
node scripts/validate-questions.mjs
node scripts/test-calculator.mjs
node scripts/test-widgets.mjs
node scripts/test-sprint.mjs
```

It loads every question file, calculation generator and lesson, and checks that each question has 4 unique options, 3 wrong-answer notes, an explanation and a unique ID, and that any `trap` tags are valid. It also checks that no option contains `NaN`/`Infinity`/`undefined`, that every file is loaded by `index.html`, and that every category exists in `app.js`. Each generator is run 50 times. It prints `✓ …` and exits with code 0 when everything passes, or lists each problem and exits with code 1. GitHub runs it before every deploy, and a failure stops the deploy. `test-calculator.mjs` does the same for the built-in calculator and for reading typed answers: it checks about 90 cases against hand-worked answers.

## How it's published

Every push to `main` runs `.github/workflows/pages.yml`:

1. **validate**: runs the question, calculator, widget and sprint checks above.
2. **deploy**: replaces `?v=dev` on every script and stylesheet link in `site/index.html` with the commit ID, then publishes the `site/` folder to GitHub Pages.

The version stamp makes browsers fetch matching files after each deploy. Any new `<script>` or stylesheet tag in `index.html` must end in `?v=dev`. GitHub Pages lets browsers cache the page itself for up to 10 minutes, so a hard refresh (Cmd + Shift + R) may be needed right after a deploy.

## Project layout

| Path | What it is |
|---|---|
| `site/index.html` | The page shell; loads every script in order |
| `site/styles.css` | All styles. Colours are tokens in `:root`, with a dark set for dark mode |
| `site/js/bank.js` | `Bank` (where questions are registered) and `R` (number/format helpers) |
| `site/questions/*.js` | Written questions, one file per category; `outloud.js` holds the extra out-loud prompts (`Bank.addOutLoud`) |
| `site/js/generators.js`, `generators-hl.js` | Calculation questions that get new numbers every round |
| `site/js/generators-paper.js` | The paper LBO trainer's five cases (`Bank.paper`), new numbers every time |
| `site/js/calculator.js` | The built-in calculator: a small expression parser (no `eval`) and its panel |
| `site/js/widgets.js` | Interactive "Try it" widgets for the lessons |
| `site/js/sprint.js` | The mental maths sprint's sums (8 kinds, friendly numbers) and a "how to get faster" trick for each kind; the sprint screen and results (one collapsible row per kind with your sums and its trick, and a progress chart), plus the "Progress & tips" overview opened from the home card, are in `app.js` |
| `site/js/app.js` | Everything else: categories, round building, quiz, results, saving |
| `site/lessons/*.js` | One lesson (Learn page) per category, all listed on the Lessons page (opened from the Lessons tile on the home page's Practice tab) |
| `site/js/glossary.js` | The glossary: every acronym and short term with its full name, a one-line definition and its category. Shown on the Glossary page and as hover/tap definitions in lessons and explanations (never in question text or options); outside a live quiz, the definition box also links to the term's lesson. The question check requires every acronym used in a lesson to have an entry |
| `scripts/validate-questions.mjs` | The question check |
| `scripts/test-calculator.mjs` | The calculator check |
| `scripts/test-widgets.mjs` | The lesson widget check |
| `scripts/test-sprint.mjs` | The sprint check: every kind of sum against a hand recomputation, over 20,000 samples |

## Question format

Written questions are added with `Bank.add(categoryId, [...])`:

```js
{ id: "val-03", lv: 2, q: "Question text",
  o: ["correct answer", "wrong 1", "wrong 2", "wrong 3"],   // correct answer always first; shuffled when shown
  why: "Why the correct answer is right",
  x: ["why wrong 1 is wrong", "why wrong 2 is wrong", "why wrong 3 is wrong"] }
```

- `id` is permanent. Saved stats and the answer log refer to it, so never rename, renumber or reuse an ID.
- `lv` (1 basic, 2 intermediate, 3 advanced) is optional. Every written question has one (the finance levels are a first pass, to be refined). Practising one category sorts questions from basic to advanced; a question without a level, such as most calculation questions, sorts as intermediate.
- `trap` is optional: a list of 3 mistake types, one per wrong option in the same order as `x` (or `null` for an untagged option). The allowed types are `TRAPS` in `site/js/bank.js`: `inverted`, `missed-step`, `wrong-measure`, `sign`, `units`, `double-count`, `concept`. By agreement, pure theory mistakes are left untagged, so `concept` is currently unused. When you pick a tagged wrong option, its type is logged and counted in the weak spots report.

Calculation questions are added with `Bank.gen(categoryId, key, () => ({ q, o, why, x, lv }))` and have no `id`. The `key` is a permanent name such as `"val-g5"` (category, `g`, then the next free number for that category); spaced repetition schedules the question by it, so a key must never change or be reused once published. The question check fails if a key is missing, badly formed or used twice.

**Question types.** A question with no `type` is multiple choice. A **typed-answer** question has `type: "numeric"`, a number `answer`, a `tolerance` (how far a typed answer may be off, in the same units), an optional `unit` (`%`, `x`, `US$m`, `US$` for plain amounts such as a price per share or per hotel room, or `years`), `dp` (decimal places for showing the answer) and optional `wrongs`: known wrong answers `{ value, note, trap }`. An **ordering** question has `type: "order"` and an `answer` listing 3–8 steps in the right order; it's shown shuffled (never already right), reordered with ▲ ▼, and only the exact sequence counts as right. A **classification grid** has `type: "grid"`, 2–4 `columns` and 3–8 `rows` of `{ text, answer: <column number>, note }`; rows are shown shuffled, one column is picked per row, and the question is right only if every row is (feedback says "4 of 6 right"). A **walk-through card** has `type: "walk"` and 3–8 `points` (the parts of a model answer), plus the usual `why` (a short tip): you answer out loud, press *Show model answer*, then grade yourself Got it / Partly / Missed (keys 1–3). Only "Got it" counts as correct, so Partly and Missed bring the card back sooner under spaced repetition. A round holds at most one card per 10 questions, cards never add to how many questions a category can supply, and a round with a card gets one extra minute per card. A multiple-choice or typed question may also carry a **table** (`table: { caption, corner, cols, rows: [{ head, cells }], base: [row, col] }`), shown under the question with the base-case cell highlighted; the sensitivity-table questions in Valuation use it. A **case study** has `type: "case"`, a scenario (`q`), a closing `why` and 3–8 linked typed `steps`, each shaped like a typed-answer question; it's built by `Bank.case` (below). Steps open one at a time: *Check step* locks a step, shows the right answer and its working, and opens the next, which quotes the right figures so one slip doesn't spoil the rest (the same in Timed and Learning mode; steps typed but not checked are still marked on submission). A case is right only if every step is (feedback says "4 of 6 steps right"). A round holds at most one case per 10 questions, in Mixed (in place of a calculation slot) or New formats only, and a timed round gets one extra minute per step after the first. Fields from one type are rejected on another by the question check.

New-format written questions are added with `Bank.addFormat(categoryId, [...])` rather than `Bank.add`, so they only join rounds when new formats are switched on. Their IDs are permanent like any other (`hds-ord-01`, `mna-ord-01`, the fund waterfall `lbo-ord-01`, the capital structure ranking `cr-ord-01`, and the grids `acc-grid-01`, `cr-grid-01` (leveraged loan or high-yield bond), `cm-grid-01` (founder- or investor-friendly VC terms), the 3-statement ripple drills `acc-grid-02` to `acc-grid-04`, `lbo-grid-01`, `lbo-grid-02` (LP or GP), `rev-grid-01` (net income to FFO), `rev-grid-02` (which valuation approach), `econ-grid-01`, `econ-grid-02` (hawkish or dovish), the M&A grids `mna-grid-01` (takeover defences) and `mna-grid-02` (spin-off, carve-out or divestiture), `hom-grid-01`, `pf-grid-01`); the walk-through cards (`acc-walk-01`–`02`, `val-walk-01`–`02`, `mna-walk-01`–`02`, `lbo-walk-01`–`02`, `cf-walk-01`, `cr-walk-01`, `rx-walk-01`, `cm-walk-01`, `hom-walk-01`, `pf-walk-01`, `liv-walk-01`, `rev-walk-01`); the multiple-choice `hds-01` and `mna-09` the ordering questions are based on are unchanged.

**One definition, two formats.** `Bank.calc(categoryId, key, spec)` (key like `"val-c8"`: `c` for calculations with a typed version; both versions share it) defines a calculation once: `make()` (the random inputs), `solve(inputs)`, `wrongs(inputs)` (known wrong answers), `ask`, `why`, `fmt`, `unit`, `tolerance`, `dp`, `prompt`. It registers the multiple-choice version in `Bank.gens` (identical to a hand-written `Bank.gen`) and a typed-answer version in `Bank.numeric`, so the maths is never written twice. WACC and CAGR use it so far.

**Case studies.** `Bank.case(categoryId, spec)` defines a case: `lv`, `make()` (all the random inputs; round any figure a later step quotes, so it matches what's shown), `intro(inputs)` (the scenario), an optional `why(inputs)`, and `steps`: a list of `{ ask, solve, unit, dp, tolerance, prompt, why, wrongs? }` like `Bank.calc`. Known wrong answers closer than 12% to the right one (or within the tolerance) are dropped automatically, so every named mistake is graded as a concept gap. Cases go into `Bank.cases` and are used only when new formats are on; each is sampled 50 times by the question check. So far: a paper LBO (`lbo`), a project's NPV and discounted payback (`cf`), accretion/dilution through to the synergies needed (`mna`), a hotel from RevPAR to value per key (`hk`), an office purchase to the year-1 cash-on-cash return and a hotel from fees to price per key (both `rev`), and a bank from net interest income to value per share (`fig`).

**Reading typed answers** (`Typed` in `bank.js`). Spaces, thousands commas, fractions (`3/4`), `%`, a trailing `x`, and `US$`/`$`/`m`/`bn`/`k` are understood. A bare number is read both ways where that's ambiguous, and the closer reading counts: on a % question `12.5`, `12.5%`, `12.5 %` and `0.125` all mean 12.5%; on a US$m question `1.2`, `1.2m` and `1,200,000` all mean US$1.2m. A wrong answer within 10% of the right one is logged as `cause: "calculation-slip"`, anything further off as `"concept-gap"`; matching a known wrong answer also logs its mistake type.

## Lessons (Learn pages)

Each category has a lesson in `site/lessons/<category>.js`, reachable from "Learn" on the home page and from "Review the method" on every wrong or unanswered question in the results (Back returns to that question). The template:

```js
Lessons.add("val", {
  status: "draft",            // "stub" (not written yet) → "draft" → "reviewed"
  method: [                    // plain paragraphs, or labelled blocks { kind, title?, text, note? }
    { kind: "idea", text: "What it is, in a sentence or two." },
    { kind: "formula", text: "Value = NOI ÷ yield", note: "optional line under a formula" },
    "A plain paragraph still works."
  ],
  example: {
    question: "A worked problem.",
    working: ["Step 1 …", "Step 2 …"],
    answer: "The result, with a line on what it means."
  },
  source: { text: "Author, Title (edition), chapter", url: "https://…" }, // url optional; or a list of { text, url } for several
  widget: { type: "evBridge", values: { debt: 500 } }, // optional interactive "Try it"; values change its starting numbers
  widgets: [{ type: "dilutedShares", values: {} }]    // optional extra "Try it" widgets, shown below the main one
});
```

Text is shown as plain paragraphs and numbered steps (no formatting code needed). Method blocks have six kinds, each with one label and colour in every lesson (`Lessons.BLOCKS` in `bank.js`): `idea` (Key idea, navy), `how` (How it works, green), `formula` (Formula, purple), `read` (How to read it, amber), `watch` (Watch out, red) and `practice` (In practice, grey). Blocks always follow one order: Key idea → Formula → How it works → How to read it → Watch out → In practice (`Lessons.ORDER`). A lesson that covers several topics splits into sections with `{ section: "Title" }` items, and each section follows the order on its own. A section can carry `added: "YYYY-MM-DD"`, and a lesson `newQuestions: "YYYY-MM-DD"` (the day its category last got new questions): for 14 days a small "New" badge then shows on the section's header and the lesson's card. A line in How it works, How to read it, Example, Watch out or In practice that opens with a short label and a colon ("Churn: ...", up to 7 words) shows the label in bold. A block can add a short `title` after its label ("How it works · The fund"); a kind used more than once in a section needs one on each of those blocks. A lesson opens with a warm-up: 3 multiple-choice questions from its category (never its own quick checks; ones never answered first, then easier levels), as a card until the lesson is started and a one-line link after. Answers show only right/wrong and the right answer, and aren't saved or scored (pretesting effect). Formulas always take the full width; `{{a // b}}` shows a stacked fraction, `^` a superscript, and `\n` starts a new line (in any block, so a block listing several points shows one per line). Two other short blocks in a row share a line on wider screens. The question check enforces the order, the sections and the titles. The Formula sheet page (linked from the Lessons page) gathers every Formula block from all lessons, by category, as a formulas-only cheat sheet: each formula under its block title (or its section's title when it has none), no notes, flowing down 1–3 columns on screen. It prints in landscape, 4 columns, small type, without the header and in light colours. `?page=formulas` opens the sheet directly; the deploy uses it to print `formula-sheet.pdf` with Chrome (a step in `pages.yml`), and the sheet's "Open as PDF" link opens that file. The PDF is made at deploy time only (PDFs are gitignored), so the link doesn't work in the local preview. So a formula belongs on the sheet only if it is a Formula block, not a line inside another block. The Search page (magnifying glass in the header, or the / key; hidden during a timed round or sprint) searches lesson summaries, sections, worked examples, formulas and the glossary, never the questions. A lesson section or formula result opens that section; a glossary result opens the Glossary filtered to the term. Each text also matches the full names of the acronyms it uses ("free cash flow" finds FCFF), built from the glossary. Offline: `site/sw.js` (a service worker, registered on https and localhost) saves the page and every file it links on first visit, then serves network-first (a saved copy if offline, or if the network takes over 4 seconds), keeping one copy per file; Google Fonts are saved on first load and the formula sheet PDF once opened. Saved progress (localStorage) is never touched. If a saved copy ever gets stuck, set `KILL = true` in `sw.js` and deploy: browsers then delete the copy and remove the worker. Home-screen icons: `site/icons/icon-180.png` (iPhone, `apple-touch-icon`), `icon-192.png` and `icon-512.png` (manifest), drawn from `favicon.svg`. The question check requires a lesson for every category; a stub may be empty, but a draft or reviewed lesson must have a method, an example and a source, and a source link must start with `http://` or `https://`. All 18 lessons are drafts written by Claude (method, worked example, source and widget), to be reviewed and marked "reviewed".

**Widgets.** `site/js/widgets.js` defines 23 interactive "Try it" widgets (sliders that recalculate live, with a small chart), at least one per category: `evBridge`, `dilutedShares` (Valuation's second widget), `goodwill` (M&A's second widget), `fundWaterfall` (LBO's second widget), `reitNav` (Real estate valuation's second widget), `yieldToWorst` (Credit & debt's second widget), `wacc`, `compound`, `lboReturns`, `recovery`, `depreciation`, `bondPrice`, `ptbv`, `terp`, `yieldCurve`, `accretion`, `montyHall`, `revpar`, `hotelModels`, `yieldValue`, `rentRoll`, `maxLoan`, `capitalStack`. Each has a pure `compute()` for the maths and a `render()` for the picture. `node scripts/test-widgets.mjs` checks the maths against hand-worked answers (it also runs before every deploy), and the question check rejects a lesson that names a widget that doesn't exist or gives it starting values outside its sliders.

**Formula recall drill.** The formula sheet's *Recall drill* button (and *Recall formulas* on the home page's Due for review tile, when any are due) opens a card drill over every `formula` block in the lessons. Each card shows the formula's name (its title, else its section's), its lesson, and each line up to its first ` = `, ` ≈ `, ` ≥ ` or ` ≤ ` outside a `{{fraction}}` (else up to its first `: `; a line with neither is hidden whole). *Show* reveals the lines; *Got it* / *Not yet* schedules the card in `formulaSchedule` with the same rule as questions (Not yet: tomorrow; Got it: 2 days, then doubling up to 60 once due). Order: due cards (most overdue first), then never-drilled ones alternating between lessons; 10 per set, *10 more* continues; one lesson or all. With nothing due or new, *Drill anyway* takes the rest, soonest due first. A set in progress isn't saved; every marked card is. Renaming a formula's title or section starts it afresh.

**Paper LBO trainer.** The home page's *Paper LBO* tile opens a list of five cases (`Bank.papers`, in `generators-paper.js`): *The classic*, *Fees and a lower exit*, *Dividend recap* (12 minutes; the IRR needs the timing of the dividend), *Where the return comes from* (splitting the gain into EBITDA growth, multiple and debt paydown) and *Revenue growth and margins*. *Surprise me* picks one not done yet, else the one done longest ago. A case shows the whole deal on one screen (an intro and an assumption sheet) with 7 or 8 typed steps and a countdown that keeps running past zero as time over. The idea is to work on paper with no calculator and type the answers at the end: *Check my answers* grades every step like a case-study step (`Typed.grade` with `caseContext`): amounts within 1% (at least US$0.5m), multiples within 0.05x, the IRR within 1.5 points (2 for the recap). Known mistakes within 10% of the right answer are dropped, as rounding on paper could land there. Results show each step's answer, the mistake it matches and the working, then *Same case, new numbers* or *Choose another*. Finished cases are saved in `paperLbos` (not the case itself); a case left part-way isn't saved. The question check samples each case like a case study and checks its id, sheet and time limit.

**Out loud.** The home page's *Out loud* tile opens a list of open interview questions to answer aloud: every walk-through card in the bank plus the prompts in `questions/outloud.js` (8 fit and motivation, 12 technical, all drafts to review; `group` is `"fit"` or a category, `secs` the length to aim for, `tip` how to shape the answer). Filter by group, by an interview's topics (from its plan) or *Due and new*; *Start* takes up to 5, due ones first, then new ones in an order fixed for the day. On a question: *Record my answer* (the browser asks for the microphone; `MediaRecorder`) or *Answer without recording*, a clock counting up against the aim, then *Stop*. The review plays the answer back and lists the key points to tick, with *How to shape it*; *Save* logs the check in `outLoudLog` and schedules the question in `outLoudSchedule` (same rule as questions; right = at least 80% of the points). Recordings stay in the browser's IndexedDB (database `rehearse-audio`), the last 3 per question, listed under the question with *Delete*; they're never sent anywhere and aren't in backups. *Reset my progress* deletes them too. Out-loud checks don't touch the answer log or accuracy. The question check requires unique `ol-` ids, a valid group, 3–8 key points, a tip, `secs` from 30 to 180 and a status.

**Interviews.** The home page's interview card (*Add an interview*, or the next interview with its readiness) leads to *Your interviews* (coming up and past), each interview's page, and an add/edit form. Each interview is a lens on the shared progress: answers count everywhere, and an interview only adds its own focus topics, date and readiness score, so preparing for one never changes another or the overall stats.
- Form: firm, role (`IV_ROLES`, grouped Investment banking / Private equity and nearby), stage (`IV_STAGES`), date and optional time, format, time per day, job ad or recruiter notes, an optional link (kept for reference only: a static site can't read other pages; only `http(s)` links are shown), and focus topics as chips that cycle off → Useful (1) → Key (2). The role and stage set default topics (`ivDefaultFocus`) until you change them; *Reset to the role's topics* restores them. *Suggest topics from this text* matches topic words in the notes (`IV_WORDS`, plain matching in the page) and adds what it finds, as Key when mentioned twice or more. After the date, the form adds *How it went*.
- Interview page: phase (*Build* over 14 days out, *Consolidate* 14 to 3, *Final* the last 2, then interview day) with what to focus on, the focus topics with their readiness (key topics first, weakest first) and a *Practise* link each, notes, link, and Edit / Delete.
- **Today's session** (`ivPlan`, `planCard`), on the interview page and the home card (*Start today's session* opens the next part not done). Sized to the interview's time per day, in up to five parts:
  - Questions (1.5 minutes each in Learning mode, 1 minute timed): a round of mode `"plan"` (`startPlan`, its own attempts / history / totals entry, counted like any fresh round). Reviews first (`ivReviewList`): questions and calculations from its topics that are due, plus seen ones that would otherwise only come back after the interview (last reviewed at least half the days left ago, at most 7 days). Then new ones (`draw`): each slot goes to a topic at random, weighted by Key 2 / Useful 1 times need (needs work or too few answers 3, nearly ready 2, ready 1), within each topic's capacity. Shuffled together.
  - Formula recall on its topics (the drill with `"iv:<id>"`), 30 seconds a card.
  - While building, one lesson (10 minutes): the weakest key topic whose lesson still has unread sections.
  - By phase (`PLAN_CFG`): *Build* Learning mode, half reviews, 5 formulas, a lesson; *Consolidate* timed, 70% reviews, 6 formulas; *Final* timed, reviews only (at most 15), up to 12 formulas from all its formulas; *interview day* up to 8 formulas only.
  - A part is ticked off when the round is submitted, the formula set is finished, or the lesson is opened (`today` on the interview, reset each day). Nothing changes the shared schedule beyond the answers themselves.
  - Out loud (3 minutes each): one question (two in the final days) from its topics and the fit questions, due ones first, fit ones first for a fit round. Ticked once that many from its pool were checked today.
  - A paper LBO (15 minutes) for a paper LBO round, in every phase but the day itself, and for buyout and sponsor coverage roles from *Consolidate* on, with at least 30 minutes a day. Under 45 minutes a day it takes turns with the lesson (one each day). Any paper LBO finished today ticks it.
- Interview readiness (`ivReadiness`): focus topics weighted by Key 2 / Useful 1, each counting 1 when Ready, 0.5 when Nearly ready and 0 otherwise, from the same per-category readiness as the weak-spots report.

## Saved data

All progress lives in one `localStorage` key, `rehearse.v3` (the light/dark choice is kept separately under `rehearse.theme`). In `app.js` it's loaded into the global `db` object and written back with `persist()`.

**Backups.** The footer's *Download backup* saves the whole `db` object as `rehearse-backup-YYYY-MM-DD.json`. *Import backup* checks the file (valid JSON, has `schemaVersion` no newer than the site's, and has the core sections) and, after you confirm, replaces the saved data and reloads. A file that fails the check is rejected with a message, and nothing is changed. If the browser ever refuses to save (for example because storage is full), the site shows a one-time warning offering a backup.

**Rules for changing it.** Changes are additive only: never delete or rename a field, and never change what an existing field means. Add new fields with a default, like the existing code (`db.newThing ||= []`), so older saves keep working. When you add a new top-level field, bump `SCHEMA_VERSION` in `app.js` and add a line to the history below.

| Field | What it holds |
|---|---|
| `schemaVersion` | Version of this format (see history). Only ever goes up |
| `attempts` | Rounds in progress, by mode (`"mixed"`, a category ID, `"retry"` or `"due"`) |
| `history` | Last 5 finished rounds per mode, for the results and review screens |
| `totals` | Per mode: rounds played, sum of scores, best score |
| `seen` | Per category: written question IDs already shown in the current cycle |
| `catStats` | Per category: questions answered and correct (excludes retry rounds; review rounds count) |
| `excluded` | Category IDs unticked on the setup screen |
| `qStats` | Per written question ID: times answered, times wrong or skipped, and whether the last answer was right |
| `log` | Permanent answer log (below). Only ever appended to |
| `lastBackupAt` | When a backup was last downloaded (or `null`) |
| `backupNudgeDismissedAt` | When the home-page backup reminder was last dismissed (or `null`) |
| `schedule` | Spaced repetition, per written question ID or `"gen:<key>"` for a calculation: `{ dueAt, intervalDays, lastOk }` (below) |
| `interviews` | Interviews: `{ id, firm, role, stage, format, date, time, minutes, focus, notes, link, outcome, createdAt, updatedAt, today? }` (`date` is `"YYYY-MM-DD"`, `time` `"HH:MM"` or empty, `focus` maps category to 1 or 2) |
| `formulaSchedule` | The formula recall drill's spaced repetition, per `"<category>\|<formula name>"`: `{ dueAt, intervalDays, lastOk }` |
| `srsEnabled` | Spaced repetition on or off (default on). Defaulted with `??=`, because `\|\|=` would turn a stored `false` back on |
| `srsExcluded` | Category IDs where spaced repetition is off |
| `roundModes` | `{ test, practice }`: `"timed"` (default) or `"learning"`, remembered separately for the main test and one-category practice |
| `calcPrefs` | Calculator overrides, e.g. `{ "test-timed": true }`. Defaults: off in the timed main test, on everywhere else |
| `outLoudLog` | The last 300 out-loud self-checks: `{ pid, at, got, n, ms, rec, iv? }` (`got` of `n` key points; `rec` whether it was recorded; `iv` the interview whose plan it came from). Defaulted with `\|\|= []` |
| `outLoudSchedule` | Spaced repetition for out-loud questions, by prompt id: `{ dueAt, intervalDays, lastOk }`. Recordings aren't saved data: they're in IndexedDB. Defaulted with `\|\|= {}` |
| `paperLbos` | The last 30 paper LBOs: `{ at, v, ms, right, n }` (`v` is the case's id, e.g. `"classic"`; `ms` the time taken). Like sprints: no effect on the answer log, spaced repetition or accuracy. Defaulted with `\|\|= []` |
| `sprints` | The last 50 mental maths sprints: `{ at, ok, n, answered, ms, kinds: { <kind>: { n, ok } } }`. Kept apart from rounds: no effect on the answer log, spaced repetition, category accuracy or the weak-spots report. A sprint where no sum was attempted isn't saved. Defaulted with `\|\|= []` |
| `askConfidence` | Ask "Sure / Think so / Guess" before showing an answer (Learning mode reveals it only once rated; Timed mode lets you rate until you submit). Feeds the "Sure but wrong" label on results and the "How sure you were" part of the weak-spots report. Set on Progress & settings. Default `true`, defaulted with `??=` |
| `formatsOnly` | With `newFormats` on, use only the new formats ("New formats only" question style): typed calculations, ordering, grids, walk-through cards and case studies from the chosen categories, each at most once, so rounds can be shorter. Default `false`, defaulted with `??=` |
| `newFormats` | Include new question formats (typed answers, ordering, classification grids, walk-through cards and case studies) in rounds. Set by the "Question style" selector on the home page (Classic = off, Mixed or New formats only = on). Default `false`, defaulted with `??=`. Off means rounds are exactly as before |

**Answer log (`db.log`).** One entry per *answered* question in every submitted round (skipped questions aren't logged):

```js
{ qid: "val-03",          // null for calculation questions
  cat: "val",
  ok: true,               // answered correctly
  at: 1794043291081,      // when the round was submitted (ms timestamp)
  usedMs: 42150,          // time the question was on screen, summed across visits
  answeredAt: 1794043280000, // when the answer was last chosen (null for answers given before v2)
  mode: "mixed",          // "mixed", a category ID, "retry" or "due"
  i: 4,                   // position in the round (from v4)
  timePressure: false,    // answer last chosen in the final 10% of the round's time (from v4)
  trap: "inverted" }      // mistake type of the wrong option chosen, only if that option is tagged (from v4)
```

The log can also hold **notes** added after a round, such as the review screen's "I read the question wrong" button. They're appended like everything else, never edited: `{ kind: "cause", cause: "misread", ref: <the round's submit time>, i, at }`. Undoing adds `cause: null`, and the latest note for a given `ref` and `i` wins. Anything reading answers should skip entries that have a `kind`.

The **weak spots report** (results page box, plus a full page linked from it and from the home page) is worked out from the most recent 400 answers in the log. Mistakes practice rounds are left out of accuracy figures. A pattern only shows once there's enough data behind it. Its "By category" table also shows **readiness** for every category (`Readiness.of` in `bank.js`), from that category's last 20 answers in the whole log (mistakes practice left out): *Not enough data* under 10 answers; *Needs work* under 65% right; *Ready* at 80%+ right with at most one confident mistake ("Sure" but wrong) and fewer than 5 questions due; *Nearly ready* otherwise. A "Holding it back" column says why, and the results-page box sums it up in one line. No saved data of its own.

**How sure vs how right (calibration).** The report's "How sure you were" section compares each confidence rating with how often it was right, overall and by topic (`calibration()` in `app.js`), and the Progress tab shows the overall verdict in one line. Each verdict needs at least 5 rated answers (`CALIB_MIN`): *Overconfident* when "Sure" is right under 75% of the time; *You know more than you think* when "Think so" and "Guess" together are right 75%+; *Well judged* when "Sure" is right 85%+; *About right* otherwise. Overconfident comes first in the table, since those are the mistakes you'd repeat in an interview. Reads the answer log only; no saved data of its own.

Rounds in progress also keep `spentMs[]` and `answeredAt[]` per question. Time only counts while the question is on screen: it pauses on Save & exit, and time away (including a closed tab) is never counted.

**Spaced repetition (`db.schedule`).** Built by replaying the answer log the first time a save without it loads, then updated at every submit. Written questions are scheduled by their ID, new-format ones included (answer + reason, spot the error, ordering, grids, walk-through cards). Calculation questions are scheduled by their generator's key, stored as `"gen:<key>"` (one entry for a calculation's multiple-choice and typed versions), and come back with new numbers: in a review round as a typed answer when new formats are on and it has one, otherwise multiple choice. Case studies aren't scheduled, and nor are calculation answers logged before keys existed (schema 21). The due count (Due for review tile, the spaced-repetition panel, Readiness) counts new-format questions only when new formats are on (question style Mixed or New formats only).

- Wrong answer: due tomorrow, interval reset to 1 day.
- Right answer: interval doubles (first time: 2 days), capped at 60 days. A right answer given before the question is due leaves the schedule as it is.
- Learning mode: questions missed in the round (wrong or skipped) come back at its end in a new order, up to 3 tries each (`AGAIN_MAX`); typed answers, case studies and walk-through cards aren't asked again. Only the first try counts toward the score, stats, log and spaced review; the results add "N right on a later try". "Submit now" ends the round early.
- Confidence (when rated): a right answer marked "Guess" counts like a miss (due tomorrow); "Think so" keeps the current interval instead of doubling it (first time: 1 day); "Sure" doubles as above.
- "Due" means from local midnight of that day.

When it's on for a category, each written-question slot in a round takes a due question first (most overdue first), and each calculation slot a due calculation (typed half the time when new formats are on and it has a typed version; in New formats only rounds, due typed calculations go first with the due formats). The **Due for review** tile on the Practice tab also starts a separate review round (mode `"due"`): only the written and calculation questions due now in your selected categories where it's on (new-format ones included when new formats are on, that is question style Mixed or New formats only), most overdue first, up to 20. It has its own in-progress round, history and totals, apart from the main test; it's always timed (1 minute a question) and uses the category-practice calculator setting. Unlike mistakes practice, its answers count toward category accuracy and the weak-spots report, because they're fresh reviews. With nothing due, the tile says so and offers no round. With nothing due, or when it's off globally or for that category, question picking is exactly what it was before spaced repetition existed. Switching it off never changes the schedule; it only stops it being used. Controls are on the home page, below the category table.

**Timed test vs Learning mode.** Chosen on the setup screen (main test) and next to "Practise one category" (category practice); mistakes practice is always timed. A Learning round keeps a `deadline`, set 100 years ahead, because `Infinity` can't be saved as JSON. It shows "No time limit" instead of a countdown. Each answer locks once chosen and the explanation appears straight away. Learning answers count toward accuracy, the weak spots report and spaced repetition like any other, and their log entries carry `learning: true`, so they can be told apart later.

**Calculator.** Whether it's allowed is decided when a round starts (`calc: true` on the round) and can't change mid-round. It supports + − × ÷, brackets, ^, % (divides by 100), √, ∛, ln, exp, log, π, Ans, one memory slot and a fraction ↔ decimal display. Powers group right to left and a minus sign applies after powers (−2^2 = −4). Keys typed in the calculator never reach the quiz shortcuts.

**Version history**

| Version | Change |
|---|---|
| 1 | Everything live before the answer log: `attempts`, `history`, `totals`, `seen`, `catStats`, `excluded`, `qStats` |
| 2 | Added `log`; rounds in progress gained `spentMs[]` and `answeredAt[]` |
| 3 | Added `lastBackupAt` and `backupNudgeDismissedAt` |
| 4 | Answer log entries gained `i`, `timePressure` and `trap`; the log can hold `kind: "cause"` notes |
| 5 | Added `schedule`, `srsEnabled` and `srsExcluded` (spaced repetition) |
| 6 | Added `roundModes`; Learning rounds, their results and their answer log entries carry `learning: true` |
| 7 | Added `calcPrefs`; rounds where the calculator was allowed, their results and answer log entries carry `calc: true` |
| 8 | Added `newFormats`. Typed answers are stored as the text typed in a round's `answers[]` (plus `checked[]` in Learning mode); their log entries gain `type: "numeric"`, `given` (the number read) and `cause` |
| 9 | Ordering questions: a round's `answers[]` can hold an ordering (step numbers in the order chosen); their log entries have `type: "order"` and `given`. No new top-level fields |
| 10 | Classification grids: `answers[]` can hold one column number (or `null`) per grid row; their log entries have `type: "grid"`, `given` and `rowsRight`. No new top-level fields |
| 11 | Walk-through cards: `answers[]` can hold `"got"`, `"partly"` or `"missed"`; a round in progress can have `walkShown[]` (cards whose model answer was revealed); their log entries have `type: "walk"` and `given` (the self-grade). Only `"got"` counts as correct. No new top-level fields |
| 12 | Added `sprints`, the mental maths sprint results. No other changes |
| 13 | Added `formatsOnly` (the "New formats only" question style). `newFormats` keeps its meaning |
| 14 | Case studies: `answers[]` can hold a list of typed answers, one per step (`null` for steps not answered); a round in progress can have `caseDone[]` (how many steps of each case have been checked); their log entries have `type: "case"`, `given` (each step's reading, or `null`), `stepsRight`, and `cause` / `trap` from the first wrong step. No new top-level fields |
| 15 | Confidence ratings: added `askConfidence` (default `true`, `??=`). A round in progress can have `askConf` (the setting when it started) and `conf[]` (each question's rating); a finished round in history can have `conf[]`; answer log entries can have `confidence`: `"sure"`, `"think"` or `"guess"`. Only multiple choice, typed answers, ordering and grids are rated |
| 16 | Answer + reason questions: `answers[]` can hold `[answer picked, reason picked]`; their log entries have `type: "reason"`, `given` and, when only the reason was wrong, `cause: "wrong-reason"` |
| 17 | Spot-the-error questions: `answers[]` can hold `[line picked, fix picked]`; their log entries have `type: "spot"`, `given` and, when only the fix was wrong, `cause: "wrong-fix"` |
| 18 | A timed round left part-way gains `pausedAt`; on coming back its deadline and start move on by the time away |
| 19 | Added `lessonRead`: `{ category: { "section title": when first opened } }`, for the read ticks on lesson sections |
| 20 | Learning rounds in progress can hold extra items (missed questions asked again) with `againOf` and `again`; they're removed on submit, and a finished Learning round can have `laterRight` |
| 21 | Calculation questions join spaced repetition: generated items and their log entries can carry `gkey` (the generator's permanent key), and `schedule` gains `"gen:<key>"` entries |
| 22 | Added `formulaSchedule` (formula recall drill) |
| 23 | Added `interviews` (each can have `today`: `{ day, done }` for today's session). Today's session rounds use mode `"plan"`; their round in progress and results carry `ivId` |
| 24 | Added `paperLbos` (paper LBO trainer results). An interview's `today.done` can also hold `paper` |
| 25 | Added `outLoudLog` and `outLoudSchedule` (out-loud answers). An interview's `today.done` can also hold `vocal` |
