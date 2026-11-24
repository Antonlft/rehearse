/* Paper LBOs for the timed trainer: five kinds of short leveraged buyout, each worked on paper in about 10 minutes.
   All figures are original and random within sensible ranges. Every figure a later step quotes is rounded to 1 decimal
   place first, so the working shown always matches. Wrapped in a function so these helpers stay out of the global scope. */
(() => {
  const r1 = v => +v.toFixed(1);
  const fx = v => R.x(v, Number.isInteger(v) ? 0 : 1);
  const n = v => R.num(r1(v));
  // The yearly rate that turns the cash flows (year 0, 1, 2, ...) into zero, by halving the interval.
  const irrOf = flows => {
    let lo = -0.9, hi = 2;
    const npv = r => flows.reduce((s, cf, t) => s + cf / (1 + r) ** t, 0);
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (npv(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  const RULE = "On paper, use these 5-year rules of thumb and adjust between them: 1.5x ≈ 8%, 2x ≈ 15%, 2.5x ≈ 20%, 3x ≈ 25%, 4x ≈ 32%.";
  const INTRO = "A private equity fund buys a company and sells it at the end of year 5. Work it out on paper, without a calculator; rounding as you go is fine. EBITDA means earnings before interest, tax, depreciation and amortisation.";
  const NEXT = "Later steps use the right figures, so one slip doesn't spoil the rest.";

  // The usual deal: price, debt and equity at entry, EBITDA in years 1 to 5, debt repaid, exit equity, MOIC and IRR.
  // X = EBITDA growth a year in US$m (EBITDA in year t is E0 + t × X), so years 1 to 5 add up to 5 × E0 + 15 × X.
  function deal(E0, X, m, mx, L, c, extra = {}) {
    const EV = r1(m * E0), D0 = r1(L * E0), Eq0 = r1(EV - D0 + (extra.fee || 0)), E5 = r1(E0 + 5 * X), S = r1(5 * E0 + 15 * X);
    const P = r1(c * S), EVx = r1(mx * E5), EqX = r1(EVx - (D0 - P)), M = EqX / Eq0;
    return { E0, X, m, mx, L, c, EV, D0, Eq0, E5, S, P, EVx, EqX, M, IRR: M ** 0.2 - 1, ...extra };
  }
  const baseSheet = ({ E0, m, L, X, c }) => [
    ["EBITDA today", R.m(E0)],
    ["Purchase price", `${fx(m)} today's EBITDA`],
    ["Debt raised", `${fx(L)} today's EBITDA; the fund pays the rest with equity`],
    ["EBITDA growth", `+${R.m(X)} a year, so year 1 is ${R.m(E0 + X)}`],
    ["Cash to repay debt", `${R.pct(c, 0)} of each year's EBITDA (what's left after interest, tax, capital spending and working capital), all used to repay debt`]
  ];

  // Steps shared by several kinds.
  const stepEV = {
    unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
    ask: () => "What is the purchase price (the enterprise value, EV)?",
    solve: i => i.EV,
    wrongs: ({ D0, Eq0, m, E0, X }) => [
      { value: D0, trap: "wrong-measure", note: "That's the debt. The price is the purchase multiple times today's EBITDA." },
      { value: Eq0, trap: "wrong-measure", note: "That's the fund's equity: the price minus the debt." },
      { value: m * (E0 + X), trap: "wrong-measure", note: "That uses year-1 EBITDA. The price is set on today's EBITDA." }],
    why: ({ m, E0, EV }) => `${fx(m)} × ${n(E0)} = ${R.m(EV)}.`
  };
  const stepEquity = {
    unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
    ask: () => "How much equity does the fund put in?",
    solve: i => i.Eq0,
    wrongs: ({ EV, D0 }) => [
      { value: EV, trap: "missed-step", note: "That's the whole price. Debt pays for part of it; the fund's equity pays the rest." },
      { value: D0, trap: "inverted", note: "That's the debt. The equity is the price minus the debt." },
      { value: EV + D0, trap: "sign", note: "The debt is taken off the price, not added to it." }],
    why: ({ m, E0, EV, L, D0, Eq0 }) => `Price = ${fx(m)} × ${n(E0)} = ${R.m(EV)}. Debt = ${fx(L)} × ${n(E0)} = ${R.m(D0)}. Equity = ${n(EV)} − ${n(D0)} = ${R.m(Eq0)}.`
  };
  const stepE5 = {
    unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
    ask: () => "What is EBITDA in year 5?",
    solve: i => i.E5,
    wrongs: ({ E0, X }) => [
      { value: 5 * X, trap: "missed-step", note: "That's only the growth. Add it to today's EBITDA." },
      { value: E0 + 15 * X, trap: "double-count", note: "That adds 1 + 2 + 3 + 4 + 5 = 15 years of growth. EBITDA rises by the same amount each year, so after 5 years it is up 5 times that amount." },
      { value: E0 + 3 * X, trap: "wrong-measure", note: "That's the average EBITDA over years 1 to 5, not the year-5 figure." }],
    why: ({ E0, X, E5 }) => `${n(E0)} + 5 × ${n(X)} = ${R.m(E5)}.`
  };
  const stepRepaid = {
    unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
    ask: () => "How much debt is repaid over the 5 years?",
    solve: i => i.P,
    wrongs: ({ c, E0, E5, S }) => [
      { value: c * 5 * E0, trap: "missed-step", note: "That keeps EBITDA flat at today's level. It grows every year, so more cash comes in." },
      { value: c * 5 * E5, trap: "wrong-measure", note: "That uses year-5 EBITDA for every year. Years 1 to 4 are lower." },
      { value: S, trap: "missed-step", note: "That's the total EBITDA. Only part of it is left to repay debt, after interest, tax, capital spending and working capital." },
      { value: c * E5, trap: "missed-step", note: "That's one year's repayment. Debt is repaid every year for 5 years." }],
    why: ({ E0, X, E5, S, c, P }) => `EBITDA rises by the same amount each year, so the 5 years add up to 5 × the average year. The average is (year 1 + year 5) ÷ 2 = (${n(E0 + X)} + ${n(E5)}) ÷ 2 = ${n(S / 5)}, so the total is ${R.m(S)}. ${R.pct(c, 0)} of it = ${R.m(P)}.`
  };
  const stepExitEquity = {
    unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
    ask: () => "What is the fund's equity worth at exit?",
    solve: i => i.EqX,
    wrongs: ({ EVx, D0, P, mx, E0 }) => [
      { value: EVx - D0, trap: "missed-step", note: "That takes off all the original debt. Part of it has been repaid, so less is owed at exit." },
      { value: EVx, trap: "missed-step", note: "That's the whole exit price (enterprise value). The debt still owed is paid off first; the fund gets the rest." },
      { value: EVx - P, trap: "inverted", note: "That takes off the debt repaid. Take off the debt still owed: the original debt minus what was repaid." },
      { value: EVx - D0 - P, trap: "sign", note: "That takes off the debt repaid as well as the original debt. Repaying debt lowers what's owed, so it adds to the fund's equity." },
      { value: mx * E0 - (D0 - P), trap: "wrong-measure", note: "That prices the exit on today's EBITDA. The exit price is set on year-5 EBITDA." }],
    why: ({ mx, E5, EVx, D0, P, EqX }) => `Exit price = ${fx(mx)} × ${n(E5)} = ${R.m(EVx)}. Debt still owed = ${n(D0)} − ${n(P)} = ${R.m(D0 - P)}. Equity = ${n(EVx)} − ${n(D0 - P)} = ${R.m(EqX)}.`
  };
  const stepMoic = {
    unit: "x", dp: 2, tolerance: 0.05, prompt: "as a multiple, to 2 decimal places",
    ask: () => "What is the fund's multiple of invested capital (MOIC)?",
    solve: i => i.M,
    wrongs: ({ EqX, EV, Eq0, EVx }) => [
      { value: EqX / EV, trap: "wrong-measure", note: "That divides by the whole price. MOIC divides by the equity the fund put in." },
      { value: (EqX - Eq0) / Eq0, trap: "concept", note: "That's the profit as a multiple. MOIC counts all the money back, including the equity put in." },
      { value: EVx / EV, trap: "wrong-measure", note: "That's how much the enterprise value grew. The fund earns on its equity, which also gains from the debt repaid." }],
    why: ({ EqX, Eq0, M }) => `${n(EqX)} ÷ ${n(Eq0)} = ${R.x(M, 2)}.`
  };
  const stepIrr = {
    unit: "%", dp: 1, tolerance: 1.5, prompt: "as a percentage (within 1.5 points counts)",
    ask: () => "Roughly, what is the fund's internal rate of return (IRR)?",
    solve: i => i.IRR,
    wrongs: ({ M }) => [
      { value: (M - 1) / 5, trap: "concept", note: "That's the profit divided by 5 years. It ignores compounding, so it overstates the IRR." },
      { value: M ** 0.25 - 1, trap: "missed-step", note: "That compounds over 4 years. The fund holds for 5." },
      { value: M / 5, trap: "concept", note: "That divides the multiple by 5. The IRR is the yearly rate that grows 1 into the MOIC over 5 years." }],
    why: ({ M, IRR }) => `The IRR is ${R.x(M, 2)} to the power of 1/5, minus 1 = ${R.pct(IRR)}. ${RULE}`
  };

  Bank.paper("classic", {
    name: "The classic", blurb: "Entry, debt paydown, exit at the same multiple, then the fund's multiple and yearly return.", lv: 2, minutes: 10,
    make() {
      for (;;) {
        const E0 = R.pick([40, 50, 60, 80, 100, 120]), X = R.int(Math.max(2, Math.ceil(E0 * 0.04)), Math.floor(E0 * 0.12));
        const m = R.int(7, 11), L = R.step(3, 6, 0.5), c = R.pick([0.3, 0.4, 0.5]);
        if (L > m - 3) continue;
        const i = deal(E0, X, m, m, L, c);
        if (i.P >= i.D0 || i.M < 1.6 || i.M > 4) continue;
        return i;
      }
    },
    intro: () => INTRO,
    sheet: i => [...baseSheet(i), ["Exit", `end of year 5, at the same ${fx(i.m)} multiple`], ["Fees", "none"]],
    why: () => `Three things drive the return: EBITDA growth, debt repaid from cash flow, and the exit multiple (unchanged here). Debt turns them into a bigger gain on a smaller equity cheque. ${NEXT}`,
    steps: [stepEV, stepEquity, stepE5, stepRepaid, stepExitEquity, stepMoic, stepIrr]
  });

  Bank.paper("fees", {
    name: "Fees and a lower exit", blurb: "Deal fees paid with equity, and an exit one turn below the entry multiple.", lv: 2, minutes: 10,
    make() {
      for (;;) {
        const E0 = R.pick([40, 50, 60, 80, 100, 120]), X = R.int(Math.max(2, Math.ceil(E0 * 0.05)), Math.floor(E0 * 0.12));
        const m = R.int(8, 12), L = R.step(3.5, 6, 0.5), c = R.pick([0.3, 0.4, 0.5]), f = R.pick([0.02, 0.03]);
        if (L > m - 3) continue;
        const fee = r1(f * m * E0), i = deal(E0, X, m, m - 1, L, c, { fee, f });
        if (i.P >= i.D0 || i.M < 1.4 || i.M > 3.5) continue;
        return i;
      }
    },
    intro: () => INTRO,
    sheet: i => [...baseSheet(i), ["Fees", `${R.pct(i.f, 0)} of the purchase price, paid by the fund with extra equity`], ["Exit", `end of year 5, at ${fx(i.mx)} EBITDA (one turn below the entry multiple)`]],
    why: () => `Fees and a lower exit multiple both cut the return: fees raise the equity put in, and the lower multiple shrinks the exit price. EBITDA growth and debt paydown have to make up for them. ${NEXT}`,
    steps: [
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much are the fees?",
        solve: i => i.fee,
        wrongs: ({ f, D0, EV, E0 }) => [
          { value: f * D0, trap: "wrong-measure", note: "That's the fee on the debt only. The fee is a share of the whole purchase price." },
          { value: f * (EV - D0), trap: "wrong-measure", note: "That's the fee on the equity only. The fee is a share of the whole purchase price." },
          { value: f * E0, trap: "wrong-measure", note: "That's the fee on EBITDA. The fee is a share of the purchase price." }],
        why: ({ m, E0, EV, f, fee }) => `Price = ${fx(m)} × ${n(E0)} = ${R.m(EV)}. Fees = ${R.pct(f, 0)} × ${n(EV)} = ${R.m(fee)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much equity does the fund put in, fees included?",
        solve: i => i.Eq0,
        wrongs: ({ EV, D0, fee }) => [
          { value: EV - D0, trap: "missed-step", note: "That leaves out the fees. The fund pays them on top of the price, with equity." },
          { value: EV - D0 - fee, trap: "sign", note: "Fees add to what the fund pays; they aren't taken off." },
          { value: EV + fee, trap: "missed-step", note: "That forgets the debt, which pays for part of the price." },
          { value: D0 + fee, trap: "inverted", note: "That's the debt plus the fees. The equity is the price minus the debt, plus the fees." },
          { value: EV, trap: "missed-step", note: "That's the price alone. Debt pays for part of it; the fund pays the rest plus the fees." }],
        why: ({ EV, L, E0, D0, fee, Eq0 }) => `Debt = ${fx(L)} × ${n(E0)} = ${R.m(D0)}. Equity = price − debt + fees = ${n(EV)} − ${n(D0)} + ${n(fee)} = ${R.m(Eq0)}.` },
      stepE5, stepRepaid,
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "What is the exit price (enterprise value at exit)?",
        solve: i => i.EVx,
        wrongs: ({ m, mx, E5, E0 }) => [
          { value: m * E5, trap: "wrong-measure", note: "That uses the entry multiple. The exit is one turn lower." },
          { value: mx * E0, trap: "wrong-measure", note: "That uses today's EBITDA. The exit price is set on year-5 EBITDA." },
          { value: E5, trap: "missed-step", note: "That's year-5 EBITDA. Multiply it by the exit multiple." }],
        why: ({ mx, E5, EVx }) => `${fx(mx)} × ${n(E5)} = ${R.m(EVx)}.` },
      { ...stepExitEquity, why: ({ EVx, D0, P, EqX }) => `Debt still owed = ${n(D0)} − ${n(P)} = ${R.m(D0 - P)}. Equity = ${n(EVx)} − ${n(D0 - P)} = ${R.m(EqX)}.` },
      { ...stepMoic,
        wrongs: ({ EqX, EV, D0, Eq0 }) => [
          { value: EqX / (EV - D0), trap: "missed-step", note: "That leaves the fees out of the equity put in. The fund paid them, so they count." },
          { value: (EqX - Eq0) / Eq0, trap: "concept", note: "That's the profit as a multiple. MOIC counts all the money back, including the equity put in." },
          { value: EqX / EV, trap: "wrong-measure", note: "That divides by the whole price. MOIC divides by the equity the fund put in." }] },
      stepIrr]
  });

  Bank.paper("recap", {
    name: "Dividend recap", blurb: "The company borrows again in year 3 to pay the fund a dividend. Harder: the IRR needs the timing.", lv: 3, minutes: 12,
    make() {
      for (;;) {
        const E0 = R.pick([50, 60, 80, 100, 120]), X = R.int(Math.max(3, Math.ceil(E0 * 0.06)), Math.floor(E0 * 0.12));
        const m = R.int(8, 11), L = R.step(3.5, 5.5, 0.5), c = R.pick([0.4, 0.5]);
        if (L > m - 3) continue;
        const EV = r1(m * E0), D0 = r1(L * E0), Eq0 = r1(EV - D0), E3 = E0 + 3 * X, E5 = E0 + 5 * X;
        const S3 = 3 * E0 + 6 * X, P3 = r1(c * S3), D3 = r1(D0 - P3), N3 = r1(L * E3), Div = r1(N3 - D3);
        const S45 = 2 * E0 + 9 * X, P45 = r1(c * S45), D5 = r1(N3 - P45), EVx = r1(m * E5), EqX = r1(EVx - D5);
        const back = r1(Div + EqX), M = back / Eq0, IRR = irrOf([-Eq0, 0, 0, Div, 0, EqX]), naive = M ** 0.2 - 1;
        if (D3 <= 0 || D5 <= 0 || M < 1.8 || M > 5 || IRR - naive < Math.max(0.03, 0.12 * IRR)) continue;
        return { E0, X, m, L, c, EV, D0, Eq0, E3, E5, S3, P3, D3, N3, Div, S45, P45, D5, EVx, EqX, back, M, IRR, naive, P5: r1(c * (5 * E0 + 15 * X)) };
      }
    },
    intro: () => INTRO,
    sheet: i => [...baseSheet(i),
      ["Dividend recap", `at the end of year 3, the company borrows again to bring its debt back to ${fx(i.L)} that year's EBITDA, and pays the extra cash to the fund as a dividend`],
      ["Exit", `end of year 5, at the same ${fx(i.m)} multiple`], ["Fees", "none"]],
    why: () => `A dividend recap hands the fund cash early. In this simple version (the extra interest is ignored) the total cash back, and so the MOIC, is the same as without it, but money back sooner lifts the IRR. That's why funds use recaps when lenders allow. ${NEXT}`,
    steps: [
      stepEquity,
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much debt is still owed at the end of year 3, before the recap?",
        solve: i => i.D3,
        wrongs: ({ D0, P3, c, E0, X, P5 }) => [
          { value: P3, trap: "wrong-measure", note: "That's the debt repaid in years 1 to 3. Take it off the original debt to get what's still owed." },
          { value: D0 - P5, trap: "wrong-measure", note: "That's 5 years of repayment. The recap happens after 3." },
          { value: D0, trap: "missed-step", note: "That leaves out the debt repaid in years 1 to 3." },
          { value: D0 - c * 3 * E0, trap: "missed-step", note: "That keeps EBITDA flat at today's level. It grows every year, so more debt is repaid." }],
        why: ({ E0, X, E3, S3, c, P3, D0, D3 }) => `EBITDA in years 1 to 3: ${n(E0 + X)}, ${n(E0 + 2 * X)} and ${n(E3)}, ${R.m(S3)} in total. ${R.pct(c, 0)} of it = ${R.m(P3)} repaid. Still owed = ${n(D0)} − ${n(P3)} = ${R.m(D3)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How big is the dividend paid to the fund?",
        solve: i => i.Div,
        wrongs: ({ N3, D0, P3 }) => [
          { value: N3, trap: "missed-step", note: "That's all the new debt. Part of it repays the debt still owed; only the rest goes to the fund." },
          { value: N3 - D0, trap: "missed-step", note: "That takes off the original debt. By year 3 part of it was repaid, so less needs repaying from the new debt." },
          { value: P3, trap: "wrong-measure", note: "That's only the debt repaid so far. The new debt is also bigger because EBITDA grew." }],
        why: ({ E3, L, N3, D3, Div }) => `Year-3 EBITDA = ${R.m(E3)}. New debt = ${fx(L)} × ${n(E3)} = ${R.m(N3)}. It repays the ${R.m(D3)} still owed; the rest, ${n(N3)} − ${n(D3)} = ${R.m(Div)}, goes to the fund.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much debt is still owed at exit, after years 4 and 5?",
        solve: i => i.D5,
        wrongs: ({ N3, D3, P45 }) => [
          { value: N3, trap: "missed-step", note: "That leaves out the debt repaid in years 4 and 5." },
          { value: D3 - P45, trap: "missed-step", note: "That's the debt left without the recap. Debt went back up in year 3, before years 4 and 5 repaid some." }],
        why: ({ E0, X, E5, S45, c, P45, N3, D5 }) => `EBITDA in years 4 and 5: ${n(E0 + 4 * X)} + ${n(E5)} = ${R.m(S45)}. ${R.pct(c, 0)} of it = ${R.m(P45)} repaid. Still owed = ${n(N3)} − ${n(P45)} = ${R.m(D5)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "What is the fund's equity worth at exit?",
        solve: i => i.EqX,
        wrongs: ({ EVx, D0, P5, N3 }) => [
          { value: EVx - (D0 - P5), trap: "wrong-measure", note: "That's the exit equity without the recap. The recap left more debt to pay off at exit. (It does equal the total cash back, dividend included: in this simple version the recap moves cash earlier rather than adding to it.)" },
          { value: EVx, trap: "missed-step", note: "That's the whole exit price. The debt still owed is paid off first; the fund gets the rest." },
          { value: EVx - N3, trap: "missed-step", note: "That takes off the debt right after the recap. Years 4 and 5 repaid some of it." }],
        why: ({ m, E5, EVx, D5, EqX }) => `Exit price = ${fx(m)} × ${n(E5)} = ${R.m(EVx)}. Equity = ${n(EVx)} − ${n(D5)} = ${R.m(EqX)}.` },
      { unit: "x", dp: 2, tolerance: 0.05, prompt: "as a multiple, to 2 decimal places",
        ask: () => "What is the fund's multiple of invested capital (MOIC), dividend included?",
        solve: i => i.M,
        wrongs: ({ EqX, Eq0, back, EV }) => [
          { value: EqX / Eq0, trap: "missed-step", note: "That leaves out the dividend. MOIC counts all the cash the fund gets back." },
          { value: (back - Eq0) / Eq0, trap: "concept", note: "That's the profit as a multiple. MOIC counts all the money back, including the equity put in." },
          { value: back / EV, trap: "wrong-measure", note: "That divides by the whole price. MOIC divides by the equity the fund put in." }],
        why: ({ Div, EqX, back, Eq0, M }) => `Cash back = ${n(Div)} + ${n(EqX)} = ${R.m(back)}. MOIC = ${n(back)} ÷ ${n(Eq0)} = ${R.x(M, 2)}.` },
      { unit: "%", dp: 1, tolerance: 2, prompt: "as a percentage (within 2 points counts)",
        ask: () => "Roughly, what is the fund's internal rate of return (IRR)?",
        solve: i => i.IRR,
        wrongs: ({ naive, EqX, Eq0, M }) => [
          { value: naive, trap: "concept", note: "That treats all the cash as arriving at exit. The dividend comes in year 3, two years early, and money back sooner lifts the IRR." },
          { value: (EqX / Eq0) ** 0.2 - 1, trap: "missed-step", note: "That leaves out the dividend." },
          { value: (M - 1) / 5, trap: "concept", note: "That's the profit divided by 5 years. It ignores compounding and timing." }],
        why: ({ M, naive, Div, IRR, Eq0, EqX }) => { const g = 1 + IRR; return `With MOIC ${R.x(M, 2)}, all the cash at exit would give about ${R.pct(naive)}. But ${R.m(Div)} arrives in year 3, two years early, which lifts the IRR to about ${R.pct(IRR)}. Check: at that rate, ${n(Eq0)} grows to ${n(Eq0 * g ** 5)} by year 5, and the cash back is worth the same: ${n(Div)} × ${(g ** 2).toFixed(2)} (two more years) + ${n(EqX)} = ${n(Div * g ** 2 + EqX)}. On paper: start from the MOIC rule of thumb, then add a few points for the early cash.`; } }]
  });

  Bank.paper("bridge", {
    name: "Where the return comes from", blurb: "Split the fund's gain into EBITDA growth, a higher exit multiple and debt paydown.", lv: 2, minutes: 10,
    make() {
      for (;;) {
        const E0 = R.pick([40, 50, 60, 80, 100, 120]), X = R.int(Math.max(2, Math.ceil(E0 * 0.05)), Math.floor(E0 * 0.12));
        const m = R.int(7, 10), L = R.step(3, 5.5, 0.5), c = R.pick([0.3, 0.4, 0.5]), up = R.pick([0.5, 1]);
        if (L > m - 3) continue;
        const i = deal(E0, X, m, m + up, L, c), G = r1(i.EqX - i.Eq0), grow = r1(m * (i.E5 - E0)), mult = r1(up * i.E5);
        if (i.P >= i.D0 || G <= 0 || i.P / G < 0.15 || i.P / G > 0.6) continue;
        return { ...i, G, grow, mult, share: i.P / G };
      }
    },
    intro: () => INTRO,
    sheet: i => [...baseSheet(i).map(r => r[0] === "EBITDA growth" ? ["EBITDA growth", `+${R.m(i.X)} a year, so year 1 is ${R.m(i.E0 + i.X)} and year 5 is ${R.m(i.E5)}`] : r),
      ["Exit", `end of year 5, at ${fx(i.mx)} EBITDA (entry was ${fx(i.m)})`], ["Fees", "none"]],
    why: () => `The gain always splits into three parts: EBITDA growth (valued at the entry multiple), the change in multiple (on year-5 EBITDA) and debt paid down. Interviewers ask for this split to see whether a deal relies on a higher exit multiple. ${NEXT}`,
    steps: [
      stepEquity, stepRepaid,
      { ...stepExitEquity, why: ({ mx, E5, EVx, D0, P, EqX }) => `Exit price = ${fx(mx)} × ${n(E5)} = ${R.m(EVx)}. Debt still owed = ${n(D0)} − ${n(P)} = ${R.m(D0 - P)}. Equity = ${n(EVx)} − ${n(D0 - P)} = ${R.m(EqX)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "What is the fund's total gain?",
        solve: i => i.G,
        wrongs: ({ EqX, EVx, EV }) => [
          { value: EqX, trap: "missed-step", note: "That's the exit equity. The gain is that minus the equity put in." },
          { value: EVx - EV, trap: "missed-step", note: "That's only the rise in enterprise value. The debt repaid adds to the fund's gain too." },
          { value: EqX + EVx - EV, trap: "double-count", note: "That counts the rise in enterprise value twice: it is already inside the exit equity." }],
        why: ({ EqX, Eq0, G }) => `${n(EqX)} − ${n(Eq0)} = ${R.m(G)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much of the gain comes from EBITDA growth, valued at the entry multiple?",
        solve: i => i.grow,
        wrongs: ({ mx, m, E5, E0 }) => [
          { value: mx * (E5 - E0), trap: "wrong-measure", note: "That values the growth at the exit multiple. The question uses the entry multiple, so the change in multiple is counted on its own." },
          { value: E5 - E0, trap: "missed-step", note: "That's the EBITDA growth itself. Multiply by the multiple to get the value it adds." },
          { value: m * E5, trap: "wrong-measure", note: "That's the value of all year-5 EBITDA, not just the growth." }],
        why: ({ m, E5, E0, grow }) => `EBITDA grew by ${n(E5)} − ${n(E0)} = ${R.m(E5 - E0)}. At the entry multiple: ${fx(m)} × ${n(E5 - E0)} = ${R.m(grow)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much comes from the higher exit multiple?",
        solve: i => i.mult,
        wrongs: ({ mx, m, E0, E5, EVx, EV }) => [
          { value: (mx - m) * E0, trap: "wrong-measure", note: "That uses today's EBITDA. With growth valued at the entry multiple, the extra multiple applies to year-5 EBITDA." },
          { value: EVx - EV, trap: "double-count", note: "That's the whole change in enterprise value, which also includes the EBITDA growth." },
          { value: mx * E5, trap: "wrong-measure", note: "That's the whole exit price." }],
        why: ({ mx, m, E5, mult }) => `The multiple rose by ${fx(mx)} − ${fx(m)} = ${fx(mx - m)}. On year-5 EBITDA: ${fx(mx - m)} × ${n(E5)} = ${R.m(mult)}.` },
      { unit: "%", dp: 0, tolerance: 2, prompt: "as a percentage, to the nearest whole number",
        ask: () => "What share of the gain comes from paying down debt?",
        solve: i => i.share,
        wrongs: ({ P, EqX, Eq0, G, D0, EV }) => [
          { value: P / EqX, trap: "wrong-measure", note: "That's a share of the exit equity. The question asks for a share of the gain." },
          { value: P / Eq0, trap: "wrong-measure", note: "That's a share of the equity put in. The question asks for a share of the gain." },
          { value: (G - P) / G, trap: "inverted", note: "That's the share from EBITDA growth and the multiple together." },
          { value: P / D0, trap: "wrong-measure", note: "That's the share of the original debt that was repaid. The question asks for a share of the gain." },
          { value: P / EV, trap: "wrong-measure", note: "That's a share of the purchase price. The question asks for a share of the gain." }],
        why: ({ grow, mult, P, G, share }) => `Check that the parts add up: ${n(grow)} + ${n(mult)} + ${n(P)} = ${n(grow + mult + P)}, the ${R.m(G)} gain. Debt paydown is ${n(P)} ÷ ${n(G)} = ${R.pct(share, 0)} of it.` }]
  });

  Bank.paper("margin", {
    name: "Revenue growth and margins", blurb: "Start from revenue and an EBITDA margin that widens over the hold.", lv: 2, minutes: 10,
    make() {
      for (;;) {
        const R0 = R.step(200, 800, 50), mg0 = R.pick([0.1, 0.12, 0.15, 0.2]), F = R.pick([1.3, 1.4, 1.5, 1.6]), mg5 = +(mg0 + R.pick([0.02, 0.03, 0.05])).toFixed(2);
        const m = R.int(7, 11), L = R.step(3, 5.5, 0.5), c = R.pick([0.3, 0.4, 0.5]);
        if (L > m - 3) continue;
        const E0 = r1(R0 * mg0), E5 = r1(R0 * F * mg5), avg = r1((E0 + E5) / 2), S = r1(5 * avg), P = r1(c * S);
        const EV = r1(m * E0), D0 = r1(L * E0), Eq0 = r1(EV - D0), EVx = r1(m * E5), EqX = r1(EVx - (D0 - P)), M = EqX / Eq0;
        if (P >= D0 || M < 1.5 || M > 4) continue;
        return { R0, mg0, F, mg5, m, mx: m, L, c, E0, E5, avg, S, P, EV, D0, Eq0, EVx, EqX, M, IRR: M ** 0.2 - 1 };
      }
    },
    intro: () => INTRO,
    sheet: i => [
      ["Revenue today", R.m(i.R0)], ["EBITDA margin today", R.pct(i.mg0, 0)],
      ["Purchase price", `${fx(i.m)} today's EBITDA`], ["Debt raised", `${fx(i.L)} today's EBITDA; the fund pays the rest with equity`],
      ["Revenue growth", `revenue in year 5 is ${i.F.toFixed(1)}x today's`], ["EBITDA margin in year 5", R.pct(i.mg5, 0)],
      ["Cash to repay debt", `${R.pct(i.c, 0)} of each year's EBITDA, all used to repay debt. Take each year's EBITDA as the average of today's and year 5's`],
      ["Exit", `end of year 5, at the same ${fx(i.m)} multiple`], ["Fees", "none"]],
    why: () => `EBITDA grows from two sources here: more revenue and a wider margin. Splitting them shows how much of the plan rests on cost savings, which interviewers often push on. ${NEXT}`,
    steps: [
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "What is EBITDA today?",
        solve: i => i.E0,
        wrongs: ({ R0, mg5, F, mg0 }) => [
          { value: R0 * mg5, trap: "wrong-measure", note: "That uses the year-5 margin. Today's EBITDA uses today's margin." },
          { value: R0, trap: "missed-step", note: "That's revenue. EBITDA is revenue times the EBITDA margin." },
          { value: R0 * F * mg0, trap: "wrong-measure", note: "That uses year-5 revenue." }],
        why: ({ R0, mg0, E0 }) => `${n(R0)} × ${R.pct(mg0, 0)} = ${R.m(E0)}.` },
      stepEquity,
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "What is EBITDA in year 5?",
        solve: i => i.E5,
        wrongs: ({ R0, F, mg0, mg5 }) => [
          { value: R0 * F * mg0, trap: "missed-step", note: "That keeps today's margin. The margin widens by year 5." },
          { value: R0 * mg5, trap: "missed-step", note: "That uses today's revenue. Revenue grows by year 5." },
          { value: R0 * F, trap: "missed-step", note: "That's year-5 revenue. Multiply by the year-5 margin." }],
        why: ({ R0, F, mg5, E5 }) => `Year-5 revenue = ${n(R0)} × ${F.toFixed(1)} = ${R.m(R0 * F)}. EBITDA = ${n(R0 * F)} × ${R.pct(mg5, 0)} = ${R.m(E5)}.` },
      { unit: "US$m", dp: 1, tolerance: "1%", prompt: "in US$m",
        ask: () => "How much debt is repaid over the 5 years?",
        solve: i => i.P,
        wrongs: ({ c, E0, E5, S, avg }) => [
          { value: c * 5 * E0, trap: "missed-step", note: "That keeps EBITDA at today's level. It grows, so more cash comes in." },
          { value: c * 5 * E5, trap: "wrong-measure", note: "That uses year-5 EBITDA for every year. The earlier years are lower." },
          { value: S, trap: "missed-step", note: "That's the total EBITDA. Only part of it is left to repay debt." },
          { value: c * avg, trap: "missed-step", note: "That's one year's repayment. Debt is repaid every year for 5 years." }],
        why: ({ E0, E5, avg, S, c, P }) => `Average EBITDA = (${n(E0)} + ${n(E5)}) ÷ 2 = ${R.m(avg)}. Over 5 years: ${R.m(S)}. ${R.pct(c, 0)} of it = ${R.m(P)}.` },
      stepExitEquity, stepMoic, stepIrr]
  });
})();
