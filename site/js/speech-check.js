/* Checks on what you said in an out-loud answer, from the browser's speech-to-text: word count, pace, filler phrases,
   "I" against "we", and (for technical questions) which key terms came up. Pure functions, no page access, so
   scripts/test-widgets.mjs can test them. Speech-to-text usually leaves out "um" and "uh" and can mishear acronyms,
   so these are hints for the self-check, never a grade. */
(function () {
  // Phrases that fill time without adding anything. "like", "kind of" and "sort of" only count when they're not part of
  // the sentence ("I would like", "looks like", "the kind of deal").
  const FILLERS = ["you know", "i mean", "sort of", "kind of", "basically", "literally", "actually", "like", "um", "uh", "er", "erm"];
  const NOT_FILLER_BEFORE = {
    "like": ["would", "i'd", "we'd", "you'd", "they'd", "i", "we", "you", "they", "feel", "feels", "felt", "look", "looks", "looked",
      "seem", "seems", "seemed", "sound", "sounds", "sounded", "more", "much", "just", "something", "things", "didn't", "don't", "doesn't", "not"],
    "kind of": ["what", "this", "that", "the", "a", "any", "which", "some", "same", "every", "one"],
    "sort of": ["what", "this", "that", "the", "a", "any", "which", "some", "same", "every", "one"]
  };
  const I_WORDS = ["i", "i'm", "i've", "i'd", "i'll", "me", "my", "myself"];
  const WE_WORDS = ["we", "we're", "we've", "we'd", "we'll", "us", "our", "ourselves"];
  const PACE = { slow: 120, fast: 170 }; // words a minute; interview answers sound best around 130 to 160

  // Words with their place in the text: [{ w (lower case), at, end }]. Curly apostrophes count as straight ones.
  function tokens(text) {
    const out = [], re = /[a-z0-9]+(?:['’][a-z]+)*/gi;
    let m;
    while ((m = re.exec(text || ""))) out.push({ w: m[0].toLowerCase().replace(/’/g, "'"), at: m.index, end: m.index + m[0].length });
    return out;
  }

  // Each filler found: [{ phrase, at, end }] (character positions in the text, for highlighting).
  function fillers(text) {
    const t = tokens(text), out = [];
    for (let k = 0; k < t.length; k++) {
      for (const f of FILLERS) {
        const parts = f.split(" ");
        if (!parts.every((p, j) => t[k + j] && t[k + j].w === p)) continue;
        const before = k > 0 ? t[k - 1].w : "";
        if ((NOT_FILLER_BEFORE[f] || []).includes(before)) break;
        out.push({ phrase: f, at: t[k].at, end: t[k + parts.length - 1].end });
        k += parts.length - 1;
        break;
      }
    }
    return out;
  }

  // A key term is a list of ways to say it ("free cash flow|FCF"); it counts as said if any of them appears as whole words.
  const said = (t, alt) => {
    const parts = tokens(alt).map(x => x.w);
    if (!parts.length) return false;
    for (let k = 0; k + parts.length <= t.length; k++) if (parts.every((p, j) => t[k + j].w === p)) return true;
    return false;
  };
  function terms(text, list) {
    const t = tokens(text), hit = [], miss = [];
    for (const term of list || []) (term.split("|").some(alt => said(t, alt)) ? hit : miss).push(term.split("|")[0]);
    return { hit, miss };
  }

  // Everything the review shows. ms: how long the answer took. list: the question's key terms, if any.
  function analyse(text, ms, list) {
    const t = tokens(text), n = t.length, mins = (ms || 0) / 60000;
    const wpm = mins >= 0.25 && n >= 20 ? Math.round(n / mins) : null; // too short to say anything about pace
    const pace = wpm == null ? null : wpm < PACE.slow ? "slow" : wpm > PACE.fast ? "fast" : "good";
    const f = fillers(text), counts = {};
    for (const x of f) counts[x.phrase] = (counts[x.phrase] || 0) + 1;
    const fill = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([phrase, count]) => ({ phrase, count }));
    const i = t.filter(x => I_WORDS.includes(x.w)).length, we = t.filter(x => WE_WORDS.includes(x.w)).length;
    return { words: n, wpm, pace, fill, fillTotal: f.length, marks: f, i, we, terms: list && list.length ? terms(text, list) : null };
  }

  window.SpeechCheck = { tokens, fillers, terms, analyse, PACE };
})();
