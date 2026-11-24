// Lesson: Accounting & statements. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and labelled blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("acc", {
  "status": "draft",
  "newQuestions": "2026-11-24",
  "summary": [
    "The three statements link up: net income starts the cash flow statement, and closing cash and retained earnings carry into the balance sheet.",
    "When depreciation rises, profit falls but cash rises by depreciation × the tax rate, because the extra charge saves tax.",
    "Deferred tax appears when the accounts and the tax rules disagree on timing. It moves tax between years; it doesn't remove it.",
    "How a stake is accounted for depends on control: control means full consolidation, significant influence means the equity method."
  ],
  "method": [
    {"section": "How the statements link"},
    {"kind": "idea", "text": "The three statements are linked: net income from the income statement starts the cash flow statement, and closing cash and retained earnings carry into the balance sheet."},
    {"kind": "how", "text": "Non-cash items such as depreciation are added back and working capital changes adjusted to reach operating cash flow. Closing cash goes to the balance sheet, and net income flows into retained earnings within equity."},
    {"kind": "example", "text": "Net income of US$50m, depreciation of US$20m and US$10m more inventory: operating cash flow = 50 + 20 − 10 = US$60m.\nRetained earnings rise by the US$50m of net income (less any dividend), and closing cash carries to the balance sheet."},
    {"check": "acc-03"},
    {"section": "The depreciation test"},
    {"kind": "formula", "text": "Change in cash = depreciation × tax rate", "note": "Net income falls by depreciation × (1 − tax rate)."},
    {"kind": "how", "text": "Under International Financial Reporting Standards (IFRS), depreciation spreads an asset's cost over its useful life (IAS 16, the International Accounting Standard on property, plant and equipment); it isn't a cash payment. Higher depreciation lowers profit and tax, so cash rises by the tax saved, property, plant and equipment (PP&E) falls by the depreciation, and equity falls by the after-tax amount."},
    {"kind": "read", "text": "The balance sheet still balances: assets fall by the depreciation less the tax saved, and equity falls by the same after-tax amount."},
    {"kind": "example", "text": "Depreciation rises by US$10m and the tax rate is 25%.\nIncome statement: pre-tax profit falls by US$10m, and net income by US$7.5m.\nCash flow: net income −7.5, plus the US$10m added back, so cash rises by US$2.5m, the tax saved."},
    {"check": "acc-07"},
    {"section": "Deferred tax"},
    {"kind": "how", "text": "Deferred tax (IAS 12) appears when the accounts and the tax return recognise the same item in different years. If tax depreciation runs ahead of book depreciation, the company pays less tax now and more later: a deferred tax liability."},
    {"kind": "example", "text": "An asset costs US$100m. The accounts depreciate it by US$20m a year; the tax rules allow US$50m in year 1.\nYear 1: taxable profit is US$30m lower than in the accounts, so at 25% the company pays US$7.5m less tax now and records a US$7.5m deferred tax liability, which unwinds as the tax allowances run out."},
    {"kind": "watch", "text": "Tax losses carried forward, called net operating losses (NOLs) in the US, create a deferred tax asset only if future taxable profit to use them is probable. Deferred taxes move tax between years; they don't remove it."},
    {"check": "acc-18"},
    {"section": "Groups and returns"},
    {"kind": "idea", "text": "How a stake is accounted for depends on control, not on the share of profits.\nControl: full consolidation. Significant influence or joint control: the equity method.\nReturns tell a second story: debt can lift the return on equity (ROE) above the return on capital employed (ROCE) without the business creating any value.\nValue is created only when ROCE beats the weighted average cost of capital (WACC), the return lenders and shareholders require together."},
    {"kind": "formula", "title": "Return on equity and leverage", "text": "ROE = ROCE + (ROCE − after-tax cost of debt) × {{net debt // book equity}}", "note": "ROE (return on equity) = net income ÷ book equity.\nROCE (return on capital employed) = after-tax operating profit ÷ (book equity + net debt).\nAfter-tax cost of debt = interest rate × (1 − tax rate)."},
    {"kind": "formula", "title": "Economic value added (EVA)", "text": "EVA = capital employed × (ROCE − WACC)", "note": "A positive EVA means the business earns more than its capital costs."},
    {"kind": "how", "text": "Full consolidation: add 100% of the subsidiary's revenue, costs, assets and debt, then show the part owned by outside shareholders as a non-controlling interest (NCI).\nEquity method: one line for the stake in non-current assets, and one line for the share of net income, usually below operating profit.\nShare issue: the nominal value goes to share capital, the rest of the price to share premium (US: additional paid-in capital)."},
    {"kind": "read", "text": "ROE above ROCE: debt is lifting returns, because ROCE beats the after-tax cost of debt.\nPositive EVA: the business earns more than its capital costs, so it creates value.\nNegative working capital in a subscription business: customers pay upfront and fund growth."},
    {"kind": "example", "text": "A parent owns 60% of a subsidiary that earns US$40m: it consolidates all US$40m and shows US$16m of it as belonging to non-controlling interests.\nWith a 30% stake and significant influence instead, it books one line: its share of the profit, US$12m."},
    {"kind": "watch", "text": "A higher ROE isn't proof of value creation.\nExample: ROCE 8% and an after-tax cost of debt of 5%, so a spread of 3%. Raising net debt ÷ equity from 0.5 to 1.5 lifts ROE from 9.5% (8% + 3% × 0.5) to 12.5% (8% + 3% × 1.5).\nBut shareholders now carry more risk and require a higher return, so the shares aren't necessarily worth more."},
    {"kind": "practice", "text": "Interviewers often ask for the method at 60%, 30% and a 50/50 joint venture.\nName the test first (control, significant influence, joint control), then the method."},
    {"check": "acc-16"}
  ],
  "example": {
    "question": "Depreciation rises by US$20 and the tax rate is 25%. What happens to net income, cash, PP&E and equity?",
    "working": [
      "Income statement: pre-tax profit −20, tax −5, net income −15",
      "Cash flow: net income −15, add back depreciation +20, so cash +5",
      "Balance sheet: cash +5 and PP&E −20, so assets −15; equity (retained earnings) −15"
    ],
    "answer": "Net income −US$15, cash +US$5, PP&E −US$20, equity −US$15: both sides of the balance sheet fall by 15."
  },
  "source": {
    "text": "IFRS Foundation, IAS 16 Property, Plant and Equipment and IAS 7 Statement of Cash Flows",
    "url": "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/"
  },
  "widget": {
    "type": "depreciation",
    "values": {
      "d": 20,
      "t": 0.25
    }
  }
});
