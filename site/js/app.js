(() => {
const STORE_KEY = "rehearse.v3";
const GEN_SHARE = 0.25;
const CATEGORIES = [
  { id: "fig", name: "Financial institutions (FIG)", desc: "Banks, insurers and asset managers: capital, margins and valuation" },
  { id: "val", name: "Valuation", desc: "Multiples, the EV bridge, DCF and terminal value" },
  { id: "mna", name: "M&A process & documents", desc: "Auctions, LOIs, SPAs, deal protection, accretion/dilution" },
  { id: "lbo", name: "LBO & private equity", desc: "Returns, leverage, fund economics and exits" },
  { id: "rx", name: "Restructuring", desc: "Priority of claims, Chapter 11, schemes and liability management" },
  { id: "acc", name: "Accounting & statements", desc: "The three statements, working capital and key IFRS rules" },
  { id: "cf", name: "Corporate finance", desc: "Cost of capital, capital structure and payout policy" },
  { id: "credit", name: "Credit & debt", desc: "Covenants, ratings, bonds and seniority" },
  { id: "cm", name: "ECM & DCM", desc: "IPOs, rights issues, block trades, convertibles and bond issuance" },
  { id: "maths", name: "Quick maths", desc: "CAGR, discounting, perpetuities, breakevens and basis points" },
  { id: "bt", name: "Brain teasers", desc: "Probability, logic puzzles and mental arithmetic" },
  { id: "econ", name: "Economics & markets", desc: "Rates, inflation, FX and the macro cycle" },
  { id: "hk", group: "hl", name: "Hotel economics & KPIs", desc: "Occupancy, ADR, RevPAR, TRevPAR, GOP, GOPPAR and EBITDA(R)" },
  { id: "hom", group: "hl", name: "Hotel operating models", desc: "Lease vs management vs franchise, OpCo/PropCo and fee structures" },
  { id: "rev", group: "hl", name: "Real estate valuation", desc: "Yields, price per key and bed, NOI vs EBITDA(R), DCF and exit yields" },
  { id: "liv", group: "hl", name: "Living sectors: PBSA, BTR, co-living", desc: "How each works, income stability, key metrics and valuation drivers" },
  { id: "pf", group: "hl", name: "Property finance & rates", desc: "LTV, ICR, DSCR, debt yield, swaps, SONIA and leverage" },
  { id: "hds", group: "hl", name: "Hospitality & living deal structuring", desc: "Sale process, asset vs share deals, leasebacks, JVs, forward funding" }
];
CATEGORIES.forEach(c => c.group ||= "fin");
const GROUPS = [{ id: "fin", name: "Finance & accounting" }, { id: "hl", name: "Hospitality & living" }];
const LEVELS = { 1: "Basic", 2: "Intermediate", 3: "Advanced" };
const catById = id => CATEGORIES.find(c => c.id === id);
const groupLabel = ids => {
  const gs = [...new Set(ids.map(id => catById(id).group))];
  return gs.length === 1 ? GROUPS.find(g => g.id === gs[0]).name : "Finance, real estate & hospitality";
};
const RETRY = "retry";
const modeInfo = mode => mode === "mixed" ? { title: "Financial aptitude test", sub: "Finance & accounting", n: 20 }
  : mode === RETRY ? { title: "Mistakes practice", sub: "Questions you got wrong or skipped", n: 0 }
  : { title: catById(mode).name, sub: "Category practice", n: 10 };

const store = {
  load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } },
  // Returns false if the browser refused to save (e.g. storage full), so persist() can warn once.
  save(d) { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); return true; } catch { return false; } }
};
const db = store.load();
db.attempts ||= {}; db.history ||= {}; db.totals ||= {}; db.seen ||= {}; db.catStats ||= {}; db.excluded ||= [];
db.qStats ||= {}; // written question id -> { n: times answered, wrong: times wrong or skipped, last: "ok" | "wrong" }
// Permanent answer log: one entry per answered question in every submitted round. Only ever appended to, never edited or trimmed.
// Answer entry: { qid (null for calculation questions), cat, ok, at (submit time), usedMs (time on screen), answeredAt (last answer click),
//   mode, i (position in the round), timePressure, trap (mistake type, wrong tagged answers only) }. Older entries lack the last three.
// Note entry: { kind: "cause", cause, ref, i, at } — added after submit (e.g. "I read it wrong"); the latest note for (ref, i) wins.
db.log ||= [];
// Schema version: documentation and safety only. Fields are only ever added, so the number only ever goes up.
//   1: everything live before the answer log (attempts, history, totals, seen, catStats, excluded, qStats)
//   2: added db.log; rounds in progress also gain spentMs[] and answeredAt[]
//   3: added db.lastBackupAt and db.backupNudgeDismissedAt (backup download and reminder)
//   4: answer entries in db.log gain i, timePressure and (for tagged wrong options) trap;
//      db.log can also hold notes { kind: "cause", cause: "misread" | null, ref: <round's submit time>, i, at }
//   5: added db.schedule, db.srsEnabled and db.srsExcluded (spaced repetition)
db.lastBackupAt ||= null;           // when a backup was last downloaded
db.backupNudgeDismissedAt ||= null; // when the home-page backup reminder was last dismissed

/* Spaced repetition: when each written question is next due.
   Wrong answer: due tomorrow, interval reset to 1 day. Right answer: interval doubles (first time: 2 days), up to 60 days.
   A right answer given before the question is due doesn't double the interval, so practising the same question
   several times in a day can't push it weeks away. "Due" means from local midnight of that day.
   The schedule is always kept up to date; switching spaced repetition off only stops draw() from using it. */
const SRS_MAX_DAYS = 60;
const startOfDay = (ts, plusDays = 0) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + plusDays); return d.getTime(); };
function scheduleAnswer(s, qid, ok, at) {
  const cur = s[qid];
  if (!ok) s[qid] = { dueAt: startOfDay(at, 1), intervalDays: 1, lastOk: false };
  else if (!cur) s[qid] = { dueAt: startOfDay(at, 2), intervalDays: 2, lastOk: true };
  else if (at < cur.dueAt) cur.lastOk = true; // right, but not due yet: keep the schedule
  else { const n = Math.min(SRS_MAX_DAYS, cur.intervalDays * 2); s[qid] = { dueAt: startOfDay(at, n), intervalDays: n, lastOk: true }; }
}
// Rebuild the whole schedule by replaying the answer log in order (written questions only).
function buildSchedule(log) {
  const s = {};
  for (const e of log) if (!e.kind && e.qid) scheduleAnswer(s, e.qid, e.ok, e.at);
  return s;
}
db.schedule ||= buildSchedule(db.log); // question id -> { dueAt, intervalDays, lastOk }
// ??= rather than ||=: "off" is stored as false, and ||= would switch it back on at every page load.
db.srsEnabled ??= true;
db.srsExcluded ||= []; // category ids where spaced repetition is off
const srsOn = cat => db.srsEnabled && !db.srsExcluded.includes(cat);
//   6: added db.roundModes; rounds in progress, results and answer log entries from Learning rounds carry learning: true
// Timed test (default, the original behaviour) or Learning (no time limit, answer shown after each question).
// Remembered separately for the main test and for one-category practice. Mistakes practice is always timed.
db.roundModes ||= {};
db.roundModes.test ||= "timed";
db.roundModes.practice ||= "timed";
const LEARNING_MS = 100 * 365 * 864e5; // Learning rounds keep a deadline, just 100 years away (Infinity can't be saved as JSON)
const learningFor = mode => mode === RETRY ? false : db.roundModes[mode === "mixed" ? "test" : "practice"] === "learning";
//   7: added db.calcPrefs; rounds in progress, results and answer log entries carry calc: true when the calculator was allowed
// Is the calculator allowed? Default: off in the timed main test (like a real interview), on everywhere else.
// Overrides are remembered per entry point and mode, e.g. { "test-timed": true }; only overrides are stored.
db.calcPrefs ||= {};
const calcKey = (entry, learning) => `${entry}-${learning ? "learning" : "timed"}`;
const calcPref = (entry, learning) => db.calcPrefs[calcKey(entry, learning)] ?? (calcKey(entry, learning) !== "test-timed");
const calcFor = mode => mode === RETRY ? calcPref("practice", false) : calcPref(mode === "mixed" ? "test" : "practice", learningFor(mode));
//   8: added db.newFormats; typed-answer questions keep their typed text in attempts' answers[] and a checked[] list in
//      Learning mode; their answer log entries gain given (the number read) and cause ("calculation-slip" | "concept-gap")
// New question formats (typed answers; ordering later) are opt-in, so rounds stay exactly as before unless switched on.
db.newFormats ??= false; // ??= like srsEnabled: "off" is stored as false
const NUMERIC_SHARE = 0.5; // with new formats on, half the calculation slots in categories that have them are typed
//   9: ordering questions: a round's answers[] can hold an ordering (step numbers in the order chosen), and
//      their answer log entries have type: "order" and given (that ordering). No new top-level fields.
//  10: classification grids: a round's answers[] can hold one column number (or null) per grid row; their answer
//      log entries have type: "grid", given (those picks) and rowsRight. No new top-level fields.
const SCHEMA_VERSION = 10;
db.schemaVersion = Math.max(db.schemaVersion || 1, SCHEMA_VERSION);
let saveWarned = false;
const persist = () => {
  if (store.save(db) || saveWarned) return;
  saveWarned = true; // warn once per visit; saving keeps being attempted as normal
  setTimeout(() => confirmModal("Your progress couldn't be saved",
    "This browser refused to save your latest progress, usually because its storage is full. Download a backup now so you don't lose anything.",
    "Download backup", exportBackup, "Close"), 0);
};

