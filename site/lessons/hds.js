// Lesson: Hospitality & living deal structuring. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("hds", {
  "status": "draft",
  "method": [
    {"section": "The sale process"},
    {"kind": "idea", "text": "A sell-side process widens interest, then narrows the field."},
    {"kind": "how", "text": "An anonymous teaser, a non-disclosure agreement (NDA), an information memorandum, first-round indicative bids, data room access and due diligence for a shortlist, binding bids, then the purchase agreement."},
    {"kind": "practice", "text": "A deal can be an asset deal (buy the property) or a share deal (buy the company that owns it, with its liabilities and tax position)."},
    {"section": "The capital stack"},
    {"kind": "formula", "text": "Blended cost = senior debt % × its cost + mezzanine % × its cost + equity % × its cost", "note": "Each % is that layer's share of the total funding. 60% senior at 6%, 15% mezzanine at 11% and 25% equity at 15% gives 3.6% + 1.65% + 3.75% = 9.0%."},
    {"kind": "how", "text": "The capital stack shows who funds a deal and in what order they're repaid: senior debt (cheapest, repaid first, sized as a share of the property's value: the loan-to-value, or LTV), mezzanine, preferred equity, then common equity (most expensive, first to lose)."},
    {"kind": "practice", "text": "Sale-and-leasebacks, joint ventures with a promote and forward funding all reshape who takes which risk."}
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
