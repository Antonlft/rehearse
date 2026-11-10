// Hospitality & living calculation questions. Same shape as generators.js, plus lv (1 basic, 2 intermediate, 3 advanced).
const HOTEL = () => R.pick(["The Harbour Hotel", "Kingsway House Hotel", "The Larch", "Riverside Grand", "The Marlowe", "Station Quarter Hotel"]);
const SCHEME = () => R.pick(["Castle Yard", "Mill Lane", "Canal Point", "Abbey Court", "Foundry Wharf", "Park Street"]);

/* Hotel economics & KPIs */
Bank.gen("hk", () => {
  const occ = R.step(0.55, 0.92, 0.01), adr = R.step(70, 320, 5);
  return { trap: ["inverted", "inverted", "missed-step"], lv: 1,
    q: `${HOTEL()} runs at ${R.pct(occ, 0)} occupancy with an ADR of US$${adr}. What is its RevPAR?`,
    o: [R.usd2(occ * adr), R.usd2(adr / occ), R.usd2(adr * (1 - occ)), R.usd2(adr)],
    why: `RevPAR = occupancy × ADR = ${R.pct(occ, 0)} × US$${adr} = ${R.usd2(occ * adr)}.`,
    x: ["That divides ADR by occupancy instead of multiplying.", "That multiplies ADR by the unsold share of rooms.", "That's the ADR, which ignores empty rooms."] };
});

Bank.gen("hk", () => {
  const o1 = R.int(62, 82), d = R.pick([-6, -4, -3, -2, 2, 3, 4, 5, 6, 8]), o2 = o1 + d;
  const a1 = R.step(90, 220, 5), a2 = Math.round(a1 * (1 + R.pick([-0.06, -0.04, -0.03, 0.02, 0.03, 0.05, 0.07, 0.09]))), ra = a2 / a1 - 1, ro = o2 / o1 - 1;
  const tot = (o2 * a2) / (o1 * a1) - 1, s = (r, o) => `Rate ${R.spct(r)}, occupancy ${R.spct(o)}`;
  return { trap: ["inverted", "units", "missed-step"], lv: 2,
    q: `Last year a hotel ran at ${o1}% occupancy with an ADR of US$${a1}. This year it's at ${o2}% with an ADR of US$${a2}, so RevPAR moved ${R.spct(tot)}. How does that split between rate and occupancy?`,
    o: [s(ra, ro), s(ro, ra), s(ra, d / 100), s(tot, 0)],
    why: `ADR: ${a2} ÷ ${a1} − 1 = ${R.spct(ra)}. Occupancy: ${o2} ÷ ${o1} − 1 = ${R.spct(ro)}. Together (1 ${ra < 0 ? "−" : "+"} ${Math.abs(ra).toFixed(3)}) × (1 ${ro < 0 ? "−" : "+"} ${Math.abs(ro).toFixed(3)}) − 1 = ${R.spct(tot)}.`,
    x: ["The two effects are swapped.", `Occupancy moved ${Math.abs(d)} percentage points, which is a ${R.pct(Math.abs(ro))} relative change.`, "Occupancy changed too, so not all the growth came from rate."] };
});

Bank.gen("hk", () => {
  const r1 = R.step(12, 60, 0.5), m1 = R.step(0.25, 0.42, 0.01), g1 = +(r1 * m1).toFixed(1);
  const dr = +(r1 * R.step(0.04, 0.15, 0.01)).toFixed(1), ft = R.step(0.4, 0.8, 0.05), g2 = +(g1 + dr * ft).toFixed(1), r2 = +(r1 + dr).toFixed(1);
  const f = (g2 - g1) / dr;
  return { trap: ["wrong-measure", "inverted", "wrong-measure"], lv: 2,
    q: `Hotel revenue rises from ${R.usd(r1, 1)} to ${R.usd(r2, 1)} and GOP rises from ${R.usd(g1, 1)} to ${R.usd(g2, 1)}. What is the flow-through?`,
    o: [R.pct(f, 0), R.pct(1 - f, 0), R.pct(1 / f, 0), R.pct(g2 / r2, 0)],
    why: `Flow-through = ΔGOP ÷ Δrevenue = ${(g2 - g1).toFixed(1)} ÷ ${dr.toFixed(1)} = ${R.pct(f, 0)} of each extra dollar reached GOP.`,
    x: ["That's the share of extra revenue absorbed by extra costs.", "That's the ratio upside down: Δrevenue ÷ ΔGOP.", "That's the new GOP margin, not the margin on the extra revenue."] };
});

