// Lesson: Real estate valuation. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("rev", {
  "status": "draft",
  "method": [
    "Income-producing property is valued on its net operating income (NOI): rent less the owner's non-recoverable operating costs, before financing. The simplest method capitalises it at a market yield: value = NOI ÷ yield, so a 5% yield is a 20x multiple. Hotels are valued on EBITDA after an FF&E reserve, at a higher yield because the income is operational.",
    "Small yield moves cause big value changes, especially at low yields: value changes by old yield ÷ new yield − 1. A DCF projects about 10 years of NOI and adds an exit value (the next year's NOI ÷ an exit yield). Price per key or per bed is a cross-check, not a valuation."
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
  }
});