const app = document.getElementById("app");
const meta = document.getElementById("topMeta");
const modalRoot = document.getElementById("modalRoot");
let tick = null;
let view = { name: "home" };
let reviewFilter = "all";

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = ms => { const t = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const written = cat => Bank.written[cat] || [];
const gens = cat => Bank.gens[cat] || [];
const totalWritten = () => CATEGORIES.reduce((s, c) => s + written(c.id).length, 0);
const selectedCats = () => {
  const ids = CATEGORIES.map(c => c.id).filter(id => !db.excluded.includes(id));
  return ids.length ? ids : CATEGORIES.map(c => c.id);
};
const selectionLabel = ids => ids.length === CATEGORIES.length ? "all categories" : `${ids.length} of ${CATEGORIES.length} categories`;
// New-format written questions (e.g. ordering) join a category's pool only when new formats are on.
const formatQs = cat => db.newFormats ? (Bank.formats[cat] || []) : [];
const capacity = cat => gens(cat).length ? Infinity : written(cat).length + formatQs(cat).length;

/* Round building */
function generated(fn) {
  let g;
  for (let i = 0; i < 30; i++) {
    g = fn();
    if (g.o.length === 4 && new Set(g.o).size === 4 && !g.o.some(s => /NaN|Infinity|undefined/.test(s))) break;
  }
  return { ...g, gen: true };
}

// A random starting order for an ordering question that is never already the right one.
function orderStart(n) {
  let p;
  do p = shuffle([...Array(n).keys()]); while (p.every((v, k) => v === k));
  return p;
}

function materialize(src, cat) {
  if (src.type === "order")
    return { cat, id: src.id, gen: false, lv: src.lv || null, type: "order", q: src.q, why: src.why, answer: src.answer, start: orderStart(src.answer.length) };
  if (src.type === "grid") // rows are shown in a shuffled order; answers are kept by original row number
    return { cat, id: src.id, gen: false, lv: src.lv || null, type: "grid", q: src.q, why: src.why, columns: src.columns, rows: src.rows, rowOrder: shuffle([...src.rows.keys()]) };
  const perm = shuffle([0, 1, 2, 3]);
  const item = { cat, id: src.id || null, gen: !!src.gen, lv: src.lv || null, q: src.q, why: src.why,
    o: perm.map(i => src.o[i]), a: perm.indexOf(0), x: perm.map(i => i === 0 ? null : src.x[i - 1]) };
  // Mistake-type tags travel with the wrong options through the shuffle (only when the question has them).
  if (src.trap) item.trap = perm.map(i => i === 0 ? null : src.trap[i - 1] || null);
  return item;
}

// A typed-answer calculation question, ready for a round.
function typedItem(fn, cat) {
  let g;
  for (let k = 0; k < 30; k++) { g = fn(); if (Number.isFinite(g.answer)) break; }
  return { cat, id: null, gen: true, ...g };
}

/* Grading: the one place that decides whether an answer is right, for every question format. */
const isBlank = a => a === null || a === undefined || a === "";
function grade(it, ans) {
  if (isBlank(ans)) return { ok: false, blank: true };
  if (it.type === "numeric") return Typed.grade(it, ans); // { ok, value, cause, trap, note, unreadable }
  if (it.type === "order") { // only the exact sequence is right; placed = steps in the right position
    const placed = Array.isArray(ans) ? ans.filter((v, k) => v === k).length : 0;
    return { ok: Array.isArray(ans) && placed === it.answer.length, placed };
  }
  if (it.type === "grid") { // right only if every row is right; rowsRight for "4 of 6 right"
    const right = it.rows.filter((r, k) => Array.isArray(ans) && ans[k] === r.answer).length;
    return { ok: right === it.rows.length, right };
  }
  return { ok: ans === it.a };
}
// Learning mode reveals an answer once it's final: multiple choice on click, typed answers on "Check".
const needsCheck = it => it.type === "numeric" || it.type === "order" || it.type === "grid";
const isRevealed = (at, i) => !!at.learning && !isBlank(at.answers[i]) && (!needsCheck(at.items[i]) || !!(at.checked && at.checked[i]));
const causeText = g => g.unreadable ? "Your answer couldn't be read as a number."
  : g.note ? g.note
  : g.cause === "calculation-slip" ? "You were close (within 10%), so this looks like a calculation slip."
  : "That's quite far off, so check the method.";

const MISSED_WEIGHT = 3;
const missedLast = q => db.qStats[q.id]?.last === "wrong";
// Weighted random pick: questions whose last answer was wrong or skipped are MISSED_WEIGHT times as likely.
function pickWeighted(pool) {
  const wt = q => missedLast(q) ? MISSED_WEIGHT : 1;
  let r = Math.random() * pool.reduce((s, q) => s + wt(q), 0);
  for (const q of pool) if ((r -= wt(q)) < 0) return q;
  return pool[pool.length - 1];
}

function draw(cat, used) {
  const w = db.newFormats ? [...written(cat), ...formatQs(cat)] : written(cat), g = gens(cat);
  if (w.length && !(g.length && Math.random() < GEN_SHARE)) {
    // Spaced repetition: a question that's due comes first (most overdue first, ties broken at random).
    // When it's off for this category, this block is skipped and everything below runs exactly as before.
    if (srsOn(cat)) {
      const now = Date.now();
      const due = w.filter(q => !used.has(q.id) && db.schedule[q.id] && db.schedule[q.id].dueAt <= now);
      if (due.length) {
        const q = shuffle(due).reduce((a, b) => db.schedule[b.id].dueAt < db.schedule[a.id].dueAt ? b : a);
        used.add(q.id);
        const seenList = (db.seen[cat] ||= []);
        if (!seenList.includes(q.id)) seenList.push(q.id);
        return materialize(q, cat);
      }
    }
    const seen = (db.seen[cat] ||= []);
    // Unseen questions, plus seen ones you last got wrong, so misses come back before the bank cycles.
    let pool = w.filter(q => !used.has(q.id) && (!seen.includes(q.id) || missedLast(q)));
    if (!w.some(q => !seen.includes(q.id) && !used.has(q.id))) { db.seen[cat] = []; pool = w.filter(q => !used.has(q.id)); }
    if (pool.length) {
      const q = pickWeighted(pool);
      used.add(q.id);
      if (!db.seen[cat].includes(q.id)) db.seen[cat].push(q.id);
      return materialize(q, cat);
    }
  }
  // New formats: some calculation slots become typed-answer questions. Skipped entirely when switched off.
  // Each typed calculation is used at most once per round, so a category with only one doesn't repeat it.
  const freshTyped = db.newFormats ? (Bank.numeric[cat] || []).filter(fn => !used.has(fn)) : [];
  if (freshTyped.length && Math.random() < NUMERIC_SHARE) {
    const tf = pick(freshTyped);
    used.add(tf);
    return typedItem(tf, cat);
  }
  const fresh = g.filter(fn => !used.has(fn));
  const fn = pick(fresh.length ? fresh : g);
  used.add(fn);
  return materialize(generated(fn), cat);
}

// Spread n slots evenly across categories, never asking a category for more unique questions than it has.
function allocate(cats, n) {
  const quota = Object.fromEntries(cats.map(c => [c, 0]));
  let filled = 0;
  while (filled < n) {
    let progressed = false;
    for (const c of shuffle(cats)) {
      if (filled >= n) break;
      if (quota[c] < capacity(c)) { quota[c]++; filled++; progressed = true; }
    }
    if (!progressed) break;
  }
  return shuffle(cats.flatMap(c => Array(quota[c]).fill(c)));
}

function buildRound(mode, cats) {
  const used = new Set();
  const items = allocate(cats, modeInfo(mode).n).map(cat => draw(cat, used));
  // Single-category practice runs from basic to advanced when the category has levels.
  if (mode !== "mixed" && items.every(it => it.lv)) items.sort((a, b) => a.lv - b.lv);
  return items;
}

function beginAttempt(mode, items, sub, learning = false, calc = false) {
  db.attempts[mode] = { mode, sub, items, answers: Array(items.length).fill(null), marked: Array(items.length).fill(false),
    cur: 0, start: Date.now(), deadline: Date.now() + (learning ? LEARNING_MS : items.length * 60000), ...(learning ? { learning: true } : {}), ...(calc ? { calc: true } : {}) };
  persist();
  reviewFilter = "all";
  go({ name: "quiz", mode });
}

function startRound(mode) {
  const cats = mode === "mixed" ? selectedCats() : [mode], learning = learningFor(mode);
  const sub = (mode === "mixed" ? `${groupLabel(cats)} · ${selectionLabel(cats)}` : "Category practice") + (learning ? " · Learning mode" : "");
  beginAttempt(mode, buildRound(mode, cats), sub, learning, calcFor(mode));
}

function newRound(mode) {
  if (db.attempts[mode]) confirmModal("Start a new round?", "Your round in progress will be discarded.", "Start new round", () => startRound(mode));
  else startRound(mode);
}

// Re-ask a finished round's missed items. Each item is rebuilt as "correct option first"
// and run through materialize() again, so the options come back in a new order.
function startRetry(items) {
  const go_ = () => beginAttempt(RETRY, shuffle(items).map(it => {
    if (it.type === "numeric") return { ...it }; // typed answers have no options to reshuffle
    if (it.type === "order") return { ...it, start: orderStart(it.answer.length) }; // a fresh starting order
    if (it.type === "grid") return { ...it, rowOrder: shuffle([...it.rows.keys()]) }; // rows in a new order
    const wrong = [0, 1, 2, 3].filter(j => j !== it.a);
    return materialize({ id: it.id, gen: it.gen, lv: it.lv, q: it.q, why: it.why,
      o: [it.o[it.a], ...wrong.map(j => it.o[j])], x: wrong.map(j => it.x[j]),
      ...(it.trap ? { trap: wrong.map(j => it.trap[j]) } : {}) }, it.cat);
  }), `${items.length} question${items.length > 1 ? "s" : ""} you got wrong or skipped`, false, calcFor(RETRY));
  if (db.attempts[RETRY]) confirmModal("Start a new mistakes practice?", "Your mistakes practice in progress will be discarded.", "Start practice", go_);
  else go_();
}

/* Time per question, for the round in progress.
   at.spentMs[i]    total time question i has been on screen (added up across visits)
   at.answeredAt[i] when question i's answer was last chosen
   at.viewStart / at.viewIdx: the visit currently being timed (null when nothing is on screen).
   Rounds started before this existed get the arrays on first use. */
function ensureTiming(at) {
  at.spentMs ||= Array(at.items.length).fill(0);
  at.answeredAt ||= Array(at.items.length).fill(null);
}
function startVisit(at) { ensureTiming(at); at.viewStart = Date.now(); at.viewIdx = at.cur; }
function endVisit(at) {
  ensureTiming(at);
  if (at.viewStart != null && at.viewIdx != null) {
    const end = Math.min(Date.now(), at.deadline); // nothing counts after time runs out
    at.spentMs[at.viewIdx] += Math.max(0, end - at.viewStart);
  }
  at.viewStart = null; at.viewIdx = null;
}

function go(v) {
  if (v.name !== "quiz") CalcUI.hide(); // the calculator only lives on the quiz screen
  // Leaving a live round (Save & exit, logo, etc.): stop its clock so time away isn't counted.
  if (view.name === "quiz" && view.live && db.attempts[view.mode]) { endVisit(db.attempts[view.mode]); persist(); }
  view = v;
  clearInterval(tick);
  closeModal();
  window.scrollTo(0, 0);
  render();
}
function render() {
  if (view.name === "quiz") renderQuiz();
  else if (view.name === "results") renderResults();
  else if (view.name === "setup") renderSetup();
  else if (view.name === "report") renderReport();
  else if (view.name === "lesson") renderLesson();
  else renderHome();
}

/* Round setup */
function renderSetup() {
  meta.innerHTML = `<button class="link" id="backHome" type="button">All assessments</button>`;
  const sel = new Set(selectedCats());
  app.innerHTML = `
    <div class="title-row"><div><h1>Financial aptitude test</h1><p>Set up your round</p></div></div>
    <section class="card setup">
      <div class="setup-head">
        <div><h2>Choose your categories</h2><p class="muted">Untick anything that isn't relevant to you. Your choice is remembered for next time.</p></div>
        <div class="setup-links"><button class="link" id="allBtn" type="button">Select all</button><button class="link" id="noneBtn" type="button">Clear all</button></div>
      </div>
      ${GROUPS.map(g => `
        <div class="check-group">
          <div class="check-group-head"><h3>${esc(g.name)}</h3><button class="link" type="button" data-only="${g.id}">Only this group</button></div>
          <div class="check-grid">
            ${CATEGORIES.filter(c => c.group === g.id).map(c => `
              <label class="check" for="cat-${c.id}">
                <input type="checkbox" id="cat-${c.id}" value="${c.id}" data-group="${c.group}" ${sel.has(c.id) ? "checked" : ""}>
                <span><b>${esc(c.name)}</b><small>${esc(c.desc)}</small></span>
              </label>`).join("")}
          </div>
        </div>`).join("")}
      <fieldset class="mode-choice">
        <legend>How do you want to practise?</legend>
        <div class="mode-grid">
          ${[["timed", "Timed test", "1 minute per question. Answers and explanations at the end."],
             ["learning", "Learning", "No time limit. See the answer and explanation after each question."]].map(([v, t, d]) => `
            <label class="mode-card" for="mode-${v}">
              <input type="radio" name="roundMode" id="mode-${v}" value="${v}" ${db.roundModes.test === v ? "checked" : ""}>
              <span><b>${t}</b><small>${d}</small></span>
            </label>`).join("")}
        </div>
      </fieldset>
      <label class="calc-allow" for="calcAllow"><input type="checkbox" id="calcAllow" ${calcPref("test", db.roundModes.test === "learning") ? "checked" : ""}><span>Allow the calculator in this round <small>Off by default in the timed test, on in Learning mode</small></span></label>
      <label class="calc-allow" for="formatsAllow"><input type="checkbox" id="formatsAllow" ${db.newFormats ? "checked" : ""}><span>Include new question formats <small>Typed answers for some calculations, putting process steps in order, and sorting items into groups. Applies to all rounds.</small></span></label>
      <div class="setup-foot">
        <p id="setupSummary" aria-live="polite"></p>
        <div class="actions"><button class="btn" id="cancelBtn" type="button">Cancel</button><button class="btn primary lg" id="goBtn" type="button">Start round</button></div>
      </div>
    </section>`;
  const boxes = [...app.querySelectorAll(".check input")];
  const summary = document.getElementById("setupSummary"), goBtn = document.getElementById("goBtn");
  const chosen = () => boxes.filter(b => b.checked).map(b => b.value);
  const sync = () => {
    const ids = chosen();
    const n = Math.min(modeInfo("mixed").n, ids.reduce((s, id) => s + capacity(id), 0));
    const time = db.roundModes.test === "learning" ? "no time limit" : `${n} minutes`;
    const calc = calcPref("test", db.roundModes.test === "learning") ? "calculator on" : "no calculator";
    summary.textContent = ids.length ? `${n} questions · ${time} · ${calc} · ${selectionLabel(ids)}` : "Select at least one category to start.";
    goBtn.disabled = !ids.length;
  };
  boxes.forEach(b => b.onchange = sync);
  const calcAllow = document.getElementById("calcAllow");
  app.querySelectorAll('input[name="roundMode"]').forEach(r => r.onchange = () => {
    db.roundModes.test = r.value; persist();
    calcAllow.checked = calcPref("test", r.value === "learning"); // each mode has its own calculator setting
    sync();
  });
  document.getElementById("formatsAllow").onchange = e => { db.newFormats = e.target.checked; persist(); };
  calcAllow.onchange = () => { db.calcPrefs[calcKey("test", db.roundModes.test === "learning")] = calcAllow.checked; persist(); sync(); };
  document.getElementById("allBtn").onclick = () => { boxes.forEach(b => b.checked = true); sync(); };
  document.getElementById("noneBtn").onclick = () => { boxes.forEach(b => b.checked = false); sync(); };
  app.querySelectorAll("[data-only]").forEach(l => l.onclick = () => { boxes.forEach(b => b.checked = b.dataset.group === l.dataset.only); sync(); });
  document.getElementById("cancelBtn").onclick = () => go({ name: "home" });
  document.getElementById("backHome").onclick = () => go({ name: "home" });
  goBtn.onclick = () => {
    const ids = chosen();
    db.excluded = CATEGORIES.map(c => c.id).filter(id => !ids.includes(id));
    persist();
    newRound("mixed");
  };
  sync();
}

/* Home */
function actionButtons(mode, label, primary) {
  if (db.attempts[mode]) {
    const at = db.attempts[mode], done = at.answers.filter(a => !isBlank(a)).length;
    return `<button class="btn primary" type="button" data-resume="${mode}">Resume · ${done}/${at.items.length}</button>
            <button class="btn" type="button" data-new="${mode}">New round</button>`;
  }
  return `<button class="btn ${primary ? "primary" : ""}" type="button" data-new="${mode}">${label}</button>`;
}

function catRow(c) {
  const st = db.catStats[c.id], w = written(c.id).length, g = gens(c.id).length;
  const bank = w && g ? `${w} written + calculations` : w ? `${w} written` : "Calculations only";
  const acc = st && st.n ? Math.round(st.ok / st.n * 100) : null;
  return `
    <div class="cat-row">
      <div class="cat-name"><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><button class="link learn-link" type="button" data-learn="${c.id}">Learn${Lessons.all[c.id]?.status && Lessons.all[c.id].status !== "stub" ? "" : " (coming soon)"}</button></div>
      <div class="cat-bank">${bank}</div>
      <div class="cat-acc">${acc === null ? `<span class="muted">Not attempted</span>`
        : `<span><b>${acc}%</b> <span class="muted">· ${st.ok}/${st.n}</span></span><span class="bar"><i style="width:${acc}%"></i></span>`}</div>
      <div class="cat-act">${actionButtons(c.id, "Practise", false)}</div>
    </div>`;
}

function renderHome() {
  meta.innerHTML = `<span>Progress is saved in this browser</span>`;
  const t = db.totals.mixed;
  const seen = CATEGORIES.reduce((s, c) => s + (db.seen[c.id] || []).length, 0);
  const hist = db.history.mixed || [];
  const reminder = backupReminder();
  app.innerHTML = `
    <div class="page-head">
      <h1>Assessments</h1>
      <p>Every round draws a new set of questions. Written questions don't repeat until you've seen them all, except ones you got wrong, which come back sooner. Calculation questions get new numbers each time.</p>
    </div>
    ${reminder ? `<div class="nudge" role="status">
      <p>${esc(reminder)} Your progress is saved only in this browser.</p>
      <div class="nudge-actions"><button class="link" type="button" data-backup>Download backup</button><button class="link" type="button" data-snooze>Not now</button></div>
    </div>` : ""}
    <section class="card test-card">
      <div class="test-row">
        <div>
          <p class="label">${esc(groupLabel(selectedCats()))} · ${selectionLabel(selectedCats())} <button class="link" type="button" data-setup>Choose categories</button></p>
          <h2>Financial aptitude test</h2>
          <ul class="facts">
            <li><b>20</b> questions</li><li>${db.roundModes.test === "learning" ? "Learning mode, no time limit" : "<b>20</b> minutes"}</li><li><b>${seen}</b> of ${totalWritten()} written questions seen so far</li>
          </ul>
        </div>
        <div class="test-actions">${actionButtons("mixed", "Start round", true)}</div>
      </div>
      ${t ? `<div class="stats">
        <span>Rounds <b>${t.rounds}</b></span><span>Average <b>${Math.round(t.sum / t.rounds)}%</b></span><span>Best <b>${t.best}%</b></span>
        ${hist.length ? `<span>Last <b>${hist[hist.length - 1].pct}%</b></span><button class="link" type="button" data-review="mixed">Review last round</button>` : ""}
      </div>` : ""}
    </section>
    ${db.attempts[RETRY] ? (() => { const at = db.attempts[RETRY], done = at.answers.filter(a => !isBlank(a)).length; return `
    <section class="card test-card retry-card">
      <div class="test-row">
        <div><p class="label">In progress</p><h2>Mistakes practice</h2><ul class="facts"><li><b>${at.items.length}</b> questions you got wrong or skipped</li></ul></div>
        <div class="test-actions"><button class="btn primary" type="button" data-resume="${RETRY}">Resume · ${done}/${at.items.length}</button><button class="btn" type="button" data-discard="${RETRY}">Discard</button></div>
      </div>
    </section>`; })() : ""}
    ${db.log.some(isAnswer) ? `<p class="report-link"><button class="link" type="button" data-report>See your weak spots</button></p>` : ""}
    <div class="section-head">
      <h2>Practise one category</h2>
      <div class="section-tools">
        <p>10 questions · ${db.roundModes.practice === "learning" ? "no time limit" : "10 minutes"}</p>
        <div class="seg" role="group" aria-label="Practice mode">
          ${[["timed", "Timed"], ["learning", "Learning"]].map(([v, l]) => `<button type="button" data-practice-mode="${v}" aria-pressed="${db.roundModes.practice === v}">${l}</button>`).join("")}
        </div>
        <label class="switch small"><input type="checkbox" role="switch" id="practiceCalc" ${calcPref("practice", db.roundModes.practice === "learning") ? "checked" : ""}><span>Calculator</span></label>
        <label class="switch small" title="Typed answers, ordering and classification questions"><input type="checkbox" role="switch" id="practiceFormats" ${db.newFormats ? "checked" : ""}><span>New formats</span></label>
      </div>
    </div>
    <div class="cat-table">
      <div class="cat-row cat-head" aria-hidden="true"><span>Category</span><span>Question bank</span><span>Your accuracy</span><span></span></div>
      ${GROUPS.map(g => `<div class="cat-group">${esc(g.name)}</div>` + CATEGORIES.filter(c => c.group === g.id).map(catRow).join("")).join("")}
    </div>
    ${srsPanel()}`;
  wireSrsPanel();
  app.querySelectorAll("[data-new]").forEach(b => b.onclick = () => b.dataset.new === "mixed" ? go({ name: "setup" }) : newRound(b.dataset.new));
  app.querySelectorAll("[data-setup]").forEach(b => b.onclick = () => go({ name: "setup" }));
  app.querySelectorAll("[data-backup]").forEach(b => b.onclick = exportBackup);
  app.querySelectorAll("[data-report]").forEach(b => b.onclick = () => go({ name: "report", back: { name: "home" } }));
  app.querySelectorAll("[data-learn]").forEach(b => b.onclick = () => go({ name: "lesson", cat: b.dataset.learn, back: { name: "home" } }));
  document.getElementById("practiceFormats").onchange = e => { db.newFormats = e.target.checked; persist(); renderHome(); document.getElementById("practiceFormats").focus(); };
  const practiceCalc = document.getElementById("practiceCalc");
  practiceCalc.onchange = () => {
    db.calcPrefs[calcKey("practice", db.roundModes.practice === "learning")] = practiceCalc.checked;
    persist(); renderHome(); document.getElementById("practiceCalc").focus();
  };
  app.querySelectorAll("[data-practice-mode]").forEach(b => b.onclick = () => {
    db.roundModes.practice = b.dataset.practiceMode; persist(); renderHome();
    document.querySelector(`[data-practice-mode="${b.dataset.practiceMode}"]`).focus();
  });
  app.querySelectorAll("[data-snooze]").forEach(b => b.onclick = () => { db.backupNudgeDismissedAt = Date.now(); persist(); renderHome(); });
  app.querySelectorAll("[data-resume]").forEach(b => b.onclick = () => go({ name: "quiz", mode: b.dataset.resume }));
  app.querySelectorAll("[data-discard]").forEach(b => b.onclick = () => confirmModal("Discard this practice?", "Your mistakes practice in progress will be deleted.", "Discard",
    () => { delete db.attempts[b.dataset.discard]; persist(); renderHome(); }));
  app.querySelectorAll("[data-review]").forEach(b => b.onclick = () => {
    const h = db.history[b.dataset.review];
    reviewFilter = "all";
    go({ name: "results", mode: b.dataset.review, result: h[h.length - 1] });
  });
}

/* Spaced repetition panel (home page) */
let srsCatsOpen = false;
const dueCount = cat => written(cat).filter(q => db.schedule[q.id] && db.schedule[q.id].dueAt <= Date.now()).length;
function srsPanel() {
  const due = CATEGORIES.filter(c => srsOn(c.id)).reduce((s, c) => s + dueCount(c.id), 0);
  const off = CATEGORIES.filter(c => db.srsExcluded.includes(c.id)).length;
  const status = !db.srsEnabled
    ? "Off. Rounds pick questions as they always have. Your schedule is still kept up to date, so you can switch it back on at any time."
    : !Object.keys(db.schedule).length
      ? "Questions get scheduled as you answer them: wrong ones come back the next day, right ones after 2, 4, 8… days."
      : `${due ? `<b>${due}</b> question${due > 1 ? "s" : ""} due for review` : "Nothing due right now"}${off ? ` · off for ${off} categor${off > 1 ? "ies" : "y"}` : ""}. Due questions come first in your rounds: wrong answers come back the next day, right ones after 2, 4, 8… days.`;
  return `<section class="card srs" id="srs">
      <div class="srs-head">
        <div><h2>Spaced repetition</h2><p class="muted">${status}</p></div>
        <label class="switch"><input type="checkbox" role="switch" id="srsToggle" ${db.srsEnabled ? "checked" : ""}><span>${db.srsEnabled ? "On" : "Off"}</span></label>
      </div>
      <button class="link" type="button" id="srsCatsBtn" aria-expanded="${srsCatsOpen}" aria-controls="srsCats">${srsCatsOpen ? "Hide categories" : "Choose categories"}</button>
      <div class="check-grid srs-cats" id="srsCats" ${srsCatsOpen ? "" : "hidden"}>
        ${CATEGORIES.filter(c => written(c.id).length).map(c => { const n = dueCount(c.id); return `
          <label class="check" for="srs-${c.id}">
            <input type="checkbox" id="srs-${c.id}" value="${c.id}" ${db.srsExcluded.includes(c.id) ? "" : "checked"}>
            <span><b>${esc(c.name)}</b><small>${n ? `${n} due` : "Nothing due"}</small></span>
          </label>`; }).join("")}
      </div>
    </section>`;
}
function wireSrsPanel() {
  const refresh = () => { document.getElementById("srs").outerHTML = srsPanel(); wireSrsPanel(); };
  document.getElementById("srsToggle").onchange = e => { db.srsEnabled = e.target.checked; persist(); refresh(); document.getElementById("srsToggle").focus(); };
  document.getElementById("srsCatsBtn").onclick = () => { srsCatsOpen = !srsCatsOpen; refresh(); document.getElementById("srsCatsBtn").focus(); };
  document.querySelectorAll("#srsCats input").forEach(b => b.onchange = () => {
    db.srsExcluded = b.checked ? db.srsExcluded.filter(id => id !== b.value) : [...db.srsExcluded, b.value];
    persist(); refresh(); document.getElementById("srs-" + b.value).focus();
  });
}

/* Quiz */
function renderQuiz() {
  clearInterval(tick);
  const at = db.attempts[view.mode];
  if (!at) return go({ name: "home" });
  // Coming back to a round whose deadline passed while away: tell the user before scoring it.
  // A live countdown (view.live) still auto-submits in update() below.
  if (!view.live && at.deadline - Date.now() <= 0) return renderExpired(at);
  // Entering the round: start timing the current question from now. A visit left open by a closed tab is
  // discarded rather than counted, so time spent away from the site never shows up as time on a question.
  if (!view.live) startVisit(at);
  view.live = true;
  const info = modeInfo(view.mode), n = at.items.length, it = at.items[at.cur];
  const answered = at.answers.filter(a => !isBlank(a)).length;
  // Learning mode: once a question is answered it locks and shows the answer and explanation.
  const ans = at.answers[at.cur], revealed = isRevealed(at, at.cur);
  const optClass = i => !revealed ? "" : i === it.a ? " reveal-right" : i === ans ? " reveal-wrong" : "";

  meta.innerHTML = `<span>${answered} of ${n} answered</span><button class="link" id="exitBtn" type="button">Save &amp; exit</button>`;
  app.innerHTML = `
    <div class="title-row">
      <div><h1>${esc(info.title)}</h1><p>${answered ? "Saved" : esc(at.sub || info.sub)}</p></div>
      ${at.learning ? `<div class="timer untimed"><span>Learning mode</span><strong>No time limit</strong></div>`
        : `<div class="timer" id="timer" role="timer"><span>Time left</span><strong id="clock">${fmt(at.deadline - Date.now())}</strong></div>`}
    </div>
    <section class="card question" aria-labelledby="qtext">
      <p class="label">${esc(catById(it.cat).name)} · Question ${at.cur + 1} of ${n}${it.lv ? ` · ${LEVELS[it.lv]}` : ""}</p>
      <p class="prompt" id="qtext">${esc(it.q)}</p>
      ${it.type === "numeric" ? typedArea(at, it, ans, revealed) : it.type === "order" ? orderArea(at, it, ans, revealed) : it.type === "grid" ? gridArea(at, it, ans, revealed) : `
      <div class="options" role="radiogroup" aria-labelledby="qtext">
        ${it.o.map((o, i) => `<button type="button" class="opt${optClass(i)}" role="radio" aria-checked="${ans === i}" data-opt="${i}" ${revealed ? "disabled" : ""}><span class="radio"></span><span>${esc(o)}</span></button>`).join("")}
      </div>
      ${revealed ? `<div class="feedback ${ans === it.a ? "ok" : "no"}" id="feedback" role="status" tabindex="-1">
        <p class="feedback-title">${ans === it.a ? "Correct" : `Not quite. The answer is: ${esc(it.o[it.a])}`}</p>
        ${ans !== it.a && it.x[ans] ? `<p>${esc(it.x[ans])}</p>` : ""}
        <p>${esc(it.why)}</p>
      </div>` : ""}`}
      <div class="actions">
        <button class="btn" id="prevBtn" type="button" ${at.cur === 0 ? "disabled" : ""}>Previous</button>
        <button class="btn primary" id="nextBtn" type="button" ${at.cur === n - 1 ? "disabled" : ""}>Next</button>
        <button class="btn mark ${at.marked[at.cur] ? "on" : ""}" id="markBtn" type="button" aria-pressed="${at.marked[at.cur]}">${at.marked[at.cur] ? "Marked for review" : "Mark for review"}</button>
        ${at.calc ? `<button class="btn" id="calcBtn" type="button" aria-controls="calcPanel" aria-expanded="${CalcUI.isOpen()}">Calculator</button>` : ""}
        <span class="spacer"></span>
        <button class="btn" id="submitBtn" type="button">Submit test</button>
      </div>
      <p class="shortcuts">Keyboard: <kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>←</kbd> <kbd>→</kbd> previous / next · <kbd>M</kbd> mark for review</p>
    </section>
    <section class="tray" aria-label="Question navigator">
      <p>Go to a question · filled = answered · amber ring = marked for review · outline = current</p>
      <div class="qgrid">
        ${at.items.map((_, i) => {
          const cls = ["q", !isBlank(at.answers[i]) && "answered", at.marked[i] && "flag", i === at.cur && "current"].filter(Boolean).join(" ");
          return `<button type="button" class="${cls}" data-go="${i}" aria-label="Question ${i + 1}${!isBlank(at.answers[i]) ? ", answered" : ""}${at.marked[i] ? ", marked" : ""}" ${i === at.cur ? 'aria-current="step"' : ""}>${i + 1}</button>`;
        }).join("")}
      </div>
    </section>`;

  app.querySelectorAll("[data-opt]").forEach(b => b.onclick = () => choose(+b.dataset.opt));
  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => move(+b.dataset.go));
  document.getElementById("prevBtn").onclick = () => move(at.cur - 1);
  document.getElementById("nextBtn").onclick = () => move(at.cur + 1);
  document.getElementById("markBtn").onclick = toggleMark;
  if (it.type === "numeric" && !revealed) wireTyped(at, it);
  if (it.type === "order" && !revealed) wireOrder(at, it);
  if (it.type === "grid" && !revealed) wireGrid(at, it);
  // Calculator: only in rounds that allow it (decided when the round started).
  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) calcBtn.onclick = () => { CalcUI.toggle(); calcBtn.setAttribute("aria-expanded", CalcUI.isOpen()); };
  else CalcUI.hide();
  document.getElementById("submitBtn").onclick = askSubmit;
  document.getElementById("exitBtn").onclick = () => go({ name: "home" });

  if (at.learning) return; // no countdown in Learning mode
  const update = () => {
    const left = at.deadline - Date.now(), clock = document.getElementById("clock");
    if (!clock) return;
    clock.textContent = fmt(left);
    document.getElementById("timer").classList.toggle("low", left < 120000);
    if (left <= 0) { clearInterval(tick); submit(true); }
  };
  update();
  tick = setInterval(update, 500);
}

