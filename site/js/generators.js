// Each generator returns { q, o: [correct, wrong1, wrong2, wrong3], why, x: [note1, note2, note3] }.

Bank.gen("val", () => {
  const name = R.company(), ev = R.step(600, 2400, 10), debt = R.step(100, Math.round(ev * 0.04) * 10, 10);
  const cash = R.step(20, 150, 5), nci = R.step(10, 80, 5), pref = Math.random() < 0.5 ? R.step(20, 60, 5) : 0;
  const eq = ev - debt + cash - nci - pref;
  return { trap: ["sign", "missed-step", "sign"],
    q: `${name} has an enterprise value of ${R.m(ev)}, gross debt of ${R.m(debt)}, cash of ${R.m(cash)}${pref ? `, preferred shares of ${R.m(pref)}` : ""} and non-controlling interests of ${R.m(nci)}. It has no other claims or investments. What is its equity value?`,
    o: [R.m(eq), R.m(eq - 2 * cash), R.m(eq + nci), R.m(eq + 2 * nci)],
    why: `Equity value = EV − debt + cash${pref ? " − preferred" : ""} − NCI = ${ev} − ${debt} + ${cash}${pref ? ` − ${pref}` : ""} − ${nci} = ${R.m(eq)}.`,
    x: ["Cash was subtracted. EV is measured net of cash, so cash is added back on the way to equity value.", "NCI was ignored. It's a claim on the consolidated business that doesn't belong to the parent's shareholders.", "NCI was added. Like debt, it must be deducted to reach equity value."]
  };
});

Bank.gen("val", () => {
  const name = R.company(), e = R.step(80, 400, 5), m = R.step(6, 14, 0.5);
  const nd = Math.round(e * R.step(0.3, 0.9, 0.1) / 5) * 5, sh = R.step(50, 400, 10);
  const ev = m * e, eq = ev - nd, p = v => "US$" + (v / sh).toFixed(2);
  return { trap: ["missed-step", "sign", "wrong-measure"],
    q: `${name} has EBITDA of ${R.m(e)}, net debt of ${R.m(nd)} and ${sh} million shares outstanding. Comparable companies trade at ${R.x(m)} EV/EBITDA. What is the implied value per share?`,
    o: [p(eq), p(ev), p(ev + nd), p(m * (e - nd))],
    why: `EV = ${R.x(m)} × ${e} = ${R.m(ev)}. Equity value = ${R.num(ev)} − ${nd} = ${R.m(eq)}. Per share = ${R.num(eq)} ÷ ${sh} = ${p(eq)}.`,
    x: ["That's EV per share. Net debt belongs to lenders and must be deducted first.", "Net debt was added instead of deducted.", "Net debt was taken off EBITDA before applying the multiple. It must come off EV, after the multiple."]
  };
});

// Net new shares from options under the treasury stock method. One definition gives both the multiple-choice and typed versions.
Bank.calc("val", {
  lv: 2, tolerance: 0.01, dp: 2, prompt: "in millions of shares, as a number only, to 2 decimal places",
  make() {
    let P, K;
    do { P = R.step(20, 80, 1); K = R.step(5, 78, 1); } while (K / P < 0.3 || K / P > 0.9 || K * 2 === P || P - K < 2);
    return { P, K, B: R.step(50, 400, 10), N: R.step(2, 20, 0.5) };
  },
  solve: ({ P, K, N }) => N - N * K / P,
  wrongs: ({ P, K, N }) => [
    { value: N, trap: "missed-step", note: "That adds every option but leaves out the buyback funded by the exercise proceeds." },
    { value: N * K / P, trap: "wrong-measure", note: "That's the number of shares bought back. The net new shares are the options minus the shares bought back." },
    { value: N * (P - K), trap: "units", note: "That's the options' intrinsic value in US$m, not a number of shares." }
  ],
  ask: ({ P, K, B, N }) => `A company has ${B}m basic shares trading at US$${P}. It has ${R.num(N)}m options with an exercise price of US$${K}. Using the treasury stock method, how many net new shares do the options add?`,
  why(i) { const { P, K, N } = i; return `Exercise proceeds = ${R.num(N)}m × US$${K} = US$${R.num(N * K, 1)}m, which buys back ${R.num(N * K, 1)} ÷ ${P} = ${R.num(N * K / P, 2)}m shares. Net new shares = ${R.num(N)} − ${R.num(N * K / P, 2)} = ${R.num(this.solve(i), 2)}m.`; },
  fmt: v => R.num(v, 2) + "m"
});

// Diluted shares with two option tranches, one out of the money.
Bank.gen("val", () => {
  let P, K1, K2;
  do { P = R.step(20, 80, 1); K1 = R.step(5, P - 3, 1); K2 = R.step(P + 2, P + 30, 1); } while (K1 / P < 0.3);
  const B = R.step(50, 400, 10), N1 = R.step(2, 15, 0.5), N2 = R.step(2, 15, 0.5);
  const right = B + N1 - N1 * K1 / P, f = v => R.num(v, 2) + "m";
  return { lv: 2, trap: ["concept", "missed-step", "missed-step"],
    q: `A company has ${B}m basic shares trading at US$${P}. It has ${R.num(N1)}m options with an exercise price of US$${K1} and ${R.num(N2)}m options with an exercise price of US$${K2}. Using the treasury stock method, what is its diluted share count?`,
    o: [f(right), f(B + N1 + N2 - (N1 * K1 + N2 * K2) / P), f(B + N1 + N2), f(B + N1)],
    why: `Only the US$${K1} options are in the money; the US$${K2} options are above the share price and left out. Buyback = ${R.num(N1)} × ${K1} ÷ ${P} = ${R.num(N1 * K1 / P, 2)}m. Diluted shares = ${B} + ${R.num(N1)} − ${R.num(N1 * K1 / P, 2)} = ${f(right)}.`,
    x: [`That includes the out-of-the-money US$${K2} options. Nobody exercises an option above the share price.`, "That adds every option and leaves out the buyback.", "That rightly leaves out the out-of-the-money options, but forgets the buyback funded by the exercise proceeds."]
  };
});

