// Lesson: Hotel operating models. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("hom", {
  "status": "draft",
  "method": [
    "Who owns a hotel and who runs it are often different. Under a lease, the operator pays the owner rent and keeps the trading profit and risk. Under a management contract, the owner keeps the profit and risk and pays the operator fees: a base fee (often 2–4% of revenue) plus an incentive fee linked to profit. Under a franchise, the owner, or a manager it hires, runs the hotel and pays a brand for its name, standards and distribution.",
    "The structure drives value and the pool of buyers. A leased hotel gives bond-like income, valued on its rent at a lower yield. A managed hotel passes the full EBITDA swings to the owner and is valued at a higher yield. An OpCo/PropCo split separates the property from the operating business. Under IFRS 16, a lease goes on the operator's balance sheet."
  ],
  "example": {
    "question": "A managed hotel has revenue of US$30m and GOP of US$9m. The contract sets a 3% base fee on revenue and an incentive fee of 10% of GOP. What does the owner keep, before other fixed charges?",
    "working": [
      "Base fee: 3% × 30 = US$0.9m",
      "Incentive fee: 10% × 9 = US$0.9m",
      "Owner keeps 9 − 0.9 − 0.9 = US$7.2m"
    ],
    "answer": "US$7.2m. In a bad year it falls further than revenue, because the owner carries the operating risk."
  },
  "source": {
    "text": "Stephen Rushmore & Erich Baum, Hotels and Motels: Valuations and Market Studies (Appraisal Institute); IFRS Foundation, IFRS 16 Leases",
    "url": "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/"
  },
  "widget": {
    "type": "hotelModels"
  }
});