/* Typed-answer questions on the quiz screen */
function typedHint(it, raw) {
  if (isBlank(raw)) return it.unit === "%" ? "12.5, 12.5% and 0.125 all count as 12.5%." : it.unit === "US$m" ? "In US$ millions: 1.2, 1.2m and 1,200,000 all count as US$1.2m." : "Type a number.";
  return Typed.readings(raw, it.unit).length ? "" : "That doesn't read as a number yet.";
}
function typedArea(at, it, ans, revealed) {
  const g = revealed ? grade(it, ans) : null, right = Typed.show(it.answer, it.unit, it.dp);
  return `<div class="typed">
      <div class="typed-row">
        <input id="typedInput" class="typed-input" type="text" inputmode="decimal" autocomplete="off" autocorrect="off" spellcheck="false"
          aria-labelledby="qtext" aria-describedby="typedHint" value="${esc(ans ?? "")}" ${revealed ? "disabled" : ""}>
        ${it.unit ? `<span class="typed-unit" aria-hidden="true">${esc(it.unit)}</span>` : ""}
        ${at.learning && !revealed ? `<button class="btn primary" id="checkBtn" type="button">Check</button>` : ""}
      </div>
      <p class="typed-hint" id="typedHint" aria-live="polite">${revealed ? "" : esc(typedHint(it, ans))}</p>
    </div>
    ${revealed ? `<div class="feedback ${g.ok ? "ok" : "no"}" id="feedback" role="status" tabindex="-1">
      <p class="feedback-title">${g.ok ? `Correct: ${esc(right)}` : `Not quite. The answer is ${esc(right)}${g.value != null ? `; you gave ${esc(Typed.show(g.value, it.unit))}` : ""}.`}</p>
      ${g.ok ? "" : `<p>${esc(causeText(g))}</p>`}
      <p>${esc(it.why)}</p>
    </div>` : ""}`;
}
function wireTyped(at, it) {
  const input = document.getElementById("typedInput"), hint = document.getElementById("typedHint");
  const i = at.cur;
  const save = () => {
    ensureTiming(at);
    at.answers[i] = input.value.trim() === "" ? null : input.value;
    at.answeredAt[i] = at.answers[i] === null ? null : Date.now();
    persist();
    hint.textContent = typedHint(it, input.value);
    // Update the answered count and navigator without redrawing (which would lose the cursor).
    const n = at.answers.filter(a => !isBlank(a)).length, span = meta.querySelector("span");
    if (span) span.textContent = `${n} of ${at.items.length} answered`;
    document.querySelector(`[data-go="${i}"]`)?.classList.toggle("answered", !isBlank(at.answers[i]));
  };
  const check = () => {
    if (isBlank(at.answers[i])) { hint.textContent = "Type an answer first."; input.focus(); return; }
    (at.checked ||= [])[i] = true; persist(); renderQuiz();
    document.getElementById("feedback")?.focus({ preventScroll: true });
  };
  input.oninput = save;
  input.onkeydown = e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (at.learning) check(); else move(at.cur + 1);
  };
  const btn = document.getElementById("checkBtn");
  if (btn) btn.onclick = check;
}