Bank.gen("lbo", () => {
  const eq = R.step(100, 800, 10), moic = R.pick([1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0]), n = R.pick([3, 4, 5, 6, 7]);
  const exit = eq * moic, irr = moic ** (1 / n) - 1;
  return { trap: ["wrong-measure", "units", "wrong-measure"],
    q: `A sponsor invests ${R.m(eq)} of equity and receives ${R.m(exit)} when it exits after ${n} years, with no interim distributions. What is the IRR, approximately?`,
    o: [R.pct(irr), R.pct((moic - 1) / n), R.pct(moic - 1), R.pct(moic / n)],
    why: `MOIC = ${R.num(exit)} ÷ ${eq} = ${R.x(moic)}. IRR = ${moic.toFixed(1)}^(1/${n}) − 1 ≈ ${R.pct(irr)}.`,
    x: ["That's the simple average return. It ignores compounding, so it overstates the IRR.", "That's the total return over the whole holding period, not an annual rate.", "Dividing the multiple by the number of years has no financial meaning."]
  };
});

Bank.gen("lbo", () => {
  const e = R.step(50, 200, 10), m1 = R.step(7, 11, 0.5), lev = R.step(3, 5, 0.5), n = R.pick([4, 5, 6]);
  const debt = lev * e, eqIn = m1 * e - debt;
  const e2 = Math.round(e * R.step(1.2, 1.6, 0.05) / 5) * 5, m2 = m1 + R.pick([-1, 0, 0, 1]);
  const ndOut = Math.round(debt * R.step(0.4, 0.8, 0.1) / 5) * 5, eqOut = m2 * e2 - ndOut, moic = eqOut / eqIn;
  return { trap: ["missed-step", "missed-step", "wrong-measure"],
    q: `A sponsor buys a company with EBITDA of ${R.m(e)} at ${R.x(m1)} EV/EBITDA, funded with debt of ${R.x(lev)} EBITDA and the rest in equity. ${n} years later it sells at ${R.x(m2)}, with EBITDA of ${R.m(e2)} and net debt down to ${R.m(ndOut)}. What is the sponsor's money multiple (MOIC)?`,
    o: [R.x(moic, 2), R.x(m2 * e2 / (m1 * e), 2), R.x((m2 * e2 - debt) / eqIn, 2), R.x(moic - 1, 2)],
    why: `Entry equity = ${R.num(m1 * e)} − ${R.num(debt)} = ${R.m(eqIn)}. Exit equity = ${R.x(m2)} × ${e2} − ${ndOut} = ${R.m(eqOut)}. MOIC = ${R.num(eqOut)} ÷ ${R.num(eqIn)} = ${R.x(moic, 2)}.`,
    x: ["That's the growth in enterprise value. It ignores the leverage that magnifies the equity return.", "That ignores the debt repaid during the hold, which adds to equity value at exit.", "That's the profit as a multiple of equity (MOIC − 1), not the money multiple."]
  };
});

Bank.gen("credit", () => {
  const name = R.company(), e = R.step(60, 300, 5);
  const d = Math.round(e * R.step(2, 6, 0.25) / 5) * 5, c = Math.round(e * R.step(0.2, 1.2, 0.1) / 5) * 5;
  return { trap: ["missed-step", "sign", "inverted"],
    q: `${name} has EBITDA of ${R.m(e)}, gross debt of ${R.m(d)} and cash of ${R.m(c)}. What is its net leverage (net debt ÷ EBITDA)?`,
    o: [R.x((d - c) / e), R.x(d / e), R.x((d + c) / e), R.x(e / (d - c), 2)],
    why: `Net debt = ${d} − ${c} = ${R.m(d - c)}. Net leverage = ${R.num(d - c)} ÷ ${e} = ${R.x((d - c) / e)}.`,
    x: ["That's gross leverage. Net leverage deducts cash first.", "Cash was added to debt instead of deducted.", "That's the ratio upside down: EBITDA ÷ net debt."]
  };
});

Bank.gen("credit", () => {
  const e = R.step(80, 400, 5), da = Math.round(e * R.step(0.15, 0.4, 0.05) / 5) * 5;
  const i = Math.max(5, Math.round(e * R.step(0.08, 0.3, 0.02) / 5) * 5), ebit = e - da;
  return { trap: ["wrong-measure", "wrong-measure", "inverted"],
    q: `A company reports EBITDA of ${R.m(e)}, depreciation and amortisation of ${R.m(da)} and interest expense of ${R.m(i)}. What is its EBIT interest cover?`,
    o: [R.x(ebit / i), R.x(e / i), R.x((ebit - i) / i), R.x(i / ebit, 2)],
    why: `EBIT = ${e} − ${da} = ${R.m(ebit)}. EBIT cover = ${ebit} ÷ ${i} = ${R.x(ebit / i)}.`,
    x: ["That's EBITDA cover. EBIT cover deducts D&A first.", "Interest was subtracted before dividing. Cover compares EBIT with interest directly.", "That's the ratio upside down: interest ÷ EBIT."]
  };
});

