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

// PE fund: carried interest from a whole-fund waterfall (8% compounded preferred return, 20% carry), with or without a full catch-up.
// Uses the same redraw guard as the M&A calculations (mnaFar).
Bank.calc("lbo", {
  lv: 3, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const C = R.step(100, 1000, 10), n = R.int(3, 7), D = Math.round(C * R.step(1.3, 2.6, 0.05)), cu = Math.random() < 0.5;
      const P = D - C, pref = C * (1.08 ** n - 1);
      if (P < 1.3 * pref) continue; // enough profit for the catch-up to complete
      const i = { C, n, D, cu, P, pref };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.5)) return i;
    }
  },
  solve: ({ cu, P, pref }) => cu ? 0.2 * P : 0.2 * (P - pref),
  wrongs: ({ cu, P, pref, D }) => cu ? [
    { value: 0.2 * (P - pref), trap: "missed-step", note: "That leaves out the catch-up. With a full catch-up, the GP ends up with 20% of all the profit, not just the profit above the preferred return." },
    { value: 0.2 * D, trap: "wrong-measure", note: "Carry is a share of profit, not of total proceeds: the LPs' capital comes back first." },
    { value: 0.8 * P, trap: "inverted", note: "That's the LPs' share of the profit, not the GP's." }
  ] : [
    { value: 0.2 * P, trap: "concept", note: "That assumes a full catch-up. Without one, the GP shares only in the profit above the preferred return." },
    { value: 0.2 * D, trap: "wrong-measure", note: "Carry is a share of profit, not of total proceeds: the LPs' capital comes back first." },
    { value: 0.8 * (P - pref), trap: "inverted", note: "That's the LPs' share of the profit above the preferred return, not the GP's." }
  ],
  ask: ({ C, n, D, cu }) => `A private equity fund invested ${R.m(C)} of LP capital at the start and returned ${R.m(D)} in total at the end of year ${n}. LPs get an 8% preferred return, compounded annually; carried interest is 20%, ${cu ? "with a full (100%) GP catch-up" : "with no GP catch-up"}, under a whole-fund waterfall. How much carried interest does the GP receive?`,
  why(i) {
    const { C, n, D, cu, P, pref } = i;
    const base = `Profit = ${R.num(D)} − ${R.num(C)} = ${R.m(P)}. Preferred return = ${R.num(C)} × (1.08^${n} − 1) = ${R.m(pref, 1)}. `;
    return base + (cu ? `There's enough profit for the catch-up to complete, so the GP ends with 20% of all profit: 20% × ${R.num(P)} = ${R.m(this.solve(i), 1)}.`
      : `With no catch-up, the GP gets 20% of the profit above the preferred return: 20% × (${R.num(P)} − ${R.num(pref, 1)}) = ${R.m(this.solve(i), 1)}.`);
  },
  fmt: v => R.m(v, 1)
});

// PE fund: TVPI from paid-in capital, distributions and the value of remaining investments.
Bank.calc("lbo", {
  lv: 2, unit: "x", tolerance: 0.01, dp: 2, prompt: "as a multiple, to 2 decimal places",
  make() {
    for (;;) {
      const PI = R.step(50, 500, 10), K = PI + R.step(20, 300, 10), Dst = R.step(0, Math.round(PI * 1.5 / 5) * 5, 5), N = R.step(Math.round(PI * 0.2 / 5) * 5, Math.round(PI * 1.5 / 5) * 5, 5);
      const i = { PI, K, Dst, N };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.05)) return i;
    }
  },
  solve: ({ PI, Dst, N }) => (Dst + N) / PI,
  wrongs: ({ PI, K, Dst, N }) => [
    { value: Dst / PI, trap: "wrong-measure", note: "That's DPI: it counts only cash returned. TVPI adds the value of the investments still held." },
    { value: (Dst + N) / K, trap: "wrong-measure", note: "TVPI divides by capital paid in (called), not by total commitments." },
    { value: N / PI, trap: "missed-step", note: "That leaves out the distributions already paid. TVPI counts both cash returned and value still held." }
  ],
  ask: ({ PI, K, Dst, N }) => `A fund has ${R.m(K)} of commitments, of which ${R.m(PI)} has been called. It has distributed ${R.m(Dst)} to LPs, and its remaining investments are valued at ${R.m(N)}. What is its TVPI?`,
  why(i) { const { PI, Dst, N } = i; return `TVPI = (distributions + remaining value) ÷ paid-in capital = (${Dst} + ${N}) ÷ ${PI} = ${R.x(this.solve(i), 2)}. DPI, the cash-only part, is ${Dst} ÷ ${PI} = ${R.x(Dst / PI, 2)}.`; },
  fmt: v => R.x(v, 2)
});

// LBO: maximum debt under a leverage cap and an interest-cover test.
Bank.calc("lbo", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const E = R.step(40, 400, 10), lev = R.step(4, 6.5, 0.5), cov = R.pick([1.5, 2, 2.5, 3]), r = R.step(0.06, 0.12, 0.005);
      const i = { E, lev, cov, r };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 1)) return i;
    }
  },
  solve: ({ E, lev, cov, r }) => Math.min(lev * E, E / cov / r),
  wrongs: ({ E, lev, cov, r }) => [
    { value: Math.max(lev * E, E / cov / r), trap: "wrong-measure", note: "That's the looser of the two limits. Lenders apply both tests, so the tighter one binds." },
    { value: E / cov, trap: "units", note: "That's the most interest the company can carry each year, not the debt it supports." },
    { value: (lev * E + E / cov / r) / 2, trap: "wrong-measure", note: "Lenders apply the tighter of the two limits, not an average of them." }
  ],
  ask: ({ E, lev, cov, r }) => `Lenders will lend up to ${R.x(lev)} EBITDA, provided EBITDA covers interest at least ${R.num(cov, 1)} times. The company has EBITDA of ${R.m(E)} and the debt costs ${R.pct(r, 1)} a year. What is the most it can borrow?`,
  why(i) {
    const { E, lev, cov, r } = i, A = lev * E, B = E / cov / r;
    return `Leverage limit = ${R.x(lev)} × ${E} = ${R.m(A, 1)}. Coverage limit: interest can be at most ${E} ÷ ${R.num(cov, 1)} = ${R.m(E / cov, 1)}, which at ${R.pct(r, 1)} supports ${R.m(B, 1)}. The tighter limit binds: ${R.m(Math.min(A, B), 1)} (the ${A <= B ? "leverage" : "coverage"} test).`;
  },
  fmt: v => R.m(v, 1)
});

// REITs: FFO from net income, real estate D&A and a gain on a property sale. Same redraw guard as above (mnaFar).
Bank.calc("rev", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const i = { NI: R.step(20, 300, 5), DA: R.step(10, 150, 5), G: R.step(5, 60, 5) };
      if (i.NI <= i.G) continue; // keeps FFO and every wrong answer positive
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.5)) return i;
    }
  },
  solve: ({ NI, DA, G }) => NI + DA - G,
  wrongs: ({ NI, DA, G }) => [
    { value: NI + DA, trap: "missed-step", note: "That leaves the one-off gain on the property sale in. FFO takes it out." },
    { value: NI + DA + G, trap: "sign", note: "The gain is already in net income and is one-off, so it's deducted, not added." },
    { value: NI - G, trap: "missed-step", note: "That forgets to add back real estate depreciation, the main FFO adjustment." }
  ],
  ask: ({ NI, DA, G }) => `A REIT reports net income of ${R.m(NI)}. That's after ${R.m(DA)} of real estate depreciation and amortisation, and includes a ${R.m(G)} gain on selling a property. What is its FFO?`,
  why(i) { const { NI, DA, G } = i; return `FFO = net income + real estate depreciation − gains on property sales = ${R.num(NI)} + ${R.num(DA)} − ${R.num(G)} = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});

// REITs: NAV per share from NOI, a market cap rate, cash, debt and the share count.
Bank.calc("rev", {
  lv: 2, tolerance: 0.01, dp: 2, prompt: "in US$ per share, to 2 decimal places",
  make() {
    for (;;) {
      const NOI = R.step(20, 200, 2), cap = R.step(0.04, 0.08, 0.0025), GAV = NOI / cap;
      const D = Math.round(GAV * R.step(0.25, 0.55, 0.05) / 10) * 10, C = R.step(10, 200, 5), SH = R.step(20, 300, 5);
      const i = { NOI, cap, D, C, SH };
      if (GAV + C - D <= 0) continue;
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.05)) return i;
    }
  },
  solve: ({ NOI, cap, D, C, SH }) => (NOI / cap + C - D) / SH,
  wrongs: ({ NOI, cap, D, C, SH }) => [
    { value: (NOI / cap + C) / SH, trap: "missed-step", note: "That ignores the debt, which ranks ahead of shareholders." },
    { value: (NOI / cap - D) / SH, trap: "missed-step", note: "That leaves out the cash, which belongs to shareholders too." },
    { value: (NOI / cap - D - C) / SH, trap: "sign", note: "Cash is an asset, so it's added, not deducted." }
  ],
  ask: ({ NOI, cap, D, C, SH }) => `A REIT's properties produce NOI of ${R.m(NOI)}, and similar assets trade at a ${R.pct(cap, 2)} cap rate. It has ${R.m(D)} of debt, ${R.m(C)} of cash and ${SH}m shares. What is its NAV per share?`,
  why(i) { const { NOI, cap, D, C, SH } = i, G = NOI / cap; return `Property value = ${NOI} ÷ ${R.pct(cap, 2)} = ${R.m(G, 1)}. NAV = ${R.num(G, 1)} + ${R.num(C)} − ${R.num(D)} = ${R.m(G + C - D, 1)}. Per share = ${R.num(G + C - D, 1)} ÷ ${SH} = ${R.usd2(this.solve(i))}.`; },
  fmt: v => R.usd2(v)
});

// REITs: the cap rate implied by the share price, excluding non-income assets such as development land.
Bank.calc("rev", {
  lv: 3, unit: "%", tolerance: 0.05, dp: 2, prompt: "as a percentage, to 2 decimal places",
  make() {
    for (;;) {
      const P = R.step(10, 80, 0.5), SH = R.step(50, 400, 5), MC = P * SH;
      const ND = Math.round(MC * R.step(0.4, 1, 0.05) / 10) * 10, L = Math.round((MC + ND) * R.step(0.13, 0.25, 0.01) / 5) * 5;
      const NOI = Math.round((MC + ND - L) * R.step(0.045, 0.08, 0.0025) * 10) / 10;
      const i = { P, SH, ND, L, NOI };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.002)) return i;
    }
  },
  solve: ({ P, SH, ND, L, NOI }) => NOI / (P * SH + ND - L),
  wrongs: ({ P, SH, ND, L, NOI }) => [
    { value: NOI / (P * SH), trap: "missed-step", note: "That divides by the equity value only. The properties are funded by debt as well as equity." },
    { value: NOI / (P * SH + ND), trap: "missed-step", note: "That includes the development land, which produces no NOI. Take it out before working out the yield on the let property." },
    { value: NOI / (P * SH + ND + L), trap: "sign", note: "The land's value is deducted to isolate the let property, not added." }
  ],
  ask: ({ P, SH, ND, L, NOI }) => `A REIT has ${SH}m shares trading at US$${R.num(P, 2)} and net debt of ${R.m(ND)}. Besides its let properties, which produce NOI of ${R.m(NOI, 1)}, it owns development land worth ${R.m(L)} that produces no income. What cap rate is the share price implying for the let properties?`,
  why(i) { const { P, SH, ND, L, NOI } = i, MC = P * SH, V = MC + ND - L; return `Market cap = ${SH} × ${R.num(P, 2)} = ${R.m(MC, 1)}. Implied value of the let properties = ${R.num(MC, 1)} + ${R.num(ND)} − ${R.num(L)} = ${R.m(V, 1)}. Implied cap rate = ${R.num(NOI, 1)} ÷ ${R.num(V, 1)} = ${R.pct(this.solve(i), 2)}.`; },
  fmt: v => R.pct(v, 2)
});