Bank.gen("hk", () => {
  const k = R.step(80, 400, 10), occ = R.step(0.6, 0.9, 0.01), adr = R.step(80, 260, 5), rev = k * 365 * occ * adr / 1e6;
  return { trap: ["missed-step", "double-count", "units"], lv: 1,
    q: `A ${k}-room hotel open all year averages ${R.pct(occ, 0)} occupancy at an ADR of US$${adr}. What is its annual rooms revenue?`,
    o: [R.usd(rev, 1), R.usd(k * 365 * adr / 1e6, 1), R.usd(rev * occ, 1), R.usd(k * 30 * occ * adr / 1e6, 1)],
    why: `Rooms revenue = ${k} rooms × 365 nights × ${R.pct(occ, 0)} × US$${adr} = ${R.usd(rev, 1)}.`,
    x: ["That assumes every room is sold every night.", "That applies occupancy twice.", "That's one month of revenue, not a year."] };
});

Bank.gen("hk", () => {
  const k = R.step(100, 350, 10), occ = R.step(0.65, 0.88, 0.01), rev = R.step(8, 45, 0.5), gop = +(rev * R.step(0.25, 0.42, 0.01)).toFixed(1);
  const avail = k * 365, per = v => R.usd2(v);
  return { trap: ["wrong-measure", "wrong-measure", "wrong-measure"], lv: 2,
    q: `A ${k}-room hotel open all year has total revenue of ${R.usd(rev, 1)}, GOP of ${R.usd(gop, 1)} and ${R.pct(occ, 0)} occupancy. What is its GOPPAR per night?`,
    o: [per(gop * 1e6 / avail), per(gop * 1e6 / (avail * occ)), per(rev * 1e6 / avail), per((rev - gop) * 1e6 / avail)],
    why: `GOPPAR = GOP ÷ available room-nights = ${R.num(gop * 1e6, 0)} ÷ (${k} × 365) = ${per(gop * 1e6 / avail)}.`,
    x: ["That divides by occupied rooms (GOPPOR), not available rooms.", "That's TRevPAR: total revenue per available room.", "That's operating cost per available room, not profit."] };
});

/* Hotel operating models */
Bank.gen("hom", () => {
  const rev = R.step(10, 60, 1), gm = R.step(0.28, 0.4, 0.01), gop = +(rev * gm).toFixed(1), b = R.pick([0.02, 0.025, 0.03, 0.035]), i = R.pick([0.06, 0.08, 0.1]);
  const fee = b * rev + i * gop;
  return { trap: ["missed-step", "wrong-measure", "wrong-measure"], lv: 2,
    q: `A managed hotel has revenue of ${R.usd(rev)} and GOP of ${R.usd(gop, 1)}. The operator charges a base fee of ${R.pct(b)} of revenue and an incentive fee of ${R.pct(i, 0)} of GOP. What are the total fees?`,
    o: [R.usd(fee, 2), R.usd(b * rev, 2), R.usd((b + i) * rev, 2), R.usd((b + i) * gop, 2)],
    why: `Base: ${R.pct(b)} × ${rev} = ${R.usd(b * rev, 2)}. Incentive: ${R.pct(i, 0)} × ${gop} = ${R.usd(i * gop, 2)}. Total ${R.usd(fee, 2)}.`,
    x: ["That's the base fee alone.", "That applies the incentive percentage to revenue instead of GOP.", "That applies the base fee percentage to GOP instead of revenue."] };
});

