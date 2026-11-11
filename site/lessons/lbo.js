// Lesson: LBO & private equity. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("lbo", {
  "status": "draft",
  "method": [
    {"section": "The deal"},
    {"kind": "idea", "text": "In a leveraged buyout (LBO), a private equity sponsor buys a company mostly with debt, repays that debt from the company's own cash flow, and sells after three to seven years."},
    {"kind": "formula", "title": "Multiple on invested capital (MOIC) and internal rate of return (IRR)", "text": "MOIC = {{exit equity // entry equity}}\nIRR = MOIC^(1/n) − 1", "note": "Equity = enterprise value − net debt, at entry and at exit. n = years held; the IRR formula assumes no cash flows in between."},
    {"kind": "how", "text": "Equity returns come from three sources: growing EBITDA (earnings before interest, tax, depreciation and amortisation), selling at a higher multiple than was paid, and paying down debt so that more of the exit value belongs to the equity."},
    {"kind": "read", "text": "Debt magnifies returns because the sponsor puts in less equity for the same business, and it magnifies losses too. The same MOIC over more years means a lower IRR."},
    {"kind": "watch", "text": "Don't rely on selling at a higher multiple. Conservative models exit at the entry multiple, so the deal has to work through EBITDA growth and debt paydown alone."},
    {"kind": "practice", "text": "Good candidates have steady cash flow, modest capex, little existing debt and room to improve operations."},
    {"section": "Where the return came from"},
    {"kind": "idea", "text": "A value-creation bridge splits the equity gain into its three drivers.\nIt shows whether a deal made money by improving the business, or by the market paying a higher multiple and by paying down debt."},
    {"kind": "formula", "title": "The three drivers", "text": "EBITDA growth = (exit EBITDA − entry EBITDA) × entry multiple\nMultiple change = (exit multiple − entry multiple) × exit EBITDA\nDebt paydown = entry net debt − exit net debt", "note": "The three add up exactly to exit equity − entry equity.\nMultiple = enterprise value ÷ EBITDA at that date; equity = enterprise value − net debt."},
    {"kind": "how", "text": "Work out enterprise value at entry and at exit (EBITDA × multiple), then equity = enterprise value − net debt.\nValue the EBITDA growth at the entry multiple, then the multiple change on exit EBITDA, so nothing is counted twice.\nDebt paydown is the cash the business generated to cut net debt, including any cash it built up."},
    {"kind": "read", "text": "Investors trust EBITDA growth from operational improvements most.\nMultiple expansion is largely the market's doing and may not repeat.\nDebt paydown is real cash, but its size mostly reflects how much debt the deal started with."},
    {"kind": "watch", "text": "The convention changes the story, not the total.\nExample: EBITDA goes from 50 to 70 and the multiple from 8x to 9x. Growth at the entry multiple = 20 × 8 = 160, multiple change = 1 × 70 = 70. Growth at the exit multiple = 20 × 9 = 180, multiple change = 1 × 50 = 50.\nBoth total 230, so say which convention you use."},
    {"kind": "practice", "text": "From the worked example below: EBITDA 50 → 70 at 8x both times, net debt 250 → 150.\nEBITDA growth = 20 × 8 = 160; multiple change = 0; debt paydown = 250 − 150 = 100.\nTotal 260 = exit equity 410 − entry equity 150."},
    {"section": "The fund behind the deal"},
    {"kind": "how", "title": "Limited partners (LPs) and the general partner (GP)", "text": "The money comes from a fund, a limited partnership. LPs (pension funds, insurers, endowments) commit capital that the GP calls as it invests. The GP charges a management fee of about 1.5–2% a year and earns carried interest, typically 20% of profits."},
    {"kind": "how", "title": "The waterfall", "text": "Under a whole-fund (European) waterfall, proceeds go first to return the LPs' capital, then to an 8% compounded preferred return, then to a GP catch-up until the GP has 20% of all profit; the rest is split 80/20."},
    {"kind": "practice", "text": "US$100m invested for five years that returns US$200m: capital back 100, preferred return 46.9, catch-up 11.7 to the GP, then 41.3 split 80/20. The GP's carry is US$20m, exactly 20% of the US$100m profit."}
  ],
  "example": {
    "question": "A sponsor buys a company with EBITDA of US$50m at 8x, funded with US$250m of debt. Five years later EBITDA is US$70m, it sells at 8x, and debt is down to US$150m. What are the MOIC and IRR?",
    "working": [
      "Entry: enterprise value (EV) = 8 × 50 = US$400m; equity = 400 − 250 = US$150m",
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
    { "type": "fundWaterfall", "values": { "cap": 100, "proc": 200, "n": 5, "pref": 0.08, "carry": 0.2, "cu": 1 } },
    { "type": "lboBridge", "values": { "e0": 50, "m0": 8, "d0": 250, "e1": 70, "m1": 8, "d1": 150 } }
  ]
});
