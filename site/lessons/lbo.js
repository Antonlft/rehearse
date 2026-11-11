// Lesson: LBO & private equity. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("lbo", {
  "status": "draft",
  "method": [
    {"section": "The deal"},
    {"kind": "idea", "text": "In a leveraged buyout (LBO), a private equity sponsor buys a company mostly with debt, repays that debt from the company's own cash flow, and sells after three to seven years."},
    {"kind": "formula", "text": "MOIC = {{exit equity // entry equity}}", "note": "IRR = MOIC^(1 ÷ years) − 1, when there are no cash flows in between."},
    {"kind": "how", "text": "Equity returns come from three sources: growing EBITDA, selling at a higher multiple than was paid, and paying down debt so that more of the exit value belongs to the equity."},
    {"kind": "read", "text": "Debt magnifies returns because the sponsor puts in less equity for the same business, and it magnifies losses too. The same MOIC over more years means a lower IRR."},
    {"kind": "watch", "text": "Don't rely on selling at a higher multiple. Conservative models exit at the entry multiple, so the deal has to work through EBITDA growth and debt paydown alone."},
    {"kind": "practice", "text": "Good candidates have steady cash flow, modest capex, little existing debt and room to improve operations."},
    {"section": "The fund behind the deal"},
    {"kind": "how", "title": "LPs and the GP", "text": "The money comes from a fund, a limited partnership. LPs (pension funds, insurers, endowments) commit capital that the GP calls as it invests. The GP charges a management fee of about 1.5–2% a year and earns carried interest, typically 20% of profits."},
    {"kind": "how", "title": "The waterfall", "text": "Under a whole-fund (European) waterfall, proceeds go first to return the LPs' capital, then to an 8% compounded preferred return, then to a GP catch-up until the GP has 20% of all profit; the rest is split 80/20."},
    {"kind": "practice", "text": "US$100m invested for five years that returns US$200m: capital back 100, preferred return 46.9, catch-up 11.7 to the GP, then 41.3 split 80/20. The GP's carry is US$20m, exactly 20% of the US$100m profit."}
  ],
  "example": {
    "question": "A sponsor buys a company with EBITDA of US$50m at 8x, funded with US$250m of debt. Five years later EBITDA is US$70m, it sells at 8x, and debt is down to US$150m. What are the MOIC and IRR?",
    "working": [
      "Entry: EV = 8 × 50 = US$400m; equity = 400 − 250 = US$150m",
      "Exit: EV = 8 × 70 = US$560m; equity = 560 − 150 = US$410m",
      "MOIC = 410 ÷ 150 = 2.73x",
      "IRR = 2.73^(1/5) − 1 ≈ 22.3%"
    ],
    "answer": "2.7x and about 22% a year. EBITDA growth added US$160m and debt paydown US$100m; the multiple added nothing."
  },
  "source": {
    "text": "Joshua Rosenbaum & Joshua Pearl, Investment Banking: Valuation, LBOs, M&A, and IPOs (Wiley): the LBO chapters"
  },
  "widget": {
    "type": "lboReturns",
    "values": {
      "e0": 50,
      "m0": 8,
      "lev": 5,
      "g": 0.0696,
      "m1": 8,
      "repay": 0.4,
      "n": 5
    }
  },
  "widgets": [
    { "type": "fundWaterfall", "values": { "cap": 100, "proc": 200, "n": 5, "pref": 0.08, "carry": 0.2, "cu": 1 } }
  ]
});
