// Checks the question bank without a browser. No dependencies: run with `node scripts/validate-questions.mjs`.
// Loads site/js/bank.js, every site/questions/*.js and site/js/generators*.js into a sandbox, then checks:
//  - every written question has an id (unique), text, an explanation, exactly 4 unique options and exactly 3 notes
//  - no option contains NaN / Infinity / undefined
//  - an optional `trap` list (mistake type per wrong option) has exactly 3 entries, each null or a type from TRAPS in bank.js
//  - every category used by the bank exists in app.js, and every question file is loaded by index.html
//  - every generator, sampled RUNS times with the same 30-try retry the app uses, always yields a valid question
//  - every calculation generator (multiple choice and typed) has a permanent key "<category>-g<n>" or "<category>-c<n>",
//    unique across the bank (a calculation's two versions share one); spaced repetition schedules them by it
//  - each question is checked by its `type`: multiple choice (no type, or "mcq"), "numeric" (typed answer: a number
//    `answer`, a `tolerance` ≥ 0, an optional `unit`, optional known `wrongs`) or "order" (an `answer` list of 3–8
//    unique steps) or "grid" (2–4 unique `columns`, 3–8 `rows` of { text, answer: column number, note }) or "walk"
//    (a self-graded walk-through card: 3–8 unique `points` in its model answer) or "case" (a case study: a scenario and
//    3–8 linked typed `steps`, each checked like a typed answer, with a positive right answer, and every known wrong
//    answer far enough away to be graded as a concept gap; case generators are sampled like the others) or "reason"
//    (answer + reason: 2–4 unique `answers` and exactly 4 unique `reasons`, the right one first in each, with one note
//    per wrong one in `answerNotes` and `reasonNotes`; in each list of 3 or more, the right one mustn't stand out as
//    the longest, i.e. be both the longest and 30%+ longer than the average wrong one) or "spot" (spot the error: 4–6
//    unique worked `lines`, `wrong` = the number of the line with the mistake from 0, `lineNotes` with one note per
//    line and null on the wrong one, and exactly 4 unique `fixes`, the right one first, with 3 `fixNotes`; the fixes
//    follow the same length rule).
//    Fields belonging to one type (`tolerance`, `unit`, `o`, `rows`, ...) are rejected on the others.
//    Multiple-choice and typed questions may carry a `table` { caption?, corner?, cols: 2–6, rows: 2–8 of { head, cells } }
//    with one cell per column and an optional `base` [row, column] inside it.
//  - every category has a lesson (site/lessons/<category>.js, loaded by index.html); a "stub" may be empty, but a
//    "draft" or "reviewed" lesson needs a method, a worked example (question, working, answer) and a source (or a list);
//    method items are paragraphs, { section, added? } headings or blocks { kind, title?, text, note?, numbered? } (kinds: Lessons.BLOCKS; numbered: true shows the
//    lines as a numbered list, for parts in a set order, and needs 2+ lines and a kind other than formula);
//    `added` on a section and `newQuestions` on a lesson are real dates written YYYY-MM-DD (they drive the "New" badges);
//    within each section blocks follow Lessons.ORDER, and a kind repeated in a section needs a title on each block;
//    every section of a draft or reviewed lesson has an Example block, right under the rule it illustrates;
//    a draft or reviewed lesson has an "In 30 seconds" summary of 3–4 short takeaways, and any acronym in it is spelled
//    out the first time it's used, as "full term (ACR)", unless the category's description above it already does;
//    in a category with written questions, every section ends with exactly one quick check { check: "question id" },
//    pointing at a multiple-choice or answer + reason question of that category, each used once in the lesson;
//    a lesson's optional widget (and any extra ones in `widgets`) must be defined in site/js/widgets.js, with starting values only for its own inputs
//  - the glossary (site/js/glossary.js, loaded by index.html): every entry has a unique term, a full name, a definition
//    and a real category; and every acronym used in a lesson has an entry (plurals like "LPs" count via "LP",
//    compounds like "EV/EBITDA" via their parts), so a lesson can't use a term the glossary doesn't explain
//  - answer length doesn't give the answer away in written multiple choice: in every category, no right option is
//    both the longest and 30%+ longer than the average wrong one, and the right option is the longest in at most 40% of
//    the category's questions. The bank-wide rate is reported.
//  - every category with written questions has a minimum mix of new formats: at least 2 answer + reason, at least
//    1 spot the error, and at least 6 new-format items in all (orderings, grids, walk-throughs, answer + reason,
//    spot the error and case studies)
// Exits with code 1 on any violation.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const RUNS = 50;
const BAD_TEXT = /NaN|Infinity|undefined/;

const errors = [];
const fail = msg => errors.push(msg);

const ctx = vm.createContext({ console, Math });
ctx.window = ctx;
const load = rel => vm.runInContext(readFileSync(join(SITE, rel), "utf8"), ctx, { filename: rel });

const questionFiles = readdirSync(join(SITE, "questions")).filter(f => f.endsWith(".js")).sort().map(f => `questions/${f}`);
const generatorFiles = readdirSync(join(SITE, "js")).filter(f => /^generators.*\.js$/.test(f)).sort().map(f => `js/${f}`);
const lessonFiles = readdirSync(join(SITE, "lessons")).filter(f => f.endsWith(".js")).sort().map(f => `lessons/${f}`);
for (const f of ["js/bank.js", "js/widgets.js", "js/glossary.js", "js/askclaude.js", ...questionFiles, ...generatorFiles, ...lessonFiles]) {
  try { load(f); } catch (e) { fail(`${f}: failed to load: ${e.message}`); }
}
const { Bank } = ctx;
const TRAPS = ctx.TRAPS || {};
if (!Bank) { console.error("Bank was not defined by js/bank.js"); process.exit(1); }

// Every question/generator file must actually be loaded by the page.
const html = readFileSync(join(SITE, "index.html"), "utf8");
for (const f of [...questionFiles, ...generatorFiles, ...lessonFiles, "js/glossary.js", "js/askclaude.js"]) if (!new RegExp(`src="${f.replace(/\./g, "\\.")}(\\?[^"]*)?"`).test(html)) fail(`index.html doesn't load ${f}`);

