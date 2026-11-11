// Lesson: Brain teasers. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (sections { section } and coloured blocks { kind, title?, text, note? }, in the order of Lessons.ORDER), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("bt", {
  "status": "draft",
  "method": [
    {"section": "1. Puzzles and probability"},
    {"kind": "idea", "text": "Brain teasers test structured thinking, not trivia. Interviewers care more about how you get there than about speed."},
    {"kind": "formula", "text": "P(at least one) = 1 − P(none)"},
    {"kind": "how", "text": "Talk through your approach: restate the problem, look for a shortcut (symmetry, working backwards, the complement), then sanity-check the answer."},
    {"kind": "watch", "text": "Probability puzzles often hide a trap. Check whether events are independent and whether the first draw changes the second. Count outcomes carefully, and when intuition says 50/50, ask what information you've actually been given."},
    {"section": "2. Market sizing"},
    {"kind": "idea", "text": "Market sizing tests structure, not knowledge.\nA clear chain of round-number assumptions beats a precise number you can't explain."},
    {"kind": "formula", "text": "Market size = units × frequency × price", "note": "Units = how many buyers (people, households, companies, hotel rooms).\nFrequency = how often each one buys, per year.\nPrice = the average amount paid each time."},
    {"kind": "how", "text": "Top-down: start from a total (population, households) and narrow it with shares and frequencies.\nBottom-up: start from what you can count (shops, rooms, seats) and multiply up by usage and price.\nUse round numbers and think aloud, so the interviewer can follow and correct an assumption."},
    {"kind": "read", "text": "An answer within a factor of 2 to 3 of reality is usually fine.\nWhat matters is that each step is sensible and that you can say which assumption drives the result."},
    {"kind": "watch", "text": "Keep the units consistent.\nExample: 20m people × 2 sandwiches a week × US$5 = US$200m a week, not a year; × 52 gives about US$10bn.\nDon't mix people and households: the US has about 335m people but only about 130m households."},
    {"kind": "practice", "text": "A city with 120,000 hotel rooms, 80% occupancy and a US$300 average daily rate (ADR):\n120,000 × 80% × US$300 × 365 ≈ US$10.5bn of room revenue a year."}
  ],
  "example": {
    "question": "You pick one of three doors; one hides a car. The host, who knows where it is, opens another door to show a goat and offers you a switch. Should you switch?",
    "working": [
      "Your first pick is right 1 time in 3, so staying wins 1/3",
      "It's wrong 2 times in 3; the host must then open the only other goat door, so switching lands on the car",
      "Switching wins 2/3"
    ],
    "answer": "Switch: it doubles your chance of winning, from 1/3 to 2/3."
  },
  "source": {
    "text": "Timothy Falcon Crack, Heard on the Street: Quantitative Questions from Wall Street Job Interviews"
  },
  "widget": {
    "type": "montyHall"
  }
});