Bank.gen("fig", () => {
  const name = R.bank(), bv = R.step(4000, 30000, 500), gi = Math.round(bv * R.step(0.08, 0.3, 0.02) / 100) * 100;
  const tbv = bv - gi, mc = Math.round(tbv * R.step(0.6, 1.6, 0.05) / 100) * 100;
  return { trap: ["missed-step", "sign", "inverted"],
    q: `${name} has a market capitalisation of ${R.m(mc)} and shareholders' equity of ${R.m(bv)}, which includes ${R.m(gi)} of goodwill and intangibles. What is its price to tangible book value (P/TBV)?`,
    o: [R.x(mc / tbv, 2), R.x(mc / bv, 2), R.x(mc / (bv + gi), 2), R.x(tbv / mc, 2)],
    why: `Tangible book = ${R.num(bv)} − ${R.num(gi)} = ${R.m(tbv)}. P/TBV = ${R.num(mc)} ÷ ${R.num(tbv)} = ${R.x(mc / tbv, 2)}.`,
    x: ["That's P/BV. Tangible book deducts goodwill and intangibles first.", "Goodwill was added to book value instead of deducted.", "That's the ratio upside down: tangible book ÷ market cap."]
  };
});

Bank.gen("fig", () => {
  const p = R.step(800, 5000, 50), c = Math.round(p * R.step(0.55, 0.75, 0.01) / 5) * 5;
  const x = Math.round(p * R.step(0.22, 0.35, 0.01) / 5) * 5, inv = Math.round(p * R.step(0.03, 0.08, 0.01) / 5) * 5;
  const cr = (c + x) / p;
  return { trap: ["missed-step", "wrong-measure", "wrong-measure"],
    q: `A non-life insurer has net earned premiums of ${R.m(p)}, incurred claims of ${R.m(c)}, operating expenses of ${R.m(x)} and investment income of ${R.m(inv)}. What is its combined ratio?`,
    o: [R.pct(cr), R.pct(c / p), R.pct((c + x) / (p + inv)), R.pct((c + x - inv) / p)],
    why: `Combined ratio = (claims + expenses) ÷ earned premium = (${R.num(c)} + ${R.num(x)}) ÷ ${R.num(p)} = ${R.pct(cr)}. ${cr > 1 ? "Above 100%, so underwriting loses money." : "Below 100%, so underwriting makes a profit."}`,
    x: ["That's the loss ratio alone. The combined ratio adds expenses.", "Investment income doesn't belong in the denominator; the ratio measures underwriting only.", "Investment income was netted off. The combined ratio measures underwriting only."]
  };
});

Bank.gen("fig", () => {
  const rwa = R.step(20000, 150000, 1000), k = Math.round(rwa * R.step(0.11, 0.16, 0.005) / 10) * 10;
  const at1 = Math.round(rwa * R.step(0.01, 0.02, 0.005) / 10) * 10, t2 = Math.round(rwa * R.step(0.015, 0.03, 0.005) / 10) * 10;
  const ta = Math.round(rwa * R.step(2.2, 3.2, 0.1) / 1000) * 1000;
  return { trap: ["wrong-measure", "wrong-measure", "wrong-measure"],
    q: `A bank has CET1 capital of ${R.m(k)}, AT1 instruments of ${R.m(at1)}, Tier 2 capital of ${R.m(t2)}, risk-weighted assets of ${R.m(rwa)} and total assets of ${R.m(ta)}. What is its CET1 ratio?`,
    o: [R.pct(k / rwa), R.pct((k + at1) / rwa), R.pct((k + at1 + t2) / rwa), R.pct(k / ta)],
    why: `CET1 ratio = CET1 capital ÷ RWA = ${R.num(k)} ÷ ${R.num(rwa)} = ${R.pct(k / rwa)}.`,
    x: ["Adding AT1 gives the Tier 1 ratio.", "Adding AT1 and Tier 2 gives the total capital ratio.", "Dividing by total assets uses unweighted exposure, closer to a leverage ratio."]
  };
});

Bank.gen("cf", () => {
  const rf = R.step(0.02, 0.05, 0.0025), b = R.pick([0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5]), erp = R.step(0.04, 0.065, 0.005);
  return { trap: ["wrong-measure", "missed-step", "inverted"],
    q: `The risk-free rate is ${R.pct(rf, 2)}, the equity risk premium is ${R.pct(erp)} and a company's levered beta is ${b.toFixed(1)}. What is its cost of equity under CAPM?`,
    o: [R.pct(rf + b * erp, 2), R.pct(b * (rf + erp), 2), R.pct(rf + erp, 2), R.pct(rf + erp / b, 2)],
    why: `Cost of equity = risk-free rate + β × ERP = ${R.pct(rf, 2)} + ${b.toFixed(1)} × ${R.pct(erp)} = ${R.pct(rf + b * erp, 2)}.`,
    x: ["Beta multiplies only the risk premium, not the risk-free rate.", "That assumes a beta of 1.0 and ignores the company's own risk.", "Beta multiplies the premium; dividing by it reverses the effect."]
  };
});

