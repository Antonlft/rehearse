// Lesson: Information & investment memos. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("memo", {
  "status": "draft",
  "newQuestions": "2026-11-26",
  "summary": [
    "Two documents share the name: the bank's information memorandum (IM) sells a company to buyers; a fund's investment memo asks its investment committee (IC) to approve a deal.",
    "An IM opens with the key investment highlights, then proves each one: market, business model, customers, team, growth plan and financials. It never states a price.",
    "An investment memo puts the recommendation first, then sets management's plan against the fund's own, more cautious case, with returns, risks and how each risk is limited.",
    "Both stand or fall on evidence: every claim backed by a number, figures that match the model and due diligence, and risks stated plainly."
  ],
  "method": [
    {"section": "1. Two documents called IM"},
    {"kind": "idea", "text": "An information memorandum is written by the seller's adviser to make buyers bid. An investment memo is written by a buyer's deal team to win its own investment committee's approval. The first argues for the company; the second decides whether to back it, and at what price."},
    {"kind": "how", "text": "Information memorandum: written by the sell-side bank with the company's management, sent to buyers once they sign a non-disclosure agreement (NDA), usually 40 to 80 pages. Buyers use it to make an indicative, non-binding offer. In the US it's often called a confidential information memorandum (CIM).\nInvestment memo: written by the fund's deal team for its investment committee (IC), first before an indicative offer, then updated before the binding offer. It ends with a request: approve the deal on these terms, or pass.\nIn between: the buyer adds its own due diligence, the vendor due diligence (VDD) reports and meetings with management to what the information memorandum told it."},
    {"kind": "example", "text": "A bank runs the sale of a software company. Buyers that sign the NDA receive its 60-page information memorandum.\nA fund uses it, plus calls with experts and the VDD, to write a 25-page investment memo; its committee approves an indicative offer.\nAfter the data room and management presentation, the team updates the memo for the binding offer."},
    {"kind": "watch", "text": "Don't treat the information memorandum as fact. Its figures come from management and its job is to sell, so a buyer tests every highlight in due diligence before it goes into the investment memo."},
    {"check": "memo-01"},
    {"section": "2. Building an information memorandum"},
    {"kind": "idea", "text": "The information memorandum tells the company's equity story: why the business is worth owning and why it will keep growing. The highlights come first, and every later section proves one of them."},
    {"kind": "how", "text": "Disclaimer and contacts: confidentiality, no promise that the figures are complete, and who to call at the bank.\nExecutive summary: the company on one page, its key figures and 4 to 6 key investment highlights.\nMarket: size, growth, trends and competitors, and where the company sits among them.\nOffer and business model: what it sells, to whom, how it earns money and how much of it recurs.\nCustomers: how many, how concentrated, how long they stay, and revenue bridges (new, retained and lost customers).\nOperations and technology: suppliers, sites, systems and what would be hard for a rival to copy.\nTeam and organisation: management's track record, headcount, and environmental, social and governance (ESG) commitments.\nGrowth strategy: the levers in the business plan and how much each one adds.\nFinancials: historical income statement, balance sheet and cash flow, current trading, the business plan, and the bridge from reported to adjusted EBITDA.\nAppendices: legal structure, the detailed plan and a quality of earnings (QoE) summary."},
    {"kind": "read", "text": "A highlight is only as strong as its proof.\nMarket leader: needs a market share and a ranking.\nRecurring revenue: needs the share of revenue under contract and how much of it customers renew.\nStrong growth: needs the growth rate and where it came from (price, volume, new customers or acquisitions)."},
    {"kind": "example", "text": "Before: \"Loyal customers.\"\nAfter: \"The top 20 customers have stayed 9 years on average, and 92% of last year's revenue came from customers already active the year before.\"\nThe customers section then shows the revenue bridge behind those two numbers."},
    {"kind": "watch", "text": "No price and no valuation: the seller wants buyers to say what the company is worth.\nOne set of numbers: the information memorandum, the business plan model and the VDD must match, or buyers stop trusting all three."},
    {"check": "memo-06"},
    {"section": "3. Building an investment memo"},
    {"kind": "idea", "text": "An investment memo answers one question for the committee: should we invest, on what terms, and what could go wrong? Every part of it supports or tests that recommendation."},
    {"kind": "how", "text": "Executive summary: the deal in a paragraph, the price and the fund's cheque, the investment thesis in 3 to 5 points, the returns and the recommendation.\nCompany, market and competition: shorter than in the information memorandum, and in the fund's own words and view.\nValue creation plan: the levers the fund will pull (new markets, pricing, add-on acquisitions) and why this fund is the right owner.\nFinancials: historical figures, quality of earnings and net debt adjustments, current trading, then management's case against the fund's case.\nValuation and structure: entry price and multiple, sources and uses of funds, who owns what after the deal, the management package and the exit route.\nReturns: multiple of invested capital (MOIC) and internal rate of return (IRR) in each case, with sensitivities.\nThen: risks and how each is limited, due diligence findings, the ESG review, a SWOT (strengths, weaknesses, opportunities and threats), and the conclusion. Appendices hold the detail."},
    {"kind": "read", "text": "Management's case is the seller's business plan. The fund's case cuts what it can't yet prove: usually slower growth, smaller margin gains or fewer acquisitions.\nThe committee wants the deal to work in the fund's case. Management's case is the upside, not the base."},
    {"kind": "example", "text": "Management plans EBITDA growth of 15% a year, including three acquisitions. The fund's case keeps 8% organic growth and only the one acquisition already under negotiation.\nThe memo shows 3.0x MOIC in management's case and 2.2x in the fund's case, and recommends the deal because 2.2x still beats the fund's 2.0x target."},
    {"kind": "watch", "text": "A risk without a mitigant isn't analysis. \"Customer concentration\" must come with what limits it: contract length, a lower multiple, or part of the price paid only if targets are met (an earn-out)."},
    {"check": "memo-why-01"},
    {"section": "4. Writing it so it convinces"},
    {"kind": "idea", "text": "Readers skim, so put the answer first and the proof after. Someone who stops after the first page should know the deal, the price, the thesis and the recommendation."},
    {"kind": "how", "text": "Lead with the conclusion, then three to five reasons, each with its evidence.\nMake each claim testable: a number, a source and a date, not an adjective.\nKeep facts, management's claims and your own view apart, and say which is which.\nUse one source of numbers: every figure ties back to the model, so a change in the model changes the document.\nShow what breaks the case: how returns move with the exit multiple and with growth, and what the downside looks like."},
    {"kind": "example", "text": "Weak: \"The company is a market leader with strong growth.\"\nStrong: \"Number 2 in the US with a 14% share; revenue grew 11% a year over 2021–2024, 4 points faster than the market, mostly from new customers.\""},
    {"kind": "watch", "text": "Common mistakes: highlights with no proof, numbers that don't tie to the model, sales language in an investment memo, risks listed without mitigants, and a summary that hides the recommendation."},
    {"kind": "practice", "text": "Interviewers ask \"What goes into an information memorandum?\" or \"How would you structure an investment memo?\". Give the structure in order, then say what the reader is looking for in each part."},
    {"check": "memo-23"}
  ],
  "example": {
    "question": "A fund can buy a company with US$50m of EBITDA at 10x, with debt of 5x EBITDA. Management's plan grows EBITDA 12% a year for 5 years; the fund's case uses 7%. Exit at 10x after 5 years. For simplicity, ignore fees and debt repayment. What does each case return, and what should the investment memo recommend if the fund's target is 2.0x?",
    "working": [
      "Entry: price = 10 × 50 = US$500m; debt = 5 × 50 = US$250m; fund's equity = 500 − 250 = US$250m",
      "Management's case: EBITDA in year 5 = 50 × 1.12^5 = US$88.1m; exit value = 10 × 88.1 = US$881m; equity = 881 − 250 = US$631m",
      "MOIC = 631 ÷ 250 = 2.5x; IRR = 2.5^(1/5) − 1 ≈ 20%",
      "Fund's case: EBITDA in year 5 = 50 × 1.07^5 = US$70.1m; exit value = US$701m; equity = 701 − 250 = US$451m",
      "MOIC = 451 ÷ 250 = 1.8x; IRR = 1.8^(1/5) − 1 ≈ 12.5%",
      "The fund's case misses 2.0x. Equity that would give 2.0x = 451 ÷ 2 = US$226m, so price = 226 + 250 = US$476m, about 9.5x EBITDA"
    ],
    "answer": "Management's case returns 2.5x (about 20% a year), the fund's case only 1.8x (about 12.5%). The memo should lead with the fund's case and recommend bidding no more than about 9.5x EBITDA, or show what else (debt repayment, a proven lever) closes the gap; management's case is the upside."
  },
  "source": [
    { "text": "Mergers & Inquisitions: What's in a confidential information memorandum (CIM)", "url": "https://mergersandinquisitions.com/confidential-information-memorandum/" },
    { "text": "Carta: Investment memos in private funds", "url": "https://carta.com/uk/en/learn/private-funds/management/portfolio-management/investment-memo/" }
  ]
});