Bank.gen("hom", () => {
  const rev = R.step(20, 60, 1), gop = +(rev * R.step(0.32, 0.4, 0.01)).toFixed(1), b = 0.03, base = b * rev;
  const pr = +((gop - base) * R.step(0.4, 0.75, 0.05)).toFixed(1), i = R.pick([0.15, 0.2, 0.25]), adj = gop - base;
  return { trap: ["missed-step", "missed-step", "missed-step"], lv: 3,
    q: `A hotel has revenue of ${R.usd(rev)} and GOP of ${R.usd(gop, 1)}. The operator earns a 3% base fee on revenue and an incentive fee of ${R.pct(i, 0)} of adjusted GOP (GOP less the base fee) above an owner's priority of ${R.usd(pr, 1)}. What is the incentive fee?`,
    o: [R.usd(i * (adj - pr), 2), R.usd(i * adj, 2), R.usd(i * gop, 2), R.usd(i * (gop - pr), 2)],
    why: `Adjusted GOP = ${gop} − ${base.toFixed(2)} = ${R.usd(adj, 2)}. Above the priority: ${adj.toFixed(2)} − ${pr} = ${R.usd(adj - pr, 2)}. Incentive = ${R.pct(i, 0)} × that = ${R.usd(i * (adj - pr), 2)}.`,
    x: ["That ignores the owner's priority, which comes first.", "That ignores both the base fee and the owner's priority.", "That forgets to deduct the base fee from GOP."] };
});

Bank.gen("hom", () => {
  const e = R.step(4, 20, 0.5), c = R.step(1.3, 2.4, 0.1), rent = +(e / c).toFixed(1), rc = e / rent;
  return { trap: ["inverted", "wrong-measure", "wrong-measure"], lv: 2,
    q: `A leased hotel generates EBITDAR of ${R.usd(e, 1)} and pays rent of ${R.usd(rent, 1)}. What is its rent cover?`,
    o: [R.x(rc, 2), R.x(rent / e, 2), R.x((e - rent) / rent, 2), R.x(rent / (e - rent), 2)],
    why: `Rent cover = EBITDAR ÷ rent = ${e} ÷ ${rent} = ${R.x(rc, 2)}. ${rc >= 1.5 ? "A comfortable level for a landlord." : "Thin: a downturn could quickly threaten the rent."}`,
    x: ["That's the ratio upside down: rent ÷ EBITDAR.", "That's the profit left after rent as a multiple of rent, not cover.", "That compares rent with the operator's margin, which isn't a standard test."] };
});

/* Real estate valuation */
Bank.gen("rev", () => {
  const rent = R.step(1, 12, 0.25), c = +(rent * R.step(0.03, 0.15, 0.01)).toFixed(2), y = R.step(0.04, 0.075, 0.0025), noi = rent - c;
  return { trap: ["missed-step", "sign", "inverted"], lv: 1,
    q: `A let property earns gross rent of ${R.usd(rent, 2)} a year and the landlord bears ${R.usd(c, 2)} of non-recoverable costs. Similar assets trade at a ${R.pct(y, 2)} yield. What's it worth?`,
    o: [R.usd(noi / y, 1), R.usd(rent / y, 1), R.usd((rent + c) / y, 1), R.usd(noi * y * 100, 1)],
    why: `NOI = ${rent} − ${c} = ${R.usd(noi, 2)}. Value = NOI ÷ yield = ${noi.toFixed(2)} ÷ ${R.pct(y, 2)} = ${R.usd(noi / y, 1)}.`,
    x: ["That capitalises gross rent, ignoring the landlord's costs.", "Costs were added to rent instead of deducted.", "That multiplies NOI by the yield figure instead of dividing by the yield."] };
});

