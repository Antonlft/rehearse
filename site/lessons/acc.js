// Lesson: Accounting & statements. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("acc", {
  "status": "draft",
  "method": [
    "The three statements are linked. Net income from the income statement starts the cash flow statement; non-cash items such as depreciation are added back and working capital changes adjusted to reach operating cash flow; closing cash goes to the balance sheet, and net income flows into retained earnings within equity.",
    "The classic test is a change in depreciation. Under IFRS (IAS 16), depreciation spreads an asset's cost over its useful life; it isn't a cash payment. Higher depreciation lowers profit and tax, so cash rises by the tax saved, PP&E falls by the depreciation, and equity falls by the after-tax amount, which keeps the balance sheet in balance."
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
