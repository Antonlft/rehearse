// Checks the question bank without a browser. No dependencies: run with `node scripts/validate-questions.mjs`.
// Loads site/js/bank.js, every site/questions/*.js and site/js/generators*.js into a sandbox, then checks:
//  - every written question has an id (unique), text, an explanation, exactly 4 unique options and exactly 3 notes
//  - no option contains NaN / Infinity / undefined
//  - every category used by the bank exists in app.js, and every question file is loaded by index.html
//  - every generator, sampled RUNS times with the same 30-try retry the app uses, always yields a valid question
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
for (const f of ["js/bank.js", ...questionFiles, ...generatorFiles]) {
  try { load(f); } catch (e) { fail(`${f}: failed to load: ${e.message}`); }
}
const { Bank } = ctx;
if (!Bank) { console.error("Bank was not defined by js/bank.js"); process.exit(1); }

// Every question/generator file must actually be loaded by the page.
const html = readFileSync(join(SITE, "index.html"), "utf8");
for (const f of [...questionFiles, ...generatorFiles]) if (!html.includes(`src="${f}"`)) fail(`index.html doesn't load ${f}`);

// Every category in the bank must exist in app.js.
const appCats = new Set([...readFileSync(join(SITE, "js/app.js"), "utf8").matchAll(/\{ id: "([a-z]+)"/g)].map(m => m[1]));
for (const cat of new Set([...Object.keys(Bank.written), ...Object.keys(Bank.gens)])) if (!appCats.has(cat)) fail(`category "${cat}" isn't defined in app.js CATEGORIES`);

const checkShape = (where, q) => {
  if (typeof q.q !== "string" || !q.q.trim()) fail(`${where}: missing question text`);
  if (typeof q.why !== "string" || !q.why.trim()) fail(`${where}: missing explanation (why)`);
  if (!Array.isArray(q.o) || q.o.length !== 4) fail(`${where}: needs exactly 4 options, has ${q.o?.length}`);
  else {
    if (new Set(q.o).size !== 4) fail(`${where}: options aren't unique: ${JSON.stringify(q.o)}`);
    q.o.forEach((s, i) => { if (typeof s !== "string" || BAD_TEXT.test(s)) fail(`${where}: option ${i + 1} is invalid: ${JSON.stringify(s)}`); });
  }
  if (!Array.isArray(q.x) || q.x.length !== 3) fail(`${where}: needs exactly 3 notes in x, has ${q.x?.length}`);
  else if (q.x.some(s => typeof s !== "string" || !s.trim())) fail(`${where}: a note in x is empty`);
  if (q.lv !== undefined && ![1, 2, 3].includes(q.lv)) fail(`${where}: lv must be 1, 2 or 3, got ${q.lv}`);
};

// Written questions
const ids = new Map();
let written = 0;
for (const [cat, list] of Object.entries(Bank.written)) {
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

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in the question bank:`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ ${written} written questions and ${gens} generators (${RUNS} samples each) passed.`);
