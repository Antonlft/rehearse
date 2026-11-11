// Lesson: M&A process & documents. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, title?, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("mna", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Accretion/dilution asks whether the buyer's earnings per share (EPS) go up or down after a deal."},
    {"kind": "how", "title": "The quick test", "text": "Compare the earnings the buyer acquires with what it costs to pay for them. Paying in shares costs the buyer its own earnings yield (1 ÷ its P/E); paying in cash or new debt costs the after-tax interest given up or paid."},
    {"kind": "read", "text": "So an all-stock deal adds to EPS when the buyer's P/E is higher than the P/E it pays for the target. Synergies make a deal more accretive; extra amortisation from the purchase and deal costs make it less so."},
    {"kind": "watch", "text": "Accretion isn't the same as value creation: a buyer can overpay and still report higher EPS."},
    {"kind": "how", "title": "Exchange ratios", "text": "In a stock deal, the exchange ratio sets how many buyer shares each target share receives. A fixed ratio fixes the share count, so the target's holders bear the risk of the buyer's price falling; a floating ratio fixes the value and moves that risk to the buyer; a collar shares it."},
    {"kind": "formula", "title": "Exchange ratio", "text": "Exchange ratio = offer price ÷ buyer's share price", "note": "The target's holders then own new shares ÷ (buyer's existing shares + new shares) of the combined company."},
    {"kind": "how", "title": "Purchase price allocation", "text": "After completion, the purchase price allocation (IFRS 3; ASC 805 in the US) restates the target's identifiable assets and liabilities at fair value, including intangibles such as brands and customer relationships. Where the tax base doesn't change, as in most share deals, the write-ups create a deferred tax liability."},
    {"kind": "formula", "title": "Goodwill", "text": "Goodwill = price − fair value of net identifiable assets", "note": "Goodwill isn't amortised, only tested for impairment; written-up assets are depreciated or amortised, which lowers future EPS."},
    {"kind": "practice", "text": "Paying US$700m for book net assets of US$370m, with US$120m of write-ups at a 25% tax rate: deferred tax liability US$30m, net assets at fair value US$460m, goodwill US$240m."}
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
  },
  "widgets": [
    { "type": "goodwill", "values": { "price": 700, "book": 370, "writeUp": 120, "t": 0.25 } }
  ]
});
