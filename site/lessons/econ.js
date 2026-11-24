// Lesson: Economics & markets. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("econ", {
  "status": "draft",
  "summary": [
    "Central banks raise interest rates to cool demand and inflation, and cut them to support growth.",
    "Long-term yields reflect where markets expect short rates to go, so an inverted curve often signals expected cuts and a slowdown.",
    "The real rate is the nominal rate after inflation: roughly nominal minus inflation, exactly (1 + nominal) ÷ (1 + inflation) − 1.",
    "With rates near zero, cuts can stop working, so central banks turn to quantitative easing: buying bonds to push long-term yields down."
  ],
  "method": [
    {"section": "Interest rates"},
    {"kind": "idea", "text": "Central banks set short-term interest rates (in the US, the Federal Reserve's federal funds rate) to keep inflation near target: they raise rates to cool demand and cut them to support it."},
    {"kind": "how", "text": "Longer-term yields reflect the short rates markets expect over the bond's life, plus a term premium: extra yield for tying money up for longer."},
    {"kind": "read", "text": "The yield curve plots yields by maturity and normally slopes up. When short rates rise above long rates it's inverted, usually because markets expect rate cuts; in the US an inversion has often come before a recession."},
    {"kind": "example", "text": "The 2-year Treasury yields 4.8% and the 10-year yields 4.2%: the curve is inverted by 0.6 points.\nMarkets expect the central bank to cut rates over the next few years, often because they expect the economy to slow."},
    {"kind": "practice", "text": "Central banks steer short-term rates day to day through repo operations: short-term loans to banks against government bonds.\nThe VIX (the Chicago Board Options Exchange's Volatility Index) shows how much volatility the options market expects for US shares over the next 30 days (the 'fear gauge')."},
    {"check": "econ-why-01"},
    {"section": "Inflation and real rates"},
    {"kind": "formula", "title": "Real rate", "text": "Real rate = {{1 + nominal rate // 1 + inflation}} − 1\nReal rate ≈ nominal rate − inflation"},
    {"kind": "formula", "title": "Breakeven inflation, from Treasury Inflation-Protected Securities (TIPS)", "text": "Breakeven inflation = nominal Treasury yield − TIPS real yield", "note": "TIPS are US Treasuries whose principal rises with inflation, so they pay a real yield. A 4.3% Treasury and a 1.9% TIPS imply expected inflation of about 2.4% a year."},
    {"kind": "read", "text": "Headline consumer price index (CPI) inflation covers everything; core strips out food and energy to show the trend."},
    {"kind": "example", "text": "A deposit pays 5% while inflation is 3%: the real rate is about 5% − 3% = 2%, or exactly 1.05 ÷ 1.03 − 1 = 1.94%."},
    {"kind": "watch", "text": "When policy rates are already near zero, further cuts can stop working (a liquidity trap), so central banks turn to quantitative easing and forward guidance."},
    {"check": "ec-24"}
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