Bank.gen("rev", () => {
  const y1 = R.step(0.04, 0.08, 0.0025), dy = R.pick([-0.0075, -0.005, -0.0025, 0.0025, 0.005, 0.0075, 0.01]), y2 = +(y1 + dy).toFixed(4);
  const ch = y1 / y2 - 1, noi = R.step(2, 15, 0.5);
  return { trap: ["sign", "units", "wrong-measure"], lv: 2,
    q: `An asset with NOI of ${R.usd(noi, 1)} is revalued as its yield moves from ${R.pct(y1, 2)} to ${R.pct(y2, 2)}. By how much does its value change?`,
    o: [R.spct(ch), R.spct(-ch), R.spct(-dy), R.spct(1 - y2 / y1)],
    why: `Value = NOI ÷ yield, so the change is ${R.pct(y1, 2)} ÷ ${R.pct(y2, 2)} − 1 = ${R.spct(ch)}: from ${R.usd(noi / y1, 1)} to ${R.usd(noi / y2, 1)}.`,
    x: [dy > 0 ? "Wrong direction: higher yields mean lower values." : "Wrong direction: lower yields mean higher values.", "That treats the yield move in percentage points as the change in value.", "That's the relative change in the yield, flipped, not the change in value."] };
});

Bank.gen("rev", () => {
  const k = R.step(80, 450, 10), p = R.step(15, 160, 1), pk = p * 1e6 / k;
  return { trap: ["units", "units", "units"], lv: 1,
    q: `${HOTEL()}, with ${k} rooms, sells for ${R.usd(p)}. What is the price per key?`,
    o: [R.usd0(pk), R.usd0(pk / 10), R.usd0(pk * 10), R.usd0(pk / 365)],
    why: `Price per key = ${R.num(p * 1e6, 0)} ÷ ${k} = ${R.usd0(pk)}.`,
    x: ["The answer is ten times too small.", "The answer is ten times too large.", "Dividing by 365 gives nothing meaningful here: price per key is per room, not per night."] };
});

Bank.gen("rev", () => {
  const rev = R.step(15, 80, 1), m = R.step(0.2, 0.32, 0.01), e = +(rev * m).toFixed(1), r = R.pick([0.03, 0.04, 0.05]), y = R.step(0.065, 0.09, 0.0025);
  const adj = e - r * rev;
  return { trap: ["missed-step", "wrong-measure", "inverted"], lv: 3,
    q: `A managed hotel has revenue of ${R.usd(rev)} and EBITDA of ${R.usd(e, 1)}. The valuer deducts an FF&E reserve of ${R.pct(r, 0)} of revenue and capitalises at ${R.pct(y, 2)}. What's the value?`,
    o: [R.usd(adj / y, 1), R.usd(e / y, 1), R.usd(e * (1 - r) / y, 1), R.usd(adj * y * 100, 1)],
    why: `FF&E reserve = ${R.pct(r, 0)} × ${rev} = ${R.usd(r * rev, 2)}. Adjusted EBITDA = ${R.usd(adj, 2)}. Value = ${adj.toFixed(2)} ÷ ${R.pct(y, 2)} = ${R.usd(adj / y, 1)}.`,
    x: ["That ignores the FF&E reserve.", "That takes the reserve as a share of EBITDA rather than revenue.", "That multiplies by the yield figure instead of dividing by the yield."] };
});

/* Living sectors */
Bank.gen("liv", () => {
  const beds = R.step(200, 1000, 25), w = R.step(140, 320, 5), wk = R.pick([44, 48, 51]), occ = R.step(0.94, 0.995, 0.005), g = beds * w * wk * occ / 1e6;
  return { trap: ["missed-step", "missed-step", "units"], lv: 2,
    q: `${SCHEME()}, a ${beds}-bed PBSA scheme, charges US$${w} per bed per week on ${wk}-week tenancies and is ${R.pct(occ)} let. What is its annual gross rental income?`,
    o: [R.usd(g, 2), R.usd(beds * w * wk / 1e6, 2), R.usd(beds * w * 52 / 1e6, 2), R.usd(beds * w * 12 * occ / 1e6, 2)],
    why: `${beds} beds × US$${w} × ${wk} weeks × ${R.pct(occ)} = ${R.usd(g, 2)}.`,
    x: ["That assumes every bed is let.", "That assumes 52 weeks and full occupancy.", "That treats the weekly rent as monthly."] };
});

