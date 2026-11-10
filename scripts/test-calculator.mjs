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
// [question, typed text, should it be right?]
const typedRight = [
  [pctQ, "12.5%", true], [pctQ, "0.125", true], [pctQ, "12.5 %", true], [pctQ, "12.5", true], [pctQ, " 12.50 ", true],
  [pctQ, "1/8", true], [pctQ, "12.54", true], [pctQ, "12.6", false], [pctQ, "125%", false], [pctQ, "abc", false], [pctQ, "", false],
  [moneyQ, "1.2", true], [moneyQ, "1.2m", true], [moneyQ, "US$1.2m", true], [moneyQ, "$1,200,000", true], [moneyQ, "1200k", true],
  [moneyQ, "0.0012bn", true], [moneyQ, "12", false],
  [multQ, "2.5x", true], [multQ, "2.5", true], [multQ, "5/2", true], [multQ, "−2.5", false],
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
const shows = [[12.5, "%", undefined, "12.5%"], [1.2, "US$m", undefined, "US$1.2m"], [2.5, "x", undefined, "2.5x"], [-3, "%", undefined, "−3%"],
  [6.993811140994688, "%", 1, "7.0%"], [8.4249, "%", 2, "8.42%"]];
for (const [v, u, dp, want] of shows) if (Typed.show(v, u, dp) !== want) fails.push(`Typed.show(${v}, ${u}, ${dp}) = ${Typed.show(v, u, dp)}, expected ${want}`);

const total = values.length + errors.length + formats.length + fractions.length + typedRight.length + typedCauses.length + shows.length;
if (fails.length) {
  console.error(`✗ ${fails.length} of ${total} calculator and typed-answer checks failed:`);
  for (const f of fails) console.error("  - " + f);
  process.exit(1);
}
console.log(`✓ ${total} calculator and typed-answer checks passed.`);
