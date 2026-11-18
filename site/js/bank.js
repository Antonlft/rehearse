window.Bank = {
  written: {},
  gens: {},
  numeric: {}, // typed-answer calculation questions, only used when "new formats" is switched on
  formats: {}, // written questions in new formats (e.g. ordering), only used when "new formats" is switched on
  cases: {},   // multi-step case studies (linked typed steps), only used when "new formats" is switched on
  add(cat, list) { (this.written[cat] ||= []).push(...list); },
  addFormat(cat, list) { (this.formats[cat] ||= []).push(...list); },
  gen(cat, fn) { (this.gens[cat] ||= []).push(fn); },
  /* One definition, two formats. spec = {
       make()      → inputs (all randomness happens here),
       solve(i)    → the right answer, as a plain number (e.g. 0.0842 for 8.42%),
       wrongs(i)   → three known wrong answers [{ value, note, trap }], in the same plain units,
       ask(i), why(i) → question and explanation text,
       fmt(v)      → how a value is shown as an option (e.g. R.pct(v, 2)),
       unit        → "%", "x", "US$m", "US$" (plain amounts) or "years": what a typed answer is measured in,
       tolerance   → how far a typed answer may be from the right one, in typed units (e.g. 0.05 = 0.05 percentage points),
       prompt      → how to type it, e.g. "to 2 decimal places", dp → decimal places for showing the answer, lv,
       table(i)    → optional: a table shown under the question, { caption, corner, cols: [..], rows: [{ head, cells: [..] }], base: [row, col] } }
     The multiple-choice version is registered exactly where a plain Bank.gen would be, and is identical to one;
     the typed version goes into Bank.numeric. */
  calc(cat, spec) {
    const toUnit = v => spec.unit === "%" ? v * 100 : v;
    this.gen(cat, () => {
      const i = spec.make(), w = spec.wrongs(i);
      return { ...(spec.lv ? { lv: spec.lv } : {}), trap: w.map(x => x.trap || null),
        q: spec.ask(i), o: [spec.fmt(spec.solve(i)), ...w.map(x => spec.fmt(x.value))], why: spec.why(i), x: w.map(x => x.note), ...(spec.table ? { table: spec.table(i) } : {}) };
    });
    (this.numeric[cat] ||= []).push(() => {
      const i = spec.make();
      return { type: "numeric", ...(spec.lv ? { lv: spec.lv } : {}), unit: spec.unit, tolerance: spec.tolerance, ...(spec.dp != null ? { dp: spec.dp } : {}),
        q: `${spec.ask(i)} Type your answer${spec.prompt ? " " + spec.prompt : ""}.`, answer: toUnit(spec.solve(i)), why: spec.why(i),
        wrongs: spec.wrongs(i).map(x => ({ value: toUnit(x.value), note: x.note, trap: x.trap || null })), ...(spec.table ? { table: spec.table(i) } : {}) };
    });
  },
  /* Multi-step case study: a scenario and 3–8 linked typed steps, checked one at a time. spec = {
       lv, make() → inputs (all randomness here; round any figure a later step quotes, so it matches what's shown),
       intro(i) → the scenario,
       steps: [{ ask(i), solve(i), unit, dp, tolerance, prompt, why(i), wrongs?(i) → [{ value, note, trap }] }] }
     Later steps quote the right figures from earlier ones, so one slip doesn't spoil the rest. A known wrong answer
     is kept however close it is to the right one, so its explanation shows; only one within the tolerance is dropped
     (it would be graded right). */
  case(cat, spec) {
    (this.cases[cat] ||= []).push(() => {
      const i = spec.make();
      return { type: "case", ...(spec.lv ? { lv: spec.lv } : {}), q: spec.intro(i), why: spec.why ? spec.why(i) : "Each step builds on the right answer to the one before.",
        steps: spec.steps.map(s => {
          const toUnit = v => s.unit === "%" ? v * 100 : v, answer = toUnit(s.solve(i));
          return { q: s.ask(i) + (s.prompt ? ` Type your answer ${s.prompt}.` : ""), unit: s.unit, tolerance: s.tolerance, ...(s.dp != null ? { dp: s.dp } : {}),
            answer, why: s.why(i),
            wrongs: (s.wrongs ? s.wrongs(i) : []).map(x => ({ value: toUnit(x.value), note: x.note, trap: x.trap || null }))
              .filter(w => Math.abs(w.value - answer) > s.tolerance) };
        }) };
    });
  }
};

