// Normality tests in the browser, ported from R so the p-values match:
//   shapiroWilk()  = stats::shapiro.test()   (swilk.c, Royston 1995, AS R94)
//   lilliefors()   = nortest::lillie.test()  (Dallal & Wilkinson 1986)
// plus pnorm() / qnorm() with full double precision. Checked against R on
// fixed samples (see the course notes); no dependencies.
var NormTests = (function () {
  "use strict";

  // complementary error function: series below 2.5, continued fraction above
  function erfc(x) {
    if (x < 0) { return 2 - erfc(-x); }
    if (x < 2.5) {
      var sum = x, term = x, x2 = x * x, n = 0, add;
      do { n += 1; term *= -x2 / n; add = term / (2 * n + 1); sum += add; }
      while (Math.abs(add) > 1e-17 * Math.abs(sum));
      return 1 - 2 / Math.sqrt(Math.PI) * sum;
    }
    var f = x, C = x, D = 0, a, delta, k;   // modified Lentz
    for (k = 1; k < 500; k++) {
      a = k / 2;
      D = x + a * D; D = 1 / D;
      C = x + a / C;
      delta = C * D; f *= delta;
      if (Math.abs(delta - 1) < 1e-16) { break; }
    }
    return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
  }
  function pnorm(z, lower) {
    if (lower === undefined) { lower = true; }
    return lower ? 0.5 * erfc(-z / Math.SQRT2) : 0.5 * erfc(z / Math.SQRT2);
  }
  // Acklam's rational approximation refined with one Halley step
  function qnorm(p) {
    if (p <= 0) { return -Infinity; }
    if (p >= 1) { return Infinity; }
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
             1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
             6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
             3.754408661907416e+00];
    var pl = 0.02425, q, r, x;
    if (p < pl) {
      q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= 1 - pl) {
      q = p - 0.5; r = q * q;
      x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
          (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    var e = pnorm(x, true) - p;
    var u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }

  function poly(cc, nord, x) {   // AS 181.2
    var ret = cc[0], p, j;
    if (nord > 1) {
      p = x * cc[nord - 1];
      for (j = nord - 2; j > 0; j--) { p = (p + cc[j]) * x; }
      ret += p;
    }
    return ret;
  }
  function sign(v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); }

  // x: numeric array, any order; returns {W, p}. Valid for 3 <= n <= 5000.
  function shapiroWilk(xin) {
    var x = xin.slice().sort(function (p, q) { return p - q; });
    var n = x.length, nn2 = Math.floor(n / 2), a = new Array(nn2 + 1), i, j, i1;
    var small = 1e-19;
    var g = [-2.273, 0.459];
    var c1 = [0, 0.221157, -0.147981, -2.07119, 4.434685, -2.706056];
    var c2 = [0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633];
    var c3 = [0.544, -0.39978, 0.025054, -6.714e-4];
    var c4 = [1.3822, -0.77857, 0.062767, -0.0020322];
    var c5 = [-1.5861, -0.31082, -0.083751, 0.0038915];
    var c6 = [-0.4803, -0.082676, 0.0030302];
    var an = n, an25, summ2, ssumm2, rsn, a1, a2, fac, range, xx, sx, sa, xi;
    var ssa, ssx, sax, asa, xsx, ssassx, w1, w, y, m, s, gamma, pw;
    if (n < 3) { return { W: NaN, p: NaN }; }
    if (n === 3) {
      a[1] = 0.70710678;
    } else {
      an25 = an + 0.25; summ2 = 0;
      for (i = 1; i <= nn2; i++) { a[i] = qnorm((i - 0.375) / an25); summ2 += a[i] * a[i]; }
      summ2 *= 2; ssumm2 = Math.sqrt(summ2); rsn = 1 / Math.sqrt(an);
      a1 = poly(c1, 6, rsn) - a[1] / ssumm2;
      if (n > 5) {
        i1 = 3;
        a2 = -a[2] / ssumm2 + poly(c2, 6, rsn);
        fac = Math.sqrt((summ2 - 2 * a[1] * a[1] - 2 * a[2] * a[2]) / (1 - 2 * a1 * a1 - 2 * a2 * a2));
        a[2] = a2;
      } else {
        i1 = 2;
        fac = Math.sqrt((summ2 - 2 * a[1] * a[1]) / (1 - 2 * a1 * a1));
      }
      a[1] = a1;
      for (i = i1; i <= nn2; i++) { a[i] /= -fac; }
    }
    range = x[n - 1] - x[0];
    if (range < small) { return { W: NaN, p: NaN }; }
    xx = x[0] / range; sx = xx; sa = -a[1];
    for (i = 1, j = n - 1; i < n; j--) {
      xi = x[i] / range;
      sx += xi;
      i += 1;
      if (i !== j) { sa += sign(i - j) * a[Math.min(i, j)]; }
      xx = xi;
    }
    sa /= n; sx /= n;
    ssa = ssx = sax = 0;
    for (i = 0, j = n - 1; i < n; i++, j--) {
      asa = (i !== j) ? sign(i - j) * a[1 + Math.min(i, j)] - sa : -sa;
      xsx = x[i] / range - sx;
      ssa += asa * asa; ssx += xsx * xsx; sax += asa * xsx;
    }
    ssassx = Math.sqrt(ssa * ssx);
    w1 = (ssassx - sax) * (ssassx + sax) / (ssa * ssx);
    w = 1 - w1;
    if (n === 3) {
      pw = 1.90985931710274 * (Math.asin(Math.sqrt(w)) - 1.04719755119660);
      return { W: w, p: Math.max(pw, 0) };
    }
    y = Math.log(w1); xx = Math.log(an);
    if (n <= 11) {
      gamma = poly(g, 2, an);
      if (y >= gamma) { return { W: w, p: 1e-99 }; }
      y = -Math.log(gamma - y);
      m = poly(c3, 4, an); s = Math.exp(poly(c4, 4, an));
    } else {
      m = poly(c5, 4, xx); s = Math.exp(poly(c6, 3, xx));
    }
    pw = pnorm((y - m) / s, false);
    return { W: w, p: pw };
  }

  // Kolmogorov-Smirnov with mean and sd estimated (Lilliefors); n >= 5
  function lilliefors(xin) {
    var x = xin.slice().sort(function (p, q) { return p - q; });
    var n = x.length, i, mean = 0, sd = 0, Dp = -Infinity, Dm = -Infinity, pz, K, Kd, nd, pv, KK;
    for (i = 0; i < n; i++) { mean += x[i]; }
    mean /= n;
    for (i = 0; i < n; i++) { sd += (x[i] - mean) * (x[i] - mean); }
    sd = Math.sqrt(sd / (n - 1));
    for (i = 0; i < n; i++) {
      pz = pnorm((x[i] - mean) / sd, true);
      Dp = Math.max(Dp, (i + 1) / n - pz);
      Dm = Math.max(Dm, pz - i / n);
    }
    K = Math.max(Dp, Dm);
    if (n <= 100) { Kd = K; nd = n; } else { Kd = K * Math.pow(n / 100, 0.49); nd = 100; }
    pv = Math.exp(-7.01256 * Kd * Kd * (nd + 2.78019) + 2.99587 * Kd * Math.sqrt(nd + 2.78019) -
                  0.122119 + 0.974598 / Math.sqrt(nd) + 1.67997 / nd);
    if (pv > 0.1) {
      KK = (Math.sqrt(n) - 0.01 + 0.85 / Math.sqrt(n)) * K;
      if (KK <= 0.302) { pv = 1; }
      else if (KK <= 0.5) { pv = 2.76773 - 19.828315 * KK + 80.709644 * KK * KK - 138.55152 * Math.pow(KK, 3) + 81.218052 * Math.pow(KK, 4); }
      else if (KK <= 0.9) { pv = -4.901232 + 40.662806 * KK - 97.490286 * KK * KK + 94.029866 * Math.pow(KK, 3) - 32.355711 * Math.pow(KK, 4); }
      else if (KK <= 1.31) { pv = 6.198765 - 19.558097 * KK + 23.186922 * KK * KK - 12.234627 * Math.pow(KK, 3) + 2.423045 * Math.pow(KK, 4); }
      else { pv = 0; }
    }
    return { D: K, p: pv };
  }

  return { erfc: erfc, pnorm: pnorm, qnorm: qnorm, shapiroWilk: shapiroWilk, lilliefors: lilliefors };
})();
if (typeof module !== "undefined") { module.exports = NormTests; }
