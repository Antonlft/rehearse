// Lesson: M&A process & documents. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("mna", {
  "status": "draft",
  "method": [
    "Accretion/dilution asks whether the buyer's earnings per share (EPS) go up or down after a deal. A quick test compares the earnings the buyer acquires with what it costs to pay for them. Paying in shares costs the buyer its own earnings yield (1 ÷ its P/E); paying in cash or new debt costs the after-tax interest given up or paid.",
    "So an all-stock deal adds to EPS when the buyer's P/E is higher than the P/E it pays for the target. Synergies make a deal more accretive; extra amortisation from the purchase and deal costs make it less so. Accretion isn't the same as value creation: a buyer can overpay and still report higher EPS."
  ],
  "example": {
    "question": "A buyer trading at 18x earnings buys a target at 12x earnings, paying half in new shares and half with debt costing 5% after tax. Does the deal add to EPS?",
    "working": [
      "Earnings bought: 1 ÷ 12 = 8.33% of the price",
      "Cost: 50% × (1 ÷ 18) + 50% × 5% = 2.78% + 2.50% = 5.28%",
      "8.33% is more than 5.28%"
    ],
    "answer": "Yes, it's accretive: every US$100 paid buys US$8.33 of earnings for a cost of about US$5.28."
  },
  "source": {
    "text": "Joshua Rosenbaum & Joshua Pearl, Investment Banking: Valuation, LBOs, M&A, and IPOs (Wiley): the buy-side M&A chapter"
  },
  "widget": {
    "type": "accretion",
    "values": {
      "acqPE": 18,
      "tgtPE": 12,
      "stock": 0.5,
      "kd": 0.05
    }
  }
});