/* Ordering questions on the quiz screen: ▲ ▼ buttons move a step; the first move (or "Use this order") answers it. */
function orderArea(at, it, ans, revealed) {
  const arr = isBlank(ans) ? it.start : ans, n = arr.length, g = revealed ? grade(it, ans) : null;
  return `<ol class="order-list" aria-label="Steps in your order">
      ${arr.map((step, pos) => `<li class="order-item${revealed ? (step === pos ? " right" : " wrong") : ""}">
        <span class="order-num" aria-hidden="true">${pos + 1}</span><span class="order-text">${esc(it.answer[step])}</span>
        ${revealed ? `<span class="order-mark" aria-label="${step === pos ? "right place" : "wrong place"}">${step === pos ? "✓" : "✗"}</span>` : `<span class="order-moves">
          <button type="button" class="order-btn" data-move="${pos}" data-dir="-1" aria-label="Move up: ${esc(it.answer[step])}" ${pos === 0 ? "disabled" : ""}>▲</button>
          <button type="button" class="order-btn" data-move="${pos}" data-dir="1" aria-label="Move down: ${esc(it.answer[step])}" ${pos === n - 1 ? "disabled" : ""}>▼</button>
        </span>`}
      </li>`).join("")}
    </ol>
    ${revealed ? `<div class="feedback ${g.ok ? "ok" : "no"}" id="feedback" role="status" tabindex="-1">
      <p class="feedback-title">${g.ok ? "Correct order" : `Not quite: ${g.placed} of ${n} steps are in the right place.`}</p>
      ${g.ok ? "" : `<p>The right order is:</p><ol class="order-correct">${it.answer.map(a => `<li>${esc(a)}</li>`).join("")}</ol>`}
      <p>${esc(it.why)}</p>
    </div>` : `<div class="order-foot">
      <p class="typed-hint" id="orderHint">${isBlank(ans) ? "Use ▲ ▼ to put the steps in order. Not answered yet." : "Your order is saved."}</p>
      ${isBlank(ans) ? `<button class="btn" id="orderKeep" type="button">Use this order</button>` : ""}
      ${at.learning ? `<button class="btn primary" id="checkBtn" type="button">Check</button>` : ""}
    </div>`}`;
}
function wireOrder(at, it) {
  const i = at.cur;
  const commit = arr => { ensureTiming(at); at.answers[i] = arr; at.answeredAt[i] = Date.now(); persist(); renderQuiz(); };
  app.querySelectorAll("[data-move]").forEach(b => b.onclick = () => {
    const pos = +b.dataset.move, dir = +b.dataset.dir, arr = (isBlank(at.answers[i]) ? it.start : at.answers[i]).slice();
    [arr[pos], arr[pos + dir]] = [arr[pos + dir], arr[pos]];
    commit(arr);
    // Keep focus on the step that moved, so it can be moved again with the keyboard.
    const to = pos + dir, same = app.querySelector(`[data-move="${to}"][data-dir="${dir}"]`);
    (same && !same.disabled ? same : app.querySelector(`[data-move="${to}"][data-dir="${-dir}"]`))?.focus();
  });
  const keep = document.getElementById("orderKeep");
  if (keep) keep.onclick = () => commit(it.start.slice());
  const check = document.getElementById("checkBtn");
  if (check) check.onclick = () => {
    if (isBlank(at.answers[i])) { ensureTiming(at); at.answers[i] = it.start.slice(); at.answeredAt[i] = Date.now(); }
    (at.checked ||= [])[i] = true; persist(); renderQuiz();
    document.getElementById("feedback")?.focus({ preventScroll: true });
  };
}

