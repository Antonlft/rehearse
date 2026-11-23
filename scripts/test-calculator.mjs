// Checks the built-in calculator's maths, and how typed answers are read and graded, against hand-worked answers. No dependencies:
//   node scripts/test-calculator.mjs
// Exits with code 1 if any case fails. Runs in CI before every deploy.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "site", "js", "calculator.js");
const ctx = vm.createContext({ Math, Number, String, Error, console });
ctx.window = ctx;
vm.runInContext(readFileSync(file, "utf8"), ctx, { filename: "calculator.js" });
vm.runInContext(readFileSync(join(dirname(file), "bank.js"), "utf8"), ctx, { filename: "bank.js" });
const { evaluate, toFraction, format } = ctx.Calc;
const { Typed } = ctx;

// [expression, expected value]  (worked out by hand)
const values = [
  ["2+3*4", 14],                 // multiplication before addition
  ["(2+3)*4", 20],               // brackets first
  ["2×(3+4)÷7", 2],              // calculator symbols
  ["10−4−3", 3],                 // subtraction runs left to right (unicode minus)
  ["100/10/5", 2],               // division runs left to right
  ["2^10", 1024],
  ["2^3^2", 512],                // powers group right to left: 2^(3^2)
  ["-2^2", -4],                  // minus applies after the power
  ["(-2)^2", 4],
  ["2^-1", 0.5],                 // negative exponent
  ["1.05^10", 1.628894626777442],// compounding: 5% for 10 years
  ["(1+0.08)^(1/5)-1", 0.015511278397481565], // fifth root via a fractional power: e^(0.2 × ln 1.08) − 1
  ["√16", 4],
  ["√9+1", 4],                   // √ applies to the 9 only
  ["√(9+16)", 5],
  ["∛27", 3],
  ["sqrt(2)^2", 2],
  ["ln(exp(2))", 2],
  ["exp(0)", 1],
  ["log(1000)", 3],
  ["ln(2)", 0.6931471805599453],
  ["50%", 0.5],                  // % divides by 100
  ["50%*200", 100],
  ["200+10%", 200.1],            // % is "divide by 100", not "10% of 200"
  ["2(3+4)", 14],                // implicit multiplication
  ["(1+2)(3+4)", 21],
  ["2π", 2 * Math.PI],
  ["0.1+0.2", 0.30000000000000004],
  ["3/4", 0.75],
  ["  7 * 6  ", 42],             // spaces are ignored
  ["Ans*2", 84, { ans: 42 }],    // last answer
  ["M+1", 11, { memory: 10 }],   // memory recall
];
// Expressions that must be rejected with an error rather than give a number.
const errors = ["1/0", "√(-1)", "ln(0)", "2+", "(2+3", "2+3)", "", "3**2", "abc", "Ans", "1..2", "1.2.3"];
// [value, expected display]
const formats = [[0.1 + 0.2, "0.3"], [1 / 3, "0.333333333333"], [-2.5, "−2.5"], [1e21, "1e+21"], [12, "12"]];
// [value, expected fraction or null]
const fractions = [[0.75, "3/4"], [1 / 3, "1/3"], [-0.125, "−1/8"], [2.5, "5/2"], [22 / 7, "22/7"], [Math.PI, null], [3, null], [Math.SQRT2, null]];

const fails = [];
const close = (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(b));
for (const [src, want, env] of values) {
  try { const got = evaluate(src, env || {}); if (!close(got, want)) fails.push(`${src} = ${got}, expected ${want}`); }
  catch (e) { fails.push(`${src} threw "${e.message}", expected ${want}`); }
}
for (const src of errors) {
  try { const got = evaluate(src, {}); fails.push(`${JSON.stringify(src)} gave ${got}, expected an error`); } catch { /* expected */ }
}
for (const [v, want] of formats) if (format(v) !== want) fails.push(`format(${v}) = ${format(v)}, expected ${want}`);
for (const [v, want] of fractions) if (toFraction(v) !== want) fails.push(`toFraction(${v}) = ${toFraction(v)}, expected ${want}`);

