// Lesson: Valuation. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it"), widgets (optional extra ones).
Lessons.add("val", {
  "status": "draft",
  "newQuestions": "2026-11-24",
  "summary": [
    "Enterprise value (EV) is the whole business's value to all investors; equity value is what's left for shareholders after debt and other claims.",
    "Match each multiple to the right value: EV with figures before interest, such as operating profit; equity value with figures after interest, such as net income.",
    "Value per share uses diluted shares: in-the-money options add only the shares their exercise cash can't buy back.",
    "Cross-check a discounted cash flow (DCF): its terminal value should imply a multiple close to similar companies' multiples."
  ],
  "method": [
    {"section": "From enterprise value to equity value"},
    {"kind": "idea", "text": "Enterprise value (EV) is the value of the operating business to all capital providers; equity value is the part that belongs to shareholders.\nTo go from one to the other, deduct the claims of others, such as debt and non-controlling interests (NCI), and add back cash and non-operating assets."},
    {"kind": "formula", "title": "Enterprise value to equity value", "text": "Equity value = EV − debt + cash − preferred shares − NCI − pension deficit + associates\nPension deficit after tax = (obligation − plan assets) × (1 − tax rate)\nValue per share = {{equity value // diluted shares}}", "note": "NCI = the part of subsidiaries owned by outsiders. Associates = minority stakes (usually 20–50%) the company holds in other businesses, which EV leaves out; other non-operating assets are added the same way."},
    {"kind": "formula", "title": "Multiples and net debt", "text": "EV multiple = {{EV // revenue, EBITDA or EBIT}}\nP/E = {{share price // EPS}} = {{equity value // net income}}\nNet debt = debt − cash"},
    {"kind": "formula", "title": "Free cash flow to the firm (FCFF) and to equity (FCFE)", "text": "FCFF = EBIT × (1 − tax rate) + depreciation and amortisation − capex − increase in working capital\nFCFE = FCFF − interest × (1 − tax rate) + net borrowing\nFCFE = net income + depreciation and amortisation − capex − increase in working capital + net borrowing", "note": "Net borrowing = new debt raised − debt repaid. Discount FCFF at the WACC to get EV; discount FCFE at the cost of equity to get equity value."},
    {"kind": "how", "text": "Match each multiple to the right value. EV goes with measures before interest (revenue, EBITDA, EBIT); equity value goes with measures after interest (net income, so the price/earnings ratio, P/E). EBITDA = earnings before interest, tax, depreciation and amortisation; EBIT = earnings before interest and tax.\nIn a discounted cash flow (DCF) valuation, unlevered free cash flow discounted at the weighted average cost of capital (WACC) gives EV: bridge it to equity value, then divide by the diluted share count."},
    {"kind": "read", "text": "Defined-benefit plan: the employer promises the pension, so a shortfall is debt-like.\nDefined-contribution plan: the employer only pays contributions, already in operating costs, so nothing is deducted."},
    {"kind": "example", "text": "A defined-benefit pension: obligation US$500m, plan assets US$380m, tax 25%. Deficit = 500 − 380 = US$120m; after tax = 120 × (1 − 25%) = US$90m, deducted like debt."},
    {"kind": "watch", "text": "Keep cash flows and discount rates matched: unlevered free cash flow at WACC gives EV, while free cash flow to equity (FCFE: after interest and debt repayments) at the cost of equity gives equity value."},
    {"check": "val-why-01"},
    {"section": "Diluted shares"},
    {"kind": "formula", "text": "Net new shares = options − {{options × exercise price // share price}}", "note": "The treasury stock method, for in-the-money options."},
    {"kind": "how", "text": "Diluted shares add every claim that will become a share. In-the-money options are assumed exercised, and the proceeds buy back shares at the current price, so only the difference is new. Out-of-the-money options add nothing, restricted stock units (RSUs) add one share each, and an in-the-money convertible adds its shares and stops counting as debt."},
    {"kind": "example", "text": "10m options at US$25 with shares at US$40 bring in US$250m, which buys back 6.25m shares: 3.75m net new shares."},
    {"check": "val-19"},
    {"section": "Cross-checks"},
    {"kind": "formula", "title": "Gordon growth terminal value", "text": "Terminal value = {{final-year FCF × (1 + g) // WACC − g}}\nImplied exit multiple = {{terminal value // final-year EBITDA}}\nEV = present value of each year's FCF + present value of the terminal value", "note": "FCF = unlevered free cash flow; g = long-run growth, below the WACC. The terminal value is discounted from the final year, like that year's cash flow."},
    {"kind": "formula", "title": "Price/earnings-to-growth (PEG) ratio", "text": "PEG = {{P/E // expected EPS growth in %}}"},
    {"kind": "example", "text": "A DCF gives a terminal value of US$2,000m on final-year EBITDA of US$100m: an implied exit multiple of 20x.\nIf similar companies trade at 9–11x, the growth rate or WACC is probably too aggressive."},
    {"kind": "watch", "text": "Check what the terminal value implies. A Gordon growth terminal value = final-year free cash flow (FCF) × (1 + g) ÷ (WACC − g); divide it by final-year EBITDA and the multiple should land near peers' multiples. A big gap means the growth rate or WACC is out of line."},
    {"kind": "practice", "text": "Calendarise: restate peers' figures to the same 12 months before comparing multiples.\nThe price/earnings-to-growth (PEG) ratio = P/E ÷ expected growth in earnings per share (EPS), in percentage points, to adjust the P/E for growth.\nCapital-heavy businesses: compare EV/(EBITDA − capex) or EV/EBIT, since EBITDA ignores the investment needed.\nPrivate companies: apply a discount for lack of marketability, often 20–30%."},
    {"check": "val-25"},
    {"section": "Reading sensitivity tables"},
    {"kind": "idea", "text": "A sensitivity table shows how the answer changes when two inputs move at once: one down the rows, one across the columns, with the base case in the middle."},
    {"kind": "how", "text": "Read across a row to see the effect of the column input alone; read down a column for the row input.\nCompare like with like: a 0.5-point step and a 1-point step aren't comparable.\nFind the breakeven: the cells where the answer crosses a target (for example a 20% IRR) show how much room a deal has."},
    {"kind": "read", "text": "If values change faster towards one corner, the answer is non-linear in that direction.\nIn a DCF, value climbs steeply as WACC approaches the growth rate; in an LBO, each extra turn of entry multiple costs less IRR as the price rises."},
    {"kind": "example", "text": "Base case: free cash flow of US$60m, WACC 8% and growth 2%, so value = 60 ÷ 6% = US$1,000m.\nOne step to a WACC of 8.5% gives US$923m; one step to growth of 2.5% gives US$1,091m. The growth step moves value more."},
    {"kind": "watch", "text": "Check the base-case cell matches the model, and that the ranges are realistic.\nExample: with 2% growth, EV = FCF ÷ (WACC − g) doubles when WACC falls from 6% to 4%, so a table running WACC down to 3% shows absurd values."},
    {"kind": "practice", "text": "Describe the table before quoting numbers: what's on each axis, where the base case is, and which input moves the answer most."},
    {"check": "val-39"},
    {"section": "Choosing the method", "added": "2026-11-24"},
    {"kind": "idea", "text": "No single method fits every company. Use the one whose inputs you can trust for this business, then cross-check it with another."},
    {"kind": "formula", "text": "Value per share = {{next year's dividend // cost of equity − growth}}", "note": "The dividend discount model (DDM) with steady growth. Dividends go to shareholders, so discount them at the cost of equity, never the WACC."},
    {"kind": "how", "text": "Steady, predictable cash flows: a DCF, cross-checked with trading multiples.\nLoss-making but growing fast: revenue multiples against peers growing at a similar rate, or multiples of profit a few years out, with a long-horizon DCF as a check.\nNo revenue yet: recent funding rounds, deals for similar start-ups, and a target exit value discounted back at a high required return.\nBanks and steady dividend payers: a DDM, plus price to tangible book value for banks.\nAt risk of failing, or worth more sold off than run: a liquidation value, as a floor."},
    {"kind": "example", "text": "A steady dividend payer will pay US$1.50 a share next year, growing 2% a year, and its cost of equity is 8%.\nValue per share = 1.50 ÷ (8% − 2%) = US$25.00."},
    {"kind": "watch", "text": "Shareholders' equity on the balance sheet isn't a valuation: it records past costs and leaves out the brands and know-how a company built itself. A company that borrowed to buy back shares can even have negative book equity and a healthy share price."},
    {"check": "val-42"},
    {"section": "Tech and recurring-revenue (SaaS) companies", "added": "2026-11-24"},
    {"kind": "idea", "text": "Software sold as a subscription (software as a service, SaaS) earns revenue that repeats every year its customers stay. Its value depends on how much recurring revenue it has, how well it keeps and grows its customers, and what it costs to win new ones."},
    {"kind": "formula", "title": "Retention", "text": "Net revenue retention (NRR) = {{starting ARR + upsells − downgrades − departures // starting ARR}}\nARR = MRR × 12\nChurn rate = {{customers (or revenue) lost in the year // customers (or revenue) at the start}}", "note": "Annual recurring revenue (ARR) is the yearly value of the subscriptions in force; MRR = monthly recurring revenue. New customers are left out of NRR."},
    {"kind": "formula", "title": "Payback", "text": "CAC payback (months) = {{customer acquisition cost (CAC) // monthly revenue per customer × gross margin}}\nCAC = {{sales and marketing spend // new customers won}}", "note": "CAC is repaid from gross profit, after the costs of serving the customer."},
    {"kind": "formula", "title": "Customer lifetime value (CLV)", "text": "CLV = {{annual revenue per customer × gross margin // annual churn rate}}", "note": "A CLV of about 3x the CAC or more is usually judged healthy."},
    {"kind": "formula", "title": "Rule of 40", "text": "Revenue growth % + profit margin % ≥ 40%", "note": "The profit margin is the EBITDA or free cash flow margin."},
    {"kind": "how", "text": "Investors read a handful of measures together:\nGrowth in ARR, and how much of it comes from existing customers (NRR above 100%) rather than new ones.\nChurn: the share of customers, or of revenue, lost each year.\nUnit economics: CAC payback, and customer lifetime value (CLV) against CAC, often judged healthy at about 3x or more.\nThe rule of 40: revenue growth plus a profit margin (EBITDA or free cash flow) of 40% or more.\nWhile EBITDA is small or negative, value is set with multiples of EV to ARR or to revenue, taken from peers with similar growth and retention, cross-checked with a long-horizon DCF."},
    {"kind": "example", "text": "A company starts the year with US$100m of ARR. Its customers add US$15m through upsells and cut US$3m, customers paying US$7m leave, and new customers add US$25m.\nNRR = (100 + 15 − 3 − 7) ÷ 100 = 105%. ARR ends at US$130m: 30% growth, of which 5 points came from existing customers.\nIt spent US$20m winning 400 customers, so CAC = US$50,000. Each pays US$5,000 a month at an 80% gross margin, so payback = 50,000 ÷ 4,000 = 12.5 months."},
    {"kind": "watch", "text": "Check what's inside ARR: one-off set-up fees, consulting and hardware don't recur and shouldn't be there.\nUnder IFRS 15, revenue is earned as the service is delivered, so a year paid upfront first sits as a contract liability (deferred revenue). In a growing company, bookings and billings run ahead of revenue.\nLifetime value rests on the churn assumption: losing 20% of revenue a year means customers last about five years, not ten."},
    {"check": "val-52"}
  ],
  "example": {
    "question": "A business is worth US$1,500m (EV). It has debt of US$450m, cash of US$120m, non-controlling interests of US$70m, a stake in an associate worth US$30m and 100m diluted shares. What is it worth per share?",
    "working": [
      "Net debt = 450 − 120 = US$330m",
      "Equity value = 1,500 − 330 − 70 + 30 = US$1,130m",
      "Per share = 1,130 ÷ 100 = US$11.30"
    ],
    "answer": "US$11.30 per share."
  },
  "source": {
    "text": "Koller, Goedhart & Wessels (McKinsey & Company), Valuation: Measuring and Managing the Value of Companies; Aswath Damodaran's valuation notes (New York University's Stern School of Business, NYU Stern)",
    "url": "https://pages.stern.nyu.edu/~adamodar/"
  },
  "widget": {
    "type": "evBridge",
    "values": {
      "ev": 1500,
      "debt": 450,
      "cash": 120,
      "nci": 70,
      "pref": 0,
      "assoc": 30
    }
  },
  "widgets": [
    { "type": "dilutedShares", "values": { "price": 40, "strike": 25, "opts": 10, "basic": 200 } }
  ]
});
