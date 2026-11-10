// Lesson: Financial institutions (FIG). Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("fig", {
  "status": "draft",
  "method": [
    "Banks are valued on their equity, not on enterprise value. Interest is a bank's raw material: it pays interest to depositors and earns it on loans, so EBITDA and EV say little. Use equity measures instead: P/E, price to tangible book (P/TBV) and dividend-based models, and check capital strength through the CET1 ratio (common equity tier 1 ÷ risk-weighted assets).",
    "P/TBV is tied to returns. A bank that earns exactly its cost of equity on its tangible equity is worth its tangible book: 1.0x. Higher returns justify a premium, roughly P/TBV = (ROTE − g) ÷ (cost of equity − g). So a bank trading below book is one the market thinks earns less than its cost of equity."
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
