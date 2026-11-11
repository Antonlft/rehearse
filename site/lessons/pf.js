// Lesson: Property finance & rates. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("pf", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Property lenders size a loan using several tests and lend the lowest result: loan-to-value (LTV), interest cover ratio (ICR), debt service cover ratio (DSCR) and debt yield.\nThe income tests use net operating income (NOI): rent less the owner's operating costs."},
    {"kind": "formula", "text": "LTV = {{loan // property value}}\nICR = {{NOI // annual interest}}\nDSCR = {{NOI // annual interest + principal repayments}}\nDebt yield = {{NOI // loan}}"},
    {"kind": "read", "title": "What each test protects", "text": "LTV caps the loan against the property's value; ICR and DSCR check that income covers the payments; debt yield shows the lender's return on income if it had to take the property."},
    {"kind": "read", "title": "Positive and negative leverage", "text": "Leverage is positive when the property's yield is above the cost of debt, and negative when it's below."},
    {"kind": "watch", "text": "Higher rates hit twice: they shrink the loan the ICR test allows, and they push yields up and so values down."},
    {"kind": "practice", "text": "Floating-rate loans are priced at a benchmark (the Secured Overnight Financing Rate, SOFR, in the US; the Sterling Overnight Index Average, SONIA, in the United Kingdom) plus a margin; swaps or caps fix or limit the cost."}
  ],
  "example": {
    "question": "A property worth US$80m earns NOI of US$4.8m. The lender allows 65% LTV, a minimum ICR of 1.6x and a minimum 8% debt yield, at a 6.5% interest rate. What's the maximum loan?",
    "working": [
      "LTV test: 65% × 80 = US$52.0m",
      "ICR test: 4.8 ÷ 1.6 = US$3.0m of interest; ÷ 6.5% = US$46.2m",
      "Debt yield test: 4.8 ÷ 8% = US$60.0m",
      "The lowest is US$46.2m, so the ICR test binds"
    ],
    "answer": "US$46.2m (about 58% LTV): at today's rates it's the income, not the value, that limits the loan."
  },
  "source": {
    "text": "Bank of England, SONIA interest rate benchmark (and the Federal Reserve Bank of New York for SOFR); Brueggeman & Fisher, Real Estate Finance and Investments (McGraw-Hill)",
    "url": "https://www.bankofengland.co.uk/markets/sonia-benchmark"
  },
  "widget": {
    "type": "maxLoan",
    "values": {
      "value": 80,
      "noi": 4.8,
      "rate": 0.065,
      "ltv": 0.65,
      "icr": 1.6,
      "dy": 0.08
    }
  }
});