// Typed answers. A WACC-style question: right answer 12.5%, tolerance 0.05 points, one known wrong answer (no tax shield).
const pctQ = { type: "numeric", unit: "%", answer: 12.5, tolerance: 0.05, wrongs: [{ value: 14.2, note: "No tax shield.", trap: "missed-step" }] };
const moneyQ = { type: "numeric", unit: "US$m", answer: 1.2, tolerance: 0.01 };
const multQ = { type: "numeric", unit: "x", answer: 2.5, tolerance: 0.05 };
const dollarQ = { type: "numeric", unit: "US$", answer: 350000, tolerance: 500 }; // e.g. value per hotel room
const priceQ = { type: "numeric", unit: "US$", answer: 1.85, tolerance: 0.005 };   // e.g. EPS
const yearsQ = { type: "numeric", unit: "years", answer: 6, tolerance: 0 };
// [question, typed text, should it be right?]
const typedRight = [
  [pctQ, "12.5%", true], [pctQ, "0.125", true], [pctQ, "12.5 %", true], [pctQ, "12.5", true], [pctQ, " 12.50 ", true],
  [pctQ, "1/8", true], [pctQ, "12.54", true], [pctQ, "12.6", false], [pctQ, "125%", false], [pctQ, "abc", false], [pctQ, "", false],
  [moneyQ, "1.2", true], [moneyQ, "1.2m", true], [moneyQ, "US$1.2m", true], [moneyQ, "$1,200,000", true], [moneyQ, "1200k", true],
  [moneyQ, "0.0012bn", true], [moneyQ, "12", false], [{ ...moneyQ, answer: 18, tolerance: 0.1 }, "0.000018", false],
  [{ ...moneyQ, answer: 0.018, tolerance: 0.001 }, "18,000", true],
  [multQ, "2.5x", true], [multQ, "2.5", true], [multQ, "5/2", true], [multQ, "−2.5", false],
  [dollarQ, "350000", true], [dollarQ, "350,000", true], [dollarQ, "US$350,000", true], [dollarQ, "$350k", true], [dollarQ, "0.35m", true],
  [dollarQ, "350", false], [priceQ, "1.85", true], [priceQ, "$1.85", true], [priceQ, "1.9", false],
  [yearsQ, "6", true], [yearsQ, "6 years", true], [yearsQ, "6yrs", true], [yearsQ, "6y", true], [yearsQ, "7", false],
];
for (const [q, raw, want] of typedRight) {
  const g = Typed.grade(q, raw);
  if (g.ok !== want) fails.push(`typed ${JSON.stringify(raw)} on a ${q.unit} question (answer ${q.answer}) graded ${g.ok ? "right" : "wrong"}, expected ${want ? "right" : "wrong"}`);
}
// Why a typed answer was wrong: [typed text, expected cause, expected mistake type]
const typedCauses = [["12.0%", "calculation-slip", null], ["13.5", "calculation-slip", null], ["14.2%", "concept-gap", "missed-step"], ["25%", "concept-gap", null]];
for (const [raw, cause, trap] of typedCauses) {
  const g = Typed.grade(pctQ, raw);
  if (g.cause !== cause || g.trap !== trap) fails.push(`typed ${raw}: cause ${g.cause}/${g.trap}, expected ${cause}/${trap}`);
}
// A small bare number on a US$m question means millions: "38" is US$38m, never US$0.000038m (it used to be read as
// plain dollars whenever that reading was closer to the right answer, which hid the known mistake below).
const ebitQ = { type: "numeric", unit: "US$m", answer: 18, tolerance: 0.1, wrongs: [{ value: 38, note: "That's EBITDA.", trap: "missed-step" }] };
const r38 = Typed.grade(ebitQ, "38");
if (r38.value !== 38 || r38.note !== "That's EBITDA.") fails.push(`typed 38 on a US$m question read as ${r38.value}, note ${r38.note}; expected 38 and the EBITDA note`);
// A known mistake close to the right answer (11% off) still gives its note and counts as a method mistake, not a slip.
const fcfQ = { type: "numeric", unit: "US$m", answer: 34.22, tolerance: 0.02, wrongs: [{ value: 38, note: "That leaves out tax.", trap: "missed-step" }] };
const rTax = Typed.grade(fcfQ, "38");
if (rTax.note !== "That leaves out tax." || rTax.cause !== "concept-gap") fails.push(`typed 38 on the free cash flow step: note ${rTax.note}, cause ${rTax.cause}; expected the tax note and concept-gap`);
if (Math.abs(rTax.rel - 0.1105) > 0.001) fails.push(`typed 38 vs 34.22: rel ${rTax.rel}, expected about 0.11 (11% above)`);
// Case studies keep a known mistake that lands close to the right answer (they used to drop any within 12%).
ctx.Bank.case("_test", { make: () => ({}), intro: () => "", steps: [{ unit: "US$m", dp: 2, tolerance: 0.02, ask: () => "", why: () => "", solve: () => 34.22,
  wrongs: () => [{ value: 38, note: "That leaves out tax.", trap: "missed-step" }, { value: 34.23, note: "Within the tolerance.", trap: "missed-step" }] }] });