// WACC: one definition gives both the multiple-choice question and the typed-answer version (see Bank.calc).
Bank.calc("cf", {
  unit: "%", tolerance: 0.05, dp: 2, prompt: "as a percentage, to 2 decimal places",
  make() {
    const E = R.step(400, 2000, 50), D = Math.round(E * R.step(0.2, 0.8, 0.05) / 50) * 50;
    const ke = R.step(0.08, 0.13, 0.005), kd = R.step(0.04, 0.07, 0.0025), t = R.pick([0.2, 0.25, 0.3]);
    return { E, D, V: E + D, ke, kd, t };
  },
  solve: ({ E, D, V, ke, kd, t }) => E / V * ke + D / V * kd * (1 - t),
  wrongs: ({ E, D, V, ke, kd, t }) => [
    { value: E / V * ke + D / V * kd, trap: "missed-step", note: "That leaves out the tax shield. Interest is tax-deductible, so debt is costed after tax." },
    { value: D / V * ke + E / V * kd * (1 - t), trap: "inverted", note: "The weights are swapped: equity's weight belongs with the cost of equity." },
    { value: (ke + kd * (1 - t)) / 2, trap: "wrong-measure", note: "That's a simple average. WACC weights each cost by its share of total capital." }
  ],
  ask: ({ E, D, ke, kd, t }) => `A company has equity worth ${R.m(E)} and debt worth ${R.m(D)} at market value. Its cost of equity is ${R.pct(ke)}, its pre-tax cost of debt is ${R.pct(kd, 2)} and its tax rate is ${R.pct(t, 0)}. What is its WACC?`,
  why(i) {
    const { E, D, V, ke, kd, t } = i;
    return `WACC = E/V × Ke + D/V × Kd × (1 − t) = ${R.pct(E / V)} × ${R.pct(ke)} + ${R.pct(D / V)} × ${R.pct(kd, 2)} × ${(1 - t).toFixed(2)} = ${R.pct(this.solve(i), 2)}.`;
  },
  fmt: v => R.pct(v, 2)
});

Bank.gen("acc", () => {
  const ni = R.step(40, 300, 5), da = R.step(10, 80, 5), ar = R.step(5, 40, 5), ap = R.step(5, 40, 5);
  const cfo = ni + da - ar + ap;
  return { trap: ["sign", "sign", "missed-step"],
    q: `In a year, a company reports net income of ${R.m(ni)} and D&A of ${R.m(da)}. Accounts receivable rose by ${R.m(ar)} and accounts payable rose by ${R.m(ap)}. Nothing else changed. What is its cash flow from operations?`,
    o: [R.m(cfo), R.m(ni + da + ar - ap), R.m(ni - da - ar + ap), R.m(ni + da)],
    why: `CFO = ${ni} + ${da} − ${ar} + ${ap} = ${R.m(cfo)}. Rising receivables use cash; rising payables provide it.`,
    x: ["The working capital signs are reversed: higher receivables use cash, higher payables provide it.", "D&A is a non-cash expense, so it's added back, not subtracted.", "That ignores the working capital movements."]
  };
});

// Tax losses carried forward (US: NOLs): tax paid once the losses are used.
Bank.calc("acc", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    const t = R.pick([0.21, 0.25, 0.3]);
    let L, P;
    do { L = R.step(40, 200, 10); P = R.step(60, 300, 10); } while (P <= L || P === 2 * L);
    return { L, P, t };
  },
  solve: ({ L, P, t }) => (P - L) * t,
  wrongs: ({ L, P, t }) => [
    { value: P * t, trap: "missed-step", note: "That ignores the tax losses. They reduce taxable profit before the tax rate is applied." },
    { value: L * t, trap: "wrong-measure", note: "That's the tax the losses save, not the tax the company still pays." },
    { value: (P + L) * t, trap: "sign", note: "Tax losses reduce taxable profit; they're never added to it." }
  ],
  ask: ({ L, P, t }) => `A company has ${R.m(L)} of tax losses carried forward (in the US, NOLs) and makes ${R.m(P)} of taxable profit this year before using them. The tax rate is ${R.pct(t, 0)} and the losses can be used in full. How much tax does it pay this year?`,
  why(i) { const { L, P, t } = i; return `Taxable profit after losses = ${P} − ${L} = ${R.m(P - L)}. Tax = ${P - L} × ${R.pct(t, 0)} = ${R.m(this.solve(i), 1)}. (US federal NOLs from 2018 onwards can only offset 80% of taxable income; here there's no cap.)`; },
  fmt: v => R.m(v, 1)
});

// Deferred tax liability from faster tax depreciation, in year 1.
Bank.calc("acc", {
  lv: 2, unit: "US$m", tolerance: 0.005, dp: 2, prompt: "in US$m, to 2 decimal places",
  make() { return { C: R.pick([120, 240, 360, 480, 600]), nb: R.pick([8, 10, 12]), nt: R.pick([3, 4, 5]), t: R.pick([0.21, 0.25, 0.3]) }; },
  solve: ({ C, nb, nt, t }) => (C / nt - C / nb) * t,
  wrongs: ({ C, nb, nt, t }) => [
    { value: C / nt - C / nb, trap: "missed-step", note: "That's the timing difference itself. The deferred tax is that difference times the tax rate." },
    { value: C / nt * t, trap: "wrong-measure", note: "That's the whole tax saving from tax depreciation. Only the part above book depreciation is deferred." },
    { value: (C / nt - C / nb) * (1 - t), trap: "wrong-measure", note: "That multiplies by (1 − tax rate). Deferred tax is the timing difference times the tax rate." }
  ],
  ask: ({ C, nb, nt, t }) => `A company buys equipment for ${R.m(C)}. In its accounts it depreciates it straight-line over ${nb} years; for tax it deducts it straight-line over ${nt} years. The tax rate is ${R.pct(t, 0)}. By how much does its deferred tax liability increase in year 1?`,
  why(i) { const { C, nb, nt, t } = i; return `Tax depreciation ${C} ÷ ${nt} = ${R.num(C / nt)}; book depreciation ${C} ÷ ${nb} = ${R.num(C / nb)}. Timing difference = ${R.num(C / nt - C / nb)}. Deferred tax liability +${R.num(C / nt - C / nb)} × ${R.pct(t, 0)} = ${R.m(this.solve(i), 2)}: tax saved now, paid later.`; },
  fmt: v => R.m(v, 2)
});

