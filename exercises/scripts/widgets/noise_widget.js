// Winter's trick: plot(rnorm(100), rnorm(100)), redrawn in the browser on each
// click. Normal draws via Box-Muller. Axes in the style of base R plot().
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", svg = document.getElementById("nzw-svg");
  var W = 560, H = 360, L = 58, R = 16, T = 14, B = 52, RANGE = 3.5, count = 1;
  function sx(v) { return L + (v + RANGE) / (2 * RANGE) * (W - L - R); }
  function sy(v) { return T + (RANGE - v) / (2 * RANGE) * (H - T - B); }
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
  function draw() {
    while (svg.firstChild) { svg.removeChild(svg.firstChild); }
    svg.appendChild(el("rect", { x: sx(-RANGE), y: sy(RANGE), width: sx(RANGE) - sx(-RANGE),
                                 height: sy(-RANGE) - sy(RANGE), fill: "none", stroke: "#222" }));
    for (var t = -3; t <= 3; t++) {
      svg.appendChild(el("line", { x1: sx(t), y1: sy(-RANGE), x2: sx(t), y2: sy(-RANGE) + 5, stroke: "#222" }));
      svg.appendChild(el("text", { x: sx(t), y: sy(-RANGE) + 19, "font-size": 12, "text-anchor": "middle", fill: "#222" }, String(t)));
      svg.appendChild(el("line", { x1: sx(-RANGE) - 5, y1: sy(t), x2: sx(-RANGE), y2: sy(t), stroke: "#222" }));
      svg.appendChild(el("text", { x: sx(-RANGE) - 9, y: sy(t) + 4, "font-size": 12, "text-anchor": "end", fill: "#222" }, String(t)));
    }
    svg.appendChild(el("text", { x: (sx(-RANGE) + sx(RANGE)) / 2, y: H - 8, "font-size": 13, "text-anchor": "middle", fill: "#222" }, "Valores ajustados"));
    var ty = (sy(-RANGE) + sy(RANGE)) / 2;
    svg.appendChild(el("text", { x: 16, y: ty, "font-size": 13, "text-anchor": "middle", fill: "#222",
                                 transform: "rotate(-90 16 " + ty + ")" }, "Residuos"));
    svg.appendChild(el("line", { x1: sx(-RANGE), y1: sy(0), x2: sx(RANGE), y2: sy(0), stroke: "#222", "stroke-dasharray": "5 4" }));
    for (var i = 0; i < 100; i++) {
      var a = Math.max(-RANGE, Math.min(RANGE, rnorm())), b = Math.max(-RANGE, Math.min(RANGE, rnorm()));
      svg.appendChild(el("circle", { cx: sx(a), cy: sy(b), r: 3.6, fill: "none", stroke: "#222", "stroke-width": 1 }));
    }
    document.getElementById("nzw-n").textContent = String(count);
  }
  document.getElementById("nzw-again").addEventListener("click", function () { count += 1; draw(); });
  draw();
})();