// Credit: approximate yield to maturity. Same redraw guard as above (mnaFar); every value stays positive.
Bank.calc("credit", {
  lv: 2, unit: "%", tolerance: 0.05, dp: 2, prompt: "as a percentage, to 2 decimal places",
  make() {
    for (;;) {
      const c = R.step(0.03, 0.1, 0.0025), P = R.step(70, 125, 0.5), n = R.int(2, 15);
      const i = { c, P, n };
      if (Math.abs(P - 100) < 3 || [this.solve(i), ...this.wrongs(i).map(w => w.value)].some(v => v <= 0.005)) continue;
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.002)) return i;
    }
  },
  solve: ({ c, P, n }) => (c * 100 + (100 - P) / n) / ((100 + P) / 2),
  wrongs: ({ c, P, n }) => [
    { value: c * 100 / P, trap: "missed-step", note: `That's the current yield. It ignores the ${P < 100 ? "gain" : "loss"} as the price moves to 100 by maturity.` },
    { value: c, trap: "wrong-measure", note: "That's the coupon rate. The yield depends on the price paid." },
    { value: (c * 100 - (100 - P) / n) / ((100 + P) / 2), trap: "sign", note: `The ${P < 100 ? "discount is a gain, so it's added" : "premium is a loss, so it's deducted"} each year, not the other way round.` }
  ],
  ask: ({ c, P, n }) => `A bond with a ${R.pct(c, 2)} annual coupon and ${n} years to maturity trades at ${R.num(P, 1)}. Using the approximation (coupon + (100 − price) ÷ years) ÷ ((100 + price) ÷ 2), what is its yield to maturity?`,
  why(i) { const { c, P, n } = i; return `Annual coupon = ${R.num(c * 100, 2)}; pull to par = (100 − ${R.num(P, 1)}) ÷ ${n} = ${P > 100 ? "−" : ""}${R.num(Math.abs(100 - P) / n, 2)} a year. Average price = (100 + ${R.num(P, 1)}) ÷ 2 = ${R.num((100 + P) / 2, 2)}. YTM ≈ (${R.num(c * 100, 2)} ${P < 100 ? "+" : "−"} ${R.num(Math.abs(100 - P) / n, 2)}) ÷ ${R.num((100 + P) / 2, 2)} = ${R.pct(this.solve(i), 2)}.`; },
  fmt: v => R.pct(v, 2)
});

// Credit: annual cost of a revolving credit facility.
Bank.calc("credit", {
  lv: 2, unit: "US$m", tolerance: 0.01, dp: 2, prompt: "in US$m, to 2 decimal places",
  make() {
    for (;;) {
      const K = R.step(100, 1000, 25), D = Math.round(K * R.step(0.1, 0.6, 0.05) / 5) * 5, b = R.step(0.03, 0.055, 0.0025), m = R.step(0.015, 0.04, 0.0025), f = R.pick([0.0025, 0.00375, 0.005]);
      const i = { K, D, b, m, f };
      if (D <= 0) continue;
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.05)) return i;
    }
  },
  solve: ({ K, D, b, m, f }) => D * (b + m) + (K - D) * f,
  wrongs: ({ K, D, b, m, f }) => [
    { value: D * (b + m), trap: "missed-step", note: "That leaves out the commitment fee on the undrawn part of the facility." },
    { value: K * (b + m), trap: "wrong-measure", note: "Interest is charged only on the amount drawn, not on the whole facility." },
    { value: D * m + (K - D) * f, trap: "missed-step", note: "That charges only the margin. Interest is the base rate plus the margin." }
  ],
  ask: ({ K, D, b, m, f }) => `A company has a ${R.m(K)} revolver and has drawn ${R.m(D)} for the whole year. Drawn amounts pay SOFR + ${R.pct(m, 2)}, with SOFR at ${R.pct(b, 2)}, and the undrawn amount pays a ${R.pct(f, 3)} commitment fee. What is the facility's annual cost?`,
  why(i) { const { K, D, b, m, f } = i; return `Interest = ${R.num(D)} × (${R.pct(b, 2)} + ${R.pct(m, 2)}) = ${R.m(D * (b + m), 2)}. Commitment fee = (${R.num(K)} − ${R.num(D)}) × ${R.pct(f, 3)} = ${R.m((K - D) * f, 2)}. Total = ${R.m(this.solve(i), 2)}.`; },
  fmt: v => R.m(v, 2)
});

// Credit: availability under an asset-based loan (ABL).
Bank.calc("credit", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const AR = R.step(50, 500, 10), INV = R.step(50, 500, 10), a = R.pick([0.8, 0.85, 0.9]), bi = R.pick([0.5, 0.55, 0.6, 0.65]);
      const base = AR * a + INV * bi, DR = Math.round(base * R.step(0.15, 0.6, 0.05) / 5) * 5;
      const i = { AR, INV, a, bi, DR };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.5)) return i;
    }
  },
  solve: ({ AR, INV, a, bi, DR }) => AR * a + INV * bi - DR,
  wrongs: ({ AR, INV, a, bi, DR }) => [
    { value: AR + INV - DR, trap: "missed-step", note: "That ignores the advance rates. Lenders lend only a percentage of each type of collateral." },
    { value: (AR + INV) * a - DR, trap: "wrong-measure", note: "That applies the receivables advance rate to inventory too. Inventory is harder to turn into cash, so its rate is lower." },
    { value: AR * a + INV * bi, trap: "missed-step", note: "That's the whole borrowing base. The amount already drawn has to come off it." }
  ],
  ask: ({ AR, INV, a, bi, DR }) => `An ABL lends ${R.pct(a, 0)} against eligible receivables and ${R.pct(bi, 0)} against eligible inventory, and the facility limit is above the borrowing base. The company has ${R.m(AR)} of eligible receivables, ${R.m(INV)} of eligible inventory and has already drawn ${R.m(DR)}. How much more can it borrow?`,
  why(i) { const { AR, INV, a, bi, DR } = i; return `Borrowing base = ${R.pct(a, 0)} × ${AR} + ${R.pct(bi, 0)} × ${INV} = ${R.m(AR * a, 1)} + ${R.m(INV * bi, 1)} = ${R.m(AR * a + INV * bi, 1)}. Available = ${R.num(AR * a + INV * bi, 1)} − ${R.num(DR)} = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});

// Valuation: calendarise EBITDA for a company whose financial year ends in March or September.
// Multiple choice only: the usual mistakes land close to the right answer, so a typed version couldn't tell them from slips.
Bank.gen("val", () => {
  let m, F1, F2, o;
  for (let k = 0; k < 50; k++) {
    m = R.pick([3, 9]); F1 = R.step(100, 800, 10); F2 = Math.round(F1 * (1 + R.step(0.1, 0.35, 0.05)) / 5) * 5;
    o = [m / 12 * F1 + (12 - m) / 12 * F2, (12 - m) / 12 * F1 + m / 12 * F2, F1, (F1 + F2) / 2].map(v => R.m(v, 1));
    if (new Set(o).size === 4) break;
  }
  const mon = m === 3 ? "March" : "September";
  return { lv: 2, trap: ["inverted", "missed-step", "wrong-measure"],
    q: `A company's financial year ends in ${mon}. EBITDA was ${R.m(F1)} for the year to ${mon} 2026 and is forecast at ${R.m(F2)} for the year to ${mon} 2027. What is its calendar 2026 EBITDA?`,
    o,
    why: `Calendar 2026 takes ${m} months from the year to ${mon} 2026 and ${12 - m} months from the next: ${m}/12 × ${R.num(F1)} + ${12 - m}/12 × ${R.num(F2)} = ${o[0]}.`,
    x: [`The weights are swapped. The year to ${mon} 2026 covers only ${m} months of calendar 2026.`, "That uses only the financial year ending in 2026, which mostly covers 2025.", "A simple average ignores how many months of each financial year fall in 2026."]
  };
});

// Valuation: the EV/EBITDA multiple implied by a Gordon growth terminal value.
Bank.calc("val", {
  lv: 3, unit: "x", tolerance: 0.05, dp: 1, prompt: "as a multiple, to 1 decimal place",
  make() {
    for (;;) {
      const F = R.step(50, 400, 5), E = Math.round(F / R.step(0.4, 0.7, 0.05) / 5) * 5, W = R.step(0.07, 0.11, 0.0025), g = R.step(0.015, 0.035, 0.0025);
      const i = { F, E, W, g };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.2)) return i;
    }
  },
  solve: ({ F, E, W, g }) => F * (1 + g) / (W - g) / E,
  wrongs: ({ F, E, W, g }) => [
    { value: (1 + g) / (W - g), trap: "wrong-measure", note: "That divides the terminal value by free cash flow, not by EBITDA." },
    { value: F * (1 + g) / W / E, trap: "missed-step", note: "The Gordon formula divides by WACC minus the growth rate, not by WACC alone." },
    { value: F * (1 + g) / (W + g) / E, trap: "sign", note: "Growth is subtracted from WACC in the denominator, not added." }
  ],
  ask: ({ F, E, W, g }) => `In a DCF, final-year unlevered free cash flow is ${R.m(F)} and final-year EBITDA is ${R.m(E)}. With a WACC of ${R.pct(W, 2)} and perpetual growth of ${R.pct(g, 2)}, what EV/EBITDA multiple does the Gordon growth terminal value imply?`,
  why(i) { const { F, E, W, g } = i, TV = F * (1 + g) / (W - g); return `Terminal value = ${R.num(F)} × ${(1 + g).toFixed(4)} ÷ (${R.pct(W, 2)} − ${R.pct(g, 2)}) = ${R.m(TV, 1)}. Implied multiple = ${R.num(TV, 1)} ÷ ${R.num(E)} = ${R.x(this.solve(i))}. Compare it with where similar companies trade.`; },
  fmt: v => R.x(v)
});

// Valuation: PEG ratio.
Bank.calc("val", {
  lv: 1, unit: "x", tolerance: 0.01, dp: 2, prompt: "to 2 decimal places",
  make() {
    for (;;) {
      const PE = R.step(8, 40, 0.5), g = R.int(4, 30);
      const i = { PE, g };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.05)) return i;
    }
  },
  solve: ({ PE, g }) => PE / g,
  wrongs: ({ PE, g }) => [
    { value: g / PE, trap: "inverted", note: "That divides growth by the P/E. PEG = P/E ÷ growth." },
    { value: PE * g / 100, trap: "wrong-measure", note: "The P/E is divided by growth, not multiplied by it." },
    { value: PE / (g / 100), trap: "units", note: "Growth goes in as a number of percentage points (20, not 0.20)." }
  ],
  ask: ({ PE, g }) => `A company trades at ${R.num(PE, 1)}x forward earnings and analysts expect its EPS to grow ${g}% a year. What is its PEG ratio?`,
  why(i) { const { PE, g } = i; return `PEG = P/E ÷ growth = ${R.num(PE, 1)} ÷ ${g} = ${this.solve(i).toFixed(2)}. Below about 1.0 is often read as cheap for the growth, above as expensive.`; },
  fmt: v => v.toFixed(2)
});

// ECM: the new investor's stake after a funding round. Same redraw guard (mnaFar).
Bank.calc("cm", {
  lv: 1, unit: "%", tolerance: 0.1, dp: 1, prompt: "as a percentage, to 1 decimal place",
  make() {
    for (;;) {
      const M = R.step(4, 200, 1), I = R.step(1, 50, 0.5);
      if (I / M < 0.05 || I / M > 0.6) continue;
      const i = { M, I };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.005)) return i;
    }
  },
  solve: ({ M, I }) => I / (M + I),
  wrongs: ({ M, I }) => [
    { value: I / M, trap: "wrong-measure", note: "That divides by the pre-money. The stake is new money ÷ post-money (pre-money + new money)." },
    { value: M / (M + I), trap: "inverted", note: "That's the existing shareholders' stake after the round, not the new investor's." },
    { value: I / (M - I), trap: "sign", note: "The new money is added to the pre-money, not subtracted from it." }
  ],
  ask: ({ M, I }) => `A start-up raises ${R.m(I)} at a ${R.m(M)} pre-money valuation. What stake does the new investor own after the round?`,
  why(i) { const { M, I } = i; return `Post-money = ${R.num(M)} + ${R.num(I)} = ${R.m(M + I)}. Stake = ${R.num(I)} ÷ ${R.num(M + I)} = ${R.pct(this.solve(i))}.`; },
  fmt: v => R.pct(v)
});

// ECM: what a VC with a 1x non-participating preference receives on a sale.
Bank.calc("cm", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const I = R.step(2, 50, 1), p = R.step(0.1, 0.4, 0.05), X = Math.round(I / p * R.step(0.5, 2, 0.05) / 5) * 5;
      if (X <= I * 1.2) continue;
      const i = { I, p, X };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.5)) return i;
    }
  },
  solve: ({ I, p, X }) => Math.max(I, p * X),
  wrongs: ({ I, p, X }) => (I >= p * X ? [
    { value: p * X, trap: "missed-step", note: "That always converts. At this price the preference pays more, so the VC takes it." },
    { value: I + p * (X - I), trap: "wrong-measure", note: "Taking the preference and then sharing in the rest is participating preferred; this is non-participating." },
    { value: p * (X - I), trap: "concept", note: "The VC either takes its preference or converts and shares in all the proceeds; it doesn't just share in what's left." }
  ] : [
    { value: I, trap: "missed-step", note: "That always takes the preference. At this price converting pays more, so the VC converts." },
    { value: I + p * (X - I), trap: "wrong-measure", note: "Taking the preference and then sharing in the rest is participating preferred; this is non-participating." },
    { value: p * (X - I), trap: "concept", note: "Once it converts, the VC shares in all the proceeds, not just what's left after its preference." }
  ]),
  ask: ({ I, p, X }) => `A VC invested ${R.m(I)} for ${R.pct(p, 0)} of a company, with a 1x non-participating liquidation preference and no other preferred shares. The company is sold for ${R.m(X)}. How much does the VC receive?`,
  why(i) { const { I, p, X } = i; return `Take the preference: ${R.m(I)}. Or convert: ${R.pct(p, 0)} × ${R.num(X)} = ${R.m(p * X, 1)}. The VC takes the larger, ${R.m(this.solve(i), 1)}. Converting pays more once the sale price exceeds ${R.num(I)} ÷ ${R.pct(p, 0)} = ${R.m(I / p, 1)}.`; },
  fmt: v => R.m(v, 1)
});

