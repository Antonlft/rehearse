Bank.add("cf", [
  { id: "cf-01", lv: 2, trap: ["sign", "sign", "sign"], q: "All else equal, which of the following would increase a company's weighted average cost of capital (WACC)?",
    o: ["A higher cost of debt after a credit rating downgrade", "A fall in the company's equity beta", "A fall in the risk-free rate", "Replacing some equity with cheaper debt, at a moderate level of leverage"],
    why: "A downgrade raises the cost of debt, which feeds straight into WACC.",
    x: ["A lower beta lowers the cost of equity, so WACC falls.", "A lower risk-free rate lowers both the cost of equity and of debt.", "At moderate leverage, cheaper after-tax debt lowers WACC; it only rises once distress risk kicks in."] },
  { id: "cf-02", lv: 1, q: "A company whose return on invested capital (ROIC) consistently exceeds its WACC is:",
    o: ["Creating economic value with the capital it invests", "Over-leveraged compared with the peers in its sector", "At risk of a going-concern qualification from its auditors", "Likely to see its share count rise as it issues new equity"],
    why: "Its capital earns more than it costs, so every dollar it reinvests adds value.",
    x: ["ROIC is measured on all invested capital, however it's financed; it says nothing about leverage.", "Earning above the cost of capital is a sign of health.", "ROIC says nothing about issuing shares."] },
  { id: "cf-03", lv: 2, q: "In Modigliani–Miller's world with no taxes or frictions, how does capital structure affect firm value?",
    o: ["It has no effect", "More debt always increases value", "More equity always increases value", "Paying dividends increases value"],
    why: "How you split cash flows between debt and equity doesn't change their total. Taxes and distress costs are what make structure matter in practice.",
    x: ["Debt only adds value once taxes are introduced, through the tax shield.", "Equity is more expensive, but in MM the overall cost of capital doesn't change.", "MM also shows payout policy is irrelevant in perfect markets."] },
  { id: "cf-04", lv: 1, q: "Why is debt usually cheaper than equity?",
    o: ["Lenders rank ahead of shareholders, and interest is tax-deductible", "Debt carries no risk of loss, because lenders always hold security", "Lenders accept lower returns because they can't vote at meetings", "Debt never needs to be repaid, as it can always be refinanced"],
    why: "Contractual payments and seniority mean lenders need less return, and the tax deduction cuts the after-tax cost further.",
    x: ["Debt can default; it's just less risky than equity.", "The lower return compensates for lower risk, not for the lack of a vote.", "Debt must be repaid, which is part of why it's safer for lenders."] },
  { id: "cf-05", lv: 1, trap: ["sign", null, null], q: "How does a company's levered (equity) beta change as it takes on more debt?",
    o: ["It rises", "It falls", "It stays the same", "It depends on the dividend policy"],
    why: "Debt makes equity returns more volatile: βL = βU × (1 + (1 − t) × D/E).",
    x: ["More debt makes equity riskier, not safer.", "Leverage changes equity risk, so the beta changes.", "Dividends don't enter the relevering formula."] },
  { id: "cf-06", lv: 2, trap: ["missed-step", null, null], q: "When estimating beta from listed peers, what's the right approach?",
    o: ["Unlever each peer's beta, average them, then relever at the target's debt", "Average the peers' levered betas directly, weighting each by its market value", "Use a beta of 1.0 for every company, since the market average is 1.0", "Use the highest peer beta, to be prudent about the target's risk"],
    why: "Peers have different leverage. Stripping it out isolates business risk, which you then relever for your company's debt.",
    x: ["Raw betas mix business risk with each peer's leverage.", "1.0 ignores the business's actual risk.", "Picking the highest is arbitrary and biased."] },
  { id: "cf-07", lv: 3, q: "Ignoring taxes and assuming fair pricing, how do a share buyback and a cash dividend of the same size compare for shareholders?",
    o: ["Shareholder wealth is the same either way", "The buyback always destroys value", "The dividend always lifts the share price", "The buyback increases enterprise value"],
    why: "Both return the same cash. With a dividend you get cash and the price drops; with a buyback, sellers get cash and the rest own more of a smaller company.",
    x: ["A buyback at fair value is neutral; only overpaying destroys value.", "The share price falls by about the dividend on the ex-date.", "Returning cash shrinks the company; EV doesn't rise."] },
  { id: "cf-08", lv: 1, q: "What is the main weakness of the payback period as an investment criterion?",
    o: ["It ignores the time value of money and cash flows after payback", "It's too complex to calculate without a full financial model", "It requires an estimate of WACC, which is hard to pin down", "It always overstates the risk of long-lived investment projects"],
    why: "Payback just counts years to recover the outlay, so it can reject valuable long-term projects.",
    x: ["Its weakness is being too simple.", "Simple payback uses no discount rate at all.", "It says nothing reliable about risk."] },
  { id: "cf-09", lv: 2, trap: ["wrong-measure", "wrong-measure", "wrong-measure"], q: "Two mutually exclusive projects rank differently on NPV and IRR. Which should you choose?",
    o: ["The one with the higher NPV", "The one with the higher IRR", "The one with the shorter payback", "The one with higher revenue"],
    why: "NPV measures the value added in money terms. IRR ignores scale and can mislead when timing differs.",
    x: ["50% on $1m adds less value than 20% on $100m.", "Payback ignores discounting and later cash flows.", "Revenue says nothing about value created."] },
  { id: "cf-10", lv: 2, q: "According to the trade-off theory, how is the optimal capital structure set?",
    o: ["By balancing the tax shield from debt against the costs of financial distress", "By borrowing as much as lenders allow, to make the most of the tax shield", "By having no debt at all, so the company can never fall into distress", "By matching competitors' dividend payouts and leverage in the same sector"],
    why: "Each extra unit of debt adds tax shield but raises distress costs. The optimum is where the two balance at the margin.",
    x: ["Beyond a point, distress costs outweigh the tax shield.", "Zero debt leaves the tax shield unused.", "Dividends are payout policy, not capital structure."] },
  { id: "cf-11", lv: 2, trap: ["inverted", "inverted", null], q: "What does the pecking order theory say about how companies fund themselves?",
    o: ["They prefer internal funds first, then debt, and equity last", "They prefer equity first, as it never has to be repaid", "They prefer debt before internal funds, to keep a cash buffer", "They have no preference, as Modigliani–Miller says it doesn't matter"],
    why: "Issuing equity can signal that managers think shares are overvalued, so firms use cash first, then debt, and equity last.",
    x: ["Equity comes last because of the negative signal.", "Internal funds come before debt.", "The theory is about a clear ranking driven by information asymmetry, not the no-tax Modigliani–Miller world."] },
  { id: "cf-12", lv: 1, trap: ["wrong-measure", "wrong-measure", "missed-step"], q: "What is the equity risk premium?",
    o: ["The extra return expected from equities above the risk-free rate", "The return expected from equities above the rate of inflation", "A single stock's expected return above the return of the market", "The market's dividend yield, as the cash return paid to investors"],
    why: "It's the reward for holding equities instead of risk-free assets, commonly assumed at around 4–6% in CAPM.",
    x: ["Return above inflation is a real return.", "That's a stock's excess return over the market.", "The dividend yield is only part of equity returns."] },
  { id: "cf-13", lv: 1, trap: ["sign", "sign", "sign"], q: "How is the cash conversion cycle calculated?",
    o: ["Days inventory + days sales outstanding − days payables outstanding", "Days inventory + days payables outstanding − days sales outstanding", "Days sales outstanding − days inventory, with payables left out", "Days payables outstanding + days sales outstanding − days inventory"],
    why: "Cash is tied up while goods sit in stock and customers pay, offset by the time taken to pay suppliers.",
    x: ["Paying suppliers later shortens the cycle, so payables are subtracted.", "Inventory days lengthen the cycle; they aren't subtracted.", "Payables shorten the cycle, so they're subtracted, and inventory days lengthen it."] },
  { id: "cf-14", lv: 3, trap: [null, "missed-step", null], q: "What is the present value of the tax shield on permanent debt D at tax rate t?",
    o: ["t × D", "D ÷ t", "t × one year's interest", "Zero"],
    why: "Permanent debt saves t × r × D in tax every year. Discounted at r as a perpetuity, that's worth t × D.",
    x: ["That formula has no economic meaning.", "The saving recurs every year the debt is outstanding, not just once.", "With taxes, interest deductibility has real value."] },
  { id: "cf-15", lv: 1, trap: ["concept", "concept", "concept"], q: "Most of a company's costs are fixed. If its revenue rises 10%, what usually happens to its operating profit (EBIT)?",
    o: ["It rises by more than 10%, as fixed costs are spread over more sales", "It rises by exactly 10%, as costs and revenue move in proportion", "It rises by less than 10%, as fixed costs have to rise along with it", "It stays the same, as the extra revenue is used up by the fixed costs"],
    why: "This is operating leverage: when most costs are fixed, most of each extra dollar of revenue drops to profit. Say revenue is US$100m, fixed costs US$60m and variable costs US$20m, so EBIT is US$20m. With revenue 10% higher, EBIT = 110 − 60 − 22 = US$28m, a 40% rise. It works in reverse too: a 10% fall in revenue cuts EBIT by 40%, which is why high operating leverage adds risk.",
    x: ["That only holds if all costs are variable.", "Fixed costs don't rise with revenue in the short run; that's what fixed means.", "The fixed costs are already paid, so only the variable costs come out of the extra revenue."] },
  { id: "cf-16", lv: 1, trap: ["concept", "wrong-measure", "inverted"], q: "In the capital asset pricing model (CAPM), why does a share's cost of equity depend on its beta rather than on how volatile it is overall?",
    o: ["Company-specific risk can be diversified away, so investors aren't paid for it", "Overall volatility can't be measured for listed shares, so beta stands in for it", "Beta is overall volatility, adjusted for the size of the company that issued it", "Investors are paid for company-specific risk, which beta captures in full"],
    why: "A share's risk splits into market (systematic) risk, which affects all shares and can't be diversified away, and company-specific (unsystematic) risk, such as a failed product launch, which mostly cancels out across a portfolio. Investors can only demand a return for the risk they can't avoid, and beta measures exactly that: how much a share moves with the market.",
    x: ["Volatility is easy to measure from share prices. It just isn't what investors are rewarded for.", "Beta measures how a share moves with the market, not overall volatility: a very volatile share can have a low beta.", "It's the other way round: company-specific risk isn't rewarded, and beta leaves it out."] }
]);

