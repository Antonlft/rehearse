/* Mental maths sprint: quick sums to do in your head, generated with friendly numbers.
   Sprint.make(prevKind) → { kind, q, answer, unit, tolerance, dp, inputs }. Answers are graded with Typed.grade
   (bank.js), so "15", "15%" and "0.15" read the same way as in typed-answer questions.
   Pure maths only: the sprint screen lives in app.js and is tested by scripts/test-sprint.mjs. */
(() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const fmt = v => v.toLocaleString("en-US", { maximumFractionDigits: 3 });
  const dps = v => { const s = String(+v.toFixed(6)); return s.includes(".") ? s.split(".")[1].length : 0; }; // decimal places needed
  // Up to 3 decimal places, and nothing that would need a calculator to state exactly.
  const clean = v => Number.isFinite(v) && Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6;

  const KINDS = {
    pctOf: {
      label: "Percentages",
      tip: "Split the percentage into easy pieces: 10% is the number ÷ 10, 5% is half of that, 1% is ÷ 100.\n15% of 240 = 10% (24) + 5% (12) = 36.\nOr swap the two numbers, since x% of y = y% of x: 8% of 50 = 50% of 8 = 4.",
      checks: [[0.15 * 240, 24 + 12], [24 + 12, 36], [0.08 * 50, 4], [0.5 * 8, 4]],
      make() {
        const p = pick([5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 60, 75]), base = rnd(1, 20) * 40;
        return { inputs: { p, base }, q: `What is ${fmt(p)}% of ${fmt(base)}?`, answer: p * base / 100 };
      }
    },
    pctChange: {
      label: "Percentage change",
      tip: "Find the gap first, then divide it by the starting number (never the end number).\n80 → 92: the gap is +12, and 12 ÷ 80 = 0.15, so +15%.\nKnow the common fractions: 1/8 = 12.5%, 1/5 = 20%, 1/4 = 25%, 2/5 = 40%.",
      checks: [[92 - 80, 12], [12 / 80, 0.15], [1 / 8, 0.125], [1 / 5, 0.2], [1 / 4, 0.25], [2 / 5, 0.4]],
      make() {
        const c = pick([-50, -40, -25, -20, -15, -12.5, -10, -5, 5, 10, 12.5, 15, 20, 25, 30, 40, 50]), a = rnd(1, 12) * 40, b = a * (1 + c / 100);
        return { inputs: { a, b }, q: `A figure goes from ${fmt(a)} to ${fmt(b)}. What is the percentage change? (Use − for a fall.)`, answer: c, unit: "%" };
      }
    },
    divide: {
      label: "Division",
      tip: "Simplify before you divide: halve both numbers, or divide both by the same factor, until it's easy.\n450 ÷ 12 → 225 ÷ 6 → 75 ÷ 2 = 37.5.\nShortcuts: ÷ 5 = × 2 then ÷ 10; ÷ 25 = × 4 then ÷ 100. So 375 ÷ 25 = 1,500 ÷ 100 = 15.",
      checks: [[450 / 12, 37.5], [225 / 6, 37.5], [75 / 2, 37.5], [375 / 25, 15], [375 * 4 / 100, 15]],
      make() {
        const d = pick([4, 5, 6, 8, 12, 15, 16, 20, 25]);
        let n, q;
        do { q = rnd(10, 160) / 2; n = q * d; } while (!Number.isInteger(n));
        return { inputs: { n, d }, q: `${fmt(n)} ÷ ${d} = ?`, answer: q };
      }
    },
    multiple: {
      label: "Multiples",
      tip: "Split the multiple into a whole number and a half (or a quarter), then add.\n8.5 × 120 = 8 × 120 + 0.5 × 120 = 960 + 60 = 1,020.\n12.5x is 100x ÷ 8: 12.5 × 240 = 24,000 ÷ 8 = 3,000.",
      checks: [[8.5 * 120, 1020], [8 * 120, 960], [0.5 * 120, 60], [12.5 * 240, 3000], [24000 / 8, 3000]],
      make() {
        const m = pick([6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 12.5, 14, 15]), e = rnd(2, 30) * 10;
        return { inputs: { m, e }, q: `A business with EBITDA of US$${fmt(e)}m is valued at ${fmt(m)}x EBITDA. What is it worth, in US$m?`, answer: m * e, unit: "US$m" };
      }
    },
    bps: {
      label: "Basis points",
      tip: "1bp = 0.01% = 1/10,000. So 1bp of US$100m is US$0.01m (US$10,000).\nWork out 1bp of the amount, then multiply: 1bp of US$200m = US$0.02m, so 35bp = 35 × 0.02 = US$0.7m.\n100bp = 1%, so 125bp of US$400m = 1.25% × 400 = US$5m.",
      checks: [[100 / 10000, 0.01], [200 / 10000, 0.02], [35 * 0.02, 0.7], [400 * 125 / 10000, 5]],
      make() {
        const bp = pick([5, 10, 15, 20, 25, 35, 40, 50, 75, 125, 150]), amt = pick([100, 200, 250, 400, 500, 800, 1000, 1500, 2000]);
        return { inputs: { bp, amt }, q: `What is ${bp}bp of US$${fmt(amt)}m, in US$m?`, answer: amt * bp / 10000, unit: "US$m" };
      }
    },
    doubling: {
      label: "Doubling time",
      tip: "Divide 72 by the annual rate in %: at 9% a year, money doubles in 72 ÷ 9 = 8 years.\nLearn the numbers that divide 72 exactly: 2, 3, 4, 6, 8, 9, 12, 18, 24, 36.\nIt works backwards too: to double in 6 years you need about 72 ÷ 6 = 12% a year.",
      checks: [[72 / 9, 8], [72 / 6, 12]],
      make() {
        const r = pick([3, 4, 6, 8, 9, 12, 18, 24]);
        // The rule of 72 is an approximation, so answers within half a year (or 3%) of 72 ÷ r count.
        return { inputs: { r }, q: `Using the rule of 72, roughly how many years does money take to double at ${r}% a year?`, answer: 72 / r, tolerance: Math.max(0.5, 0.03 * 72 / r) };
      }
    },
    yieldMultiple: {
      label: "Yields and multiples",
      tip: "A yield and a multiple are the same thing upside down: multiple = 100 ÷ yield in %, and yield = 100 ÷ multiple.\nLearn the pairs: 4% = 25x, 5% = 20x, 6.25% = 16x, 8% = 12.5x, 10% = 10x, 12.5% = 8x.",
      checks: [[100 / 4, 25], [100 / 5, 20], [100 / 6.25, 16], [100 / 8, 12.5], [100 / 10, 10], [100 / 12.5, 8]],
      make() {
        const y = pick([2, 2.5, 4, 5, 6.25, 8, 10, 12.5, 20]), m = 100 / y;
        return Math.random() < 0.5
          ? { inputs: { y }, q: `A property yields ${fmt(y)}%. What multiple of its income is it worth?`, answer: m, unit: "x" }
          : { inputs: { m }, q: `An asset is worth ${fmt(m)}x its income. What yield is that?`, answer: y, unit: "%" };
      }
    },
    compound: {
      label: "Compounding",
      tip: "Two years of growth at g multiplies by (1 + g)^2 = 1 + 2g + g^2: twice the growth, plus a small extra.\nLearn the four factors: 5% → × 1.1025, 10% → × 1.21, 20% → × 1.44, 50% → × 2.25.\n150 × 1.21 = 150 + 30 (20%) + 1.5 (1%) = 181.5.",
      checks: [[1.05 ** 2, 1.1025], [1.1 ** 2, 1.21], [1.2 ** 2, 1.44], [1.5 ** 2, 2.25], [150 * 1.21, 181.5], [150 + 30 + 1.5, 181.5]],
      make() {
        const base = pick([100, 120, 150, 200, 250, 400, 500]), g = pick([5, 10, 20, 50]);
        return { inputs: { base, g }, q: `${fmt(base)} grows by ${g}% a year for two years. What is it at the end?`, answer: base * (1 + g / 100) ** 2 };
      }
    }
  };

  function make(prevKind) {
    const kinds = Object.keys(KINDS).filter(k => k !== prevKind); // never the same kind twice in a row
    const kind = pick(kinds);
    let it;
    for (let t = 0; t < 50; t++) { it = KINDS[kind].make(); if (clean(it.answer) && it.answer !== 0) break; }
    const answer = +it.answer.toFixed(6), dp = dps(answer);
    return { kind, q: it.q, inputs: it.inputs, answer, unit: it.unit, dp,
      // Exact sums must be exact (a hair of slack for floating point); the rule of 72 sets its own.
      tolerance: it.tolerance ?? (dp ? 0.5 * 10 ** -dp : 0.001) };
  }

  const label = kind => KINDS[kind] ? KINDS[kind].label : kind;
  const tip = kind => KINDS[kind] ? KINDS[kind].tip : "";
  window.Sprint = { KINDS, make, label, tip, clean, MS: 120000 };
})();