// Restructuring: value available to creditors in a Chapter 7 liquidation analysis. Same redraw guard (mnaFar).
Bank.calc("rx", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const C = R.step(5, 50, 5), AR = R.step(20, 200, 5), INV = R.step(20, 200, 5), PPE = R.step(50, 400, 10), W = R.step(5, 40, 5);
      const r1 = R.pick([0.7, 0.75, 0.8]), r2 = R.pick([0.4, 0.5, 0.6]), r3 = R.pick([0.3, 0.4, 0.5]);
      const i = { C, AR, INV, PPE, W, r1, r2, r3 };
      if (this.solve(i) <= 5) continue;
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.5)) return i;
    }
  },
  solve: ({ C, AR, INV, PPE, W, r1, r2, r3 }) => C + AR * r1 + INV * r2 + PPE * r3 - W,
  wrongs: ({ C, AR, INV, PPE, W, r1, r2, r3 }) => [
    { value: C + AR + INV + PPE - W, trap: "missed-step", note: "That uses book values. In a liquidation, assets sell for much less, so each is cut to its expected recovery." },
    { value: C + AR * r1 + INV * r2 + PPE * r3, trap: "missed-step", note: "That leaves out the wind-down and trustee costs, which are paid before creditors." },
    { value: C + (AR + INV + PPE) * r1 - W, trap: "wrong-measure", note: "That uses the receivables recovery rate for everything. Inventory and PP&E usually recover much less." }
  ],
  ask: ({ C, AR, INV, PPE, W, r1, r2, r3 }) => `In a Chapter 7 liquidation analysis, a company has cash of ${R.m(C)}, receivables of ${R.m(AR)} (expected to recover ${R.pct(r1, 0)}), inventory of ${R.m(INV)} (recovering ${R.pct(r2, 0)}) and PP&E of ${R.m(PPE)} (recovering ${R.pct(r3, 0)}). Wind-down and trustee costs are ${R.m(W)}. How much is left for creditors?`,
  why(i) { const { C, AR, INV, PPE, W, r1, r2, r3 } = i; return `Recoveries: cash ${R.num(C)} + receivables ${R.num(AR * r1, 1)} + inventory ${R.num(INV * r2, 1)} + PP&E ${R.num(PPE * r3, 1)} = ${R.m(C + AR * r1 + INV * r2 + PPE * r3, 1)}. Less costs of ${R.num(W)} = ${R.m(this.solve(i), 1)}, which is then shared out by priority.`; },
  fmt: v => R.m(v, 1)
});

// Economics: breakeven inflation from a nominal Treasury yield and a TIPS real yield. Same redraw guard (mnaFar).
Bank.calc("econ", {
  lv: 2, unit: "%", tolerance: 0.01, dp: 2, prompt: "as a percentage, to 2 decimal places",
  make() {
    for (;;) {
      const n = R.step(0.02, 0.06, 0.0005), r = R.step(0.002, 0.025, 0.0005);
      const i = { n, r };
      if (n - r < 0.005) continue;
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.001)) return i;
    }
  },
  solve: ({ n, r }) => n - r,
  wrongs: ({ n, r }) => [
    { value: n + r, trap: "sign", note: "The real yield is subtracted from the nominal yield, not added." },
    { value: r, trap: "wrong-measure", note: "That's the real yield on TIPS, not the inflation the market expects." },
    { value: n, trap: "missed-step", note: "The nominal yield includes a real return as well as expected inflation; take the real yield off." }
  ],
  ask: ({ n, r }) => `A 10-year Treasury yields ${R.pct(n, 2)} and a 10-year TIPS yields ${R.pct(r, 2)}. What is the breakeven inflation rate?`,
  why(i) { const { n, r } = i; return `Breakeven inflation ≈ nominal yield − real yield = ${R.pct(n, 2)} − ${R.pct(r, 2)} = ${R.pct(this.solve(i), 2)}: the average inflation at which TIPS and ordinary Treasuries return the same.`; },
  fmt: v => R.pct(v, 2)
});

// Accounting: share premium (US: additional paid-in capital) booked on a funding round. Same redraw guard (mnaFar).
Bank.calc("acc", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const par = R.pick([0.5, 1, 2, 5, 10]), price = +(par * R.step(1.5, 7, 0.5)).toFixed(2), S = R.step(1, 20, 0.5), I = R.step(2, 40, 0.5);
      const i = { par, price, S, I };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.3)) return i;
    }
  },
  solve: ({ par, price, I }) => I - I / price * par,
  wrongs: ({ par, price, I }) => [
    { value: I, trap: "missed-step", note: "That books the whole raise as premium. The nominal value of the new shares goes to share capital first." },
    { value: I / price * par, trap: "wrong-measure", note: "That's the share capital: new shares × nominal value. The premium is the rest of the money raised." },
    { value: I + I / price * par, trap: "sign", note: "The share capital is part of the money raised, so it's taken off the raise, not added to it." }
  ],
  ask: ({ par, price, S, I }) => `A start-up has ${R.num(S)} million shares, each with a nominal (par) value of US$${R.num(par, par % 1 ? 1 : 0)}. It raises ${R.m(I)} at a pre-money valuation of ${R.m(S * price, 1)}. How much of the raise is booked as share premium (US: additional paid-in capital)?`,
  why(i) { const { par, price, S, I } = i, N = I / price; return `Price per share = pre-money ÷ shares = ${R.num(S * price, 1)} ÷ ${R.num(S)} = US$${R.num(price, 2)}. New shares = ${R.num(I)} ÷ ${R.num(price, 2)} = ${R.num(N, 3)}m. Share capital = ${R.num(N, 3)}m × US$${R.num(par, par % 1 ? 1 : 0)} = ${R.m(N * par, 2)}. Share premium = ${R.num(I)} − ${R.num(N * par, 2)} = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});

// Accounting: return on equity from ROCE, the cost of debt and leverage (the leverage effect). Same redraw guard (mnaFar).
Bank.calc("acc", {
  lv: 3, unit: "%", tolerance: 0.1, dp: 1, prompt: "as a percentage, to 1 decimal place",
  make() {
    for (;;) {
      const r = R.step(0.06, 0.15, 0.005), k = R.step(0.03, 0.09, 0.005), t = R.pick([0.21, 0.25, 0.3]), d = R.step(0.3, 1.5, 0.1);
      const i = { r, k, t, d }, a = this.solve(i), ws = this.wrongs(i).map(w => w.value);
      if (a <= 0.02 || ws.some(w => w <= 0.005)) continue;
      if (mnaFar(a, ws, 0.12, 0.005)) return i;
    }
  },
  solve: ({ r, k, t, d }) => r + (r - k * (1 - t)) * d,
  wrongs: ({ r, k, t, d }) => [
    { value: r + (r - k) * d, trap: "missed-step", note: "That uses the pre-tax cost of debt. Interest is tax-deductible, so the spread is ROCE − cost of debt × (1 − tax rate)." },
    { value: r, trap: "concept", note: "That's ROCE. With debt in the mix, ROE moves away from ROCE by the spread × net debt ÷ equity." },
    { value: r - (r - k * (1 - t)) * d, trap: "sign", note: "When ROCE beats the after-tax cost of debt, the leverage effect is added: debt lifts ROE." }
  ],
  ask: ({ r, k, t, d }) => `A company earns an after-tax return on capital employed (ROCE) of ${R.pct(r)}. Its net debt is ${R.num(d, 1)} times its book equity, its debt costs ${R.pct(k)} before tax, and the tax rate is ${R.pct(t, 0)}. What is its return on equity (ROE)?`,
  why(i) { const { r, k, t, d } = i, kd = k * (1 - t); return `After-tax cost of debt = ${R.pct(k)} × (1 − ${R.pct(t, 0)}) = ${R.pct(kd, 2)}. ROE = ROCE + (ROCE − after-tax cost of debt) × net debt ÷ equity = ${R.pct(r)} + (${R.pct(r)} − ${R.pct(kd, 2)}) × ${R.num(d, 1)} = ${R.pct(this.solve(i))}.`; },
  fmt: v => R.pct(v)
});

// Valuation: enterprise value from equity value with non-controlling interests, associates and a pension deficit. Same redraw guard (mnaFar).
Bank.calc("val", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const E = R.step(300, 1200, 10), D = R.step(100, 500, 10), C = R.step(20, 150, 5), N = R.step(30, 200, 5), A = R.step(40, 250, 5), P = R.step(60, 320, 10), t = R.pick([0.21, 0.25, 0.3]);
      const i = { E, D, C, N, A, P, t }, ws = this.wrongs(i).map(w => w.value);
      if (ws.some(w => w <= 0)) continue;
      if (mnaFar(this.solve(i), ws, 0.12, 1)) return i;
    }
  },
  solve: ({ E, D, C, N, A, P, t }) => E + D - C + N - A + P * (1 - t),
  wrongs: ({ E, D, C, N, A, P, t }) => [
    { value: E + D - C + N + A + P * (1 - t), trap: "sign", note: "Associates are subtracted: EBITDA leaves their profits out, so their value comes out of EV." },
    { value: E + D - C + N - A, trap: "missed-step", note: "That leaves out the pension deficit. An unfunded defined-benefit deficit is a debt-like claim, added after tax." },
    { value: E + D - C - N - A + P * (1 - t), trap: "sign", note: "Non-controlling interests are added: EBITDA includes 100% of the subsidiaries, including the part outsiders own." }
  ],
  ask: ({ E, D, C, N, A, P, t }) => `A company has a market capitalisation of ${R.m(E)}, gross debt of ${R.m(D)}, cash of ${R.m(C)}, non-controlling interests of ${R.m(N)} and stakes in associates worth ${R.m(A)}. Its defined-benefit pension plan has a deficit of ${R.m(P)} before tax, and the tax rate is ${R.pct(t, 0)}. What is its enterprise value?`,
  why(i) { const { E, D, C, N, A, P, t } = i; return `Pension deficit after tax = ${P} × (1 − ${R.pct(t, 0)}) = ${R.m(P * (1 - t), 1)}. EV = equity value + debt − cash + NCI − associates + pension deficit = ${E} + ${D} − ${C} + ${N} − ${A} + ${R.num(P * (1 - t), 1)} = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});

// M&A: the buyer's EPS after a deal paid partly in new shares and partly with new debt, as a percentage of its EPS before.
// Asked as a percentage so the answer is always positive. Same redraw guard (mnaFar).
Bank.calc("mna", {
  lv: 3, unit: "%", tolerance: 0.1, dp: 1, prompt: "as a percentage, to 1 decimal place",
  make() {
    for (;;) {
      const A = R.step(100, 500, 10), S = R.step(50, 400, 10), P = +(A * R.step(12, 25, 1) / S).toFixed(2);
      const X = Math.round(S * P * R.step(0.4, 1, 0.05) / 10) * 10, B = +(X / R.step(10, 25, 1)).toFixed(1);
      const s = R.pick([0.4, 0.5, 0.6]), k = R.step(0.05, 0.09, 0.005), t = R.pick([0.21, 0.25]);
      const i = { A, S, P, X, B, s, k, t }, ws = this.wrongs(i).map(w => w.value);
      if (ws.some(w => w <= 0)) continue;
      if (mnaFar(this.solve(i), ws, 0.12, 0.005)) return i;
    }
  },
  solve: ({ A, S, P, X, B, s, k, t }) => (A + B - (1 - s) * X * k * (1 - t)) / (S + s * X / P) / (A / S),
  wrongs: ({ A, S, P, X, B, s, k, t }) => [
    { value: (A + B - (1 - s) * X * k * (1 - t)) / S / (A / S), trap: "missed-step", note: "That divides by the buyer's old share count. The new shares issued to the target's holders share the earnings too." },
    { value: (A + B) / (S + s * X / P) / (A / S), trap: "missed-step", note: "That leaves out the after-tax interest on the new debt, which reduces combined net income." },
    { value: (A + B - X * k * (1 - t)) / (S + s * X / P) / (A / S), trap: "double-count", note: "That charges interest on the whole price, but only the part paid with debt is borrowed; the rest is paid in shares." }
  ],
  ask: ({ A, S, P, X, B, s, k, t }) => `A buyer earns net income of ${R.m(A)} on ${R.num(S)} million shares, which trade at US$${R.num(P, 2)}. It buys a target for ${R.m(X)} (equity value); the target earns ${R.m(B, 1)} of net income. It pays ${R.pct(s, 0)} in new shares at its current share price and the rest with new debt at ${R.pct(k)} before tax; the tax rate is ${R.pct(t, 0)}. With no synergies, what is the buyer's EPS after the deal as a percentage of its EPS before (above 100% means the deal adds to EPS)?`,
  why(i) { const { A, S, P, X, B, s, k, t } = i, N = s * X / P, I = (1 - s) * X * k * (1 - t), NI = A + B - I;
    return `EPS before = ${R.num(A)} ÷ ${R.num(S)} = US$${R.num(A / S, 3)}. New shares = ${R.pct(s, 0)} × ${R.num(X)} ÷ ${R.num(P, 2)} = ${R.num(N, 2)}m. After-tax interest = ${R.pct(1 - s, 0)} × ${R.num(X)} × ${R.pct(k)} × (1 − ${R.pct(t, 0)}) = ${R.m(I, 2)}. Combined net income = ${R.num(A)} + ${R.num(B, 1)} − ${R.num(I, 2)} = ${R.m(NI, 2)}. EPS after = ${R.num(NI, 2)} ÷ ${R.num(S + N, 2)} = US$${R.num(NI / (S + N), 3)}, which is ${R.pct(this.solve(i))} of EPS before${this.solve(i) >= 1 ? " (accretive)" : " (dilutive)"}.`; },
  fmt: v => R.pct(v)
});

