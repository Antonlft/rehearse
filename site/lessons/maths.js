// Lesson: Quick maths. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, title?, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("maths", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Most interview maths is compounding: growing at rate r for n years multiplies a value by (1 + r)^n."},
    {"kind": "formula", "title": "CAGR", "text": "CAGR = (end ÷ start)^(1/n) − 1"},
    {"kind": "watch", "text": "n counts the years of growth, not the calendar years listed: 2020 to 2025 is 5 years."},
    {"kind": "formula", "title": "Discounting", "text": "Present value = future value ÷ (1 + r)^n"},
    {"kind": "practice", "text": "Rule of 72: doubling time ≈ 72 ÷ the rate in %. Money multiple to IRR: MOIC^(1/n) − 1, so 2x in 5 years ≈ 15% and 3x in 5 years ≈ 25%."},
    {"kind": "read", "text": "A fall of x needs a rise of x ÷ (1 − x) to recover: a 20% fall needs a 25% rise."}
  ],
  "example": {
    "question": "Revenue grows from US$200m in 2019 to US$300m in 2024. What is the CAGR, and roughly how long would revenue take to double at that rate?",
    "working": [
      "Years of growth: 2024 − 2019 = 5",
      "CAGR = (300 ÷ 200)^(1/5) − 1 = 1.5^0.2 − 1 ≈ 8.4%",
      "Rule of 72: 72 ÷ 8.45 ≈ 8.5 years, very close to the exact answer (8.5)"
    ],
    "answer": "About 8.4% a year, doubling in roughly 8½ years."
  },
  "source": {
    "text": "Investor.gov (US SEC), Compound Interest Calculator",
    "url": "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator"
  },
  "widget": {
    "type": "compound",
    "values": {
      "r": 0.0845,
      "n": 5
    }
  }
});
