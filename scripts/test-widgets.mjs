// Checks the maths behind every lesson widget ("Try it") against hand-worked answers. No dependencies:
//   node scripts/test-widgets.mjs
// Exits with code 1 if any check fails. Runs in CI before every deploy.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "site", "js", "widgets.js");
const ctx = vm.createContext({ Math, Number, String, Object, Array, console });
ctx.window = ctx;
vm.runInContext(readFileSync(file, "utf8"), ctx, { filename: "widgets.js" });
const W = ctx.Widgets.registry;
const fails = [];
let checks = 0;
const run = (name, values) => { const w = W[name]; const v = Object.fromEntries(w.inputs.map(i => [i.k, values[i.k] ?? i.value])); return w.compute(v); };
const near = (name, label, got, want, tol = 1e-6) => { checks++; if (!(Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)))) fails.push(`${name}: ${label} = ${got}, expected ${want}`); };
const is = (name, label, got, want) => { checks++; if (got !== want) fails.push(`${name}: ${label} = ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`); };

// EV bridge: 1,200 − 400 + 100 − 50 − 0 = 850
let r = run("evBridge", {}); near("evBridge", "net debt", r.netDebt, 300); near("evBridge", "equity", r.equity, 850);
r = run("evBridge", { ev: 500, debt: 600, cash: 0, nci: 0 }); near("evBridge", "negative equity", r.equity, -100);
// WACC: 70% × 10% + 30% × 6% × 75% = 7% + 1.35% = 8.35%; shield 30% × 6% × 25% = 0.45%
r = run("wacc", {}); near("wacc", "wacc", r.wacc, 0.0835); near("wacc", "shield", r.shield, 0.0045); near("wacc", "equity part", r.eq, 0.07);
// Compounding at 8% for 10 years: 1.08^10 = 2.158925; rule of 72 = 9.0 years; exact = ln 2 / ln 1.08 = 9.00647 years
r = run("compound", {}); near("compound", "multiple", r.multiple, 2.158925, 1e-6); near("compound", "rule of 72", r.rule72, 9); near("compound", "exact doubling", r.exact, 9.006468, 1e-6); near("compound", "simple", r.simple, 1.8);
// LBO: entry 100 × 10 = 1,000, debt 500, equity 500. EBITDA 100 × 1.05^5 = 127.628; exit EV 1,276.28; debt 300; equity 976.28
r = run("lboReturns", {});
near("lboReturns", "entry equity", r.eq0, 500); near("lboReturns", "exit equity", r.eq1, 976.28156, 1e-6); near("lboReturns", "MOIC", r.moic, 1.9525631, 1e-6);
near("lboReturns", "IRR", r.irr, 1.9525631 ** 0.2 - 1, 1e-6); near("lboReturns", "debt paydown", r.paydown, 200); near("lboReturns", "multiple effect", r.multiple, 0);
// The three sources always add up to the equity gain, including with a multiple change
for (const v of [{}, { m1: 8, g: -0.02 }, { m1: 12.5, repay: 0, lev: 6 }]) { const x = run("lboReturns", v); near("lboReturns", `attribution adds up ${JSON.stringify(v)}`, x.growth + x.multiple + x.paydown, x.eq1 - x.eq0, 1e-9); }
// Recovery: EV 550 → secured 300 in full, 250 of 400 unsecured (62.5%), subordinated nothing; fulcrum = unsecured
r = run("recovery", {}); near("recovery", "secured", r.sec, 1); near("recovery", "unsecured", r.uns, 0.625); near("recovery", "subordinated", r.sub, 0); is("recovery", "fulcrum", r.fulcrum, "uns");
r = run("recovery", { ev: 1000 }); near("recovery", "equity residual", r.equity, 100); is("recovery", "no fulcrum", r.fulcrum, null);
r = run("recovery", { ev: 150 }); near("recovery", "secured partial", r.sec, 0.5); is("recovery", "fulcrum secured", r.fulcrum, "sec");
// Depreciation +10 at 25% tax: net income −7.5, cash +2.5, PP&E −10, equity −7.5 (assets −7.5 = equity −7.5)
r = run("depreciation", {}); near("depreciation", "net income", r.ni, -7.5); near("depreciation", "cash", r.cash, 2.5); near("depreciation", "PP&E", r.ppe, -10);
near("depreciation", "balances", r.cash + r.ppe, r.equity);
// Bond: 5% coupon, 10 years, 6% yield → 92.640; at par when coupon = yield
r = run("bondPrice", {}); near("bondPrice", "price", r.price, 92.63991, 1e-6); checks++; if (!(r.modDur > 7.4 && r.modDur < 7.7)) fails.push(`bondPrice: modified duration ${r.modDur}, expected about 7.5`);
r = run("bondPrice", { c: 0.06, y: 0.06 }); near("bondPrice", "par", r.price, 100, 1e-9);
// P/TBV = (14% − 3%) / (11% − 3%) = 1.375; equals 1.0 when ROTE = cost of equity
r = run("ptbv", {}); near("ptbv", "P/TBV", r.ptbv, 1.375); r = run("ptbv", { rote: 0.11 }); near("ptbv", "at cost of equity", r.ptbv, 1);
// TERP: (4 × 10 + 7) / 5 = 9.40; right worth 2.40
r = run("terp", {}); near("terp", "TERP", r.terp, 9.4); near("terp", "right", r.right, 2.4);
// Yield curve shapes
is("yieldCurve", "normal", run("yieldCurve", {}).shape, "normal"); is("yieldCurve", "inverted", run("yieldCurve", { s: 0.05, l: 0.03 }).shape, "inverted"); is("yieldCurve", "flat", run("yieldCurve", { s: 0.04, l: 0.04 }).shape, "flat");
// Accretion: all stock, buying at 15x with shares at 20x → 6.67% earnings yield vs 5% cost: accretive; at 25x: dilutive
is("accretion", "15x target", run("accretion", {}).accretive, true); is("accretion", "25x target", run("accretion", { tgtPE: 25 }).accretive, false);
r = run("accretion", { stock: 0, tgtPE: 30 }); near("accretion", "cash cost", r.cost, 0.04); is("accretion", "cash at 30x", r.accretive, false);
// Monty Hall: exact 1/3 vs 2/3, and a seeded simulation lands close to it
r = run("montyHall", {}); near("montyHall", "stay", r.stay, 1 / 3); near("montyHall", "switch", r.switch, 2 / 3);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sim = W.montyHall.simulate(100000, rnd); checks++; if (Math.abs(sim.switch / 100000 - 2 / 3) > 0.01) fails.push(`montyHall: simulated switch rate ${sim.switch / 100000}`);
// RevPAR: 78% × 180 = 140.40; × 200 rooms × 365 = US$10.249m
r = run("revpar", {}); near("revpar", "RevPAR", r.revpar, 140.4); near("revpar", "annual", r.annual, 10.2492, 1e-6);
// Hotel models: revenue 40 → GOP 14; managed 14 − 1.2 − 1.12 = 11.68; franchise 14 − 2 = 12. Bad year (30): GOP 7.5; managed 6.0; franchise 6.0; lease 8 both
r = run("hotelModels", {});
near("hotelModels", "managed normal", r.good.managed, 11.68); near("hotelModels", "franchised normal", r.good.franchised, 12);
near("hotelModels", "managed bad", r.bad.managed, 6.0); near("hotelModels", "franchised bad", r.bad.franchised, 6.0); near("hotelModels", "lease unchanged", r.change.lease, 0);
// Yield: 5 / 5% = 100; +50bp → 90.909 (−9.09%)
r = run("yieldValue", {}); near("yieldValue", "before", r.before, 100); near("yieldValue", "after", r.after, 90.9090909, 1e-6); near("yieldValue", "change", r.change, -0.0909091, 1e-5);
// PBSA: 500 × 220 × 51 × 98% = US$5.4978m; NOI × 70% = 3.84846; ÷ 5% = 76.969; per bed 153,938
r = run("rentRoll", {}); near("rentRoll", "gross", r.gross, 5.4978); near("rentRoll", "NOI", r.noi, 3.84846); near("rentRoll", "value", r.value, 76.9692); near("rentRoll", "per bed", r.perBed, 153938.4, 1e-6);
// Max loan: LTV 60; ICR 6.5 / 1.75 / 6% = 61.90; debt yield 6.5 / 9% = 72.22 → LTV binds at 60
r = run("maxLoan", {}); near("maxLoan", "ICR limit", r.byIcr, 61.9047619, 1e-6); near("maxLoan", "loan", r.loan, 60); is("maxLoan", "binding", r.binding, "LTV");
r = run("maxLoan", { rate: 0.08 }); is("maxLoan", "binding at 8%", r.binding, "ICR"); near("maxLoan", "loan at 8%", r.loan, 46.4285714, 1e-6);
// Capital stack: 55% × 6% + 15% × 11% = 4.95% on 70% → 7.07%; overall + 30% × 15% = 9.45%
r = run("capitalStack", {}); near("capitalStack", "blended debt", r.blendedDebt, 0.0707143, 1e-5); near("capitalStack", "overall", r.overall, 0.0945); near("capitalStack", "equity", r.eq, 0.30);

// Every widget's default view must compute and render without NaN.
for (const [name, w] of Object.entries(W)) {
  checks++;
  try {
    const v = Object.fromEntries(w.inputs.map(i => [i.k, i.value]));
    const html = w.render(v, w.compute(v));
    if (/NaN|undefined|Infinity/.test(html)) fails.push(`${name}: default view shows NaN/undefined/Infinity`);
  } catch (e) { fails.push(`${name}: render failed: ${e.message}`); }
}

if (fails.length) { console.error(`✗ ${fails.length} of ${checks} widget checks failed:`); for (const f of fails) console.error("  - " + f); process.exit(1); }
console.log(`✓ ${checks} widget checks passed (${Object.keys(W).length} widgets).`);