// New-format questions (shown only when "new formats" is on).
Bank.addFormat("cf", [
  // Walk-through cards: answer out loud, then grade yourself against the model answer.
  { id: "cf-walk-01", lv: 2, type: "walk", q: "How do you calculate WACC, and why does each input matter?",
    points: [
      "WACC = E/V × cost of equity + D/V × cost of debt × (1 − tax rate), with market values for the weights.",
      "Cost of equity from CAPM: risk-free rate + beta × equity risk premium, with beta usually relevered from comparable companies at the target capital structure.",
      "Cost of debt: the yield the company would pay on new debt today, not the coupon on its old debt.",
      "Interest is tax-deductible, so the cost of debt is taken after tax.",
      "The weights use a target or market capital structure, because WACC applies to future cash flows."
    ],
    why: "Explain that WACC is the average return all capital providers require, which is why it discounts unlevered free cash flow to enterprise value." }
]);

// More new formats: answer + reason and spot the error.
Bank.addFormat("cf", [
  { id: "cf-why-01", lv: 2, type: "reason",
    q: "A company returns US$100m to shareholders, either as a special dividend or as a share buyback at the market price. Ignoring taxes, which leaves a shareholder who doesn't sell any shares better off?",
    answers: ["Neither", "The buyback", "The dividend"],
    answerNotes: [
      "Earnings per share rise, but your stake in a smaller company is worth the same in total.",
      "With a buyback, a holder who doesn't sell owns a bigger share of the company, which makes up for not getting cash."],
    reasons: [
      "The same US$100m leaves the company either way, and each holder's value is unchanged",
      "A buyback lifts earnings per share, so the remaining shares are worth more in total",
      "A dividend puts cash in your hand, while a buyback only benefits those who sell",
      "Buybacks and dividends are taxed the same way, so the results always match"],
    reasonNotes: [
      "EPS goes up, but the company is US$100m smaller, so the value of your stake doesn't change.",
      "Holders who don't sell gain too: each of their shares is now a slightly bigger slice of the company.",
      "Taxes often differ between the two in practice; the question ignores them. They're equal because the same cash leaves and each holder's value is unchanged."],
    why: "Say a company is worth US$1,000m with 100m shares at US$10, and you own 1m shares. A US$100m dividend pays you US$1m and drops the price to US$9: US$10m in total. A US$100m buyback at US$10 cancels 10m shares; the company is worth US$900m over 90m shares, still US$10 each, so your 1m shares are worth US$10m. Same total. Taxes, signalling and flexibility are what really separate the two." },

  { id: "cf-why-02", lv: 2, type: "reason",
    q: "Two companies run identical businesses. One has no debt; the other has debt worth as much as its equity. How do their equity betas compare?",
    answers: ["The indebted one's is higher", "The debt-free one's is higher", "They're the same"],
    answerNotes: [
      "With no debt, shareholders carry only the business's own risk, so its beta is the lower of the two.",
      "Their asset (unlevered) betas are the same, but debt concentrates that risk on the equity, so the equity betas differ."],
    reasons: [
      "Debt makes shareholders' returns swing more for the same business risk",
      "Debt-free companies grow faster, which makes their shares more volatile",
      "Beta measures how risky the business is, and the businesses are identical",
      "Indebted companies tend to be smaller, and smaller companies have higher betas"],
    reasonNotes: [
      "Growth isn't the issue here: the businesses are identical.",
      "That's true of the asset beta. The equity beta also reflects how much debt sits ahead of the shareholders.",
      "Size isn't the reason, and here the businesses are identical. Debt raises the equity beta because shareholders absorb all the swings in profit after a fixed interest bill."],
    why: "Debt adds financial risk on top of business risk: interest is fixed, so any swing in profit lands entirely on shareholders. Ignoring taxes, equity beta = asset beta × (1 + debt ÷ equity). With debt equal to equity, the indebted company's equity beta is twice the debt-free one's. That's why you unlever peers' betas before comparing them." },

  { id: "cf-spot-01", lv: 2, type: "spot",
    q: "A company has equity worth US$600m and debt of US$400m. Its cost of equity is 10%, its pre-tax cost of debt 5% and its tax rate 25%. A candidate works out its WACC. Which line contains the mistake?",
    lines: [
      "Weights: equity 600 ÷ 1,000 = 60%, debt 400 ÷ 1,000 = 40%",
      "After-tax cost of debt: 5% × 25% = 1.25%",
      "Equity part: 60% × 10% = 6.0%",
      "Debt part: 40% × 1.25% = 0.5%",
      "WACC: 6.0% + 0.5% = 6.5%"],
    wrong: 1,
    lineNotes: [
      "Weights use market values: 600 and 400 out of 1,000. That's right.",
      null,
      "60% × 10% = 6.0% is right.",
      "Weighting by 40% is right, but it uses the wrong cost from line 2.",
      "Adding the two parts is right, but it carries the mistake forward."],
    fixes: [
      "Multiply by (1 − tax): 5% × 75% = 3.75%, so the WACC is 7.5%",
      "Use the 5% pre-tax cost, as interest is paid in full: WACC is 8.0%",
      "Add the tax to the rate: 5% × 1.25 = 6.25%, so the WACC is 8.5%",
      "Take the tax off the cost of equity too, so the WACC comes to 6.0%"],
    fixNotes: [
      "Interest is tax-deductible, so the company's real cost of debt is lower than 5%.",
      "Tax makes debt cheaper, not dearer, because interest reduces the tax bill.",
      "Dividends aren't tax-deductible, so the cost of equity gets no tax adjustment."],
    why: "Interest is tax-deductible, so the after-tax cost of debt is the pre-tax rate × (1 − tax rate): 5% × 0.75 = 3.75%. WACC = 60% × 10% + 40% × 3.75% = 6.0% + 1.5% = 7.5%. Multiplying by the tax rate instead of by one minus it keeps only the tax saving and throws away the cost." }
]);

