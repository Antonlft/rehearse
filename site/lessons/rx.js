// Lesson: Restructuring. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (a list of { text, optional url }: US and UK law), widget (interactive "Try it").
Lessons.add("rx", {
  "status": "draft",
  "summary": [
    "When a company can't pay, value is shared by priority: secured lenders first, then unsecured creditors, then subordinated debt, shareholders last.",
    "The class of debt where the value runs out (the fulcrum) usually ends up owning the company.",
    "Restructuring beats liquidation when the business is worth more running than sold off in pieces.",
    "Deals done by agreement are quicker but bind only those who agree; court processes such as Chapter 11 or a UK restructuring plan can bind the holdouts."
  ],
  "method": [
    {"section": "Who gets paid first"},
    {"kind": "idea", "text": "When a company can't pay its debts, its value is shared out by priority: secured lenders first (up to the value of their collateral), then unsecured creditors, then subordinated debt, and shareholders last. This is the absolute priority rule."},
    {"kind": "how", "text": "The key question is how far down the capital structure the enterprise value reaches. The class where value runs out, so it's only partly repaid, is the fulcrum security. It usually swaps its claim for most of the new equity; classes below it typically get little or nothing."},
    {"kind": "read", "text": "That's why distressed investors buy the fulcrum: it's where a restructuring turns debt into ownership."},
    {"kind": "example", "text": "A company worth US$600m owes US$400m of secured loans and US$300m of unsecured bonds.\nThe loans recover 100%, the bonds get the remaining US$200m (67%), and shareholders get nothing. The bonds are the fulcrum."},
    {"kind": "practice", "text": "In the US, Chapter 11 keeps the business running while a plan restructures its debts; Chapter 7 liquidates it."},
    {"check": "rx-why-01"},
    {"section": "Restructuring in and out of court"},
    {"kind": "formula", "text": "Liquidation value = each asset × its expected recovery − wind-down costs", "note": "The best-interests test: anyone who votes against a plan must get at least this much."},
    {"kind": "how", "title": "Inside Chapter 11", "text": "A company can sell assets quickly through a Section 363 sale, where secured lenders may 'credit bid' their debt instead of cash. To confirm a plan, the court checks that it's feasible (unlikely to fail again) and in the best interests of creditors."},
    {"kind": "how", "title": "Outside court", "text": "Exchange offers swap old bonds for new ones, but some holders refuse (holdouts); exit consents, which strip covenants from the old bonds, make holding out less attractive.\nRestructuring support agreements (RSAs) lock in key creditors before a filing, so a quick pre-packaged plan can follow."},
    {"kind": "example", "text": "A retailer's stores, stock and brand would raise US$250m in a liquidation, after wind-down costs, but the business is worth US$400m if it keeps trading.\nRestructuring keeps US$150m more value for creditors."},
    {"check": "rx-16"},
    {"section": "UK and Europe: schemes and restructuring plans"},
    {"kind": "idea", "text": "In England, two court procedures under the Companies Act 2006 can bind creditors who vote against a deal: the scheme of arrangement (Part 26) and the restructuring plan (Part 26A, added in 2020 for companies in financial difficulty). Creditors vote in classes of people with similar rights, then the court decides whether to sanction the deal."},
    {"kind": "formula", "text": "Scheme: in every class, a majority in number of those voting, holding at least 75% of the value voting\nRestructuring plan: at least 75% of the value voting in a class, with no headcount test", "note": "A plan can also bind a whole class that votes against it (cross-class cram-down); a scheme can't."},
    {"kind": "how", "title": "Cross-class cram-down", "text": "The court can sanction a plan over a class that voted against it if two conditions are met:\nNo one in that class is worse off than in the relevant alternative: whatever would most likely happen if the plan failed, often an administration.\nAt least one class that would be paid, or have a genuine economic interest, in that alternative voted for the plan by 75% of value.\nEven then, the court has a discretion: it checks that the plan shares out the value it creates fairly."},
    {"kind": "read", "title": "UK versus US", "text": "Both systems protect creditors who vote no with a 'no worse off' test, but against different benchmarks. The US best-interests test compares each creditor with a Chapter 7 liquidation; the UK compares the dissenting class with the relevant alternative, which can be a sale of the business as a going concern rather than a break-up.\nOn ranking, a US cram-down must follow the absolute priority rule: a dissenting class is paid in full before anyone junior keeps value. The UK has no fixed rule like it: the court decides whether any departure from the ranking is justified."},
    {"kind": "example", "text": "Under a plan, unsecured creditors get 12% of their claims; in the relevant alternative, an administration, they'd get 5%. They vote 60% in favour by value, short of 75%. The secured lenders, repaid in full in that administration, vote 90% in favour.\nNo worse off: 12% beats 5%. A class that would be paid approved. So the court can sanction the plan despite the no vote, if it finds the plan fair."},
    {"kind": "watch", "text": "A plan isn't a rubber stamp. In Adler (2024), the Court of Appeal set aside a plan that treated noteholders of equal rank differently: creditors who'd share equally in the relevant alternative should normally share the value the plan creates equally, unless there's a good reason not to."},
    {"kind": "practice", "text": "London: Virgin Atlantic used the first restructuring plan in 2020, and Thames Water's 2025 plan was sanctioned over two dissenting classes of junior creditors, then upheld on appeal.\nMilan: Italy's crisis code, which implements the EU Restructuring Directive (2019/1023) and has applied since 2022, also lets a court confirm a concordato preventivo (an arrangement with creditors under court supervision) over dissenting classes. Above what creditors would get in a liquidation, it uses a looser 'relative priority' rule."},
    {"check": "rx-why-03"}
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
  "source": [
    {
      "text": "United States Courts, Chapter 11 – Bankruptcy Basics",
      "url": "https://www.uscourts.gov/services-forms/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics"
    },
    {
      "text": "Companies Act 2006, Part 26: schemes of arrangement (legislation.gov.uk)",
      "url": "https://www.legislation.gov.uk/ukpga/2006/46/part/26"
    },
    {
      "text": "Companies Act 2006, Part 26A: restructuring plans and cross-class cram-down (legislation.gov.uk)",
      "url": "https://www.legislation.gov.uk/ukpga/2006/46/part/26A"
    },
    {
      "text": "Court of Appeal of England and Wales, the Adler restructuring plan judgment (2024)",
      "url": "https://caselaw.nationalarchives.gov.uk/ewca/civ/2024/24"
    }
  ],
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