// M&A: pre-tax synergies needed for a deal not to dilute the buyer's EPS. Same redraw guard (mnaFar).
Bank.calc("mna", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const E = R.step(1, 6, 0.05), Z = R.step(80, 500, 10), d = R.step(0.03, 0.2, 0.01), t = R.pick([0.21, 0.25, 0.3]);
      const Y = Math.round(E * Z * (1 - d) * 10) / 10;
      const i = { E, Z, Y, t };
      if (E * Z - Y < 2) continue;
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.3)) return i;
    }
  },
  solve: ({ E, Z, Y, t }) => (E * Z - Y) / (1 - t),
  wrongs: ({ E, Z, Y, t }) => [
    { value: E * Z - Y, trap: "missed-step", note: "That's the after-tax earnings gap. Synergies are taxed, so the pre-tax amount needed is the gap ÷ (1 − tax rate)." },
    { value: (E * Z - Y) * (1 - t), trap: "sign", note: "That takes tax off the gap instead of grossing it up. Pre-tax synergies must be bigger than the after-tax gap." },
    { value: (E * Z - Y) / t, trap: "inverted", note: "That divides by the tax rate. Divide by (1 − tax rate), the share of pre-tax synergies left after tax." }
  ],
  ask: ({ E, Z, Y, t }) => `A buyer's EPS is US$${R.num(E, 2)} before a deal. After the deal, with no synergies, the combined company will earn ${R.m(Y, 1)} of net income on ${R.num(Z)} million shares. The tax rate is ${R.pct(t, 0)}. What pre-tax synergies are needed for the deal not to reduce EPS?`,
  why(i) { const { E, Z, Y, t } = i; return `Net income needed to keep EPS at US$${R.num(E, 2)} = ${R.num(E, 2)} × ${R.num(Z)} = ${R.m(E * Z, 1)}. After-tax gap = ${R.num(E * Z, 1)} − ${R.num(Y, 1)} = ${R.m(E * Z - Y, 1)}. Pre-tax synergies = ${R.num(E * Z - Y, 1)} ÷ (1 − ${R.pct(t, 0)}) = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});

// M&A: the combined company's net debt after a deal paid partly in cash (borrowed) at a premium. Same redraw guard (mnaFar).
Bank.calc("mna", {
  lv: 2, unit: "US$m", tolerance: 0.05, dp: 1, prompt: "in US$m, to 1 decimal place",
  make() {
    for (;;) {
      const NA = R.step(100, 800, 10), EB = R.step(200, 1000, 10), NB = R.step(50, 500, 10), p = R.step(0.2, 0.4, 0.05), c = R.pick([0.4, 0.5, 0.6]);
      const i = { NA, EB, NB, p, c };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 1)) return i;
    }
  },
  solve: ({ NA, EB, NB, p, c }) => NA + NB + c * EB * (1 + p),
  wrongs: ({ NA, EB, NB, p, c }) => [
    { value: NA + c * EB * (1 + p), trap: "missed-step", note: "That leaves out the target's own net debt, which the buyer takes on with the company." },
    { value: NA + NB + c * EB, trap: "missed-step", note: "That leaves out the premium. The cash part is a share of the price paid, which includes the premium." },
    { value: NA + NB + EB * (1 + p), trap: "wrong-measure", note: "That borrows the whole price. Only the cash part adds debt; the rest is paid in new shares." }
  ],
  ask: ({ NA, EB, NB, p, c }) => `A buyer with net debt of ${R.m(NA)} acquires a target whose shares are worth ${R.m(EB)} in total and which has net debt of ${R.m(NB)}. It pays a ${R.pct(p, 0)} premium on the target's equity value, ${R.pct(c, 0)} in cash borrowed for the deal and the rest in new shares. Ignoring fees, what is the combined company's net debt?`,
  why(i) { const { NA, EB, NB, p, c } = i; return `Price paid = ${R.num(EB)} × ${(1 + p).toFixed(2)} = ${R.m(EB * (1 + p), 1)}. Borrowed for the cash part = ${R.pct(c, 0)} × ${R.num(EB * (1 + p), 1)} = ${R.m(c * EB * (1 + p), 1)}. Combined net debt = ${NA} + ${NB} + ${R.num(c * EB * (1 + p), 1)} = ${R.m(this.solve(i), 1)}.`; },
  fmt: v => R.m(v, 1)
});

// Market sizing: a city's yearly hotel room revenue. Same redraw guard (mnaFar).
Bank.calc("bt", {
  lv: 1, unit: "US$m", tolerance: 1, dp: 0, prompt: "in US$m, to the nearest million",
  make() {
    for (;;) {
      const N = R.step(20000, 150000, 5000), o = R.step(0.6, 0.85, 0.05), A = R.step(120, 400, 10);
      const i = { N, o, A };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 5)) return i;
    }
  },
  solve: ({ N, o, A }) => N * o * A * 365 / 1e6,
  wrongs: ({ N, o, A }) => [
    { value: N * A * 365 / 1e6, trap: "missed-step", note: "That leaves out occupancy: it assumes every room is sold every night." },
    { value: N * o * A * 30 / 1e6, trap: "units", note: "That's about a month. A year has 365 nights." },
    { value: N * o * o * A * 365 / 1e6, trap: "double-count", note: "That applies occupancy twice. Rooms × occupancy gives the rooms sold each night; multiply once by the rate." }
  ],
  ask: ({ N, o, A }) => `A city has ${R.num(N)} hotel rooms. Average occupancy is ${R.pct(o, 0)} and the average daily rate (ADR) is US$${A}. What is the city's yearly hotel room revenue?`,
  why(i) { const { N, o, A } = i; return `Rooms sold per night = ${R.num(N)} × ${R.pct(o, 0)} = ${R.num(N * o)}. Revenue per night = ${R.num(N * o)} × US$${A} = ${R.m(N * o * A / 1e6, 2)}. Per year = × 365 = ${R.m(this.solve(i), 0)} (about US$${R.num(this.solve(i) / 1000, 1)}bn).`; },
  fmt: v => R.m(v, 0)
});

// Market sizing: a yearly consumer market from population, the share who buy, purchases per week and price. Same redraw guard (mnaFar).
Bank.calc("bt", {
  lv: 1, unit: "US$m", tolerance: 1, dp: 0, prompt: "in US$m, to the nearest million",
  make() {
    const goods = [["a takeaway coffee", 3, 6, [1, 2, 3]], ["a lunchtime sandwich", 5, 10, [1, 2]], ["a fitness class", 15, 30, [0.5, 1, 2]], ["a bunch of flowers", 10, 25, [0.5]]];
    for (;;) {
      const [g, lo, hi, fs] = R.pick(goods), P = R.step(5, 60, 1), s = R.step(0.1, 0.5, 0.05), f = R.pick(fs), p = R.step(lo, hi, 0.5);
      const i = { g, P, s, f, p }, a = this.solve(i);
      if (a < 50 || a > 50000) continue;
      if (mnaFar(a, this.wrongs(i).map(w => w.value), 0.12, 5)) return i;
    }
  },
  solve: ({ P, s, f, p }) => P * s * f * p * 52,
  wrongs: ({ P, s, f, p }) => [
    { value: P * s * f * p, trap: "units", note: "That's the weekly spend. A year has 52 weeks." },
    { value: P * f * p * 52, trap: "missed-step", note: "That assumes everyone buys. Only the given share of people do." },
    { value: P * s * f * p * 12, trap: "units", note: "× 12 turns a monthly figure into a yearly one. A weekly figure needs × 52." }
  ],
  ask: ({ g, P, s, f, p }) => `A city region has ${P} million people. About ${R.pct(s, 0)} of them buy ${g} ${f === 0.5 ? "once every two weeks" : f === 1 ? "once a week" : f === 2 ? "twice a week" : f + " times a week"}, paying about US$${R.num(p, p % 1 ? 2 : 0)} each time. Roughly how much do they spend on it a year?`,
  why(i) { const { P, s, f, p } = i, buyers = P * s; return `Buyers = ${P}m × ${R.pct(s, 0)} = ${R.num(buyers, 1)}m. Weekly spend = ${R.num(buyers, 1)}m × ${f} × US$${R.num(p, p % 1 ? 2 : 0)} = ${R.m(buyers * f * p, 1)}. Yearly = × 52 = ${R.m(this.solve(i), 0)}.`; },
  fmt: v => R.m(v, 0)
});

