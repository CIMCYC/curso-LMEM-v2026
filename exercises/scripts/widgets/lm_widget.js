// Widget "busca los parametros": y = alpha + beta x sobre ocho puntos fijos, con la
// vista girada de los residuos y la campana normal ajustada a esos residuos.
// Los datos y la recta de lm() llegan en window.LMW desde el documento (R).
// Todo se dibuja en SVG con ejes al estilo de theme_classic (dos lineas, marcas
// cortas) y en escala de grises; solo sigma va en rojo.
// Arranca cuando la pagina ya esta cargada: parte del texto (la media y sigma)
// vive en la nota del margen, que va despues del widget en el documento.
function lmwStart() {
  "use strict";
  var D = window.LMW, xs = D.xs, ys = D.ys, n = xs.length;
  var svg1 = document.getElementById("lmw-svg1");
  var svg2 = document.getElementById("lmw-svg2");
  var s0 = document.getElementById("lmw-s0"), s1 = document.getElementById("lmw-s1");
  var out = {
    b0: document.getElementById("lmw-b0"), b1: document.getElementById("lmw-b1"),
    sse: document.getElementById("lmw-sse"), sigma: document.getElementById("lmw-sigma"),
    rmean: document.getElementById("lmw-rmean")
  };
  var NS = "http://www.w3.org/2000/svg";
  var W = 620, PAD = { l: 50, r: 18, t: 14, b: 38 };
  // Rangos, ejes y deslizadores: vienen de window.LMW (con valores por defecto)
  var XR = D.xr || { min: -0.5, max: 8.5 };
  var XT = D.xticks || [0, 1, 2, 3, 4, 5, 6, 7, 8];
  var LAB = D.labels || { x: "x", y: "y", res: "residuo" };
  var DIG = (D.digits === undefined) ? 2 : D.digits;
  var S0 = D.s0 || { min: -1, max: 5, step: 0.05, start: 1 };
  var S1 = D.s1 || { min: -1, max: 1.5, step: 0.01, start: 1 };
  var GREY = "#737373", DARK = "#262626", RED = "#C0392B";

  // redondea para mostrar; evita el "-0" que da toFixed con valores como -0.0001
  function fmt(v) { var r = Number(v).toFixed(DIG); return (Number(r) === 0) ? (0).toFixed(DIG) : r; }
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } }
    if (text !== undefined) { e.textContent = text; }
    return e;
  }
  function clear(svg) { while (svg.firstChild) { svg.removeChild(svg.firstChild); } }

  // Ejes estilo theme_classic: linea inferior e izquierda, marcas y etiquetas
  function axes(svg, sx, sy, xr, yr, xticks, yticks, xlab, ylab) {
    var x0 = sx(xr.min), x1 = sx(xr.max), y0 = sy(yr.min), y1 = sy(yr.max), i, t;
    svg.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: DARK, "stroke-width": 1 }));
    svg.appendChild(el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: DARK, "stroke-width": 1 }));
    for (i = 0; i < xticks.length; i++) {
      t = xticks[i];
      svg.appendChild(el("line", { x1: sx(t), y1: y0, x2: sx(t), y2: y0 + 4, stroke: DARK, "stroke-width": 1 }));
      svg.appendChild(el("text", { x: sx(t), y: y0 + 17, "font-size": 12, "text-anchor": "middle", fill: DARK }, String(t)));
    }
    for (i = 0; i < yticks.length; i++) {
      t = yticks[i];
      svg.appendChild(el("line", { x1: x0 - 4, y1: sy(t), x2: x0, y2: sy(t), stroke: DARK, "stroke-width": 1 }));
      svg.appendChild(el("text", { x: x0 - 8, y: sy(t) + 4, "font-size": 12, "text-anchor": "end", fill: DARK }, String(t)));
    }
    svg.appendChild(el("text", { x: (x0 + x1) / 2, y: y0 + 33, "font-size": 13, "text-anchor": "middle", fill: DARK }, xlab));
    var ty = (y0 + y1) / 2;
    svg.appendChild(el("text", { x: 14, y: ty, "font-size": 13, "text-anchor": "middle", fill: DARK,
                                 transform: "rotate(-90 14 " + ty + ")" }, ylab));
  }
  function clipped(svg, id, x, y, w, h) {
    var defs = el("defs"), cp = el("clipPath", { id: id });
    cp.appendChild(el("rect", { x: x, y: y, width: w, height: h }));
    defs.appendChild(cp);
    svg.appendChild(defs);
    var g = el("g", { "clip-path": "url(#" + id + ")" });
    svg.appendChild(g);
    return g;
  }

  // ---- Panel 1: los datos, la recta, los residuos y el intercepto
  var H1 = 380, YR1 = D.yr || { min: 0, max: 8 }, YT = D.yticks || [0, 2, 4, 6, 8];
  var pw1 = W - PAD.l - PAD.r, ph1 = H1 - PAD.t - PAD.b;
  function sx1(x) { return PAD.l + (x - XR.min) / (XR.max - XR.min) * pw1; }
  function sy1(y) { return PAD.t + (YR1.max - y) / (YR1.max - YR1.min) * ph1; }

  function drawPanel1(b0, b1) {
    clear(svg1);
    var g = clipped(svg1, "lmw-clip1", PAD.l, PAD.t, pw1, ph1), i;
    g.appendChild(el("line", { x1: sx1(0), y1: sy1(YR1.min), x2: sx1(0), y2: sy1(YR1.max),
                               stroke: "#999", "stroke-dasharray": "5 4" }));
    // el cuadrado de cada residuo: lado = residuo (en la escala de y), area = residuo^2.
    // La suma de sus areas es la suma de cuadrados que lm() hace minima.
    for (i = 0; i < n; i++) {
      var yh = sy1(b0 + b1 * xs[i]), yo = sy1(ys[i]), side = Math.abs(yh - yo);
      g.appendChild(el("rect", { x: sx1(xs[i]), y: Math.min(yh, yo), width: side, height: side,
                                 fill: "#000", "fill-opacity": 0.06, stroke: "#555", "stroke-opacity": 0.35, "stroke-width": 0.6 }));
    }
    for (i = 0; i < n; i++) {   // residuo: del punto a la recta
      g.appendChild(el("line", { x1: sx1(xs[i]), y1: sy1(b0 + b1 * xs[i]), x2: sx1(xs[i]), y2: sy1(ys[i]),
                                 stroke: "#555", "stroke-width": 1.2, "stroke-dasharray": "2 3" }));
    }
    g.appendChild(el("line", { x1: sx1(XR.min), y1: sy1(b0 + b1 * XR.min), x2: sx1(XR.max), y2: sy1(b0 + b1 * XR.max),
                               stroke: "#000", "stroke-width": 2 }));
    for (i = 0; i < n; i++) { g.appendChild(el("circle", { cx: sx1(xs[i]), cy: sy1(ys[i]), r: 5, fill: GREY })); }
    g.appendChild(el("rect", { x: sx1(0) - 6, y: sy1(b0) - 6, width: 12, height: 12, fill: "#fff",
                               stroke: "#000", "stroke-width": 1.5 }));   // el intercepto
    axes(svg1, sx1, sy1, XR, YR1, XT, YT, LAB.x, LAB.y);
  }

  // ---- Panel 2: residuos frente a x (recta horizontal en 0) y la campana N(0, sigma^2)
  var H2 = 320, RR = D.rr || { min: -4, max: 4 }, RT = D.rticks || [-4, -2, 0, 2, 4], BELL_W = 110, GAP = 34;
  var pw2 = W - PAD.l - PAD.r - BELL_W - GAP, ph2 = H2 - PAD.t - PAD.b;
  function sx2(x) { return PAD.l + (x - XR.min) / (XR.max - XR.min) * pw2; }
  function sy2(r) { return PAD.t + (RR.max - r) / (RR.max - RR.min) * ph2; }
  var bx0 = PAD.l + pw2 + GAP;   // eje (centro) de la campana

  function drawPanel2(b0, b1) {
    clear(svg2);
    var res = [], sse = 0, sum = 0, ss = 0, i, r;
    for (i = 0; i < n; i++) { r = ys[i] - (b0 + b1 * xs[i]); res.push(r); sse += r * r; sum += r; }
    var rmean = sum / n;
    for (i = 0; i < n; i++) { ss += (res[i] - rmean) * (res[i] - rmean); }
    var sigma = Math.sqrt(ss / (n - 2));   // en la recta de lm() coincide con el residual standard error
    var g = clipped(svg2, "lmw-clip2", PAD.l, PAD.t, W - PAD.l - PAD.r, ph2);

    // media de los residuos (gris discontinua): el centro de la campana
    g.appendChild(el("line", { x1: sx2(XR.min), y1: sy2(rmean), x2: bx0 + BELL_W, y2: sy2(rmean),
                               stroke: "#999", "stroke-dasharray": "5 4" }));
    g.appendChild(el("text", { x: sx2(XR.max) - 2, y: sy2(rmean) - 5, "font-size": 11, "text-anchor": "end", fill: "#777" },
                     "media de los residuos"));
    // residuos; los que se salen de +-4 se marcan con un triangulo en el borde
    for (i = 0; i < n; i++) {
      var rc = Math.max(RR.min, Math.min(RR.max, res[i])), cx = sx2(xs[i]), cy = sy2(rc);
      g.appendChild(el("line", { x1: cx, y1: sy2(0), x2: cx, y2: cy, stroke: "#555", "stroke-width": 1.2, "stroke-dasharray": "2 3" }));
      if (rc === res[i]) {
        g.appendChild(el("circle", { cx: cx, cy: cy, r: 5, fill: GREY }));
      } else {
        var dir = res[i] > 0 ? 1 : -1;
        g.appendChild(el("path", { d: "M" + (cx - 5) + " " + (cy + dir * 7) + " L" + (cx + 5) + " " + (cy + dir * 7) +
                                      " L" + cx + " " + cy + " Z", fill: GREY }));
      }
    }
    // la campana ajustada a los residuos, tumbada: centro en su media, anchura sigma
    var pts = [], steps = 96, s, rv, d;
    for (s = 0; s <= steps; s++) {
      rv = RR.min + (RR.max - RR.min) * s / steps;
      d = Math.exp(-0.5 * ((rv - rmean) / sigma) * ((rv - rmean) / sigma));
      pts.push((bx0 + BELL_W * d).toFixed(1) + " " + sy2(rv).toFixed(1));
    }
    var curve = "M" + pts.join(" L");
    g.appendChild(el("path", { d: curve + " L" + bx0 + " " + sy2(RR.max).toFixed(1) + " L" + bx0 + " " + sy2(RR.min).toFixed(1) + " Z",
                               fill: "#000", "fill-opacity": 0.08, stroke: "none" }));
    g.appendChild(el("line", { x1: bx0, y1: sy2(RR.min), x2: bx0, y2: sy2(RR.max), stroke: "#999", "stroke-width": 1 }));
    g.appendChild(el("path", { d: curve, fill: "none", stroke: "#000", "stroke-width": 1.5 }));
    // la recta: atraviesa los residuos y el centro de la campana
    g.appendChild(el("line", { x1: sx2(XR.min), y1: sy2(0), x2: bx0 + BELL_W, y2: sy2(0), stroke: "#000", "stroke-width": 2 }));
    // sigma: del centro de la campana a su punto de inflexion, en rojo
    var yM = sy2(rmean), yS = sy2(rmean + sigma), xInf = bx0 + BELL_W * Math.exp(-0.5);
    g.appendChild(el("line", { x1: bx0, y1: yS, x2: xInf, y2: yS, stroke: RED, "stroke-width": 1, "stroke-dasharray": "2 3" }));
    g.appendChild(el("line", { x1: bx0, y1: yM, x2: bx0, y2: yS, stroke: RED, "stroke-width": 3 }));
    g.appendChild(el("line", { x1: bx0 - 5, y1: yS, x2: bx0 + 5, y2: yS, stroke: RED, "stroke-width": 2 }));
    g.appendChild(el("text", { x: bx0 - 9, y: (yM + yS) / 2 + 5, "font-size": 15, "font-style": "italic",
                               "text-anchor": "end", fill: RED }, "\u03c3"));
    svg2.appendChild(el("text", { x: bx0 + BELL_W / 2, y: sy2(RR.min) + 17, "font-size": 12, "text-anchor": "middle", fill: DARK },
                        "residuos ~ N(media, \u03c3\u00b2)"));
    axes(svg2, sx2, sy2, XR, RR, XT, RT, LAB.x, LAB.res);
    return { sse: sse, sigma: sigma, rmean: rmean };
  }

  // El boton "Recta de lm()" usa los coeficientes exactos: el deslizador (paso 1)
  // los redondearia y la media de los residuos dejaria de ser 0.
  var exact = null;
  function update() {
    var b0 = exact ? exact[0] : parseFloat(s0.value), b1 = exact ? exact[1] : parseFloat(s1.value);
    drawPanel1(b0, b1);
    var st = drawPanel2(b0, b1);
    out.b0.textContent = fmt(b0); out.b1.textContent = fmt(b1);
    out.sse.textContent = fmt(st.sse); out.sigma.textContent = fmt(st.sigma); out.rmean.textContent = fmt(st.rmean);
  }
  s0.addEventListener("input", function () { exact = null; update(); });
  s1.addEventListener("input", function () { exact = null; update(); });
  document.getElementById("lmw-fit").addEventListener("click", function () { s0.value = D.fit[0]; s1.value = D.fit[1]; exact = D.fit; update(); });
  [[s0, S0], [s1, S1]].forEach(function (p) { p[0].min = p[1].min; p[0].max = p[1].max; p[0].step = p[1].step; });
  document.getElementById("lmw-reset").addEventListener("click", function () { exact = null; s0.value = S0.start; s1.value = S1.start; update(); });
  s0.value = S0.start; s1.value = S1.start; update();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", lmwStart);
} else {
  lmwStart();
}
