/* "Ask Claude about this": builds a ready-made message about an answer, for the user to paste into Claude
   (claude.ai) themselves. The site sends nothing anywhere: the message is only copied to the clipboard.
   It holds the question, the user's answer, the right answer, the site's explanation, what the site said about the
   answer, and the user's own working if they typed it. Nothing personal (no name, no email, no progress).
   Three versions, by outcome: a wrong answer (find the mistake), a right answer the user isn't sure about (check the
   reasoning, or whether it was luck) and a skipped question (walk me through it).

   AskClaude.message(it, ans, opts) works on a question as shown in a round (after shuffling), for multiple choice,
   typed answers, case studies, answer + reason, spot the error, ordering and grids.
   opts = { cat (category name), step (case studies: the step asked about, from 0; leave out for the whole case),
            outcome ("wrong" (default), "right" or "skipped"), notes (what the site said about the answer, e.g.
            "That's EBITDA..."), work (the user's working, or what they tried) } */
window.AskClaude = {
  // Plain text from the site's explanation markup: {{a // b}} fractions become (a) ÷ (b).
  plain(s) {
    return String(s ?? "").replace(/\{\{(.+?)\s\/\/\s(.+?)\}\}/g, "($1) ÷ ($2)").replace(/\s+\n/g, "\n").trim();
  },
  letter: j => String.fromCharCode(65 + j), // 0 → A
  table(t) {
    if (!t || !Array.isArray(t.rows)) return "";
    const head = [t.corner || "", ...(t.cols || [])].join(" | ");
    return `${t.caption ? t.caption + "\n" : ""}${head}\n${t.rows.map(r => [r.head, ...r.cells].join(" | ")).join("\n")}`;
  },
  // The part of the message that depends on the format: the options, the user's answer and the right answer.
  body(it, ans, opts) {
    const L = this.letter, P = s => this.plain(s), out = [];
    const list = (title, items) => `${title}\n${items.map((o, j) => `${L(j)}. ${P(o)}`).join("\n")}`;
    const pick = (items, j) => j == null || items[j] == null ? "(none picked)" : `${L(j)}. ${P(items[j])}`;
    if (it.type === "numeric") {
      out.push(`My answer (typed${it.unit ? `, in ${it.unit}` : ""}): ${ans ?? "(none)"}`, `Right answer: ${Typed.show(it.answer, it.unit, it.dp)}`);
    } else if (it.type === "case") {
      const steps = it.steps, k = opts.step, vals = Array.isArray(ans) ? ans : [];
      const line = (s, j) => `Step ${j + 1}: ${P(s.q)}\nMy answer: ${vals[j] == null || vals[j] === "" ? "(not answered)" : vals[j]} · Right answer: ${Typed.show(s.answer, s.unit, s.dp)}`;
      if (k != null) {
        if (k > 0) out.push(`Earlier steps:\n${steps.slice(0, k).map(line).join("\n")}`);
        out.push(`The step I got wrong (step ${k + 1} of ${steps.length}):\n${line(steps[k], k)}`, `The site's working for this step: ${P(steps[k].why)}`);
      } else {
        out.push(`All ${steps.length} steps:\n${steps.map(line).join("\n")}`,
          `The site's working, step by step:\n${steps.map((s, j) => `Step ${j + 1}: ${P(s.why)}`).join("\n")}`);
      }
    } else if (it.type === "reason") {
      const p = Array.isArray(ans) ? ans : [];
      out.push(list("Answers to choose from:", it.ans), list("Reasons to choose from:", it.rsn),
        `My answer: ${pick(it.ans, p[0])}`, `My reason: ${pick(it.rsn, p[1])}`,
        `Right answer: ${pick(it.ans, it.ansOk)}`, `Right reason: ${pick(it.rsn, it.rsnOk)}`);
    } else if (it.type === "spot") {
      const p = Array.isArray(ans) ? ans : [];
      out.push(`Worked lines (one has a mistake):\n${it.lines.map((l, j) => `Line ${j + 1}. ${P(l)}`).join("\n")}`, list("Fixes to choose from:", it.fix),
        `My pick: ${p[0] == null ? "(no line picked)" : `line ${p[0] + 1}`}, with fix ${pick(it.fix, p[1])}`,
        `Right: line ${it.wrong + 1}, with fix ${pick(it.fix, it.fixOk)}`);
    } else if (it.type === "order") {
      const mine = Array.isArray(ans) ? ans : null;
      out.push(`My order:\n${mine ? mine.map((s, j) => `${j + 1}. ${P(it.answer[s])}`).join("\n") : "(not ordered)"}`,
        `Right order:\n${it.answer.map((a, j) => `${j + 1}. ${P(a)}`).join("\n")}`);
    } else if (it.type === "grid") {
      const picks = Array.isArray(ans) ? ans : [];
      out.push(`Choices for each row: ${it.columns.map(P).join(" / ")}`,
        `Rows (my answer → right answer):\n${(it.rowOrder || it.rows.map((_, k) => k)).map(k => {
          const r = it.rows[k], mine = picks[k] == null ? "(left empty)" : P(it.columns[picks[k]]);
          return `- ${P(r.text)}: ${mine} → ${P(it.columns[r.answer])}${picks[k] === r.answer ? " ✓" : ""}`;
        }).join("\n")}`);
    } else { // multiple choice
      out.push(list("Options:", it.o), `My answer: ${pick(it.o, ans)}`, `Right answer: ${pick(it.o, it.a)}`);
    }
    if (opts.outcome === "right") out.push("(My answer was right.)");
    if (opts.outcome === "skipped") out.push("(I didn't answer this one.)");
    return out;
  },
  // The opening: what the user wants from Claude, by outcome.
  ask(it, outcome) {
    const options = !it.type || it.type === "reason" || it.type === "spot";
    if (outcome === "right") return [
      "I'm practising for finance interviews. I got this question right, but I'm not sure I really understand why. Please:",
      "1. Check whether my reasoning holds up (if I wrote it below), or tell me if I may have got there by luck.",
      `2. Explain in plain words why the right answer is right${options ? ", and why each of the other options is wrong" : ", and the mistakes people usually make on it"}.`,
      "3. Give me one similar question to try, and keep its answer hidden until I ask."];
    if (outcome === "skipped") return [
      "I'm practising for finance interviews and skipped this question. Please:",
      "1. Walk me through how to solve it, step by step, using the numbers. If I wrote what I tried below, start from there.",
      "2. Point out the mistakes people usually make on it.",
      "3. Give me one similar question to try, and keep its answer hidden until I ask."];
    return [
      "I'm practising for finance interviews and got this question wrong. Please:",
      "1. Find where my reasoning went wrong. If I wrote my working below, point to the exact step.",
      "2. Explain the right method in plain words, using the numbers.",
      "3. Give me one similar question to try, and keep its answer hidden until I ask."];
  },
  message(it, ans, opts = {}) {
    const P = s => this.plain(s), caseStep = it.type === "case" && opts.step != null, outcome = opts.outcome || "wrong";
    const work = opts.work && opts.work.trim() ? opts.work.trim()
      : outcome === "skipped" ? "(nothing written; please start from the beginning)"
      : outcome === "right" ? "(not written down; please explain the reasoning from scratch)"
      : "(not written down; please work out the most likely mistake)";
    const parts = [
      ...this.ask(it, outcome),
      "Use US$, follow IFRS first (mention US GAAP only where it differs), and answer in English.",
      "",
      `Topic: ${opts.cat || "Finance"}${it.type === "case" ? " (case study)" : ""}`,
      "",
      `${it.type === "case" ? "Scenario" : "Question"}:\n${P(it.q)}`,
      ...(it.table ? ["", this.table(it.table)] : []),
      "",
      this.body(it, ans, opts).join("\n\n"),
      ...(caseStep ? [] : ["", `The site's explanation: ${P(it.why)}`]),
      ...(opts.notes && opts.notes.length ? ["", `What the site said about my answer: ${opts.notes.map(P).join(" ")}`] : []),
      "",
      `${outcome === "skipped" ? "What I tried" : outcome === "right" ? "Why I picked it" : "My working"}: ${work}`
    ];
    return parts.join("\n");
  }
};
