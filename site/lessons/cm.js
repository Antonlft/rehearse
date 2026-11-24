// Lesson: ECM & DCM. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("cm", {
  "status": "draft",
  "summary": [
    "Companies raise equity through IPOs, follow-on offerings, block trades and rights issues, and raise debt by issuing bonds.",
    "In a rights issue, new shares are offered to existing holders at a discount, so the share price falls and the rights carry that value.",
    "In a venture round, post-money = pre-money + new money, and the investor's stake = new money ÷ post-money.",
    "Preferred shares protect investors: a liquidation preference pays them back first, and anti-dilution lowers their price in a down round."
  ],
  "method": [
    {"section": "Rights issues"},
    {"kind": "idea", "text": "Equity capital markets (ECM) raise money through initial public offerings (IPOs), follow-on offerings, block trades and rights issues; debt capital markets (DCM) do it through bonds. In a rights issue, existing shareholders can buy new shares in proportion to what they hold, usually at a discount, so they can avoid being diluted."},
    {"kind": "formula", "title": "Theoretical ex-rights price (TERP)", "text": "TERP = {{N × old price + subscription price // N + 1}}\nValue of one right = TERP − subscription price", "note": "For 1 new share per N held."},
    {"kind": "read", "text": "Shareholders who take up their rights, or sell them, lose nothing; those who do neither lose value."},
    {"kind": "example", "text": "Shares trade at US$12, and the company offers one new share for every two held, at US$6.\nTERP = (2 × US$12 + US$6) ÷ 3 = US$10, so each right is worth about US$10 − US$6 = US$4."},
    {"check": "cm-why-01"},
    {"section": "Venture rounds"},
    {"kind": "formula", "text": "Post-money = pre-money + new money\nInvestor's stake = {{new money // post-money}}", "note": "US$5m at US$20m pre-money buys 20% of a US$25m post-money company."},
    {"kind": "how", "text": "Investors usually get preferred shares. A 1x non-participating liquidation preference pays them the larger of their money back or their share of the sale proceeds; participating preferred takes both."},
    {"kind": "example", "text": "An investor puts in US$8m at a US$32m pre-money valuation: post-money = US$40m, and it owns 8 ÷ 40 = 20%. The founders go from 100% to 80%."},
    {"kind": "watch", "text": "Anti-dilution protects investors in a down round (a new round priced below theirs): full ratchet is harsh on founders; broad-based weighted average, the norm, is milder.\nAn option pool created inside the pre-money valuation dilutes only the existing holders, not the new investor."},
    {"check": "cm-15"}
  ],
  "example": {
    "question": "A share trades at US$12. The company offers 1 new share for every 3 held, at US$8. What are the TERP and the value of each right?",
    "working": [
      "TERP = (3 × 12 + 8) ÷ 4 = 44 ÷ 4 = US$11.00",
      "Right to one new share = 11.00 − 8.00 = US$3.00",
      "Per existing share: 3.00 ÷ 3 = US$1.00"
    ],
    "answer": "TERP US$11.00; each right to a new share is worth US$3.00 (US$1.00 per existing share)."
  },
  "source": {
    "text": "Investor.gov (the US Securities and Exchange Commission, SEC), Rights offering",
    "url": "https://www.investor.gov/introduction-investing/investing-basics/glossary/rights-offering"
  },
  "widget": {
    "type": "terp",
    "values": {
      "p": 12,
      "k": 3,
      "s": 8
    }
  }
});
