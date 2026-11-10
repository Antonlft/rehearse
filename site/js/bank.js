window.Bank = {
  written: {},
  gens: {},
  numeric: {}, // typed-answer calculation questions, only used when "new formats" is switched on
  formats: {}, // written questions in new formats (e.g. ordering), only used when "new formats" is switched on
  add(cat, list) { (this.written[cat] ||= []).push(...list); },
  addFormat(cat, list) { (this.formats[cat] ||= []).push(...list); },
  gen(cat, fn) { (this.gens[cat] ||= []).push(fn); },
  /* One definition, two formats. spec = {
       make()      → inputs (all randomness happens here),
       solve(i)    → the right answer, as a plain number (e.g. 0.0842 for 8.42%),
       wrongs(i)   → three known wrong answers [{ value, note, trap }], in the same plain units,
       ask(i), why(i) → question and explanation text,
       fmt(v)      → how a value is shown as an option (e.g. R.pct(v, 2)),
       unit        → "%", "x" or "US$m": what a typed answer is measured in,
       tolerance   → how far a typed answer may be from the right one, in typed units (e.g. 0.05 = 0.05 percentage points),
       prompt      → how to type it, e.g. "to 2 decimal places", dp → decimal places for showing the answer, lv }
     The multiple-choice version is registered exactly where a plain Bank.gen would be, and is identical to one;
     the typed version goes into Bank.numeric. */
  calc(cat, spec) {
    const toUnit = v => spec.unit === "%" ? v * 100 : v;
    this.gen(cat, () => {
      const i = spec.make(), w = spec.wrongs(i);
      return { ...(spec.lv ? { lv: spec.lv } : {}), trap: w.map(x => x.trap || null),
        q: spec.ask(i), o: [spec.fmt(spec.solve(i)), ...w.map(x => spec.fmt(x.value))], why: spec.why(i), x: w.map(x => x.note) };
    });
    (this.numeric[cat] ||= []).push(() => {
      const i = spec.make();
      return { type: "numeric", ...(spec.lv ? { lv: spec.lv } : {}), unit: spec.unit, tolerance: spec.tolerance, ...(spec.dp != null ? { dp: spec.dp } : {}),
        q: `${spec.ask(i)} Type your answer${spec.prompt ? " " + spec.prompt : ""}.`, answer: toUnit(spec.solve(i)), why: spec.why(i),
        wrongs: spec.wrongs(i).map(x => ({ value: toUnit(x.value), note: x.note, trap: x.trap || null })) };
    });
  }
};

/* Typed answers: read what someone typed and grade it.
   Accepts spaces, thousands commas, a minus sign (− or -), fractions ("3/4"), "%", a trailing "x", and for money
   "US$", "$", "m", "bn", "k". Ambiguous bare numbers are read both ways and the closer reading counts:
   on a % question "0.125" and "12.5" both mean 12.5%; on a US$m question "1,200,000" and "1.2" both mean US$1.2m. */
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
    const n = /^(-?)(\d+\.?\d*|\.\d+)(?:\/(\d+\.?\d*|\.\d+))?$/.exec(s);
    if (!n) return [];
    let v = parseFloat(n[2]) / (n[3] ? parseFloat(n[3]) : 1);
    if (n[1]) v = -v;
    if (!Number.isFinite(v)) return [];
    if (unit === "%") return pct ? [v] : [v, v * 100];
    if (unit === "US$m") return scale !== null ? [v * scale] : [v, v / 1e6];
    return [v];
  },
  // { ok, value (the reading used), cause, trap, note } for a numeric question item.
  grade(item, raw) {
    const rs = this.readings(raw, item.unit);
    if (!rs.length) return { ok: false, value: null, cause: null, trap: null, note: null, unreadable: true };
    const value = rs.reduce((a, b) => Math.abs(b - item.answer) < Math.abs(a - item.answer) ? b : a);
    const off = Math.abs(value - item.answer), tol = item.tolerance + 1e-9;
    if (off <= tol) return { ok: true, value, cause: null, trap: null, note: null };
    // A known wrong answer (e.g. leaving out the tax shield) gives its explanation and mistake type.
    const known = (item.wrongs || []).find(w => Math.abs(value - w.value) <= tol);
    // Close but outside the tolerance = a calculation slip; further off = a concept gap.
    const cause = off <= 0.1 * Math.abs(item.answer) ? "calculation-slip" : "concept-gap";
    return { ok: false, value, cause, trap: known ? known.trap : null, note: known ? known.note : null };
  },
  // How a typed-units value is shown, e.g. 8.42 with unit "%" → "8.42%". dp rounds to that many decimal places.
  show(v, unit, dp) {
    const s = (dp != null ? v.toFixed(dp) : String(Number(v.toPrecision(10)))).replace("-", "−");
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
