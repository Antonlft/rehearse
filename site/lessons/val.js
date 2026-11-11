// Lesson: Valuation. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("val", {
  "status": "draft",
  "method": [
    {"section": "From enterprise value to equity value"},
    {"kind": "idea", "text": "Enterprise value (EV) is the value of the operating business to all capital providers; equity value is the part that belongs to shareholders."},
    {"kind": "formula", "text": "Equity value = EV − debt + cash − preferred shares − NCI + associates", "note": "NCI = non-controlling interests, the part of subsidiaries owned by outsiders. Associates = minority stakes (usually 20–50%) the company holds in other businesses, which EV leaves out; other non-operating assets are added the same way."},
    {"kind": "how", "text": "Match each multiple to the right value. EV goes with measures before interest (revenue, EBITDA, EBIT); equity value goes with measures after interest (net income, so P/E). In a DCF, unlevered free cash flow discounted at WACC gives EV: bridge it to equity value, then divide by the diluted share count."},
    {"kind": "watch", "text": "Keep cash flows and discount rates matched: unlevered free cash flow at WACC gives EV, while FCFE (after interest and debt repayments) at the cost of equity gives equity value."},
    {"section": "Diluted shares"},
    {"kind": "formula", "text": "Net new shares = options − {{options × exercise price // share price}}", "note": "The treasury stock method, for in-the-money options."},
    {"kind": "how", "text": "Diluted shares add every claim that will become a share. In-the-money options are assumed exercised, and the proceeds buy back shares at the current price, so only the difference is new. Out-of-the-money options add nothing, RSUs add one share each, and an in-the-money convertible adds its shares and stops counting as debt."},
    {"kind": "practice", "text": "10m options at US$25 with shares at US$40 bring in US$250m, which buys back 6.25m shares: 3.75m net new shares."},
    {"section": "Cross-checks"},
    {"kind": "watch", "text": "Check what the terminal value implies: a Gordon growth value divided by final-year EBITDA should land near peers' multiples. A big gap means the growth rate or WACC is out of line."},
    {"kind": "practice", "text": "Calendarise peers' figures to the same 12 months before comparing multiples; adjust P/E for growth with the PEG ratio (P/E ÷ growth in percentage points); use EV/(EBITDA − capex) or EV/EBIT for capital-heavy businesses; and apply a discount for lack of marketability to a private company."}
  ],
  "example": {
    "question": "A business is worth US$1,500m (EV). It has debt of US$450m, cash of US$120m, non-controlling interests of US$70m, a stake in an associate worth US$30m and 100m diluted shares. What is it worth per share?",
    "working": [
      "Net debt = 450 − 120 = US$330m",
      "Equity value = 1,500 − 330 − 70 + 30 = US$1,130m",
      "Per share = 1,130 ÷ 100 = US$11.30"
    ],
    "answer": "US$11.30 per share."
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
      "pref": 0,
      "assoc": 30
    }
  },
  "widgets": [
    { "type": "dilutedShares", "values": { "price": 40, "strike": 25, "opts": 10, "basic": 200 } }
  ]
});