Bank.gen("liv", () => {
  const beds = R.step(200, 900, 25), gross = R.step(2, 12, 0.25), gtn = R.pick([0.25, 0.28, 0.3, 0.32, 0.35]), y = R.step(0.045, 0.065, 0.0025);
  const noi = gross * (1 - gtn), pb = v => R.usd0(v * 1e6 / beds);
  return { trap: ["missed-step", "wrong-measure", "wrong-measure"], lv: 3,
    q: `A ${beds}-bed PBSA asset has gross rental income of ${R.usd(gross, 2)}. Operating costs take ${R.pct(gtn, 0)} of gross rent, and the asset trades at a ${R.pct(y, 2)} net yield. What is its value per bed?`,
    o: [pb(noi / y), pb(gross / y), pb(noi), pb(gross * gtn / y)],
    why: `NOI = ${gross} × (1 − ${R.pct(gtn, 0)}) = ${R.usd(noi, 2)}. Value = ${noi.toFixed(2)} ÷ ${R.pct(y, 2)} = ${R.usd(noi / y, 1)}, or ${pb(noi / y)} per bed.`,
    x: ["That capitalises gross rent, ignoring operating costs.", "That's NOI per bed, not value per bed.", "That capitalises the costs instead of the net income."] };
});

Bank.gen("liv", () => {
  const gross = R.step(4, 20, 0.5), cs = R.pick([0.2, 0.22, 0.25, 0.28, 0.3]), c = +(gross * cs).toFixed(2), g = R.pick([0.02, 0.03, 0.04, 0.05, 0.06]);
  const n1 = gross - c, n2 = gross * (1 + g) - c, ch = n2 / n1 - 1;
  return { trap: ["missed-step", "wrong-measure", null], lv: 3,
    q: `A BTR block earns gross rent of ${R.usd(gross, 1)} with operating costs of ${R.usd(c, 2)}. Rents rise ${R.pct(g, 0)} while costs stay flat. At a constant yield, how much does the value rise?`,
    o: [R.pct(ch), R.pct(g), R.pct(g * (1 - cs)), R.pct(g + cs)],
    why: `NOI goes from ${n1.toFixed(2)} to ${n2.toFixed(2)}, up ${R.pct(ch)}. At a constant yield, value moves with NOI. Fixed costs make NOI grow faster than rent.`,
    x: ["That assumes costs rise in line with rent.", "That scales the growth down instead of up; fixed costs amplify it.", "Adding the cost ratio to rent growth has no meaning."] };
});

/* Property finance & rates */
Bank.gen("pf", () => {
  const v = R.step(30, 300, 5), l = Math.round(v * R.step(0.4, 0.7, 0.05)), ltv = l / v;
  return { trap: ["wrong-measure", "inverted", "wrong-measure"], lv: 1,
    q: `An asset worth ${R.usd(v)} is financed with a ${R.usd(l)} loan. What is its LTV?`,
    o: [R.pct(ltv), R.pct(1 - ltv), R.pct(v / l), R.pct(l / (v - l))],
    why: `LTV = loan ÷ value = ${l} ÷ ${v} = ${R.pct(ltv)}.`,
    x: ["That's the equity share of value.", "That's value ÷ loan, upside down.", "That's debt ÷ equity, not debt ÷ value."] };
});

