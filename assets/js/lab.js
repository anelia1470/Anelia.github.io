// Finance lab: CAPM with a security market line, and a simple DCF.
const SVGNS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);

function el(name, attrs, text) {
  const node = document.createElementNS(SVGNS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (text !== undefined) node.textContent = text;
  return node;
}

const COLORS = { ink: "#17183b", soft: "#565879", line: "#e3e0f0", blue: "#4c5bff", violet: "#8b5cf6", pink: "#ec5fab", midnight: "#17195a" };

// ---------------------------------------------------------------- CAPM
function capmRequired(rf, beta, mkt) {
  return rf + beta * (mkt - rf);
}

function drawSML() {
  const rf = +$("rf").value, mkt = +$("mkt").value, beta = +$("beta").value;
  $("rf-out").textContent = rf.toFixed(1) + "%";
  $("mkt-out").textContent = mkt.toFixed(1) + "%";
  $("beta-out").textContent = beta.toFixed(2);
  const req = capmRequired(rf, beta, mkt);
  $("capm-out").textContent = req.toFixed(1) + "%";

  const svg = $("sml");
  svg.innerHTML = "";
  const L = 44, R = 404, T = 14, B = 186;
  const xMax = 2.5, yMax = 30;
  const x = (b) => L + (b / xMax) * (R - L);
  const y = (r) => B - (Math.max(-5, Math.min(r, yMax)) / yMax) * (B - T);

  for (let r = 0; r <= yMax; r += 10) {
    svg.append(el("line", { x1: L, x2: R, y1: y(r), y2: y(r), stroke: COLORS.line }));
    svg.append(el("text", { x: L - 8, y: y(r) + 4, "text-anchor": "end", "font-size": 11, fill: COLORS.soft }, r + "%"));
  }
  for (let b = 0; b <= xMax; b += 0.5) {
    svg.append(el("text", { x: x(b), y: B + 18, "text-anchor": "middle", "font-size": 11, fill: COLORS.soft }, b.toFixed(1)));
  }
  svg.append(el("text", { x: R, y: B + 32, "text-anchor": "end", "font-size": 11, fill: COLORS.soft }, "Beta"));

  // Security market line
  svg.append(el("line", { x1: x(0), y1: y(rf), x2: x(xMax), y2: y(capmRequired(rf, xMax, mkt)), stroke: COLORS.violet, "stroke-width": 3, "stroke-linecap": "round" }));
  // Market portfolio
  svg.append(el("circle", { cx: x(1), cy: y(mkt), r: 5, fill: COLORS.blue }));
  svg.append(el("text", { x: x(1) - 8, y: y(mkt) - 10, "text-anchor": "end", "font-size": 11, fill: COLORS.ink }, "Market"));
  // The stock
  svg.append(el("line", { x1: x(beta), x2: x(beta), y1: B, y2: y(req), stroke: COLORS.pink, "stroke-dasharray": "3 4" }));
  svg.append(el("circle", { cx: x(beta), cy: y(req), r: 7, fill: COLORS.pink, stroke: "#fff", "stroke-width": 2 }));
}

["rf", "mkt", "beta"].forEach((id) => $(id).addEventListener("input", drawSML));
drawSML();

// ---------------------------------------------------------------- DCF
function dcf(fcf0, g, wacc, tg, years = 5) {
  const flows = [];
  let cf = fcf0;
  for (let t = 1; t <= years; t++) {
    cf *= 1 + g;
    flows.push({ label: "Y" + t, value: cf / (1 + wacc) ** t });
  }
  const terminal = (cf * (1 + tg)) / (wacc - tg);
  const pvTerminal = terminal / (1 + wacc) ** years;
  const ev = flows.reduce((s, f) => s + f.value, 0) + pvTerminal;
  return { flows, pvTerminal, ev };
}

const fmt = (n) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

function drawDCF() {
  const fcf0 = +$("fcf").value;
  const g = +$("g").value / 100;
  const wacc = +$("wacc").value / 100;
  const tg = +$("tg").value / 100;
  const svg = $("dcf-bars");
  svg.innerHTML = "";

  if (!(wacc > tg)) {
    $("dcf-out").textContent = "n/a";
    $("dcf-note").textContent = "WACC must be higher than terminal growth, otherwise the terminal value is infinite. Raise the WACC or lower the terminal growth.";
    return;
  }

  const { flows, pvTerminal, ev } = dcf(fcf0, g, wacc, tg);
  $("dcf-out").textContent = fmt(ev) + "m";
  const share = (pvTerminal / ev) * 100;
  $("dcf-note").textContent = `The terminal value is ${share.toFixed(0)}% of the total. That share is why small changes in WACC or terminal growth move a DCF so much.`;

  const bars = [...flows, { label: "Terminal", value: pvTerminal, terminal: true }];
  const L = 8, R = 412, T = 22, B = 170;
  const max = Math.max(...bars.map((b) => b.value));
  const slot = (R - L) / bars.length;
  const w = slot * 0.62;
  bars.forEach((b, i) => {
    const h = max > 0 ? (b.value / max) * (B - T) : 0;
    const bx = L + i * slot + (slot - w) / 2;
    svg.append(el("rect", { x: bx, y: B - h, width: w, height: Math.max(h, 1), rx: 5, fill: b.terminal ? COLORS.midnight : COLORS.violet, opacity: b.terminal ? 1 : 0.85 }));
    svg.append(el("text", { x: bx + w / 2, y: B - h - 6, "text-anchor": "middle", "font-size": 11, fill: COLORS.ink }, fmt(b.value)));
    svg.append(el("text", { x: bx + w / 2, y: B + 18, "text-anchor": "middle", "font-size": 11, fill: COLORS.soft }, b.label));
  });
}

["fcf", "g", "wacc", "tg"].forEach((id) => $(id).addEventListener("input", drawDCF));
drawDCF();