Bank.gen("econ", () => {
  const i = R.step(0.03, 0.09, 0.0025), p = R.step(0.02, 0.06, 0.0025), real = (1 + i) / (1 + p) - 1;
  return { trap: ["wrong-measure", "sign", "sign"],
    q: `A bond yields ${R.pct(i, 2)} a year and inflation is ${R.pct(p, 2)}. What is the exact real return?`,
    o: [R.pct(real, 2), R.pct(i - p, 2), R.pct(i + p, 2), R.pct((1 + i) * (1 + p) - 1, 2)],
    why: `Real return = (1 + nominal) ÷ (1 + inflation) − 1 = ${(1 + i).toFixed(4)} ÷ ${(1 + p).toFixed(4)} − 1 = ${R.pct(real, 2)}. Subtracting inflation is only an approximation.`,
    x: ["That's the shortcut (nominal − inflation). It's close but not exact.", "Inflation erodes returns, so it's never added.", "That compounds inflation onto the return instead of removing it."]
  };
});

Bank.gen("econ", () => {
  const r1 = R.step(1.02, 1.18, 0.01), r2 = +(r1 + R.pick([-1, 1]) * R.step(0.04, 0.12, 0.01)).toFixed(2);
  const eur = r2 / r1 - 1, usd = r1 / r2 - 1;
  return { trap: ["inverted", "sign", "units"],
    q: `EUR/USD moves from ${r1.toFixed(2)} to ${r2.toFixed(2)} (US dollars per euro). How much has the euro's value changed against the dollar?`,
    o: [R.spct(eur), R.spct(usd), R.spct(-eur), R.spct(r2 - r1)],
    why: `Euro change = new rate ÷ old rate − 1 = ${r2.toFixed(2)} ÷ ${r1.toFixed(2)} − 1 = ${R.spct(eur)}. The dollar moved ${R.spct(usd)}: the two moves aren't mirror images.`,
    x: ["That's the dollar's change against the euro (old ÷ new − 1), not the euro's.", eur > 0 ? "Wrong direction. A higher EUR/USD means each euro buys more dollars, so the euro strengthened." : "Wrong direction. A lower EUR/USD means each euro buys fewer dollars, so the euro weakened.", "That treats the change in the quote as a percentage. The move must be divided by the starting rate."]
  };
});

// CAGR: one definition gives both the multiple-choice question and the typed-answer version (see Bank.calc).
Bank.calc("maths", {
  unit: "%", tolerance: 0.1, dp: 1, prompt: "as a percentage, to 1 decimal place",
  make() {
    const n = R.pick([3, 4, 5, 6, 7, 8]), s = R.step(100, 600, 10), y0 = R.int(2012, 2018);
    const e = Math.round(s * (1 + R.step(0.04, 0.18, 0.01)) ** n / 5) * 5;
    return { n, s, y0, e };
  },
  solve: ({ n, s, e }) => (e / s) ** (1 / n) - 1,
  wrongs: ({ n, s, e }) => [
    { value: (e / s - 1) / n, trap: "wrong-measure", note: "That's the simple average growth rate. It ignores compounding and overstates the CAGR." },
    { value: e / s - 1, trap: "units", note: "That's total growth over the whole period, not an annual rate." },
    { value: (e / s) ** (1 / (n + 1)) - 1, trap: "units", note: `That uses ${n + 1} periods by counting calendar years instead of the gaps between them.` }
  ],
  ask: ({ n, s, y0, e }) => `Revenue grew from ${R.m(s)} in ${y0} to ${R.m(e)} in ${y0 + n}. What is the compound annual growth rate (CAGR)?`,
  why(i) { const { n, s, y0, e } = i; return `${y0} to ${y0 + n} is ${n} years of growth. CAGR = (${e} ÷ ${s})^(1/${n}) − 1 = ${R.pct(this.solve(i))}.`; },
  fmt: v => R.pct(v)
});

Bank.gen("maths", () => {
  const cf = R.step(100, 1000, 50), r = R.step(0.05, 0.12, 0.01), n = R.int(3, 10), pv = cf / (1 + r) ** n;
  return { trap: ["wrong-measure", "inverted", "units"],
    q: `What is the present value of ${R.m(cf)} received in ${n} years, discounted at ${R.pct(r, 0)} a year?`,
    o: [R.m(pv, 1), R.m(cf / (1 + r * n), 1), R.m(cf * (1 + r) ** n, 1), R.m(cf / (1 + r) ** (n - 1), 1)],
    why: `PV = ${cf} ÷ (1 + ${r.toFixed(2)})^${n} = ${cf} ÷ ${((1 + r) ** n).toFixed(4)} = ${R.m(pv, 1)}.`,
    x: ["That uses simple interest. Discounting compounds every year.", "That's the future value: compounding forwards instead of discounting back.", `That discounts ${n - 1} years instead of ${n}.`]
  };
});

Bank.gen("maths", () => {
  const cf = R.step(20, 120, 5), r = R.step(0.07, 0.12, 0.005), g = R.step(0.01, 0.04, 0.005);
  return { trap: ["missed-step", "double-count", "sign"],
    q: `A business will generate free cash flow of ${R.m(cf)} next year, growing at ${R.pct(g)} a year forever. At a discount rate of ${R.pct(r)}, what is it worth today?`,
    o: [R.m(cf / (r - g), 0), R.m(cf / r, 0), R.m(cf * (1 + g) / (r - g), 0), R.m(cf / (r + g), 0)],
    why: `Growing perpetuity = next year's cash flow ÷ (r − g) = ${cf} ÷ (${R.pct(r)} − ${R.pct(g)}) = ${R.m(cf / (r - g), 0)}.`,
    x: ["That ignores growth, valuing it as a flat perpetuity.", "The cash flow was grown one year too many: the formula already uses next year's figure.", "Growth was added to the discount rate instead of subtracted."]
  };
});

