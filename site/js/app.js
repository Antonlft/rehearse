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
  save(d) { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {} }
};
const db = store.load();
db.attempts ||= {}; db.history ||= {}; db.totals ||= {}; db.seen ||= {}; db.catStats ||= {}; db.excluded ||= [];
db.qStats ||= {}; // written question id -> { n: times answered, wrong: times wrong or skipped, last: "ok" | "wrong" }
// Permanent answer log: one entry per answered question in every submitted round. Only ever appended to, never edited or trimmed.
// Entry: { qid (null for calculation questions), cat, ok, at (submit time), usedMs (time on screen), answeredAt (last answer click), mode }
db.log ||= [];
// Schema version: documentation and safety only. Fields are only ever added, so the number only ever goes up.
//   1: everything live before the answer log (attempts, history, totals, seen, catStats, excluded, qStats)
//   2: added db.log; rounds in progress also gain spentMs[] and answeredAt[]
const SCHEMA_VERSION = 2;
db.schemaVersion = Math.max(db.schemaVersion || 1, SCHEMA_VERSION);
const persist = () => store.save(db);

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
const capacity = cat => gens(cat).length ? Infinity : written(cat).length;

/* Round building */
function generated(fn) {
  let g;
  for (let i = 0; i < 30; i++) {
    g = fn();
    if (g.o.length === 4 && new Set(g.o).size === 4 && !g.o.some(s => /NaN|Infinity|undefined/.test(s))) break;
  }
  return { ...g, gen: true };
}

