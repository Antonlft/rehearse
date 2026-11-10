// Lesson: Quick maths. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("maths", {
  "status": "draft",
  "method": [
    "Most interview maths is compounding. Growing at rate r for n years multiplies a value by (1 + r)^n, and the CAGR reverses it: CAGR = (end ÷ start)^(1/n) − 1, where n counts the years of growth, not the calendar years listed. Discounting is the same idea backwards: present value = future value ÷ (1 + r)^n.",
    "Useful shortcuts: the rule of 72 (doubling time ≈ 72 ÷ the rate in %); turning a money multiple into an IRR with MOIC^(1/n) − 1 (2x in 5 years ≈ 15%, 3x in 5 years ≈ 25%); and a fall of x needs a rise of x ÷ (1 − x) to recover."
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
