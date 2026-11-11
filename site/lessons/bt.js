// Lesson: Brain teasers. Status "draft": written by Claude, to be reviewed; change to "reviewed" once checked.
// Fields: method (paragraphs or coloured blocks { kind, title?, text, note? }), example (question, working steps, answer), source (text, optional url), widget (interactive "Try it").
Lessons.add("bt", {
  "status": "draft",
  "method": [
    {"kind": "idea", "text": "Brain teasers test structured thinking, not trivia. Interviewers care more about how you get there than about speed."},
    {"kind": "how", "text": "Talk through your approach: restate the problem, look for a shortcut (symmetry, working backwards, the complement), then sanity-check the answer."},
    {"kind": "formula", "text": "P(at least one) = 1 − P(none)"},
    {"kind": "watch", "text": "Probability puzzles often hide a trap. Check whether events are independent and whether the first draw changes the second. Count outcomes carefully, and when intuition says 50/50, ask what information you've actually been given."}
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