function materialize(src, cat) {
  const perm = shuffle([0, 1, 2, 3]);
  return { cat, id: src.id || null, gen: !!src.gen, lv: src.lv || null, q: src.q, why: src.why,
    o: perm.map(i => src.o[i]), a: perm.indexOf(0), x: perm.map(i => i === 0 ? null : src.x[i - 1]) };
}

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
  const w = written(cat), g = gens(cat);
  if (w.length && !(g.length && Math.random() < GEN_SHARE)) {
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

function beginAttempt(mode, items, sub) {
  db.attempts[mode] = { mode, sub, items, answers: Array(items.length).fill(null), marked: Array(items.length).fill(false),
    cur: 0, start: Date.now(), deadline: Date.now() + items.length * 60000 };
  persist();
  reviewFilter = "all";
  go({ name: "quiz", mode });
}

function startRound(mode) {
  const cats = mode === "mixed" ? selectedCats() : [mode];
  const sub = mode === "mixed" ? `${groupLabel(cats)} · ${selectionLabel(cats)}` : "Category practice";
  beginAttempt(mode, buildRound(mode, cats), sub);
}

function newRound(mode) {
  if (db.attempts[mode]) confirmModal("Start a new round?", "Your round in progress will be discarded.", "Start new round", () => startRound(mode));
  else startRound(mode);
}

// Re-ask a finished round's missed items. Each item is rebuilt as "correct option first"
// and run through materialize() again, so the options come back in a new order.
function startRetry(items) {
  const go_ = () => beginAttempt(RETRY, shuffle(items).map(it => {
    const wrong = [0, 1, 2, 3].filter(j => j !== it.a);
    return materialize({ id: it.id, gen: it.gen, lv: it.lv, q: it.q, why: it.why,
      o: [it.o[it.a], ...wrong.map(j => it.o[j])], x: wrong.map(j => it.x[j]) }, it.cat);
  }), `${items.length} question${items.length > 1 ? "s" : ""} you got wrong or skipped`);
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
    summary.textContent = ids.length ? `${n} questions · ${n} minutes · ${selectionLabel(ids)}` : "Select at least one category to start.";
    goBtn.disabled = !ids.length;
  };
  boxes.forEach(b => b.onchange = sync);
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
    const at = db.attempts[mode], done = at.answers.filter(a => a !== null).length;
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
      <div class="cat-name"><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p></div>
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
  app.innerHTML = `
    <div class="page-head">
      <h1>Assessments</h1>
      <p>Every round draws a new set of questions. Written questions don't repeat until you've seen them all, except ones you got wrong, which come back sooner. Calculation questions get new numbers each time.</p>
    </div>
    <section class="card test-card">
      <div class="test-row">
        <div>
          <p class="label">${esc(groupLabel(selectedCats()))} · ${selectionLabel(selectedCats())} <button class="link" type="button" data-setup>Choose categories</button></p>
          <h2>Financial aptitude test</h2>
          <ul class="facts">
            <li><b>20</b> questions</li><li><b>20</b> minutes</li><li><b>${seen}</b> of ${totalWritten()} written questions seen so far</li>
          </ul>
        </div>
        <div class="test-actions">${actionButtons("mixed", "Start round", true)}</div>
      </div>
      ${t ? `<div class="stats">
        <span>Rounds <b>${t.rounds}</b></span><span>Average <b>${Math.round(t.sum / t.rounds)}%</b></span><span>Best <b>${t.best}%</b></span>
        ${hist.length ? `<span>Last <b>${hist[hist.length - 1].pct}%</b></span><button class="link" type="button" data-review="mixed">Review last round</button>` : ""}
      </div>` : ""}
    </section>
    ${db.attempts[RETRY] ? (() => { const at = db.attempts[RETRY], done = at.answers.filter(a => a !== null).length; return `
    <section class="card test-card retry-card">
      <div class="test-row">
        <div><p class="label">In progress</p><h2>Mistakes practice</h2><ul class="facts"><li><b>${at.items.length}</b> questions you got wrong or skipped</li></ul></div>
        <div class="test-actions"><button class="btn primary" type="button" data-resume="${RETRY}">Resume · ${done}/${at.items.length}</button><button class="btn" type="button" data-discard="${RETRY}">Discard</button></div>
      </div>
    </section>`; })() : ""}
    <div class="section-head"><h2>Practise one category</h2><p>10 questions · 10 minutes</p></div>
    <div class="cat-table">
      <div class="cat-row cat-head" aria-hidden="true"><span>Category</span><span>Question bank</span><span>Your accuracy</span><span></span></div>
      ${GROUPS.map(g => `<div class="cat-group">${esc(g.name)}</div>` + CATEGORIES.filter(c => c.group === g.id).map(catRow).join("")).join("")}
    </div>`;
  app.querySelectorAll("[data-new]").forEach(b => b.onclick = () => b.dataset.new === "mixed" ? go({ name: "setup" }) : newRound(b.dataset.new));
  app.querySelectorAll("[data-setup]").forEach(b => b.onclick = () => go({ name: "setup" }));
  app.querySelectorAll("[data-resume]").forEach(b => b.onclick = () => go({ name: "quiz", mode: b.dataset.resume }));
  app.querySelectorAll("[data-discard]").forEach(b => b.onclick = () => confirmModal("Discard this practice?", "Your mistakes practice in progress will be deleted.", "Discard",
    () => { delete db.attempts[b.dataset.discard]; persist(); renderHome(); }));
  app.querySelectorAll("[data-review]").forEach(b => b.onclick = () => {
    const h = db.history[b.dataset.review];
    reviewFilter = "all";
    go({ name: "results", mode: b.dataset.review, result: h[h.length - 1] });
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
  const answered = at.answers.filter(a => a !== null).length;

  meta.innerHTML = `<span>${answered} of ${n} answered</span><button class="link" id="exitBtn" type="button">Save &amp; exit</button>`;
  app.innerHTML = `
    <div class="title-row">
      <div><h1>${esc(info.title)}</h1><p>${answered ? "Saved" : esc(at.sub || info.sub)}</p></div>
      <div class="timer" id="timer" role="timer"><span>Time left</span><strong id="clock">${fmt(at.deadline - Date.now())}</strong></div>
    </div>
    <section class="card question" aria-labelledby="qtext">
      <p class="label">${esc(catById(it.cat).name)} · Question ${at.cur + 1} of ${n}${it.lv ? ` · ${LEVELS[it.lv]}` : ""}</p>
      <p class="prompt" id="qtext">${esc(it.q)}</p>
      <div class="options" role="radiogroup" aria-labelledby="qtext">
        ${it.o.map((o, i) => `<button type="button" class="opt" role="radio" aria-checked="${at.answers[at.cur] === i}" data-opt="${i}"><span class="radio"></span><span>${esc(o)}</span></button>`).join("")}
      </div>
      <div class="actions">
        <button class="btn" id="prevBtn" type="button" ${at.cur === 0 ? "disabled" : ""}>Previous</button>
        <button class="btn primary" id="nextBtn" type="button" ${at.cur === n - 1 ? "disabled" : ""}>Next</button>
        <button class="btn mark ${at.marked[at.cur] ? "on" : ""}" id="markBtn" type="button" aria-pressed="${at.marked[at.cur]}">${at.marked[at.cur] ? "Marked for review" : "Mark for review"}</button>
        <span class="spacer"></span>
        <button class="btn" id="submitBtn" type="button">Submit test</button>
      </div>
      <p class="shortcuts">Keyboard: <kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>←</kbd> <kbd>→</kbd> previous / next · <kbd>M</kbd> mark for review</p>
    </section>
    <section class="tray" aria-label="Question navigator">
      <p>Go to a question · filled = answered · amber ring = marked for review · outline = current</p>
      <div class="qgrid">
        ${at.items.map((_, i) => {
          const cls = ["q", at.answers[i] !== null && "answered", at.marked[i] && "flag", i === at.cur && "current"].filter(Boolean).join(" ");
          return `<button type="button" class="${cls}" data-go="${i}" aria-label="Question ${i + 1}${at.answers[i] !== null ? ", answered" : ""}${at.marked[i] ? ", marked" : ""}" ${i === at.cur ? 'aria-current="step"' : ""}>${i + 1}</button>`;
        }).join("")}
      </div>
    </section>`;

  app.querySelectorAll("[data-opt]").forEach(b => b.onclick = () => choose(+b.dataset.opt));
  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => move(+b.dataset.go));
  document.getElementById("prevBtn").onclick = () => move(at.cur - 1);
  document.getElementById("nextBtn").onclick = () => move(at.cur + 1);
  document.getElementById("markBtn").onclick = toggleMark;
  document.getElementById("submitBtn").onclick = askSubmit;
  document.getElementById("exitBtn").onclick = () => go({ name: "home" });

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

function renderExpired(at) {
  const info = modeInfo(view.mode), done = at.answers.filter(a => a !== null).length;
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

function choose(i) { const at = db.attempts[view.mode]; ensureTiming(at); at.answers[at.cur] = i; at.answeredAt[at.cur] = Date.now(); persist(); renderQuiz(); }
function move(pos) { const at = db.attempts[view.mode]; if (pos < 0 || pos >= at.items.length) return; endVisit(at); at.cur = pos; startVisit(at); persist(); renderQuiz(); }
function toggleMark() { const at = db.attempts[view.mode]; at.marked[at.cur] = !at.marked[at.cur]; persist(); renderQuiz(); }

function askSubmit() {
  const at = db.attempts[view.mode];
  const blank = at.answers.filter(a => a === null).length, flagged = at.marked.filter(Boolean).length;
  const bits = [];
  if (blank) bits.push(`${blank} unanswered question${blank > 1 ? "s" : ""}`);
  if (flagged) bits.push(`${flagged} marked for review`);
  confirmModal("Submit your test?", bits.length ? `You have ${bits.join(" and ")}. Unanswered questions score zero.` : "All questions are answered. You can't change answers after submitting.", "Submit test", () => submit(false));
}

function submit(timedOut) {
  const mode = view.mode, at = db.attempts[mode];
  endVisit(at);
  const submittedAt = Date.now();
  let correct = 0;
  at.items.forEach((it, i) => {
    const ok = at.answers[i] === it.a;
    if (ok) correct++;
    // Answer log: answered questions only (skips aren't logged). Calculation questions are logged with qid null.
    if (at.answers[i] !== null) db.log.push({ qid: it.id || null, cat: it.cat, ok, at: submittedAt, usedMs: at.spentMs[i], answeredAt: at.answeredAt[i], mode });
    // Retry rounds only re-ask known misses, so they'd skew category accuracy; leave it to normal rounds.
    if (mode !== RETRY) { const st = (db.catStats[it.cat] ||= { n: 0, ok: 0 }); st.n++; if (ok) st.ok++; }
    // Per-question record (written questions only; calculations get new numbers each time). Retries count here.
    if (it.id) { const qs = (db.qStats[it.id] ||= { n: 0, wrong: 0, last: null }); qs.n++; if (!ok) qs.wrong++; qs.last = ok ? "ok" : "wrong"; }
  });
  const pct = Math.round(correct / at.items.length * 100);
  const result = { at: Date.now(), mode, items: at.items, answers: at.answers, marked: at.marked, correct, total: at.items.length, pct,
    usedMs: Math.min(Date.now(), at.deadline) - at.start, timedOut };
  db.history[mode] = [...(db.history[mode] || []), result].slice(-5);
  const t = (db.totals[mode] ||= { rounds: 0, sum: 0, best: 0 });
  t.rounds++; t.sum += pct; t.best = Math.max(t.best, pct);
  delete db.attempts[mode];
  persist();
  reviewFilter = "all";
  go({ name: "results", mode, result });
}

/* Results */
function renderResults() {
  const r = view.result, info = modeInfo(view.mode);
  const status = i => r.answers[i] === null ? "skip" : r.answers[i] === r.items[i].a ? "ok" : "no";
  const cats = {};
  r.items.forEach((it, i) => { const c = (cats[it.cat] ||= { n: 0, ok: 0 }); c.n++; if (status(i) === "ok") c.ok++; });
  const wrongN = r.items.filter((_, i) => status(i) === "no").length;
  const skipN = r.items.filter((_, i) => status(i) === "skip").length;
  const markN = r.marked.filter(Boolean).length;
  const verdict = r.pct >= 85 ? "Strong result" : r.pct >= 70 ? "Solid pass" : r.pct >= 50 ? "Borderline: worth another round" : "Needs more rehearsal";
  const shown = r.items.map((it, i) => i).filter(i => reviewFilter === "wrong" ? status(i) !== "ok" : reviewFilter === "marked" ? r.marked[i] : true);

  meta.innerHTML = `<button class="link" id="backHome" type="button">All assessments</button>`;
  app.innerHTML = `
    <div class="title-row"><div><h1>${esc(info.title)} · Results</h1><p>${new Date(r.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p></div></div>
    <section class="card">
      <div class="score-head">
        <div class="score-big">${r.correct}<small> / ${r.total}</small></div>
        <div>
          <p class="verdict">${verdict} · ${r.pct}%</p>
          <p class="muted">${r.timedOut ? "Time ran out · " : ""}Time used ${fmt(r.usedMs)} of ${fmt(r.total * 60000)} · ${wrongN} wrong · ${skipN} unanswered</p>
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
    <div class="filters" role="group" aria-label="Filter answers">
      ${[["all", `All ${r.total}`], ["wrong", `Wrong or skipped ${wrongN + skipN}`], ["marked", `Marked ${markN}`]].map(([k, l]) => `<button type="button" class="filter" data-filter="${k}" aria-pressed="${reviewFilter === k}">${l}</button>`).join("")}
    </div>
    <div class="review">
      ${shown.length ? shown.map(i => reviewItem(r.items[i], i, r.answers[i], r.marked[i])).join("") : `<div class="card"><p class="muted">Nothing to show for this filter.</p></div>`}
    </div>`;

  const againBtn = document.getElementById("againBtn"), retryBtn = document.getElementById("retryBtn");
  if (againBtn) againBtn.onclick = () => newRound(view.mode);
  if (retryBtn) retryBtn.onclick = () => startRetry(r.items.filter((_, i) => status(i) !== "ok"));
  document.getElementById("homeBtn").onclick = () => go({ name: "home" });
  document.getElementById("backHome").onclick = () => go({ name: "home" });
  app.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { reviewFilter = b.dataset.filter; renderResults(); });
  app.querySelectorAll("[data-jump]").forEach(b => b.onclick = () => {
    const id = "r-" + b.dataset.jump;
    if (!document.getElementById(id)) { reviewFilter = "all"; renderResults(); }
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id).scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  });
}

function reviewItem(it, i, ans, marked) {
  const st = ans === null ? ["skip", "Unanswered"] : ans === it.a ? ["ok", "Correct"] : ["no", "Incorrect"];
  return `
    <article class="card item" id="r-${i}">
      <div class="item-top">
        <p class="label">${esc(catById(it.cat).name)} · Question ${i + 1}${it.lv ? ` · ${LEVELS[it.lv]}` : ""}${it.gen ? " · Calculation" : ""}</p>
        <span class="pills"><span class="pill ${st[0]}">${st[1]}</span>${marked ? `<span class="pill flagged">Marked</span>` : ""}</span>
      </div>
      <p class="prompt">${esc(it.q)}</p>
      <ul class="ans">
        ${it.o.map((o, j) => {
          const cls = j === it.a ? "right" : j === ans ? "wrong" : "plain";
          const note = j === it.a ? it.why : it.x[j];
          return `<li class="${cls}"><span class="mark" aria-hidden="true">${j === it.a ? "✓" : j === ans ? "✗" : ""}</span><div><span>${esc(o)}${j === ans ? " <em>(your answer)</em>" : ""}</span>${note ? `<span class="note">${esc(note)}</span>` : ""}</div></li>`;
        }).join("")}
      </ul>
    </article>`;
}

/* Modal */
let lastFocus = null;
function confirmModal(title, body, okLabel, onOk) {
  if (!modalRoot.innerHTML) lastFocus = document.activeElement;
  modalRoot.innerHTML = `
    <div class="backdrop" id="backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <h3 id="mTitle">${esc(title)}</h3>
        <p>${esc(body)}</p>
        <div class="actions end"><button class="btn" id="mCancel" type="button">Cancel</button><button class="btn primary" id="mOk" type="button">${esc(okLabel)}</button></div>
      </div>
    </div>`;
  document.getElementById("mCancel").onclick = closeModal;
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
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.onclick = () => confirmModal("Reset your progress?",
  "This deletes your scores, history, rounds in progress and category choices in this browser. It can't be undone.", "Reset progress", () => {
    clearInterval(tick);
    try { localStorage.removeItem(STORE_KEY); } catch {}
    location.reload();
  });
render();
})();
