// Generador de muestras normales con histograma, grafico Q-Q y los dos tests
// clasicos (Shapiro-Wilk y Kolmogorov-Smirnov/Lilliefors, portados de R en
// normtests.js). Cuenta cuantas muestras normales salen "no normales".
// Arranca cuando la pagina esta cargada (los campos pueden ir en otro sitio).
function nrwStart() {
  "use strict";
  var NT = window.NormTests;
  var N_OPTS = [10, 20, 30, 50, 100, 200, 500, 1000, 2000, 5000];
  var NS = "http://www.w3.org/2000/svg", svg = document.getElementById("nrw-svg");
  var W = 620, H = 300, PAD = { l: 52, r: 14, t: 26, b: 42 }, GAP = 46;
  var PW = (W - PAD.l - PAD.r - GAP - PAD.l) / 2;   // ancho de cada panel
  var DARK = "#262626", GREY = "#737373", RED = "#C0392B";
  var slider = document.getElementById("nrw-n");
  var tally = { m: 0, k1: 0, k2: 0 };

  function rnorm() {
    var u = 0, v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function el(tag, a, txt) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) { if (a.hasOwnProperty(k)) { e.setAttribute(k, a[k]); } }
    if (txt !== undefined) { e.textContent = txt; }
    return e;
  }
  function quantile7(xs, p) {   // xs ordenado; tipo 7 de R
    var h = (xs.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
    return xs[lo] + (h - lo) * (xs[hi] - xs[lo]);
  }
  function niceTicks(lo, hi, want) {
    var span = hi - lo, raw = span / want, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; })
      .reduce(function (a, b) { return Math.abs(b - raw) < Math.abs(a - raw) ? b : a; });
    var t = [], v = Math.ceil(lo / step) * step;
    for (; v <= hi + 1e-9; v += step) { t.push(Number(v.toFixed(6))); }
    return t;
  }
  // ejes estilo theme_classic dentro de un panel [x0, x0 + PW]
  function axes(x0, sx, sy, xr, yr, xlab, ylab, title) {
    var y0 = sy(yr.min), y1 = sy(yr.max), x1 = x0 + PW;
    svg.appendChild(el("text", { x: x0, y: PAD.t - 10, "font-size": 12, "font-weight": "bold", fill: DARK }, title));
    svg.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: DARK }));
    svg.appendChild(el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: DARK }));
    niceTicks(xr.min, xr.max, 5).forEach(function (t) {
      svg.appendChild(el("line", { x1: sx(t), y1: y0, x2: sx(t), y2: y0 + 4, stroke: DARK }));
      svg.appendChild(el("text", { x: sx(t), y: y0 + 16, "font-size": 11, "text-anchor": "middle", fill: DARK }, String(t)));
    });
    niceTicks(yr.min, yr.max, 4).forEach(function (t) {
      svg.appendChild(el("line", { x1: x0 - 4, y1: sy(t), x2: x0, y2: sy(t), stroke: DARK }));
      svg.appendChild(el("text", { x: x0 - 7, y: sy(t) + 4, "font-size": 11, "text-anchor": "end", fill: DARK }, String(t)));
    });
    svg.appendChild(el("text", { x: (x0 + x1) / 2, y: H - 8, "font-size": 12, "text-anchor": "middle", fill: DARK }, xlab));
    var ty = (y0 + y1) / 2;
    svg.appendChild(el("text", { x: x0 - 38, y: ty, "font-size": 12, "text-anchor": "middle", fill: DARK,
                                 transform: "rotate(-90 " + (x0 - 38) + " " + ty + ")" }, ylab));
  }

  function draw(xs) {
    while (svg.firstChild) { svg.removeChild(svg.firstChild); }
    var n = xs.length, sorted = xs.slice().sort(function (a, b) { return a - b; });
    var mean = 0, sd = 0, i;
    for (i = 0; i < n; i++) { mean += xs[i]; }
    mean /= n;
    for (i = 0; i < n; i++) { sd += (xs[i] - mean) * (xs[i] - mean); }
    sd = Math.sqrt(sd / (n - 1));

    // ---- panel 1: histograma de densidad con la normal ajustada
    var lo = Math.min(-3.5, Math.floor(sorted[0] * 2) / 2);
    var hi = Math.max(3.5, Math.ceil(sorted[n - 1] * 2) / 2);
    var k = Math.ceil(Math.log(n) / Math.LN2 + 1), bw = (hi - lo) / k, counts = [], b;
    for (b = 0; b < k; b++) { counts.push(0); }
    for (i = 0; i < n; i++) { b = Math.min(k - 1, Math.floor((xs[i] - lo) / bw)); counts[b] += 1; }
    var dens = counts.map(function (c) { return c / (n * bw); });
    var ymax = Math.max(Math.max.apply(null, dens), 0.4 / sd) * 1.1;
    var x0a = PAD.l, xr1 = { min: lo, max: hi }, yr1 = { min: 0, max: ymax };
    function sx1(v) { return x0a + (v - lo) / (hi - lo) * PW; }
    function sy1(v) { return PAD.t + (ymax - v) / ymax * (H - PAD.t - PAD.b); }
    for (b = 0; b < k; b++) {
      svg.appendChild(el("rect", { x: sx1(lo + b * bw), y: sy1(dens[b]), width: sx1(lo + (b + 1) * bw) - sx1(lo + b * bw),
                                   height: sy1(0) - sy1(dens[b]), fill: "#d9d9d9", stroke: "#fff", "stroke-width": 1 }));
    }
    var pts = [], s, v;
    for (s = 0; s <= 120; s++) {
      v = lo + (hi - lo) * s / 120;
      pts.push(sx1(v).toFixed(1) + " " + sy1(Math.exp(-0.5 * Math.pow((v - mean) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI))).toFixed(1));
    }
    svg.appendChild(el("path", { d: "M" + pts.join(" L"), fill: "none", stroke: DARK, "stroke-width": 1.6 }));
    axes(x0a, sx1, sy1, xr1, yr1, "x", "Densidad", "Histograma y normal ajustada");

    // ---- panel 2: grafico Q-Q con la recta por los cuartiles (qqline)
    var a = n <= 10 ? 3 / 8 : 0.5, theo = [];
    for (i = 0; i < n; i++) { theo.push(NT.qnorm((i + 1 - a) / (n + 1 - 2 * a))); }
    var q1 = quantile7(sorted, 0.25), q3 = quantile7(sorted, 0.75), z1 = NT.qnorm(0.25), z3 = NT.qnorm(0.75);
    var slope = (q3 - q1) / (z3 - z1), icept = q1 - slope * z1;
    var tlo = Math.min(-3.5, Math.floor(theo[0] * 2) / 2), thi = Math.max(3.5, Math.ceil(theo[n - 1] * 2) / 2);
    var slo = Math.min(sorted[0], icept + slope * tlo), shi = Math.max(sorted[n - 1], icept + slope * thi);
    var padv = 0.05 * (shi - slo); slo -= padv; shi += padv;
    var x0b = PAD.l + PW + GAP + PAD.l;
    function sx2(t) { return x0b + (t - tlo) / (thi - tlo) * PW; }
    function sy2(y) { return PAD.t + (shi - y) / (shi - slo) * (H - PAD.t - PAD.b); }
    svg.appendChild(el("line", { x1: sx2(tlo), y1: sy2(icept + slope * tlo), x2: sx2(thi), y2: sy2(icept + slope * thi),
                                 stroke: DARK, "stroke-width": 1.4 }));
    var step = Math.max(1, Math.floor(n / 600));   // con n grande, uno de cada "step"
    for (i = 0; i < n; i += step) {
      svg.appendChild(el("circle", { cx: sx2(theo[i]), cy: sy2(sorted[i]), r: 2.6, fill: "none", stroke: GREY, "stroke-width": 1 }));
    }
    if ((n - 1) % step !== 0) {
      svg.appendChild(el("circle", { cx: sx2(theo[n - 1]), cy: sy2(sorted[n - 1]), r: 2.6, fill: "none", stroke: GREY, "stroke-width": 1 }));
    }
    axes(x0b, sx2, sy2, { min: tlo, max: thi }, { min: slo, max: shi }, "Cuantiles teóricos", "Cuantiles de la muestra", "Gráfico Q-Q");
  }

  function fmtP(p) { return p < 0.001 ? "< 0.001" : p.toFixed(3); }
  function setP(id, p) {
    var e = document.getElementById(id);
    e.textContent = fmtP(p);
    e.className = p < 0.05 ? "nrw-sig" : "";
  }
  function pct(k, m) { return m ? (100 * k / m).toFixed(0) + " %" : "0 %"; }

  function sample() {
    var n = N_OPTS[parseInt(slider.value, 10)], xs = [], i;
    for (i = 0; i < n; i++) { xs.push(rnorm()); }
    draw(xs);
    var sw = NT.shapiroWilk(xs), li = NT.lilliefors(xs);
    document.getElementById("nrw-w").textContent = sw.W.toFixed(3);
    document.getElementById("nrw-d").textContent = li.D.toFixed(3);
    setP("nrw-pw", sw.p); setP("nrw-pd", li.p);
    tally.m += 1;
    if (sw.p < 0.05) { tally.k1 += 1; }
    if (li.p < 0.05) { tally.k2 += 1; }
    document.getElementById("nrw-m").textContent = String(tally.m);
    document.getElementById("nrw-k1").textContent = String(tally.k1);
    document.getElementById("nrw-k2").textContent = String(tally.k2);
    document.getElementById("nrw-r1").textContent = pct(tally.k1, tally.m);
    document.getElementById("nrw-r2").textContent = pct(tally.k2, tally.m);
  }
  function resetTally() { tally = { m: 0, k1: 0, k2: 0 }; }
  function showN() { document.getElementById("nrw-nlab").textContent = String(N_OPTS[parseInt(slider.value, 10)]); }

  slider.addEventListener("input", function () { showN(); resetTally(); sample(); });
  document.getElementById("nrw-again").addEventListener("click", sample);
  document.getElementById("nrw-reset").addEventListener("click", function () { resetTally(); sample(); });
  showN(); sample();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", nrwStart);
} else {
  nrwStart();
}
