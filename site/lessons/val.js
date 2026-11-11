// Lesson: Valuation. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("val", {
  "status": "draft",
  "method": [
    "Enterprise value (EV) is the value of the operating business to all capital providers; equity value is the part that belongs to shareholders. To move from EV to equity value, subtract debt and the other claims that rank ahead of or beside shareholders (preferred shares, non-controlling interests), and add back cash and non-operating assets.",
    "Match each multiple to the right value. EV goes with measures before interest (revenue, EBITDA, EBIT); equity value goes with measures after interest (net income, so P/E). In a DCF, unlevered free cash flow discounted at WACC gives EV: bridge it to equity value, then divide by the diluted share count.",
    "Diluted shares add every claim that will become a share. In-the-money options use the treasury stock method: assume they're exercised, then use the exercise proceeds to buy back shares at the current price, so only the difference is new. For example, 10m options at US$25 with shares at US$40 bring in US$250m, which buys back 6.25m shares: 3.75m net new shares. Out-of-the-money options add nothing, RSUs add one share each, and an in-the-money convertible adds its conversion shares and stops counting as debt.",
    "Cross-checks keep a valuation honest. Calendarise peers' figures to the same 12 months before comparing multiples; adjust P/E for growth with the PEG ratio (P/E ÷ growth in percentage points); and for capital-heavy businesses compare EV/(EBITDA − capex) or EV/EBIT. In a DCF, check what the terminal value implies: a Gordon growth value divided by final-year EBITDA should land near peers' multiples. Keep cash flows and discount rates matched: unlevered free cash flow at WACC gives enterprise value, FCFE at the cost of equity gives equity value. For a private company, apply a discount for lack of marketability."
  ],
  "example": {
    "question": "A business is worth US$1,500m (EV). It has debt of US$450m, cash of US$120m, non-controlling interests of US$70m and 100m diluted shares. What is it worth per share?",
    "working": [
      "Net debt = 450 − 120 = US$330m",
      "Equity value = 1,500 − 330 − 70 = US$1,100m",
      "Per share = 1,100 ÷ 100 = US$11.00"
    ],
    "answer": "US$11.00 per share."
  },
  "source": {
    "text": "Koller, Goedhart & Wessels (McKinsey & Company), Valuation: Measuring and Managing the Value of Companies; Aswath Damodaran's valuation notes (NYU Stern)",
    "url": "https://pages.stern.nyu.edu/~adamodar/"
  },
  "widget": {
    "type": "evBridge",
    "values": {
      "ev": 1500,
      "debt": 450,
      "cash": 120,
      "nci": 70,
      "pref": 0
    }
  },
  "widgets": [
    { "type": "dilutedShares", "values": { "price": 40, "strike": 25, "opts": 10, "basic": 200 } }
  ]
});