// Every category in the bank must exist in app.js.
const appSrc = readFileSync(join(SITE, "js/app.js"), "utf8");
const appCats = new Set([...appSrc.matchAll(/\{ id: "([a-z]+)"/g)].map(m => m[1]));
const groupIds = new Set([...(/const GROUPS = \[([\s\S]*?)\];/.exec(appSrc)?.[1] || "").matchAll(/id: "([a-z]+)"/g)].map(m => m[1]));
const categoryIds = [...appCats].filter(id => !groupIds.has(id)); // the 18 categories (GROUPS also use "id:")
for (const cat of new Set([...Object.keys(Bank.written), ...Object.keys(Bank.gens), ...Object.keys(Bank.numeric || {}), ...Object.keys(Bank.formats || {}), ...Object.keys(Bank.cases || {})])) if (!appCats.has(cat)) fail(`category "${cat}" isn't defined in app.js CATEGORIES`);

const UNITS = ["%", "x", "US$m", "US$", "years"];
const isNum = v => typeof v === "number" && Number.isFinite(v);
const notAllowed = (where, q, type, keys) => keys.forEach(k => { if (k in q) fail(`${where}: "${k}" isn't allowed on ${type} question`); });
function checkTable(where, t) {
  if (!t || !Array.isArray(t.cols) || t.cols.length < 2 || t.cols.length > 6) return fail(`${where}: table needs 2–6 columns`);
  if (!Array.isArray(t.rows) || t.rows.length < 2 || t.rows.length > 8) return fail(`${where}: table needs 2–8 rows`);
  t.rows.forEach((r, k) => {
    if (!r || typeof r.head !== "string" || !Array.isArray(r.cells) || r.cells.length !== t.cols.length) fail(`${where}: table row ${k + 1} needs a head and one cell per column`);
    else if (r.cells.some(c => typeof c !== "string" || BAD_TEXT.test(c))) fail(`${where}: table row ${k + 1} has an invalid cell`);
  });
  if (t.base !== undefined && !(Array.isArray(t.base) && t.base[0] >= 0 && t.base[0] < t.rows.length && t.base[1] >= 0 && t.base[1] < t.cols.length)) fail(`${where}: table base must be [row, column] inside the table`);
}
const text0 = v => typeof v === "string" && v.trim().length > 0;
const checkShape = (where, q) => {
  if (q.table !== undefined) { const type = q.type ?? "mcq"; if (type === "mcq" || type === "numeric") checkTable(where, q.table); else fail(`${where}: "table" isn't allowed on a ${type} question`); }
  if (typeof q.q !== "string" || !q.q.trim()) fail(`${where}: missing question text`);
  if (typeof q.why !== "string" || !q.why.trim()) fail(`${where}: missing explanation (why)`);
  if (q.lv !== undefined && ![1, 2, 3].includes(q.lv)) fail(`${where}: lv must be 1, 2 or 3, got ${q.lv}`);
  const type = q.type ?? "mcq";
  if (type === "numeric") return checkNumeric(where, q);
  if (type === "order") return checkOrder(where, q);
  if (type === "grid") return checkGrid(where, q);
  if (type === "walk") return checkWalk(where, q);
  if (type === "case") return checkCase(where, q);
  if (type === "reason") return checkReason(where, q);
  if (type === "spot") return checkSpot(where, q);
  if (type !== "mcq") return fail(`${where}: unknown type "${type}" (expected mcq, numeric, order, grid, walk, case, reason or spot)`);
  notAllowed(where, q, "a multiple-choice", ["answer", "tolerance", "unit", "wrongs", "dp", "columns", "rows", "points", "answers", "reasons", "answerNotes", "reasonNotes", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  if (!Array.isArray(q.o) || q.o.length !== 4) fail(`${where}: needs exactly 4 options, has ${q.o?.length}`);
  else {
    if (new Set(q.o).size !== 4) fail(`${where}: options aren't unique: ${JSON.stringify(q.o)}`);
    q.o.forEach((s, i) => { if (typeof s !== "string" || BAD_TEXT.test(s)) fail(`${where}: option ${i + 1} is invalid: ${JSON.stringify(s)}`); });
  }
  if (!Array.isArray(q.x) || q.x.length !== 3) fail(`${where}: needs exactly 3 notes in x, has ${q.x?.length}`);
  else if (q.x.some(s => typeof s !== "string" || !s.trim())) fail(`${where}: a note in x is empty`);
  if (q.trap !== undefined) {
    if (!Array.isArray(q.trap) || q.trap.length !== 3) fail(`${where}: trap needs exactly 3 entries (one per wrong option), has ${q.trap?.length}`);
    else q.trap.forEach((t, i) => { if (t !== null && !Object.hasOwn(TRAPS, t)) fail(`${where}: trap ${i + 1} "${t}" isn't a known mistake type (${Object.keys(TRAPS).join(", ")})`); });
  }
};

function checkNumeric(where, q) {
  notAllowed(where, q, "a typed-answer", ["o", "x", "trap", "columns", "rows", "points", "answers", "reasons", "answerNotes", "reasonNotes", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  if (!isNum(q.answer)) fail(`${where}: answer must be a number, got ${JSON.stringify(q.answer)}`);
  if (!isNum(q.tolerance) || q.tolerance < 0) fail(`${where}: tolerance must be a number ≥ 0, got ${JSON.stringify(q.tolerance)}`);
  if (q.dp !== undefined && !(Number.isInteger(q.dp) && q.dp >= 0 && q.dp <= 6)) fail(`${where}: dp must be a whole number from 0 to 6, got ${JSON.stringify(q.dp)}`);
  if (q.unit !== undefined && !UNITS.includes(q.unit)) fail(`${where}: unit must be one of ${UNITS.join(", ")}, got ${JSON.stringify(q.unit)}`);
  if (q.wrongs !== undefined) {
    if (!Array.isArray(q.wrongs)) return fail(`${where}: wrongs must be a list`);
    q.wrongs.forEach((w, i) => {
      if (!isNum(w.value)) fail(`${where}: wrongs ${i + 1} needs a number value`);
      if (typeof w.note !== "string" || !w.note.trim()) fail(`${where}: wrongs ${i + 1} needs a note`);
      if (w.trap != null && !Object.hasOwn(TRAPS, w.trap)) fail(`${where}: wrongs ${i + 1} has unknown mistake type "${w.trap}"`);
      // A known wrong answer inside the tolerance would be marked right: the question can't tell them apart.
      if (isNum(w.value) && isNum(q.answer) && isNum(q.tolerance) && Math.abs(w.value - q.answer) <= q.tolerance) fail(`${where}: wrong answer ${w.value} is within the tolerance of the right answer ${q.answer}`);
    });
  }
}
function checkCase(where, q) {
  notAllowed(where, q, "a case study", ["o", "x", "trap", "answer", "tolerance", "unit", "wrongs", "dp", "columns", "rows", "points", "answers", "reasons", "answerNotes", "reasonNotes", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  if (!Array.isArray(q.steps) || q.steps.length < 3 || q.steps.length > 8) return fail(`${where}: steps must list 3–8 steps, has ${q.steps?.length}`);
  q.steps.forEach((s, k) => {
    const at = `${where} step ${k + 1}`;
    if (typeof s.q !== "string" || !s.q.trim()) fail(`${at}: missing question text`);
    if (typeof s.why !== "string" || !s.why.trim()) fail(`${at}: missing explanation (why)`);
    if (BAD_TEXT.test(`${s.q} ${s.why}`)) fail(`${at}: text contains NaN/Infinity/undefined`);
    checkNumeric(at, s);
    if (isNum(s.answer) && !(s.answer > 0)) fail(`${at}: the right answer must be positive, got ${s.answer}`);
    // Every step names at least 2 known mistakes, so a wrong answer usually gets its exact explanation. Steps counted in
    // whole years are exempt: their mistakes can land on the right year, and the one-year-out check covers them.
    if (s.unit !== "years" && (s.wrongs || []).length < 2) fail(`${at}: needs at least 2 known mistakes (wrongs) that differ from the right answer, has ${(s.wrongs || []).length}`);
    // A known wrong answer must read as a concept gap (more than 10% away), or the case can't name that mistake.
    for (const w of s.wrongs || []) { const g = ctx.Typed.grade(s, String(w.value)); if (g.ok || g.cause !== "concept-gap") fail(`${at}: known wrong answer ${w.value} would be graded ${g.ok ? "right" : g.cause}`); }
    if (isNum(s.answer) && !ctx.Typed.grade(s, s.answer.toFixed(s.dp ?? 6)).ok) fail(`${at}: the right answer, typed as shown, isn't graded right`);
  });
}
function checkReason(where, q) {
  notAllowed(where, q, "an answer + reason", ["o", "x", "trap", "answer", "tolerance", "unit", "wrongs", "dp", "columns", "rows", "points", "steps", "table", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  const part = (name, notesName, min, max) => {
    const list = q[name], notes = q[notesName];
    if (!Array.isArray(list) || list.length < min || list.length > max) return fail(`${where}: ${name} must list ${min === max ? min : `${min}–${max}`} options, has ${Array.isArray(list) ? list.length : JSON.stringify(list)}`);
    if (list.some(s => typeof s !== "string" || !s.trim() || BAD_TEXT.test(s))) fail(`${where}: every option in ${name} must be non-empty text`);
    if (new Set(list).size !== list.length) fail(`${where}: ${name} must be unique`);
    if (!Array.isArray(notes) || notes.length !== list.length - 1) fail(`${where}: ${notesName} needs one note per wrong option (${list.length - 1}), has ${notes?.length}`);
    else if (notes.some(s => typeof s !== "string" || !s.trim())) fail(`${where}: a note in ${notesName} is empty`);
    // The right option is first: it mustn't give itself away by length.
    if (list.length >= 3) {
      const L = list.map(s => String(s).length), mean = L.slice(1).reduce((a, b) => a + b, 0) / (L.length - 1);
      if (L.slice(1).every(w => L[0] > w) && L[0] >= 1.3 * mean) fail(`${where}: the right option in ${name} (${L[0]} characters) stands out as the longest (wrong ones average ${Math.round(mean)}); balance the lengths`);
    }
  };
  part("answers", "answerNotes", 2, 4);
  part("reasons", "reasonNotes", 4, 4);
}
function checkSpot(where, q) {
  notAllowed(where, q, "a spot-the-error", ["o", "x", "trap", "answer", "tolerance", "unit", "wrongs", "dp", "columns", "rows", "points", "steps", "table", "answers", "reasons", "answerNotes", "reasonNotes"]);
  const lines = q.lines;
  if (!Array.isArray(lines) || lines.length < 4 || lines.length > 6) return fail(`${where}: lines must list 4–6 worked lines, has ${Array.isArray(lines) ? lines.length : JSON.stringify(lines)}`);
  if (lines.some(s => typeof s !== "string" || !s.trim() || BAD_TEXT.test(s))) fail(`${where}: every line must be non-empty text`);
  if (new Set(lines).size !== lines.length) fail(`${where}: lines must be unique`);
  if (!Number.isInteger(q.wrong) || q.wrong < 0 || q.wrong >= lines.length) return fail(`${where}: wrong must be a line number from 0 to ${lines.length - 1}, got ${JSON.stringify(q.wrong)}`);
  if (!Array.isArray(q.lineNotes) || q.lineNotes.length !== lines.length) fail(`${where}: lineNotes needs one entry per line (${lines.length}), has ${q.lineNotes?.length}`);
  else q.lineNotes.forEach((n, k) => {
    if (k === q.wrong) { if (n !== null) fail(`${where}: lineNotes for the wrong line (${k}) must be null; the fix and the explanation cover it`); }
    else if (typeof n !== "string" || !n.trim()) fail(`${where}: line ${k + 1} needs a note saying why it's right`);
  });
  const fixes = q.fixes;
  if (!Array.isArray(fixes) || fixes.length !== 4) return fail(`${where}: fixes must list exactly 4 options, has ${Array.isArray(fixes) ? fixes.length : JSON.stringify(fixes)}`);
  if (fixes.some(s => typeof s !== "string" || !s.trim() || BAD_TEXT.test(s))) fail(`${where}: every fix must be non-empty text`);
  if (new Set(fixes).size !== 4) fail(`${where}: fixes must be unique`);
  if (!Array.isArray(q.fixNotes) || q.fixNotes.length !== 3) fail(`${where}: fixNotes needs one note per wrong fix (3), has ${q.fixNotes?.length}`);
  else if (q.fixNotes.some(s => typeof s !== "string" || !s.trim())) fail(`${where}: a note in fixNotes is empty`);
  const L = fixes.map(s => String(s).length), mean = (L[1] + L[2] + L[3]) / 3;
  if (L.slice(1).every(w => L[0] > w) && L[0] >= 1.3 * mean) fail(`${where}: the right fix (${L[0]} characters) stands out as the longest (wrong ones average ${Math.round(mean)}); balance the lengths`);
}
function checkOrder(where, q) {
  notAllowed(where, q, "an ordering", ["o", "x", "trap", "tolerance", "unit", "wrongs", "dp", "columns", "rows", "points", "answers", "reasons", "answerNotes", "reasonNotes", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  if (!Array.isArray(q.answer) || q.answer.length < 3 || q.answer.length > 8) return fail(`${where}: answer must list 3–8 steps in the right order, has ${Array.isArray(q.answer) ? q.answer.length : JSON.stringify(q.answer)}`);
  if (q.answer.some(s => typeof s !== "string" || !s.trim())) fail(`${where}: every step must be non-empty text`);
  if (new Set(q.answer).size !== q.answer.length) fail(`${where}: steps must be unique`);
}

function checkWalk(where, q) {
  notAllowed(where, q, "a walk-through", ["o", "x", "trap", "tolerance", "unit", "wrongs", "dp", "answer", "columns", "rows", "answers", "reasons", "answerNotes", "reasonNotes", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  if (!Array.isArray(q.points) || q.points.length < 3 || q.points.length > 8) return fail(`${where}: points must list 3–8 parts of a model answer, has ${Array.isArray(q.points) ? q.points.length : JSON.stringify(q.points)}`);
  if (q.points.some(p => typeof p !== "string" || !p.trim())) fail(`${where}: every point must be non-empty text`);
  if (new Set(q.points).size !== q.points.length) fail(`${where}: points must be unique`);
}

function checkGrid(where, q) {
  notAllowed(where, q, "a grid", ["o", "x", "trap", "tolerance", "unit", "wrongs", "dp", "answer", "points", "answers", "reasons", "answerNotes", "reasonNotes", "lines", "wrong", "lineNotes", "fixes", "fixNotes"]);
  const cols = q.columns;
  if (!Array.isArray(cols) || cols.length < 2 || cols.length > 4) return fail(`${where}: columns must list 2–4 choices, has ${Array.isArray(cols) ? cols.length : JSON.stringify(cols)}`);
  if (cols.some(c => typeof c !== "string" || !c.trim())) fail(`${where}: every column label must be non-empty text`);
  if (new Set(cols).size !== cols.length) fail(`${where}: column labels must be unique`);
  if (!Array.isArray(q.rows) || q.rows.length < 3 || q.rows.length > 8) return fail(`${where}: rows must list 3–8 items, has ${Array.isArray(q.rows) ? q.rows.length : JSON.stringify(q.rows)}`);
  q.rows.forEach((r, i) => {
    if (!r || typeof r.text !== "string" || !r.text.trim()) fail(`${where}: row ${i + 1} needs text`);
    if (!Number.isInteger(r?.answer) || r.answer < 0 || r.answer >= cols.length) fail(`${where}: row ${i + 1}'s answer must be a column number from 0 to ${cols.length - 1}, got ${JSON.stringify(r?.answer)}`);
    if (r?.note !== undefined && (typeof r.note !== "string" || !r.note.trim())) fail(`${where}: row ${i + 1}'s note must be non-empty text`);
  });
  if (new Set(q.rows.map(r => r?.text)).size !== q.rows.length) fail(`${where}: row texts must be unique`);
  if (new Set(q.rows.map(r => r?.answer)).size < 2) fail(`${where}: every row has the same answer, so it isn't really a classification`);
}

// Written questions, including new-format ones (Bank.formats, used only when new formats are on). IDs are unique across both.
const ids = new Map();
let written = 0, formatQuestions = 0;
const writtenLists = [...Object.entries(Bank.written), ...Object.entries(Bank.formats || {}).map(([cat, list]) => { formatQuestions += list.length; return [cat, list]; })];
for (const [cat, list] of writtenLists) {
  for (const q of list) {
    written++;
    const where = `${cat}/${q.id ?? "(no id)"}`;
    if (!q.id) fail(`${where}: missing id`);
    else if (ids.has(q.id)) fail(`${where}: duplicate id (also in ${ids.get(q.id)})`);
    else ids.set(q.id, cat);
    checkShape(where, q);
  }
}

// Generators: mirror the app's retry rule, then check what it would actually show.
const usable = g => g && Array.isArray(g.o) && g.o.length === 4 && new Set(g.o).size === 4 && !g.o.some(s => BAD_TEXT.test(String(s)));
let gens = 0;
for (const [cat, list] of Object.entries(Bank.gens)) {
  list.forEach((fn, i) => {
    gens++;
    const where = `${cat} generator #${i + 1}`;
    for (let run = 0; run < RUNS; run++) {
      let g;
      try {
        for (let t = 0; t < 30; t++) { g = fn(); if (usable(g)) break; }
      } catch (e) { fail(`${where}: threw: ${e.message}`); return; }
      const before = errors.length;
      checkShape(where, g);
      if (BAD_TEXT.test(g.q + " " + g.why)) fail(`${where}: question or explanation contains NaN/Infinity/undefined: ${g.q}`);
      if (errors.length > before) return; // one report per generator is enough
    }
  });
}

// Permanent keys: spaced repetition schedules calculation questions by them, so each must exist, follow the pattern and
// be unique. A calculation registers one multiple-choice and one typed function under the same key.
const genKeys = new Set();
for (const [cat, list] of Object.entries(Bank.gens)) list.forEach((fn, i) => {
  const where = `${cat} generator #${i + 1}`;
  if (!fn.key) return fail(`${where}: has no key, e.g. Bank.gen("${cat}", "${cat}-g<n>", ...) with the next free number`);
  if (!new RegExp(`^${cat}-[gc][1-9][0-9]*$`).test(fn.key)) fail(`${where}: key "${fn.key}" should look like "${cat}-g<n>" or "${cat}-c<n>"`);
  if (genKeys.has(fn.key)) fail(`${where}: key "${fn.key}" is used twice`);
  genKeys.add(fn.key);
});
const typedKeys = new Set();
for (const [cat, list] of Object.entries(Bank.numeric || {})) list.forEach((fn, i) => {
  const where = `${cat} typed-answer generator #${i + 1}`;
  if (!fn.key) return fail(`${where}: has no key (register it with Bank.calc("${cat}", "${cat}-c<n>", spec))`);
  if (typedKeys.has(fn.key)) fail(`${where}: key "${fn.key}" is used twice`);
  if (!(Bank.gens[cat] || []).some(g => g.key === fn.key)) fail(`${where}: key "${fn.key}" has no multiple-choice twin in the same category`);
  typedKeys.add(fn.key);
});

// Typed-answer calculation generators (used only when new formats are on): same idea, with the app's retry rule.
let typed = 0;
for (const [cat, list] of Object.entries(Bank.numeric || {})) {
  list.forEach((fn, i) => {
    typed++;
    const where = `${cat} typed-answer generator #${i + 1}`;
    for (let run = 0; run < RUNS; run++) {
      let g;
      try { for (let t = 0; t < 30; t++) { g = fn(); if (isNum(g.answer)) break; } }
      catch (e) { fail(`${where}: threw: ${e.message}`); return; }
      const before = errors.length;
      if (g.type !== "numeric") fail(`${where}: must have type "numeric"`);
      checkShape(where, g);
      if (BAD_TEXT.test(g.q + " " + g.why)) fail(`${where}: question or explanation contains NaN/Infinity/undefined: ${g.q}`);
      if (errors.length > before) return;
    }
  });
}

// Case studies (used only when new formats are on): sampled like the generators.
let cases = 0;
for (const [cat, list] of Object.entries(Bank.cases || {})) {
  list.forEach((fn, i) => {
    cases++;
    const where = `${cat} case study #${i + 1}`;
    for (let run = 0; run < RUNS; run++) {
      let g;
      try { for (let t = 0; t < 30; t++) { g = fn(); if (g.steps.every(s => isNum(s.answer))) break; } }
      catch (e) { fail(`${where}: threw: ${e.message}`); return; }
      const before = errors.length;
      if (g.type !== "case") fail(`${where}: must have type "case"`);
      checkShape(where, g);
      if (BAD_TEXT.test(g.q + " " + g.why)) fail(`${where}: scenario or explanation contains NaN/Infinity/undefined: ${g.q}`);
      if (errors.length > before) return;
    }
  });
}

// Out-loud prompts (questions/outloud.js): ids unique across the whole bank and starting "ol-", a group that is "fit" or a
// category, 3–8 unique key points, a tip, a length to aim for and a status. Acronyms are left to the glossary check.
let outLoud = 0;
for (const p of Bank.outLoud || []) {
  outLoud++;
  const where = `out-loud ${p.id ?? "(no id)"}`;
  if (!/^ol-[a-z]+-\d{2}$/.test(p.id || "")) fail(`${where}: id must look like ol-fit-01`);
  else if (ids.has(p.id)) fail(`${where}: duplicate id (also in ${ids.get(p.id)})`);
  else ids.set(p.id, "out-loud");
  if (p.group !== "fit" && !categoryIds.includes(p.group)) fail(`${where}: group must be "fit" or a category id, got ${JSON.stringify(p.group)}`);
  if (typeof p.q !== "string" || !p.q.trim()) fail(`${where}: missing question text`);
  if (typeof p.tip !== "string" || !p.tip.trim()) fail(`${where}: missing tip`);
  if (![1, 2, 3].includes(p.lv)) fail(`${where}: lv must be 1, 2 or 3`);
  if (!(Number.isInteger(p.secs) && p.secs >= 30 && p.secs <= 180)) fail(`${where}: secs must be a whole number of seconds from 30 to 180`);
  if (!["draft", "reviewed"].includes(p.status)) fail(`${where}: status must be "draft" or "reviewed"`);
  if (!Array.isArray(p.points) || p.points.length < 3 || p.points.length > 8) fail(`${where}: points must list 3–8 key points`);
  else if (p.points.some(x => typeof x !== "string" || !x.trim()) || new Set(p.points).size !== p.points.length) fail(`${where}: points must be unique, non-empty text`);
  if (BAD_TEXT.test(JSON.stringify(p))) fail(`${where}: text contains NaN/Infinity/undefined`);
}

// Key terms (questions/outloud-terms.js): each id is a technical out-loud prompt or a walk-through card, with 3–8 terms;
// each term has non-empty ways of saying it, none repeated in the prompt once punctuation and case are ignored.
const walkIds = new Set();
for (const src of [Bank.written, Bank.formats || {}]) for (const list of Object.values(src)) for (const q of list) if (q.type === "walk") walkIds.add(q.id);
const termNorm = x => (x.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu) || []).join(" ");
let termSets = 0;
for (const [id, list] of Object.entries(Bank.terms || {})) {
  termSets++;
  const where = `key terms for ${id}`, p = (Bank.outLoud || []).find(x => x.id === id);
  if (!p && !walkIds.has(id)) { fail(`${where}: no out-loud prompt or walk-through card has this id`); continue; }
  if (p && p.group === "fit") fail(`${where}: fit questions have no key terms`);
  if (!Array.isArray(list) || list.length < 3 || list.length > 8) { fail(`${where}: list 3–8 terms`); continue; }
  const seen = new Set();
  for (const term of list) {
    const alts = typeof term === "string" ? term.split("|").map(termNorm) : [""];
    if (alts.some(a => !a)) fail(`${where}: ${JSON.stringify(term)} has an empty way of saying it`);
    for (const a of alts) { if (a && seen.has(a)) fail(`${where}: "${a}" is listed twice`); seen.add(a); }
  }
}
for (const p of Bank.outLoud || []) if (p.group !== "fit" && !(Bank.terms || {})[p.id]) fail(`out-loud ${p.id}: technical prompts need key terms in questions/outloud-terms.js`);
for (const id of walkIds) if (!(Bank.terms || {})[id]) fail(`walk-through card ${id}: needs key terms in questions/outloud-terms.js`);

// Paper LBOs (the timed trainer): sampled like case studies, plus a unique permanent id, a name, a short description,
// a time limit and an assumption sheet. Up to 8 steps, like a case.
let papers = 0;
const paperIds = new Set();
for (const [k, p] of (Bank.papers || []).entries()) {
  papers++;
  const where = `paper LBO #${k + 1} (${p.id})`;
  if (!/^[a-z][a-z0-9-]*$/.test(p.id || "")) fail(`${where}: id must be lowercase letters, digits and dashes`);
  if (paperIds.has(p.id)) fail(`${where}: duplicate id`);
  paperIds.add(p.id);
  if (!text0(p.name) || !text0(p.blurb)) fail(`${where}: needs a name and a blurb`);
  if (!(Number.isInteger(p.minutes) && p.minutes >= 5 && p.minutes <= 20)) fail(`${where}: minutes must be a whole number from 5 to 20`);
  for (let run = 0; run < RUNS; run++) {
    let g;
    try { g = p.make(); } catch (e) { fail(`${where}: threw: ${e.message}`); break; }
    const before = errors.length;
    if (g.type !== "case" || g.paper !== p.id) fail(`${where}: must have type "case" and paper "${p.id}"`);
    if (!Array.isArray(g.sheet) || !g.sheet.length || g.sheet.some(r => !Array.isArray(r) || r.length !== 2 || !text0(r[0]) || !text0(r[1]) || BAD_TEXT.test(r.join(" ")))) fail(`${where}: sheet must list [label, value] pairs of text`);
    checkShape(where, g);
    if (BAD_TEXT.test(g.q + " " + g.why)) fail(`${where}: scenario or explanation contains NaN/Infinity/undefined: ${g.q}`);
    if (errors.length > before) break;
  }
}

// The mistake detective (Typed.diagnose) mustn't cry wolf: ordinary wrong answers, 10% to 100% away from the right one,
// should rarely be read as a slip (rounding and one-year-out guesses aside). Fails above 5% of them.
// Case-study steps are graded with their case's figures, as in the app. The wrong answers come from a fixed-seed
// random sequence, so the result is the same on every run with the same questions.
let alarmTried = 0, alarmHits = 0, alarmSeed = 7;
const alarmRandom = () => (alarmSeed = (alarmSeed * 16807) % 2147483647) / 2147483647;
for (let run = 0; run < 10; run++) {
  const alarmItems = [...Object.values(Bank.numeric || {}).flat().map(fn => [fn(), null]),
    ...[...Object.values(Bank.cases || {}).flat(), ...(Bank.papers || []).map(p => p.make)].flatMap(fn => { const c = fn(); return c.steps.map((s, k) => [s, ctx.Typed.caseContext(c, k)]); })];
  for (const [it, cx] of alarmItems) {
    if (!isNum(it.answer) || !it.answer) continue;
    for (let j = 0; j < 30; j++) {
      const m = 0.5 + 1.5 * alarmRandom();
      if (Math.abs(m - 1) <= 0.1) continue;
      const v = +(it.answer * m).toFixed(it.dp ?? 2), g = ctx.Typed.grade(it, String(v), cx);
      if (g.ok || g.note) continue; // right, or a known mistake: not the detective's call
      alarmTried++;
      if (g.hint && !["rounding", "year"].includes(g.hint.kind)) alarmHits++;
    }
  }
}
if (alarmTried && alarmHits / alarmTried > 0.05) fail(`the mistake detective flags ${(alarmHits / alarmTried * 100).toFixed(1)}% of ordinary wrong answers as a slip (5% at most)`);

// "Ask Claude about this": the message built for a wrong answer must be complete for every question in the bank, in
// every format (as shown in a round, with the right option first and the first wrong one picked). A gap would show as
// "undefined", "NaN", "null" or "[object" in the text the user pastes into Claude.
let askChecked = 0;
const askBad = /undefined|NaN|\bnull\b|\[object/;
// Each question is checked in all three versions: wrong (the first wrong option picked), right (the right answer
// given) and skipped (no answer).
const ASK_WORK = { wrong: "My working: ", right: "Why I picked it: ", skipped: "What I tried: " };
const askCheck = (where, it, ans, opts = {}) => {
  askChecked++;
  const outcome = opts.outcome || "wrong";
  let m;
  try { m = ctx.AskClaude.message(it, ans, { cat: "Test", work: "Typed text", notes: outcome === "wrong" ? ["A note."] : [], ...opts }); }
  catch (e) { return fail(`${where} (${outcome}): the Ask Claude message threw: ${e.message}`); }
  if (askBad.test(m)) fail(`${where} (${outcome}): the Ask Claude message has a gap: ${m.match(new RegExp(`.{0,60}${askBad.source}.{0,20}`))?.[0]}`);
  if (!m.includes(ASK_WORK[outcome] + "Typed text")) fail(`${where} (${outcome}): the Ask Claude message is missing the user's working`);
  if (outcome === "wrong" && !m.includes("What the site said about my answer: A note.")) fail(`${where}: the Ask Claude message is missing what the site said`);
  if (!m.includes({ wrong: "got this question wrong", right: "got this question right", skipped: "skipped this question" }[outcome])) fail(`${where} (${outcome}): the Ask Claude message opens with the wrong request`);
};
const rightPick = q => q.type === "reason" ? [0, 0] : q.type === "spot" ? [q.wrong, 0] : q.type === "order" ? q.answer.map((_, k) => k)
  : q.type === "grid" ? q.rows.map(r => r.answer) : q.type === "numeric" ? String(q.answer) : 0;
const askAll = (where, it, wrong, right) => { askCheck(where, it, wrong); askCheck(where, it, right, { outcome: "right" }); askCheck(where, it, null, { outcome: "skipped" }); };
const asShown = q => { // a question as a round shows it, right option first (only the fields the message reads)
  if (q.type === "reason") return { ...q, ans: q.answers, ansOk: 0, ansX: [null, ...q.answerNotes], rsn: q.reasons, rsnOk: 0, rsnX: [null, ...q.reasonNotes] };
  if (q.type === "spot") return { ...q, fix: q.fixes, fixOk: 0, fixX: [null, ...q.fixNotes] };
  if (q.type === "grid") return { ...q, rowOrder: q.rows.map((_, k) => k) };
  return q.type ? q : { ...q, a: 0, x: [null, ...q.x] };
};
const wrongPick = q => q.type === "reason" || q.type === "spot" ? [q.type === "spot" ? (q.wrong + 1) % q.lines.length : 1, 1]
  : q.type === "order" ? q.answer.map((_, k) => k).reverse() : q.type === "grid" ? q.rows.map(r => (r.answer + 1) % q.columns.length) : 1;
if (!ctx.AskClaude) fail("js/askclaude.js didn't define AskClaude");
else {
  for (const [cat, list] of writtenLists) list.forEach((q, n) => { if (q.type !== "walk") askAll(`${cat} written #${n + 1} (${q.type || "mcq"})`, asShown(q), wrongPick(q), rightPick(q)); });
  for (const [cat, list] of Object.entries(Bank.gens)) list.forEach((fn, n) => askAll(`${cat} generator #${n + 1}`, asShown(fn()), 1, 0));
  for (const [cat, list] of Object.entries(Bank.numeric || {})) list.forEach((fn, n) => { const q = fn(); askAll(`${cat} typed-answer generator #${n + 1}`, q, "12.5", rightPick(q)); });
  for (const [cat, list] of Object.entries(Bank.cases || {})) list.forEach((fn, n) => {
    const c = fn(), vals = c.steps.map(() => "1"), rights = c.steps.map(s => String(s.answer));
    askAll(`${cat} case study #${n + 1}`, c, vals, rights);
    c.steps.forEach((_, k) => { askCheck(`${cat} case study #${n + 1} step ${k + 1}`, c, vals, { step: k }); askCheck(`${cat} case study #${n + 1} step ${k + 1}`, c, rights, { step: k, outcome: "right" }); });
  });
}

// Lessons: one per category; complete once marked draft or reviewed.
const Lessons = ctx.Lessons?.all || {};
const text = v => typeof v === "string" && v.trim().length > 0;
for (const cat of categoryIds) if (!Lessons[cat]) fail(`category "${cat}" has no lesson (add site/lessons/${cat}.js)`);
for (const [cat, l] of Object.entries(Lessons)) {
  const where = `lesson ${cat}`;
  if (!categoryIds.includes(cat)) fail(`${where}: no such category in app.js`);
  if (!["stub", "draft", "reviewed"].includes(l.status)) { fail(`${where}: status must be "stub", "draft" or "reviewed", got ${JSON.stringify(l.status)}`); continue; }
  const BLOCKS = ctx.Lessons?.BLOCKS || {};
  const ORDER = ctx.Lessons?.ORDER || [];
  const isDate = v => { if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d = new Date(v + "T00:00:00Z"); return !isNaN(d) && d.toISOString().slice(0, 10) === v; };
  const isSection = p => p && typeof p === "object" && text(p.section) && Object.keys(p).every(k => k === "section" || (k === "added" && isDate(p.added)));
  if (l.newQuestions != null && !isDate(l.newQuestions)) fail(`${where}: newQuestions must be a date written YYYY-MM-DD, got ${JSON.stringify(l.newQuestions)}`);
  for (const p of l.method || []) if (p && typeof p === "object" && text(p.section) && p.added != null && !isDate(p.added)) fail(`${where}: section "${p.section}" has added ${JSON.stringify(p.added)}; write it as a date YYYY-MM-DD`);
  const isCheck = p => p && typeof p === "object" && Object.keys(p).length === 1 && text(p.check);
  const okItem = p => text(p) || isSection(p) || isCheck(p) || (p && typeof p === "object" && Object.hasOwn(BLOCKS, p.kind) && text(p.text) && (p.note == null || text(p.note)) && (p.title == null || text(p.title)) && (p.numbered == null || (p.numbered === true && p.kind !== "formula" && p.text.split("\n").length >= 2)) && Object.keys(p).every(k => ["kind", "title", "text", "note", "numbered"].includes(k)));
  if (l.method != null && (!Array.isArray(l.method) || l.method.some(p => !okItem(p)))) fail(`${where}: method must list paragraphs, { section: "Title" } headings or blocks { kind: ${Object.keys(BLOCKS).join(" | ")}, title?, text, note?, numbered? (true, 2+ lines, not a formula) }`);
  else if (Array.isArray(l.method)) {
    // Split into sections (one implicit section if there are none). Within a section, blocks follow Lessons.ORDER,
    // and a kind used more than once needs a title on each of those blocks.
    const usesSections = l.method.some(isSection);
    if (usesSections && !isSection(l.method[0])) fail(`${where}: a method with sections must start with a { section } heading`);
    const sections = [];
    for (const p of l.method) {
      if (isSection(p)) { sections.push({ name: p.section, blocks: [], checks: [] }); continue; }
      if (!p || typeof p !== "object") continue;
      if (!sections.length) sections.push({ name: "(whole lesson)", blocks: [], checks: [] });
      const sec = sections[sections.length - 1];
      if (isCheck(p)) sec.checks.push(p.check);
      else { if (sec.checks.length) fail(`${where}: in "${sec.name}", the quick check must be the last item of the section`); sec.blocks.push(p); }
    }
    // Quick checks: one per section, at its end, pointing at a multiple-choice or answer + reason question of this category.
    const hasWritten = (Bank.written[cat] || []).length > 0, pool = [...(Bank.written[cat] || []), ...((Bank.formats || {})[cat] || [])];
    const usedChecks = new Set();
    for (const sec of sections) {
      if (hasWritten && sec.checks.length !== 1) fail(`${where}: section "${sec.name}" needs exactly one quick check at its end, has ${sec.checks.length}`);
      if (!hasWritten && sec.checks.length) fail(`${where}: this category has no written questions, so its lesson can't have quick checks`);
      for (const id of sec.checks) {
        const q = pool.find(x => x.id === id);
        if (!q) fail(`${where}: quick check "${id}" isn't a question in this category`);
        else if (q.type && q.type !== "mcq" && q.type !== "reason") fail(`${where}: quick check "${id}" is a ${q.type} question; use multiple choice or answer + reason`);
        if (usedChecks.has(id)) fail(`${where}: quick check "${id}" is used twice`);
        usedChecks.add(id);
      }
    }
    for (const sec of sections) {
      if (!sec.blocks.length) fail(`${where}: section "${sec.name}" has no blocks`);
      if (l.status !== "stub" && !sec.blocks.some(b => b.kind === "example")) fail(`${where}: section "${sec.name}" needs an Example block`);
      sec.blocks.forEach((b, n) => {
        const prev = sec.blocks[n - 1];
        if (prev && ORDER.indexOf(b.kind) < ORDER.indexOf(prev.kind)) fail(`${where}: in "${sec.name}", "${BLOCKS[b.kind]}" comes after "${BLOCKS[prev.kind]}"; blocks follow the order ${ORDER.map(k => BLOCKS[k]).join(" → ")}`);
        if (sec.blocks.filter(x => x.kind === b.kind).length > 1 && !text(b.title)) fail(`${where}: in "${sec.name}", block ${n + 1} ("${BLOCKS[b.kind]}") needs a title, because that kind appears more than once in the section`);
      });
    }
  }
  if (l.example != null) {
    const e = l.example;
    if (!text(e.question) || !text(e.answer)) fail(`${where}: example needs a question and an answer`);
    if (e.working != null && (!Array.isArray(e.working) || e.working.some(w => !text(w)))) fail(`${where}: example working must be a list of non-empty steps`);
  }
  // source: one { text, url? } or a non-empty list of them (a lesson spanning several jurisdictions cites each).
  if (l.source != null) {
    const list = Array.isArray(l.source) ? l.source : [l.source];
    if (!list.length) fail(`${where}: source list is empty`);
    list.forEach((x, k) => {
      const at = list.length > 1 ? `source ${k + 1}` : "source";
      if (!x || !text(x.text)) fail(`${where}: ${at} needs text`);
      else if (x.url != null && x.url !== "" && !/^https?:\/\//i.test(x.url)) fail(`${where}: ${at} url must start with http:// or https://`);
    });
  }
  if (l.widgets != null && !Array.isArray(l.widgets)) fail(`${where}: widgets must be a list of { type, values }`);
  for (const lw of [l.widget, ...(Array.isArray(l.widgets) ? l.widgets : [])]) {
    if (lw == null) continue;
    const w = ctx.Widgets?.registry?.[lw.type];
    if (!w) fail(`${where}: widget "${lw.type}" isn't defined in site/js/widgets.js`);
    else for (const [k, val] of Object.entries(lw.values || {})) {
      const inp = w.inputs.find(i => i.k === k);
      if (!inp) fail(`${where}: widget value "${k}" isn't one of its inputs (${w.inputs.map(i => i.k).join(", ")})`);
      else if (typeof val !== "number" || val < inp.min || val > inp.max) fail(`${where}: widget value ${k} = ${val} is outside ${inp.min}–${inp.max}`);
      else if (Math.abs((val - inp.min) / inp.step - Math.round((val - inp.min) / inp.step)) > 1e-6) fail(`${where}: widget value ${k} = ${val} isn't on the slider's ${inp.step} steps, so the slider would show a different number`);
    }
  }
  if (l.summary != null && (!Array.isArray(l.summary) || l.summary.length < 3 || l.summary.length > 4 || l.summary.some(s => !text(s) || s.length > 180)))
    fail(`${where}: summary must list 3–4 takeaways, each under 180 characters`);
  if (l.status !== "stub") {
    if (l.summary == null) fail(`${where}: a ${l.status} lesson needs an "In 30 seconds" summary`);
    if (!Array.isArray(l.method) || !l.method.length) fail(`${where}: a ${l.status} lesson needs a method`);
    if (!l.example) fail(`${where}: a ${l.status} lesson needs a worked example`);
    if (!l.source) fail(`${where}: a ${l.status} lesson needs a source`);
  }
}
// Answer length: the right option mustn't stand out as the longest. Enforced in every category, new ones included.
const BALANCED = new Set(Object.keys(Bank.written));
const mcqs = Object.entries(Bank.written).flatMap(([cat, list]) => list.filter(q => !q.type || q.type === "mcq").map(q => ({ cat, q })));
const lengthStats = {};
let longestRight = 0;
for (const { cat, q } of mcqs) {
  if (!Array.isArray(q.o) || q.o.length !== 4) continue;
  const L = q.o.map(s => String(s).length), right = L[0], wrongs = L.slice(1), mean = wrongs.reduce((a, b) => a + b, 0) / 3;
  const isLongest = wrongs.every(w => right > w);
  if (isLongest) longestRight++;
  const st = (lengthStats[cat] ||= { n: 0, longest: 0 });
  st.n++; if (isLongest) st.longest++;
  if (BALANCED.has(cat) && isLongest && right >= 1.3 * mean) fail(`${q.id}: the right option (${right} characters) stands out as the longest (wrong ones average ${Math.round(mean)}); balance the lengths`);
}
for (const cat of BALANCED) {
  const st = lengthStats[cat];
  if (st && st.longest / st.n > 0.4) fail(`category ${cat}: the right option is the longest in ${st.longest} of ${st.n} questions (${Math.round(st.longest / st.n * 100)}%); keep it at 40% or less`);
}

// New-format mix: each category with written questions keeps a minimum of the formats that test understanding.
const MIX = { reason: 2, spot: 1, total: 6 };
const mixCats = Object.keys(Bank.written).filter(cat => Bank.written[cat].length);
for (const cat of mixCats) {
  const f = (Bank.formats || {})[cat] || [], cases = ((Bank.cases || {})[cat] || []).length;
  const n = type => f.filter(q => q.type === type).length, total = f.length + cases;
  if (n("reason") < MIX.reason) fail(`category ${cat}: has ${n("reason")} answer + reason question(s); needs at least ${MIX.reason}`);
  if (n("spot") < MIX.spot) fail(`category ${cat}: has ${n("spot")} spot-the-error question(s); needs at least ${MIX.spot}`);
  if (total < MIX.total) fail(`category ${cat}: has ${total} new-format items; needs at least ${MIX.total}`);
}

// Glossary: well-formed entries, and every acronym in a lesson explained there.
const Glossary = ctx.Glossary || [];
if (!Array.isArray(Glossary) || !Glossary.length) fail("js/glossary.js must define a non-empty window.Glossary list");
const glTerms = new Set();
Glossary.forEach((g, i) => {
  const where = `glossary entry ${i + 1}${g && g.term ? ` (${g.term})` : ""}`;
  if (!g || !text(g.term) || !text(g.full) || !text(g.def)) return fail(`${where}: needs a term, a full name and a definition`);
  if (glTerms.has(g.term)) fail(`${where}: the term appears twice`);
  glTerms.add(g.term);
  if (!categoryIds.includes(g.cat)) fail(`${where}: cat must be a category id, got ${JSON.stringify(g.cat)}`);
});
// Not acronyms for this rule: currencies and places, Roman numerals, and people's or publishers' names in sources.
const NOT_ACRONYMS = new Set(["US", "UK", "EU", "II", "III", "IV", "McGraw", "DeMarzo", "McKinsey", "McKenzie", "HotelAVE"]);
const ACRONYM = /(?<![A-Za-z0-9])(?=[A-Za-z0-9&/]*[A-Z][A-Za-z0-9&/]*[A-Z])[A-Za-z][A-Za-z0-9&/]*[A-Za-z0-9](?![A-Za-z0-9])/g;
const known = t => NOT_ACRONYMS.has(t) || glTerms.has(t) || (t.endsWith("s") && glTerms.has(t.slice(0, -1)));
for (const [cat, l] of Object.entries(Lessons)) {
  const missing = new Set();
  // The "Try it" settings (widget names and slider keys) aren't shown as text, so they're left out.
  for (const m of JSON.stringify({ ...l, widget: undefined, widgets: undefined }).replace(/\\n/g, " ").matchAll(ACRONYM)) {
    const t = m[0];
    if (!known(t) && !(t.includes("/") && t.split("/").every(p => p && known(p)))) missing.add(t);
  }
  if (missing.size) fail(`lesson ${cat}: no glossary entry for ${[...missing].join(", ")} (add them to js/glossary.js)`);
  // The summary is the first thing read on the page, so an acronym in it must be spelled out on first use, "full term
  // (ACR)", unless the category description shown just above it already does ("... (ADR), ..." or "(ECM, DCM)").
  if (Array.isArray(l.summary)) {
    const desc = new RegExp(`id: "${cat}"[^}]*desc: "([^"]*)"`).exec(appSrc)?.[1] || "";
    const intro = new Set([...desc.matchAll(/\(([^)]+)\)/g)].flatMap(m => m[1].split(/,\s*/)));
    const isIntro = t => NOT_ACRONYMS.has(t) || intro.has(t) || (t.endsWith("s") && intro.has(t.slice(0, -1))) || intro.has(t + "s");
    const s = l.summary.join(" ¶ ");
    for (const m of s.matchAll(ACRONYM)) {
      const t = m[0];
      if (isIntro(t) || (t.includes("/") && t.split("/").every(p => p && isIntro(p)))) continue;
      const before = s.slice(0, m.index), open = before.lastIndexOf("(");
      if (open > before.lastIndexOf(")")) { intro.add(t); continue; } // spelled out here: "full term (ACR)"
      fail(`lesson ${cat}: the summary uses "${t}" before spelling it out; write "full term (${t})" the first time`);
      intro.add(t); // report each acronym once
    }
  }
}

const lessonCounts = Object.values(Lessons).reduce((m, l) => (m[l.status] = (m[l.status] || 0) + 1, m), {});

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in the question bank:`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ ${written - formatQuestions} written questions, ${formatQuestions} new-format questions, ${gens} generators, ${typed} typed-answer generators, ${cases} case stud${cases === 1 ? "y" : "ies"} and ${papers} paper LBO${papers === 1 ? "" : "s"} (${RUNS} samples each), and ${outLoud} out-loud prompts (${termSets} with key terms) passed.`);
console.log(`✓ ${askChecked} "Ask Claude" messages built (wrong, right and skipped versions of every question and case step), with nothing missing.`);
console.log(`✓ The mistake detective flagged ${(alarmHits / Math.max(1, alarmTried) * 100).toFixed(1)}% of ${alarmTried} ordinary wrong typed answers as a slip (5% at most).`);
console.log(`✓ ${Object.keys(Lessons).length} lessons for ${categoryIds.length} categories (${Object.entries(lessonCounts).map(([k, v]) => `${v} ${k}`).join(", ")}).`);
console.log(`✓ ${Glossary.length} glossary terms; every acronym in the lessons has one.`);
console.log(`✓ Answer length checked in ${BALANCED.size} rebalanced categor${BALANCED.size === 1 ? "y" : "ies"}; across the bank the right option is the longest in ${Math.round(longestRight / mcqs.length * 100)}% of multiple-choice questions (25% would be chance).`);
console.log(`✓ All ${mixCats.length} categories have at least ${MIX.reason} answer + reason, ${MIX.spot} spot the error and ${MIX.total} new-format items in all.`);
