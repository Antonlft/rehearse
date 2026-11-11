// Lesson: Financial institutions (FIG). Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("fig", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Banks are valued on their equity, not on enterprise value. Interest is a bank's raw material: it pays interest to depositors and earns it on loans, so EBITDA and EV say little."},
    {"kind": "formula", "text": "P/TBV = {{ROTE − g // cost of equity − g}}", "note": "P/TBV = share price ÷ tangible book value per share. ROTE (return on tangible equity) = net income ÷ tangible equity, where tangible equity = equity − goodwill and other intangibles. g = long-run growth. The cost of equity comes from CAPM."},
    {"kind": "read", "text": "A bank that earns exactly its cost of equity on its tangible equity is worth its tangible book: 1.0x. Higher returns justify a premium, so a bank trading below book is one the market thinks earns less than its cost of equity."},
    {"kind": "watch", "text": "Don't value a bank with EV/EBITDA or a DCF of unlevered free cash flow: deposits and debt are part of how it operates, not just how it's financed."},
    {"kind": "practice", "text": "Use equity measures: P/E, price to tangible book (P/TBV) and dividend-based models.\nCheck capital strength with the CET1 ratio = common equity tier 1 capital ÷ risk-weighted assets. Regulators set minimums, and banks usually hold a buffer above them."}
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