/* Typed answers: read what someone typed and grade it.
   Accepts spaces, thousands commas, a minus sign (− or -), fractions ("3/4"), "%", a trailing "x", for money
   "US$", "$", "m", "bn", "k", and for years a trailing "years" / "yrs" / "y". Units: "%", "x", "US$m" (millions),
   "US$" (plain amounts such as a price per share or per room) and "years". Ambiguous bare numbers are read both ways and the closer reading counts:
   on a % question "0.125" and "12.5" both mean 12.5%; on a US$m question "1,200,000" and "1.2" both mean US$1.2m.
   A bare US$m number is only also read as plain dollars when it's 10,000 or more: "38" always means US$38m. */
window.Typed = {
  // All sensible readings of the input, in the question's units. [] if it isn't a number at all.
  readings(raw, unit) {
    let s = String(raw ?? "").trim().toLowerCase().replace(/[\s,]/g, "").replace(/[−–]/g, "-");
    if (!s) return [];
    let pct = false, scale = null;
    s = s.replace(/^(-?)(us\$|usd|\$|£|€)/, "$1");
    if (s.endsWith("%")) { pct = true; s = s.slice(0, -1); }
    else if (s.endsWith("x")) s = s.slice(0, -1);
    else if (unit === "US$m") {
      const m = /(bn|b|mn|m|k)$/.exec(s);
      if (m) { scale = { bn: 1000, b: 1000, mn: 1, m: 1, k: 0.001 }[m[1]]; s = s.slice(0, -m[1].length); }
    }
    else if (unit === "US$") { // plain amounts: "350k" = 350,000; "1.2m" = 1,200,000
      const m = /(bn|b|mn|m|k)$/.exec(s);
      if (m) { scale = { bn: 1e9, b: 1e9, mn: 1e6, m: 1e6, k: 1e3 }[m[1]]; s = s.slice(0, -m[1].length); }
    }
    else if (unit === "years") s = s.replace(/(years|year|yrs|yr|y)$/, "");
    const n = /^(-?)(\d+\.?\d*|\.\d+)(?:\/(\d+\.?\d*|\.\d+))?$/.exec(s);
    if (!n) return [];
    let v = parseFloat(n[2]) / (n[3] ? parseFloat(n[3]) : 1);
    if (n[1]) v = -v;
    if (!Number.isFinite(v)) return [];
    if (unit === "%") return pct ? [v] : [v, v * 100];
    if (unit === "US$m") return scale !== null ? [v * scale] : Math.abs(v) >= 10000 ? [v, v / 1e6] : [v];
    if (unit === "US$") return scale !== null ? [v * scale] : [v];
    return [v];
  },
  /* { ok, value (the reading used), cause, trap, note, rel } for a numeric question item. rel is how far off the
     answer is, as a signed share of the right answer (0.11 = 11% above), or null when the right answer is 0. */
  grade(item, raw) {
    const rs = this.readings(raw, item.unit);
    if (!rs.length) return { ok: false, value: null, cause: null, trap: null, note: null, rel: null, unreadable: true };
    const tol = item.tolerance + 1e-9, closest = rs.reduce((a, b) => Math.abs(b - item.answer) < Math.abs(a - item.answer) ? b : a);
    if (Math.abs(closest - item.answer) <= tol) return { ok: true, value: closest, cause: null, trap: null, note: null, rel: null };
    // A known wrong answer (e.g. leaving out the tax shield) gives its explanation and mistake type, whichever reading matches it.
    let known = null, value = closest, hint = null;
    for (const r of rs) { const w = (item.wrongs || []).find(w => Math.abs(r - w.value) <= tol); if (w) { known = w; value = r; break; } }
    // No known mistake: try the common slips, on each reading in turn (as typed first), and keep the first that fits.
    if (!known) for (const r of rs) { const h = this.diagnose(item, r); if (h) { hint = h; value = r; break; } }
    const off = Math.abs(value - item.answer), rel = item.answer ? (value - item.answer) / Math.abs(item.answer) : null;
    // A known mistake is a method mistake however close it lands. A detected slip says which it is. Otherwise:
    // within 10% = a calculation slip; further off = a concept gap.
    const cause = known ? "concept-gap" : hint && hint.cause ? hint.cause : off <= 0.1 * Math.abs(item.answer) ? "calculation-slip" : "concept-gap";
    return { ok: false, value, cause, trap: known ? known.trap : hint ? hint.trap : null, note: known ? known.note : null, rel, ...(hint ? { hint } : {}) };
  },
  /* The mistake detective: when a wrong typed answer matches none of the question's known mistakes, look for a common
     slip that explains it. Returns { kind, trap, cause?, lead, text } or null. lead = the text already says how far off
     the answer is (so "X% above" isn't added in front). trap uses the TRAPS keys, so detected slips count on the
     Progress page like tagged ones. Checks run from the most to the least distinctive, and the first that fits wins. */
  diagnose(item, v) {
    const a = item.answer, tol = item.tolerance + 1e-9;
    if (!Number.isFinite(v) || !a || Math.abs(v - a) <= tol) return null;
    // Within 1% of c, or within the tolerance scaled to c's size (s), so a tiny or huge target isn't matched too loosely.
    const near = (x, c, s = 1) => Math.abs(x - c) <= Math.max(tol * s, 0.01 * Math.abs(c));
    // 1. Units: 10, 100, 1,000 or 1,000,000 times too big or too small.
    for (const k of [10, 100, 1000, 1e6]) for (const big of [true, false]) {
      if (!near(v, big ? a * k : a / k, big ? k : 1 / k)) continue;
      const times = k.toLocaleString("en-US");
      const why = k === 10 ? "It looks like the decimal point is in the wrong place."
        : item.unit === "%" ? "It looks like a units slip: check how you turned the decimal into a percentage (0.125 = 12.5%)."
        : item.unit === "US$m" ? "It looks like a units slip: check thousands, millions and billions (US$1,200,000 = US$1.2m)."
        : "It looks like a units slip or a misplaced decimal point.";
      return { kind: "units", trap: "units", lead: true, text: `Your answer is ${times} times too ${big ? "big" : "small"}. ${why}` };
    }
    // 2. The right size with the wrong sign.
    if (near(v, -a)) return { kind: "sign", trap: "sign", lead: true,
      text: "Your answer has the right size but the wrong sign. Check whether this figure is a cost or a gain, or which way round you subtracted." };
    // 3. A ratio upside down (multiples and percentages; not within 20% of 1x or 100%, where it can't be told apart from a small error).
    const share = item.unit === "%" ? 100 : item.unit === "x" ? 1 : null;
    if (share && Math.abs(a / share - 1) > 0.2 && Math.abs((v / share) * (a / share) - 1) <= 0.01) return { kind: "inverted", trap: "inverted", lead: true,
      text: "Your answer is the right one turned upside down (1 ÷ the right answer). Check which figure goes on top of the ratio." };
    // 4. Two neighbouring digits swapped, e.g. 32.42 for 34.22.
    const dp = item.dp ?? Math.min(4, (String(v).split(".")[1] || "").length), sa = Math.abs(a).toFixed(dp), sv = Math.abs(v).toFixed(dp);
    if (Math.sign(v) === Math.sign(a) && sa.length === sv.length && sa !== sv)
      for (let i = 0; i < sa.length - 1; i++) {
        if (sa[i] === "." || sa[i + 1] === "." || sa[i] === sa[i + 1]) continue;
        if (sa.slice(0, i) + sa[i + 1] + sa[i] + sa.slice(i + 2) === sv) return { kind: "swap", trap: null, cause: "calculation-slip", lead: true,
          text: `Your answer has the right digits, but two of them look swapped (${sv} instead of ${sa}). That's probably a typing slip.` };
      }
    // 5. A whole year out on a question counted in years.
    if (item.unit === "years" && Math.abs(Math.abs(v - a) - 1) < 1e-9) return { kind: "year", trap: null, lead: true,
      text: `Your answer is one year ${v > a ? "too late" : "too early"}. Check which year you counted from, and whether the year the target is reached counts.` };
    // 6. Very close (within 2%): most likely rounded too early.
    if (Math.abs(v - a) <= 0.02 * Math.abs(a)) return { kind: "rounding", trap: null, cause: "calculation-slip", lead: false,
      text: "That's very close, so it's probably rounding: keep full figures until the last step, then round." };
    return null;
  },
  // How a typed-units value is shown, e.g. 8.42 with unit "%" → "8.42%". dp rounds to that many decimal places.
  show(v, unit, dp) {
    const s = (dp != null ? v.toFixed(dp) : String(Number(v.toPrecision(10)))).replace("-", "−");
    if (unit === "US$") { const n = Number(dp != null ? v.toFixed(dp) : v.toPrecision(10)); return (n < 0 ? "−" : "") + "US$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dp ?? 0, maximumFractionDigits: dp ?? 6 }); }
    if (unit === "years") return s + (s === "1" ? " year" : " years");
    return unit === "%" ? s + "%" : unit === "x" ? s + "x" : unit === "US$m" ? "US$" + s + "m" : s;
  }
};

// Mistake types a wrong option can be tagged with (question field `trap`: one entry per wrong option, or null).
// The labels finish the sentence "Your most common slip is ...". Add new types here; never rename an existing key.
window.TRAPS = {
  "inverted": "flipping a ratio upside down or swapping two things",
  "missed-step": "leaving out a step or a component",
  "wrong-measure": "using a related but wrong measure or formula",
  "sign": "getting a sign or direction wrong",
  "units": "a units or scale slip",
  "double-count": "counting something twice",
  "concept": "misunderstanding the concept itself"
};

/* Lessons: one per category, in site/lessons/<category>.js. See README for the template.
   status: "stub" (not written yet) → "draft" → "reviewed". Draft and reviewed lessons need a method, an example and a source. */
window.Lessons = {
  all: {},
  // Method blocks: a lesson's method can mix plain paragraphs (strings) with typed blocks { kind, title?, text, note? }.
  // When a kind appears more than once in a lesson, each of those blocks needs a short title ("How it works · The fund").
  // Each kind has one label and one icon, the same in every lesson; only Formula and Watch out carry a colour.
  BLOCKS: { idea: "Key idea", how: "How it works", formula: "Formula", read: "How to read it", example: "Example", watch: "Watch out", practice: "In practice" },
  // Every section of a written lesson has an Example: a short worked case right under the rule it illustrates.
  // Blocks always appear in this order. A lesson that covers several topics splits into sections ({ section: "Title" }),
  // and each section follows the order on its own. Formulas can show fractions as {{numerator // denominator}}, and
  // any block can start a new line with "\n" (one point per line).
  ORDER: ["idea", "formula", "how", "read", "example", "watch", "practice"],
  add(cat, lesson) { this.all[cat] = lesson; }
};

window.R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  step(a, b, s) {
    const n = Math.round((b - a) / s);
    return +(a + s * Math.floor(Math.random() * (n + 1))).toFixed(6);
  },
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  num(n, dp) {
    if (dp === undefined) dp = Math.abs(n - Math.round(n)) < 1e-9 ? 0 : 1;
    return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  },
  m: (n, dp) => "US$" + R.num(n, dp) + "m",
  usd: (n, dp) => "US$" + R.num(n, dp) + "m",
  usd2: v => "US$" + R.num(v, 2),
  usd0: v => "US$" + R.num(Math.round(v), 0),
  pct: (x, dp = 1) => (x * 100).toFixed(dp) + "%",
  spct: (x, dp = 1) => (x >= 0 ? "+" : "−") + Math.abs(x * 100).toFixed(dp) + "%",
  x: (v, dp = 1) => v.toFixed(dp) + "x",
  company: () => R.pick(["Northwind Logistics", "Halden Foods", "Corvo Industrial", "Brightwater Utilities", "Kestrel Software", "Alder Healthcare", "Marlow Packaging", "Tessera Retail", "Ostrava Chemicals", "Pembroke Media"]),
  bank: () => R.pick(["Harbour Bank", "Norland Bancorp", "Calder Savings Bank", "Westmere Bank", "Aster Financial"])
};