Bank.gen("pf", () => {
  const l = R.step(20, 200, 5), r = R.step(0.045, 0.08, 0.0025), noi = +(l * r * R.step(1.2, 2.6, 0.1)).toFixed(2), i = l * r;
  return { trap: ["inverted", "wrong-measure", "wrong-measure"], lv: 1,
    q: `A property with NOI of ${R.usd(noi, 2)} has an interest-only loan of ${R.usd(l)} at an all-in rate of ${R.pct(r, 2)}. What is its interest cover (ICR)?`,
    o: [R.x(noi / i, 2), R.x(i / noi, 2), R.x((noi - i) / i, 2), R.x(noi / l * 10, 2)],
    why: `Interest = ${R.pct(r, 2)} × ${l} = ${R.usd(i, 2)}. ICR = ${noi} ÷ ${i.toFixed(2)} = ${R.x(noi / i, 2)}.`,
    x: ["That's interest ÷ NOI, upside down.", "That subtracts interest before dividing; ICR compares NOI with interest directly.", "That's based on the debt yield, not interest cover."] };
});

Bank.gen("pf", () => {
  const v = R.step(50, 250, 5), ny = R.step(0.055, 0.08, 0.0025), noi = +(v * ny).toFixed(2), r = R.step(0.05, 0.08, 0.0025);
  const ltvMax = R.pick([0.55, 0.6, 0.65]), icr = R.pick([1.5, 1.75, 2.0]), dy = R.pick([0.08, 0.09, 0.1]);
  const a = v * ltvMax, b = noi / icr / r, c = noi / dy, tests = [[a, "LTV binds"], [b, "ICR binds"], [c, "debt yield binds"]];
  const bi = [a, b, c].indexOf(Math.min(a, b, c)), best = tests[bi][0];
  const lab = i => `${R.usd(tests[i][0], 1)} (${tests[i][1]})`;
  const others = [0, 1, 2].filter(i => i !== bi);
  return { trap: ["missed-step", "missed-step", "missed-step"], lv: 3,
    q: `A lender caps a loan at ${R.pct(ltvMax, 0)} LTV, a minimum ${R.x(icr, 2)} ICR and a minimum ${R.pct(dy, 0)} debt yield. The asset is worth ${R.usd(v)}, NOI is ${R.usd(noi, 2)} and the all-in rate is ${R.pct(r, 2)}. What is the maximum loan?`,
    o: [lab(bi), ...others.map(lab), R.usd(noi / r, 1) + " (cover of 1.0x)"],
    why: `LTV test: ${R.pct(ltvMax, 0)} × ${v} = ${R.usd(a, 1)}. ICR test: ${noi} ÷ ${icr} ÷ ${R.pct(r, 2)} = ${R.usd(b, 1)}. Debt yield test: ${noi} ÷ ${R.pct(dy, 0)} = ${R.usd(c, 1)}. The lowest, ${R.usd(best, 1)}, is the most the lender will advance.`,
    x: ["That test allows more debt, but the loan must pass all three.", "That test allows more debt, but the loan must pass all three.", "That ignores the ICR multiple, letting interest absorb all the NOI."] };
});

Bank.gen("pf", () => {
  const y = R.step(0.045, 0.075, 0.0025), ltv = R.pick([0.4, 0.5, 0.6]), r = R.step(0.035, 0.08, 0.0025), p = 100;
  const coc = (p * y - p * ltv * r) / (p * (1 - ltv));
  return { trap: ["wrong-measure", "missed-step", "wrong-measure"], lv: 2,
    q: `An asset is bought at a ${R.pct(y, 2)} yield with a ${R.pct(ltv, 0)} LTV interest-only loan at ${R.pct(r, 2)}. What is the cash-on-cash return on equity, and is leverage positive or negative?`,
    o: [`${R.pct(coc, 2)}, ${r < y ? "positive" : r > y ? "negative" : "neutral"}`, `${R.pct(y, 2)}, neutral`, `${R.pct(y / (1 - ltv), 2)}, positive`, `${R.spct(y - r, 2)}, ${r < y ? "positive" : "negative"}`],
    why: `Per US$100 of value: NOI US$${(p * y).toFixed(2)}, interest ${R.pct(r, 2)} × US$${Math.round(p * ltv)} = US$${(p * ltv * r).toFixed(2)}, equity US$${Math.round(p * (1 - ltv))}. Return = ${(p * y - p * ltv * r).toFixed(2)} ÷ ${Math.round(p * (1 - ltv))} = ${R.pct(coc, 2)}. ${r < y ? "Debt costs less than the yield, so leverage helps." : r > y ? "Debt costs more than the yield, so leverage hurts." : "Debt costs the same as the yield."}`,
    x: ["That's the unlevered yield.", "That ignores the interest paid on the loan.", "That's the yield minus the rate, not the return on equity."] };
});

