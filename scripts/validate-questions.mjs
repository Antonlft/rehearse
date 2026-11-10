// Checks the question bank without a browser. No dependencies: run with `node scripts/validate-questions.mjs`.
// Loads site/js/bank.js, every site/questions/*.js and site/js/generators*.js into a sandbox, then checks:
//  - every written question has an id (unique), text, an explanation, exactly 4 unique options and exactly 3 notes
//  - no option contains NaN / Infinity / undefined
//  - an optional `trap` list (mistake type per wrong option) has exactly 3 entries, each null or a type from TRAPS in bank.js
//  - every category used by the bank exists in app.js, and every question file is loaded by index.html
//  - every generator, sampled RUNS times with the same 30-try retry the app uses, always yields a valid question
//  - each question is checked by its `type`: multiple choice (no type, or "mcq"), "numeric" (typed answer: a number
//    `answer`, a `tolerance` ≥ 0, an optional `unit`, optional known `wrongs`) or "order" (an `answer` list of 3–8
//    unique steps) or "grid" (2–4 unique `columns`, 3–8 `rows` of { text, answer: column number, note }).
//    Fields belonging to one type (`tolerance`, `unit`, `o`, `rows`, ...) are rejected on the others.
//  - every category has a lesson (site/lessons/<category>.js, loaded by index.html); a "stub" may be empty, but a
//    "draft" or "reviewed" lesson needs a method, a worked example (question, working, answer) and a source;
//    a lesson's optional widget must be one defined in site/js/widgets.js, with starting values only for its own inputs
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
for (const f of ["js/bank.js", "js/widgets.js", ...questionFiles, ...generatorFiles, ...lessonFiles]) {
  try { load(f); } catch (e) { fail(`${f}: failed to load: ${e.message}`); }
}
const { Bank } = ctx;
const TRAPS = ctx.TRAPS || {};
if (!Bank) { console.error("Bank was not defined by js/bank.js"); process.exit(1); }

// Every question/generator file must actually be loaded by the page.
const html = readFileSync(join(SITE, "index.html"), "utf8");
for (const f of [...questionFiles, ...generatorFiles, ...lessonFiles]) if (!new RegExp(`src="${f.replace(/\./g, "\\.")}(\\?[^"]*)?"`).test(html)) fail(`index.html doesn't load ${f}`);

