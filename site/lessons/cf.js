// Lesson: Corporate finance. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("cf", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "The weighted average cost of capital (WACC) is the return a company must earn for all its investors."},
    {"kind": "formula", "title": "WACC", "text": "WACC = {{E // V}} × cost of equity + {{D // V}} × cost of debt × (1 − tax rate)", "note": "E = market value of equity (share price × shares); D = market value of debt; V = E + D. The cost of debt is the yield the company would pay on new debt today."},
    {"kind": "formula", "title": "Capital asset pricing model (CAPM)", "text": "Cost of equity = risk-free rate + β × (expected market return − risk-free rate)", "note": "The bracket is the equity risk premium (ERP): the extra return investors want for holding shares rather than government bonds, typically about 4–6% a year in the US. β (beta) measures how much the share moves with the market: 1.0 moves in line, 1.5 moves 50% more."},
    {"kind": "formula", "title": "Unlevering beta (D/E = the debt-to-equity ratio)", "text": "Unlevered β = {{levered β // 1 + (1 − tax rate) × D/E}}\nRelevered β = unlevered β × (1 + (1 − tax rate) × D/E)", "note": "D/E = debt ÷ equity at market values: the peer's own D/E when unlevering, your target D/E when relevering."},
    {"kind": "read", "text": "Debt is cheaper than equity because lenders are paid first and interest is tax-deductible, so its cost is taken after tax."},
    {"kind": "watch", "text": "Beta depends on leverage: more debt makes the shares riskier. So don't use one company's raw beta: take peers' betas, strip out their debt (unlever), average them, then add back your own target debt (relever)."},
    {"kind": "practice", "text": "WACC is the rate for unlevered free cash flow; a project creates value only if it earns more than its WACC."}
  ],
  "example": {
    "question": "A company is 60% equity and 40% debt at market value. Its cost of equity is 11%, its pre-tax cost of debt 6% and its tax rate 25%. What is its WACC?",
    "working": [
      "Equity part: 60% × 11% = 6.6%",
      "Debt part: 40% × 6% × (1 − 25%) = 1.8%",
      "WACC = 6.6% + 1.8% = 8.4%"
    ],
    "answer": "8.4%."
  },
  "source": {
    "text": "Aswath Damodaran, cost of capital data and notes (New York University's Stern School of Business, NYU Stern); Berk & DeMarzo, Corporate Finance (Pearson)",
    "url": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wacc.html"
  },
  "widget": {
    "type": "wacc",
    "values": {
      "we": 0.6,
      "ke": 0.11,
      "kd": 0.06,
      "t": 0.25
    }
  }
});