Bank.gen("pf", () => {
  const mg = R.step(0.015, 0.035, 0.0025), sw = R.step(0.03, 0.045, 0.0025);
  return { trap: ["missed-step", "missed-step", "sign"], lv: 2,
    q: `A borrower has a loan at SONIA + ${R.pct(mg, 2)} and swaps it, paying a fixed ${R.pct(sw, 2)} and receiving SONIA. Ignoring fees, what is its all-in cost?`,
    o: [`${R.pct(mg + sw, 2)} fixed`, `SONIA + ${R.pct(mg + sw, 2)}`, `${R.pct(sw, 2)} fixed`, `${R.pct(Math.abs(sw - mg), 2)} fixed`],
    why: `The SONIA received under the swap cancels the SONIA paid on the loan, leaving the swap rate plus the margin: ${R.pct(sw, 2)} + ${R.pct(mg, 2)} = ${R.pct(mg + sw, 2)}.`,
    x: ["The SONIA legs cancel, so no floating rate remains.", "The loan margin still has to be paid.", "That nets the margin against the swap rate instead of adding it."] };
});

Bank.gen("pf", () => {
  const ltv = R.pick([0.4, 0.5, 0.55, 0.6, 0.65, 0.7]), f = R.pick([0.05, 0.1, 0.15, 0.2, 0.25]);
  const eq = -f / (1 - ltv);
  return { trap: ["missed-step", "wrong-measure", "inverted"], lv: 3,
    q: `An asset is bought with ${R.pct(ltv, 0)} LTV debt. Its value then falls ${R.pct(f, 0)}. What happens to the equity value?`,
    o: [R.spct(Math.max(-1, eq)), R.spct(-f), R.spct(-f * ltv), R.spct(Math.max(-1, -f / ltv))],
    why: `Per US$100: debt US$${Math.round(ltv * 100)}, equity US$${Math.round(100 - ltv * 100)}. After the fall, equity = ${Math.round(100 - f * 100)} − ${Math.round(ltv * 100)} = US$${Math.round(100 - f * 100 - ltv * 100)}, a change of ${R.spct(Math.max(-1, eq))}.`,
    x: ["That's the unlevered change; leverage magnifies it.", "That shrinks the fall instead of magnifying it.", "That divides by the debt share rather than the equity share."] };
});

Bank.gen("pf", () => {
  const v1 = R.step(60, 250, 5), l = Math.round(v1 * R.step(0.55, 0.65, 0.05)), v2 = Math.round(v1 * (1 - R.step(0.1, 0.3, 0.05))), m = R.pick([0.5, 0.55, 0.6]);
  const gap = l - m * v2;
  return { trap: ["wrong-measure", "missed-step", "wrong-measure"], lv: 2,
    q: `A ${R.usd(l)} loan is due for refinancing. The property's value has fallen from ${R.usd(v1)} to ${R.usd(v2)} and lenders will now lend at most ${R.pct(m, 0)} LTV. What is the funding gap?`,
    o: [R.usd(gap, 1), R.usd(v1 - v2, 1), R.usd(l - m * v1, 1), R.usd(m * v2, 1)],
    why: `New loan = ${R.pct(m, 0)} × ${v2} = ${R.usd(m * v2, 1)}. Gap = ${l} − ${(m * v2).toFixed(1)} = ${R.usd(gap, 1)}, to fund with equity or mezzanine.`,
    x: ["That's the fall in value, not the shortfall.", "That uses the old value, ignoring the fall.", "That's the size of the new loan, not the gap."] };
});