/* Classification grids on the quiz screen: pick one column per row. The first pick answers the question. */
function gridArea(at, it, ans, revealed) {
  const picks = Array.isArray(ans) ? ans : [], n = it.rows.length, g = revealed ? grade(it, ans) : null;
  const done = picks.filter(p => p !== null && p !== undefined).length;
  return `<div class="grid-q">
      ${it.rowOrder.map(k => {
        const row = it.rows[k], pick = picks[k] ?? null, okRow = pick === row.answer;
        return `<div class="grid-row${revealed ? (okRow ? " right" : " wrong") : ""}" role="radiogroup" aria-label="${esc(row.text)}">
          <span class="grid-text">${esc(row.text)}</span>
          <span class="grid-choices">${it.columns.map((c, ci) => `<button type="button" class="grid-choice${revealed && ci === row.answer ? " correct" : ""}" role="radio" aria-checked="${pick === ci}" data-row="${k}" data-col="${ci}" ${revealed ? "disabled" : ""}>${esc(c)}</button>`).join("")}</span>
          ${revealed ? `<span class="grid-note"><b aria-label="${okRow ? "right" : "wrong"}">${okRow ? "✓" : "✗"}</b> ${okRow ? "" : `${esc(it.columns[row.answer])}. `}${esc(row.note || "")}</span>` : ""}
        </div>`;
      }).join("")}
    </div>
    ${revealed ? `<div class="feedback ${g.ok ? "ok" : "no"}" id="feedback" role="status" tabindex="-1">
      <p class="feedback-title">${g.ok ? `All ${n} right` : `Not quite: ${g.right} of ${n} right.`}</p>
      <p>${esc(it.why)}</p>
    </div>` : `<div class="order-foot">
      <p class="typed-hint" id="gridHint">${done} of ${n} rows answered${done && done < n ? ". Rows left empty count as wrong." : "."}</p>
      ${at.learning ? `<button class="btn primary" id="checkBtn" type="button">Check</button>` : ""}
    </div>`}`;
}
function wireGrid(at, it) {
  const i = at.cur;
  app.querySelectorAll("[data-row]").forEach(b => b.onclick = () => {
    const row = +b.dataset.row, col = +b.dataset.col;
    const picks = Array.isArray(at.answers[i]) ? at.answers[i].slice() : Array(it.rows.length).fill(null);
    picks[row] = col;
    ensureTiming(at); at.answers[i] = picks; at.answeredAt[i] = Date.now(); persist(); renderQuiz();
    app.querySelector(`[data-row="${row}"][data-col="${col}"]`)?.focus();
  });
  const check = document.getElementById("checkBtn");
  if (check) check.onclick = () => {
    if (isBlank(at.answers[i])) { document.getElementById("gridHint").textContent = "Pick an answer in at least one row first."; return; }
    (at.checked ||= [])[i] = true; persist(); renderQuiz();
    document.getElementById("feedback")?.focus({ preventScroll: true });
  };
}

function renderExpired(at) {
  const info = modeInfo(view.mode), done = at.answers.filter(a => !isBlank(a)).length;
  at.viewStart = null; at.viewIdx = null; // a visit left open while away isn't time spent on the question
  meta.innerHTML = `<button class="link" id="exitBtn" type="button">All assessments</button>`;
  app.innerHTML = `
    <div class="title-row">
      <div><h1>${esc(info.title)}</h1><p>${esc(at.sub || info.sub)}</p></div>
      <div class="timer low" role="timer"><span>Time left</span><strong>00:00</strong></div>
    </div>
    <section class="card">
      <p class="prompt">Time ran out while you were away.</p>
      <p class="muted">You'd answered ${done} of ${at.items.length} questions. Unanswered questions score zero.</p>
      <div class="actions"><button class="btn primary" id="seeBtn" type="button">See your results</button></div>
    </section>`;
  const finish = () => submit(true);
  document.getElementById("seeBtn").onclick = finish;
  document.getElementById("exitBtn").onclick = () => go({ name: "home" });
  confirmModal("Time's up", "Time ran out while you were away. Your round will be scored with the answers you'd saved.", "See your results", finish);
}

function choose(i) {
  const at = db.attempts[view.mode];
  if (at.items[at.cur].type) return; // typed and ordering questions aren't answered with 1–4
  if (at.learning && at.answers[at.cur] !== null) return; // Learning mode: the answer locks once it's revealed
  ensureTiming(at); at.answers[at.cur] = i; at.answeredAt[at.cur] = Date.now(); persist(); renderQuiz();
  if (at.learning) document.getElementById("feedback")?.focus({ preventScroll: true });
}
function move(pos) { const at = db.attempts[view.mode]; if (pos < 0 || pos >= at.items.length) return; endVisit(at); at.cur = pos; startVisit(at); persist(); renderQuiz(); }
function toggleMark() { const at = db.attempts[view.mode]; at.marked[at.cur] = !at.marked[at.cur]; persist(); renderQuiz(); }

