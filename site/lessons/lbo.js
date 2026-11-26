// Lesson: LBO & private equity. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or labelled blocks { kind, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("lbo", {
  "status": "draft",
  "newQuestions": "2026-11-26",
  "summary": [
    "A private equity sponsor buys a company mostly with debt, repays the debt from the company's own cash and sells after three to seven years.",
    "Returns come from earnings before interest, tax, depreciation and amortisation (EBITDA) growth, debt paydown and any change in the multiple.",
    "Track both the money multiple and the internal rate of return (IRR): the multiple shows how much was made, the IRR how fast.",
    "A fund invests through a chain of holding companies, earns a fee plus a share of profits, and can move an asset it isn't ready to sell into a continuation fund."
  ],
  "method": [
    {"section": "The deal"},
    {"kind": "idea", "text": "In a leveraged buyout (LBO), a private equity sponsor buys a company mostly with debt, repays that debt from the company's own cash flow, and sells after three to seven years."},
    {"kind": "formula", "title": "Multiple on invested capital (MOIC) and internal rate of return (IRR)", "text": "MOIC = {{exit equity // entry equity}}\nIRR = MOIC^(1/n) − 1\nEquity = EBITDA × multiple − net debt", "note": "Use EBITDA, the multiple and net debt at entry, then at exit. n = years held; the IRR formula assumes no cash flows in between."},
    {"kind": "how", "text": "Equity returns come from three sources: growing EBITDA (earnings before interest, tax, depreciation and amortisation), selling at a higher multiple than was paid, and paying down debt so that more of the exit value belongs to the equity."},
    {"kind": "read", "text": "Debt magnifies returns because the sponsor puts in less equity for the same business, and it magnifies losses too. The same MOIC over more years means a lower IRR."},
    {"kind": "example", "text": "A sponsor buys a company for US$500m, with US$200m of equity and US$300m of debt. Five years later it sells for US$700m, with US$100m of debt left.\nExit equity = US$600m, so MOIC = 600 ÷ 200 = 3.0x, and IRR = 3.0^(1/5) − 1 ≈ 25%."},
    {"kind": "watch", "text": "Don't rely on selling at a higher multiple. Conservative models exit at the entry multiple, so the deal has to work through EBITDA growth and debt paydown alone."},
    {"kind": "practice", "text": "Good candidates have steady cash flow, modest capex, little existing debt and room to improve operations."},
    {"check": "lbo-why-01"},
    {"section": "Where the return came from"},
    {"kind": "idea", "text": "A value-creation bridge splits the equity gain into its three drivers.\nIt shows whether a deal made money by improving the business, or by the market paying a higher multiple and by paying down debt."},
    {"kind": "formula", "title": "The three drivers", "text": "EBITDA growth = (exit EBITDA − entry EBITDA) × entry multiple\nMultiple change = (exit multiple − entry multiple) × exit EBITDA\nDebt paydown = entry net debt − exit net debt", "note": "The three add up exactly to exit equity − entry equity.\nMultiple = enterprise value ÷ EBITDA at that date; equity = enterprise value − net debt."},
    {"kind": "how", "text": "Work out enterprise value at entry and at exit (EBITDA × multiple), then equity = enterprise value − net debt.\nValue the EBITDA growth at the entry multiple, then the multiple change on exit EBITDA, so nothing is counted twice.\nDebt paydown is the cash the business generated to cut net debt, including any cash it built up."},
    {"kind": "read", "text": "Investors trust EBITDA growth from operational improvements most.\nMultiple expansion is largely the market's doing and may not repeat.\nDebt paydown is real cash, but its size mostly reflects how much debt the deal started with."},
    {"kind": "example", "text": "From the worked example below: EBITDA 50 → 70 at 8x both times, net debt 250 → 150.\nEBITDA growth = 20 × 8 = 160; multiple change = 0; debt paydown = 250 − 150 = 100.\nTotal 260 = exit equity 410 − entry equity 150."},
    {"kind": "watch", "text": "The convention changes the story, not the total.\nExample: EBITDA goes from 50 to 70 and the multiple from 8x to 9x. Growth at the entry multiple = 20 × 8 = 160, multiple change = 1 × 70 = 70. Growth at the exit multiple = 20 × 9 = 180, multiple change = 1 × 50 = 50.\nBoth total 230, so say which convention you use."},
    {"check": "lbo-31"},
    {"section": "How lenders size and price the debt", "added": "2026-11-24"},
    {"kind": "idea", "text": "Lenders size the debt on what the company can carry, then price it for the risk. The sponsor's equity fills the rest of the price."},
    {"kind": "formula", "text": "Debt capacity = the lower of (leverage cap × EBITDA) and {{EBITDA // minimum interest cover × interest rate}}\nLeverage = {{debt // EBITDA}}\nInterest cover = {{EBITDA // interest}}\nFixed charge cover = {{EBITDA // interest + scheduled repayments}}", "note": "Leverage is quoted in turns of EBITDA (5.0x), for senior debt and for total debt. The leverage test caps debt as a multiple of earnings; the cover test makes sure earnings pay the interest with room to spare. Exact definitions are set in each loan agreement."},
    {"kind": "how", "text": "Leverage is quoted in turns of EBITDA, for senior debt and for total debt. Lenders also look at fixed charge cover (interest plus scheduled repayments) and how fast free cash flow can repay the debt.\nThe price is a margin over a base rate (SOFR in US dollars, SONIA in sterling), plus upfront fees or an original issue discount (OID), which lift the lender's return above the margin."},
    {"kind": "example", "text": "EBITDA is US$100m. Lenders cap leverage at 5.0x and want interest cover of at least 2.5x, at a 7% interest rate.\nLeverage test: 5.0 × 100 = US$500m. Cover test: 100 ÷ (2.5 × 7%) = US$571m.\nThe lower figure sets the debt: US$500m."},
    {"kind": "watch", "text": "When rates rise, the cover test bites first: at a 10% rate the same company supports only 100 ÷ (2.5 × 10%) = US$400m, so the sponsor needs more equity or a lower price."},
    {"check": "lbo-34"},
    {"section": "The fund behind the deal"},
    {"kind": "how", "title": "Limited partners (LPs) and the general partner (GP)", "text": "The money comes from a fund, a limited partnership. LPs (pension funds, insurers, endowments) commit capital that the GP calls as it invests. The GP charges a management fee of about 1.5–2% a year and earns carried interest, typically 20% of profits."},
    {"kind": "how", "title": "The waterfall", "text": "Under a whole-fund (European) waterfall, proceeds go first to return the LPs' capital, then to an 8% compounded preferred return, then to a GP catch-up until the GP has 20% of all profit; the rest is split 80/20."},
    {"kind": "example", "text": "US$100m invested for five years that returns US$200m: capital back 100, preferred return 46.9, catch-up 11.7 to the GP, then 41.3 split 80/20. The GP's carry is US$20m, exactly 20% of the US$100m profit."},
    {"check": "lbo-22"},
    {"section": "Structuring the buyout: holding companies and tax", "added": "2026-11-26"},
    {"kind": "idea", "text": "A buyout isn't one company buying another. The fund sets up a chain of new holding companies, so each kind of money sits at its own level and the interest can be set against the target's profits."},
    {"kind": "formula", "title": "The interest cap", "text": "Deductible net interest = the lower of net interest and 30% × tax EBITDA\nInterest refused this year = net interest − deductible net interest", "note": "Tax EBITDA is taxable profit before interest, depreciation and amortisation. Refused interest can usually be carried forward to a year with spare room. The EU rule allows a small safe harbour (up to €3m of net interest); the US rule is section 163(j), back on an EBITDA basis since 2025."},
    {"kind": "how", "numbered": true, "text": "The fund and the managers invest in TopCo: the ordinary shares, plus the fund's preference shares or loan notes. The management package sits here.\nTopCo owns MidCo, which can hold shareholder loans or borrow junior debt such as payment-in-kind (PIK) notes.\nMidCo owns BidCo, which borrows the senior debt and buys the target's shares.\nBidCo and the target join a tax group, merge, or move the debt down to the target (a debt pushdown), so the interest is deducted from the target's profits. Thresholds vary: for example, 80% ownership for a US consolidated return, 75% for UK group relief and 95% in France."},
    {"kind": "read", "text": "Why the layers: debt borrowed higher up is structurally junior to debt lower down, so each layer has its own ranking. Senior lenders also take security over the shares of BidCo and the target, so they can sell the whole group without a court process.\nShareholder loans: their interest is deductible only at an arm's-length rate, and anti-hybrid rules can refuse it.\nDeal fees: under International Financial Reporting Standards (IFRS), advisers' fees on the acquisition are expensed in the group accounts (IFRS 3); the fees for arranging the loans reduce the loan's carrying amount and are spread over its life (IFRS 9)."},
    {"kind": "example", "text": "The group's tax EBITDA is US$100m and its net interest US$40m. The cap is 30% × 100 = US$30m, so US$10m isn't deductible this year.\nAt a 25% tax rate that costs 10 × 25% = US$2.5m of tax now; the US$10m is carried forward and deducted in a later year with room under the cap."},
    {"kind": "watch", "text": "Don't assume all LBO interest saves tax. With high leverage, or once EBITDA falls, the cap bites just when cash is tight, and the model should show it."},
    {"check": "lbo-38"},
    {"section": "Secondaries and continuation funds", "added": "2026-11-26"},
    {"kind": "idea", "text": "Funds have a fixed life of about ten years. Secondaries let an investor sell out early, or let the manager keep a good asset past the fund's end by moving it into a new vehicle."},
    {"kind": "how", "text": "LP-led secondary: an investor (an LP) sells its stake in a fund to a secondary buyer, usually at a price set against the fund's net asset value (NAV).\nGP-led secondary: the manager (the GP) sells one or more of the fund's companies to a new continuation fund that it also manages, backed by new secondary investors. It can be single-asset, multi-asset, or a strip sale of a slice of every company.\nThe choice: each existing investor either sells for cash at the agreed price or rolls its stake into the new vehicle.\nThe economics: the old fund's carry is paid out on the sale, and the manager is expected to roll much of it back in. The new vehicle usually charges a lower fee, with carry tiered by returns, for example 10% above 1.5x rising to 20% above 2.5x."},
    {"kind": "read", "text": "The conflict: the manager sits on both sides, selling for the old fund and buying for the new one. So the price is tested by a competitive process run by an adviser, often backed by an independent fairness opinion, and the investors' advisory committee (LPAC) approves the conflict.\nWhy investors accept: sellers get cash now instead of waiting; buyers get a known company with a manager that believes in it."},
    {"kind": "example", "text": "A fund's best company is valued at US$500m, and the fund's life is nearly over. A continuation fund buys it at that value.\nInvestors holding 60% sell and receive US$300m in cash, paid by the new secondary investors. Those holding 40% roll their US$200m into the new vehicle, which also raises US$100m for add-on acquisitions."},
    {"kind": "watch", "text": "Don't mix this up with a secondary buyout, where one fund sells a company to a different fund. In a continuation fund, the same manager stays in control on both sides, which is why the price has to be proven."},
    {"check": "lbo-46"}
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
  "source": [
    { "text": "Joshua Rosenbaum & Joshua Pearl, Investment Banking: Valuation, LBOs, M&A, and IPOs (Wiley): the LBO chapters" },
    { "text": "Internal Revenue Service: questions and answers on the limit on business interest (section 163(j))", "url": "https://www.irs.gov/node/153731" },
    { "text": "European Union: the anti-tax-avoidance directive, Council Directive (EU) 2016/1164, article 4", "url": "https://eur-lex.europa.eu/eli/dir/2016/1164/oj" },
    { "text": "Skadden: the Institutional Limited Partners Association's final continuation vehicle guidance (2026)", "url": "https://www.skadden.com/insights/publications/2026/11/ilpas-final-continuation-vehicle-guidance" }
  ],
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
