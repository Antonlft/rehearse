// Lesson: Hotel economics & KPIs. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, title?, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("hk", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Hotel performance starts with three rooms metrics: occupancy, ADR and RevPAR. TRevPAR adds F&B and other revenue."},
    {"kind": "formula", "title": "Rooms metrics", "text": "Occupancy = rooms sold ÷ rooms available · ADR = rooms revenue ÷ rooms sold · RevPAR = rooms revenue ÷ rooms available = occupancy × ADR"},
    {"kind": "how", "text": "Under USALI, gross operating profit (GOP) is revenue less departmental and undistributed costs, before management fees and fixed charges."},
    {"kind": "read", "text": "Growth from rate is worth more than growth from occupancy: a higher ADR mostly drops to profit, while extra occupied rooms bring cleaning, laundry and commission costs."},
    {"kind": "formula", "title": "Splitting growth", "text": "RevPAR growth = (1 + ADR growth) × (1 + occupancy growth) − 1", "note": "Flow-through = change in GOP ÷ change in revenue."}
  ],
  "example": {
    "question": "A hotel ran at 72% occupancy and a US$160 ADR last year, and at 75% and US$168 this year. How much did RevPAR grow, and how does that split?",
    "working": [
      "RevPAR: 72% × 160 = US$115.20, now 75% × 168 = US$126.00, up 9.4%",
      "ADR: 168 ÷ 160 − 1 = +5.0%",
      "Occupancy: 75 ÷ 72 − 1 = +4.2%; check: 1.050 × 1.042 − 1 = 9.4%"
    ],
    "answer": "RevPAR is up 9.4%: roughly half from rate (+5.0%) and half from occupancy (+4.2%)."
  },
  "source": {
    "text": "Uniform System of Accounts for the Lodging Industry (USALI), published by HFTP and the American Hotel & Lodging Association"
  },
  "widget": {
    "type": "revpar",
    "values": {
      "occ": 0.75,
      "adr": 168,
      "rooms": 250
    }
  }
});
