// Lesson: Credit & debt. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("credit", {
  "status": "draft",
  "method": [
    {"section": "Bond prices"},
    {"kind": "idea", "text": "A bond's price is the present value of its coupons and principal, discounted at the market yield. When yields rise, prices fall, and vice versa."},
    {"kind": "read", "text": "A bond trades at par when its yield equals its coupon, below par (at a discount) when the yield is higher than the coupon, and above par (at a premium) when it's lower."},
    {"section": "Duration and convexity"},
    {"kind": "formula", "text": "% price change ≈ − modified duration × change in yield", "note": "Modified duration is in years; the change in yield is in percentage points. A bond with a modified duration of 7 loses about 7 × 0.5% = 3.5% if yields rise by 0.5 points."},
    {"kind": "how", "text": "Longer maturities and lower coupons mean higher duration. The price–yield line curves (convexity), so prices rise more when yields fall than they drop when yields rise by the same amount."},
    {"section": "Loans, bonds and yields"},
    {"kind": "formula", "text": "Current yield = {{annual coupon // price}}"},
    {"kind": "how", "text": "Current yield: the coupon as a % of the price, ignoring the move to 100.\nYield to maturity (YTM): the full return if held to maturity, including the gain or loss as the price moves to 100.\nYield to call: the same, assuming the issuer repays early at the call price on the call date.\nYield to worst: the lowest of these, which is what's quoted for callable bonds."},
    {"kind": "practice", "title": "Loans vs bonds", "text": "Leveraged loans (a revolver plus term loans) are usually secured, float at SOFR (the Secured Overnight Financing Rate, the US overnight benchmark) plus a margin, and can be repaid early.\nHigh-yield bonds usually pay a fixed coupon, are often unsecured, and have a non-call period followed by call premiums."},
    {"kind": "practice", "title": "Example", "text": "An 8% bond at 108 with eight years left, callable in three years at 102: current yield 7.41%, yield to maturity 6.68%, yield to call 5.66%, so its yield to worst is 5.66%."}
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
  "source": {
    "text": "Investor.gov (the US Securities and Exchange Commission, SEC), Bonds; Frank Fabozzi, Bond Markets, Analysis, and Strategies (Pearson)",
    "url": "https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds"
  },
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
