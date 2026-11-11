// Checks the mental maths sprint's sums (site/js/sprint.js) without a browser. No dependencies:
//   node scripts/test-sprint.mjs
// For every kind of sum: the answer matches a hand recomputation from its inputs, is non-zero and needs at most
// 3 decimal places, the question text is clean, and the typed-answer reader accepts the right answer (and rejects
// a clearly wrong one). Exits with code 1 if any check fails. Runs in CI before every deploy.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const ctx = vm.createContext({ Math, Number, String, Object, Array, console });
ctx.window = ctx;
for (const f of ["js/bank.js", "js/sprint.js"]) vm.runInContext(readFileSync(join(SITE, f), "utf8"), ctx, { filename: f });
const { Sprint, Typed } = ctx;

// The right answer for each kind, worked out independently from the inputs.
const expected = {
  pctOf: ({ p, base }) => base * p / 100,
  pctChange: ({ a, b }) => (b / a - 1) * 100,
  divide: ({ n, d }) => n / d,
  multiple: ({ m, e }) => m * e,
  bps: ({ bp, amt }) => amt * bp / 10000,
  doubling: ({ r }) => 72 / r,
  yieldMultiple: ({ y, m }) => y != null ? 100 / y : 100 / m,
  compound: ({ base, g }) => base * (1 + g / 100) * (1 + g / 100)
};

const fails = [];
let checks = 0;
const seenKinds = {};
let prev = null, repeats = 0;
for (let k = 0; k < 20000; k++) {
  const it = Sprint.make(prev);
  if (it.kind === prev) repeats++;
  prev = it.kind;
  seenKinds[it.kind] = (seenKinds[it.kind] || 0) + 1;
  const where = `${it.kind} (${it.q})`;
  const want = expected[it.kind];
  checks++;
  if (!want) { fails.push(`${where}: no hand check for this kind`); continue; }
  if (Math.abs(it.answer - want(it.inputs)) > 1e-6) fails.push(`${where}: answer ${it.answer}, expected ${want(it.inputs)}`);
  if (!(it.answer !== 0 && Sprint.clean(it.answer))) fails.push(`${where}: answer ${it.answer} is zero or needs more than 3 decimal places`);
  if (/NaN|Infinity|undefined/.test(it.q)) fails.push(`${where}: question text is broken`);
  if (!Typed.grade(it, Typed.show(it.answer, it.unit, it.dp)).ok) fails.push(`${where}: the right answer, typed as ${Typed.show(it.answer, it.unit, it.dp)}, isn't accepted`);
  if (Typed.grade(it, String(it.answer * 1.5 + 1)).ok) fails.push(`${where}: a clearly wrong answer is accepted`);
  if (fails.length > 20) break;
}
checks++;
for (const kind of Object.keys(Sprint.KINDS)) if (!seenKinds[kind]) fails.push(`${kind}: never generated`);
checks++;
if (repeats) fails.push(`the same kind came up twice in a row ${repeats} times`);

// Spot checks worked by hand.
const typed = (answer, unit, raw, tolerance = 0.001) => Typed.grade({ answer, unit, tolerance }, raw).ok;
for (const [label, ok] of [
  ["15% of 240 = 36", typed(36, undefined, "36")],
  ["80 → 92 is +15%, typed as 15%", typed(15, "%", "15%")],
  ["a 15% fall typed as −15", typed(-15, "%", "−15")],
  ["a 15% fall typed as 15 is wrong", !typed(-15, "%", "15")],
  ["35bp of US$250m = 0.875, typed as 875k", typed(0.875, "US$m", "875k", 0.0005)],
  ["a 16x multiple is a 6.25% yield, typed as 0.0625", typed(6.25, "%", "0.0625", 0.005)],
  ["rule of 72 at 9% = 8, typed as 8.2", typed(8, undefined, "8.2", 0.5)]
]) { checks++; if (!ok) fails.push(`spot check failed: ${label}`); }

if (fails.length) { console.error(`✗ ${fails.length} sprint check(s) failed:`); for (const f of fails) console.error("  - " + f); process.exit(1); }
console.log(`✓ ${checks} sprint checks passed (${Object.keys(Sprint.KINDS).length} kinds of sum, 20,000 samples).`);
