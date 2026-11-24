/* Out-loud prompts: open interview questions answered aloud (and optionally recorded), then checked against the key
   points. The out-loud page also uses every walk-through card from the question bank; these are the extra prompts,
   mostly fit and motivation, which have no right answer to check in a round. group: "fit" or a category id. secs: the
   length to aim for. tip: how to shape the answer, shown with the key points. status: "draft" until reviewed.
   ids never change once published. */
Bank.addOutLoud([
  // Fit and motivation
  { id: "ol-fit-01", group: "fit", lv: 1, secs: 90, status: "draft",
    q: "Tell me about yourself.",
    points: [
      "Opens with who you are now in one sentence (studies, current role).",
      "Two or three steps that led you to finance, each with what it taught you.",
      "Links those steps to this role, so the move looks like the natural next one.",
      "Ends on what you bring and why you're in the room today.",
      "Stays under about 90 seconds and doesn't read out the CV line by line."
    ],
    tip: "Present, past, future: where you are, how you got here, why this role is next. Pick the two or three facts that make the story, not every line of the CV." },
  { id: "ol-fit-02", group: "fit", lv: 1, secs: 90, status: "draft",
    q: "Why investment banking?",
    points: [
      "Gives two or three clear reasons, not a list of everything.",
      "At least one reason is about the work itself: deals, analysis, advising companies on big decisions.",
      "Backs a reason with something you did: an internship, a course project, a deal you followed.",
      "Shows you know the hard parts (hours, pressure) and why they don't put you off.",
      "Doesn't lead with pay or prestige."
    ],
    tip: "Hook, then two or three reasons, each with a piece of proof from your own experience, then a one-line close." },
  { id: "ol-fit-03", group: "fit", lv: 2, secs: 90, status: "draft",
    q: "Why private equity rather than investment banking?",
    points: [
      "Contrasts advising on a deal with owning the outcome after it closes.",
      "Mentions the investor mindset: judging whether a business is worth buying, not only getting the deal done.",
      "Mentions working with portfolio companies over several years on how they grow.",
      "Backs it with something you've done or studied, such as a paper LBO, an investment club or a case.",
      "Stays respectful of banking: it's a different role, not an escape."
    ],
    tip: "Say what's different about the job, then why that difference suits you, with one example. Never run banking down." },
  { id: "ol-fit-04", group: "fit", lv: 2, secs: 60, status: "draft",
    q: "Why our firm?",
    points: [
      "Names something specific to the firm: its sectors, its deals, its size or its way of working.",
      "Mentions a recent deal or fund and why it interested you.",
      "Mentions people you've spoken to, if you have, and what struck you.",
      "Links the firm's profile to what you want to learn.",
      "Couldn't be said word for word about a competitor."
    ],
    tip: "Two or three reasons that only fit this firm. If the answer would work for any bank or fund, it's too general." },
  { id: "ol-fit-05", group: "fit", lv: 1, secs: 120, status: "draft",
    q: "Tell me about a time you worked in a team under pressure.",
    points: [
      "Sets the scene in one or two sentences: the team, the deadline, what was at stake.",
      "Says clearly what you did yourself, not only what the team did.",
      "Explains a choice you made and why, such as how you split the work or what you dropped.",
      "Gives the result, with a number or a concrete outcome if possible.",
      "Ends with what you learned and would do again or differently."
    ],
    tip: "Situation, task, action, result (STAR), with most of the time on the action. Say I, not we, for your own part." },
  { id: "ol-fit-06", group: "fit", lv: 1, secs: 60, status: "draft",
    q: "What is your main weakness?",
    points: [
      "Names a real weakness, not a strength in disguise such as working too hard.",
      "Picks one that won't stop you doing the job.",
      "Gives a short example of when it showed.",
      "Explains what you're doing about it, with a concrete habit or tool.",
      "Shows the progress so far."
    ],
    tip: "Honest, small enough not to rule you out, and already being fixed. Most of the answer is about the fix." },
  { id: "ol-fit-07", group: "fit", lv: 2, secs: 120, status: "draft",
    q: "Tell me about a deal you have followed recently.",
    points: [
      "Names the buyer, the target, the size and roughly when it was announced.",
      "Explains the reason for the deal: what the buyer gets that it couldn't easily build.",
      "Gives the price as a multiple (for example of EBITDA) and says whether it looks high or low against peers.",
      "Mentions how it was paid for (cash, shares, debt) and what that says.",
      "Gives your own view: a risk, or whether you'd have done it."
    ],
    tip: "Who, what, why, at what price, and your view. Prepare two deals in the sectors of the firm you're seeing." },
  { id: "ol-fit-08", group: "fit", lv: 1, secs: 90, status: "draft",
    q: "Tell me about a time you made a mistake.",
    points: [
      "Picks a real mistake with some consequence, not a trivial one.",
      "Owns it plainly, without blaming others.",
      "Says what you did straight away to limit the damage, including telling the right person.",
      "Says what you changed afterwards so it wouldn't happen again.",
      "Keeps it short and ends on the lesson."
    ],
    tip: "Mistake, fix, lesson. Interviewers want to see that you own errors and catch them early, which matters in a team checking numbers." },

  // Technical
  { id: "ol-val-01", group: "val", lv: 2, secs: 90, status: "draft",
    q: "Why might two companies with the same EBITDA trade at different multiples?",
    points: [
      "Growth: faster expected growth earns a higher multiple.",
      "Cash conversion: less capital spending and working capital per dollar of EBITDA means more free cash flow.",
      "Risk: steadier, more predictable earnings and a stronger market position earn a higher multiple.",
      "Returns on capital and margins: a business that earns more on what it invests is worth more.",
      "Size and liquidity: larger, more traded companies often trade at a premium."
    ],
    tip: "A multiple is a shortcut for a discounted cash flow (DCF) valuation, so the answer is the DCF drivers: growth, cash flow and risk. Name them, then give an example." },
  { id: "ol-val-02", group: "val", lv: 2, secs: 90, status: "draft",
    q: "Enterprise value or equity value: which multiples go with which, and why?",
    points: [
      "Enterprise value is the value of the whole business to all its funders; equity value is the shareholders' part.",
      "Measures before interest (revenue, EBITDA, EBIT) go with enterprise value, because they belong to all funders.",
      "Measures after interest (net income, earnings per share) go with equity value, as in the price-to-earnings ratio.",
      "Matching them keeps the multiple the same whatever the mix of debt and equity.",
      "The bridge: enterprise value = equity value + net debt + other claims such as minority interests and preferred shares."
    ],
    tip: "Define both values, give the matching rule, then the reason. One line on the bridge shows you can move between them." },
  { id: "ol-val-03", group: "val", lv: 2, secs: 120, status: "draft",
    q: "Walk me through how you would build a set of trading comparables.",
    points: [
      "Choose peers on business model, sector, size, growth and geography, and say why each made the cut.",
      "Gather each peer's share price, diluted shares and net debt to get equity value and enterprise value.",
      "Use clean figures: remove one-off items and use the same period (last twelve months or next year's forecast) for all.",
      "Work out the multiples, such as enterprise value to EBITDA and price to earnings, and look at the median and range.",
      "Apply a range to the target's own figures and explain where in the range it should sit and why."
    ],
    tip: "Pick, gather, clean, compare, apply. Most of the judgement is in picking the peers and in where the target sits in the range." },
  { id: "ol-val-04", group: "val", lv: 2, secs: 90, status: "draft",
    q: "EBITDA or free cash flow: which matters more to a buyer, and why?",
    points: [
      "EBITDA is a quick, comparable measure of operating profit before financing and accounting choices.",
      "It ignores capital spending, working capital and tax, which are real cash costs.",
      "Free cash flow is what's actually left to repay debt and pay owners.",
      "Two businesses with the same EBITDA can produce very different cash, so a buyer looks at cash conversion.",
      "Lenders size debt on EBITDA, but whether the debt can be repaid depends on free cash flow."
    ],
    tip: "Say what each one is, what EBITDA leaves out, and why a buyer ends up caring about cash. Close with the lender angle." },
  { id: "ol-acc-01", group: "acc", lv: 2, secs: 90, status: "draft",
    q: "What is working capital, and why does it matter in a deal?",
    points: [
      "Working capital is the short-term operating assets less short-term operating liabilities: mainly receivables plus inventory minus payables.",
      "A rise in working capital ties up cash, so a growing business can be profitable and still short of cash.",
      "It can move with the seasons, so a single balance sheet date can mislead.",
      "In a sale, the buyer and seller agree a normal level (a peg), and the price is adjusted if the business is handed over with less or more.",
      "Buyers look for ways to free cash from it, such as collecting faster or holding less stock."
    ],
    tip: "Define it, say how it hits cash, then bring in the deal: seasonality, the peg and the price adjustment." },
  { id: "ol-lbo-01", group: "lbo", lv: 1, secs: 90, status: "draft",
    q: "How does a private equity fund make money on a buyout?",
    points: [
      "Growing EBITDA, through more sales, better margins or acquisitions.",
      "Paying down debt from the company's cash flow, so more of the value belongs to the fund at exit.",
      "Selling at a higher multiple than it paid, which is the least reliable lever.",
      "Debt amplifies all of this: the fund puts in a small share of the price, so a gain in value is a bigger gain on its equity.",
      "The return is measured by the multiple of money (MOIC) and the yearly return (IRR)."
    ],
    tip: "Three levers, then leverage as the amplifier, then how the return is measured. Say which lever a good fund relies on least." },
  { id: "ol-lbo-02", group: "lbo", lv: 2, secs: 120, status: "draft",
    q: "What are the main risks in an LBO, and how would you protect the downside?",
    points: [
      "Too much debt: if earnings fall, the company can't pay interest or breaches its covenants.",
      "Paying too much: a high entry multiple needs a high exit multiple or strong growth.",
      "The plan doesn't happen: growth or cost savings take longer or never arrive.",
      "Interest rates rise, for debt that isn't fixed or hedged.",
      "Protection: moderate leverage, a fair entry price, a business with steady cash flow, hedging rates, and a plan that still works with no multiple expansion."
    ],
    tip: "Group the risks (debt, price, plan, rates), then answer the second half: how you would structure or price the deal so the downside is survivable." },
  { id: "ol-lbo-03", group: "lbo", lv: 2, secs: 120, status: "draft",
    q: "Talk me through how you would do a paper LBO (leveraged buyout) in an interview.",
    points: [
      "Write down the assumptions as a small table: EBITDA, entry multiple, debt, growth, cash conversion, exit.",
      "Entry: price = multiple × EBITDA; equity = price − debt (+ fees).",
      "Project EBITDA to the exit year, and the cash available to repay debt each year.",
      "Exit: exit multiple × exit EBITDA, minus the debt still owed, gives the equity at exit.",
      "Returns: multiple of money = exit equity ÷ equity in; turn it into an IRR with rules of thumb (2x over 5 years ≈ 15%, 3x ≈ 25%).",
      "Sanity-check the answer and say which assumption matters most."
    ],
    tip: "Narrate it as entry, projection, exit, returns. Saying each step aloud while you write is part of what's being tested." },
  { id: "ol-mna-01", group: "mna", lv: 1, secs: 90, status: "draft",
    q: "Why do companies make acquisitions, and why do many fail to create value?",
    points: [
      "Reasons: growth faster than building it, new products or markets, cost savings, buying technology or people.",
      "Revenue and cost synergies are the usual case for paying a premium.",
      "Failure: paying too much, so the synergies all go to the seller.",
      "Failure: synergies that come late or not at all, often because integration is hard.",
      "Failure: culture clashes and losing key people or customers."
    ],
    tip: "Two halves: why they buy, then why it often goes wrong. Price and integration are the two big reasons it goes wrong." },
  { id: "ol-mna-02", group: "mna", lv: 2, secs: 90, status: "draft",
    q: "A strategic buyer and a private equity fund bid for the same company. Who can usually pay more, and why?",
    points: [
      "Usually the strategic buyer, because it can count on synergies a fund doesn't have.",
      "A strategic buyer may also have a lower cost of capital and a longer horizon.",
      "A fund is limited by how much debt the company can carry and by its target return.",
      "But a fund can win when credit is cheap and plentiful, or with a platform company that brings its own synergies.",
      "A fund can also move fast and offer management a stake, which can matter beyond price."
    ],
    tip: "Give the usual answer and the reason, then the cases where the fund wins. Showing both sides is the point." },
  { id: "ol-cf-01", group: "cf", lv: 2, secs: 90, status: "draft",
    q: "How would you choose between paying for an acquisition with debt or with new shares?",
    points: [
      "Debt is usually cheaper, and interest is tax-deductible.",
      "Debt adds risk: interest must be paid, and too much can hurt the credit rating.",
      "New shares dilute existing shareholders and send a signal that management thinks its shares are fully valued.",
      "Shares make sense when the company's own shares are highly valued, or when it can't take on more debt.",
      "Look at the effect on earnings per share, leverage and rating, and at what the target's owners want to receive."
    ],
    tip: "Cost, risk and signal for each option, then what decides it in practice: leverage headroom, share valuation and the seller's preference." },
  { id: "ol-credit-01", group: "credit", lv: 2, secs: 90, status: "draft",
    q: "What covenants would a lender want in a leveraged loan, and why?",
    points: [
      "Maintenance covenants are tested regularly, such as maximum debt to EBITDA or minimum interest cover.",
      "Incurrence covenants only bite when the company does something, such as borrowing more or paying a dividend.",
      "Limits on extra debt, dividends, asset sales and acquisitions, to keep value in the company.",
      "Reporting requirements, so the lender sees problems early.",
      "Covenants give the lender a seat at the table before things go badly wrong; looser loans with few of them are called covenant-lite."
    ],
    tip: "Two kinds (maintenance and incurrence), the main restrictions, then why they matter: early warning and keeping value in the business." }
]);
