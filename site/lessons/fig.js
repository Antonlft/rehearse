// Lesson: Financial institutions (FIG). Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("fig", {
  "status": "draft",
  "method": [
    {"section": "1. Valuing a bank"},
    {"kind": "idea", "text": "Banks are valued on their equity, not on enterprise value. Interest is a bank's raw material: it pays interest to depositors and earns it on loans, so EBITDA and EV say little."},
    {"kind": "formula", "text": "P/TBV = {{ROTE − g // cost of equity − g}}", "note": "P/TBV = share price ÷ tangible book value per share. ROTE (return on tangible equity) = net income ÷ tangible equity, where tangible equity = equity − goodwill and other intangibles. g = long-run growth. The cost of equity comes from CAPM."},
    {"kind": "read", "text": "A bank that earns exactly its cost of equity on its tangible equity is worth its tangible book: 1.0x. Higher returns justify a premium, so a bank trading below book is one the market thinks earns less than its cost of equity."},
    {"kind": "watch", "text": "Don't value a bank with EV/EBITDA or a DCF of unlevered free cash flow: deposits and debt are part of how it operates, not just how it's financed."},
    {"kind": "practice", "text": "Use equity measures: P/E, price to tangible book (P/TBV) and dividend-based models.\nCheck capital strength with the CET1 ratio = common equity tier 1 capital ÷ risk-weighted assets. Regulators set minimums, and banks usually hold a buffer above them."},
    {"section": "2. Capital and who absorbs losses"},
    {"kind": "idea", "text": "Capital is what absorbs losses before depositors are hurt.\nRegulators require a minimum ratio of capital to risk-weighted assets, and banks hold a buffer above it."},
    {"kind": "formula", "title": "CET1 ratio", "text": "CET1 ratio = {{CET1 capital // risk-weighted assets}}", "note": "CET1 (common equity tier 1) = ordinary shares + retained earnings − goodwill and other deductions.\nRisk-weighted assets (RWA) = assets weighted by how risky they are: a government bond counts for little, an unsecured corporate loan for a lot."},
    {"kind": "formula", "title": "Excess capital", "text": "Excess CET1 = CET1 capital − target CET1 ratio × risk-weighted assets", "note": "The excess is what a bank could return through dividends or buybacks, if its regulator agrees."},
    {"kind": "how", "text": "CET1: equity, the first loss absorber.\nAT1 (additional tier 1): perpetual bonds that convert to shares or are written down if CET1 falls below a trigger.\nTier 2: dated subordinated bonds that absorb losses once the bank is failing.\nIn a failure, losses run from CET1 to AT1, Tier 2, senior bonds and, last, uninsured deposits; insured deposits are protected."},
    {"kind": "watch", "text": "AT1 holders can lose everything before shareholders in some regimes.\nExample: in 2023, Credit Suisse's AT1 bonds (about CHF 16bn) were written off while shareholders still received UBS shares, because of the bonds' terms and Swiss law."},
    {"section": "3. Insurers and asset managers"},
    {"kind": "formula", "title": "Combined ratio (non-life insurers)", "text": "Combined ratio = {{claims + expenses // net earned premiums}}", "note": "Below 100%: underwriting makes money before investment income. Above 100%: the insurer relies on investment income to make a profit."},
    {"kind": "formula", "title": "Asset manager revenue", "text": "Revenue = average assets under management × fee margin", "note": "Fee margin = revenue ÷ average assets under management (AUM), usually quoted in basis points (1 bp = 0.01%)."},
    {"kind": "how", "text": "Insurers: underwriting result (combined ratio) plus investment income; capital strength in Europe is the Solvency II ratio (own funds ÷ the solvency capital requirement). Life insurers are often valued on embedded value.\nAsset managers: AUM grows with net flows and market moves, revenue follows AUM, and costs are largely fixed, so profits swing with markets."},
    {"kind": "watch", "text": "Investment income doesn't go into the combined ratio, which measures underwriting only.\nExample: premiums US$1,000m, claims US$700m, expenses US$280m: combined ratio = 980 ÷ 1,000 = 98%, an underwriting profit of US$20m before any investment income."}
  ],
  "example": {
    "question": "A bank earns a 13% return on tangible equity (ROTE). Its cost of equity is 10% and its long-run growth is 2%. What P/TBV does that justify?",
    "working": [
      "P/TBV = (ROTE − g) ÷ (cost of equity − g)",
      "= (13% − 2%) ÷ (10% − 2%) = 11% ÷ 8%",
      "= 1.375x"
    ],
    "answer": "About 1.4x tangible book. The premium over 1.0x reflects returns above the cost of equity."
  },
  "source": {
    "text": "Aswath Damodaran, 'Valuing Financial Service Firms' and related notes (NYU Stern); capital rules from the BIS Basel Framework",
    "url": "https://pages.stern.nyu.edu/~adamodar/"
  },
  "widget": {
    "type": "ptbv",
    "values": {
      "rote": 0.13,
      "coe": 0.1,
      "g": 0.02
    }
  }
});
