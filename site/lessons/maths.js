// Lesson: Quick maths. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("maths", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Most interview maths is compounding: growing at a rate r for n years multiplies a value by (1 + r)^n. For example, 100 growing at 10% a year for 2 years becomes 100 × 1.1^2 = 121."},
    {"kind": "formula", "title": "CAGR", "text": "CAGR = ({{end value // start value}})^(1/n) − 1", "note": "CAGR = compound annual growth rate; n = number of years of growth."},
    {"kind": "formula", "title": "Discounting", "text": "Present value = {{future value // (1 + r)^n}}", "note": "r = discount rate per year; n = number of years until the money arrives."},
    {"kind": "read", "text": "A fall of x needs a bigger rise to get back: rise needed = {{x // 1 − x}}.\nA 20% fall needs a 25% rise: 0.2 ÷ 0.8 = 0.25. A 50% fall needs a 100% rise."},
    {"kind": "watch", "text": "n is the number of years of growth, not the number of years listed. Revenue measured in 2020 (start) and in 2025 (end) has grown in 2021, 2022, 2023, 2024 and 2025: that's 5 years, so n = 5, not 6.\nQuick check: n = end year − start year = 2025 − 2020 = 5."},
    {"kind": "practice", "text": "Rule of 72: doubling time ≈ 72 ÷ the annual rate in %. At 8% a year, money doubles in about 72 ÷ 8 = 9 years.\nMoney multiple to IRR: IRR ≈ MOIC^(1/n) − 1, where n is the number of years. So 2x in 5 years ≈ 15% a year, and 3x in 5 years ≈ 25% a year."}
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
