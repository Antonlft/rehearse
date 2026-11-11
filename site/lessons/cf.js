// Lesson: Corporate finance. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("cf", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "The weighted average cost of capital (WACC) is the return a company must earn for all its investors."},
    {"kind": "formula", "title": "WACC", "text": "WACC = {{E // V}} × cost of equity + {{D // V}} × cost of debt × (1 − tax rate)", "note": "E, D = market values of equity and debt; V = E + D."},
    {"kind": "formula", "title": "CAPM", "text": "Cost of equity = risk-free rate + beta × equity risk premium"},
    {"kind": "read", "text": "Debt is cheaper than equity because lenders are paid first and interest is tax-deductible, so its cost is taken after tax."},
    {"kind": "watch", "text": "Beta should reflect the business's risk at its target capital structure: unlever peers' betas and relever at your own, rather than using one company's raw beta."},
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
    "text": "Aswath Damodaran, cost of capital data and notes (NYU Stern); Berk & DeMarzo, Corporate Finance (Pearson)",
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
