// Lesson: Valuation. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("val", {
  "status": "draft",
  "method": [
    {"section": "From enterprise value to equity value"},
    {"kind": "idea", "text": "Enterprise value (EV) is the value of the operating business to all capital providers; equity value is the part that belongs to shareholders.\nTo go from one to the other, deduct the claims of others, such as debt and non-controlling interests (NCI), and add back cash and non-operating assets."},
    {"kind": "formula", "text": "Equity value = EV − debt + cash − preferred shares − NCI − pension deficit + associates", "note": "NCI = the part of subsidiaries owned by outsiders. Associates = minority stakes (usually 20–50%) the company holds in other businesses, which EV leaves out; other non-operating assets are added the same way. Pension deficit = the unfunded part of a defined-benefit plan, after tax."},
    {"kind": "how", "text": "Match each multiple to the right value. EV goes with measures before interest (revenue, EBITDA, EBIT); equity value goes with measures after interest (net income, so the price/earnings ratio, P/E). EBITDA = earnings before interest, tax, depreciation and amortisation; EBIT = earnings before interest and tax.\nIn a discounted cash flow (DCF) valuation, unlevered free cash flow discounted at the weighted average cost of capital (WACC) gives EV: bridge it to equity value, then divide by the diluted share count."},
    {"kind": "read", "text": "Defined-benefit plan: the employer promises the pension, so a shortfall is debt-like.\nExample: obligation US$500m, plan assets US$380m, tax 25%. Deficit = 500 − 380 = US$120m; after tax = 120 × (1 − 25%) = US$90m, deducted like debt.\nDefined-contribution plan: the employer only pays contributions, already in operating costs, so nothing is deducted."},
    {"kind": "watch", "text": "Keep cash flows and discount rates matched: unlevered free cash flow at WACC gives EV, while free cash flow to equity (FCFE: after interest and debt repayments) at the cost of equity gives equity value."},
    {"section": "Diluted shares"},
    {"kind": "formula", "text": "Net new shares = options − {{options × exercise price // share price}}", "note": "The treasury stock method, for in-the-money options."},
    {"kind": "how", "text": "Diluted shares add every claim that will become a share. In-the-money options are assumed exercised, and the proceeds buy back shares at the current price, so only the difference is new. Out-of-the-money options add nothing, restricted stock units (RSUs) add one share each, and an in-the-money convertible adds its shares and stops counting as debt."},
    {"kind": "practice", "text": "10m options at US$25 with shares at US$40 bring in US$250m, which buys back 6.25m shares: 3.75m net new shares."},
    {"section": "Cross-checks"},
    {"kind": "watch", "text": "Check what the terminal value implies. A Gordon growth terminal value = final-year free cash flow (FCF) × (1 + g) ÷ (WACC − g); divide it by final-year EBITDA and the multiple should land near peers' multiples. A big gap means the growth rate or WACC is out of line."},
    {"kind": "practice", "text": "Calendarise: restate peers' figures to the same 12 months before comparing multiples.\nThe price/earnings-to-growth (PEG) ratio = P/E ÷ expected growth in earnings per share (EPS), in percentage points, to adjust the P/E for growth.\nCapital-heavy businesses: compare EV/(EBITDA − capex) or EV/EBIT, since EBITDA ignores the investment needed.\nPrivate companies: apply a discount for lack of marketability, often 20–30%."},
    {"section": "Reading sensitivity tables"},
    {"kind": "idea", "text": "A sensitivity table shows how the answer changes when two inputs move at once: one down the rows, one across the columns, with the base case in the middle."},
    {"kind": "how", "text": "Read across a row to see the effect of the column input alone; read down a column for the row input.\nCompare like with like: a 0.5-point step and a 1-point step aren't comparable.\nFind the breakeven: the cells where the answer crosses a target (for example a 20% IRR) show how much room a deal has."},
    {"kind": "read", "text": "If values change faster towards one corner, the answer is non-linear in that direction.\nIn a DCF, value climbs steeply as WACC approaches the growth rate; in an LBO, each extra turn of entry multiple costs less IRR as the price rises."},
    {"kind": "watch", "text": "Check the base-case cell matches the model, and that the ranges are realistic.\nExample: with 2% growth, EV = FCF ÷ (WACC − g) doubles when WACC falls from 6% to 4%, so a table running WACC down to 3% shows absurd values."},
    {"kind": "practice", "text": "Describe the table before quoting numbers: what's on each axis, where the base case is, and which input moves the answer most."}
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
    "text": "Koller, Goedhart & Wessels (McKinsey & Company), Valuation: Measuring and Managing the Value of Companies; Aswath Damodaran's valuation notes (New York University's Stern School of Business, NYU Stern)",
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
