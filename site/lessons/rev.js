// Lesson: Real estate valuation. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("rev", {
  "status": "draft",
  "method": [
    {"section": "Valuing a property"},
    {"kind": "idea", "text": "Income-producing property is valued on its net operating income (NOI): rent less the owner's non-recoverable operating costs, before financing."},
    {"kind": "formula", "text": "Value = {{NOI // yield}}", "note": "A 5% yield is a 20x multiple."},
    {"kind": "how", "text": "A DCF projects about 10 years of NOI and adds an exit value: the next year's NOI ÷ an exit yield."},
    {"kind": "read", "text": "Small yield moves cause big value changes, especially at low yields: value changes by old yield ÷ new yield − 1."},
    {"kind": "watch", "text": "Price per key or per bed is a cross-check, not a valuation."},
    {"kind": "practice", "text": "Hotels are valued on EBITDA after an FF&E reserve, at a higher yield because the income is operational."},
    {"section": "Listed property (REITs)"},
    {"kind": "formula", "text": "NAV per share = {{property value + cash − debt // shares}}\nFFO = net income + real estate depreciation − gains on property sales", "note": "Property value = NOI ÷ market cap rate. FFO (funds from operations) is the REIT version of earnings; AFFO also deducts recurring capex and straight-line rent."},
    {"kind": "how", "text": "US REITs must pay out at least 90% of their taxable income as dividends, so they trade on P/FFO rather than P/E: depreciation on buildings that hold their value makes net income misleading."},
    {"kind": "practice", "title": "Example", "text": "NOI of US$60m at a 6% cap rate is worth US$1,000m. With US$400m of debt, US$20m of cash and 50m shares, NAV is US$12.40 a share; at a US$10.00 share price the stock trades at a 19% discount, implying a 6.8% cap rate."},
    {"kind": "practice", "title": "Europe", "text": "Where IFRS (IAS 40) holds property at fair value, as in Europe, listed companies report EPRA earnings and EPRA NTA instead of FFO."}
  ],
  "example": {
    "question": "An office earns NOI of US$6m and is valued at a 5.0% yield. Yields move out to 5.5%. What happens to its value?",
    "working": [
      "Before: 6 ÷ 5.0% = US$120.0m",
      "After: 6 ÷ 5.5% = US$109.1m",
      "Change: 5.0 ÷ 5.5 − 1 = −9.1%"
    ],
    "answer": "It falls by about US$10.9m (−9.1%), even though the rent hasn't changed."
  },
  "source": {
    "text": "RICS Valuation – Global Standards (the 'Red Book')",
    "url": "https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/valuation-standards/red-book"
  },
  "widget": {
    "type": "yieldValue",
    "values": {
      "noi": 6,
      "y": 0.05,
      "shift": 0.005
    }
  },
  "widgets": [
    { "type": "reitNav", "values": { "noi": 60, "cap": 0.06, "debt": 400, "cash": 20, "shares": 50, "price": 10 } }
  ]
});
