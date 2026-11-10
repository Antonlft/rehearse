// Lesson: Hospitality & living deal structuring. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("hds", {
  "status": "draft",
  "method": [
    "A sell-side process widens interest, then narrows the field: an anonymous teaser, an NDA, an information memorandum, first-round indicative bids, data room access and due diligence for a shortlist, binding bids, then the purchase agreement. A deal can be an asset deal (buy the property) or a share deal (buy the company that owns it, with its liabilities and tax position).",
    "The capital stack shows who funds a deal and in what order they're repaid: senior debt (cheapest, repaid first), mezzanine, preferred equity, then common equity (most expensive, first to lose). The blended cost is each layer's share × its cost. Sale-and-leasebacks, joint ventures with a promote and forward funding all reshape who takes which risk."
  ],
  "example": {
    "question": "A US$100m acquisition is funded with 55% senior debt at 6%, 15% mezzanine at 11% and 30% equity targeting 15%. What are the blended cost of debt and the overall cost of capital?",
    "working": [
      "Debt: (55% × 6% + 15% × 11%) ÷ 70% = (3.30% + 1.65%) ÷ 70% = 7.07%",
      "Overall: 3.30% + 1.65% + 30% × 15% = 3.30% + 1.65% + 4.50% = 9.45%"
    ],
    "answer": "7.07% on the debt and 9.45% overall: the mezzanine takes leverage to 70%, at a cost well above the senior loan."
  },
  "source": {
    "text": "Brueggeman & Fisher, Real Estate Finance and Investments (McGraw-Hill)"
  },
  "widget": {
    "type": "capitalStack",
    "values": {
      "sen": 0.55,
      "ks": 0.06,
      "mez": 0.15,
      "km": 0.11,
      "ke": 0.15
    }
  }
});