/* Hospitality & living deal structuring */
Bank.gen("hds", () => {
  const e = R.step(4, 25, 0.5), c = R.pick([1.6, 1.75, 1.8, 2.0, 2.2]), y = R.step(0.05, 0.07, 0.0025), rent = e / c;
  return { trap: ["missed-step", "wrong-measure", "inverted"], lv: 2,
    q: `An operator with hotel EBITDAR of ${R.usd(e, 1)} plans a sale-and-leaseback. Investors want rent cover of ${R.x(c, 2)} and will buy at a ${R.pct(y, 2)} yield. Roughly what proceeds can it raise?`,
    o: [R.usd(rent / y, 1), R.usd(e / y, 1), R.usd((e - rent) / y, 1), R.usd(e * c / y, 1)],
    why: `Rent = EBITDAR ÷ cover = ${e} ÷ ${c} = ${R.usd(rent, 2)}. Proceeds = rent ÷ yield = ${rent.toFixed(2)} ÷ ${R.pct(y, 2)} = ${R.usd(rent / y, 1)}.`,
    x: ["That capitalises all of the EBITDAR, leaving no rent cover.", "That capitalises the operator's margin after rent, not the rent.", "That multiplies by the cover ratio instead of dividing, setting rent above EBITDAR."] };
});

Bank.gen("hds", () => {
  const s = R.pick([0.5, 0.55, 0.6, 0.65]), m = R.pick([0.1, 0.15, 0.2]), rs = R.step(0.05, 0.07, 0.0025), rm = R.step(0.09, 0.13, 0.005);
  const bl = (s * rs + m * rm) / (s + m);
  return { trap: ["wrong-measure", "inverted", "double-count"], lv: 3,
    q: `A senior loan covers ${R.pct(s, 0)} LTV at ${R.pct(rs, 2)}. Mezzanine takes it to ${R.pct(s + m, 0)} LTV at ${R.pct(rm, 1)}. What is the blended cost of the debt?`,
    o: [R.pct(bl, 2), R.pct((rs + rm) / 2, 2), R.pct((s * rm + m * rs) / (s + m), 2), R.pct(rs + rm, 2)],
    why: `Blended = (${Math.round(s * 100)} × ${R.pct(rs, 2)} + ${Math.round(m * 100)} × ${R.pct(rm, 1)}) ÷ ${Math.round((s + m) * 100)} = ${R.pct(bl, 2)}.`,
    x: ["A simple average ignores that senior is the bigger tranche.", "The weights are swapped between the tranches.", "Adding the rates double-counts."] };
});

Bank.gen("hds", () => {
  const op = R.pick([0.05, 0.1, 0.2]), h = R.step(10, 40, 2), above = R.step(6, 40, 2), pr = R.pick([0.2, 0.3, 0.4]);
  const share = op * h + pr * above, tot = h + above;
  return { trap: ["missed-step", "wrong-measure", "missed-step"], lv: 3,
    q: `A JV is ${R.pct(1 - op, 0)} capital partner and ${R.pct(op, 0)} operating partner. Total profit is ${R.usd(tot)}: the first ${R.usd(h)} is shared pro rata to reach the hurdle, and the rest is split ${R.pct(1 - pr, 0).replace("%", "")}/${R.pct(pr, 0).replace("%", "")} with ${R.pct(pr, 0)} to the operating partner. What does the operating partner receive?`,
    o: [R.usd(share, 1), R.usd(op * tot, 1), R.usd(pr * tot, 1), R.usd(pr * above, 1)],
    why: `Pro rata tier: ${R.pct(op, 0)} × ${h} = ${R.usd(op * h, 1)}. Promote tier: ${R.pct(pr, 0)} × ${above} = ${R.usd(pr * above, 1)}. Total ${R.usd(share, 1)}.`,
    x: ["That ignores the promote, giving only the pro rata share.", "That applies the promote share to all of the profit.", "That's the promote tier alone, leaving out the pro rata share."] };
});
