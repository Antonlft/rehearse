// Lesson: Living sectors: PBSA, BTR, co-living. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("liv", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "The living sectors are operational real estate let to individuals."},
    {"kind": "formula", "text": "Gross income = beds × weekly rent × weeks × occupancy", "note": "NOI (net operating income) = gross income − operating costs; value = NOI ÷ yield, compared per bed or per unit."},
    {"kind": "how", "title": "Purpose-built student accommodation (PBSA)", "text": "Let per bed on academic-year tenancies (often 44–51 weeks), sometimes backed by university nomination agreements."},
    {"kind": "how", "title": "Build-to-rent (BTR) and co-living", "text": "BTR is single-owner rental housing with on-site management; co-living offers small private rooms with shared spaces and all-inclusive rents."},
    {"kind": "read", "text": "Schemes in strong university cities with limited new supply, and stabilised assets, trade at lower yields than developments still letting up."},
    {"kind": "practice", "text": "Operating costs (the 'gross-to-net') are often around 25–35% of income for PBSA and 20–30% for BTR."}
  ],
  "example": {
    "question": "A 400-bed PBSA scheme charges US$250 per bed per week on 51-week tenancies and is 97% let. Costs take 30% of gross rent and the yield is 5.25%. What is it worth per bed?",
    "working": [
      "Gross rent = 400 × 250 × 51 × 97% = US$4.947m",
      "NOI = 4.947 × 70% = US$3.463m",
      "Value = 3.463 ÷ 5.25% = US$65.96m, or about US$164,900 per bed"
    ],
    "answer": "About US$165,000 per bed (US$66.0m in total)."
  },
  "source": {
    "text": "British Property Federation and Savills, UK Build to Rent market updates; the Royal Institution of Chartered Surveyors (RICS), RICS Valuation – Global Standards for valuation practice"
  },
  "widget": {
    "type": "rentRoll",
    "values": {
      "beds": 400,
      "rent": 250,
      "weeks": 51,
      "occ": 0.97,
      "costs": 0.3,
      "y": 0.0525
    }
  }
});