function askSubmit() {
  const at = db.attempts[view.mode];
  const blank = at.answers.filter(a => isBlank(a)).length, flagged = at.marked.filter(Boolean).length;
  const bits = [];
  if (blank) bits.push(`${blank} unanswered question${blank > 1 ? "s" : ""}`);
  if (flagged) bits.push(`${flagged} marked for review`);
  confirmModal("Submit your test?", bits.length ? `You have ${bits.join(" and ")}. Unanswered questions score zero.` : "All questions are answered. You can't change answers after submitting.", "Submit test", () => submit(false));
}

function submit(timedOut) {
  const mode = view.mode, at = db.attempts[mode];
  endVisit(at);
  const submittedAt = Date.now();
  // "Under time pressure" = answer last chosen in the final 10% of the round's time.
  const pressureFrom = at.deadline - (at.deadline - at.start) * 0.1;
  let correct = 0;
  at.items.forEach((it, i) => {
    const g = grade(it, at.answers[i]), ok = g.ok;
    if (ok) correct++;
    // Answer log: answered questions only (skips aren't logged). Calculation questions are logged with qid null.
    // i = position in the round, so later notes (e.g. "I read it wrong") can point at this entry via (at, i).
    if (!isBlank(at.answers[i])) {
      const entry = { qid: it.id || null, cat: it.cat, ok, at: submittedAt, usedMs: at.spentMs[i], answeredAt: at.answeredAt[i], mode, i,
        timePressure: at.answeredAt[i] != null && at.answeredAt[i] >= pressureFrom };
      const trap = it.type === "numeric" ? g.trap : !ok && it.trap ? it.trap[at.answers[i]] : null;
      if (it.type === "numeric") { entry.type = "numeric"; entry.given = g.value; if (!ok && g.cause) entry.cause = g.cause; }
      if (it.type === "order") { entry.type = "order"; entry.given = at.answers[i].slice(); }
      if (it.type === "grid") { entry.type = "grid"; entry.given = at.answers[i].slice(); entry.rowsRight = g.right; }
      if (trap) entry.trap = trap;
      if (at.learning) entry.learning = true;
      if (at.calc) entry.calc = true;
      db.log.push(entry);
    }
    // Retry rounds only re-ask known misses, so they'd skew category accuracy; leave it to normal rounds.
    if (mode !== RETRY) { const st = (db.catStats[it.cat] ||= { n: 0, ok: 0 }); st.n++; if (ok) st.ok++; }
    // Per-question record (written questions only; calculations get new numbers each time). Retries count here.
    if (it.id) { const qs = (db.qStats[it.id] ||= { n: 0, wrong: 0, last: null }); qs.n++; if (!ok) qs.wrong++; qs.last = ok ? "ok" : "wrong"; }
    // Spaced repetition schedule follows the answer log (answered written questions), whether or not it's switched on.
    if (it.id && !isBlank(at.answers[i])) scheduleAnswer(db.schedule, it.id, ok, submittedAt);
  });
  const pct = Math.round(correct / at.items.length * 100);
  const result = { at: submittedAt, mode, items: at.items, answers: at.answers, marked: at.marked, correct, total: at.items.length, pct,
    usedMs: Math.min(Date.now(), at.deadline) - at.start, timedOut, ...(at.learning ? { learning: true } : {}), ...(at.calc ? { calc: true } : {}) };
  db.history[mode] = [...(db.history[mode] || []), result].slice(-5);
  const t = (db.totals[mode] ||= { rounds: 0, sum: 0, best: 0 });
  t.rounds++; t.sum += pct; t.best = Math.max(t.best, pct);
  delete db.attempts[mode];
  persist();
  reviewFilter = "all";
  go({ name: "results", mode, result });
}

/* Diagnosis: everything below reads db.log. Notes are appended, never edited. */
const isAnswer = e => !e.kind;
const noteKey = (ref, i) => ref + ":" + i;
function causeNotes() { // latest "cause" note per answer, keyed by (round submit time, position)
  const m = new Map();
  for (const e of db.log) if (e.kind === "cause") m.set(noteKey(e.ref, e.i), e.cause);
  return m;
}
function addCause(ref, i, cause) { db.log.push({ kind: "cause", cause, ref, i, at: Date.now() }); persist(); }

const REPORT_WINDOW = 400; // the report looks at your most recent answers, so it reflects current form
const pctOf = (ok, n) => n ? Math.round(ok / n * 100) : null;
function diagnose() {
  const notes = causeNotes();
  const answers = db.log.filter(isAnswer).slice(-REPORT_WINDOW);
  const cats = {}, cat = id => (cats[id] ||= { n: 0, ok: 0, tpN: 0, tpOk: 0, tpWrong: 0, misread: 0 });
  const all = { n: 0, ok: 0 }, tp = { n: 0, ok: 0 }, calm = { n: 0, ok: 0 }, traps = {};
  let tagged = 0, misreads = 0, slips = 0, gaps = 0;
  for (const e of answers) {
    // Mistakes practice re-asks known misses, so it's left out of accuracy (as in category accuracy on the home page).
    if (e.mode !== RETRY) {
      const c = cat(e.cat);
      c.n++; all.n++; if (e.ok) { c.ok++; all.ok++; }
      if (e.timePressure === true) { c.tpN++; tp.n++; if (e.ok) { c.tpOk++; tp.ok++; } else c.tpWrong++; }
      else if (e.timePressure === false) { calm.n++; if (e.ok) calm.ok++; }
    }
    if (!e.ok && e.trap) { tagged++; traps[e.trap] = (traps[e.trap] || 0) + 1; }
    if (!e.ok && e.cause === "calculation-slip") slips++; // typed answers: close but outside the tolerance
    if (!e.ok && e.cause === "concept-gap") gaps++;       // typed answers: far off
    if (!e.ok && e.i != null && notes.get(noteKey(e.at, e.i)) === "misread") { misreads++; cat(e.cat).misread++; }
  }
  const name = id => catById(id)?.name || id;
  const found = []; // [severity, sentence]
  const tpAcc = pctOf(tp.ok, tp.n), calmAcc = pctOf(calm.ok, calm.n);
  if (tp.n >= 5 && calm.n >= 10 && calmAcc - tpAcc >= 15) {
    const worst = Object.entries(cats).filter(([, c]) => c.tpWrong >= 2).sort((a, b) => b[1].tpWrong - a[1].tpWrong)[0];
    found.push([calmAcc - tpAcc, `Under time pressure (the last 10% of a round) you get ${tpAcc}% right, against ${calmAcc}% otherwise.${worst ? ` It shows most in ${name(worst[0])}.` : ""}`]);
  }
  const overall = pctOf(all.ok, all.n);
  const weakest = Object.entries(cats).filter(([, c]) => c.n >= 10).map(([id, c]) => [id, c, pctOf(c.ok, c.n)]).sort((a, b) => a[2] - b[2])[0];
  if (weakest && overall - weakest[2] >= 10)
    found.push([overall - weakest[2], `Your weakest category is ${name(weakest[0])}: ${weakest[2]}% right over ${weakest[1].n} answers, against ${overall}% overall.`]);
  const topTrap = Object.entries(traps).sort((a, b) => b[1] - a[1])[0];
  if (tagged >= 5 && topTrap && topTrap[1] / tagged >= 0.3)
    found.push([topTrap[1] / tagged * 50, `Your most common slip is ${TRAPS[topTrap[0]] || topTrap[0]}: ${topTrap[1]} of your ${tagged} tagged mistakes.`]);
  if (misreads >= 3) {
    const most = Object.entries(cats).filter(([, c]) => c.misread >= 2).sort((a, b) => b[1].misread - a[1].misread)[0];
    found.push([misreads * 5, `You've marked ${misreads} wrong answers as misread.${most ? ` Most were in ${name(most[0])}.` : ""} Take a second to reread the question before the options.`]);
  }
  const typedWrong = slips + gaps;
  if (typedWrong >= 4 && slips / typedWrong >= 0.6)
    found.push([slips / typedWrong * 40, `${slips} of your ${typedWrong} wrong typed answers were close (within 10%): mostly calculation slips, so double-check the final arithmetic.`]);
  else if (typedWrong >= 4 && gaps / typedWrong >= 0.6)
    found.push([gaps / typedWrong * 40, `${gaps} of your ${typedWrong} wrong typed answers were far off, which points to the method rather than the arithmetic.`]);
  const insights = found.sort((a, b) => b[0] - a[0]).slice(0, 3).map(f => f[1]);
  const empty = answers.length < 10
    ? `Patterns appear once you've answered a few more questions (${answers.length} logged so far).`
    : `No clear weak spots in your last ${answers.length} answers. This updates after every round.`;
  return { insights, empty, cats, traps, tagged, answers: answers.length, tp, calm, slips, gaps };
}

