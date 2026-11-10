// Lesson: Restructuring. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("rx", {
  "status": "draft",
  "method": [
    "When a company can't pay its debts, its value is shared out by priority: secured lenders first (up to the value of their collateral), then unsecured creditors, then subordinated debt, and shareholders last. This is the absolute priority rule. In the US, Chapter 11 keeps the business running while a plan restructures its debts; Chapter 7 liquidates it.",
    "The key question is how far down the capital structure the enterprise value reaches. The class where value runs out, so it's only partly repaid, is the fulcrum security. It usually swaps its claim for most of the new equity, which is why distressed investors buy it. Classes below it typically get little or nothing."
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
