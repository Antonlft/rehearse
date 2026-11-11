// Lesson: ECM & DCM. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("cm", {
  "status": "draft",
  "method": [
    "Equity capital markets (ECM) raise money through IPOs, follow-on offerings, block trades and rights issues; debt capital markets (DCM) do it through bonds. In a rights issue, existing shareholders get the right to buy new shares in proportion to what they hold, usually at a discount, so they can avoid being diluted.",
    "After a rights issue the share price adjusts to the theoretical ex-rights price (TERP). For 1 new share per N held: TERP = (N × old price + subscription price) ÷ (N + 1). A right is worth TERP minus the subscription price. Shareholders who take up their rights, or sell them, lose nothing; those who do neither lose value.",
    "Venture rounds are priced on a pre-money valuation: post-money = pre-money + new money, and the investor's stake = new money ÷ post-money. Investors usually get preferred shares. A 1x non-participating liquidation preference pays them the larger of their money back or their share of the sale proceeds; participating preferred takes both. Anti-dilution protects them in a down round (full ratchet is harsh on founders, broad-based weighted average is the norm), and an option pool created inside the pre-money dilutes only the existing holders. For example, US$5m at US$20m pre-money buys 20% of a US$25m post-money company."
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
    "text": "Investor.gov (US SEC), Rights offering",
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
