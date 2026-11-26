/* Key terms for the technical out-loud questions: with "Write down what I say" on, the review lists which ones came up.
   Keyed by prompt id (questions/outloud.js and the walk-through cards); question ids and text are untouched. Each term
   is its ways of being said, separated by "": the first is the name shown, any one counts, as whole words. Speech-to-text
   often writes acronyms as words ("whack" for WACC), so the usual spellings are listed too. A missing term is a hint to
   check the answer, not proof it was left out. */
Bank.addTerms({
  // Out-loud prompts
  "ol-val-01": ["growth", "free cash flow|FCF|cash conversion|capital spending|capex", "risk|predictable|steady|steadier", "margins|margin|returns on capital|return on capital", "size|liquidity|larger"],
  "ol-val-02": ["enterprise value|EV", "equity value", "EBITDA|EBIT|revenue|E bit da|EBIT DA", "net income|earnings per share|EPS|price to earnings|P E", "net debt|bridge"],
  "ol-val-03": ["peers|comparable|comparables|comps", "enterprise value|EV", "equity value", "one-off|nonrecurring|non-recurring|clean", "last twelve months|LTM|next year|forward", "median|range"],
  "ol-val-04": ["EBITDA|E bit da|EBIT DA", "free cash flow|FCF", "capital spending|capex|capital expenditure", "working capital", "cash conversion", "repay|pay down|debt"],
  "ol-acc-01": ["receivables|debtors", "inventory|stock", "payables|creditors", "ties up cash|cash", "seasonal|seasons|seasonality", "peg|normal level|target level"],
  "ol-lbo-01": ["EBITDA growth|EBITDA|E bit da|grow|growing", "pay down debt|paying down debt|debt paydown|repay|repaying", "multiple expansion|higher multiple|exit multiple", "leverage|debt", "multiple of money|MOIC|money multiple", "IRR|internal rate of return"],
  "ol-lbo-02": ["leverage|too much debt", "covenants|covenant", "entry multiple|entry price|paying too much|overpay", "interest rates|rates", "hedge|hedging|hedged", "downside|multiple expansion"],
  "ol-lbo-03": ["entry multiple|purchase price|price", "equity", "EBITDA|E bit da|EBIT DA", "exit multiple|exit", "multiple of money|MOIC|money multiple", "IRR|internal rate of return", "rule of thumb|rules of thumb|15%|15 percent"],
  "ol-mna-01": ["growth|grow", "synergies|synergy", "premium|paying too much|overpay", "integration|integrate", "culture|cultures|key people"],
  "ol-mna-02": ["strategic buyer|strategic", "synergies|synergy", "cost of capital", "leverage|debt", "target return|returns|IRR", "management|stake"],
  "ol-cf-01": ["cheaper|cheap", "tax deductible|tax shield|tax", "dilution|dilute|dilutes|dilutive", "credit rating|rating", "earnings per share|EPS", "signal|overvalued|fully valued"],
  "ol-credit-01": ["maintenance covenants|maintenance", "incurrence covenants|incurrence", "debt to EBITDA|leverage|net debt", "interest cover|interest coverage|coverage", "dividends|dividend", "covenant-lite|cov-lite"],
  // Walk-through cards
  "fig-walk-01": ["equity value|equity", "price to tangible book|tangible book|P TBV", "return on tangible equity|ROTE|returns", "price to earnings|P E|PE", "dividend discount model|DDM|dividend discount", "CET1|common equity tier 1|capital ratio|CET 1"],
  "fig-walk-02": ["net interest margin|NIM|margin", "deposit beta|deposits|deposit", "bonds|bond portfolio|securities", "credit quality|loan losses|provisions|defaults", "loan demand|lending"],
  "val-walk-01": ["unlevered free cash flow|free cash flow|FCF", "terminal value", "weighted average cost of capital|WACC|whack|wack", "Gordon growth|perpetuity growth|growth rate|exit multiple", "enterprise value|EV", "net debt", "equity value", "sensitivity|sensitivities"],
  "val-walk-02": ["comparable companies|comparables|comps|trading multiples", "precedent transactions|precedents|transactions", "discounted cash flow|DCF|D C F", "control premium|premium", "football field", "sum of the parts"],
  "mna-walk-01": ["net income", "purchase price|price", "synergies|synergy", "interest|cost of debt", "new shares|shares issued|share count", "earnings per share|EPS|pro forma", "accretive|accretion", "dilutive|dilution"],
  "mna-walk-02": ["information memorandum|CIM|info memo|confidential information memorandum", "teaser|teasers", "NDA|NDAs|non-disclosure|confidentiality agreement", "indicative bids|non-binding|first round", "data room", "binding bids|binding|second round", "purchase agreement|SPA|signing"],
  "lbo-walk-01": ["sources and uses", "purchase price|entry multiple", "debt schedule|debt tranches|tranches", "cash sweep|sweep|pay down|repay", "exit multiple|exit", "multiple of money|MOIC|money multiple", "IRR|internal rate of return", "sensitivity|sensitivities"],
  "lbo-walk-02": ["stable cash flows|cash flows|cash flow|predictable", "capital intensity|capex|capital expenditure", "market position|margins", "cost savings|add-on|bolt-on", "management team|management", "exit"],
  "memo-walk-01": ["executive summary|summary", "investment highlights|highlights|equity story", "market", "business model", "customers|customer", "management|team", "financials|business plan|EBITDA|E bit da", "no price|price|valuation"],
  "memo-walk-02": ["executive summary|summary", "investment thesis|thesis", "value creation|value creation plan", "management case|management's case|management plan", "fund case|base case|our case|our own case", "returns|MOIC|IRR|multiple of money|money multiple|sensitivities", "risks|mitigants|mitigant", "recommendation|recommend"],
  "terms-walk-01": ["warranties|warranty", "disclosure|disclosure letter|disclosed", "specific indemnity|specific indemnities|indemnity|indemnities", "de minimis|basket|threshold|deductible", "cap|time limit", "W&I|warranty and indemnity|insurance", "leakage|locked box|completion accounts", "conditions|long-stop"],
  "terms-walk-02": ["alignment|aligned|align", "institutional strip|strip|loan notes|preference shares", "sweet equity|ordinary shares", "ratchet|reverse ratchet", "vesting|vest|vests", "good leaver|bad leaver|leaver|leavers", "fair value", "capital gain|salary|tax"],
  "rx-walk-01": ["automatic stay|stay", "debtor in possession|DIP", "contracts|leases", "363|section 363", "plan of reorganization|plan of reorganisation|plan", "cramdown|cram down", "fulcrum|fulcrum security"],
  "acc-walk-01": ["income statement|P and L|profit and loss", "balance sheet", "cash flow statement", "net income", "retained earnings", "depreciation|D&A|D and A", "working capital"],
  "acc-walk-02": ["income statement|P and L|profit and loss", "tax", "net income", "add back|added back|non-cash|noncash", "cash", "PP&E|PP and E|fixed assets|property plant and equipment", "retained earnings"],
  "cf-walk-01": ["cost of equity", "cost of debt", "CAPM|capital asset pricing model|cap M", "beta", "risk-free rate|risk-free", "equity risk premium|market risk premium|risk premium", "tax deductible|after tax|tax shield", "market values|market value|target capital structure|capital structure"],
  "cr-walk-01": ["business risk|industry|cyclical", "leverage|debt to EBITDA|net debt", "interest coverage|interest cover|coverage", "liquidity|revolver", "maturities|maturity", "covenants|covenant", "security|seniority|secured|senior"],
  "cr-walk-02": ["margin|SOFR|pricing|interest rate", "maturity|amortisation|amortization|bullet", "mandatory prepayment|mandatory prepayments|excess cash flow|sweep", "soft call|101|call protection", "covenants|covenant|maintenance|incurrence|cov-lite", "event of default|events of default|acceleration|accelerate", "security|guarantees|secured|collateral", "intercreditor|ranking|seniority|second lien"],
  "cm-walk-01": ["prospectus|S-1|S1", "roadshow|road show", "bookbuilding|book building|order book", "price range|pricing|price", "greenshoe|green shoe|overallotment|over-allotment", "lock-up|lockup"],
  "bt-walk-01": ["clarify|clarifying|scope", "rooms", "occupancy", "average daily rate|ADR|daily rate", "365|days", "sanity check|check|plausible"],
  "bt-walk-02": ["clarify|clarifying|scope", "square feet|square foot|sq ft", "floors|floor", "per square foot|value per", "net operating income|NOI|income", "cap rate|capitalization rate|capitalisation rate"],
  "bt-walk-03": ["clarify|clarifying|scope", "population|people|adults", "top-down", "bottom-up", "coffee shops|cafés|cafes", "sanity check|check|cross-check"],
  "hom-walk-01": ["owner-operator|owning", "lease|leasing|rent", "management contract|management fee|base fee|incentive fee", "franchise|franchising", "asset-light"],
  "rev-walk-01": ["net operating income|NOI", "cap rate|capitalization rate|capitalisation rate|capitalisation|capitalization", "comparable sales|comparables|comps", "discounted cash flow|DCF|D C F", "exit cap rate|exit value|exit yield", "WALT|lease length|lease term|tenants|tenant", "replacement cost|price per square foot"],
  "liv-walk-01": ["demand|student numbers|universities|university", "supply|beds", "rent per bed|rent", "occupancy", "nomination agreements|nominations", "net operating income|NOI", "yield|discounted cash flow|DCF"],
  "pf-walk-01": ["loan-to-value|LTV", "interest cover|ICR|interest coverage", "debt service cover|DSCR|debt service coverage", "debt yield", "sponsor|track record", "refinancing|refinance|exit"],
  "hds-walk-01": ["sale and leaseback|leaseback|lease back", "lease liability|IFRS 16|IFRS16", "management contract", "asset-light", "borrowing|debt|mortgage|secured", "joint venture|JV|stake", "rent cover|covenant|covenants"]
});