// Case study: a paper LBO in six linked steps. Figures quoted by later steps are rounded as shown.
Bank.case("lbo", {
  lv: 3,
  make() {
    for (;;) {
      const E0 = R.step(40, 200, 5), m = R.step(8, 12, 0.5), L = R.step(4, 6, 0.5), g = R.step(0.03, 0.1, 0.01);
      if (L > m - 3) continue;
      const F = +((1 + g) ** 5).toFixed(3), X = Math.round(E0 * R.step(1, 2.5, 0.1) / 5) * 5, D0 = L * E0;
      if (X >= D0) continue;
      const E5 = +(E0 * F).toFixed(1), EVx = +(m * E5).toFixed(1), Eq0 = E0 * (m - L), EqX = +(EVx - (D0 - X)).toFixed(1), M = +(EqX / Eq0).toFixed(2);
      if (M < 1.6 || M > 5) continue;
      return { E0, m, L, g, F, X, D0, E5, EVx, Eq0, EqX, M };
    }
  },
  intro: ({ E0, m, L, g, F, X }) => `A private equity fund buys a company with EBITDA of ${R.m(E0)} for ${R.x(m)} EBITDA, funded with debt of ${R.x(L)} EBITDA and the rest in equity. EBITDA grows ${R.pct(g, 0)} a year, so over 5 years it grows by a factor of ${F.toFixed(3)} (${(1 + g).toFixed(2)} to the power of 5). Over the 5 years the company generates ${R.m(X)} of free cash flow after interest and tax, all used to repay debt. The fund sells at the end of year 5 at the same multiple.`,
  why: () => "The three drivers of the return are all here: EBITDA growth, debt paid down from cash flow and the exit multiple (unchanged in this case). Debt turns them into a bigger gain on a smaller equity cheque.",
  steps: [
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m",
      ask: () => "How much equity does the fund invest? Ignore fees.",
      solve: i => i.Eq0,
      wrongs: ({ E0, m, D0 }) => [
        { value: E0 * m, trap: "missed-step", note: "That's the whole price (the enterprise value). Debt pays for part of it; equity pays the rest." },
        { value: D0, trap: "inverted", note: "That's the debt. Equity is the price minus the debt." }],
      why: ({ E0, m, L, D0, Eq0 }) => `Price = ${R.x(m)} × ${R.num(E0)} = ${R.m(E0 * m, 1)}. Debt = ${R.x(L)} × ${R.num(E0)} = ${R.m(D0, 1)}. Equity = ${R.num(E0 * m, 1)} − ${R.num(D0, 1)} = ${R.m(Eq0, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: () => "What is EBITDA in year 5?",
      solve: i => i.E5,
      wrongs: ({ E0, g }) => [
        { value: E0, trap: "missed-step", note: "That's today's EBITDA. It grows for 5 years before the exit." },
        { value: E0 * (1 + 5 * g), trap: "wrong-measure", note: "That adds 5 years of growth without compounding. Use the factor given." }],
      why: ({ E0, F, E5 }) => `Year-5 EBITDA = ${R.num(E0)} × ${F.toFixed(3)} = ${R.m(E5, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: ({ m, E5 }) => `Year-5 EBITDA is ${R.m(E5, 1)}. Selling at the entry multiple of ${R.x(m)}, what is the exit enterprise value?`,
      solve: i => i.EVx,
      wrongs: ({ E0, m }) => [{ value: E0 * m, trap: "missed-step", note: "That's the entry enterprise value. The exit multiple applies to year-5 EBITDA." }],
      why: ({ m, E5, EVx }) => `Exit enterprise value = ${R.x(m)} × ${R.num(E5, 1)} = ${R.m(EVx, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: ({ EVx, D0, X }) => `The exit enterprise value is ${R.m(EVx, 1)}. Debt started at ${R.m(D0, 1)} and ${R.m(X)} of it has been repaid. What is the fund's equity worth at exit?`,
      solve: i => i.EqX,
      wrongs: ({ EVx, D0, X }) => [
        { value: EVx - D0, trap: "missed-step", note: "That deducts the original debt. Part of it has been repaid, so less is owed at exit." },
        { value: EVx, trap: "missed-step", note: "That's the enterprise value. The remaining debt is repaid from it before the fund gets anything." },
        { value: EVx - X, trap: "inverted", note: "That deducts the debt repaid. Deduct the debt still owed: the starting debt minus the repayments." }],
      why: ({ EVx, D0, X, EqX }) => `Debt at exit = ${R.num(D0, 1)} − ${R.num(X)} = ${R.m(D0 - X, 1)}. Equity at exit = ${R.num(EVx, 1)} − ${R.num(D0 - X, 1)} = ${R.m(EqX, 1)}.` },
    { unit: "x", dp: 2, tolerance: 0.02, prompt: "to 2 decimal places",
      ask: ({ Eq0, EqX }) => `The fund invested ${R.m(Eq0, 1)} and receives ${R.m(EqX, 1)} at exit. What is its money multiple (MOIC: multiple on invested capital)?`,
      solve: i => i.EqX / i.Eq0,
      wrongs: ({ E0, m, EVx, Eq0, EqX }) => [
        { value: EVx / (E0 * m), trap: "wrong-measure", note: "That's how much the enterprise value grew. The fund's multiple is on its equity, which grows faster thanks to debt." },
        { value: Eq0 / EqX, trap: "inverted", note: "That's flipped: divide what the fund receives by what it invested." }],
      why: ({ Eq0, EqX }) => `MOIC = ${R.num(EqX, 1)} ÷ ${R.num(Eq0, 1)} = ${R.x(EqX / Eq0, 2)}.` },
    { unit: "%", dp: 1, tolerance: 1, prompt: "as a percentage (a rule-of-thumb estimate within 1 point counts)",
      ask: ({ M }) => `A money multiple of ${R.x(M, 2)} over 5 years: roughly what IRR (internal rate of return, the yearly compound return) does it imply?`,
      solve: ({ M }) => M ** 0.2 - 1,
      wrongs: ({ M }) => [
        { value: (M - 1) / 5, trap: "wrong-measure", note: "That spreads the gain evenly over 5 years without compounding, which overstates the IRR." },
        { value: M / 5, trap: "concept", note: "Dividing the multiple by the years isn't a return. IRR = MOIC^(1/years) − 1." }],
      why: ({ M }) => `IRR = ${M.toFixed(2)}^(1/5) − 1 = ${R.pct(M ** 0.2 - 1)}. Rules of thumb over 5 years: 2x ≈ 15%, 2.5x ≈ 20%, 3x ≈ 25%.` }
  ]
});

// Case study: is a project worth doing? EBIT, free cash flow, present value, NPV and discounted payback.
Bank.case("cf", {
  lv: 2,
  make() {
    for (;;) {
      const N = R.pick([5, 8, 10]), D = R.step(2, 20, 1), C = N * D, E = Math.round(D * R.step(1.6, 3, 0.1)), Rv = Math.round(E / R.step(0.3, 0.6, 0.05)), K = Rv - E;
      const t = R.pick([0.21, 0.25, 0.3]), r = R.pick([0.06, 0.07, 0.08, 0.09, 0.1]);
      const AF = n => +((1 - (1 + r) ** -n) / r).toFixed(2), afs = Array.from({ length: N }, (_, k) => AF(k + 1));
      const EBIT = Rv - K - D, F = +(EBIT * (1 - t) + D).toFixed(2), PV = +(F * afs[N - 1]).toFixed(1), NPV = +(PV - C).toFixed(1);
      if (NPV < 0.08 * C || PV > 1.8 * C) continue;
      const pb = afs.findIndex(a => F * a >= C) + 1;
      if (pb < 2) continue;
      return { N, D, C, E, Rv, K, t, r, afs, EBIT, F, PV, NPV, pb };
    }
  },
  intro: ({ N, C, Rv, K, t, r }) => `A company can build a plant for ${R.m(C)}, paid upfront. It would earn revenue of ${R.m(Rv)} a year with cash operating costs of ${R.m(K)} a year, for ${N} years, with no value at the end. The plant is depreciated straight-line over the ${N} years. The tax rate is ${R.pct(t, 0)} and the company's WACC (weighted average cost of capital) is ${R.pct(r, 0)}. Ignore working capital.`,
  why: () => "NPV says whether the project adds value; discounted payback says how long the money is at risk. A positive NPV means the project pays back, in today's money, within its life.",
  steps: [
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m",
      ask: () => "What is the plant's yearly EBIT (operating profit)?",
      solve: i => i.EBIT,
      wrongs: ({ Rv, K, D }) => [
        { value: Rv - K, trap: "missed-step", note: "That's EBITDA. Depreciation is an operating cost too, so take it off for EBIT." },
        { value: Rv - D, trap: "missed-step", note: "That leaves out the cash operating costs." }],
      why: ({ C, N, D, Rv, K, EBIT }) => `Depreciation = ${R.num(C)} ÷ ${N} = ${R.m(D)} a year. EBIT = ${R.num(Rv)} − ${R.num(K)} − ${R.num(D)} = ${R.m(EBIT)}.` },
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: () => "What is the plant's yearly free cash flow?",
      solve: i => i.F,
      wrongs: ({ EBIT, t, D }) => [
        { value: EBIT * (1 - t), trap: "missed-step", note: "That's after-tax operating profit. Depreciation isn't a cash cost, so add it back." },
        { value: EBIT + D, trap: "missed-step", note: "That leaves out tax. Tax is paid on EBIT: free cash flow = EBIT × (1 − tax rate) + depreciation." }],
      why: ({ EBIT, t, D, F }) => `Free cash flow = EBIT × (1 − tax rate) + depreciation = ${R.num(EBIT)} × ${(1 - t).toFixed(2)} + ${R.num(D)} = ${R.m(F, 2)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: ({ N, r, F, afs }) => `Free cash flow is ${R.m(F, 2)} a year for ${N} years. The ${N}-year annuity factor at ${R.pct(r, 0)} is ${afs[N - 1].toFixed(2)} (the present value of US$1 a year for ${N} years). What is the present value of the free cash flows?`,
      solve: i => i.PV,
      wrongs: ({ F, N }) => [{ value: F * N, trap: "missed-step", note: "That adds the cash flows without discounting them. Money in later years is worth less today." }],
      why: ({ F, afs, N, PV }) => `Present value = ${R.num(F, 2)} × ${afs[N - 1].toFixed(2)} = ${R.m(PV, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: ({ PV, C }) => `The free cash flows are worth ${R.m(PV, 1)} today, and the plant costs ${R.m(C)} upfront. What is the project's NPV (net present value)?`,
      solve: i => i.NPV,
      wrongs: ({ PV, F, N, C }) => [
        { value: PV, trap: "missed-step", note: "That's the present value of the inflows. NPV takes off the upfront cost." },
        { value: F * N - C, trap: "missed-step", note: "That uses undiscounted cash flows. NPV discounts them first." }],
      why: ({ PV, C, NPV }) => `NPV = ${R.num(PV, 1)} − ${R.num(C)} = ${R.m(NPV, 1)}. It's positive, so the project earns more than its WACC and adds value.` },
    { unit: "years", dp: 0, tolerance: 0, prompt: "as a whole number of years",
      ask: ({ F, C, r, afs }) => `Annuity factors at ${R.pct(r, 0)}: ${afs.map((a, k) => `${k + 1} year${k ? "s" : ""} ${a.toFixed(2)}`).join(" · ")}. With ${R.m(F, 2)} of free cash flow a year and a ${R.m(C)} cost, in which year do the discounted cash flows first cover the cost (the discounted payback)?`,
      solve: i => i.pb,
      wrongs: ({ C, F }) => [{ value: Math.ceil(C / F), trap: "missed-step", note: "That's the simple payback, on undiscounted cash flows. Discounting makes it take longer." }],
      why: ({ F, C, afs, pb }) => `Cumulative discounted cash flow = ${R.num(F, 2)} × the annuity factor. Year ${pb - 1}: ${R.num(F, 2)} × ${afs[pb - 2].toFixed(2)} = ${R.m(F * afs[pb - 2], 1)}, short of ${R.m(C)}. Year ${pb}: ${R.num(F, 2)} × ${afs[pb - 1].toFixed(2)} = ${R.m(F * afs[pb - 1], 1)}, which covers it. Simple payback, without discounting, would be ${R.num(C / F, 1)} years.` }
  ]
});

// Case study: accretion/dilution walked through, from EPS before to the synergies needed. Only dilutive deals, so the
// last step always has an answer.
Bank.case("mna", {
  lv: 3,
  make() {
    for (;;) {
      const A = R.step(100, 500, 10), S = R.step(50, 400, 10), P = +(A * R.step(12, 25, 1) / S).toFixed(2);
      const X = Math.round(S * P * R.step(0.4, 1, 0.05) / 10) * 10, B = +(X / R.step(14, 30, 1)).toFixed(1);
      const s = R.pick([0.4, 0.5, 0.6]), k = R.step(0.05, 0.09, 0.005), t = R.pick([0.21, 0.25]);
      const E0 = +(A / S).toFixed(2), I = +((1 - s) * X * k * (1 - t)).toFixed(1), NI = +(A + B - I).toFixed(1), N = +(s * X / P).toFixed(2), E1 = +(NI / (S + N)).toFixed(2);
      if (E1 > E0 * 0.96) continue;
      const Syn = (E0 * (S + N) - NI) / (1 - t);
      if (Syn < 1) continue;
      return { A, S, P, X, B, s, k, t, E0, I, NI, N, E1, Syn };
    }
  },
  intro: ({ A, S, P, X, B, s, k, t }) => `A buyer earns net income of ${R.m(A)} on ${R.num(S)} million shares, which trade at US$${R.num(P, 2)}. It agrees to buy a target for ${R.m(X)} (equity value); the target earns ${R.m(B, 1)} of net income. It pays ${R.pct(s, 0)} in new shares at its current price and the rest with new debt at ${R.pct(k)} interest; the tax rate is ${R.pct(t, 0)}. Ignore synergies, fees and intangibles until the last step.`,
  why: () => "The deal costs the buyer after-tax interest and new shares; it buys the target's earnings. When the target's earnings don't cover that cost, EPS falls, and synergies have to close the gap.",
  steps: [
    { unit: "US$", dp: 2, tolerance: 0.01, prompt: "in US$ per share, to 2 decimal places",
      ask: () => "What is the buyer's earnings per share (EPS) before the deal?",
      solve: i => i.E0,
      wrongs: ({ P }) => [{ value: P, trap: "wrong-measure", note: "That's the share price. EPS = net income ÷ shares." }],
      why: ({ A, S, E0 }) => `EPS = ${R.num(A)} ÷ ${R.num(S)} = US$${R.num(E0, 2)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: () => "How much after-tax interest does the new debt cost each year?",
      solve: i => i.I,
      wrongs: ({ s, X, k, t }) => [
        { value: (1 - s) * X * k, trap: "missed-step", note: "That's before tax. Interest is tax-deductible, so its cost to net income is × (1 − tax rate)." },
        { value: X * k * (1 - t), trap: "double-count", note: "That charges interest on the whole price, but only the part not paid in shares is borrowed." }],
      why: ({ s, X, k, t, I }) => `Debt = ${R.pct(1 - s, 0)} × ${R.num(X)} = ${R.m((1 - s) * X)}. After-tax interest = ${R.num((1 - s) * X)} × ${R.pct(k)} × (1 − ${R.pct(t, 0)}) = ${R.m(I, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: ({ I }) => `The new debt costs ${R.m(I, 1)} a year after tax. What is the combined company's net income?`,
      solve: i => i.NI,
      wrongs: ({ A, B, I }) => [
        { value: A + B, trap: "missed-step", note: "That leaves out the interest on the new debt." },
        { value: A - I, trap: "missed-step", note: "That leaves out the target's net income, which the buyer now owns." }],
      why: ({ A, B, I, NI }) => `Combined net income = ${R.num(A)} + ${R.num(B, 1)} − ${R.num(I, 1)} = ${R.m(NI, 1)}.` },
    { unit: "US$", dp: 2, tolerance: 0.01, prompt: "in US$ per share, to 2 decimal places",
      ask: ({ NI, N, S, s, X, P }) => `Combined net income is ${R.m(NI, 1)}. The buyer issues ${R.num(N, 2)} million new shares (${R.pct(s, 0)} × ${R.num(X)} ÷ ${R.num(P, 2)}). What is EPS after the deal?`,
      solve: i => i.NI / (i.S + i.N),
      wrongs: ({ NI, S, A, B, N }) => [
        { value: NI / S, trap: "missed-step", note: "That divides by the old share count. The new shares share the earnings too." },
        { value: (A + B) / (S + N), trap: "missed-step", note: "That uses net income before the interest on the new debt." }],
      why: ({ NI, S, N, E0, E1 }) => `EPS after = ${R.num(NI, 1)} ÷ (${R.num(S)} + ${R.num(N, 2)}) = US$${R.num(E1, 2)}, against US$${R.num(E0, 2)} before: the deal is dilutive.` },
    { unit: "US$m", dp: 1, tolerance: 0.15, prompt: "in US$m, to 1 decimal place",
      ask: ({ E0, NI, S, N, t }) => `EPS was US$${R.num(E0, 2)} before the deal. After it, net income is ${R.m(NI, 1)} on ${R.num(S + N, 2)} million shares. The tax rate is ${R.pct(t, 0)}. What pre-tax synergies would bring EPS back to US$${R.num(E0, 2)}?`,
      solve: i => i.Syn,
      wrongs: ({ Syn, t }) => [
        { value: Syn * (1 - t), trap: "missed-step", note: "That's the after-tax gap. Synergies are taxed, so the pre-tax amount = gap ÷ (1 − tax rate)." },
        { value: Syn * (1 - t) ** 2, trap: "sign", note: "That takes tax off the gap instead of grossing it up." }],
      why: ({ E0, NI, S, N, t, Syn }) => `Net income needed = US$${R.num(E0, 2)} × ${R.num(S + N, 2)}m = ${R.m(E0 * (S + N), 1)}. After-tax gap = ${R.num(E0 * (S + N), 1)} − ${R.num(NI, 1)} = ${R.m(E0 * (S + N) - NI, 1)}. Pre-tax synergies = ${R.num(E0 * (S + N) - NI, 1)} ÷ (1 − ${R.pct(t, 0)}) = ${R.m(Syn, 1)}.` }
  ]
});

// Case study: a hotel from rooms to value, through RevPAR, revenue, GOP, GOPPAR and NOI.
Bank.case("hk", {
  lv: 2,
  make() {
    const N = R.step(100, 600, 10), o = R.step(0.6, 0.85, 0.05), A = R.step(120, 450, 5), rs = R.pick([0.55, 0.6, 0.65, 0.7]);
    const gm = R.step(0.3, 0.45, 0.01), c = R.step(0.06, 0.09, 0.005);
    const RP = +(o * A).toFixed(2), RR = +(N * RP * 365 / 1e6).toFixed(2), TR = +(RR / rs).toFixed(2), GOP = +(TR * gm).toFixed(2);
    const GPPAR = GOP * 1e6 / (N * 365), NOI = +(GOP - 0.07 * TR).toFixed(2), V = Math.round(NOI * 1e6 / c / N / 1000) * 1000; // value per key, to the nearest US$1,000
    return { N, o, A, rs, gm, c, RP, RR, TR, GOP, GPPAR, NOI, V };
  },
  intro: ({ N, o, A, rs, gm, c }) => `A ${N}-room hotel runs at ${R.pct(o, 0)} occupancy with an average daily rate (ADR) of US$${A}. Rooms make up ${R.pct(rs, 0)} of its total revenue (the rest is food, drinks and other services), and its gross operating profit (GOP) margin is ${R.pct(gm, 0)} of total revenue. The owner pays a base management fee of 3% and sets aside a 4% reserve for furniture, fixtures and equipment (FF&E), both on total revenue. Similar hotels sell at a ${R.pct(c, 1)} cap rate on net operating income (NOI).`,
  why: () => "RevPAR drives room revenue; the revenue mix and the GOP margin turn it into profit; fees and the FF&E reserve leave NOI, which the cap rate turns into value.",
  steps: [
    { unit: "US$", dp: 2, tolerance: 0.01, prompt: "in US$, to 2 decimal places",
      ask: () => "What is the hotel's RevPAR (revenue per available room)?",
      solve: i => i.RP,
      wrongs: ({ A, o }) => [
        { value: A, trap: "missed-step", note: "That's the ADR. RevPAR spreads room revenue over every available room, sold or not: occupancy × ADR." },
        { value: A / o, trap: "inverted", note: "Multiply by occupancy, don't divide: RevPAR is lower than ADR." }],
      why: ({ o, A, RP }) => `RevPAR = occupancy × ADR = ${R.pct(o, 0)} × US$${A} = US$${R.num(RP, 2)}.` },
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: ({ RP }) => `RevPAR is US$${R.num(RP, 2)}. What is the hotel's yearly room revenue?`,
      solve: i => i.RR,
      wrongs: ({ N, RP, A }) => [
        { value: N * RP * 30 / 1e6, trap: "units", note: "That's about a month. A year has 365 nights." },
        { value: N * A * 365 / 1e6, trap: "double-count", note: "That uses ADR on every room, as if the hotel were always full. RevPAR already allows for occupancy." }],
      why: ({ N, RP, RR }) => `Room revenue = ${N} rooms × US$${R.num(RP, 2)} × 365 = ${R.m(RR, 2)}.` },
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: ({ RR, rs }) => `Room revenue is ${R.m(RR, 2)}, which is ${R.pct(rs, 0)} of total revenue. What is total revenue?`,
      solve: i => i.TR,
      wrongs: ({ RR, rs }) => [{ value: RR * rs, trap: "inverted", note: "Rooms are a share of the total, so divide by that share: total revenue is bigger than room revenue." }],
      why: ({ RR, rs, TR }) => `Total revenue = ${R.num(RR, 2)} ÷ ${R.pct(rs, 0)} = ${R.m(TR, 2)}.` },
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: ({ TR, gm }) => `Total revenue is ${R.m(TR, 2)} and the GOP margin is ${R.pct(gm, 0)}. What is GOP (gross operating profit)?`,
      solve: i => i.GOP,
      wrongs: ({ RR, gm }) => [{ value: RR * gm, trap: "wrong-measure", note: "The GOP margin applies to total revenue, not room revenue." }],
      why: ({ TR, gm, GOP }) => `GOP = ${R.num(TR, 2)} × ${R.pct(gm, 0)} = ${R.m(GOP, 2)}.` },
    { unit: "US$", dp: 2, tolerance: 0.05, prompt: "in US$, to 2 decimal places",
      ask: ({ GOP, N }) => `GOP is ${R.m(GOP, 2)} for ${N} rooms. What is GOPPAR (GOP per available room per night)?`,
      solve: i => i.GPPAR,
      wrongs: ({ GOP, N }) => [{ value: GOP * 1e6 / N, trap: "units", note: "That's GOP per room per year. GOPPAR is per night: divide by 365 too." }],
      why: ({ GOP, N, GPPAR }) => `GOPPAR = ${R.num(GOP, 2)}m ÷ (${N} × 365) = US$${R.num(GPPAR, 2)}.` },
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: ({ GOP, TR }) => `GOP is ${R.m(GOP, 2)} and total revenue ${R.m(TR, 2)}. After the 3% base management fee and the 4% FF&E reserve, what is NOI (net operating income)?`,
      solve: i => i.NOI,
      wrongs: ({ GOP, RR, TR }) => [
        { value: GOP, trap: "missed-step", note: "That leaves out the management fee and the FF&E reserve, which owners deduct before valuing a hotel." },
        { value: GOP - 0.07 * RR, trap: "wrong-measure", note: "The fee and the reserve are charged on total revenue, not room revenue." }],
      why: ({ GOP, TR, NOI }) => `Fee and reserve = 7% × ${R.num(TR, 2)} = ${R.m(0.07 * TR, 2)}. NOI = ${R.num(GOP, 2)} − ${R.num(0.07 * TR, 2)} = ${R.m(NOI, 2)}.` },
    { unit: "US$", dp: 0, tolerance: 1000, prompt: "in US$, to the nearest US$1,000",
      ask: ({ NOI, c, N }) => `NOI is ${R.m(NOI, 2)} and similar hotels sell at a ${R.pct(c, 1)} cap rate. What is the hotel worth per room (per key)?`,
      solve: i => i.V,
      wrongs: ({ NOI, c, N, GOP }) => [
        { value: NOI * 1e6 / c, trap: "missed-step", note: "That's the whole hotel's value. Divide by the number of rooms for the value per key." },
        { value: GOP * 1e6 / c / N, trap: "wrong-measure", note: "That capitalises GOP. Buyers value the NOI left after fees and the FF&E reserve." }],
      why: ({ NOI, c, N, V }) => `Value = NOI ÷ cap rate = ${R.num(NOI, 2)} ÷ ${R.pct(c, 1)} = ${R.m(NOI / c, 1)}. Per key = ÷ ${N} ≈ US$${R.num(V)}.` }
  ]
});

