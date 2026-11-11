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
```

It loads every question file, calculation generator and lesson, and checks that each question has 4 unique options, 3 wrong-answer notes, an explanation and a unique ID, and that any `trap` tags are valid. It also checks that no option contains `NaN`/`Infinity`/`undefined`, that every file is loaded by `index.html`, and that every category exists in `app.js`. Each generator is run 50 times. It prints `✓ …` and exits with code 0 when everything passes, or lists each problem and exits with code 1. GitHub runs it before every deploy, and a failure stops the deploy. `test-calculator.mjs` does the same for the built-in calculator and for reading typed answers: it checks about 90 cases against hand-worked answers.

## How it's published

Every push to `main` runs `.github/workflows/pages.yml`:

1. **validate**: runs the question, calculator and widget checks above.
2. **deploy**: replaces `?v=dev` on every script and stylesheet link in `site/index.html` with the commit ID, then publishes the `site/` folder to GitHub Pages.

The version stamp makes browsers fetch matching files after each deploy. Any new `<script>` or stylesheet tag in `index.html` must end in `?v=dev`. GitHub Pages lets browsers cache the page itself for up to 10 minutes, so a hard refresh (Cmd + Shift + R) may be needed right after a deploy.

## Project layout

| Path | What it is |
|---|---|
| `site/index.html` | The page shell; loads every script in order |
| `site/styles.css` | All styles. Colours are tokens in `:root`, with a dark set for dark mode |
| `site/js/bank.js` | `Bank` (where questions are registered) and `R` (number/format helpers) |
| `site/questions/*.js` | Written questions, one file per category |
| `site/js/generators.js`, `generators-hl.js` | Calculation questions that get new numbers every round |
| `site/js/calculator.js` | The built-in calculator: a small expression parser (no `eval`) and its panel |
| `site/js/widgets.js` | Interactive "Try it" widgets for the lessons |
| `site/js/app.js` | Everything else: categories, round building, quiz, results, saving |
| `site/lessons/*.js` | One lesson (Learn page) per category |
| `scripts/validate-questions.mjs` | The question check |
| `scripts/test-calculator.mjs` | The calculator check |
| `scripts/test-widgets.mjs` | The lesson widget check |

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

Calculation questions are added with `Bank.gen(categoryId, () => ({ q, o, why, x, lv }))` and have no `id`.

**Question types.** A question with no `type` is multiple choice. A **typed-answer** question has `type: "numeric"`, a number `answer`, a `tolerance` (how far a typed answer may be off, in the same units), an optional `unit` (`%`, `x` or `US$m`), `dp` (decimal places for showing the answer) and optional `wrongs`: known wrong answers `{ value, note, trap }`. An **ordering** question has `type: "order"` and an `answer` listing 3–8 steps in the right order; it's shown shuffled (never already right), reordered with ▲ ▼, and only the exact sequence counts as right. A **classification grid** has `type: "grid"`, 2–4 `columns` and 3–8 `rows` of `{ text, answer: <column number>, note }`; rows are shown shuffled, one column is picked per row, and the question is right only if every row is (feedback says "4 of 6 right"). Fields from one type are rejected on another by the question check.

New-format written questions are added with `Bank.addFormat(categoryId, [...])` rather than `Bank.add`, so they only join rounds when new formats are switched on. Their IDs are permanent like any other (`hds-ord-01`, `mna-ord-01`, the fund waterfall `lbo-ord-01`, and the grids `acc-grid-01`, the 3-statement ripple drills `acc-grid-02` to `acc-grid-04`, `lbo-grid-01`, `lbo-grid-02` (LP or GP), `econ-grid-01`, the M&A grids `mna-grid-01` (takeover defences) and `mna-grid-02` (spin-off, carve-out or divestiture), `hom-grid-01`, `pf-grid-01`); the multiple-choice `hds-01` and `mna-09` the ordering questions are based on are unchanged.

**One definition, two formats.** `Bank.calc(categoryId, spec)` defines a calculation once: `make()` (the random inputs), `solve(inputs)`, `wrongs(inputs)` (known wrong answers), `ask`, `why`, `fmt`, `unit`, `tolerance`, `dp`, `prompt`. It registers the multiple-choice version in `Bank.gens` (identical to a hand-written `Bank.gen`) and a typed-answer version in `Bank.numeric`, so the maths is never written twice. WACC and CAGR use it so far.

**Reading typed answers** (`Typed` in `bank.js`). Spaces, thousands commas, fractions (`3/4`), `%`, a trailing `x`, and `US$`/`$`/`m`/`bn`/`k` are understood. A bare number is read both ways where that's ambiguous, and the closer reading counts: on a % question `12.5`, `12.5%`, `12.5 %` and `0.125` all mean 12.5%; on a US$m question `1.2`, `1.2m` and `1,200,000` all mean US$1.2m. A wrong answer within 10% of the right one is logged as `cause: "calculation-slip"`, anything further off as `"concept-gap"`; matching a known wrong answer also logs its mistake type.

## Lessons (Learn pages)

Each category has a lesson in `site/lessons/<category>.js`, reachable from "Learn" on the home page and from "Review the method" on every wrong or unanswered question in the results (Back returns to that question). The template:

```js
Lessons.add("val", {
  status: "draft",            // "stub" (not written yet) → "draft" → "reviewed"
  method: ["A paragraph explaining the method.", "Another paragraph."],
  example: {
    question: "A worked problem.",
    working: ["Step 1 …", "Step 2 …"],
    answer: "The result, with a line on what it means."
  },
  source: { text: "Author, Title (edition), chapter", url: "https://…" }, // url optional
  widget: { type: "evBridge", values: { debt: 500 } }, // optional interactive "Try it"; values change its starting numbers
  widgets: [{ type: "dilutedShares", values: {} }]    // optional extra "Try it" widgets, shown below the main one
});
```

Text is shown as plain paragraphs and numbered steps (no formatting code needed). The question check requires a lesson for every category; a stub may be empty, but a draft or reviewed lesson must have a method, an example and a source, and a source link must start with `http://` or `https://`. All 18 lessons are drafts written by Claude (method, worked example, source and widget), to be reviewed and marked "reviewed".

**Widgets.** `site/js/widgets.js` defines 21 interactive "Try it" widgets (sliders that recalculate live, with a small chart), at least one per category: `evBridge`, `dilutedShares` (Valuation's second widget), `goodwill` (M&A's second widget), `fundWaterfall` (LBO's second widget), `wacc`, `compound`, `lboReturns`, `recovery`, `depreciation`, `bondPrice`, `ptbv`, `terp`, `yieldCurve`, `accretion`, `montyHall`, `revpar`, `hotelModels`, `yieldValue`, `rentRoll`, `maxLoan`, `capitalStack`. Each has a pure `compute()` for the maths and a `render()` for the picture. `node scripts/test-widgets.mjs` checks the maths against hand-worked answers (it also runs before every deploy), and the question check rejects a lesson that names a widget that doesn't exist or gives it starting values outside its sliders.

## Saved data

All progress lives in one `localStorage` key, `rehearse.v3` (the light/dark choice is kept separately under `rehearse.theme`). In `app.js` it's loaded into the global `db` object and written back with `persist()`.

**Backups.** The footer's *Download backup* saves the whole `db` object as `rehearse-backup-YYYY-MM-DD.json`. *Import backup* checks the file (valid JSON, has `schemaVersion` no newer than the site's, and has the core sections) and, after you confirm, replaces the saved data and reloads. A file that fails the check is rejected with a message, and nothing is changed. If the browser ever refuses to save (for example because storage is full), the site shows a one-time warning offering a backup.

**Rules for changing it.** Changes are additive only: never delete or rename a field, and never change what an existing field means. Add new fields with a default, like the existing code (`db.newThing ||= []`), so older saves keep working. When you add a new top-level field, bump `SCHEMA_VERSION` in `app.js` and add a line to the history below.

| Field | What it holds |
|---|---|
| `schemaVersion` | Version of this format (see history). Only ever goes up |
| `attempts` | Rounds in progress, by mode (`"mixed"`, a category ID, or `"retry"`) |
| `history` | Last 5 finished rounds per mode, for the results and review screens |
| `totals` | Per mode: rounds played, sum of scores, best score |
| `seen` | Per category: written question IDs already shown in the current cycle |
| `catStats` | Per category: questions answered and correct (excludes retry rounds) |
| `excluded` | Category IDs unticked on the setup screen |
| `qStats` | Per written question ID: times answered, times wrong or skipped, and whether the last answer was right |
| `log` | Permanent answer log (below). Only ever appended to |
| `lastBackupAt` | When a backup was last downloaded (or `null`) |
| `backupNudgeDismissedAt` | When the home-page backup reminder was last dismissed (or `null`) |
| `schedule` | Spaced repetition, per written question ID: `{ dueAt, intervalDays, lastOk }` (below) |
| `srsEnabled` | Spaced repetition on or off (default on). Defaulted with `??=`, because `\|\|=` would turn a stored `false` back on |
| `srsExcluded` | Category IDs where spaced repetition is off |
| `roundModes` | `{ test, practice }`: `"timed"` (default) or `"learning"`, remembered separately for the main test and one-category practice |
| `calcPrefs` | Calculator overrides, e.g. `{ "test-timed": true }`. Defaults: off in the timed main test, on everywhere else |
| `newFormats` | Include new question formats (typed answers, ordering and classification grids) in rounds. Default `false`, defaulted with `??=`. Off means rounds are exactly as before |

**Answer log (`db.log`).** One entry per *answered* question in every submitted round (skipped questions aren't logged):

```js
{ qid: "val-03",          // null for calculation questions
  cat: "val",
  ok: true,               // answered correctly
  at: 1794043291081,      // when the round was submitted (ms timestamp)
  usedMs: 42150,          // time the question was on screen, summed across visits
  answeredAt: 1794043280000, // when the answer was last chosen (null for answers given before v2)
  mode: "mixed",          // "mixed", a category ID, or "retry"
  i: 4,                   // position in the round (from v4)
  timePressure: false,    // answer last chosen in the final 10% of the round's time (from v4)
  trap: "inverted" }      // mistake type of the wrong option chosen, only if that option is tagged (from v4)
```

The log can also hold **notes** added after a round, such as the review screen's "I read the question wrong" button. They're appended like everything else, never edited: `{ kind: "cause", cause: "misread", ref: <the round's submit time>, i, at }`. Undoing adds `cause: null`, and the latest note for a given `ref` and `i` wins. Anything reading answers should skip entries that have a `kind`.

The **weak spots report** (results page box, plus a full page linked from it and from the home page) is worked out from the most recent 400 answers in the log. Mistakes practice rounds are left out of accuracy figures. A pattern only shows once there's enough data behind it.

Rounds in progress also keep `spentMs[]` and `answeredAt[]` per question. Time only counts while the question is on screen: it pauses on Save & exit, and time away (including a closed tab) is never counted.

**Spaced repetition (`db.schedule`).** Built by replaying the answer log the first time a save without it loads, then updated at every submit. Only written questions are scheduled; calculation questions change every time.

- Wrong answer: due tomorrow, interval reset to 1 day.
- Right answer: interval doubles (first time: 2 days), capped at 60 days. A right answer given before the question is due leaves the schedule as it is.
- "Due" means from local midnight of that day.

When it's on for a category, each written-question slot in a round takes a due question first (most overdue first). With nothing due, or when it's off globally or for that category, question picking is exactly what it was before spaced repetition existed. Switching it off never changes the schedule; it only stops it being used. Controls are on the home page, below the category table.

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
