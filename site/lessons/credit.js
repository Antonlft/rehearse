// Lesson: Credit & debt. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("credit", {
  "status": "draft",
  "newQuestions": "2026-11-26",
  "summary": [
    "A bond's price is the present value of its coupons and principal, so when yields rise, prices fall.",
    "Duration measures that sensitivity: price change ≈ − modified duration × change in yield. It's higher for long, low-coupon bonds.",
    "Current yield is coupon ÷ price; yield to maturity also counts the gain or loss as the price moves back to par.",
    "Loan agreements protect lenders with security, covenants and early-repayment triggers; an intercreditor agreement sets which lenders are paid, and can act, first."
  ],
  "method": [
    {"section": "Bond prices"},
    {"kind": "idea", "text": "A bond's price is the present value of its coupons and principal, discounted at the market yield. When yields rise, prices fall, and vice versa."},
    {"kind": "formula", "title": "Bond price", "text": "Price = {{coupon // 1 + y}} + {{coupon // (1 + y)^2}} + … + {{coupon + 100 // (1 + y)^n}}", "note": "Per 100 of face value. y = the market yield; n = years to maturity."},
    {"kind": "read", "text": "A bond trades at par when its yield equals its coupon, below par (at a discount) when the yield is higher than the coupon, and above par (at a premium) when it's lower."},
    {"kind": "example", "text": "A 5-year bond with a 5% coupon is worth 100 (par) when yields are 5%.\nIf yields rise to 6%, its price falls to about 95.8: its coupons are now below what investors require, so it sells at a discount."},
    {"check": "cr-05"},
    {"section": "Duration and convexity"},
    {"kind": "formula", "text": "% price change ≈ − modified duration × change in yield", "note": "Modified duration is in years; the change in yield is in percentage points. A bond with a modified duration of 7 loses about 7 × 0.5% = 3.5% if yields rise by 0.5 points."},
    {"kind": "how", "text": "Longer maturities and lower coupons mean higher duration. The price–yield line curves (convexity), so prices rise more when yields fall than they drop when yields rise by the same amount."},
    {"kind": "example", "text": "A bond with a modified duration of 7 loses about 7 × 1% = 7% of its price if yields rise by one percentage point.\nIf yields fall by a point, it gains slightly more than 7%: that extra is convexity."},
    {"check": "cr-06"},
    {"section": "Loans, bonds and yields"},
    {"kind": "formula", "text": "Current yield = {{annual coupon // price}}"},
    {"kind": "how", "text": "Current yield: the coupon as a % of the price, ignoring the move to 100.\nYield to maturity (YTM): the full return if held to maturity, including the gain or loss as the price moves to 100.\nYield to call: the same, assuming the issuer repays early at the call price on the call date.\nYield to worst: the lowest of these, which is what's quoted for callable bonds."},
    {"kind": "example", "text": "An 8% bond at 108 with eight years left, callable in three years at 102: current yield 7.41%, yield to maturity 6.68%, yield to call 5.66%, so its yield to worst is 5.66%."},
    {"kind": "practice", "title": "Loans vs bonds", "text": "Leveraged loans (a revolver plus term loans) are usually secured, float at SOFR (the Secured Overnight Financing Rate, the US overnight benchmark) plus a margin, and can be repaid early.\nHigh-yield bonds usually pay a fixed coupon, are often unsecured, and have a non-call period followed by call premiums."},
    {"check": "cr-21"},
    {"section": "Inside a leveraged loan agreement", "added": "2026-11-26"},
    {"kind": "idea", "text": "A loan agreement is the lenders' protection between now and repayment. It says when they must be repaid early, what the borrower must keep doing, what counts as a default and what the lenders can then do."},
    {"kind": "formula", "title": "Covenant headroom", "text": "EBITDA headroom = 1 − {{current leverage // covenant level}}\nEquity needed to cure = net debt − covenant level × EBITDA", "note": "Leverage = net debt ÷ EBITDA. Headroom is how far EBITDA can fall, with debt unchanged, before the covenant is breached. The cure here assumes the new equity repays debt."},
    {"kind": "how", "text": "Mandatory prepayments: part of each year's excess cash flow (often 50%, stepping down to 25% and then 0% as leverage falls), the proceeds of asset sales not reinvested, and the whole loan on a change of control.\nVoluntary prepayment: allowed at any time, but a refinancing or repricing in the first six months often costs 1% (a 101 soft call).\nFinancial covenants: in maintenance loans, leverage is tested every quarter, usually set with 25–35% headroom to the business plan.\nEquity cure: the sponsor can put in new equity to fix a breach, usually a limited number of times and not in back-to-back quarters.\nEvents of default: non-payment, a covenant breach that isn't cured, a default on other debt (cross-default), insolvency or false statements. Lenders can then demand immediate repayment (acceleration) and enforce their security.\nAmendments and waivers: most changes need a majority of lenders; cutting the margin or the amount, or delaying repayment, needs every lender affected.\nSecurity and guarantees: shares in the main companies, bank accounts, receivables and key assets, with guarantees from the main subsidiaries."},
    {"kind": "example", "text": "Net debt is US$400m and EBITDA US$100m: leverage 4.0x against a 5.0x covenant. Headroom = 1 − 4.0 ÷ 5.0 = 20%: EBITDA can fall to US$80m before a breach.\nIf EBITDA falls to US$75m, leverage is 5.3x. To cure, net debt must fall to 5.0 × 75 = US$375m, so the sponsor puts in US$25m."},
    {"kind": "watch", "text": "A breach isn't the end. Most are fixed by a waiver or an amendment, usually for a fee, a higher margin or some debt repaid, because lenders rarely want to take over the company. What a breach gives them is leverage in that negotiation."},
    {"check": "cr-37"},
    {"section": "The intercreditor agreement", "added": "2026-11-26"},
    {"kind": "idea", "text": "When a company has several layers of debt, the intercreditor agreement sets the rules between the lenders: who is paid first, who can enforce and when, and what juniors must hand over if they're paid out of turn."},
    {"kind": "how", "title": "Who is paid first from an enforcement sale", "numbered": true, "text": "Costs of enforcing and the agents' fees.\nSuper senior debt, if any, such as the revolving credit facility and hedging.\nSenior term loans.\nSecond-lien loans or mezzanine debt.\nShareholder loans, then the shareholders."},
    {"kind": "read", "text": "Structural subordination: debt borrowed higher up the group is paid only from what's left in the subsidiaries.\nContractual subordination: lenders to the same company agree an order in the intercreditor agreement.\nPayment blockage: after a senior default, payments to junior lenders stop, often for a limited period each year.\nStandstill: junior lenders can't enforce for a set period, often three to five months depending on the default, so senior lenders act first.\nTurnover: anything a junior lender receives out of turn must be passed to the senior lenders.\nRelease: in a distressed sale run by the senior lenders, the junior debt and its security can be released, so the buyer takes the company clean."},
    {"kind": "example", "text": "After a default, the senior lenders sell the company for US$350m. Enforcement costs are US$10m, senior debt US$300m, second-lien debt US$100m and shareholder loans US$50m.\nCosts take 10, senior lenders are repaid in full (300), and the second-lien lenders get the remaining 40: 40 cents per dollar. Shareholder loans get nothing."},
    {"kind": "watch", "text": "Junior lenders aren't powerless. Payment blockage and standstill periods end, so a long dispute hands them a voice, and they can often buy out the senior debt at par to take control of the process."},
    {"check": "cr-45"}
  ],
  "example": {
    "question": "A three-year bond pays a 4% annual coupon and the market yield is 5%. What is its price per 100?",
    "working": [
      "Coupons: 4 ÷ 1.05 + 4 ÷ 1.05² + 4 ÷ 1.05³ = 3.81 + 3.63 + 3.46 = 10.89",
      "Principal: 100 ÷ 1.05³ = 86.38",
      "Price = 10.89 + 86.38 = 97.28"
    ],
    "answer": "97.28: below par, because the yield (5%) is above the coupon (4%)."
  },
  "source": [
    { "text": "Investor.gov (the US Securities and Exchange Commission, SEC), Bonds; Frank Fabozzi, Bond Markets, Analysis, and Strategies (Pearson)", "url": "https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds" },
    { "text": "PitchBook: leveraged loan glossary", "url": "https://pitchbook.com/blog/leveraged-loan-glossary" },
    { "text": "CMS: intercreditor issues for mezzanine finance", "url": "https://cms.law/en/are/legal-updates/private-credit-series-intercreditor-issues-for-mezzanine-finance" }
  ],
  "widget": {
    "type": "bondPrice",
    "values": {
      "c": 0.04,
      "n": 3,
      "y": 0.05
    }
  },
  "widgets": [
    { "type": "yieldToWorst", "values": { "price": 108, "c": 0.08, "n": 8, "callYr": 3, "callPx": 102 } }
  ]
});