// Case study: buying an office building, from rent to the year-1 cash-on-cash return.
Bank.case("rev", {
  lv: 2,
  make() {
    for (;;) {
      const SF = R.step(50000, 400000, 10000), rent = R.step(25, 80, 1), o = R.step(0.8, 0.95, 0.05), e = R.step(0.25, 0.4, 0.05);
      const c = R.step(0.05, 0.08, 0.0025), L = R.step(0.5, 0.65, 0.05), ir = R.step(0.045, 0.065, 0.0025);
      const GI = +(SF * rent * o / 1e6).toFixed(2), NOI = +(GI * (1 - e)).toFixed(2), V = +(NOI / c).toFixed(1), Eq = +(V * (1 - L)).toFixed(1);
      const Int = V * L * ir, CoC = (NOI - Int) / Eq;
      if (CoC < 0.02) continue;
      return { SF, rent, o, e, c, L, ir, GI, NOI, V, Eq, Int, CoC };
    }
  },
  intro: ({ SF, rent, o, e, c, L, ir }) => `An investor looks at an office building with ${R.num(SF)} sq ft of lettable space, rented at US$${rent} per sq ft a year and ${R.pct(o, 0)} occupied. Operating costs not recovered from tenants come to ${R.pct(e, 0)} of rental income. Similar buildings trade at a ${R.pct(c, 2)} cap rate. The investor would borrow ${R.pct(L, 0)} of the price (loan-to-value) on an interest-only loan at ${R.pct(ir, 2)}.`,
  why: () => "Income, less costs, gives NOI; the cap rate turns NOI into value; the loan decides how much equity goes in and what's left for it after interest.",
  steps: [
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: () => "What is the building's yearly rental income, after vacancy?",
      solve: i => i.GI,
      wrongs: ({ SF, rent }) => [{ value: SF * rent / 1e6, trap: "missed-step", note: "That assumes the building is full. Only the occupied space pays rent." }],
      why: ({ SF, rent, o, GI }) => `Rental income = ${R.num(SF)} × US$${rent} × ${R.pct(o, 0)} = ${R.m(GI, 2)}.` },
    { unit: "US$m", dp: 2, tolerance: 0.02, prompt: "in US$m, to 2 decimal places",
      ask: ({ GI, e }) => `Rental income is ${R.m(GI, 2)} and unrecovered costs are ${R.pct(e, 0)} of it. What is NOI (net operating income)?`,
      solve: i => i.NOI,
      wrongs: ({ GI, e }) => [
        { value: GI, trap: "missed-step", note: "That leaves out the operating costs the landlord pays." },
        { value: GI * e, trap: "inverted", note: "That's the costs. NOI is what's left: income × (1 − cost share)." }],
      why: ({ GI, e, NOI }) => `NOI = ${R.num(GI, 2)} × (1 − ${R.pct(e, 0)}) = ${R.m(NOI, 2)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.15, prompt: "in US$m, to 1 decimal place",
      ask: ({ NOI, c }) => `NOI is ${R.m(NOI, 2)} and the market cap rate is ${R.pct(c, 2)}. What is the building worth?`,
      solve: i => i.V,
      wrongs: ({ GI, c }) => [{ value: GI / c, trap: "wrong-measure", note: "That capitalises gross income. The cap rate applies to NOI, after costs." }],
      why: ({ NOI, c, V }) => `Value = NOI ÷ cap rate = ${R.num(NOI, 2)} ÷ ${R.pct(c, 2)} = ${R.m(V, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: ({ V, L }) => `The building costs ${R.m(V, 1)} and the loan covers ${R.pct(L, 0)} of it. How much equity does the investor put in? Ignore fees.`,
      solve: i => i.Eq,
      wrongs: ({ V, L }) => [
        { value: V * L, trap: "inverted", note: "That's the loan. Equity pays the rest: price × (1 − loan-to-value)." },
        { value: V, trap: "missed-step", note: "That's the whole price. The loan pays for most of it." }],
      why: ({ V, L, Eq }) => `Equity = ${R.num(V, 1)} × (1 − ${R.pct(L, 0)}) = ${R.m(Eq, 1)}.` },
    { unit: "%", dp: 1, tolerance: 0.1, prompt: "as a percentage, to 1 decimal place",
      ask: ({ Eq, V, L, ir, NOI }) => `The investor puts in ${R.m(Eq, 1)} and borrows ${R.m(V * L, 1)} at ${R.pct(ir, 2)}, interest only. NOI is ${R.m(NOI, 2)}. What is the year-1 cash-on-cash return (cash left after interest ÷ equity)?`,
      solve: i => i.CoC,
      wrongs: ({ NOI, Eq, V }) => [
        { value: NOI / Eq, trap: "missed-step", note: "That leaves out the interest, which is paid before the investor gets anything." },
        { value: NOI / V, trap: "wrong-measure", note: "That's the cap rate (the unlevered yield on the whole price), not the return on the investor's equity." }],
      why: ({ V, L, ir, NOI, Eq, Int, CoC }) => `Interest = ${R.num(V * L, 1)} × ${R.pct(ir, 2)} = ${R.m(Int, 2)}. Cash after interest = ${R.num(NOI, 2)} − ${R.num(Int, 2)} = ${R.m(NOI - Int, 2)}. Cash-on-cash = ${R.num(NOI - Int, 2)} ÷ ${R.num(Eq, 1)} = ${R.pct(CoC)}.` }
  ]
});

// FIG: net interest margin. Same redraw guard (mnaFar).
Bank.calc("fig", {
  lv: 1, unit: "%", tolerance: 0.02, dp: 2, prompt: "as a percentage, to 2 decimal places",
  make() {
    for (;;) {
      const A = R.step(20000, 200000, 1000), y = R.step(0.03, 0.07, 0.0025), II = Math.round(A * y / 10) * 10, IE = Math.round(II * R.step(0.35, 0.6, 0.05) / 10) * 10, TA = Math.round(A * R.step(1.15, 1.4, 0.05) / 1000) * 1000;
      const i = { A, II, IE, TA };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.0005)) return i;
    }
  },
  solve: ({ A, II, IE }) => (II - IE) / A,
  wrongs: ({ A, II, IE, TA }) => [
    { value: (II - IE) / TA, trap: "wrong-measure", note: "That divides by total assets. NIM uses the assets that earn interest, which leaves out cash, buildings and other non-earning assets." },
    { value: II / A, trap: "missed-step", note: "That's the yield on assets. NIM nets off the interest paid to depositors and lenders." },
    { value: IE / A, trap: "wrong-measure", note: "That's the cost of funding. NIM is income minus expense, over earning assets." }
  ],
  ask: ({ A, II, IE, TA }) => `A bank earns ${R.m(II)} of interest income and pays ${R.m(IE)} of interest expense. Its average interest-earning assets are ${R.m(A)}, out of total assets of ${R.m(TA)}. What is its net interest margin (NIM)?`,
  why(i) { const { A, II, IE } = i; return `Net interest income = ${R.num(II)} − ${R.num(IE)} = ${R.m(II - IE)}. NIM = ${R.num(II - IE)} ÷ ${R.num(A)} = ${R.pct(this.solve(i), 2)}.`; },
  fmt: v => R.pct(v, 2)
});

