// Lesson: Economics & markets. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("econ", {
  "status": "draft",
  "method": [
    "Central banks set short-term interest rates (in the US, the Federal Reserve's federal funds rate) to keep inflation near target: they raise rates to cool demand and cut them to support it. Longer-term yields reflect expected future short rates plus a term premium for lending for longer.",
    "The yield curve plots yields by maturity and normally slopes up. When short rates rise above long rates the curve is inverted, usually because markets expect rate cuts; in the US an inversion has often come before a recession. The real rate is the nominal rate minus inflation, or exactly (1 + nominal) ÷ (1 + inflation) − 1."
  ],
  "example": {
    "question": "The 3-month Treasury bill yields 5.2% and the 10-year Treasury 4.3%, with inflation at 3%. What shape is the curve, and what is the 10-year real yield?",
    "working": [
      "Spread: 4.3% − 5.2% = −90bp, so the curve is inverted",
      "Real yield ≈ 4.3% − 3% = 1.3%",
      "Exactly: 1.043 ÷ 1.03 − 1 = 1.26%"
    ],
    "answer": "Inverted, by 90bp, with a 10-year real yield of about 1.3%."
  },
  "source": {
    "text": "US Department of the Treasury, Interest Rate Statistics (daily yield curves); Federal Reserve, Monetary Policy",
    "url": "https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics"
  },
  "widget": {
    "type": "yieldCurve",
    "values": {
      "s": 0.052,
      "l": 0.043
    }
  }
});
