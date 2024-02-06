"use strict";
var w = Object.defineProperty;
var P = Object.getOwnPropertyDescriptor;
var q = Object.getOwnPropertyNames;
var V = Object.prototype.hasOwnProperty;
var C = (s, r, t) => r in s ? w(s, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[r] = t;
var $ = (s, r) => {
  for (var t in r)
    w(s, t, { get: r[t], enumerable: !0 });
}, D = (s, r, t, e) => {
  if (r && typeof r == "object" || typeof r == "function")
    for (let n of q(r))
      !V.call(s, n) && n !== t && w(s, n, { get: () => r[n], enumerable: !(e = P(r, n)) || e.enumerable });
  return s;
};
var G = (s) => D(w({}, "__esModule", { value: !0 }), s);
var i = (s, r, t) => (C(s, typeof r != "symbol" ? r + "" : r, t), t);

// src/index.ts
var Z = {};
$(Z, {
  Bench: () => m,
  Task: () => p,
  default: () => Y,
  hrtimeNow: () => R,
  now: () => E
});
module.exports = G(Z);

// src/event.ts
function a(s, r = null) {
  let t = new Event(s);
  return Object.defineProperty(t, "task", {
    value: r,
    enumerable: !0,
    writable: !1,
    configurable: !1
  }), t;
}

// src/constants.ts
var J = {
  1: 12.71,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228,
  11: 2.201,
  12: 2.179,
  13: 2.16,
  14: 2.145,
  15: 2.131,
  16: 2.12,
  17: 2.11,
  18: 2.101,
  19: 2.093,
  20: 2.086,
  21: 2.08,
  22: 2.074,
  23: 2.069,
  24: 2.064,
  25: 2.06,
  26: 2.056,
  27: 2.052,
  28: 2.048,
  29: 2.045,
  30: 2.042,
  31: 2.0399,
  32: 2.0378,
  33: 2.0357,
  34: 2.0336,
  35: 2.0315,
  36: 2.0294,
  37: 2.0273,
  38: 2.0252,
  39: 2.0231,
  40: 2.021,
  41: 2.0198,
  42: 2.0186,
  43: 2.0174,
  44: 2.0162,
  45: 2.015,
  46: 2.0138,
  47: 2.0126,
  48: 2.0114,
  49: 2.0102,
  50: 2.009,
  51: 2.0081,
  52: 2.0072,
  53: 2.0063,
  54: 2.0054,
  55: 2.0045,
  56: 2.0036,
  57: 2.0027,
  58: 2.0018,
  59: 2.0009,
  60: 2,
  61: 1.9995,
  62: 1.999,
  63: 1.9985,
  64: 1.998,
  65: 1.9975,
  66: 1.997,
  67: 1.9965,
  68: 1.996,
  69: 1.9955,
  70: 1.995,
  71: 1.9945,
  72: 1.994,
  73: 1.9935,
  74: 1.993,
  75: 1.9925,
  76: 1.992,
  77: 1.9915,
  78: 1.991,
  79: 1.9905,
  80: 1.99,
  81: 1.9897,
  82: 1.9894,
  83: 1.9891,
  84: 1.9888,
  85: 1.9885,
  86: 1.9882,
  87: 1.9879,
  88: 1.9876,
  89: 1.9873,
  90: 1.987,
  91: 1.9867,
  92: 1.9864,
  93: 1.9861,
  94: 1.9858,
  95: 1.9855,
  96: 1.9852,
  97: 1.9849,
  98: 1.9846,
  99: 1.9843,
  100: 1.984,
  101: 1.9838,
  102: 1.9836,
  103: 1.9834,
  104: 1.9832,
  105: 1.983,
  106: 1.9828,
  107: 1.9826,
  108: 1.9824,
  109: 1.9822,
  110: 1.982,
  111: 1.9818,
  112: 1.9816,
  113: 1.9814,
  114: 1.9812,
  115: 1.9819,
  116: 1.9808,
  117: 1.9806,
  118: 1.9804,
  119: 1.9802,
  120: 1.98,
  infinity: 1.96
}, g = J;

// src/utils.ts
var Q = (s) => s / 1e6, R = () => Q(Number(process.hrtime.bigint())), E = () => performance.now();
function U(s) {
  return s !== null && typeof s == "object" && typeof s.then == "function";
}
var O = (s) => s.reduce((r, t) => r + t, 0) / s.length || 0, F = (s, r) => s.reduce((e, n) => e + (n - r) ** 2, 0) / (s.length - 1) || 0, W = (async () => {
}).constructor, X = (s) => s.constructor === W, k = async (s) => {
  if (X(s.fn))
    return !0;
  try {
    if (s.opts.beforeEach != null)
      try {
        await s.opts.beforeEach.call(s);
      } catch (e) {
      }
    let r = s.fn(), t = U(r);
    if (t)
      try {
        await r;
      } catch (e) {
      }
    if (s.opts.afterEach != null)
      try {
        await s.opts.afterEach.call(s);
      } catch (e) {
      }
    return t;
  } catch (r) {
    return !1;
  }
};

// src/task.ts
var p = class extends EventTarget {
  constructor(t, e, n, h = {}) {
    super();
    i(this, "bench");
    i(this, "name");
    i(this, "fn");
    i(this, "runs", 0);
    i(this, "result");
    i(this, "opts");
    this.bench = t, this.name = e, this.fn = n, this.opts = h;
  }
  async run() {
    var h, c, f, d;
    this.dispatchEvent(a("start", this));
    let t = 0, e = [];
    if (await this.bench.setup(this, "run"), this.opts.beforeAll != null)
      try {
        await this.opts.beforeAll.call(this);
      } catch (o) {
        this.setResult({ error: o });
      }
    let n = await k(this);
    try {
      for (; (t < this.bench.time || this.runs < this.bench.iterations) && !((h = this.bench.signal) != null && h.aborted); ) {
        this.opts.beforeEach != null && await this.opts.beforeEach.call(this);
        let o = 0;
        if (n) {
          let l = this.bench.now();
          await this.fn.call(this), o = this.bench.now() - l;
        } else {
          let l = this.bench.now();
          this.fn.call(this), o = this.bench.now() - l;
        }
        e.push(o), this.runs += 1, t += o, this.opts.afterEach != null && await this.opts.afterEach.call(this);
      }
    } catch (o) {
      if (this.setResult({ error: o }), this.bench.throws)
        throw o;
    }
    if (this.opts.afterAll != null)
      try {
        await this.opts.afterAll.call(this);
      } catch (o) {
        this.setResult({ error: o });
      }
    if (await this.bench.teardown(this, "run"), !((c = this.result) != null && c.error)) {
      e.sort((j, z) => j - z);
      let o = t / this.runs, l = 1e3 / o, u = e.length, b = u - 1, B = e[0], K = e[b], T = O(e), y = F(e, T), A = Math.sqrt(y), x = A / Math.sqrt(u), L = g[String(Math.round(b) || 1)] || g.infinity, M = x * L, N = M / T * 100, _ = e[Math.ceil(u * 0.75) - 1], S = e[Math.ceil(u * 0.99) - 1], I = e[Math.ceil(u * 0.995) - 1], H = e[Math.ceil(u * 0.999) - 1];
      if ((f = this.bench.signal) != null && f.aborted)
        return this;
      this.setResult({
        totalTime: t,
        min: B,
        max: K,
        hz: l,
        period: o,
        samples: e,
        mean: T,
        variance: y,
        sd: A,
        sem: x,
        df: b,
        critical: L,
        moe: M,
        rme: N,
        p75: _,
        p99: S,
        p995: I,
        p999: H
      });
    }
    return (d = this.result) != null && d.error && (this.dispatchEvent(a("error", this)), this.bench.dispatchEvent(a("error", this))), this.dispatchEvent(a("cycle", this)), this.bench.dispatchEvent(a("cycle", this)), this.dispatchEvent(a("complete", this)), this;
  }
  async warmup() {
    var h;
    this.dispatchEvent(a("warmup", this));
    let t = this.bench.now(), e = 0;
    if (await this.bench.setup(this, "warmup"), this.opts.beforeAll != null)
      try {
        await this.opts.beforeAll.call(this);
      } catch (c) {
        this.setResult({ error: c });
      }
    let n = await k(this);
    for (; (e < this.bench.warmupTime || this.runs < this.bench.warmupIterations) && !((h = this.bench.signal) != null && h.aborted); ) {
      if (this.opts.beforeEach != null)
        try {
          await this.opts.beforeEach.call(this);
        } catch (c) {
          this.setResult({ error: c });
        }
      try {
        n ? await this.fn.call(this) : this.fn.call(this);
      } catch (c) {
        if (this.bench.throws)
          throw c;
      }
      if (this.runs += 1, e = this.bench.now() - t, this.opts.afterEach != null)
        try {
          await this.opts.afterEach.call(this);
        } catch (c) {
          this.setResult({ error: c });
        }
    }
    if (this.opts.afterAll != null)
      try {
        await this.opts.afterAll.call(this);
      } catch (c) {
        this.setResult({ error: c });
      }
    this.bench.teardown(this, "warmup"), this.runs = 0;
  }
  addEventListener(t, e, n) {
    super.addEventListener(t, e, n);
  }
  removeEventListener(t, e, n) {
    super.removeEventListener(t, e, n);
  }
  setResult(t) {
    this.result = { ...this.result, ...t }, Object.freeze(this.reset);
  }
  reset() {
    this.dispatchEvent(a("reset", this)), this.runs = 0, this.result = void 0;
  }
};

// src/bench.ts
var m = class extends EventTarget {
  constructor(t = {}) {
    var e, n, h, c, f, d, o, l;
    super();
    i(this, "_tasks", /* @__PURE__ */ new Map());
    i(this, "_todos", /* @__PURE__ */ new Map());
    i(this, "signal");
    i(this, "throws");
    i(this, "warmupTime", 100);
    i(this, "warmupIterations", 5);
    i(this, "time", 500);
    i(this, "iterations", 10);
    i(this, "now", E);
    i(this, "setup");
    i(this, "teardown");
    this.now = (e = t.now) != null ? e : this.now, this.warmupTime = (n = t.warmupTime) != null ? n : this.warmupTime, this.warmupIterations = (h = t.warmupIterations) != null ? h : this.warmupIterations, this.time = (c = t.time) != null ? c : this.time, this.iterations = (f = t.iterations) != null ? f : this.iterations, this.signal = t.signal, this.throws = (d = t.throws) != null ? d : !1, this.setup = (o = t.setup) != null ? o : () => {
    }, this.teardown = (l = t.teardown) != null ? l : () => {
    }, this.signal && this.signal.addEventListener(
      "abort",
      () => {
        this.dispatchEvent(a("abort"));
      },
      { once: !0 }
    );
  }
  async run() {
    var e;
    this.dispatchEvent(a("start"));
    let t = [];
    for (let n of [...this._tasks.values()])
      (e = this.signal) != null && e.aborted ? t.push(n) : t.push(await n.run());
    return this.dispatchEvent(a("complete")), t;
  }
  async warmup() {
    this.dispatchEvent(a("warmup"));
    for (let [, t] of this._tasks)
      await t.warmup();
  }
  reset() {
    this.dispatchEvent(a("reset")), this._tasks.forEach((t) => {
      t.reset();
    });
  }
  add(t, e, n = {}) {
    let h = new p(this, t, e, n);
    return this._tasks.set(t, h), this.dispatchEvent(a("add", h)), this;
  }
  todo(t, e = () => {
  }, n = {}) {
    let h = new p(this, t, e, n);
    return this._todos.set(t, h), this.dispatchEvent(a("todo", h)), this;
  }
  remove(t) {
    let e = this.getTask(t);
    return e && (this.dispatchEvent(a("remove", e)), this._tasks.delete(t)), this;
  }
  addEventListener(t, e, n) {
    super.addEventListener(t, e, n);
  }
  removeEventListener(t, e, n) {
    super.removeEventListener(t, e, n);
  }
  table() {
    return this.tasks.map(({ name: t, result: e }) => e ? {
      "Task Name": t,
      "ops/sec": e.error ? "NaN" : parseInt(e.hz.toString(), 10).toLocaleString(),
      "Average Time (ns)": e.error ? "NaN" : e.mean * 1e3 * 1e3,
      Margin: e.error ? "NaN" : `\xB1${e.rme.toFixed(2)}%`,
      Samples: e.error ? "NaN" : e.samples.length
    } : null);
  }
  get results() {
    return [...this._tasks.values()].map((t) => t.result);
  }
  get tasks() {
    return [...this._tasks.values()];
  }
  get todos() {
    return [...this._todos.values()];
  }
  getTask(t) {
    return this._tasks.get(t);
  }
};

// src/index.ts
var Y = m;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bench,
  Task,
  hrtimeNow,
  now
});
