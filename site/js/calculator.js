/* Built-in calculator.
   window.Calc   – the maths: evaluate("2(3+4)^2"), toFraction(0.75) → "3/4", format(x). No eval(): a small parser
                   that only understands numbers, + − × ÷ ^ %, brackets, √ ∛ ln exp log, π, Ans and M (memory).
   window.CalcUI – the panel: created on first open, kept outside #app so it stays open while moving between questions.

   Rules: powers group right to left (2^3^2 = 512); a minus sign applies after powers (−2^2 = −4);
   % divides by 100 (200 + 10% = 200.1); a number next to a bracket or function multiplies (2(3+4) = 14);
   √ and ∛ apply to the number or bracket right after them (√9+1 = 4). Division by zero and similar give an error. */
(() => {
  const FUNCS = {
    "√": Math.sqrt, "sqrt": Math.sqrt, "∛": Math.cbrt, "cbrt": Math.cbrt,
    "ln": Math.log, "exp": Math.exp, "log": Math.log10
  };

  function tokenize(src) {
    const s = String(src).replace(/\s+/g, ""), out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (num) {
        i += num[0].length;
        if (s[i] === ".") throw new Error("Misplaced decimal point"); // e.g. "1..2" or "1.2.3"
        out.push({ t: "num", v: parseFloat(num[0]) }); continue;
      }
      const word = /^(sqrt|cbrt|ln|exp|log|ans|pi)/i.exec(s.slice(i));
      if (word) {
        const w = word[0].toLowerCase();
        out.push(w === "ans" ? { t: "ans" } : w === "pi" ? { t: "num", v: Math.PI } : { t: "fn", v: w });
        i += w.length; continue;
      }
      if (c === "√" || c === "∛") { out.push({ t: "fn", v: c }); i++; continue; }
      if (c === "π") { out.push({ t: "num", v: Math.PI }); i++; continue; }
      if (c === "M") { out.push({ t: "mem" }); i++; continue; }
      const op = { "+": "+", "-": "-", "−": "-", "*": "*", "×": "*", "/": "/", "÷": "/", "^": "^", "%": "%", "(": "(", ")": ")" }[c];
      if (op) { out.push({ t: op }); i++; continue; }
      throw new Error(`Unexpected "${c}"`);
    }
    return out;
  }

  function evaluate(src, env = {}) {
    const toks = tokenize(src);
    if (!toks.length) throw new Error("Empty");
    let p = 0;
    const peek = () => toks[p], take = t => { if (toks[p]?.t !== t) throw new Error(`Expected ${t}`); p++; };
    const startsValue = tk => tk && ["num", "fn", "ans", "mem", "("].includes(tk.t);
    function expr() {
      let v = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) { const o = toks[p++].t, r = term(); v = o === "+" ? v + r : v - r; }
      return v;
    }
    function term() {
      let v = unary();
      for (;;) {
        const tk = peek();
        if (tk && (tk.t === "*" || tk.t === "/")) { p++; const r = unary(); v = tk.t === "*" ? v * r : v / r; }
        else if (startsValue(tk)) v *= unary(); // implicit multiplication: 2(3+4), 2π, (1+2)(3+4)
        else return v;
      }
    }
    function unary() {
      if (peek()?.t === "-") { p++; return -unary(); }
      if (peek()?.t === "+") { p++; return unary(); }
      return power();
    }
    function power() {
      const base = postfix();
      if (peek()?.t === "^") { p++; return Math.pow(base, unary()); } // right-associative; exponent may be negative
      return base;
    }
    function postfix() {
      let v = primary();
      while (peek()?.t === "%") { p++; v /= 100; }
      return v;
    }
    function primary() {
      const tk = toks[p++];
      if (!tk) throw new Error("Incomplete");
      if (tk.t === "num") return tk.v;
      if (tk.t === "ans") { if (env.ans == null) throw new Error("No answer yet"); return env.ans; }
      if (tk.t === "mem") return env.memory || 0;
      if (tk.t === "(") { const v = expr(); take(")"); return v; }
      if (tk.t === "fn") return FUNCS[tk.v](postfix());
      throw new Error("Unexpected symbol");
    }
    const v = expr();
    if (p < toks.length) throw new Error("Unexpected symbol");
    if (!Number.isFinite(v)) throw new Error("Not a number");
    return v;
  }

  // Exact fraction for x if one exists with a denominator up to 10,000 (continued fractions), else null.
  function toFraction(x) {
    if (!Number.isFinite(x) || Number.isInteger(x)) return null;
    const sign = x < 0 ? "−" : "", a = Math.abs(x);
    let h0 = 1, h1 = Math.floor(a), k0 = 0, k1 = 1, f = a - Math.floor(a);
    for (let i = 0; i < 30 && f > 1e-12; i++) {
      const inv = 1 / f, q = Math.floor(inv);
      [h0, h1] = [h1, q * h1 + h0]; [k0, k1] = [k1, q * k1 + k0];
      if (k1 > 10000) return null;
      if (Math.abs(h1 / k1 - a) < 1e-9 * Math.max(1, a)) return `${sign}${h1}/${k1}`;
      f = inv - q;
    }
    return null;
  }

  // Up to 12 significant digits, without floating-point noise (0.1 + 0.2 shows as 0.3).
  const format = x => String(Number(x.toPrecision(12))).replace("-", "−");

  window.Calc = { evaluate, toFraction, format, tokenize };

  /* ---------- Panel ---------- */
  const KEYS = [
    ["MC", "mc"], ["MR", "mr"], ["M+", "m+"], ["M−", "m-"], ["a/b", "frac"],
    ["ln", "ins:ln("], ["exp", "ins:exp("], ["log", "ins:log("], ["√", "ins:√("], ["∛", "ins:∛("],
    ["(", "ins:("], [")", "ins:)"], ["xʸ", "ins:^"], ["%", "ins:%"], ["÷", "ins:÷"],
    ["7", "ins:7"], ["8", "ins:8"], ["9", "ins:9"], ["×", "ins:×"], ["⌫", "back"],
    ["4", "ins:4"], ["5", "ins:5"], ["6", "ins:6"], ["−", "ins:−"], ["AC", "clear"],
    ["1", "ins:1"], ["2", "ins:2"], ["3", "ins:3"], ["+", "ins:+"], ["Ans", "ins:Ans"],
    ["0", "ins:0"], [".", "ins:."], ["π", "ins:π"], ["=", "eq"]
  ];
  const LABELS = { "a/b": "Switch between fraction and decimal", "⌫": "Delete", "AC": "Clear", "xʸ": "Power", "√": "Square root", "∛": "Cube root",
    "MC": "Clear memory", "MR": "Recall memory", "M+": "Add result to memory", "M−": "Subtract result from memory", "−": "Minus", "÷": "Divide", "×": "Multiply" };
  const state = { ans: null, memory: 0, fraction: false, last: null };
  let panel = null, onClose = null;
  const $ = id => document.getElementById(id);

  function build() {
    panel = document.createElement("aside");
    panel.className = "calc"; panel.id = "calcPanel"; panel.hidden = true;
    panel.setAttribute("aria-label", "Calculator");
    panel.innerHTML = `
      <div class="calc-head"><b>Calculator</b><span class="calc-mem" id="calcMem" title="A value is stored in memory"></span><button class="link" type="button" id="calcClose">Close</button></div>
      <input class="calc-expr" id="calcExpr" type="text" inputmode="none" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Calculation" placeholder="Type or tap, then =">
      <output class="calc-out" id="calcOut" for="calcExpr" aria-live="polite"></output>
      <div class="calc-keys">${KEYS.map(([l, a]) => `<button type="button" data-calc="${a}"${a === "eq" ? ' class="eq"' : ""}${LABELS[l] ? ` aria-label="${LABELS[l]}"` : ""}>${l}</button>`).join("")}</div>`;
    document.body.appendChild(panel);
    const input = $("calcExpr");
    $("calcClose").onclick = hide;
    panel.querySelectorAll("[data-calc]").forEach(b => {
      b.addEventListener("pointerdown", e => e.preventDefault()); // keep the caret in the input when tapping keys
      b.onclick = () => press(b.dataset.calc);
    });
    input.addEventListener("keydown", e => {
      e.stopPropagation(); // keep quiz shortcuts (1–4, arrows, M) from firing while typing here
      if (e.key === "Enter" || e.key === "=") { e.preventDefault(); press("eq"); }
      else if (e.key === "Escape") { e.preventDefault(); press("clear"); }
    });
    input.addEventListener("input", () => { state.last = null; show(); });
  }

  function insert(text) {
    const input = $("calcExpr"), s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
    input.value = input.value.slice(0, s) + text + input.value.slice(e);
    input.setSelectionRange(s + text.length, s + text.length);
    state.last = null; show();
  }

  function result() { // evaluate the current expression, or null with an error message shown
    try { return evaluate($("calcExpr").value, state); }
    catch (err) { $("calcOut").textContent = $("calcExpr").value.trim() ? "Error: check the expression" : ""; $("calcOut").classList.add("err"); return null; }
  }

  function show() {
    const out = $("calcOut"); out.classList.remove("err");
    $("calcMem").textContent = state.memory ? "M" : "";
    if (state.last == null) { out.textContent = ""; return; }
    const frac = state.fraction ? toFraction(state.last) : null;
    out.textContent = "= " + (frac || format(state.last)) + (state.fraction && !frac ? "  (no exact fraction)" : "");
  }

  function press(a) {
    const input = $("calcExpr");
    if (a.startsWith("ins:")) return insert(a.slice(4));
    if (a === "back") {
      const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
      if (s !== e) { input.value = input.value.slice(0, s) + input.value.slice(e); input.setSelectionRange(s, s); }
      else if (s > 0) { input.value = input.value.slice(0, s - 1) + input.value.slice(s); input.setSelectionRange(s - 1, s - 1); }
      state.last = null; return show();
    }
    if (a === "clear") { input.value = ""; state.last = null; return show(); }
    if (a === "frac") { state.fraction = !state.fraction; return show(); }
    if (a === "mc") { state.memory = 0; return show(); }
    if (a === "mr") return insert("M");
    if (a === "eq" || a === "m+" || a === "m-") {
      const v = result();
      if (v == null) return;
      state.ans = v; state.last = v;
      if (a === "m+") state.memory += v;
      if (a === "m-") state.memory -= v;
      return show();
    }
  }

  function open() { if (!panel) build(); panel.hidden = false; document.body.classList.add("calc-open"); $("calcExpr").focus({ preventScroll: true }); }
  function hide() { if (!panel || panel.hidden) return; panel.hidden = true; document.body.classList.remove("calc-open"); if (onClose) onClose(); }
  window.CalcUI = {
    open, hide,
    toggle() { if (panel && !panel.hidden) hide(); else open(); },
    isOpen: () => !!panel && !panel.hidden,
    onClose(fn) { onClose = fn; }
  };
})();