Bank.gen("maths", () => {
  const f = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4]);
  return { trap: ["wrong-measure", "wrong-measure", null],
    q: `A share price falls by ${R.pct(f, 0)}. What percentage rise does it need to get back to where it started?`,
    o: [R.pct(f / (1 - f)), R.pct(f), R.pct(f / (1 + f)), R.pct(2 * f)],
    why: `After the fall the price is ${R.pct(1 - f, 0)} of where it started. To recover: 1 ÷ ${(1 - f).toFixed(2)} − 1 = ${R.pct(f / (1 - f))}. The rise is applied to a smaller base.`,
    x: ["The rise is measured from the lower price, so it must be bigger than the fall.", "That divides by the wrong base (1 + fall instead of 1 − fall).", "Doubling the fall has no basis."]
  };
});

Bank.gen("maths", () => {
  const r = R.pick([3, 4, 6, 8, 9, 12]), yrs = v => v.toFixed(1) + " years";
  return { trap: ["wrong-measure", null, "wrong-measure"],
    q: `Roughly how long does it take an investment to double at ${r}% a year, compounded annually?`,
    o: [yrs(72 / r), yrs(100 / r), yrs(50 / r), yrs(144 / r)],
    why: `Rule of 72: 72 ÷ ${r} ≈ ${yrs(72 / r)}. The exact answer, ln 2 ÷ ln ${(1 + r / 100).toFixed(2)}, is ${yrs(Math.log(2) / Math.log(1 + r / 100))}.`,
    x: ["100 ÷ rate is the doubling time with simple interest. Compounding is faster.", "That's far too quick for this rate.", "144 ÷ rate is roughly the time to quadruple (two doublings)."]
  };
});

Bank.gen("maths", () => {
  const p = R.step(20, 120, 5), v = Math.round(p * R.step(0.3, 0.7, 0.05)), F = R.step(100000, 900000, 50000);
  const units = n => R.num(Math.ceil(n), 0) + " units";
  return { trap: ["missed-step", "wrong-measure", "sign"],
    q: `A product sells for US$${p} and costs US$${v} per unit to make. Fixed costs are US$${R.num(F, 0)} a year. How many units must be sold to break even?`,
    o: [units(F / (p - v)), units(F / p), units(F / v), units(F / (p + v))],
    why: `Each unit contributes US$${p} − US$${v} = US$${p - v} towards fixed costs. Breakeven = ${R.num(F, 0)} ÷ ${p - v} = ${units(F / (p - v))}, rounded up.`,
    x: ["That ignores each unit's variable cost. Only the contribution covers fixed costs.", "Dividing by the variable cost has no meaning here.", "Variable cost must be subtracted from the price, not added."]
  };
});

Bank.gen("maths", () => {
  const a = R.step(0.02, 0.06, 0.0025), b = +(a + R.pick([-1, 1]) * R.step(0.005, 0.02, 0.0025)).toFixed(4);
  const bp = Math.round((b - a) * 10000), rel = b / a - 1;
  const sbp = v => (v >= 0 ? "+" : "−") + Math.abs(v) + "bp";
  return { trap: ["units", "units", "wrong-measure"],
    q: `A central bank moves its policy rate from ${R.pct(a, 2)} to ${R.pct(b, 2)}. How large is the change in basis points?`,
    o: [sbp(bp), sbp(bp * 10), sbp(Math.round(bp / 10)), R.spct(rel)],
    why: `One basis point is 0.01 percentage points. ${R.pct(b, 2)} − ${R.pct(a, 2)} = ${(Math.abs(b - a) * 100).toFixed(2)} percentage points = ${sbp(bp)}.`,
    x: ["That's ten times too large: 1 percentage point is 100bp, not 1,000bp.", "That's ten times too small: 1 percentage point is 100bp.", "That's the relative change in the rate, not the change in basis points."]
  };
});

Bank.gen("rx", () => {
  const s = R.step(200, 600, 25), u = R.step(200, 500, 25), d = R.step(100, 300, 25);
  const v = Math.round((s + u * R.step(0.2, 0.8, 0.05)) / 5) * 5, rec = (v - s) / u;
  return { trap: ["wrong-measure", "missed-step", "inverted"],
    q: `A company emerges from restructuring with an enterprise value of ${R.m(v)}. Its claims are senior secured debt of ${R.m(s)}, senior unsecured notes of ${R.m(u)} and subordinated notes of ${R.m(d)}. Under absolute priority, what recovery do the senior unsecured notes get?`,
    o: [R.pct(rec, 0), R.pct(v / (s + u + d), 0), R.pct(v / (s + u), 0), R.pct(Math.max(0, (v - s - d) / u), 0)],
    why: `Senior secured is paid first, leaving ${v} − ${s} = ${R.m(v - s)}. That covers ${R.pct(rec, 0)} of the ${R.m(u)} unsecured claim, and the subordinated notes get nothing.`,
    x: ["That splits value pro rata across every claim, ignoring seniority.", "That treats secured and unsecured debt as ranking equally, ignoring the security.", "That pays the subordinated notes ahead of the unsecured notes, the wrong way round."]
  };
});

Bank.gen("cm", () => {
  const p = R.step(4, 20, 0.5), k = R.pick([2, 3, 4, 5]), sub = +(p * (1 - R.step(0.25, 0.45, 0.05))).toFixed(2);
  const terp = (k * p + sub) / (k + 1), f = v => "US$" + v.toFixed(2);
  return { trap: ["wrong-measure", "missed-step", "missed-step"],
    q: `A company's shares trade at ${f(p)}. It launches a 1-for-${k} rights issue at ${f(sub)} per new share. What is the theoretical ex-rights price (TERP)?`,
    o: [f(terp), f((p + sub) / 2), f(p * k / (k + 1)), f((k * p + sub) / k)],
    why: `TERP = (${k} × ${f(p)} + ${f(sub)}) ÷ ${k + 1} = ${f(terp)}: the value of ${k} existing shares plus the cash for one new share, spread across ${k + 1} shares.`,
    x: [`A simple average ignores the ratio: there are ${k} existing shares for every new one.`, "That ignores the cash paid for the new shares, as if they were issued for free.", `That divides by the ${k} existing shares only, leaving out the new share.`]
  };
});