// Every category in the bank must exist in app.js.
const appSrc = readFileSync(join(SITE, "js/app.js"), "utf8");
const appCats = new Set([...appSrc.matchAll(/\{ id: "([a-z]+)"/g)].map(m => m[1]));
const groupIds = new Set([...(/const GROUPS = \[(.*?)\];/.exec(appSrc)?.[1] || "").matchAll(/id: "([a-z]+)"/g)].map(m => m[1]));
const categoryIds = [...appCats].filter(id => !groupIds.has(id)); // the 18 categories (GROUPS also use "id:")
for (const cat of new Set([...Object.keys(Bank.written), ...Object.keys(Bank.gens), ...Object.keys(Bank.numeric || {}), ...Object.keys(Bank.formats || {})])) if (!appCats.has(cat)) fail(`category "${cat}" isn't defined in app.js CATEGORIES`);

const UNITS = ["%", "x", "US$m"];
const isNum = v => typeof v === "number" && Number.isFinite(v);
const notAllowed = (where, q, type, keys) => keys.forEach(k => { if (k in q) fail(`${where}: "${k}" isn't allowed on ${type} question`); });
const checkShape = (where, q) => {
  if (typeof q.q !== "string" || !q.q.trim()) fail(`${where}: missing question text`);
  if (typeof q.why !== "string" || !q.why.trim()) fail(`${where}: missing explanation (why)`);
  if (q.lv !== undefined && ![1, 2, 3].includes(q.lv)) fail(`${where}: lv must be 1, 2 or 3, got ${q.lv}`);
  const type = q.type ?? "mcq";
  if (type === "numeric") return checkNumeric(where, q);
  if (type === "order") return checkOrder(where, q);
  if (type === "grid") return checkGrid(where, q);
  if (type !== "mcq") return fail(`${where}: unknown type "${type}" (expected mcq, numeric, order or grid)`);
  notAllowed(where, q, "a multiple-choice", ["answer", "tolerance", "unit", "wrongs", "dp", "columns", "rows"]);
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
  notAllowed(where, q, "a typed-answer", ["o", "x", "trap", "columns", "rows"]);
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
function checkOrder(where, q) {
  notAllowed(where, q, "an ordering", ["o", "x", "trap", "tolerance", "unit", "wrongs", "dp", "columns", "rows"]);
  if (!Array.isArray(q.answer) || q.answer.length < 3 || q.answer.length > 8) return fail(`${where}: answer must list 3–8 steps in the right order, has ${Array.isArray(q.answer) ? q.answer.length : JSON.stringify(q.answer)}`);
  if (q.answer.some(s => typeof s !== "string" || !s.trim())) fail(`${where}: every step must be non-empty text`);
  if (new Set(q.answer).size !== q.answer.length) fail(`${where}: steps must be unique`);
}

function checkGrid(where, q) {
  notAllowed(where, q, "a grid", ["o", "x", "trap", "tolerance", "unit", "wrongs", "dp", "answer"]);
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

// Lessons: one per category; complete once marked draft or reviewed.
const Lessons = ctx.Lessons?.all || {};
const text = v => typeof v === "string" && v.trim().length > 0;
for (const cat of categoryIds) if (!Lessons[cat]) fail(`category "${cat}" has no lesson (add site/lessons/${cat}.js)`);
for (const [cat, l] of Object.entries(Lessons)) {
  const where = `lesson ${cat}`;
  if (!categoryIds.includes(cat)) fail(`${where}: no such category in app.js`);
  if (!["stub", "draft", "reviewed"].includes(l.status)) { fail(`${where}: status must be "stub", "draft" or "reviewed", got ${JSON.stringify(l.status)}`); continue; }
  if (l.method != null && (!Array.isArray(l.method) || l.method.some(p => !text(p)))) fail(`${where}: method must be a list of non-empty paragraphs`);
  if (l.example != null) {
    const e = l.example;
    if (!text(e.question) || !text(e.answer)) fail(`${where}: example needs a question and an answer`);
    if (e.working != null && (!Array.isArray(e.working) || e.working.some(w => !text(w)))) fail(`${where}: example working must be a list of non-empty steps`);
  }
  if (l.source != null) {
    if (!text(l.source.text)) fail(`${where}: source needs text`);
    if (l.source.url != null && l.source.url !== "" && !/^https?:\/\//i.test(l.source.url)) fail(`${where}: source url must start with http:// or https://`);
  }
  if (l.widget != null) {
    const w = ctx.Widgets?.registry?.[l.widget.type];
    if (!w) fail(`${where}: widget "${l.widget.type}" isn't defined in site/js/widgets.js`);
    else for (const [k, val] of Object.entries(l.widget.values || {})) {
      const inp = w.inputs.find(i => i.k === k);
      if (!inp) fail(`${where}: widget value "${k}" isn't one of its inputs (${w.inputs.map(i => i.k).join(", ")})`);
      else if (typeof val !== "number" || val < inp.min || val > inp.max) fail(`${where}: widget value ${k} = ${val} is outside ${inp.min}–${inp.max}`);
    }
  }
  if (l.status !== "stub") {
    if (!Array.isArray(l.method) || !l.method.length) fail(`${where}: a ${l.status} lesson needs a method`);
    if (!l.example) fail(`${where}: a ${l.status} lesson needs a worked example`);
    if (!l.source) fail(`${where}: a ${l.status} lesson needs a source`);
  }
}
const lessonCounts = Object.values(Lessons).reduce((m, l) => (m[l.status] = (m[l.status] || 0) + 1, m), {});

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in the question bank:`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ ${written - formatQuestions} written questions, ${formatQuestions} new-format questions, ${gens} generators and ${typed} typed-answer generators (${RUNS} samples each) passed.`);
console.log(`✓ ${Object.keys(Lessons).length} lessons for ${categoryIds.length} categories (${Object.entries(lessonCounts).map(([k, v]) => `${v} ${k}`).join(", ")}).`);
