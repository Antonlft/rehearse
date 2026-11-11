// Lesson: LBO & private equity. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("lbo", {
  "status": "draft",
  "method": [
    "In a leveraged buyout a sponsor buys a company mostly with debt, repays that debt from the company's cash flow, and sells after three to seven years. Equity returns come from three sources: growing EBITDA, selling at a higher multiple than it paid, and paying down debt so that more of the exit value belongs to the equity.",
    "Debt magnifies returns because the sponsor puts in less equity for the same business; it magnifies losses too. Returns are judged on MOIC (the money multiple) and IRR (the annual rate): the same MOIC over more years means a lower IRR. Good candidates have steady cash flow, modest capex and room to improve operations.",
    "The sponsor's money comes from a fund, a limited partnership. LPs (pension funds, insurers, endowments) commit capital that the GP calls as it invests; the GP charges a management fee of about 1.5–2% a year and earns carried interest, typically 20% of profits. Under a whole-fund (European) waterfall, proceeds first return the LPs' capital, then pay an 8% compounded preferred return, then a GP catch-up until the GP has 20% of all profit, and the rest is split 80/20. For example, US$100m invested for five years that returns US$200m: capital back 100, preferred return 46.9, catch-up 11.7 to the GP, then the remaining 41.3 split 80/20, so the GP's carry is US$20m, exactly 20% of the US$100m profit."
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
