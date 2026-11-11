// Lesson: Restructuring. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("rx", {
  "status": "draft",
  "method": [
    {"section": "Who gets paid first"},
    {"kind": "idea", "text": "When a company can't pay its debts, its value is shared out by priority: secured lenders first (up to the value of their collateral), then unsecured creditors, then subordinated debt, and shareholders last. This is the absolute priority rule."},
    {"kind": "how", "text": "The key question is how far down the capital structure the enterprise value reaches. The class where value runs out, so it's only partly repaid, is the fulcrum security. It usually swaps its claim for most of the new equity; classes below it typically get little or nothing."},
    {"kind": "read", "text": "That's why distressed investors buy the fulcrum: it's where a restructuring turns debt into ownership."},
    {"kind": "practice", "text": "In the US, Chapter 11 keeps the business running while a plan restructures its debts; Chapter 7 liquidates it."},
    {"section": "Restructuring in and out of court"},
    {"kind": "formula", "text": "Liquidation value = each asset × its expected recovery − wind-down costs", "note": "The best-interests test: anyone who votes against a plan must get at least this much."},
    {"kind": "how", "title": "Inside Chapter 11", "text": "A company can sell assets quickly through a Section 363 sale, where secured lenders may 'credit bid' their debt instead of cash. To confirm a plan, the court checks that it's feasible (unlikely to fail again) and in the best interests of creditors."},
    {"kind": "how", "title": "Outside court", "text": "Exchange offers face holdouts, which exit consents help overcome; restructuring support agreements lock in key creditors before a filing."}
  ],
  "example": {
    "question": "A restructured company is worth US$700m. It owes US$400m of senior secured loans, US$500m of senior unsecured notes and US$150m of subordinated notes. What does each class recover?",
    "working": [
      "Secured: repaid in full, US$400m; US$300m is left",
      "Unsecured: US$300m of US$500m = 60% recovery",
      "Subordinated: nothing left, so 0%"
    ],
    "answer": "100%, 60% and 0%. The unsecured notes are the fulcrum security and would likely take the equity."
  },
  "source": {
    "text": "United States Courts, Chapter 11 – Bankruptcy Basics",
    "url": "https://www.uscourts.gov/services-forms/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics"
  },
  "widget": {
    "type": "recovery",
    "values": {
      "ev": 700,
      "sec": 400,
      "uns": 500,
      "sub": 150
    }
  }
});