Bank.gen("cm", () => {
  const n = R.pick([2, 3, 4, 5]), c = R.step(0.03, 0.08, 0.005);
  const y = +(c + R.pick([-1, 1]) * R.step(0.005, 0.02, 0.005)).toFixed(4);
  const price = (cp, yl) => { let s = 0; for (let t = 1; t <= n; t++) s += cp * 100 / (1 + yl) ** t; return s + 100 / (1 + yl) ** n; };
  const f = v => v.toFixed(2);
  return { trap: ["inverted", "missed-step", "missed-step"],
    q: `A ${n}-year bond pays an annual coupon of ${R.pct(c, 2)} and is priced to yield ${R.pct(y, 2)}. What is its price per 100 of face value?`,
    o: [f(price(c, y)), f(price(y, c)), "100.00", f(100 / (1 + y) ** n + c * 100 * n)],
    why: `Discount each coupon of ${(c * 100).toFixed(2)} and the final 100 at ${R.pct(y, 2)} to get ${f(price(c, y))}. ${y > c ? "The yield is above the coupon, so the bond trades below par." : "The yield is below the coupon, so the bond trades above par."}`,
    x: ["The coupon and yield are swapped, which puts the price on the wrong side of par.", "A bond only prices at par when its yield equals its coupon.", "The coupons were added up without being discounted."]
  };
});

Bank.gen("bt", () => {
  const item = R.pick([["A bat and a ball", "bat", "ball"], ["A pen and a cap", "pen", "cap"], ["A notebook and a pencil", "notebook", "pencil"]]);
  const d = R.step(1, 10, 0.5), small = R.step(0.05, 0.95, 0.05), total = +(d + 2 * small).toFixed(2);
  const f = v => "US$" + v.toFixed(2);
  return { trap: ["missed-step", "missed-step", "wrong-measure"],
    q: `${item[0]} cost ${f(total)} together. The ${item[1]} costs ${f(d)} more than the ${item[2]}. How much does the ${item[2]} cost?`,
    o: [f(small), f(total - d), f(total / 2), f(d / 2)],
    why: `If the ${item[2]} costs x, the ${item[1]} costs x + ${d.toFixed(2)}. So 2x + ${d.toFixed(2)} = ${total.toFixed(2)} and x = ${f(small)}.`,
    x: [`That's the intuitive answer, but then the ${item[1]} would cost ${f(total)} and the pair ${f(2 * total - d)}.`, "Splitting the total equally ignores the price difference.", "That's half the difference, not the price."]
  };
});

Bank.gen("bt", () => {
  const h = R.int(1, 11), m = R.pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
  const small = raw => Math.min(raw, 360 - raw);
  const ang = small(Math.abs(30 * h - 5.5 * m)), naive = small(Math.abs(30 * h - 6 * m));
  const deg = v => (Number.isInteger(v) ? v : v.toFixed(1)) + "°";
  return { trap: ["missed-step", "wrong-measure", "wrong-measure"],
    q: `What is the smaller angle between the hour and minute hands of a clock at ${h}:${String(m).padStart(2, "0")}?`,
    o: [deg(ang), deg(naive), deg(360 - ang), deg(360 - naive)],
    why: `The minute hand is at ${6 * m}°. The hour hand moves 0.5° a minute, so it's at ${30 * h} + 0.5 × ${m} = ${deg(30 * h + 0.5 * m)}. The gap is ${deg(ang)}.`,
    x: ["That leaves the hour hand on the hour, but it moves 0.5° every minute.", "That's the larger (reflex) angle, not the smaller one.", "That's the larger angle, and it also ignores the hour hand's movement."]
  };
});

Bank.gen("bt", () => {
  const a = R.pick([2, 3, 4, 5, 6]), b = R.pick([3, 4, 6, 8, 10, 12]);
  const hm = v => { const t = Math.round(v * 60); return `${Math.floor(t / 60)}h ${String(t % 60).padStart(2, "0")}m`; };
  return { trap: ["wrong-measure", "wrong-measure", "wrong-measure"],
    q: `One analyst can build a model in ${a} hours; another takes ${b} hours. Working together at those rates, how long do they take?`,
    o: [hm(a * b / (a + b)), hm((a + b) / 2), hm(a + b), hm(Math.min(a, b) / 2)],
    why: `Work rates add: 1/${a} + 1/${b} = ${a + b}/${a * b} of the model per hour, so together they need ${a * b}/${a + b} hours = ${hm(a * b / (a + b))}.`,
    x: ["Averaging the two times ignores that they work at the same time.", "Adding the times is how long it takes if they work one after the other.", "Halving the faster time assumes both work as fast as the quicker analyst."]
  };
});

