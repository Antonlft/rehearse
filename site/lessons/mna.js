// Lesson: M&A process & documents. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("mna", {
  "status": "draft",
  "method": [
    {"section": "1. Will the deal add to earnings per share?"},
    {"kind": "idea", "text": "Accretion/dilution asks whether the buyer's earnings per share (EPS) go up or down after a deal: compare the earnings it buys with what it costs to pay for them."},
    {"kind": "formula", "title": "Earnings yield, the inverse of price/earnings (P/E)", "text": "Earnings yield = {{1 // P/E}} = {{EPS // share price}}", "note": "Paying in shares costs the buyer its own earnings yield; paying in cash or new debt costs the after-tax interest. What the buyer gets is the target's earnings yield at the price paid."},
    {"kind": "read", "text": "So an all-stock deal adds to EPS when the buyer's P/E is higher than the P/E it pays. Synergies make a deal more accretive; amortisation of written-up intangibles and deal costs make it less so."},
    {"kind": "watch", "text": "Accretion isn't the same as value creation: a buyer can overpay and still report higher EPS."},
    {"section": "2. If it's dilutive: the synergies needed"},
    {"kind": "formula", "text": "Pre-tax synergies needed = {{(EPS before − EPS after) × shares after the deal // 1 − tax rate}}", "note": "EPS before = the buyer's earnings per share without the deal.\nEPS after = the combined company's EPS with no synergies.\nShares after the deal = the buyer's shares plus any new shares issued to pay for the target.\nDividing by (1 − tax rate) turns the after-tax earnings gap into the pre-tax synergies needed."},
    {"kind": "how", "text": "Combined net income = buyer's + target's net income − after-tax interest on new debt − after-tax interest no longer earned on cash used.\nEPS after = combined net income ÷ shares after the deal.\nThe EPS gap × shares after is the extra net income needed; gross it up for tax."},
    {"kind": "practice", "text": "EPS falls from US$2.00 to US$1.80 with 150m shares after the deal, at a 25% tax rate.\nAfter-tax gap = 0.20 × 150 = US$30m.\nPre-tax synergies needed = 30 ÷ 0.75 = US$40m."},
    {"section": "3. Paying in shares: the exchange ratio"},
    {"kind": "formula", "text": "Exchange ratio = {{offer price per target share // buyer's share price}}", "note": "The target's holders then own new shares ÷ (buyer's existing shares + new shares) of the combined company."},
    {"kind": "how", "text": "A fixed ratio fixes the number of shares, so the target's holders bear the risk of the buyer's price falling. A floating ratio fixes the value and moves that risk to the buyer. A collar shares it."},
    {"section": "4. After completion: goodwill"},
    {"kind": "formula", "text": "Goodwill = price paid − fair value of net identifiable assets", "note": "Net identifiable assets = the target's assets at fair value (including newly recognised intangibles) − its liabilities, including the deferred tax liability on the write-ups."},
    {"kind": "how", "text": "The purchase price allocation restates the target's assets and liabilities at fair value, including intangibles such as brands and customer relationships. It follows IFRS 3 under International Financial Reporting Standards (IFRS), or in the US topic 805 of the Accounting Standards Codification (ASC 805). Where the tax base doesn't change, as in most share deals, the write-ups create a deferred tax liability, which adds to goodwill."},
    {"kind": "read", "text": "Goodwill isn't amortised, only tested for impairment, but written-up assets are depreciated or amortised, which lowers future EPS. That links back to step 1."},
    {"kind": "practice", "text": "Paying US$700m for book net assets of US$370m, with US$120m of write-ups at a 25% tax rate: deferred tax liability US$30m, net assets at fair value US$460m, goodwill US$240m."},
    {"section": "5. Running a sale: the documents"},
    {"kind": "idea", "text": "A sale releases information in stages, so the seller keeps buyers competing while protecting confidential data."},
    {"kind": "how", "text": "Teaser: a short, anonymous profile sent to a wide list of buyers.\nConfidentiality agreement (a non-disclosure agreement, NDA): signed before any detail is shared.\nInformation memorandum: the full marketing document (business, market, historical financials, business plan), sent after the NDA and before indicative (non-binding) offers.\nProcess letter: the rules of each round: the deadline, what an offer must contain (price, financing, conditions, approvals) and the next steps.\nData room, management presentation and due diligence (financial, tax, legal, commercial): for the shortlisted buyers, before binding offers."},
    {"kind": "watch", "text": "Don't mix up the pitch book and the information memorandum.\nThe pitch book is the bank's presentation to win the mandate.\nThe information memorandum markets the company to buyers once the bank is hired."}
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
