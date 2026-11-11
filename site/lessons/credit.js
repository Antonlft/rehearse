// Lesson: Credit & debt. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("credit", {
  "status": "draft",
  "method": [
    "A bond's price is the present value of its coupons and principal, discounted at the market yield. When yields rise, prices fall, and vice versa. A bond trades at par when its yield equals its coupon, below par (at a discount) when the yield is higher than the coupon, and above par (at a premium) when it's lower.",
    "Duration measures how sensitive the price is to yields: modified duration is roughly the % price change for a one-point move in yield. Longer maturities and lower coupons mean higher duration. The price–yield line curves (convexity), so prices rise more when yields fall than they drop when yields rise by the same amount.",
    "Corporate debt comes as loans and bonds. Leveraged loans (a revolver plus term loans) are usually secured, float at SOFR plus a margin and can be repaid early; high-yield bonds usually pay a fixed coupon, are often unsecured and have a non-call period followed by call premiums. Yields measure the return at today's price: current yield = coupon ÷ price; yield to maturity also counts the move to 100; yield to call assumes repayment at the call price on the call date; and yield to worst, the lowest of these, is what's quoted for callable bonds. For example, an 8% bond trading at 108 with eight years left, callable in three years at 102, has a current yield of 7.41% and yields 6.68% to maturity but only 5.66% to the call, so its yield to worst is 5.66%."
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
    "text": "Investor.gov (US SEC), Bonds; Frank Fabozzi, Bond Markets, Analysis, and Strategies (Pearson)",
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