// M&A: target shareholders' stake after an all-stock deal.
// Inputs are redrawn until every known wrong answer is clearly apart from the right one (more than 12% and 0.5 points away),
// so a typed conceptual mistake is never mistaken for a calculation slip, and the wrong answers stay apart from each other.
const mnaFar = (a, ws, rel, abs) => ws.every(w => Math.abs(w - a) > Math.max(rel * Math.abs(a), abs)) && ws.every((w, i) => ws.every((u, j) => i === j || Math.abs(w - u) > abs));
Bank.calc("mna", {
  lv: 2, unit: "%", tolerance: 0.1, dp: 1, prompt: "as a percentage, to 1 decimal place",
  make() {
    for (;;) {
      const SA = R.step(100, 800, 10), PA = R.step(20, 120, 1), ST = R.step(20, 300, 5), PT = R.step(10, 80, 0.5);
      const N = ST * PT / PA, a = N / (SA + N);
      if (a < 0.08 || a > 0.7) continue;
      if (mnaFar(a, [N / SA, SA / (SA + N), ST / (SA + ST)], 0.12, 0.005)) return { SA, PA, ST, PT, N };
    }
  },
  solve: ({ SA, N }) => N / (SA + N),
  wrongs: ({ SA, ST, N }) => [
    { value: N / SA, trap: "missed-step", note: "That divides by the buyer's existing shares only. The new shares are part of the combined total too." },
    { value: SA / (SA + N), trap: "inverted", note: "That's the buyer's existing shareholders' stake, not the target's." },
    { value: ST / (SA + ST), trap: "wrong-measure", note: "That uses the target's old share count. Its holders receive new buyer shares, worth the purchase price at the buyer's share price." }
  ],
  ask: ({ SA, PA, ST, PT }) => `A buyer has ${SA}m shares trading at US$${PA}. It agrees to buy a target with ${ST}m shares for US$${R.num(PT, 2)} per share, paid entirely in new buyer shares. What share of the combined company will the target's shareholders own?`,
  why(i) { const { SA, PA, ST, PT, N } = i; return `Purchase price = ${ST}m × US$${R.num(PT, 2)} = ${R.m(ST * PT, 1)}. New buyer shares = ${R.num(ST * PT, 1)} ÷ ${PA} = ${R.num(N, 2)}m. Target holders own ${R.num(N, 2)} ÷ (${SA} + ${R.num(N, 2)}) = ${R.pct(this.solve(i))}.`; },
  fmt: v => R.pct(v)
});

// M&A: exchange ratio implied by the undisturbed price, the premium and the buyer's share price.
Bank.calc("mna", {
  lv: 2, unit: "x", tolerance: 0.002, dp: 3, prompt: "as buyer shares per target share, to 3 decimal places",
  make() {
    for (;;) {
      const PT = R.step(10, 60, 0.5), p = R.step(0.2, 0.45, 0.05), PA = R.step(20, 120, 1), er = PT * (1 + p) / PA;
      if (er < 0.15 || er > 3) continue;
      if (mnaFar(er, [PT / PA, PA / (PT * (1 + p)), PT * p / PA], 0.12, 0.01)) return { PT, p, PA };
    }
  },
  solve: ({ PT, p, PA }) => PT * (1 + p) / PA,
  wrongs: ({ PT, p, PA }) => [
    { value: PT / PA, trap: "missed-step", note: "That leaves out the premium. The offer is the undisturbed price plus the premium." },
    { value: PA / (PT * (1 + p)), trap: "inverted", note: "That's flipped: it's target shares per buyer share. Divide the offer price by the buyer's share price." },
    { value: PT * p / PA, trap: "wrong-measure", note: "That converts only the premium into buyer shares, not the whole offer price." }
  ],
  ask: ({ PT, p, PA }) => `A target's undisturbed share price is US$${R.num(PT, 2)}. A buyer whose shares trade at US$${PA} offers a ${R.pct(p, 0)} premium, paid entirely in its own shares. What exchange ratio does that imply?`,
  why(i) { const { PT, p, PA } = i; return `Offer price = US$${R.num(PT, 2)} × ${(1 + p).toFixed(2)} = US$${R.num(PT * (1 + p), 2)}. Exchange ratio = ${R.num(PT * (1 + p), 2)} ÷ ${PA} = ${R.x(this.solve(i), 3)}: each target share becomes ${this.solve(i).toFixed(3)} buyer shares.`; },
  fmt: v => R.x(v, 3)
});

// M&A: goodwill after the purchase price allocation, including the deferred tax liability on write-ups.
Bank.calc("mna", {
  lv: 3, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const P = R.step(300, 1500, 10), B = R.step(100, Math.round(P * 0.6 / 10) * 10, 10), W = R.step(20, Math.round(P * 0.3 / 10) * 10, 10), t = R.pick([0.21, 0.25, 0.3]);
      const g = P - B - W * (1 - t);
      if (P - B - W <= 0) continue;
      if (mnaFar(g, [P - B, P - B - W, P - B - W * (1 + t)], 0.12, 0.5)) return { P, B, W, t };
    }
  },
  solve: ({ P, B, W, t }) => P - B - W * (1 - t),
  wrongs: ({ P, B, W, t }) => [
    { value: P - B, trap: "missed-step", note: "That compares the price with book value only. Identifiable assets are first written up to fair value." },
    { value: P - B - W, trap: "missed-step", note: "That leaves out the deferred tax liability on the write-up, which reduces the net assets acquired and so adds to goodwill." },
    { value: P - B - W * (1 + t), trap: "sign", note: "The deferred tax on the write-up is a liability: it reduces net assets, so it increases goodwill rather than reducing it." }
  ],
  ask: ({ P, B, W, t }) => `A buyer pays ${R.m(P)} for 100% of a target with book net assets of ${R.m(B)}. In the purchase price allocation it writes up identifiable assets by ${R.m(W)}; their tax base doesn't change, and the tax rate is ${R.pct(t, 0)}. How much goodwill does it recognise?`,
  why(i) { const { P, B, W, t } = i; return `Deferred tax liability on the write-up = ${W} × ${R.pct(t, 0)} = ${R.m(W * t, 1)}. Net identifiable assets at fair value = ${B} + ${W} − ${R.num(W * t, 1)} = ${R.m(B + W * (1 - t), 1)}. Goodwill = ${P} − ${R.num(B + W * (1 - t), 1)} = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});
