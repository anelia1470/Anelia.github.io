// Finance lab: the pure math behind the advanced tools.
// No DOM code here, so every formula can be tested on its own.

(function (root) {
  // ---------- Linear algebra (small matrices) ----------
  function inv3(m) {
    const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-12) return null;
    return {
      det,
      m: [
        [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
        [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
        [C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
      ],
    };
  }
  const mv = (m, v) => m.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

  // ---------- Mean-variance portfolio theory (Markowitz) ----------
  // mu, sd: arrays of 3 (decimals). rho: {r12, r13, r23}. rf: decimal.
  function portfolio(mu, sd, rho, rf) {
    const R = [[1, rho.r12, rho.r13], [rho.r12, 1, rho.r23], [rho.r13, rho.r23, 1]];
    const S = R.map((row, i) => row.map((r, j) => r * sd[i] * sd[j]));
    // Positive definite check via leading principal minors
    const m2 = S[0][0] * S[1][1] - S[0][1] * S[1][0];
    const inv = inv3(S);
    if (!inv || S[0][0] <= 0 || m2 <= 0 || inv.det <= 0) return { valid: false };
    const Si = inv.m;
    const one = [1, 1, 1];
    const Si1 = mv(Si, one), Simu = mv(Si, mu);
    const A = dot(one, Si1), B = dot(one, Simu), C = dot(mu, Simu), D = A * C - B * B;

    const variance = (w) => dot(w, mv(S, w));
    const sdAt = (m) => Math.sqrt(Math.max((A * m * m - 2 * B * m + C) / D, 0));

    const gmvW = Si1.map((x) => x / A);
    const gmv = { w: gmvW, mu: B / A, sd: Math.sqrt(1 / A) };

    const excess = mu.map((m) => m - rf);
    const z = mv(Si, excess);
    const zSum = z.reduce((s, x) => s + x, 0);
    let tan = null;
    if (zSum > 1e-12) {
      const w = z.map((x) => x / zSum);
      const tmu = dot(w, mu), tsd = Math.sqrt(variance(w));
      tan = { w, mu: tmu, sd: tsd, sharpe: (tmu - rf) / tsd };
    }
    return { valid: true, S, A, B, C, D, sdAt, gmv, tan, variance };
  }

  // ---------- Random numbers ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gaussian(rand) {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // ---------- Monte Carlo: geometric Brownian motion, monthly steps ----------
  function monteCarlo({ s0, mu, sigma, years, sims, seed }) {
    const steps = Math.round(years * 12), dt = 1 / 12;
    const drift = (mu - 0.5 * sigma * sigma) * dt, vol = sigma * Math.sqrt(dt);
    const rand = mulberry32(seed);
    const paths = new Array(sims);
    for (let p = 0; p < sims; p++) {
      const path = new Float64Array(steps + 1);
      path[0] = s0;
      for (let t = 1; t <= steps; t++) path[t] = path[t - 1] * Math.exp(drift + vol * gaussian(rand));
      paths[p] = path;
    }
    const qs = [0.05, 0.25, 0.5, 0.75, 0.95];
    const bands = qs.map(() => new Float64Array(steps + 1));
    const col = new Float64Array(sims);
    for (let t = 0; t <= steps; t++) {
      for (let p = 0; p < sims; p++) col[p] = paths[p][t];
      col.sort();
      qs.forEach((q, k) => { bands[k][t] = quantileSorted(col, q); });
    }
    const ending = paths.map((p) => p[steps]).sort((a, b) => a - b);
    const losses = ending.filter((v) => v < s0).length;
    return {
      steps, paths, bands, qs,
      median: quantileSorted(ending, 0.5),
      p5: quantileSorted(ending, 0.05),
      mean: ending.reduce((s, v) => s + v, 0) / sims,
      expected: s0 * Math.exp(mu * years),
      probLoss: losses / sims,
      var95: s0 - quantileSorted(ending, 0.05),
    };
  }
  function quantileSorted(arr, q) {
    const pos = (arr.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return arr[lo] + (arr[hi] - arr[lo]) * (pos - lo);
  }

  // ---------- Black–Scholes ----------
  function normCdf(x) {
    // Abramowitz & Stegun 7.1.26 via erf, error < 1.5e-7
    const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
    return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  }
  const normPdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

  function blackScholes({ S, K, T, r, sigma, q = 0 }) {
    if (T <= 0 || sigma <= 0) {
      return { call: Math.max(S - K, 0), put: Math.max(K - S, 0), d1: NaN, d2: NaN, greeks: null };
    }
    const sT = sigma * Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / sT;
    const d2 = d1 - sT;
    const dq = Math.exp(-q * T), dr = Math.exp(-r * T);
    const call = S * dq * normCdf(d1) - K * dr * normCdf(d2);
    const put = K * dr * normCdf(-d2) - S * dq * normCdf(-d1);
    const gamma = (dq * normPdf(d1)) / (S * sT);
    const vega = S * dq * normPdf(d1) * Math.sqrt(T) / 100; // per 1 vol point
    const greeks = {
      call: {
        delta: dq * normCdf(d1),
        gamma,
        vega,
        theta: (-(S * dq * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * dr * normCdf(d2) + q * S * dq * normCdf(d1)) / 365,
        rho: (K * T * dr * normCdf(d2)) / 100,
      },
      put: {
        delta: -dq * normCdf(-d1),
        gamma,
        vega,
        theta: (-(S * dq * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * dr * normCdf(-d2) - q * S * dq * normCdf(-d1)) / 365,
        rho: (-K * T * dr * normCdf(-d2)) / 100,
      },
    };
    return { call, put, d1, d2, greeks };
  }

  // ---------- Bonds ----------
  // face, couponRate, ytm, years: decimals/numbers; freq: payments per year
  function bond({ face, couponRate, ytm, years, freq }) {
    const n = Math.round(years * freq), c = (face * couponRate) / freq, y = ytm / freq;
    let price = 0, wt = 0, cx = 0;
    for (let k = 1; k <= n; k++) {
      const cf = k === n ? c + face : c;
      const pv = cf / (1 + y) ** k;
      price += pv;
      wt += (k / freq) * pv;
      cx += pv * k * (k + 1);
    }
    const macaulay = wt / price;
    const modified = macaulay / (1 + y);
    const convexity = cx / (price * (1 + y) ** 2 * freq * freq);
    return { price, macaulay, modified, convexity, n };
  }

  const api = { inv3, portfolio, mulberry32, gaussian, monteCarlo, quantileSorted, normCdf, normPdf, blackScholes, bond };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LabMath = api;
})(typeof window !== "undefined" ? window : globalThis);
