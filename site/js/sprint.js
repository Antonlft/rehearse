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
      make() {
        const p = pick([5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 60, 75]), base = rnd(1, 20) * 40;
        return { inputs: { p, base }, q: `What is ${fmt(p)}% of ${fmt(base)}?`, answer: p * base / 100 };
      }
    },
    pctChange: {
      label: "Percentage change",
      make() {
        const c = pick([-50, -40, -25, -20, -15, -12.5, -10, -5, 5, 10, 12.5, 15, 20, 25, 30, 40, 50]), a = rnd(1, 12) * 40, b = a * (1 + c / 100);
        return { inputs: { a, b }, q: `A figure goes from ${fmt(a)} to ${fmt(b)}. What is the percentage change? (Use − for a fall.)`, answer: c, unit: "%" };
      }
    },
    divide: {
      label: "Division",
      make() {
        const d = pick([4, 5, 6, 8, 12, 15, 16, 20, 25]);
        let n, q;
        do { q = rnd(10, 160) / 2; n = q * d; } while (!Number.isInteger(n));
        return { inputs: { n, d }, q: `${fmt(n)} ÷ ${d} = ?`, answer: q };
      }
    },
    multiple: {
      label: "Multiples",
      make() {
        const m = pick([6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 12.5, 14, 15]), e = rnd(2, 30) * 10;
        return { inputs: { m, e }, q: `A business with EBITDA of US$${fmt(e)}m is valued at ${fmt(m)}x EBITDA. What is it worth, in US$m?`, answer: m * e, unit: "US$m" };
      }
    },
    bps: {
      label: "Basis points",
      make() {
        const bp = pick([5, 10, 15, 20, 25, 35, 40, 50, 75, 125, 150]), amt = pick([100, 200, 250, 400, 500, 800, 1000, 1500, 2000]);
        return { inputs: { bp, amt }, q: `What is ${bp}bp of US$${fmt(amt)}m, in US$m?`, answer: amt * bp / 10000, unit: "US$m" };
      }
    },
    doubling: {
      label: "Doubling time",
      make() {
        const r = pick([3, 4, 6, 8, 9, 12, 18, 24]);
        // The rule of 72 is an approximation, so answers within half a year (or 3%) of 72 ÷ r count.
        return { inputs: { r }, q: `Using the rule of 72, roughly how many years does money take to double at ${r}% a year?`, answer: 72 / r, tolerance: Math.max(0.5, 0.03 * 72 / r) };
      }
    },
    yieldMultiple: {
      label: "Yields and multiples",
      make() {
        const y = pick([2, 2.5, 4, 5, 6.25, 8, 10, 12.5, 20]), m = 100 / y;
        return Math.random() < 0.5
          ? { inputs: { y }, q: `A property yields ${fmt(y)}%. What multiple of its income is it worth?`, answer: m, unit: "x" }
          : { inputs: { m }, q: `An asset is worth ${fmt(m)}x its income. What yield is that?`, answer: y, unit: "%" };
      }
    },
    compound: {
      label: "Compounding",
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
  window.Sprint = { KINDS, make, label, clean, MS: 120000 };
})();
