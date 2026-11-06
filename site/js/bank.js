window.Bank = {
  written: {},
  gens: {},
  add(cat, list) { (this.written[cat] ||= []).push(...list); },
  gen(cat, fn) { (this.gens[cat] ||= []).push(fn); }
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
  pct: (x, dp = 1) => (x * 100).toFixed(dp) + "%",
  spct: (x, dp = 1) => (x >= 0 ? "+" : "−") + Math.abs(x * 100).toFixed(dp) + "%",
  x: (v, dp = 1) => v.toFixed(dp) + "x",
  company: () => R.pick(["Northwind Logistics", "Halden Foods", "Corvo Industrial", "Brightwater Utilities", "Kestrel Software", "Alder Healthcare", "Marlow Packaging", "Tessera Retail", "Ostrava Chemicals", "Pembroke Media"]),
  bank: () => R.pick(["Harbour Bank", "Norland Bancorp", "Calder Savings Bank", "Westmere Bank", "Aster Financial"])
};