const caseStep = ctx.Bank.cases._test.pop()().steps[0];
if (caseStep.wrongs.length !== 1 || caseStep.wrongs[0].value !== 38) fails.push(`a case step kept ${JSON.stringify(caseStep.wrongs.map(w => w.value))} as known mistakes; expected [38] (the close one kept, the one within the tolerance dropped)`);
// The mistake detective: a wrong answer that matches no known mistake gets the common slip that explains it.
// [question, typed text, expected kind (null = none), expected trap]
const kinds = [
  [moneyQ, "1200", "units", "units"], [moneyQ, "0.0012", "units", "units"], [moneyQ, "12", "units", "units"], [pctQ, "1250%", "units", "units"],
  [{ ...moneyQ, answer: 18, tolerance: 0.1 }, "18,000", "units", "units"],
  [multQ, "−2.5", "sign", "sign"], [multQ, "0.4", "inverted", "inverted"], [pctQ, "800%", "inverted", "inverted"],
  [fcfQ, "43.22", "swap", null], [yearsQ, "7", "year", null], [pctQ, "12.6", "rounding", null],
  [pctQ, "25%", null, null], [pctQ, "14.2%", null, "missed-step"], [fcfQ, "38", null, "missed-step"], [multQ, "3.4", null, null],
];
for (const [q, raw, kind, trap] of kinds) {
  const g = Typed.grade(q, raw), got = g.hint ? g.hint.kind : null;
  if (got !== kind || g.trap !== trap) fails.push(`typed ${raw} on a ${q.unit} question (answer ${q.answer}): detective found ${got}/${g.trap}, expected ${kind}/${trap}`);
}
// Slips that point to arithmetic count as calculation slips; a units slip uses the reading that explains it.
if (Typed.grade(pctQ, "12.6").cause !== "calculation-slip") fails.push("a rounding slip should count as a calculation slip");
if (Typed.grade({ ...moneyQ, answer: 18, tolerance: 0.1 }, "18,000").value !== 18000) fails.push("18,000 on a US$18m question should be read as typed (US$18,000m, 1,000 times too big)");
// Case-study checks: the detective compares with earlier steps' answers and the case's own figures.
ctx.Bank.case("_plant", { make: () => ({}),
  intro: () => "A plant costs US$95m. Revenue is US$113m a year and cash operating costs US$62m, for 5 years. The tax rate is 25%.",
  steps: [
    { unit: "US$m", dp: 1, tolerance: 0.1, ask: () => "What is EBIT?", why: () => "", solve: () => 32 },
    { unit: "US$m", dp: 2, tolerance: 0.02, ask: () => "EBIT is US$32.0m. What is free cash flow?", why: () => "", solve: () => 43 },
    { unit: "US$m", dp: 1, tolerance: 0.1, ask: () => "What is the present value?", why: () => "", solve: () => 167.3 },
    { unit: "US$m", dp: 1, tolerance: 0.1, ask: () => "What is the NPV?", why: () => "", solve: () => 72.3 },
    { unit: "years", dp: 0, tolerance: 0, ask: () => "Annuity factors: 1 year 0.92 · 2 years 1.76 · 3 years 2.53. In which year?", why: () => "", solve: () => 3 }] });
