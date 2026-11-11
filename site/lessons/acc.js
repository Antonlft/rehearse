// Lesson: Accounting & statements. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("acc", {
  "status": "draft",
  "method": [
    {"section": "How the statements link"},
    {"kind": "idea", "text": "The three statements are linked: net income from the income statement starts the cash flow statement, and closing cash and retained earnings carry into the balance sheet."},
    {"kind": "how", "text": "Non-cash items such as depreciation are added back and working capital changes adjusted to reach operating cash flow. Closing cash goes to the balance sheet, and net income flows into retained earnings within equity."},
    {"section": "The depreciation test"},
    {"kind": "formula", "text": "Change in cash = depreciation × tax rate", "note": "Net income falls by depreciation × (1 − tax rate)."},
    {"kind": "how", "text": "Under IFRS (IAS 16), depreciation spreads an asset's cost over its useful life; it isn't a cash payment. Higher depreciation lowers profit and tax, so cash rises by the tax saved, PP&E falls by the depreciation, and equity falls by the after-tax amount."},
    {"kind": "read", "text": "The balance sheet still balances: assets fall by the depreciation less the tax saved, and equity falls by the same after-tax amount."},
    {"section": "Deferred tax"},
    {"kind": "how", "text": "Deferred tax (IAS 12) appears when the accounts and the tax return recognise the same item in different years. If tax depreciation runs ahead of book depreciation, the company pays less tax now and more later: a deferred tax liability."},
    {"kind": "watch", "text": "Tax losses carried forward (in the US, NOLs) create a deferred tax asset only if future taxable profit to use them is probable. Deferred taxes move tax between years; they don't remove it."},
    {"section": "Groups and returns"},
    {"kind": "idea", "text": "How a stake is accounted for depends on control, not on the share of profits.\nControl: full consolidation. Significant influence or joint control: the equity method.\nReturns tell a second story: debt can lift return on equity without the business creating any value."},
    {"kind": "formula", "title": "Return on equity and leverage", "text": "ROE = ROCE + (ROCE − after-tax cost of debt) × {{net debt // book equity}}", "note": "ROE (return on equity) = net income ÷ book equity.\nROCE (return on capital employed) = after-tax operating profit ÷ (book equity + net debt).\nAfter-tax cost of debt = interest rate × (1 − tax rate)."},
    {"kind": "formula", "title": "Economic value added", "text": "EVA = capital employed × (ROCE − WACC)", "note": "WACC (weighted average cost of capital) = the return lenders and shareholders require together."},
    {"kind": "how", "text": "Full consolidation: add 100% of the subsidiary's revenue, costs, assets and debt, then show the part owned by outside shareholders as a non-controlling interest (NCI).\nEquity method: one line for the stake in non-current assets, and one line for the share of net income, usually below operating profit.\nShare issue: the nominal value goes to share capital, the rest of the price to share premium (US: additional paid-in capital)."},
    {"kind": "read", "text": "ROE above ROCE: debt is lifting returns, because ROCE beats the after-tax cost of debt.\nPositive EVA: the business earns more than its capital costs, so it creates value.\nNegative working capital in a subscription business: customers pay upfront and fund growth."},
    {"kind": "watch", "text": "A higher ROE isn't proof of value creation.\nExample: ROCE 8% and an after-tax cost of debt of 5%, so a spread of 3%. Raising net debt ÷ equity from 0.5 to 1.5 lifts ROE from 9.5% (8% + 3% × 0.5) to 12.5% (8% + 3% × 1.5).\nBut shareholders now carry more risk and require a higher return, so the shares aren't necessarily worth more."},
    {"kind": "practice", "text": "Interviewers often ask for the method at 60%, 30% and a 50/50 joint venture.\nName the test first (control, significant influence, joint control), then the method."}
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
