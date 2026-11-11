// Lesson: Economics & markets. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, title?, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("econ", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Central banks set short-term interest rates (in the US, the Federal Reserve's federal funds rate) to keep inflation near target: they raise rates to cool demand and cut them to support it."},
    {"kind": "how", "text": "Longer-term yields reflect expected future short rates plus a term premium for lending for longer."},
    {"kind": "read", "title": "The yield curve", "text": "The yield curve plots yields by maturity and normally slopes up. When short rates rise above long rates it's inverted, usually because markets expect rate cuts; in the US an inversion has often come before a recession."},
    {"kind": "formula", "title": "Real rate", "text": "Real rate = (1 + nominal) ÷ (1 + inflation) − 1", "note": "Roughly the nominal rate minus inflation."},
    {"kind": "read", "title": "Inflation", "text": "Headline CPI covers everything; core strips out food and energy to show the trend."},
    {"kind": "formula", "title": "Breakeven inflation", "text": "Breakeven inflation = nominal Treasury yield − TIPS real yield", "note": "A 4.3% Treasury and a 1.9% TIPS imply about 2.4% a year."},
    {"kind": "watch", "text": "When policy rates are already near zero, further cuts can stop working (a liquidity trap), so central banks turn to quantitative easing and forward guidance."},
    {"kind": "practice", "text": "Central banks steer short-term rates day to day through repo operations, and the VIX shows how much volatility the options market expects."}
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