function insightsBox(withLink) {
  const d = diagnose();
  return `<section class="card insights" id="insights">
      <div class="insights-head"><h2>Your recurring issues</h2>${withLink ? `<button class="link" type="button" data-report>See full report</button>` : ""}</div>
      ${d.insights.length ? `<ul>${d.insights.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p class="muted">${esc(d.empty)}</p>`}
    </section>`;
}

function renderReport() {
  const d = diagnose(), back = view.back || { name: "home" };
  meta.innerHTML = `<button class="link" id="backLink" type="button">Back</button>`;
  const rows = Object.entries(d.cats).filter(([, c]) => c.n).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  const traps = Object.entries(d.traps).sort((a, b) => b[1] - a[1]);
  app.innerHTML = `
    <div class="title-row"><div><h1>Your weak spots</h1><p>Based on your last ${d.answers} answers · mistakes practice isn't counted in accuracy</p></div></div>
    ${insightsBox(false)}
    <div class="section-head"><h2>By category</h2><p>Worst first</p></div>
    ${rows.length ? `<div class="table-wrap"><table class="report-table">
      <thead><tr><th scope="col">Category</th><th scope="col">Answers</th><th scope="col">Right</th><th scope="col">Under time pressure</th><th scope="col">Misread</th></tr></thead>
      <tbody>${rows.map(([id, c]) => `<tr><th scope="row">${esc(catById(id)?.name || id)}</th><td>${c.n}</td><td>${pctOf(c.ok, c.n)}%</td>
        <td>${c.tpN ? `${pctOf(c.tpOk, c.tpN)}% <span class="muted">of ${c.tpN}</span>` : `<span class="muted">–</span>`}</td><td>${c.misread || `<span class="muted">–</span>`}</td></tr>`).join("")}</tbody>
    </table></div>` : `<div class="card"><p class="muted">Play a round to see your results by category.</p></div>`}
    <div class="section-head"><h2>Mistake types</h2><p>${d.tagged ? `${d.tagged} tagged mistakes` : ""}</p></div>
    ${traps.length ? `<div class="table-wrap"><table class="report-table">
      <thead><tr><th scope="col">Mistake</th><th scope="col">Times</th></tr></thead>
      <tbody>${traps.map(([k, v]) => `<tr><th scope="row">${esc(TRAPS[k] ? TRAPS[k][0].toUpperCase() + TRAPS[k].slice(1) : k)}</th><td>${v}</td></tr>`).join("")}</tbody>
    </table></div>` : `<div class="card"><p class="muted">Mistake types will show here once the questions' wrong answers are tagged with the kind of slip they represent.</p></div>`}
    ${d.slips + d.gaps ? `<div class="section-head"><h2>Typed answers</h2><p>Wrong typed answers, by how far off they were</p></div>
    <div class="table-wrap"><table class="report-table">
      <thead><tr><th scope="col">Kind of miss</th><th scope="col">Times</th></tr></thead>
      <tbody><tr><th scope="row">Close (within 10%): calculation slip</th><td>${d.slips}</td></tr><tr><th scope="row">Further off: concept gap</th><td>${d.gaps}</td></tr></tbody>
    </table></div>` : ""}
    <div class="result-actions"><button class="btn lg" id="backBtn" type="button">Back</button></div>`;
  document.getElementById("backLink").onclick = document.getElementById("backBtn").onclick = () => go(back);
}

/* Lessons: one page per category (content in site/lessons/<category>.js) */
const LESSON_STATUS = { stub: "Not written yet", draft: "Draft", reviewed: "Reviewed" };
function renderLesson() {
  const c = catById(view.cat), l = Lessons.all[view.cat] || { status: "stub" }, back = view.back || { name: "home" };
  const missing = `<p class="muted">This lesson hasn't been written yet.</p>`;
  const src = l.source, safeUrl = src && /^https?:\/\//i.test(src.url || "") ? src.url : null; // only plain web links
  const ex = l.example;
  meta.innerHTML = `<button class="link" id="backLink" type="button">Back</button>`;
  app.innerHTML = `
    <div class="title-row">
      <div><h1>${esc(c.name)}</h1><p>Learn · ${esc(c.desc)}</p></div>
      <span class="pill lesson-status ${esc(l.status)}">${esc(LESSON_STATUS[l.status] || l.status)}</span>
    </div>
    <section class="card lesson">
      <h2>Method</h2>
      ${l.method && l.method.length ? l.method.map(p => `<p>${esc(p)}</p>`).join("") : missing}
      <h2>Worked example</h2>
      ${ex ? `<p class="prompt">${esc(ex.question)}</p>
        ${ex.working && ex.working.length ? `<ol class="lesson-steps">${ex.working.map(w => `<li>${esc(w)}</li>`).join("")}</ol>` : ""}
        <p class="lesson-answer"><b>Answer:</b> ${esc(ex.answer)}</p>` : missing}
      <h2>Source</h2>
      ${src ? `<p>${safeUrl ? `<a href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer">${esc(src.text)}</a>` : esc(src.text)}</p>` : missing}
    </section>
    <div class="result-actions">
      <button class="btn primary lg" id="practiseBtn" type="button">Practise this category</button>
      <button class="btn lg" id="backBtn" type="button">Back</button>
    </div>`;
  document.getElementById("backLink").onclick = document.getElementById("backBtn").onclick = () => go(back);
  document.getElementById("practiseBtn").onclick = () => newRound(view.cat);
}

/* Results */
function renderResults() {
  const r = view.result, info = modeInfo(view.mode);
  const status = i => isBlank(r.answers[i]) ? "skip" : grade(r.items[i], r.answers[i]).ok ? "ok" : "no";
  const cats = {};
  r.items.forEach((it, i) => { const c = (cats[it.cat] ||= { n: 0, ok: 0 }); c.n++; if (status(i) === "ok") c.ok++; });
  const wrongN = r.items.filter((_, i) => status(i) === "no").length;
  const skipN = r.items.filter((_, i) => status(i) === "skip").length;
  const markN = r.marked.filter(Boolean).length;
  const verdict = r.pct >= 85 ? "Strong result" : r.pct >= 70 ? "Solid pass" : r.pct >= 50 ? "Borderline: worth another round" : "Needs more rehearsal";
  const shown = r.items.map((it, i) => i).filter(i => reviewFilter === "wrong" ? status(i) !== "ok" : reviewFilter === "marked" ? r.marked[i] : true);
  // "I read it wrong" is offered on wrong answers whose log entry can be pointed at (rounds submitted since this feature).
  const notes = causeNotes();
  const logged = new Set(db.log.filter(e => isAnswer(e) && e.at === r.at && e.i != null).map(e => e.i));
  const misread = i => notes.get(noteKey(r.at, i)) === "misread";

  meta.innerHTML = `<button class="link" id="backHome" type="button">All assessments</button>`;
  app.innerHTML = `
    <div class="title-row"><div><h1>${esc(info.title)} · Results</h1><p>${new Date(r.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p></div></div>
    <section class="card">
      <div class="score-head">
        <div class="score-big">${r.correct}<small> / ${r.total}</small></div>
        <div>
          <p class="verdict">${verdict} · ${r.pct}%</p>
          <p class="muted">${r.learning ? `Learning mode · time spent ${fmt(r.usedMs)}` : `${r.timedOut ? "Time ran out · " : ""}Time used ${fmt(r.usedMs)} of ${fmt(r.total * 60000)}`} · ${wrongN} wrong · ${skipN} unanswered</p>
        </div>
      </div>
      <div class="result-actions">
        ${view.mode !== RETRY ? `<button class="btn primary lg" id="againBtn" type="button">Generate another round</button>` : ""}
        ${wrongN + skipN ? `<button class="btn ${view.mode === RETRY ? "primary " : ""}lg" id="retryBtn" type="button">Practise these again · ${wrongN + skipN}</button>` : ""}
        <button class="btn lg" id="homeBtn" type="button">All assessments</button>
      </div>
      <div class="rnav">
        <p>Jump to a question · <span class="key"><i class="q ok"></i>correct</span> <span class="key"><i class="q no"></i>wrong</span> <span class="key"><i class="q skip"></i>unanswered</span> <span class="key"><i class="q flag"></i>marked</span></p>
        <div class="qgrid">
          ${r.items.map((_, i) => `<button type="button" class="q ${status(i)}${r.marked[i] ? " flag" : ""}" data-jump="${i}" aria-label="Question ${i + 1}, ${{ ok: "correct", no: "wrong", skip: "unanswered" }[status(i)]}">${i + 1}</button>`).join("")}
        </div>
      </div>
      <ul class="cats">
        ${Object.entries(cats).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([c, v]) => `
          <li class="cat"><span>${esc(catById(c).name)}</span><span class="bar"><i style="width:${v.ok / v.n * 100}%"></i></span><b>${v.ok}/${v.n}</b></li>`).join("")}
      </ul>
    </section>
    ${db.log.some(isAnswer) ? insightsBox(true) : ""}
    <div class="filters" role="group" aria-label="Filter answers">
      ${[["all", `All ${r.total}`], ["wrong", `Wrong or skipped ${wrongN + skipN}`], ["marked", `Marked ${markN}`]].map(([k, l]) => `<button type="button" class="filter" data-filter="${k}" aria-pressed="${reviewFilter === k}">${l}</button>`).join("")}
    </div>
    <div class="review">
      ${shown.length ? shown.map(i => reviewItem(r.items[i], i, r.answers[i], r.marked[i], logged.has(i) ? misread(i) : null)).join("") :`<div class="card"><p class="muted">Nothing to show for this filter.</p></div>`}
    </div>`;

  const againBtn = document.getElementById("againBtn"), retryBtn = document.getElementById("retryBtn");
  if (againBtn) againBtn.onclick = () => newRound(view.mode);
  if (retryBtn) retryBtn.onclick = () => startRetry(r.items.filter((_, i) => status(i) !== "ok"));
  document.getElementById("homeBtn").onclick = () => go({ name: "home" });
  document.getElementById("backHome").onclick = () => go({ name: "home" });
  app.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { reviewFilter = b.dataset.filter; renderResults(); });
  app.querySelectorAll("[data-learn]").forEach(b => b.onclick = () =>
    go({ name: "lesson", cat: b.dataset.learn, back: { ...view, scrollTo: "r-" + b.dataset.from } }));
  if (view.scrollTo) { // back from a lesson: return to the question you came from
    const target = document.getElementById(view.scrollTo);
    delete view.scrollTo;
    if (target) { target.scrollIntoView({ block: "start" }); target.querySelector("[data-learn]")?.focus({ preventScroll: true }); }
  }
  const wireReport = () => app.querySelectorAll("[data-report]").forEach(b => b.onclick = () => go({ name: "report", back: view }));
  wireReport();
  app.querySelectorAll("[data-misread]").forEach(b => b.onclick = () => {
    const i = +b.dataset.misread, on = !misread(i);
    addCause(r.at, i, on ? "misread" : null);
    notes.set(noteKey(r.at, i), on ? "misread" : null);
    b.setAttribute("aria-pressed", on); b.textContent = on ? "Marked as misread · undo" : "I read the question wrong";
    const box = document.getElementById("insights"); // refresh the summary in place, without moving the page
    if (box) { box.outerHTML = insightsBox(true); wireReport(); }
  });
  app.querySelectorAll("[data-jump]").forEach(b => b.onclick = () => {
    const id = "r-" + b.dataset.jump;
    if (!document.getElementById(id)) { reviewFilter = "all"; renderResults(); }
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id).scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  });
}