Bank.addFormat("cf", [
  { id: "cf-grid-01", lv: 2, type: "grid",
    q: "Which theory of capital structure does each statement belong to?",
    columns: ["Modigliani–Miller (no taxes)", "Trade-off theory", "Pecking order"],
    rows: [
      { text: "How a company is financed doesn't change its value", answer: 0, note: "With no taxes or distress costs, the size of the pie doesn't depend on how it's sliced." },
      { text: "The cost of equity rises with debt, keeping WACC constant", answer: 0, note: "Cheaper debt is exactly offset by riskier, dearer equity." },
      { text: "Companies weigh the tax saving on debt against the cost of financial distress", answer: 1, note: "More debt saves tax but raises the chance and cost of distress." },
      { text: "There's an optimal level of debt for each company", answer: 1, note: "Where the extra tax saving from one more dollar of debt equals the extra distress cost." },
      { text: "Companies use retained profits first, then debt, and equity last", answer: 2, note: "The ranking follows from managers knowing more than investors." },
      { text: "Issuing new shares can signal that managers think they're overpriced", answer: 2, note: "That's why equity is the last resort, and why share prices often fall when new shares are announced." }
    ],
    why: "Modigliani–Miller is the starting point: in a world without taxes or distress costs, financing doesn't matter. The trade-off theory adds tax and distress costs, giving an optimal level of debt. The pecking order adds information: managers prefer funding that doesn't send a bad signal to investors." }
]);