// FIG: the P/TBV justified by returns, growth and the cost of equity. Same redraw guard (mnaFar).
Bank.calc("fig", {
  lv: 2, unit: "x", tolerance: 0.02, dp: 2, prompt: "as a multiple, to 2 decimal places",
  make() {
    for (;;) {
      const r = R.step(0.06, 0.2, 0.005), k = R.step(0.09, 0.13, 0.005), g = R.step(0.02, 0.04, 0.005);
      const i = { r, k, g };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.03)) return i;
    }
  },
  solve: ({ r, k, g }) => (r - g) / (k - g),
  wrongs: ({ r, k, g }) => [
    { value: r / k, trap: "missed-step", note: "That leaves out growth. Take g off both the return and the cost of equity." },
    { value: (k - g) / (r - g), trap: "inverted", note: "That's flipped: returns go on top, the cost of equity underneath." },
    { value: (r - g) / k, trap: "missed-step", note: "Growth comes off the cost of equity too: (ROTE − g) ÷ (cost of equity − g)." }
  ],
  ask: ({ r, k, g }) => `A bank's return on tangible equity (ROTE) is ${R.pct(r)}. Its cost of equity is ${R.pct(k)} and its long-run growth rate is ${R.pct(g)}. What price to tangible book value (P/TBV) does that justify?`,
  why(i) { const { r, k, g } = i, v = this.solve(i); return `P/TBV = (ROTE − g) ÷ (cost of equity − g) = (${R.pct(r)} − ${R.pct(g)}) ÷ (${R.pct(k)} − ${R.pct(g)}) = ${R.x(v, 2)}. ${v >= 1 ? "Above 1.0x: the bank earns more than its cost of equity." : "Below 1.0x: the bank earns less than its cost of equity."}`; },
  fmt: v => R.x(v, 2)
});

// FIG: CET1 capital above the bank's target, which it could return to shareholders. Same redraw guard (mnaFar).
Bank.calc("fig", {
  lv: 2, unit: "US$m", tolerance: 1, dp: 0, prompt: "in US$m, to the nearest million",
  make() {
    for (;;) {
      const RWA = R.step(20000, 300000, 1000), c = R.step(0.12, 0.16, 0.0025), t = R.step(0.1, 0.125, 0.0025), at1 = Math.round(RWA * R.step(0.01, 0.02, 0.0025) / 10) * 10;
      if (c - t < 0.01) continue;
      const K = Math.round(RWA * c / 10) * 10, i = { RWA, K, t, at1 };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 5)) return i;
    }
  },
  solve: ({ RWA, K, t }) => K - t * RWA,
  wrongs: ({ RWA, K, t, at1 }) => [
    { value: K + at1 - t * RWA, trap: "wrong-measure", note: "That counts the AT1 bonds as CET1. A CET1 target can only be met with CET1 capital." },
    { value: t * RWA, trap: "inverted", note: "That's the CET1 the bank needs to hold. The excess is what it has above that." },
    { value: K, trap: "missed-step", note: "That's all its CET1. Only the part above the target could be returned." }
  ],
  ask: ({ RWA, K, t, at1 }) => `A bank has risk-weighted assets (RWA) of ${R.m(RWA)}, CET1 capital of ${R.m(K)} and ${R.m(at1)} of AT1 bonds. Its target CET1 ratio is ${R.pct(t, 2)}. How much CET1 capital does it hold above its target?`,
  why(i) { const { RWA, K, t } = i; return `CET1 needed = ${R.pct(t, 2)} × ${R.num(RWA)} = ${R.m(t * RWA)}. Excess = ${R.num(K)} − ${R.num(t * RWA)} = ${R.m(this.solve(i))}. That's the capital it could pay out through dividends or buybacks, if the regulator agrees.`; },
  fmt: v => R.m(v, 0)
});

// Case study: valuing a bank, from net interest income to value per share, via ROTE and the justified P/TBV.
Bank.case("fig", {
  lv: 3,
  make() {
    for (;;) {
      const A = R.step(20000, 200000, 1000), nim = R.step(0.015, 0.035, 0.0005), NII = +(A * nim).toFixed(1), F = Math.round(NII * R.step(0.3, 0.6, 0.05));
      const ci = R.step(0.5, 0.65, 0.01), LL = Math.round(A * R.step(0.002, 0.006, 0.0005)), t = R.pick([0.21, 0.25, 0.3]);
      const PBT = (NII + F) * (1 - ci) - LL, NI = +(PBT * (1 - t)).toFixed(1);
      const TBV = Math.round(A * R.step(0.06, 0.09, 0.005) / 10) * 10, GW = Math.round(TBV * R.step(0.1, 0.3, 0.05) / 10) * 10;
      const k = R.step(0.09, 0.13, 0.005), g = R.step(0.02, 0.035, 0.005), S = R.step(200, 3000, 10);
      const rote = +(NI / TBV).toFixed(3);
      if (NI <= 0 || rote < 0.06 || rote > 0.22) continue;
      const pt = +((rote - g) / (k - g)).toFixed(2), V = Math.round(pt * TBV), ps = V / S;
      if (ps < 2) continue;
      return { A, nim, NII, F, ci, LL, t, PBT, NI, TBV, GW, k, g, S, rote, pt, V, ps };
    }
  },
  intro: ({ A, nim, F, ci, LL, t, TBV, GW, k, g, S }) => `A bank has average interest-earning assets of ${R.m(A)} and a net interest margin (NIM) of ${R.pct(nim, 2)}. It earns ${R.m(F)} of fees. Its cost/income ratio is ${R.pct(ci, 0)} (operating costs ÷ revenue, where revenue = net interest income + fees), loan losses are ${R.m(LL)} and the tax rate is ${R.pct(t, 0)}. Shareholders' equity is ${R.m(TBV + GW)}, of which ${R.m(GW)} is goodwill. Its cost of equity is ${R.pct(k, 1)}, long-run growth is ${R.pct(g, 1)}, and it has ${R.num(S)} million shares.`,
  why: () => "A bank's value comes from what it earns on its tangible equity compared with what shareholders require. Margin, fees, cost discipline and loan losses set the return; the cost of equity sets the multiple.",
  steps: [
    { unit: "US$m", dp: 1, tolerance: 0.1, prompt: "in US$m, to 1 decimal place",
      ask: () => "What is its net interest income?",
      solve: i => i.NII,
      wrongs: ({ NII, F }) => [{ value: NII + F, trap: "double-count", note: "That adds the fees. Net interest income is the interest margin alone: assets × NIM." }],
      why: ({ A, nim, NII }) => `Net interest income = ${R.num(A)} × ${R.pct(nim, 2)} = ${R.m(NII, 1)}.` },
    { unit: "US$m", dp: 1, tolerance: 0.15, prompt: "in US$m, to 1 decimal place",
      ask: ({ NII, F, ci, LL, t }) => `Net interest income is ${R.m(NII, 1)} and fees are ${R.m(F)}. With a ${R.pct(ci, 0)} cost/income ratio, ${R.m(LL)} of loan losses and a ${R.pct(t, 0)} tax rate, what is net income?`,
      solve: i => i.NI,
      wrongs: ({ PBT, NII, F, ci, LL, t }) => [
        { value: PBT, trap: "missed-step", note: "That's profit before tax. Take tax off for net income." },
        { value: (NII + F) * (1 - ci) * (1 - t), trap: "missed-step", note: "That leaves out the loan losses, which come off after operating costs." },
        { value: (NII * (1 - ci) - LL) * (1 - t), trap: "missed-step", note: "That leaves out fee income, which is part of revenue." }],
      why: ({ NII, F, ci, LL, PBT, t, NI }) => `Revenue = ${R.num(NII, 1)} + ${R.num(F)} = ${R.m(NII + F, 1)}. Costs = ${R.pct(ci, 0)} of that = ${R.m((NII + F) * ci, 1)}. Pre-tax profit = ${R.num(NII + F, 1)} − ${R.num((NII + F) * ci, 1)} − ${R.num(LL)} = ${R.m(PBT, 1)}. Net income = × (1 − ${R.pct(t, 0)}) = ${R.m(NI, 1)}.` },
    { unit: "%", dp: 1, tolerance: 0.1, prompt: "as a percentage, to 1 decimal place",
      ask: ({ NI, TBV, GW }) => `Net income is ${R.m(NI, 1)}. Equity is ${R.m(TBV + GW)}, including ${R.m(GW)} of goodwill. What is the return on tangible equity (ROTE)?`,
      solve: i => i.NI / i.TBV,
      wrongs: ({ NI, TBV, GW }) => [{ value: NI / (TBV + GW), trap: "wrong-measure", note: "That's return on equity. ROTE takes goodwill out of equity first." }],
      why: ({ NI, TBV, GW }) => `Tangible equity = ${R.num(TBV + GW)} − ${R.num(GW)} = ${R.m(TBV)}. ROTE = ${R.num(NI, 1)} ÷ ${R.num(TBV)} = ${R.pct(NI / TBV)}.` },
    { unit: "x", dp: 2, tolerance: 0.02, prompt: "as a multiple, to 2 decimal places",
      ask: ({ rote, k, g }) => `ROTE is ${R.pct(rote, 1)}, the cost of equity ${R.pct(k, 1)} and long-run growth ${R.pct(g, 1)}. What price to tangible book (P/TBV) does that justify?`,
      solve: ({ rote, k, g }) => (rote - g) / (k - g),
      wrongs: ({ rote, k, g }) => [
        { value: rote / k, trap: "missed-step", note: "That leaves out growth. Take g off both the return and the cost of equity." },
        { value: (k - g) / (rote - g), trap: "inverted", note: "That's flipped: returns go on top, the cost of equity underneath." }],
      why: ({ rote, k, g }) => `P/TBV = (${R.pct(rote, 1)} − ${R.pct(g, 1)}) ÷ (${R.pct(k, 1)} − ${R.pct(g, 1)}) = ${R.x((rote - g) / (k - g), 2)}.` },
    { unit: "US$m", dp: 0, tolerance: 1, prompt: "in US$m, to the nearest million",
      ask: ({ pt, TBV }) => `The justified P/TBV is ${R.x(pt, 2)} and tangible equity is ${R.m(TBV)}. What market value does that imply for the bank's equity?`,
      solve: i => i.pt * i.TBV,
      wrongs: ({ pt, TBV, GW }) => [
        { value: pt * (TBV + GW), trap: "wrong-measure", note: "That applies the multiple to book equity including goodwill. P/TBV applies to tangible equity." },
        { value: TBV, trap: "missed-step", note: "That's tangible book itself. Multiply by the P/TBV." }],
      why: ({ pt, TBV, V }) => `Implied value = ${R.x(pt, 2)} × ${R.num(TBV)} = ${R.m(V)}.` },
    { unit: "US$", dp: 2, tolerance: 0.02, prompt: "in US$ per share, to 2 decimal places",
      ask: ({ V, S }) => `The equity is worth ${R.m(V)} and there are ${R.num(S)} million shares. What is that per share?`,
      solve: i => i.V / i.S,
      wrongs: ({ TBV, S }) => [{ value: TBV / S, trap: "wrong-measure", note: "That's tangible book value per share. Use the implied market value." }],
      why: ({ V, S }) => `Value per share = ${R.num(V)} ÷ ${R.num(S)} = US$${R.num(V / S, 2)}.` }
  ]
});

