window.Bank = {
  written: {},
  gens: {},
  add(cat, list) { (this.written[cat] ||= []).push(...list); },
  gen(cat, fn) { (this.gens[cat] ||= []).push(fn); }
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