// misread: true/false when the "I read it wrong" button applies (logged wrong answer), null otherwise.
function reviewItem(it, i, ans, marked, misread) {
  const learnLink = () => `<p class="review-learn"><button class="link" type="button" data-learn="${it.cat}" data-from="${i}">Review the method: ${esc(catById(it.cat).name)}</button></p>`;
  const g = grade(it, ans);
  const st = isBlank(ans) ? ["skip", "Unanswered"] : g.ok ? ["ok", "Correct"] : ["no", "Incorrect"];
  const misreadBtn = st[0] === "no" && misread !== null
    ? `<button type="button" class="misread" data-misread="${i}" aria-pressed="${misread}">${misread ? "Marked as misread · undo" : "I read the question wrong"}</button>` : "";
  return `
    <article class="card item" id="r-${i}">
      <div class="item-top">
        <p class="label">${esc(catById(it.cat).name)} · Question ${i + 1}${it.lv ? ` · ${LEVELS[it.lv]}` : ""}${it.gen ? " · Calculation" : ""}${it.type === "numeric" ? " · Typed answer" : it.type === "order" ? " · Ordering" : it.type === "grid" ? " · Classification" : ""}</p>
        <span class="pills">${misreadBtn}<span class="pill ${st[0]}">${st[1]}</span>${marked ? `<span class="pill flagged">Marked</span>` : ""}</span>
      </div>
      <p class="prompt">${esc(it.q)}</p>
      ${it.type === "grid" ? `
      <p class="label">${g.ok ? `All ${it.rows.length} rows right` : `${g.right} of ${it.rows.length} rows right`}</p>
      <ul class="ans">${it.rowOrder.map(k => {
        const row = it.rows[k], pick = Array.isArray(ans) ? ans[k] ?? null : null, okRow = pick === row.answer;
        return `<li class="${okRow ? "right" : isBlank(ans) ? "plain" : "wrong"}"><span class="mark" aria-hidden="true">${okRow ? "✓" : isBlank(ans) ? "" : "✗"}</span><div><span>${esc(row.text)}: <b>${esc(it.columns[row.answer])}</b>${!okRow && pick !== null ? ` <em>(your answer: ${esc(it.columns[pick])})</em>` : ""}${!okRow && pick === null && !isBlank(ans) ? " <em>(left empty)</em>" : ""}</span>${row.note ? `<span class="note">${esc(row.note)}</span>` : ""}</div></li>`;
      }).join("")}</ul>
      <p class="note-block">${esc(it.why)}</p>` : it.type === "order" ? `
      ${isBlank(ans) ? "" : `<p class="label">Your order</p><ol class="order-list review">${ans.map((step, pos) => `<li class="order-item ${step === pos ? "right" : "wrong"}"><span class="order-num" aria-hidden="true">${pos + 1}</span><span class="order-text">${esc(it.answer[step])}</span><span class="order-mark" aria-label="${step === pos ? "right place" : "wrong place"}">${step === pos ? "✓" : "✗"}</span></li>`).join("")}</ol>`}
      ${g.ok ? "" : `<p class="label">The right order</p><ol class="order-correct">${it.answer.map(a => `<li>${esc(a)}</li>`).join("")}</ol>`}
      <p class="note-block">${esc(it.why)}</p>` : `
      <ul class="ans">
        ${it.type === "numeric" ? `
          <li class="right"><span class="mark" aria-hidden="true">✓</span><div><span>${esc(Typed.show(it.answer, it.unit, it.dp))}${g.ok ? ` <em>(your answer: ${esc(ans)})</em>` : ""}</span><span class="note">${esc(it.why)}</span></div></li>
          ${!isBlank(ans) && !g.ok ? `<li class="wrong"><span class="mark" aria-hidden="true">✗</span><div><span>${esc(ans)} <em>(your answer${g.value != null ? `, read as ${esc(Typed.show(g.value, it.unit))}` : ""})</em></span><span class="note">${esc(causeText(g))}</span></div></li>` : ""}`
        : it.o.map((o, j) => {
          const cls = j === it.a ? "right" : j === ans ? "wrong" : "plain";
          const note = j === it.a ? it.why : it.x[j];
          return `<li class="${cls}"><span class="mark" aria-hidden="true">${j === it.a ? "✓" : j === ans ? "✗" : ""}</span><div><span>${esc(o)}${j === ans ? " <em>(your answer)</em>" : ""}</span>${note ? `<span class="note">${esc(note)}</span>` : ""}</div></li>`;
        }).join("")}
      </ul>`}
      ${st[0] !== "ok" ? learnLink() : ""}
    </article>`;
}

/* Modal */
let lastFocus = null;
// cancelLabel: text for the second button, or null for a message with a single button.
function confirmModal(title, body, okLabel, onOk, cancelLabel = "Cancel") {
  if (!modalRoot.innerHTML) lastFocus = document.activeElement;
  modalRoot.innerHTML = `
    <div class="backdrop" id="backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <h3 id="mTitle">${esc(title)}</h3>
        <p>${esc(body)}</p>
        <div class="actions end">${cancelLabel === null ? "" : `<button class="btn" id="mCancel" type="button">${esc(cancelLabel)}</button>`}<button class="btn primary" id="mOk" type="button">${esc(okLabel)}</button></div>
      </div>
    </div>`;
  const cancel = document.getElementById("mCancel");
  if (cancel) cancel.onclick = closeModal;
  document.getElementById("backdrop").onclick = e => { if (e.target.id === "backdrop") closeModal(); };
  document.getElementById("mOk").onclick = () => { closeModal(); onOk(); };
  document.getElementById("mOk").focus();
}
function closeModal() {
  if (!modalRoot.innerHTML) return;
  modalRoot.innerHTML = "";
  // Return focus to whatever opened the modal, if it's still on the page.
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  lastFocus = null;
}

document.addEventListener("keydown", e => {
  if (e.target.closest?.(".calc")) return; // typing or tapping in the calculator never triggers quiz shortcuts
  if (e.target.matches?.("input[type=text], textarea")) return; // nor does typing a typed answer
  if (e.key === "Escape") return closeModal();
  if (view.name !== "quiz" || modalRoot.innerHTML || e.metaKey || e.ctrlKey || e.altKey) return;
  const at = db.attempts[view.mode];
  if (!at || !view.live) return;
  if (/^[1-4]$/.test(e.key)) choose(+e.key - 1);
  else if (e.key === "ArrowRight") move(at.cur + 1);
  else if (e.key === "ArrowLeft") move(at.cur - 1);
  else if (e.key.toLowerCase() === "m") toggleMark();
});

document.getElementById("homeLink").onclick = () => go({ name: "home" });

/* Light/dark toggle. Follows the device until clicked; the choice is then remembered in this browser.
   Kept under its own key so "Reset my progress" doesn't change the look. */
const THEME_KEY = "rehearse.theme";
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const themeBtn = document.getElementById("themeBtn");
const ICON_SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const ICON_MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>`;
const currentTheme = () => document.documentElement.dataset.theme || (darkQuery.matches ? "dark" : "light");
function syncThemeUI() {
  if (!themeBtn) return;
  const dark = currentTheme() === "dark", target = dark ? "light" : "dark";
  // The button shows what you'll switch to.
  themeBtn.innerHTML = `${dark ? ICON_SUN : ICON_MOON}<span>${dark ? "Light mode" : "Dark mode"}</span>`;
  themeBtn.setAttribute("aria-label", `Switch to ${target} mode`);
  themeBtn.title = `Switch to ${target} mode`;
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.content = dark ? "#12161f" : "#ffffff");
}
if (themeBtn) themeBtn.onclick = () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  syncThemeUI();
};
darkQuery.addEventListener("change", syncThemeUI);
syncThemeUI();
/* Backups: download everything as a JSON file, and load such a file back. */
const roundsPlayed = d => Object.values(d.totals || {}).reduce((s, t) => s + ((t && t.rounds) || 0), 0);
const dateLabel = ts => ts ? new Date(ts).toLocaleDateString(undefined, { dateStyle: "medium" }) : "an unknown date";

function exportBackup() {
  db.lastBackupAt = Date.now();
  persist();
  const d = new Date(db.lastBackupAt), pad = n => String(n).padStart(2, "0");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }));
  a.download = `rehearse-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  if (view.name === "home") renderHome(); // the reminder disappears once a backup is taken
}

// Returns a plain-language reason the object isn't a usable backup, or null if it looks right.
function backupProblem(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return "This file doesn't look like a Rehearse backup.";
  if (typeof d.schemaVersion !== "number" || d.schemaVersion < 1) return "This file doesn't look like a Rehearse backup: it has no version number.";
  if (d.schemaVersion > SCHEMA_VERSION) return "This backup was made by a newer version of the site. Refresh the page (Cmd + Shift + R) and try again.";
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const missing = ["attempts", "history", "totals", "seen", "catStats"].filter(k => !isObj(d[k]));
  if (missing.length) return `This file doesn't look like a Rehearse backup: ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} missing or the wrong shape.`;
  if ("qStats" in d && !isObj(d.qStats)) return "This backup is damaged: qStats is the wrong shape.";
  for (const k of ["excluded", "log"]) if (k in d && !Array.isArray(d[k])) return `This backup is damaged: ${k} should be a list.`;
  return null;
}

async function importBackup(file) {
  const fail = msg => confirmModal("Couldn't import this file", `${msg} Your current progress hasn't been changed.`, "OK", () => {}, null);
  let data;
  try { data = JSON.parse(await file.text()); }
  catch { return fail("This file isn't a valid backup file (it can't be read as JSON)."); }
  const problem = backupProblem(data);
  if (problem) return fail(problem);
  confirmModal("Replace your progress with this backup?",
    `Backup from ${dateLabel(data.lastBackupAt)}: ${roundsPlayed(data)} rounds played, ${(data.log || []).length} answers logged. ` +
    `In this browser now: ${roundsPlayed(db)} rounds played, ${db.log.length} answers logged. ` +
    "Importing replaces everything saved in this browser: scores, history, rounds in progress and category choices.",
    "Replace my progress", () => {
      clearInterval(tick);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
      catch { return fail("This browser couldn't store the backup, probably because its storage is full."); }
      location.reload();
    });
}

// Home-page reminder: returns the message to show, or null.
function backupReminder() {
  const DAY = 864e5, now = Date.now();
  if (db.backupNudgeDismissedAt && now - db.backupNudgeDismissedAt < 14 * DAY) return null;
  if (!db.lastBackupAt) { const n = roundsPlayed(db); return n >= 3 ? `You've played ${n} rounds and haven't downloaded a backup yet.` : null; }
  const since = new Set(db.log.filter(e => !e.kind && e.at > db.lastBackupAt).map(e => e.at)).size; // one log timestamp per submitted round
  if (since >= 10) return `You've played ${since} rounds since your last backup.`;
  if (since >= 1 && now - db.lastBackupAt >= 30 * DAY) return `Your last backup is from ${dateLabel(db.lastBackupAt)}.`;
  return null;
}

const exportBtn = document.getElementById("exportBtn"), importBtn = document.getElementById("importBtn"), importFile = document.getElementById("importFile");
if (exportBtn) exportBtn.onclick = exportBackup;
if (importBtn && importFile) {
  importBtn.onclick = () => importFile.click();
  importFile.onchange = () => { const f = importFile.files[0]; importFile.value = ""; if (f) importBackup(f); };
}

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.onclick = () => confirmModal("Reset your progress?",
  "This deletes your scores, history, rounds in progress and category choices in this browser. It can't be undone.", "Reset progress", () => {
    clearInterval(tick);
    try { localStorage.removeItem(STORE_KEY); } catch {}
    location.reload();
  });
CalcUI.onClose(() => document.getElementById("calcBtn")?.setAttribute("aria-expanded", "false"));
render();
})();
