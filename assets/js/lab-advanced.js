// Finance lab: portfolio optimizer, Monte Carlo, Black–Scholes and bond analytics.
// Uses el(), COLORS and $() from lab.js and the formulas in lab-math.js.

(function () {
  const M = window.LabMath;
  const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
  const money = (x) => Math.round(x).toLocaleString("en-GB");
  const num = (x, d = 2) => x.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });

  // ---------- Slider outputs ----------
  document.querySelectorAll(".tool input[type=range]").forEach((inp) => {
    const out = document.getElementById(inp.id + "-out");
    if (!out) return;
    const dec = +(inp.dataset.dec || 0), unit = inp.dataset.unit || "";
    const upd = () => { out.textContent = (+inp.value).toFixed(dec) + unit; };
    inp.addEventListener("input", upd);
    upd();
  });

  // ---------- Chart helpers ----------
  function niceTicks(min, max, n = 5) {
    const span = max - min || 1;
    const raw = span / n, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) || 10 * mag;
    const ticks = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(10));
    return ticks;
  }

  function frame(svg, o) {
    const W = o.w || 640, H = o.h || 340, L = o.L || 56, R = o.R || 16, T = o.T || 14, B = o.B || 40;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";
    const x = (v) => L + ((v - o.xmin) / (o.xmax - o.xmin)) * (W - L - R);
    const y = (v) => H - B - ((v - o.ymin) / (o.ymax - o.ymin)) * (H - T - B);
    const g = el("g", {});
    svg.append(g);
    niceTicks(o.ymin, o.ymax, o.yn || 5).forEach((v) => {
      g.append(el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: COLORS.line }));
      g.append(el("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end", "font-size": 12, fill: COLORS.soft }, o.yfmt(v)));
    });
    niceTicks(o.xmin, o.xmax, o.xn || 6).forEach((v) => {
      g.append(el("text", { x: x(v), y: H - B + 18, "text-anchor": "middle", "font-size": 12, fill: COLORS.soft }, o.xfmt(v)));
    });
    if (o.xlabel) g.append(el("text", { x: W - R, y: H - 4, "text-anchor": "end", "font-size": 12, fill: COLORS.soft }, o.xlabel));
    if (o.ylabel) g.append(el("text", { x: L, y: T - 2 < 10 ? 10 : T - 2, "font-size": 12, fill: COLORS.soft }, o.ylabel));
    const clip = "clip" + Math.random().toString(36).slice(2, 8);
    const defs = el("defs", {});
    const cp = el("clipPath", { id: clip });
    cp.append(el("rect", { x: L, y: T, width: W - L - R, height: H - T - B }));
    defs.append(cp);
    svg.append(defs);
    const plot = el("g", { "clip-path": `url(#${clip})` });
    svg.append(plot);
    return { x, y, plot, svg, W, H, L, R, T, B };
  }

  const pathD = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");

  function lerpColor(a, b, t) {
    const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  function label(target, x, y, text, opts = {}) {
    const t = el("text", { x, y, "font-size": opts.size || 12, "font-weight": opts.weight || 600, fill: opts.fill || COLORS.ink, "text-anchor": opts.anchor || "start", "paint-order": "stroke", stroke: "#ffffff", "stroke-width": 4, "stroke-linejoin": "round" }, text);
    target.append(t);
  }

  // =============================================================== Portfolio optimizer
  (function portfolioTool() {
    const ids = ["mu1", "mu2", "mu3", "sd1", "sd2", "sd3", "r12", "r13", "r23", "prf"];
    if (!$("pf-chart")) return;
    const names = ["Bonds", "Equities", "Emerging"];
    const assetColors = [COLORS.blue, COLORS.violet, COLORS.pink];

    // Fixed random long-only portfolios for the cloud (re-evaluated as inputs change)
    const rand = M.mulberry32(42);
    const cloud = Array.from({ length: 1400 }, () => {
      const e = [0, 0, 0].map(() => -Math.log(1 - rand()));
      const s = e[0] + e[1] + e[2];
      return e.map((v) => v / s);
    });

    function draw() {
      const v = Object.fromEntries(ids.map((id) => [id, +$(id).value]));
      const mu = [v.mu1, v.mu2, v.mu3].map((x) => x / 100);
      const sd = [v.sd1, v.sd2, v.sd3].map((x) => x / 100);
      const rf = v.prf / 100;
      const p = M.portfolio(mu, sd, { r12: v.r12, r13: v.r13, r23: v.r23 }, rf);
      const note = $("pf-note");

      if (!p.valid) {
        $("pf-chart").innerHTML = "";
        note.textContent = "These correlations can't exist together (the covariance matrix isn't positive definite). Move one of them closer to the others.";
        ["pf-sharpe", "pf-tmu", "pf-tsd", "pf-gsd"].forEach((id) => { $(id).textContent = "n/a"; });
        $("pf-weights").innerHTML = "";
        return;
      }

      const xmax = Math.max(...sd) * 1.25, ymax = Math.max(...mu, p.tan ? p.tan.mu : 0) * 1.3;
      const f = frame($("pf-chart"), { xmin: 0, xmax, ymin: 0, ymax, xfmt: (x) => pct(x, 0), yfmt: (y) => pct(y, 0), xlabel: "Risk (standard deviation)", ylabel: "Expected return" });

      // Cloud of random long-only portfolios, colored by Sharpe ratio
      const pts = cloud.map((w) => {
        const m = w[0] * mu[0] + w[1] * mu[1] + w[2] * mu[2];
        const s = Math.sqrt(p.variance(w));
        return [s, m, (m - rf) / s];
      });
      const sh = pts.map((q) => q[2]), lo = Math.min(...sh), hi = Math.max(...sh);
      pts.forEach(([s, m, r]) => {
        f.plot.append(el("circle", { cx: f.x(s), cy: f.y(m), r: 2.2, fill: lerpColor("c9ccff", "ec5fab", (r - lo) / (hi - lo || 1)), opacity: 0.6 }));
      });

      // Frontier: efficient (upper) solid, inefficient (lower) dashed
      const up = [], down = [];
      for (let i = 0; i <= 160; i++) {
        const m = p.gmv.mu + (ymax * 1.2 - p.gmv.mu) * (i / 160);
        up.push([f.x(p.sdAt(m)), f.y(m)]);
        const m2 = p.gmv.mu - (p.gmv.mu + 0.05) * (i / 160);
        down.push([f.x(p.sdAt(m2)), f.y(m2)]);
      }
      f.plot.append(el("path", { d: pathD(down), fill: "none", stroke: COLORS.midnight, "stroke-width": 2, "stroke-dasharray": "5 5", opacity: 0.5 }));
      f.plot.append(el("path", { d: pathD(up), fill: "none", stroke: COLORS.midnight, "stroke-width": 3 }));

      // Capital market line
      if (p.tan) {
        const slope = p.tan.sharpe;
        f.plot.append(el("line", { x1: f.x(0), y1: f.y(rf), x2: f.x(xmax), y2: f.y(rf + slope * xmax), stroke: COLORS.pink, "stroke-width": 2.5 }));
      }

      // Individual assets
      mu.forEach((m, i) => {
        f.plot.append(el("circle", { cx: f.x(sd[i]), cy: f.y(m), r: 6, fill: assetColors[i], stroke: "#fff", "stroke-width": 2 }));
        label(f.plot, f.x(sd[i]) + 10, f.y(m) + 4, names[i]);
      });
      // GMV and tangency
      f.plot.append(el("circle", { cx: f.x(p.gmv.sd), cy: f.y(p.gmv.mu), r: 6, fill: "#fff", stroke: COLORS.midnight, "stroke-width": 3 }));
      label(f.plot, f.x(p.gmv.sd) + 10, f.y(p.gmv.mu) - 12, "Minimum variance", { weight: 500, fill: COLORS.soft });
      if (p.tan) {
        f.plot.append(el("circle", { cx: f.x(p.tan.sd), cy: f.y(p.tan.mu), r: 7, fill: COLORS.pink, stroke: "#fff", "stroke-width": 2 }));
        label(f.plot, f.x(p.tan.sd) - 10, f.y(p.tan.mu) - 10, "Tangency", { anchor: "end" });
      }
      f.plot.append(el("circle", { cx: f.x(0) + 1, cy: f.y(rf), r: 4, fill: COLORS.pink }));

      // Outputs
      if (p.tan) {
        $("pf-sharpe").textContent = num(p.tan.sharpe);
        $("pf-tmu").textContent = pct(p.tan.mu);
        $("pf-tsd").textContent = pct(p.tan.sd);
      } else {
        ["pf-sharpe", "pf-tmu", "pf-tsd"].forEach((id) => { $(id).textContent = "n/a"; });
      }
      $("pf-gsd").textContent = pct(p.gmv.sd);
      $("pf-weights").innerHTML = ["Tangency", "Min. variance"].map((title, k) => {
        const w = k === 0 ? (p.tan ? p.tan.w : null) : p.gmv.w;
        if (!w) return "";
        return `<div class="wrow"><span class="wtitle">${title}</span>${w.map((x, i) => `<span class="wcell"><i style="background:${assetColors[i]}"></i>${names[i]} <b>${pct(x, 0)}</b></span>`).join("")}</div>`;
      }).join("");
      const short = (p.tan && p.tan.w.some((x) => x < 0)) || p.gmv.w.some((x) => x < 0);
      note.textContent = p.tan
        ? `The pink line is the capital market line: mixing the risk-free asset with the tangency portfolio beats every other portfolio on the chart.${short ? " A negative weight means selling that asset short." : ""}`
        : "The risk-free rate is above what the risky portfolios can deliver, so there is no tangency portfolio. Lower the risk-free rate.";
    }

    ids.forEach((id) => $(id).addEventListener("input", draw));
    draw();
  })();

  // =============================================================== Monte Carlo
  (function monteCarloTool() {
    if (!$("mc-chart")) return;
    let seed = 2026;

    function run() {
      const s0 = Math.max(+$("mc-s0").value || 0, 1);
      const mu = +$("mc-mu").value / 100, sigma = +$("mc-sigma").value / 100;
      const years = +$("mc-years").value, sims = +$("mc-sims").value;
      const r = M.monteCarlo({ s0, mu, sigma, years, sims, seed });

      const top = r.bands[4][r.steps] * 1.08;
      const f = frame($("mc-chart"), { xmin: 0, xmax: years, ymin: 0, ymax: top, xfmt: (x) => x + "y", yfmt: (y) => (y >= 1e6 ? (y / 1e6).toFixed(1) + "m" : Math.round(y / 1000) + "k"), xlabel: "Years", ylabel: "Portfolio value", L: 60 });
      const xs = (t) => f.x(t / 12);

      // Sample paths
      for (let p = 0; p < Math.min(40, sims); p++) {
        const d = pathD(Array.from(r.paths[p], (v, t) => [xs(t), f.y(v)]));
        f.plot.append(el("path", { d, fill: "none", stroke: COLORS.blue, "stroke-width": 1, opacity: 0.18 }));
      }
      // Bands 5–95 and 25–75
      const band = (lo, hi, fill, op) => {
        const a = Array.from(r.bands[lo], (v, t) => [xs(t), f.y(v)]);
        const b = Array.from(r.bands[hi], (v, t) => [xs(t), f.y(v)]).reverse();
        f.plot.append(el("path", { d: pathD(a.concat(b)) + " Z", fill, opacity: op }));
      };
      band(0, 4, COLORS.violet, 0.16);
      band(1, 3, COLORS.violet, 0.28);
      f.plot.append(el("path", { d: pathD(Array.from(r.bands[2], (v, t) => [xs(t), f.y(v)])), fill: "none", stroke: COLORS.pink, "stroke-width": 3 }));
      f.plot.append(el("line", { x1: f.x(0), x2: f.x(years), y1: f.y(s0), y2: f.y(s0), stroke: COLORS.midnight, "stroke-dasharray": "4 4", opacity: 0.6 }));
      label(f.plot, f.x(0) + 6, f.y(s0) - 8, "Starting value", { weight: 500, fill: COLORS.soft });

      $("mc-median").textContent = money(r.median);
      $("mc-mean").textContent = money(r.mean);
      $("mc-loss").textContent = pct(r.probLoss);
      $("mc-var").textContent = money(Math.max(r.var95, 0));
      $("mc-note").textContent = `Each line is one possible future. The pink line is the median, the shaded bands hold the middle 50% and 90% of outcomes. The mean (${money(r.mean)}) sits above the median (${money(r.median)}) because returns compound: a few very good paths pull the average up.`;
    }

    ["mc-mu", "mc-sigma", "mc-years", "mc-sims"].forEach((id) => $(id).addEventListener("input", run));
    $("mc-s0").addEventListener("change", run);
    $("mc-run").addEventListener("click", () => { seed = Math.floor(Math.random() * 1e9); run(); });
    run();
  })();

  // =============================================================== Black–Scholes
  (function optionsTool() {
    if (!$("bs-chart")) return;
    let kind = "call";
    const seg = document.querySelectorAll("#bs-kind button");
    seg.forEach((b) => b.addEventListener("click", () => {
      kind = b.dataset.kind;
      seg.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    }));

    function draw() {
      const S = +$("bs-s").value, K = +$("bs-k").value, T = +$("bs-t").value;
      const r = +$("bs-r").value / 100, sigma = +$("bs-v").value / 100;
      const o = M.blackScholes({ S, K, T, r, sigma });
      const price = o[kind];
      const g = o.greeks[kind];

      $("bs-price").textContent = num(price);
      $("bs-label").textContent = kind === "call" ? "Call price" : "Put price";
      $("bs-delta").textContent = num(g.delta, 3);
      $("bs-gamma").textContent = num(g.gamma, 4);
      $("bs-vega").textContent = num(g.vega, 3);
      $("bs-theta").textContent = num(g.theta, 3);
      $("bs-rho").textContent = num(g.rho, 3);
      $("bs-parity").textContent = `C − P = ${num(o.call - o.put)} and S − K·e^(−rT) = ${num(S - K * Math.exp(-r * T))}`;
      const intrinsic = kind === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
      $("bs-note").textContent = `Of the ${num(price)} price, ${num(intrinsic)} is intrinsic value and ${num(price - intrinsic)} is time value: what the option is worth because the stock still has time to move.`;

      const xmin = Math.max(1, K * 0.4), xmax = K * 1.6;
      const vals = [], pay = [];
      for (let i = 0; i <= 120; i++) {
        const s = xmin + ((xmax - xmin) * i) / 120;
        vals.push([s, M.blackScholes({ S: s, K, T, r, sigma })[kind]]);
        pay.push([s, kind === "call" ? Math.max(s - K, 0) : Math.max(K - s, 0)]);
      }
      const ymax = Math.max(...vals.map((p) => p[1]), ...pay.map((p) => p[1])) * 1.1 || 1;
      const f = frame($("bs-chart"), { xmin, xmax, ymin: 0, ymax, xfmt: (x) => Math.round(x), yfmt: (y) => Math.round(y), xlabel: "Stock price", ylabel: "Option value" });
      f.plot.append(el("line", { x1: f.x(K), x2: f.x(K), y1: f.y(0), y2: f.y(ymax), stroke: COLORS.line, "stroke-width": 2 }));
      label(f.plot, f.x(K) + 6, f.y(ymax) + 16, "Strike", { weight: 500, fill: COLORS.soft });
      f.plot.append(el("path", { d: pathD(pay.map(([s, v]) => [f.x(s), f.y(v)])), fill: "none", stroke: COLORS.midnight, "stroke-width": 2, "stroke-dasharray": "6 5" }));
      f.plot.append(el("path", { d: pathD(vals.map(([s, v]) => [f.x(s), f.y(v)])), fill: "none", stroke: COLORS.violet, "stroke-width": 3 }));
      if (S >= xmin && S <= xmax) {
        f.plot.append(el("circle", { cx: f.x(S), cy: f.y(price), r: 7, fill: COLORS.pink, stroke: "#fff", "stroke-width": 2 }));
      }
    }

    ["bs-s", "bs-k", "bs-t", "bs-r", "bs-v"].forEach((id) => $(id).addEventListener("input", draw));
    draw();
  })();

  // =============================================================== Bonds
  (function bondTool() {
    if (!$("bd-chart")) return;
    function draw() {
      const couponRate = +$("bd-c").value / 100, ytm = +$("bd-y").value / 100;
      const years = +$("bd-n").value, freq = +$("bd-f").value, face = 1000;
      const b = M.bond({ face, couponRate, ytm, years, freq });

      $("bd-price").textContent = num(b.price);
      $("bd-mac").textContent = num(b.macaulay) + " years";
      $("bd-mod").textContent = num(b.modified);
      $("bd-cvx").textContent = num(b.convexity, 1);
      const status = Math.abs(b.price - face) < 0.005 ? "at par" : b.price > face ? "at a premium" : "at a discount";
      $("bd-status").textContent = `Trades ${status}`;

      // +1 percentage point shock
      const dy = 0.01;
      const actual = M.bond({ face, couponRate, ytm: ytm + dy, years, freq }).price - b.price;
      const durEst = -b.modified * dy * b.price;
      const cvxEst = durEst + 0.5 * b.convexity * dy * dy * b.price;
      $("bd-shock").innerHTML = `If yields rise 1 point, the price changes by <b>${num(actual)}</b>. Duration alone predicts ${num(durEst)}; adding convexity gives ${num(cvxEst)}.`;

      const ymin = 0.001, ymaxY = Math.max(0.15, ytm + 0.05);
      const curve = [], dur = [], cvx = [];
      for (let i = 0; i <= 120; i++) {
        const y = ymin + ((ymaxY - ymin) * i) / 120;
        const d = y - ytm;
        curve.push([y, M.bond({ face, couponRate, ytm: y, years, freq }).price]);
        dur.push([y, b.price * (1 - b.modified * d)]);
        cvx.push([y, b.price * (1 - b.modified * d + 0.5 * b.convexity * d * d)]);
      }
      const pmax = Math.max(...curve.map((p) => p[1])) * 1.05;
      const f = frame($("bd-chart"), { xmin: 0, xmax: ymaxY, ymin: 0, ymax: pmax, xn: 4, xfmt: (x) => pct(x, 0), yfmt: (y) => Math.round(y), xlabel: "Yield to maturity", ylabel: "Bond price", L: 60 });
      f.plot.append(el("path", { d: pathD(dur.map(([y, p]) => [f.x(y), f.y(p)])), fill: "none", stroke: COLORS.midnight, "stroke-width": 2, "stroke-dasharray": "6 5" }));
      f.plot.append(el("path", { d: pathD(cvx.map(([y, p]) => [f.x(y), f.y(p)])), fill: "none", stroke: COLORS.pink, "stroke-width": 2, "stroke-dasharray": "2 4" }));
      f.plot.append(el("path", { d: pathD(curve.map(([y, p]) => [f.x(y), f.y(p)])), fill: "none", stroke: COLORS.violet, "stroke-width": 3 }));
      f.plot.append(el("line", { x1: f.x(0), x2: f.x(ymaxY), y1: f.y(face), y2: f.y(face), stroke: COLORS.line, "stroke-width": 2 }));
      label(f.plot, f.x(ymaxY) - 6, f.y(face) - 8, "Par 1,000", { anchor: "end", weight: 500, fill: COLORS.soft });
      f.plot.append(el("circle", { cx: f.x(ytm), cy: f.y(b.price), r: 7, fill: COLORS.pink, stroke: "#fff", "stroke-width": 2 }));
    }
    ["bd-c", "bd-y", "bd-n", "bd-f"].forEach((id) => $(id).addEventListener("input", draw));
    draw();
  })();
})();