// LBO: the value created by EBITDA growth in a value-creation bridge (at the entry multiple). Same redraw guard (mnaFar).
Bank.calc("lbo", {
  lv: 2, unit: "US$m", tolerance: 0.5, dp: 0, prompt: "in US$m, to the nearest million",
  make() {
    for (;;) {
      const E0 = R.step(30, 150, 5), m0 = R.step(6, 12, 0.5), m1 = R.step(6, 13, 0.5), E1 = Math.round(E0 * R.step(1.15, 1.8, 0.05) / 5) * 5;
      if (m1 === m0) continue;
      const i = { E0, m0, m1, E1 };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 5)) return i;
    }
  },
  solve: ({ E0, m0, E1 }) => (E1 - E0) * m0,
  wrongs: ({ E0, m0, m1, E1 }) => [
    { value: (E1 - E0) * m1, trap: "wrong-measure", note: "That values the growth at the exit multiple. The usual convention uses the entry multiple, so the multiple change is counted separately." },
    { value: Math.abs(E1 * m1 - E0 * m0), trap: "double-count", note: "That's the whole change in enterprise value, which also includes the change in multiple." },
    { value: E1 - E0, trap: "missed-step", note: "That's the EBITDA increase itself. It's worth that increase × the entry multiple." }
  ],
  ask: ({ E0, m0, m1, E1 }) => `A sponsor bought a company at ${R.x(m0)} EBITDA of ${R.m(E0)} and sold it at ${R.x(m1)} EBITDA of ${R.m(E1)}. In a value-creation bridge, how much equity value came from EBITDA growth (valued at the entry multiple)?`,
  why(i) { const { E0, m0, m1, E1 } = i; return `EBITDA growth = (${E1} − ${E0}) × ${R.x(m0)} = ${R.m(this.solve(i))}. The multiple change is counted separately: (${R.x(m1)} − ${R.x(m0)}) × ${E1} = ${(m1 - m0) < 0 ? "−" : ""}${R.m(Math.abs((m1 - m0) * E1))}.`; },
  fmt: v => R.m(v, 0)
});

// LBO: the share of the equity gain that came from paying down debt. Same redraw guard (mnaFar).
Bank.calc("lbo", {
  lv: 2, unit: "%", tolerance: 0.5, dp: 0, prompt: "as a percentage, to the nearest whole number",
  make() {
    for (;;) {
      const E0 = R.step(30, 150, 5), m0 = R.step(6, 11, 0.5), m1 = m0 + R.pick([0, 0.5, 1]), E1 = Math.round(E0 * R.step(1.1, 1.6, 0.05) / 5) * 5;
      const D0 = Math.round(E0 * m0 * R.step(0.45, 0.65, 0.05) / 10) * 10, D1 = Math.round(D0 * R.step(0.35, 0.8, 0.05) / 10) * 10;
      const i = { E0, m0, m1, E1, D0, D1 }, a = this.solve(i);
      if (a < 0.08 || a > 0.8 || this.wrongs(i).some(w => w.value <= 0)) continue;
      if (mnaFar(a, this.wrongs(i).map(w => w.value), 0.12, 0.02)) return i;
    }
  },
  solve: ({ E0, m0, m1, E1, D0, D1 }) => (D0 - D1) / ((E1 * m1 - D1) - (E0 * m0 - D0)),
  wrongs: ({ E0, m0, m1, E1, D0, D1 }) => [
    { value: (D0 - D1) / (E1 * m1 - D1), trap: "wrong-measure", note: "That divides by exit equity. The share is of the gain: exit equity − entry equity." },
    { value: (D0 - D1) / (E0 * m0 - D0), trap: "wrong-measure", note: "That divides by entry equity. The share is of the gain: exit equity − entry equity." },
    { value: (D0 - D1) / (E1 * m1 - E0 * m0), trap: "wrong-measure", note: "That divides by the change in enterprise value, which leaves out the debt paydown itself. Divide by the change in equity." }
  ],
  ask: ({ E0, m0, m1, E1, D0, D1 }) => `A sponsor bought a company at ${R.x(m0)} EBITDA of ${R.m(E0)} with net debt of ${R.m(D0)}, and sold it at ${R.x(m1)} EBITDA of ${R.m(E1)} with net debt of ${R.m(D1)}. What share of the equity gain came from paying down debt?`,
  why(i) { const { E0, m0, m1, E1, D0, D1 } = i, q0 = E0 * m0 - D0, q1 = E1 * m1 - D1; return `Entry equity = ${R.x(m0)} × ${E0} − ${D0} = ${R.m(q0)}. Exit equity = ${R.x(m1)} × ${E1} − ${D1} = ${R.m(q1)}. Gain = ${R.m(q1 - q0)}. Debt paydown = ${D0} − ${D1} = ${R.m(D0 - D1)}, so ${R.pct(this.solve(i), 0)} of the gain.`; },
  fmt: v => R.pct(v, 0)
});

// Sensitivity tables: reading a DCF value grid (WACC down the rows, growth across the columns). Same redraw guard (mnaFar).
// The answer is worked out from the rounded figures shown in the table, so reading the table gives exactly the answer.
const dcfGrid = ({ F, w0, g0 }) => {
  const ws = [-0.01, -0.005, 0, 0.005, 0.01].map(d => +(w0 + d).toFixed(4)), gs = [-0.005, 0, 0.005].map(d => +(g0 + d).toFixed(4));
  return { ws, gs, ev: ws.map(w => gs.map(g => Math.round(F / (w - g)))) };
};
Bank.calc("val", {
  lv: 2, unit: "%", tolerance: 0.1, dp: 1, prompt: "as a percentage, to 1 decimal place",
  make() {
    for (;;) {
      const F = R.step(40, 200, 5), w0 = R.step(0.07, 0.1, 0.005), g0 = R.step(0.015, 0.03, 0.005);
      if (w0 - g0 < 0.045) continue;
      const i = { F, w0, g0, ...dcfGrid({ F, w0, g0 }) };
      if (mnaFar(this.solve(i), this.wrongs(i).map(w => w.value), 0.12, 0.005)) return i;
    }
  },
  solve: ({ ev }) => (ev[2][1] - ev[4][1]) / ev[2][1],
  wrongs: ({ ev }) => [
    { value: (ev[2][1] - ev[4][1]) / ev[4][1], trap: "wrong-measure", note: "That divides by the new value. A fall is measured against the starting value." },
    { value: (ev[2][1] - ev[3][1]) / ev[2][1], trap: "missed-step", note: "That moves one row (0.5 points). A 1-point rise in WACC is two rows down." },
    { value: (ev[2][2] - ev[2][1]) / ev[2][1], trap: "inverted", note: "That reads across a row, which changes growth. A change in WACC means moving down a column." }
  ],
  table: ({ ws, gs, ev, F }) => ({
    caption: `Enterprise value (US$m) of US$${F}m of free cash flow next year, growing forever: EV = FCF ÷ (WACC − g)`,
    corner: "WACC ↓ · growth →",
    cols: gs.map(g => R.pct(g)), rows: ws.map((w, r) => ({ head: R.pct(w), cells: ev[r].map(v => R.num(v)) })), base: [2, 1]
  }),
  ask: ({ ws, gs }) => `Using the sensitivity table, by what percentage does enterprise value fall if WACC rises from ${R.pct(ws[2])} to ${R.pct(ws[4])}, with growth at ${R.pct(gs[1])}?`,
  why(i) { const { ws, gs, ev } = i; return `In the ${R.pct(gs[1])} growth column, EV goes from US$${R.num(ev[2][1])}m at ${R.pct(ws[2])} to US$${R.num(ev[4][1])}m at ${R.pct(ws[4])}. Fall = (${R.num(ev[2][1])} − ${R.num(ev[4][1])}) ÷ ${R.num(ev[2][1])} = ${R.pct(this.solve(i))}.`; },
  fmt: v => R.pct(v)
});

// Sensitivity tables: in an LBO IRR grid (entry multiple down the rows, exit multiple across), find the highest entry
// multiple that still clears a target IRR. Multiple choice only: the answer is a row of the table.
Bank.gen("val", () => {
  for (;;) {
    const b = R.step(8, 11, 0.5), D0 = R.step(4.5, 6, 0.5) * 100, D1 = D0 - R.step(150, 300, 10), gr = R.step(0.04, 0.08, 0.01), F = (1 + gr) ** 5;
    const mins = [-1, -0.5, 0, 0.5, 1].map(d => b + d), mouts = [-1, 0, 1].map(d => b + d);
    if (mins[0] * 100 - D0 < 120) continue;
    const irr = mins.map(mi => mouts.map(mo => ((mo * 100 * F - D1) / (mi * 100 - D0)) ** 0.2 - 1));
    const shown = irr.map(row => row.map(v => +(v * 100).toFixed(1)));
    const T = R.pick([15, 20, 25]), col = R.int(0, 2);
    const best = c => { let k = -1; shown.forEach((row, r) => { if (row[c] >= T) k = r; }); return k; };
    const k = best(col);
    if (k < 1 || k > 3) continue; // the answer has a row above it that fails, and a lower row
    const other = [0, 1, 2].filter(c => c !== col).map(best).find(x => x >= 0 && x !== k && x !== k + 1 && x !== 0);
    if (other === undefined) continue;
    const x = n => R.x(n);
    return { lv: 2, trap: ["concept", "wrong-measure", "concept"],
      q: `Using the sensitivity table, if the company is sold at ${x(mouts[col])} EBITDA, what is the highest entry multiple that still gives the sponsor an IRR of at least ${T}%?`,
      table: { caption: "Sponsor's IRR over 5 years, by entry multiple (rows) and exit multiple (columns)", corner: "Entry ↓ · exit →",
        cols: mouts.map(x), rows: mins.map((m, r) => ({ head: x(m), cells: shown[r].map(v => v.toFixed(1) + "%") })), base: [2, 1] },
      o: [x(mins[k]), x(mins[k + 1]), x(mins[other]), x(mins[0])],
      why: `In the ${x(mouts[col])} exit column, IRR is ${shown[k][col].toFixed(1)}% at ${x(mins[k])} entry and ${shown[k + 1][col].toFixed(1)}% at ${x(mins[k + 1])}, so ${x(mins[k])} is the highest entry multiple that clears ${T}%. Each extra half-turn paid at entry costs IRR, because the sponsor puts in more equity for the same exit.`,
      x: [`At ${x(mins[k + 1])} entry the IRR is ${shown[k + 1][col].toFixed(1)}%, just under ${T}%.`,
          `That's the answer for a different exit multiple column. Read the ${x(mouts[col])} column.`,
          `${x(mins[0])} clears ${T}%, but it isn't the highest entry multiple that does.`] };
  }
});