const plant = ctx.Bank.cases._plant.pop()(), step = (k, raw) => Typed.grade(plant.steps[k], raw, Typed.caseContext(plant, k));
const caseKinds = [
  [1, "32", "earlier", "step 1"], [0, "113", "given", "US$113m"], [3, "134.3", "plus", "US$62m"], [3, "-22.7", "minus", "US$95m"],
  [1, "32.25", "rate", "25%"], [2, "836.5", "factor", "5 years"], [2, "200", null, null],
  [4, "2", "year", null], [4, "5", null, null], // year steps skip the case checks (their questions list every year)
];
for (const [k, raw, kind, says] of caseKinds) {
  const g = step(k, raw), got = g.hint ? g.hint.kind : null;
  if (got !== kind || (says && !g.hint.text.includes(says))) fails.push(`case step ${k + 1}, typed ${raw}: detective found ${got} ("${g.hint?.text}"), expected ${kind}${says ? ` mentioning ${says}` : ""}`);
}
// Outside a case study there are no figures to compare with.
if (Typed.grade(plant.steps[0], "113").hint) fails.push("typed 113 without the case's figures shouldn't be read as a figure from the question");
// Percentages: only a number below 1 is also read as a decimal ("0.125" = 12.5%); "12.4" is 12.4%, never 1,240%.
if (Typed.readings("12.4", "%").length !== 1) fails.push(`"12.4" on a % question should have one reading, got ${Typed.readings("12.4", "%")}`);
// Readiness (weak-spots report): the worked examples from the plan. mk(ok, wrong, sureWrong) builds answers, oldest
// first, with sureWrong of the wrong ones rated "Sure".
const mk = (ok, wrong, sureWrong = 0) => [...Array(ok).fill({ ok: true }), ...Array(wrong).fill(0).map((_, k) => ({ ok: false, ...(k < sureWrong ? { confidence: "sure" } : {}) }))];
const R = ctx.Readiness;
const readyCases = [
  ["Valuation: 17/20, 1 confident mistake, 2 due", mk(17, 3, 1), 2, "ready", ""],
  ["LBO: 17/20, 3 confident mistakes", mk(17, 3, 3), 0, "nearly", "3 confident mistakes"],
  ["Credit: 12/14, 6 due", mk(12, 2), 6, "nearly", "6 due for review"],
  ["Accounting: 12/20, 7 due", mk(12, 8), 7, "work", "60% right · 7 due for review"],
  ["FIG: 6 answers", mk(5, 1), 0, "none", "6 of 10 answers needed"],
  ["70% right, nothing else", mk(14, 6), 0, "nearly", "70% right"],
  ["Only the last 20 count: 10 old wrongs then 20 right", [...mk(0, 10), ...mk(20, 0)], 0, "ready", ""],
  ["Exactly 80% and 4 due is ready", mk(16, 4), 4, "ready", ""],
  ["Exactly 65% is nearly ready", mk(13, 7), 0, "nearly", "65% right"],
  ["60% needs work", mk(12, 8), 0, "work", "60% right"],
];
for (const [name, answers, due, level, why] of readyCases) {
  const r = R.of(answers, due);
  if (r.level !== level || r.reasons.join(" · ") !== why) fails.push(`readiness ${name}: got ${r.level} ("${r.reasons.join(" · ")}"), expected ${level} ("${why}")`);
}
const shows = [[12.5, "%", undefined, "12.5%"], [1.2, "US$m", undefined, "US$1.2m"], [2.5, "x", undefined, "2.5x"], [-3, "%", undefined, "−3%"],
  [6.993811140994688, "%", 1, "7.0%"], [8.4249, "%", 2, "8.42%"],
  [350000, "US$", 0, "US$350,000"], [1.8512, "US$", 2, "US$1.85"], [6, "years", 0, "6 years"], [1, "years", 0, "1 year"]];
for (const [v, u, dp, want] of shows) if (Typed.show(v, u, dp) !== want) fails.push(`Typed.show(${v}, ${u}, ${dp}) = ${Typed.show(v, u, dp)}, expected ${want}`);

const total = values.length + errors.length + formats.length + fractions.length + typedRight.length + typedCauses.length + 4 + kinds.length + 2 + caseKinds.length + 2 + readyCases.length + shows.length;
if (fails.length) {
  console.error(`✗ ${fails.length} of ${total} calculator and typed-answer checks failed:`);
  for (const f of fails) console.error("  - " + f);
  process.exit(1);
}
console.log(`✓ ${total} calculator and typed-answer checks passed.`);
