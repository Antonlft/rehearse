/* Interactive lesson widgets ("Try it" on each Learn page).
   Each widget = { title, inputs: [{ k, label, min, max, step, value, fmt }], compute(v) → results, render(v, r) → HTML }.
   compute() is pure maths (tested in scripts/test-widgets.mjs); render() draws numbers and a small SVG chart.
   Widgets.mount(el, type, values) builds the sliders and redraws on every change. No libraries. */
(() => {
  const registry = {};
  const define = (name, spec) => { registry[name] = spec; };
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Formatting */
  const num = (v, dp = 1) => (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const usd = (v, dp = 0) => (v < 0 ? "−" : "") + "US$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp }) + "m";
  const usd0 = v => "US$" + Math.round(v).toLocaleString("en-US");
  const pct = (v, dp = 1) => num(v * 100, dp) + "%";
  const mult = (v, dp = 1) => num(v, dp) + "x";
  const F = { num, usd, usd0, pct, mult };

  /* Charts (inline SVG, colours from the site's tokens) */
  // Horizontal bars: items [{ label, value, cls, text }]. Values may be negative.
  function bars(items, { max } = {}) {
    // Label column 0–112, bars up to 120 wide, then room for the value text, so nothing is cut off on a phone.
    const m = max || Math.max(...items.map(i => Math.abs(i.value)), 1e-9), W = 340, row = 30, H = items.length * row;
    return `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escH(items.map(i => `${i.label}: ${i.text}`).join("; "))}">
      ${items.map((it, k) => { const w = Math.max(1, Math.abs(it.value) / m * 120), y = k * row;
        return `<text x="0" y="${y + 19}" class="w-lbl">${escH(it.label)}</text>
          <rect x="120" y="${y + 7}" width="${w}" height="16" rx="2" class="w-bar ${it.cls || ""}"/>
          <text x="${126 + w}" y="${y + 19}" class="w-val">${escH(it.text)}</text>`; }).join("")}
    </svg>`;
  }
  // Waterfall: steps [{ label, value, kind: "total" | "up" | "down" }], running from left to right.
  function waterfall(steps) {
    const W = 330, H = 170, top = 14, bottom = 136, n = steps.length, bw = Math.min(46, (W - 10) / n - 8);
    let run = 0; const cols = steps.map(s => {
      if (s.kind === "total") { const c = { ...s, from: 0, to: s.value }; run = s.value; return c; }
      const from = run; run += s.kind === "down" ? -Math.abs(s.value) : Math.abs(s.value); return { ...s, from, to: run };
    });
    const hi = Math.max(...cols.map(c => Math.max(c.from, c.to)), 1e-9), lo = Math.min(0, ...cols.map(c => Math.min(c.from, c.to)));
    const y = v => bottom - (v - lo) / (hi - lo) * (bottom - top);
    return `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escH(steps.map(s => `${s.label} ${s.text}`).join(", "))}">
      <line x1="0" x2="${W}" y1="${y(0)}" y2="${y(0)}" class="w-axis"/>
      ${cols.map((c, k) => { const x = 6 + k * (W - 10) / n, y1 = y(Math.max(c.from, c.to)), h = Math.max(1, Math.abs(y(c.from) - y(c.to)));
        return `<rect x="${x}" y="${y1}" width="${bw}" height="${h}" rx="2" class="w-bar ${c.kind === "total" ? "total" : c.kind === "down" ? "neg" : "pos"}"/>
          <text x="${x + bw / 2}" y="${y1 - 4}" text-anchor="middle" class="w-val">${escH(c.text)}</text>
          <text x="${x + bw / 2}" y="${H - 18}" text-anchor="middle" class="w-lbl">${escH(c.label)}</text>
          ${c.sub ? `<text x="${x + bw / 2}" y="${H - 5}" text-anchor="middle" class="w-lbl">${escH(c.sub)}</text>` : ""}`; }).join("")}
    </svg>`;
  }
  // Line chart of f(x) over [x0, x1] with a marker at mx. Labels via fx/fy.
  function line(f, x0, x1, mx, { fx = v => v, fy = v => v, ref, yLabel = "", xLabel = "" } = {}) {
    const W = 340, H = 170, L = 54, R = 10, T = 12, B = 30, N = 60;
    const pts = Array.from({ length: N + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / N; return [x, f(x)]; }).filter(p => Number.isFinite(p[1]));
    const ys = pts.map(p => p[1]).concat(ref != null ? [ref] : []), y0 = Math.min(0, ...ys), y1 = Math.max(...ys) * 1.05 || 1;
    const X = x => L + (x - x0) / (x1 - x0) * (W - L - R), Y = v => H - B - (v - y0) / (y1 - y0) * (H - T - B);
    const my = f(mx);
    return `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escH(`${yLabel} against ${xLabel}; at ${fx(mx)}: ${fy(my)}`)}">
      <line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" class="w-axis"/><line x1="${L}" x2="${L}" y1="${T}" y2="${H - B}" class="w-axis"/>
      ${ref != null ? `<line x1="${L}" x2="${W - R}" y1="${Y(ref)}" y2="${Y(ref)}" class="w-ref"/>` : ""}
      <polyline points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ")}" class="w-line"/>
      ${Number.isFinite(my) ? `<circle cx="${X(mx)}" cy="${Y(my)}" r="4.5" class="w-dot"/>` : ""}
      <text x="${L}" y="${H - 8}" class="w-lbl">${escH(fx(x0))}</text><text x="${W - R}" y="${H - 8}" text-anchor="end" class="w-lbl">${escH(fx(x1))}</text>
      <text x="${(L + W - R) / 2}" y="${H - 8}" text-anchor="middle" class="w-lbl">${escH(xLabel)}</text>
      <text x="${L - 4}" y="${T + 8}" text-anchor="end" class="w-lbl">${escH(fy(y1))}</text><text x="${L - 4}" y="${H - B}" text-anchor="end" class="w-lbl">${escH(fy(y0))}</text>
    </svg>`;
  }
  const stat = (label, value, big) => `<div class="w-stat${big ? " big" : ""}"><span>${escH(label)}</span><b>${escH(value)}</b></div>`;
  const stats = list => `<div class="w-stats">${list.join("")}</div>`;
  const note = t => `<p class="w-note">${escH(t)}</p>`;

  /* ---------- The widgets (one or more per lesson) ---------- */

  define("evBridge", {
    title: "From enterprise value to equity value",
    inputs: [
      { k: "ev", label: "Enterprise value", min: 200, max: 3000, step: 50, value: 1200, fmt: usd },
      { k: "debt", label: "Gross debt", min: 0, max: 1500, step: 25, value: 400, fmt: usd },
      { k: "cash", label: "Cash", min: 0, max: 600, step: 10, value: 100, fmt: usd },
      { k: "nci", label: "Non-controlling interests", min: 0, max: 300, step: 10, value: 50, fmt: usd },
      { k: "pref", label: "Preferred shares", min: 0, max: 300, step: 10, value: 0, fmt: usd }
    ],
    compute: v => ({ netDebt: v.debt - v.cash, equity: v.ev - v.debt + v.cash - v.nci - v.pref }),
    render: (v, r) => stats([stat("Net debt", usd(r.netDebt)), stat("Equity value", usd(r.equity), true)]) +
      waterfall([{ label: "EV", value: v.ev, kind: "total", text: num(v.ev, 0) }, { label: "Debt", value: v.debt, kind: "down", text: "−" + num(v.debt, 0) },
        { label: "Cash", value: v.cash, kind: "up", text: "+" + num(v.cash, 0) }, { label: "NCI", value: v.nci, kind: "down", text: "−" + num(v.nci, 0) },
        { label: "Pref", value: v.pref, kind: "down", text: "−" + num(v.pref, 0) }, { label: "Equity", value: r.equity, kind: "total", text: num(r.equity, 0) }]) +
      note("Chart in US$ millions.") +
      (r.equity < 0 ? note("Equity value is negative: the claims ahead of shareholders exceed what the business is worth.") : "")
  });

  define("dilutedShares", {
    title: "Diluted shares: the treasury stock method",
    inputs: [
      { k: "price", label: "Share price", min: 5, max: 100, step: 1, value: 40, fmt: v => "US$" + num(v, 0) },
      { k: "strike", label: "Exercise price", min: 5, max: 100, step: 1, value: 25, fmt: v => "US$" + num(v, 0) },
      { k: "opts", label: "Options (millions)", min: 0, max: 30, step: 0.5, value: 10, fmt: v => num(v, 1) + "m" },
      { k: "basic", label: "Basic shares (millions)", min: 50, max: 500, step: 10, value: 200, fmt: v => num(v, 0) + "m" }
    ],
    compute: v => {
      const itm = v.price > v.strike, exercised = itm ? v.opts : 0, proceeds = exercised * v.strike, buyback = proceeds / v.price;
      const net = exercised - buyback;
      return { itm, exercised, proceeds, buyback, net, diluted: v.basic + net, dilution: net / v.basic };
    },
    render: (v, r) => stats([stat("Diluted shares", num(r.diluted, 2) + "m", true), stat("Net new shares", num(r.net, 2) + "m"), stat("Dilution", pct(r.dilution, 1))]) +
      bars([{ label: "Exercised", value: r.exercised, cls: "pos", text: (r.exercised ? "+" : "") + num(r.exercised, 2) + "m" },
        { label: "Bought back", value: r.buyback, cls: "neg", text: (r.buyback ? "−" : "") + num(r.buyback, 2) + "m" },
        { label: "Net new", value: r.net, cls: "total", text: (r.net ? "+" : "") + num(r.net, 2) + "m" }], { max: Math.max(v.opts, 1e-9) }) +
      note(!v.opts ? "No options outstanding, so there's nothing to dilute: diluted shares equal basic shares."
        : !r.itm ? "The exercise price is at or above the share price: nobody would exercise, so the options add nothing."
        : `Exercise brings in ${usd(r.proceeds, 1)}, which buys back ${num(r.buyback, 2)}m shares at US$${num(v.price, 0)}. The higher the share price, the fewer shares that buys back, so dilution grows.`)
  });

  define("wacc", {
    title: "Build a WACC",
    inputs: [
      { k: "we", label: "Equity weight (E/V)", min: 0.2, max: 1, step: 0.05, value: 0.7, fmt: v => pct(v, 0) },
      { k: "ke", label: "Cost of equity", min: 0.05, max: 0.16, step: 0.0025, value: 0.10, fmt: v => pct(v, 2) },
      { k: "kd", label: "Pre-tax cost of debt", min: 0.02, max: 0.10, step: 0.0025, value: 0.06, fmt: v => pct(v, 2) },
      { k: "t", label: "Tax rate", min: 0, max: 0.35, step: 0.01, value: 0.25, fmt: v => pct(v, 0) }
    ],
    compute: v => { const eq = v.we * v.ke, debt = (1 - v.we) * v.kd * (1 - v.t), shield = (1 - v.we) * v.kd * v.t; return { eq, debt, shield, wacc: eq + debt }; },
    render: (v, r) => stats([stat("WACC", pct(r.wacc, 2), true), stat("Tax shield saves", pct(r.shield, 2))]) +
      bars([{ label: "Equity part", value: r.eq, cls: "pos", text: pct(r.eq, 2) }, { label: "Debt (after tax)", value: r.debt, cls: "total", text: pct(r.debt, 2) },
        { label: "Tax shield", value: r.shield, cls: "neg", text: "−" + pct(r.shield, 2) }])
  });

  define("compound", {
    title: "Compounding and the rule of 72",
    inputs: [
      { k: "r", label: "Annual growth rate", min: 0.01, max: 0.25, step: 0.0005, value: 0.08, fmt: v => pct(v, 2) },
      { k: "n", label: "Years", min: 1, max: 30, step: 1, value: 10, fmt: v => num(v, 0) }
    ],
    compute: v => ({ multiple: (1 + v.r) ** v.n, rule72: 0.72 / v.r, exact: Math.log(2) / Math.log(1 + v.r), simple: 1 + v.r * v.n }),
    render: (v, r) => stats([stat(`Growth over ${v.n} years`, mult(r.multiple, 2), true), stat("Simple interest would give", mult(r.simple, 2)),
        stat("Doubling: rule of 72", num(r.rule72, 1) + " yrs"), stat("Doubling: exact", num(r.exact, 1) + " yrs")]) +
      line(x => (1 + v.r) ** x, 0, v.n, v.n, { fx: x => num(x, 0) + "y", fy: y => mult(y, 1), ref: 2, xLabel: "years", yLabel: "value multiple" }) +
      note("The dashed line is 2.0x: where the curve crosses it is the doubling time.")
  });

  define("lboReturns", {
    title: "Where LBO returns come from",
    inputs: [
      { k: "e0", label: "Entry EBITDA", min: 20, max: 300, step: 5, value: 100, fmt: usd },
      { k: "m0", label: "Entry multiple", min: 5, max: 15, step: 0.5, value: 10, fmt: v => mult(v) },
      { k: "lev", label: "Debt at entry (x EBITDA)", min: 0, max: 7, step: 0.5, value: 5, fmt: v => mult(v) },
      { k: "g", label: "EBITDA growth a year", min: -0.05, max: 0.15, step: 0.0001, value: 0.05, fmt: v => pct(v, 1) },
      { k: "m1", label: "Exit multiple", min: 5, max: 15, step: 0.5, value: 10, fmt: v => mult(v) },
      { k: "repay", label: "Debt repaid by exit", min: 0, max: 1, step: 0.05, value: 0.4, fmt: v => pct(v, 0) },
      { k: "n", label: "Years held", min: 2, max: 8, step: 1, value: 5, fmt: v => num(v, 0) }
    ],
    compute: v => {
      const ev0 = v.e0 * v.m0, debt0 = v.e0 * v.lev, eq0 = ev0 - debt0, e1 = v.e0 * (1 + v.g) ** v.n, ev1 = e1 * v.m1, debt1 = debt0 * (1 - v.repay), eq1 = ev1 - debt1;
      const moic = eq0 > 0 ? eq1 / eq0 : NaN, irr = moic > 0 ? moic ** (1 / v.n) - 1 : NaN;
      return { ev0, debt0, eq0, e1, ev1, debt1, eq1, moic, irr, growth: (e1 - v.e0) * v.m0, multiple: (v.m1 - v.m0) * e1, paydown: debt0 - debt1 };
    },
    render: (v, r) => (r.eq0 <= 0 ? note("Debt is at least the purchase price, so there's no equity cheque: lower the leverage.") :
      stats([stat("Equity in", usd(r.eq0)), stat("Equity out", usd(r.eq1)), stat("MOIC", Number.isFinite(r.moic) ? mult(r.moic, 2) : "–", true), stat("IRR", Number.isFinite(r.irr) ? pct(r.irr) : "–", true)]) +
      bars([{ label: "EBITDA growth", value: r.growth, cls: r.growth < 0 ? "neg" : "pos", text: usd(r.growth) },
        { label: "Multiple change", value: r.multiple, cls: r.multiple < 0 ? "neg" : "pos", text: usd(r.multiple) },
        { label: "Debt paydown", value: r.paydown, cls: "total", text: usd(r.paydown) }]) +
      note("The three bars add up to the equity gain: equity out minus equity in."))
  });

  define("recovery", {
    title: "Who recovers what in a restructuring",
    inputs: [
      { k: "ev", label: "Enterprise value", min: 0, max: 1200, step: 10, value: 550, fmt: usd },
      { k: "sec", label: "Senior secured claims", min: 0, max: 600, step: 25, value: 300, fmt: usd },
      { k: "uns", label: "Senior unsecured claims", min: 0, max: 600, step: 25, value: 400, fmt: usd },
      { k: "sub", label: "Subordinated claims", min: 0, max: 400, step: 25, value: 200, fmt: usd }
    ],
    compute: v => {
      let left = v.ev; const out = {};
      for (const [k, claim] of [["sec", v.sec], ["uns", v.uns], ["sub", v.sub]]) { const paid = Math.min(claim, Math.max(0, left)); left -= paid; out[k] = claim ? paid / claim : 1; }
      const equity = Math.max(0, left), order = ["sec", "uns", "sub"];
      const fulcrum = order.find(k => out[k] < 1 && (v[k] > 0)) || null;
      return { ...out, equity, fulcrum };
    },
    render: (v, r) => {
      const names = { sec: "Senior secured", uns: "Senior unsecured", sub: "Subordinated" };
      return stats([stat("Fulcrum security", r.fulcrum ? names[r.fulcrum] : "None: all debt is covered", true), stat("Left for shareholders", usd(r.equity))]) +
        bars(["sec", "uns", "sub"].map(k => ({ label: names[k], value: r[k], cls: k === r.fulcrum ? "neg" : r[k] >= 1 ? "pos" : "", text: pct(r[k], 0) })), { max: 1 }) +
        note("Value flows down in order of priority. The fulcrum is the first class only partly repaid: it usually ends up owning the business.");
    }
  });

  define("depreciation", {
    title: "Depreciation through the three statements",
    inputs: [
      { k: "d", label: "Extra depreciation", min: 0, max: 100, step: 5, value: 10, fmt: v => "US$" + num(v, 0) },
      { k: "t", label: "Tax rate", min: 0, max: 0.4, step: 0.01, value: 0.25, fmt: v => pct(v, 0) }
    ],
    compute: v => ({ ni: -v.d * (1 - v.t), cash: v.d * v.t, ppe: -v.d, equity: -v.d * (1 - v.t) }),
    render: (v, r) => {
      const d = x => (x >= 0 ? "+" : "−") + "US$" + num(Math.abs(x), 1);
      return `<div class="w-3s">
        <div><p>Income statement</p><span>Depreciation ${d(-v.d)}</span><span>Tax ${d(v.d * v.t)}</span><b>Net income ${d(r.ni)}</b></div>
        <div><p>Cash flow statement</p><span>Net income ${d(r.ni)}</span><span>Add back depreciation ${d(v.d)}</span><b>Cash ${d(r.cash)}</b></div>
        <div><p>Balance sheet</p><span>Cash ${d(r.cash)}</span><span>PP&amp;E ${d(r.ppe)}</span><b>Equity ${d(r.equity)}</b></div>
      </div>` + note("Assets change by cash minus PP&E, which equals the change in equity, so the balance sheet still balances. Cash rises only because tax falls.");
    }
  });

  const bondPriceAt = (c, n, y) => { let p = 0; for (let t = 1; t <= n; t++) p += c * 100 / (1 + y) ** t; return p + 100 / (1 + y) ** n; };
  define("bondPrice", {
    title: "Bond price against yield",
    inputs: [
      { k: "c", label: "Annual coupon", min: 0, max: 0.12, step: 0.0025, value: 0.05, fmt: v => pct(v, 2) },
      { k: "n", label: "Years to maturity", min: 1, max: 30, step: 1, value: 10, fmt: v => num(v, 0) },
      { k: "y", label: "Market yield", min: 0.005, max: 0.15, step: 0.0025, value: 0.06, fmt: v => pct(v, 2) }
    ],
    compute: v => {
      const p = bondPriceAt(v.c, v.n, v.y), up = bondPriceAt(v.c, v.n, v.y + 0.0001), dn = bondPriceAt(v.c, v.n, v.y - 0.0001);
      return { price: p, modDur: (dn - up) / (2 * p * 0.0001) };
    },
    render: (v, r) => stats([stat("Price per 100", num(r.price, 2), true), stat(r.price > 100.005 ? "Above par" : r.price < 99.995 ? "Below par" : "At par", v.y > v.c ? "yield > coupon" : v.y < v.c ? "yield < coupon" : "yield = coupon"),
        stat("Modified duration", num(r.modDur, 1) + " yrs"), stat("Price change for +100bp", "≈ −" + num(r.modDur, 1) + "%")]) +
      line(y => bondPriceAt(v.c, v.n, y), 0.005, 0.15, v.y, { fx: y => pct(y, 0), fy: p => num(p, 0), ref: 100, xLabel: "yield", yLabel: "price" }) +
      note("Price falls as yield rises, and the curve bends (convexity): longer maturities make it steeper.")
  });

  define("ptbv", {
    title: "What a bank's P/TBV says about its returns",
    inputs: [
      { k: "rote", label: "Return on tangible equity", min: 0, max: 0.25, step: 0.005, value: 0.14, fmt: v => pct(v, 1) },
      { k: "coe", label: "Cost of equity", min: 0.06, max: 0.16, step: 0.005, value: 0.11, fmt: v => pct(v, 1) },
      { k: "g", label: "Long-run growth", min: 0, max: 0.05, step: 0.005, value: 0.03, fmt: v => pct(v, 1) }
    ],
    compute: v => ({ ptbv: (v.rote - v.g) / (v.coe - v.g) }),
    render: (v, r) => stats([stat("Justified P/TBV", mult(r.ptbv, 2), true), stat("Reading", v.rote > v.coe ? "Earns above its cost of equity: above 1.0x" : v.rote < v.coe ? "Earns below its cost of equity: below 1.0x" : "Earns exactly its cost of equity: 1.0x")]) +
      line(x => (x - v.g) / (v.coe - v.g), 0, 0.25, v.rote, { fx: x => pct(x, 0), fy: y => mult(y, 1), ref: 1, xLabel: "ROTE", yLabel: "P/TBV" }) +
      note("P/TBV = (ROTE − g) ÷ (cost of equity − g). The dashed line is 1.0x, reached where ROTE equals the cost of equity.")
  });

  define("terp", {
    title: "Rights issue: the theoretical ex-rights price",
    inputs: [
      { k: "p", label: "Share price before", min: 1, max: 50, step: 0.5, value: 10, fmt: v => "US$" + num(v, 2) },
      { k: "k", label: "Existing shares per new share", min: 1, max: 10, step: 1, value: 4, fmt: v => num(v, 0) },
      { k: "s", label: "Subscription price", min: 0.5, max: 50, step: 0.5, value: 7, fmt: v => "US$" + num(v, 2) }
    ],
    compute: v => { const terp = (v.k * v.p + v.s) / (v.k + 1); return { terp, right: terp - v.s, discount: v.s / terp - 1 }; },
    render: (v, r) => stats([stat("TERP", "US$" + num(r.terp, 2), true), stat("Value of one right (nil-paid)", "US$" + num(r.right, 2)), stat("Discount to TERP", pct(r.discount, 1))]) +
      bars([{ label: "Price before", value: v.p, cls: "pos", text: "US$" + num(v.p, 2) }, { label: "TERP", value: r.terp, cls: "total", text: "US$" + num(r.terp, 2) }, { label: "Subscription", value: v.s, cls: "neg", text: "US$" + num(v.s, 2) }]) +
      note(v.s > v.p ? "A subscription price above the market price: nobody would take up the rights." : "Shareholders who take up their rights, or sell them, lose nothing: the drop to TERP is offset by the right's value.")
  });

  define("yieldCurve", {
    title: "Shapes of the yield curve",
    inputs: [
      { k: "s", label: "3-month yield", min: 0, max: 0.08, step: 0.0005, value: 0.02, fmt: v => pct(v, 2) },
      { k: "l", label: "10-year yield", min: 0, max: 0.08, step: 0.0005, value: 0.04, fmt: v => pct(v, 2) }
    ],
    compute: v => { const spread = v.l - v.s; return { spread, shape: spread > 0.0025 ? "normal" : spread < -0.0025 ? "inverted" : "flat" }; },
    render: (v, r) => {
      const curve = t => v.s + (v.l - v.s) * (1 - Math.exp(-t / 2.5)) / (1 - Math.exp(-10 / 2.5));
      const read = { normal: "Normal (upward sloping): investors expect growth and want more to lend for longer.", flat: "Flat: markets expect little change; often a transition between phases of the cycle.", inverted: "Inverted: short rates above long rates, usually because markets expect rate cuts. Historically a recession warning." };
      return stats([stat("10y − 3m spread", (r.spread >= 0 ? "+" : "−") + Math.round(Math.abs(r.spread) * 10000) + "bp", true), stat("Shape", r.shape)]) +
        line(curve, 0.25, 10, 10, { fx: t => num(t, 0) + "y", fy: y => pct(y, 1), xLabel: "maturity", yLabel: "yield" }) + note(read[r.shape]);
    }
  });

  define("accretion", {
    title: "Will the deal add to earnings per share?",
    inputs: [
      { k: "acqPE", label: "Acquirer's P/E", min: 5, max: 40, step: 0.5, value: 20, fmt: v => mult(v) },
      { k: "tgtPE", label: "P/E paid for the target", min: 5, max: 40, step: 0.5, value: 15, fmt: v => mult(v) },
      { k: "stock", label: "Paid in shares", min: 0, max: 1, step: 0.05, value: 1, fmt: v => pct(v, 0) },
      { k: "kd", label: "After-tax cost of debt (cash part)", min: 0, max: 0.1, step: 0.0025, value: 0.04, fmt: v => pct(v, 2) }
    ],
    compute: v => { const gained = 1 / v.tgtPE, cost = v.stock / v.acqPE + (1 - v.stock) * v.kd; return { gained, cost, accretive: gained > cost, margin: gained - cost }; },
    render: (v, r) => stats([stat("Verdict", r.accretive ? "Accretive" : Math.abs(r.margin) < 1e-9 ? "Neutral" : "Dilutive", true), stat("Per US$100 paid: earnings gained", "US$" + num(r.gained * 100, 2)), stat("Per US$100 paid: cost", "US$" + num(r.cost * 100, 2))]) +
      bars([{ label: "Earnings bought", value: r.gained, cls: "pos", text: pct(r.gained, 2) }, { label: "Cost of paying", value: r.cost, cls: "neg", text: pct(r.cost, 2) }]) +
      note("Shares cost the acquirer's earnings yield (1 ÷ its P/E); cash or debt cost the after-tax interest. The deal adds to EPS if the target's earnings yield is higher.")
  });

  define("goodwill", {
    title: "Purchase price allocation: what's left is goodwill",
    inputs: [
      { k: "price", label: "Price paid for 100%", min: 100, max: 2000, step: 10, value: 700, fmt: usd },
      { k: "book", label: "Book net assets", min: 0, max: 1500, step: 10, value: 370, fmt: usd },
      { k: "writeUp", label: "Write-ups to fair value", min: 0, max: 600, step: 10, value: 120, fmt: usd },
      { k: "t", label: "Tax rate", min: 0, max: 0.4, step: 0.01, value: 0.25, fmt: v => pct(v, 0) }
    ],
    compute: v => { const dtl = v.writeUp * v.t, fv = v.book + v.writeUp - dtl, goodwill = v.price - fv; return { dtl, fv, goodwill, bargain: goodwill < 0 }; },
    render: (v, r) => stats([r.bargain ? stat("Bargain purchase gain", usd(-r.goodwill, 1), true) : stat("Goodwill", usd(r.goodwill, 1), true), stat("Net assets at fair value", usd(r.fv, 1)), stat("Deferred tax on write-ups", usd(r.dtl, 1))]) +
      waterfall([{ label: "Book", sub: "value", value: v.book, kind: "total", text: num(v.book, 0) },
        { label: "Write-", sub: "ups", value: v.writeUp, kind: "up", text: "+" + num(v.writeUp, 0) },
        { label: "DTL", value: r.dtl, kind: "down", text: "−" + num(r.dtl, 0) },
        { label: "Fair", sub: "value", value: r.fv, kind: "total", text: num(r.fv, 0) },
        { label: "Good-", sub: "will", value: Math.abs(r.goodwill), kind: r.bargain ? "down" : "up", text: (r.bargain ? "−" : "+") + num(Math.abs(r.goodwill), 0) },
        { label: "Price", value: v.price, kind: "total", text: num(v.price, 0) }]) +
      note("Chart in US$ millions, rounded. The write-ups create a deferred tax liability (DTL) because their tax base doesn't change, as in most share deals.") +
      (r.bargain ? note("The price is below the fair value of the net assets: after rechecking the values, IFRS 3 books the difference as a bargain purchase gain in profit.") : "")
  });

  define("montyHall", {
    title: "Monty Hall: switch or stay?",
    inputs: [{ k: "games", label: "Games to simulate", min: 10, max: 5000, step: 10, value: 1000, fmt: v => num(v, 0) }],
    compute: () => ({ stay: 1 / 3, switch: 2 / 3 }),
    simulate(n, rnd = Math.random) {
      let stay = 0, sw = 0;
      for (let i = 0; i < n; i++) { const car = Math.floor(rnd() * 3), pick = Math.floor(rnd() * 3); if (pick === car) stay++; else sw++; }
      return { stay, switch: sw };
    },
    render(v, r) {
      const s = this.simulate(v.games);
      return stats([stat("Stay won", `${s.stay} of ${v.games} (${pct(s.stay / v.games, 0)})`), stat("Switch won", `${s.switch} of ${v.games} (${pct(s.switch / v.games, 0)})`, true)]) +
        bars([{ label: "Stay", value: s.stay / v.games, cls: "neg", text: pct(s.stay / v.games, 1) }, { label: "Switch", value: s.switch / v.games, cls: "pos", text: pct(s.switch / v.games, 1) }], { max: 1 }) +
        note("Every change runs a new simulation. Staying wins only if your first pick was right (1 in 3); switching wins the other 2 in 3.");
    }
  });

  define("revpar", {
    title: "Occupancy × ADR = RevPAR",
    inputs: [
      { k: "occ", label: "Occupancy", min: 0.3, max: 1, step: 0.01, value: 0.78, fmt: v => pct(v, 0) },
      { k: "adr", label: "ADR (average daily rate)", min: 50, max: 500, step: 1, value: 180, fmt: usd0 },
      { k: "rooms", label: "Rooms", min: 20, max: 600, step: 10, value: 200, fmt: v => num(v, 0) }
    ],
    compute: v => ({ revpar: v.occ * v.adr, annual: v.occ * v.adr * v.rooms * 365 / 1e6 }),
    render: (v, r) => {
      const W = 330, H = 150, w = v.occ * 230, h = v.adr / 500 * 110;
      return stats([stat("RevPAR", usd0(r.revpar), true), stat("Annual rooms revenue", usd(r.annual, 1))]) +
        `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="RevPAR is the area of occupancy times ADR: ${usd0(r.revpar)}">
          <rect x="60" y="${130 - 110}" width="230" height="110" class="w-frame"/>
          <rect x="60" y="${130 - h}" width="${w}" height="${h}" class="w-bar pos"/>
          <text x="${60 + w / 2}" y="${144}" text-anchor="middle" class="w-lbl">occupancy ${pct(v.occ, 0)}</text>
          <text x="54" y="${130 - h / 2}" text-anchor="end" class="w-lbl">ADR</text>
          <text x="${60 + w / 2}" y="${130 - h / 2 + 4}" text-anchor="middle" class="w-val on">RevPAR ${usd0(r.revpar)}</text>
        </svg>` + note("RevPAR is the shaded area: you can raise it with more rooms sold (width) or a higher rate (height).");
    }
  });

  define("hotelModels", {
    title: "Who absorbs a bad year?",
    inputs: [
      { k: "rev", label: "Revenue in a normal year", min: 10, max: 100, step: 1, value: 40, fmt: usd },
      { k: "drop", label: "Revenue fall in a bad year", min: 0, max: 0.5, step: 0.05, value: 0.25, fmt: v => pct(v, 0) },
      { k: "rent", label: "Fixed lease rent", min: 1, max: 30, step: 0.5, value: 8, fmt: v => usd(v, 1) }
    ],
    compute: v => {
      // Costs: 30% of normal revenue fixed, plus 35% of revenue variable. Management: 3% base fee + 8% of GOP. Franchise: 5% of revenue.
      const gop = rv => rv - 0.3 * v.rev - 0.35 * rv;
      const own = rv => ({ lease: v.rent, managed: gop(rv) - 0.03 * rv - 0.08 * Math.max(0, gop(rv)), franchised: gop(rv) - 0.05 * rv });
      const good = own(v.rev), bad = own(v.rev * (1 - v.drop));
      return { good, bad, change: { lease: bad.lease / good.lease - 1, managed: bad.managed / good.managed - 1, franchised: bad.franchised / good.franchised - 1 } };
    },
    render: (v, r) => {
      const names = { lease: "Lease (rent)", managed: "Management contract", franchised: "Franchise" };
      const fmt1 = x => usd(x, 1);
      return `<div class="w-table"><table><thead><tr><th scope="col">Owner's income</th><th scope="col">Normal year</th><th scope="col">Bad year</th><th scope="col">Change</th></tr></thead><tbody>
        ${Object.keys(names).map(k => `<tr><th scope="row">${names[k]}</th><td>${fmt1(r.good[k])}</td><td>${fmt1(r.bad[k])}</td><td>${pct(r.change[k], 0)}</td></tr>`).join("")}
      </tbody></table></div>` +
        bars(Object.keys(names).map(k => ({ label: names[k].split(" ")[0], value: r.bad[k], cls: r.change[k] < -0.0001 ? "neg" : "pos", text: fmt1(r.bad[k]) }))) + note("Bars: the owner's income in the bad year.") +
        note("Simplified hotel: 30% of normal revenue is fixed cost, 35% of revenue is variable. Under a lease the operator absorbs the fall; under a management contract or franchise the owner does, magnified by fixed costs.");
    }
  });

  define("yieldValue", {
    title: "Value = NOI ÷ yield",
    inputs: [
      { k: "noi", label: "Net operating income", min: 1, max: 50, step: 0.5, value: 5, fmt: v => usd(v, 1) },
      { k: "y", label: "Valuation yield", min: 0.03, max: 0.10, step: 0.0025, value: 0.05, fmt: v => pct(v, 2) },
      { k: "shift", label: "Yield move", min: -0.015, max: 0.015, step: 0.0025, value: 0.005, fmt: v => (v >= 0 ? "+" : "−") + Math.round(Math.abs(v) * 10000) + "bp" }
    ],
    compute: v => { const before = v.noi / v.y, after = v.noi / (v.y + v.shift); return { before, after, change: after / before - 1, multiple: 1 / v.y }; },
    render: (v, r) => stats([stat("Value now", usd(r.before, 1), true), stat("After the yield move", usd(r.after, 1)), stat("Change", (r.change >= 0 ? "+" : "") + pct(r.change, 1)), stat("Income multiple", mult(r.multiple, 1))]) +
      line(y => v.noi / y, 0.03, 0.10, v.y + v.shift, { fx: y => pct(y, 0), fy: x => num(x, 0), xLabel: "yield", yLabel: "value in US$m" }) +
      note("Chart: value in US$ millions. The curve is steepest at low yields: the same 50bp move hurts a 4% asset far more than an 8% one.")
  });

  define("rentRoll", {
    title: "From beds to value: a PBSA scheme",
    inputs: [
      { k: "beds", label: "Beds", min: 100, max: 1500, step: 25, value: 500, fmt: v => num(v, 0) },
      { k: "rent", label: "Rent per bed per week", min: 100, max: 450, step: 5, value: 220, fmt: usd0 },
      { k: "weeks", label: "Tenancy length (weeks)", min: 40, max: 52, step: 1, value: 51, fmt: v => num(v, 0) },
      { k: "occ", label: "Occupancy", min: 0.8, max: 1, step: 0.005, value: 0.98, fmt: v => pct(v, 1) },
      { k: "costs", label: "Operating costs (share of rent)", min: 0.15, max: 0.45, step: 0.01, value: 0.30, fmt: v => pct(v, 0) },
      { k: "y", label: "Valuation yield", min: 0.04, max: 0.08, step: 0.0025, value: 0.05, fmt: v => pct(v, 2) }
    ],
    compute: v => { const gross = v.beds * v.rent * v.weeks * v.occ / 1e6, noi = gross * (1 - v.costs), value = noi / v.y; return { gross, noi, value, perBed: value * 1e6 / v.beds }; },
    render: (v, r) => stats([stat("Gross rent", usd(r.gross, 2)), stat("NOI", usd(r.noi, 2)), stat("Value", usd(r.value, 1), true), stat("Value per bed", usd0(r.perBed))]) +
      bars([{ label: "Gross rent", value: r.gross, cls: "pos", text: usd(r.gross, 2) }, { label: "Operating costs", value: r.gross - r.noi, cls: "neg", text: "−" + usd(r.gross - r.noi, 2) }, { label: "NOI", value: r.noi, cls: "total", text: usd(r.noi, 2) }])
  });

  define("maxLoan", {
    title: "How much will the lender lend?",
    inputs: [
      { k: "value", label: "Property value", min: 20, max: 500, step: 5, value: 100, fmt: usd },
      { k: "noi", label: "NOI", min: 1, max: 40, step: 0.05, value: 6.5, fmt: v => usd(v, 2) },
      { k: "rate", label: "All-in interest rate", min: 0.02, max: 0.10, step: 0.0025, value: 0.06, fmt: v => pct(v, 2) },
      { k: "ltv", label: "Maximum LTV", min: 0.3, max: 0.8, step: 0.05, value: 0.6, fmt: v => pct(v, 0) },
      { k: "icr", label: "Minimum ICR", min: 1, max: 3, step: 0.05, value: 1.75, fmt: v => mult(v, 2) },
      { k: "dy", label: "Minimum debt yield", min: 0.05, max: 0.14, step: 0.005, value: 0.09, fmt: v => pct(v, 1) }
    ],
    compute: v => { const byLtv = v.value * v.ltv, byIcr = v.noi / v.icr / v.rate, byDy = v.noi / v.dy, loan = Math.min(byLtv, byIcr, byDy);
      return { byLtv, byIcr, byDy, loan, binding: loan === byLtv ? "LTV" : loan === byIcr ? "ICR" : "debt yield", ltvActual: loan / v.value }; },
    render: (v, r) => stats([stat("Maximum loan", usd(r.loan, 1), true), stat("Binding test", r.binding), stat("Resulting LTV", pct(r.ltvActual, 0))]) +
      bars([{ label: "LTV test", value: r.byLtv, cls: r.binding === "LTV" ? "neg" : "pos", text: usd(r.byLtv, 1) }, { label: "ICR test", value: r.byIcr, cls: r.binding === "ICR" ? "neg" : "pos", text: usd(r.byIcr, 1) }, { label: "Debt yield test", value: r.byDy, cls: r.binding === "debt yield" ? "neg" : "pos", text: usd(r.byDy, 1) }]) +
      note("Each test caps the loan; the lowest one binds (highlighted). Higher rates shrink the ICR limit.")
  });

  define("capitalStack", {
    title: "The capital stack and its blended cost",
    inputs: [
      { k: "sen", label: "Senior debt (up to LTV)", min: 0.3, max: 0.7, step: 0.05, value: 0.55, fmt: v => pct(v, 0) },
      { k: "ks", label: "Senior rate", min: 0.03, max: 0.09, step: 0.0025, value: 0.06, fmt: v => pct(v, 2) },
      { k: "mez", label: "Mezzanine (extra LTV)", min: 0, max: 0.25, step: 0.05, value: 0.15, fmt: v => pct(v, 0) },
      { k: "km", label: "Mezzanine rate", min: 0.06, max: 0.16, step: 0.005, value: 0.11, fmt: v => pct(v, 1) },
      { k: "ke", label: "Equity target return", min: 0.08, max: 0.25, step: 0.01, value: 0.15, fmt: v => pct(v, 0) }
    ],
    compute: v => { const eq = Math.max(0, 1 - v.sen - v.mez), debt = v.sen + v.mez; return { eq, blendedDebt: debt ? (v.sen * v.ks + v.mez * v.km) / debt : 0, overall: v.sen * v.ks + v.mez * v.km + eq * v.ke }; },
    render: (v, r) => {
      const W = 330, H = 150, segs = [["Senior", v.sen, "total"], ["Mezzanine", v.mez, "neg"], ["Equity", r.eq, "pos"]];
      let y = 130;
      return stats([stat("Blended cost of debt", pct(r.blendedDebt, 2), true), stat("Overall cost of capital", pct(r.overall, 2)), stat("Equity cheque", pct(r.eq, 0) + " of value")]) +
        `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${segs.map(s => `${s[0]} ${pct(s[1], 0)}`).join(", ")}">
          ${segs.map(([n, share, cls]) => { const h = share * 120; y -= h; return share > 0 ? `<rect x="110" y="${y}" width="110" height="${h}" class="w-bar ${cls}"/><text x="228" y="${y + h / 2 + 4}" class="w-lbl">${n} ${pct(share, 0)}</text>` : ""; }).join("")}
          <text x="102" y="134" text-anchor="end" class="w-lbl">repaid first</text><text x="102" y="18" text-anchor="end" class="w-lbl">loses first</text>
        </svg>` + note("Senior debt is repaid first and is cheapest; equity takes the first loss and wants the highest return.");
    }
  });

  /* ---------- Mounting ---------- */
  let uid = 0;
  function mount(el, type, values = {}) {
    const w = registry[type];
    if (!w) { el.innerHTML = ""; return; }
    const v = Object.fromEntries(w.inputs.map(i => [i.k, values[i.k] ?? i.value]));
    const id = "w" + (++uid);
    el.innerHTML = `<div class="widget">
      <p class="w-title">${escH(w.title)}</p>
      <div class="w-inputs">${w.inputs.map(i => `<label class="w-in" for="${id}-${i.k}"><span>${escH(i.label)}</span>
        <input type="range" id="${id}-${i.k}" data-k="${i.k}" min="${i.min}" max="${i.max}" step="${i.step}" value="${v[i.k]}" aria-valuetext="${escH(i.fmt(v[i.k]))}">
        <output for="${id}-${i.k}">${escH(i.fmt(v[i.k]))}</output></label>`).join("")}</div>
      <div class="w-out" aria-live="polite"></div>
    </div>`;
    const out = el.querySelector(".w-out");
    const draw = () => { out.innerHTML = w.render(v, w.compute(v)); };
    el.querySelectorAll("input[type=range]").forEach(inp => inp.addEventListener("input", () => {
      const i = w.inputs.find(x => x.k === inp.dataset.k);
      v[i.k] = +inp.value;
      inp.nextElementSibling.textContent = i.fmt(v[i.k]);
      inp.setAttribute("aria-valuetext", i.fmt(v[i.k]));
      draw();
    }));
    draw();
  }

  window.Widgets = { registry, define, mount, F };
})();
