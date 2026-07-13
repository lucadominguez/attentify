import { r as reactExports, j as jsxRuntimeExports, a as createLucideIcon, R as React, c as client } from "./globals-DSWNc6k-.js";
import { S as Shield, B as Brain, Z as Zap, A as AlertTriangle, X, E as Eye } from "./zap-C62FHR_-.js";
import { C as Clock, a as Coffee } from "./coffee-DLH0B9O_.js";
const DARK = {
  rootBg: "#020912",
  mainBg: "#030c1a",
  panelBg: "rgba(4,11,22,0.97)",
  cardBg: "rgba(6,14,28,0.92)",
  inputBg: "rgba(3,9,18,0.98)",
  rowEven: "rgba(4,11,22,0.8)",
  rowOdd: "rgba(6,15,28,0.5)",
  textPrimary: "#e8e8e8",
  textSecondary: "#9a9a9a",
  textMuted: "#6a6a6a",
  textDim: "#4a4a4a",
  accent: "#6366f1",
  accentBg: "rgba(99,102,241,0.06)",
  accentGlow: "rgba(99,102,241,0.4)",
  brand: "#3b9eff",
  positive: "#34d399",
  positiveBg: "rgba(52,211,153,0.10)",
  warning: "#fbbf24",
  warningBg: "rgba(251,191,36,0.10)",
  negative: "#f87171",
  negativeBg: "rgba(248,113,113,0.10)",
  border: "rgba(99,102,241,0.16)",
  borderMid: "rgba(99,102,241,0.35)",
  borderHi: "rgba(99,102,241,0.65)",
  label: "#8a8a8a",
  labelDim: "#5a5a5a",
  userBubbleBg: "rgba(0,144,180,0.12)",
  userBubbleBorder: "rgba(99,102,241,0.28)",
  userBubbleText: "#e8e8e8",
  aiBubbleBg: "rgba(4,11,22,0.97)",
  aiBubbleBorder: "rgba(99,102,241,0.16)",
  aiBubbleText: "#d0d0d0"
};
const LIGHT = {
  rootBg: "#f4f7fb",
  mainBg: "#edf1f7",
  panelBg: "rgba(255,255,255,0.98)",
  cardBg: "rgba(250,251,253,0.97)",
  inputBg: "rgba(255,255,255,0.98)",
  rowEven: "rgba(246,248,252,0.95)",
  rowOdd: "rgba(238,242,250,0.65)",
  textPrimary: "#111111",
  textSecondary: "#555555",
  textMuted: "#888888",
  textDim: "#aaaaaa",
  accent: "#4f46e5",
  accentBg: "rgba(79,70,229,0.06)",
  accentGlow: "rgba(79,70,229,0.3)",
  brand: "#2563eb",
  positive: "#059669",
  positiveBg: "rgba(5,150,105,0.10)",
  warning: "#d97706",
  warningBg: "rgba(217,119,6,0.10)",
  negative: "#dc2626",
  negativeBg: "rgba(220,38,38,0.10)",
  border: "rgba(0,0,0,0.1)",
  borderMid: "rgba(0,0,0,0.2)",
  borderHi: "rgba(0,0,0,0.35)",
  label: "#444444",
  labelDim: "#888888",
  userBubbleBg: "rgba(0,100,180,0.08)",
  userBubbleBorder: "rgba(0,0,0,0.12)",
  userBubbleText: "#111111",
  aiBubbleBg: "rgba(255,255,255,0.98)",
  aiBubbleBorder: "rgba(0,0,0,0.1)",
  aiBubbleText: "#1a1a1a"
};
function applyCssVars(c) {
  const el = document.documentElement;
  el.style.setProperty("--root-bg", c.rootBg);
  el.style.setProperty("--main-bg", c.mainBg);
  el.style.setProperty("--panel-bg", c.panelBg);
  el.style.setProperty("--card-bg", c.cardBg);
  el.style.setProperty("--input-bg", c.inputBg);
  el.style.setProperty("--row-even", c.rowEven);
  el.style.setProperty("--row-odd", c.rowOdd);
  el.style.setProperty("--text-primary", c.textPrimary);
  el.style.setProperty("--text-secondary", c.textSecondary);
  el.style.setProperty("--text-muted", c.textMuted);
  el.style.setProperty("--text-dim", c.textDim);
  el.style.setProperty("--accent", c.accent);
  el.style.setProperty("--accent-bg", c.accentBg);
  el.style.setProperty("--accent-glow", c.accentGlow);
  el.style.setProperty("--brand", c.brand);
  el.style.setProperty("--positive", c.positive);
  el.style.setProperty("--positive-bg", c.positiveBg);
  el.style.setProperty("--warning", c.warning);
  el.style.setProperty("--warning-bg", c.warningBg);
  el.style.setProperty("--negative", c.negative);
  el.style.setProperty("--negative-bg", c.negativeBg);
  el.style.setProperty("--border", c.border);
  el.style.setProperty("--border-mid", c.borderMid);
  el.style.setProperty("--border-hi", c.borderHi);
  el.style.setProperty("--label", c.label);
  el.style.setProperty("--label-dim", c.labelDim);
}
const ThemeContext = reactExports.createContext({
  theme: "dark",
  colors: DARK,
  toggle: () => {
  }
});
function ThemeProvider({ children }) {
  const [theme, setTheme] = reactExports.useState(() => {
    const stored = localStorage.getItem("pd-theme");
    if (stored === "dark" || stored === "light") return stored;
    try {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  reactExports.useEffect(() => {
    const colors2 = theme === "dark" ? DARK : LIGHT;
    applyCssVars(colors2);
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("pd-theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => t === "dark" ? "light" : "dark");
  const colors = theme === "dark" ? DARK : LIGHT;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeContext.Provider, { value: { theme, colors, toggle }, children });
}
function useTheme() {
  return reactExports.useContext(ThemeContext);
}
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Activity = createLucideIcon("Activity", [
  ["path", { d: "M22 12h-4l-3 9L9 3l-3 9H2", key: "d5dnw9" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const AlertCircle = createLucideIcon("AlertCircle", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowDown = createLucideIcon("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowRight = createLucideIcon("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BarChart2 = createLucideIcon("BarChart2", [
  ["line", { x1: "18", x2: "18", y1: "20", y2: "10", key: "1xfpm4" }],
  ["line", { x1: "12", x2: "12", y1: "20", y2: "4", key: "be30l9" }],
  ["line", { x1: "6", x2: "6", y1: "20", y2: "14", key: "1r4le6" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bell = createLucideIcon("Bell", [
  ["path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", key: "1qo2s2" }],
  ["path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0", key: "qgo35s" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Calendar = createLucideIcon("Calendar", [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2", key: "eu3xkr" }],
  ["line", { x1: "16", x2: "16", y1: "2", y2: "6", key: "m3sa8f" }],
  ["line", { x1: "8", x2: "8", y1: "2", y2: "6", key: "18kwsl" }],
  ["line", { x1: "3", x2: "21", y1: "10", y2: "10", key: "xt86sb" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CheckCircle2 = createLucideIcon("CheckCircle2", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CheckCircle = createLucideIcon("CheckCircle", [
  ["path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14", key: "g774vq" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Check = createLucideIcon("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronDown = createLucideIcon("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronLeft = createLucideIcon("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronRight = createLucideIcon("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronUp = createLucideIcon("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cpu = createLucideIcon("Cpu", [
  ["rect", { x: "4", y: "4", width: "16", height: "16", rx: "2", key: "1vbyd7" }],
  ["rect", { x: "9", y: "9", width: "6", height: "6", key: "o3kz5p" }],
  ["path", { d: "M15 2v2", key: "13l42r" }],
  ["path", { d: "M15 20v2", key: "15mkzm" }],
  ["path", { d: "M2 15h2", key: "1gxd5l" }],
  ["path", { d: "M2 9h2", key: "1bbxkp" }],
  ["path", { d: "M20 15h2", key: "19e6y8" }],
  ["path", { d: "M20 9h2", key: "19tzq7" }],
  ["path", { d: "M9 2v2", key: "165o2o" }],
  ["path", { d: "M9 20v2", key: "i2bqo8" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Download = createLucideIcon("Download", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
  ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Globe = createLucideIcon("Globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const History = createLucideIcon("History", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Info = createLucideIcon("Info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Key = createLucideIcon("Key", [
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["path", { d: "m15.5 7.5 3 3L22 7l-3-3", key: "1rn1fs" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lightbulb = createLucideIcon("Lightbulb", [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      key: "1gvzjb"
    }
  ],
  ["path", { d: "M9 18h6", key: "x1upvd" }],
  ["path", { d: "M10 22h4", key: "ceow96" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ListChecks = createLucideIcon("ListChecks", [
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }],
  ["path", { d: "M13 6h8", key: "15sg57" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 18h8", key: "oe0vm4" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Loader = createLucideIcon("Loader", [
  ["line", { x1: "12", x2: "12", y1: "2", y2: "6", key: "gza1u7" }],
  ["line", { x1: "12", x2: "12", y1: "18", y2: "22", key: "1qhbu9" }],
  ["line", { x1: "4.93", x2: "7.76", y1: "4.93", y2: "7.76", key: "xae44r" }],
  ["line", { x1: "16.24", x2: "19.07", y1: "16.24", y2: "19.07", key: "bxnmvf" }],
  ["line", { x1: "2", x2: "6", y1: "12", y2: "12", key: "89khin" }],
  ["line", { x1: "18", x2: "22", y1: "12", y2: "12", key: "pb8tfm" }],
  ["line", { x1: "4.93", x2: "7.76", y1: "19.07", y2: "16.24", key: "1uxjnu" }],
  ["line", { x1: "16.24", x2: "19.07", y1: "7.76", y2: "4.93", key: "6duxfx" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lock = createLucideIcon("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MessageSquare = createLucideIcon("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Minus = createLucideIcon("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Moon = createLucideIcon("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Paperclip = createLucideIcon("Paperclip", [
  [
    "path",
    {
      d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48",
      key: "1u3ebp"
    }
  ]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Play = createLucideIcon("Play", [
  ["polygon", { points: "5 3 19 12 5 21 5 3", key: "191637" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Plus = createLucideIcon("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RefreshCw = createLucideIcon("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RotateCcw = createLucideIcon("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rss = createLucideIcon("Rss", [
  ["path", { d: "M4 11a9 9 0 0 1 9 9", key: "pv89mb" }],
  ["path", { d: "M4 4a16 16 0 0 1 16 16", key: "k0647b" }],
  ["circle", { cx: "5", cy: "19", r: "1", key: "bfqh0e" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ScanLine = createLucideIcon("ScanLine", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["path", { d: "M7 12h10", key: "b7w52i" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Search = createLucideIcon("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Send = createLucideIcon("Send", [
  ["path", { d: "m22 2-7 20-4-9-9-4Z", key: "1q3vgg" }],
  ["path", { d: "M22 2 11 13", key: "nzbqef" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Settings = createLucideIcon("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sparkles = createLucideIcon("Sparkles", [
  [
    "path",
    {
      d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
      key: "17u4zn"
    }
  ],
  ["path", { d: "M5 3v4", key: "bklmnn" }],
  ["path", { d: "M19 17v4", key: "iiml17" }],
  ["path", { d: "M3 5h4", key: "nem4j1" }],
  ["path", { d: "M17 19h4", key: "lbex7p" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Square = createLucideIcon("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sun = createLucideIcon("Sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Target = createLucideIcon("Target", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ToggleLeft = createLucideIcon("ToggleLeft", [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6", key: "f2vt7d" }],
  ["circle", { cx: "8", cy: "12", r: "2", key: "1nvbw3" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ToggleRight = createLucideIcon("ToggleRight", [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6", key: "f2vt7d" }],
  ["circle", { cx: "16", cy: "12", r: "2", key: "4ma0v8" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Trash2 = createLucideIcon("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const TrendingUp = createLucideIcon("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const User = createLucideIcon("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WifiOff = createLucideIcon("WifiOff", [
  ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
  ["path", { d: "M8.5 16.5a5 5 0 0 1 7 0", key: "sej527" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 4.17-2.65", key: "11utq1" }],
  ["path", { d: "M10.66 5c4.01-.36 8.14.9 11.34 3.76", key: "hxefdu" }],
  ["path", { d: "M16.85 11.25a10 10 0 0 1 2.22 1.68", key: "q734kn" }],
  ["path", { d: "M5 13a10 10 0 0 1 5.24-2.76", key: "piq4yl" }],
  ["line", { x1: "12", x2: "12.01", y1: "20", y2: "20", key: "of4bc4" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const XCircle = createLucideIcon("XCircle", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
]);
const logoUrl = "" + new URL("logo-D9AbOcxs.png", import.meta.url).href;
function BrandMark({
  size = 28,
  className,
  style,
  rounded = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className,
      style: {
        width: size,
        height: size,
        borderRadius: rounded ? Math.max(4, size * 0.22) : 0,
        overflow: "hidden",
        background: "#fff",
        flexShrink: 0,
        boxShadow: rounded ? "0 0 0 1px rgba(255,255,255,0.06)" : "none",
        ...style
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: logoUrl,
          alt: "Attentify",
          width: size,
          height: size,
          style: { display: "block", width: "100%", height: "100%", objectFit: "cover" },
          draggable: false
        }
      )
    }
  );
}
const api$f = window.electronAPI;
const mainNav = [
  { id: "home", label: "Assistant", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 15 }), desc: "Chat with Attentify — block sites, start focus, ask about your day" },
  { id: "analytics", label: "Analytics", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart2, { size: 15 }), desc: "Charts, patterns, alerts — and describe any custom analytics you want" },
  { id: "logic", label: "Logic", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 15 }), desc: "How Attentify reasons about you — and add your own context" },
  { id: "timesheets", label: "Timesheets", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 15 }), desc: "Time logged per app and category, day by day" },
  { id: "focus-shield", label: "Protection", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 15 }), desc: "Blocklists, feed blocks, and the activity log" },
  { id: "deep-focus", label: "Deep Focus", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 15 }), desc: "Lock out distractions for a set time" },
  { id: "actions", label: "Actions", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { size: 15 }), desc: "Review and approve flagged distractions" }
];
const utilityNav = [
  { id: "deep-clean", label: "Deep Clean", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 15 }), desc: "Scan this device for installed distractions" },
  { id: "schedule-manager", label: "Scheduler", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 15 }), desc: "Block automatically on a recurring schedule" },
  { id: "settings", label: "Settings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 15 }), desc: "Blocking mode, AI key, and preferences" }
];
function Sidebar({
  currentView,
  onNavigate,
  onChatOpen,
  activeSession,
  elevation,
  alertCount = 0,
  pendingActionCount = 0
}) {
  const { colors } = useTheme();
  const [relaunching, setRelaunching] = reactExports.useState(false);
  const handleRelaunch = async () => {
    setRelaunching(true);
    try {
      await api$f.relaunchAsAdmin();
    } catch {
      setRelaunching(false);
    }
  };
  const renderItem = (item) => {
    const isActive = currentView === item.id;
    const badge = item.id === "analytics" && alertCount > 0 ? { n: alertCount, color: "#fbbf24" } : item.id === "actions" && pendingActionCount > 0 ? { n: pendingActionCount, color: "#fbbf24" } : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onNavigate(item.id),
        title: item.desc,
        className: `sidebar-item w-full text-left ${isActive ? "active" : ""}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "flex-shrink-0",
              style: { color: isActive ? colors.accent : colors.textMuted, transition: "color 0.15s" },
              children: item.icon
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: item.label }),
          badge && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "flex-shrink-0 flex items-center justify-center text-[9px] font-bold rounded-full",
              style: {
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                background: `${badge.color}22`,
                border: `1px solid ${badge.color}80`,
                color: badge.color
              },
              children: badge.n > 9 ? "9+" : badge.n
            }
          )
        ]
      },
      item.id
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "aside",
    {
      className: "flex flex-col flex-shrink-0 h-full overflow-hidden",
      style: {
        width: 220,
        background: colors.panelBg,
        borderRight: `1px solid ${colors.border}`,
        transition: "background 0.2s ease"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2.5 px-4 flex-shrink-0",
            style: { height: 56, borderBottom: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 relative", style: { width: 26, height: 26 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { size: 26 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-[15px] font-semibold leading-none",
                  style: { color: colors.textPrimary, letterSpacing: "0.01em" },
                  children: "Attentify"
                }
              ) }),
              elevation === "full" && activeSession && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex-shrink-0 w-1.5 h-1.5 rounded-full",
                  style: { background: "#34d399", boxShadow: "0 0 6px #34d399" },
                  title: "Full protection active"
                }
              ),
              (elevation === "soft" || elevation === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex-shrink-0 w-1.5 h-1.5 rounded-full",
                  style: { background: "#fbbf24", boxShadow: "0 0 6px #fbbf24" },
                  title: "Soft mode — limited protection"
                }
              )
            ]
          }
        ),
        (elevation === "soft" || elevation === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "mx-3 mt-2.5 flex-shrink-0 rounded-lg",
            style: {
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.22)",
              padding: "8px 10px"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-1 rounded-full", style: { background: "#fbbf24" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold", style: { color: "#fbbf24" }, children: "Blocking disabled" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed mb-2", style: { color: colors.textMuted }, children: "Admin rights are required for site blocking." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleRelaunch,
                  disabled: relaunching,
                  className: "w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded-md transition-all disabled:opacity-60",
                  style: {
                    background: colors.accentBg,
                    color: colors.accent,
                    border: `1px solid ${colors.borderMid}`
                  },
                  children: relaunching ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 11, className: "animate-spin" }),
                    " Relaunching…"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 11 }),
                    " Enable protection"
                  ] })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex-1 overflow-y-auto pt-3 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1", children: mainNav.map(renderItem) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 mb-1.5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-label", children: "Utilities" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: colors.border } })
            ] }),
            utilityNav.map(renderItem)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 p-3", style: { borderTop: `1px solid ${colors.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onNavigate("home"),
            className: "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-all hover:brightness-110",
            style: {
              background: colors.accentBg,
              border: `1px solid ${colors.borderMid}`,
              color: colors.accent
            },
            title: "Open the Attentify assistant",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 13 }),
              "Ask Attentify"
            ]
          }
        ) })
      ]
    }
  );
}
const api$e = window.electronAPI;
function formatExpiry(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return "expired";
  const m = Math.floor(diff / 6e4);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m left`;
  return `${m}m left`;
}
function formatMs(ms) {
  const h = Math.floor(ms / 36e5);
  const m = Math.floor(ms % 36e5 / 6e4);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function relativeDate(ts) {
  const now = /* @__PURE__ */ new Date();
  const d = new Date(ts);
  const todayStr = now.toISOString().split("T")[0];
  const dStr = d.toISOString().split("T")[0];
  if (dStr === todayStr) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dStr === yesterday.toISOString().split("T")[0]) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];
const DOMAIN_SUGGESTIONS = ["twitter.com", "instagram.com", "reddit.com", "youtube.com", "tiktok.com", "facebook.com"];
const PROCESS_SUGGESTIONS = ["Discord", "Steam", "Spotify", "Slack", "Telegram"];
const CAT_COLOR$2 = {
  browser: "#3b9eff",
  social: "#f87171",
  entertainment: "#f87171",
  gaming: "#ff6b35",
  productivity: "#34d399",
  communication: "#fbbf24",
  development: "#34d399",
  system: "#546e7a",
  other: "#455a64"
};
function categoryLabel(cat) {
  const labels = {
    browser: "Browser",
    social: "Social",
    entertainment: "Entertainment",
    gaming: "Gaming",
    productivity: "Productivity",
    communication: "Comms",
    development: "Dev",
    system: "System",
    other: "Other"
  };
  return labels[cat];
}
function cleanTitle(title, app) {
  let t = title;
  const appName = app.replace(/\.exe$/i, "");
  t = t.replace(new RegExp(`\\s*[-–|]\\s*${appName}\\s*$`, "i"), "");
  t = t.replace(/\s*[-–|]\s*(Google Chrome|Firefox|Microsoft Edge|Safari|Opera|Brave)\s*$/i, "");
  return t.trim() || app;
}
function Overview({ store, onRefresh, onChatWith }) {
  const { colors } = useTheme();
  const [newDomain, setNewDomain] = reactExports.useState("");
  const [newProcess, setNewProcess] = reactExports.useState("");
  const [adding, setAdding] = reactExports.useState(null);
  const [todayStats, setTodayStats] = reactExports.useState(null);
  const [activitySessions, setActivitySessions] = reactExports.useState([]);
  const [now, setNow] = reactExports.useState(Date.now());
  const [showAll, setShowAll] = reactExports.useState(false);
  const activeSession = store.sessions.find((s) => s.active);
  const isShieldOn = !!activeSession || store.elevation === "full" && store.blocklist.domains.length > 0;
  reactExports.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1e4);
    return () => clearInterval(id);
  }, []);
  reactExports.useEffect(() => {
    api$e.getAnalytics().then((data) => {
      setTodayStats({
        focusScore: data.today.focusScore,
        focusedTime: data.today.focusedTime,
        blockEvents: data.today.blockEvents
      });
      setActivitySessions([...data.recentSessions].sort((a, b) => b.startTime - a.startTime));
    }).catch(() => {
    });
  }, []);
  const handleAddDomain = async () => {
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!d) return;
    setAdding("domain");
    await api$e.addDomain(d);
    setNewDomain("");
    onRefresh();
    setAdding(null);
  };
  const handleAddProcess = async () => {
    const p = newProcess.trim();
    if (!p) return;
    setAdding("process");
    await api$e.addProcess(p);
    setNewProcess("");
    onRefresh();
    setAdding(null);
  };
  const handleAskDaemon = () => {
    if (!onChatWith) return;
    const focusScore = todayStats?.focusScore ?? 0;
    const topDistractions = activitySessions.filter((s) => s.isDistraction).slice(0, 3).map((s) => s.app).join(", ");
    const sitesBlocked = store.blocklist.domains.length;
    const appsBlocked = store.blocklist.processes.length;
    onChatWith(
      `I'm looking at my Overview page. My current focus score is ${Math.round(focusScore)}% today. I have ${sitesBlocked} sites and ${appsBlocked} apps blocked. My recent distractions include: ${topDistractions || "none detected yet"}. Can you analyze my protection setup and suggest improvements?`
    );
  };
  const sessionRemaining = activeSession?.endsAt ? Math.max(0, activeSession.endsAt - now) : null;
  const activeSchedules = store.schedules.filter((s) => s.active);
  const loggedSessions = activitySessions.filter((s) => s.duration >= 6e4);
  const visibleSessions = showAll ? loggedSessions : loggedSessions.slice(0, 40);
  const grouped = /* @__PURE__ */ new Map();
  for (const s of visibleSessions) {
    const key = relativeDate(s.startTime);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(s);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 animate-fade-in space-y-3 overflow-y-auto h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 18, style: { color: colors.accent, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-[15px]", style: { color: colors.textPrimary }, children: "Protection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] mt-0.5", style: { color: colors.textMuted }, children: "Blocklists, feed blocks, and activity log" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        onChatWith && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleAskDaemon,
            title: "Get AI analysis of your current protection setup and activity",
            className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors",
            style: { background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 11 }),
              " Ask AI"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium",
            title: isShieldOn ? "Protection layers active" : "No active session or blocklist yet",
            style: {
              background: isShieldOn ? "rgba(52,211,153,0.1)" : "transparent",
              border: `1px solid ${isShieldOn ? "rgba(52,211,153,0.25)" : colors.border}`,
              color: isShieldOn ? "#34d399" : colors.textMuted
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-1.5 h-1.5 rounded-full ${isShieldOn ? "bg-accent-green" : ""}`, style: !isShieldOn ? { background: colors.textDim } : void 0 }),
              isShieldOn ? "Protection active" : "Protection idle"
            ]
          }
        )
      ] })
    ] }),
    store.elevation !== "full" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
        title: "Without admin rights, hosts-file edits cannot be made — site blocking is unavailable.",
        style: { background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { size: 12, className: "text-accent-orange flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent-orange font-semibold", children: "Hosts-file blocking inactive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", style: { color: colors.textSecondary }, children: "— admin rights required to enforce site blocks" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: [
      {
        label: "Sites Blocked",
        value: store.blocklist.domains.length.toString(),
        color: store.blocklist.domains.length > 0 ? "#34d399" : colors.textMuted,
        sub: "domains",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 12 }),
        tooltip: store.blocklist.domains.length > 0 ? `${store.blocklist.domains.length} domain${store.blocklist.domains.length > 1 ? "s" : ""} actively blocked` : "No sites blocked — add a domain below to start blocking"
      },
      {
        label: "Apps Blocked",
        value: store.blocklist.processes.length.toString(),
        color: store.blocklist.processes.length > 0 ? "#34d399" : colors.textMuted,
        sub: "processes",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 12 }),
        tooltip: store.blocklist.processes.length > 0 ? `${store.blocklist.processes.length} process${store.blocklist.processes.length > 1 ? "es" : ""} monitored` : "No apps blocked"
      },
      {
        label: "Block Events",
        value: (todayStats?.blockEvents ?? store.blockEventCount ?? 0).toString(),
        color: "#3b9eff",
        sub: "today",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12 }),
        tooltip: `${todayStats?.blockEvents ?? store.blockEventCount ?? 0} attempts blocked today`
      },
      {
        label: activeSession ? "Session Timer" : "Focus Score",
        value: activeSession ? sessionRemaining !== null ? formatMs(sessionRemaining) : "∞" : `${Math.round(todayStats?.focusScore ?? 0)}%`,
        color: activeSession ? "#34d399" : (todayStats?.focusScore ?? 0) >= 60 ? "#34d399" : "#fbbf24",
        sub: activeSession ? `${activeSession.mode} mode` : "today",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart2, { size: 12 }),
        tooltip: activeSession ? `${activeSession.mode} focus session active` : `Today's focus score: ${Math.round(todayStats?.focusScore ?? 0)}%`
      }
    ].map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl gap-0.5",
        title: chip.tooltip,
        style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold tabular-nums leading-none", style: { color: chip.color }, children: chip.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium", style: { color: colors.textPrimary }, children: chip.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px]", style: { color: colors.textSecondary }, children: chip.sub })
        ]
      },
      chip.label
    )) }),
    activeSession && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center justify-between px-3 py-2 rounded-lg",
        style: { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-accent-green animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-accent-green font-semibold capitalize", children: [
              activeSession.mode,
              " focus"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: colors.textSecondary }, children: [
              "started ",
              formatTime(activeSession.startedAt)
            ] }),
            sessionRemaining !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: colors.textSecondary }, children: [
              "· ",
              formatMs(sessionRemaining),
              " remaining"
            ] }),
            activeSession.allowlist && activeSession.allowlist.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: colors.textSecondary }, children: [
              "· ",
              activeSession.allowlist.length,
              " sites allowed"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "hover:text-accent-orange text-[11px] transition-colors",
              style: { color: colors.textSecondary },
              onClick: async () => {
                await api$e.stopSession(activeSession.id);
                onRefresh();
              },
              children: "End session"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3 flex flex-col gap-2", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 12, className: "text-accent-blue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", style: { color: colors.textPrimary }, children: "Blocked Sites" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[9px]", style: { color: colors.textSecondary }, children: [
            store.blocklist.domains.length,
            " entries"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-px max-h-48 overflow-y-auto", children: store.blocklist.domains.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center py-4", style: { color: colors.textSecondary }, children: "No sites blocked yet" }) : store.blocklist.domains.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-1.5 px-2 py-1 rounded-md group hover:bg-white/[0.03] transition-colors",
            title: `${d.domain}${d.expiresAt ? ` — expires in ${formatExpiry(d.expiresAt)}` : " — permanent block"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium truncate flex-1", style: { color: colors.textPrimary }, children: d.domain }),
              d.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono tabular-nums flex-shrink-0", style: { color: colors.textSecondary }, children: formatExpiry(d.expiresAt) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: async () => {
                    await api$e.removeDomain(d.domain);
                    onRefresh();
                  },
                  className: "opacity-0 group-hover:opacity-100 hover:text-accent-orange transition-all flex-shrink-0",
                  style: { color: colors.textSecondary },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 10 })
                }
              )
            ]
          },
          d.domain
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: DOMAIN_SUGGESTIONS.filter((s) => !store.blocklist.domains.some((d) => d.domain === s)).slice(0, 4).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: async () => {
              await api$e.addDomain(s);
              onRefresh();
            },
            className: "text-[10px] px-2 py-0.5 rounded-full transition-colors hover:brightness-125",
            style: { background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.border}` },
            children: [
              "+ ",
              s
            ]
          },
          s
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Add a site…",
              value: newDomain,
              onChange: (e) => setNewDomain(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && handleAddDomain(),
              className: "flex-1 text-[11px] px-2 py-1.5 rounded-lg outline-none transition-colors",
              style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary },
              onFocus: (e) => {
                e.target.style.borderColor = "rgba(33,150,243,0.4)";
              },
              onBlur: (e) => {
                e.target.style.borderColor = colors.border;
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleAddDomain,
              disabled: !newDomain.trim() || adding === "domain",
              className: "flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50",
              style: { background: "rgba(33,150,243,0.15)", color: "#818cf8", border: "1px solid rgba(33,150,243,0.2)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 10 }),
                " Add"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3 flex flex-col gap-2", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 12, className: "text-accent-amber" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", style: { color: colors.textPrimary }, children: "Blocked Apps" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[9px]", style: { color: colors.textSecondary }, children: [
            store.blocklist.processes.length,
            " entries"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-px max-h-48 overflow-y-auto", children: store.blocklist.processes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center py-4", style: { color: colors.textSecondary }, children: "No apps blocked yet" }) : store.blocklist.processes.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-1.5 px-2 py-1 rounded-md group hover:bg-white/[0.03] transition-colors",
            title: `${p.name}${p.expiresAt ? ` — expires in ${formatExpiry(p.expiresAt)}` : " — permanent block"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium truncate flex-1", style: { color: colors.textPrimary }, children: p.name }),
              p.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono tabular-nums flex-shrink-0", style: { color: colors.textSecondary }, children: formatExpiry(p.expiresAt) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: async () => {
                    await api$e.removeProcess(p.name);
                    onRefresh();
                  },
                  className: "opacity-0 group-hover:opacity-100 hover:text-accent-orange transition-all flex-shrink-0",
                  style: { color: colors.textSecondary },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 10 })
                }
              )
            ]
          },
          p.name
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: PROCESS_SUGGESTIONS.filter((s) => !store.blocklist.processes.some((p) => p.name.toLowerCase() === s.toLowerCase())).slice(0, 4).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: async () => {
              await api$e.addProcess(s);
              onRefresh();
            },
            className: "text-[10px] px-2 py-0.5 rounded-full transition-colors hover:brightness-125",
            style: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" },
            children: [
              "+ ",
              s
            ]
          },
          s
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Add an app…",
              value: newProcess,
              onChange: (e) => setNewProcess(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && handleAddProcess(),
              className: "flex-1 text-[11px] px-2 py-1.5 rounded-lg outline-none transition-colors",
              style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary },
              onFocus: (e) => {
                e.target.style.borderColor = "rgba(251,191,36,0.3)";
              },
              onBlur: (e) => {
                e.target.style.borderColor = colors.border;
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleAddProcess,
              disabled: !newProcess.trim() || adding === "process",
              className: "flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50",
              style: { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 10 }),
                " Add"
              ]
            }
          )
        ] })
      ] })
    ] }),
    (store.feedBlocks?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 12, style: { color: "#34d399" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", style: { color: colors.textPrimary }, children: "Feed Blocks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[9px]", style: { color: colors.textSecondary }, children: "via browser extension" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: store.feedBlocks.map((f) => (
        // A blocked feed is the app doing its job → read as confirmed/green,
        // not red (red is reserved for problems).
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-1.5 px-2 py-1 rounded-lg",
            title: `${f.displayName} is hidden by the Attentify browser extension`,
            style: { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 10, style: { color: "#34d399" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium", style: { color: colors.textPrimary }, children: f.displayName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8.5px] px-1 py-0.5 rounded", style: { background: "rgba(52,211,153,0.15)", color: "#34d399" }, children: "hidden" })
            ]
          },
          f.domain
        )
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[9px]", style: { color: colors.textSecondary }, children: "Distracting feeds are hidden in your browser. Install the extension and Attentify syncs these automatically." })
    ] }),
    activeSchedules.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12, className: "text-accent-blue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", style: { color: colors.textPrimary }, children: "Active Schedules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[9px]", style: { color: colors.textSecondary }, children: [
          activeSchedules.length,
          " running"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1", children: activeSchedules.slice(0, 4).map((sched) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-2 px-2 py-1.5 rounded-lg",
          style: { background: colors.rowOdd, border: `1px solid ${colors.border}` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-accent-green flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium truncate", style: { color: colors.textPrimary }, children: sched.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] font-mono", style: { color: colors.textSecondary }, children: [
                sched.startTime,
                "–",
                sched.endTime,
                " · ",
                sched.days.map((d) => DAY_INITIALS[d]).join("")
              ] })
            ] })
          ]
        },
        sched.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12, style: { color: colors.textSecondary } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", style: { color: colors.textPrimary }, children: "Activity Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[9px]", style: { color: colors.textSecondary }, children: [
          loggedSessions.length,
          " sessions tracked"
        ] })
      ] }),
      loggedSessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center py-6", style: { color: colors.textSecondary }, children: "No activity recorded yet — tracking starts automatically in the background" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        [...grouped.entries()].map(([dateLabel, sessions]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-widest mb-1.5", style: { color: colors.textSecondary }, children: dateLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-px", children: sessions.map((s) => {
            const catColor = CAT_COLOR$2[s.category];
            const title = cleanTitle(s.title, s.app);
            const tooltipParts = [
              `${s.app} — ${s.category}`,
              title !== s.app ? `"${title}"` : "",
              s.url ? `URL: ${s.url}` : "",
              `Duration: ${formatMs(s.duration)}`,
              `Started: ${formatTime(s.startTime)}`,
              s.isDistraction ? "Classified as distraction" : "Classified as focused"
            ].filter(Boolean).join("\n");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.03] transition-colors",
                title: tooltipParts,
                style: { borderLeft: `2px solid ${catColor}30` },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      style: { background: s.isDistraction ? "#f87171" : catColor }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium flex-shrink-0 w-24 truncate", style: { color: colors.textPrimary }, children: s.app }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] flex-1 truncate min-w-0", style: { color: colors.textSecondary }, children: title !== s.app ? title : "" }),
                  s.url && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[9px] truncate flex-shrink-0 max-w-[120px]",
                      style: { color: colors.textSecondary },
                      title: s.url,
                      children: s.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[8.5px] px-1 py-0.5 rounded flex-shrink-0",
                      style: { background: catColor + "18", color: catColor },
                      children: categoryLabel(s.category)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono tabular-nums flex-shrink-0 w-8 text-right", style: { color: colors.textSecondary }, children: formatMs(s.duration) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono tabular-nums flex-shrink-0 w-10 text-right", style: { color: colors.textSecondary }, children: formatTime(s.startTime) })
                ]
              },
              s.id
            );
          }) })
        ] }, dateLabel)),
        loggedSessions.length > 40 && !showAll && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowAll(true),
            className: "w-full text-[10px] py-1.5 transition-colors",
            style: { color: colors.textSecondary },
            children: [
              "Show all ",
              loggedSessions.length,
              " sessions →"
            ]
          }
        )
      ] })
    ] })
  ] });
}
const api$d = window.electronAPI;
const SEV_COLOR = { high: "#f87171", medium: "#fbbf24", low: "#34d399" };
const CAT_ICON = {
  apps: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 13 }),
  feeds: /* @__PURE__ */ jsxRuntimeExports.jsx(Rss, { size: 13 }),
  notifications: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 13 })
};
const FIX_LABEL = {
  "add-domain-block": "Block Site",
  "add-process-block": "Block App",
  "enable-feed-guard": "Block Feeds",
  "enable-notification-filter": "Start Session",
  "review-extensions": "Manual Step"
};
const FEED_GUARD = ["youtube.com", "instagram.com", "x.com", "twitter.com", "facebook.com", "tiktok.com"];
function buildPlan(results) {
  const steps = [];
  if (results.recentDistractingSites.length > 0) {
    const sites = results.recentDistractingSites.slice(0, 8);
    steps.push({
      id: "block-sites",
      label: `Block ${sites.length} distraction site${sites.length !== 1 ? "s" : ""} from browsing history`,
      description: sites.join(", "),
      tag: "Sites",
      tagColor: "#3b9eff",
      execute: async () => {
        for (const d of sites) await api$d.addDomain(d);
      },
      applied: false,
      skipped: false
    });
  }
  if (results.runningDistractors.length > 0) {
    steps.push({
      id: "block-running",
      label: `Kill & block ${results.runningDistractors.length} distraction app${results.runningDistractors.length !== 1 ? "s" : ""} currently running`,
      description: results.runningDistractors.join(", "),
      tag: "Running",
      tagColor: "#f87171",
      execute: async () => {
        for (const p of results.runningDistractors) await api$d.addProcess(p);
      },
      applied: false,
      skipped: false
    });
  }
  if (results.installedDistractors.length > 0) {
    const apps = results.installedDistractors.slice(0, 6);
    steps.push({
      id: "block-installed",
      label: `Block ${apps.length} distracting installed app${apps.length !== 1 ? "s" : ""}`,
      description: apps.join(", "),
      tag: "Apps",
      tagColor: "#fbbf24",
      execute: async () => {
        for (const p of apps) await api$d.addProcess(p);
      },
      applied: false,
      skipped: false
    });
  }
  if (results.startupDistractors.length > 0) {
    steps.push({
      id: "block-startup",
      label: `Block ${results.startupDistractors.length} auto-start app${results.startupDistractors.length !== 1 ? "s" : ""}`,
      description: results.startupDistractors.join(", "),
      tag: "Startup",
      tagColor: "#ff6b35",
      execute: async () => {
        for (const p of results.startupDistractors) await api$d.addProcess(p);
      },
      applied: false,
      skipped: false
    });
  }
  const hasFeeds = results.issues.some((i) => i.fixAction === "enable-feed-guard");
  if (hasFeeds) {
    steps.push({
      id: "feed-guard",
      label: "Enable Feed Guard — block all algorithmic feeds",
      description: FEED_GUARD.join(", "),
      tag: "Feeds",
      tagColor: "#f87171",
      execute: async () => {
        for (const d of FEED_GUARD) await api$d.addDomain(d);
      },
      applied: false,
      skipped: false
    });
  }
  steps.push({
    id: "start-session",
    label: "Start a 2-hour focus session to lock in the changes",
    description: "Activates your blocklist and blocks new distractions from loading.",
    tag: "Session",
    tagColor: "#34d399",
    execute: async () => {
      await api$d.startSession("normal", 2 * 60 * 60 * 1e3);
    },
    applied: false,
    skipped: false
  });
  return steps;
}
function buildChatMessage(results) {
  const parts = ["Focus Scan found the following issues on my system. Help me resolve all of them:\n"];
  if (results.recentDistractingSites.length > 0)
    parts.push(`• Visited distraction sites: ${results.recentDistractingSites.slice(0, 6).join(", ")}`);
  if (results.runningDistractors.length > 0)
    parts.push(`• Running distraction apps: ${results.runningDistractors.join(", ")}`);
  if (results.installedDistractors.length > 0)
    parts.push(`• Installed distractors: ${results.installedDistractors.slice(0, 5).join(", ")}`);
  if (results.startupDistractors.length > 0)
    parts.push(`• Auto-start apps: ${results.startupDistractors.join(", ")}`);
  if (results.browserExtensionsFound > 0)
    parts.push(`• ${results.browserExtensionsFound} browser extensions found`);
  parts.push("\nBlock everything that needs blocking and start a deep focus session.");
  return parts.join("\n");
}
function DeepClean({ store, onChatWith }) {
  const { colors } = useTheme();
  const [scanning, setScanning] = reactExports.useState(false);
  const [scanStep, setScanStep] = reactExports.useState("");
  const [progress, setProgress] = reactExports.useState(0);
  const [results, setResults] = reactExports.useState(store.lastScan ?? null);
  const [planSteps, setPlanSteps] = reactExports.useState([]);
  const [planVisible, setPlanVisible] = reactExports.useState(false);
  const [planBuilding, setPlanBuilding] = reactExports.useState(false);
  const [applying, setApplying] = reactExports.useState(null);
  const [applyingAll, setApplyingAll] = reactExports.useState(false);
  const [fixedIds, setFixedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [expandedIssue, setExpandedIssue] = reactExports.useState(null);
  const runScan = async () => {
    if (scanning) return;
    setScanning(true);
    setPlanVisible(false);
    setPlanSteps([]);
    setFixedIds(/* @__PURE__ */ new Set());
    setProgress(0);
    const steps = [
      "Checking installed applications…",
      "Scanning browser extensions…",
      "Profiling notification patterns…",
      "Identifying engagement traps…"
    ];
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      setProgress(Math.round((i + 1) / steps.length * 100));
      await new Promise((r) => setTimeout(r, 700));
    }
    const res = await api$d.runScan();
    setResults(res);
    setScanning(false);
  };
  const generatePlan = async () => {
    if (!results) return;
    setPlanBuilding(true);
    await new Promise((r) => setTimeout(r, 900));
    setPlanSteps(buildPlan(results));
    setPlanBuilding(false);
    setPlanVisible(true);
  };
  const applyStep = async (stepId) => {
    const step = planSteps.find((s) => s.id === stepId);
    if (!step || step.applied || applying) return;
    setApplying(stepId);
    try {
      await step.execute();
      setPlanSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, applied: true } : s));
      setFixedIds((prev) => new Set(prev).add(stepId));
    } finally {
      setApplying(null);
    }
  };
  const skipStep = (stepId) => {
    setPlanSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, skipped: true } : s));
  };
  const applyAll = async () => {
    if (applyingAll) return;
    setApplyingAll(true);
    for (const step of planSteps) {
      if (!step.applied && !step.skipped) {
        setApplying(step.id);
        try {
          await step.execute();
        } catch {
        }
        setPlanSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, applied: true } : s));
        setFixedIds((prev) => new Set(prev).add(step.id));
        setApplying(null);
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    setApplyingAll(false);
  };
  const appliedCount = planSteps.filter((s) => s.applied).length;
  const pendingSteps = planSteps.filter((s) => !s.applied && !s.skipped);
  const fixIssue = async (issue) => {
    if (!results) return;
    switch (issue.fixAction) {
      case "add-domain-block":
        for (const d of results.recentDistractingSites.length > 0 ? results.recentDistractingSites : issue.affectedItem ? [issue.affectedItem] : [])
          await api$d.addDomain(d);
        break;
      case "add-process-block": {
        const procs = issue.id === "running-distractors" ? results.runningDistractors : issue.id === "installed-distractors" ? results.installedDistractors : issue.id === "startup-distractors" ? results.startupDistractors : issue.affectedItem ? [issue.affectedItem] : [];
        for (const p of procs) await api$d.addProcess(p);
        break;
      }
      case "enable-feed-guard":
        for (const d of FEED_GUARD) await api$d.addDomain(d);
        break;
      case "enable-notification-filter":
        await api$d.startSession("normal");
        break;
    }
    setFixedIds((prev) => new Set(prev).add(issue.id));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 animate-fade-in space-y-3 overflow-y-auto h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-bold text-xl flex items-center gap-2", style: { color: colors.textPrimary }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 19, className: "text-accent-blue" }),
          " Deep Clean"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-0.5", style: { color: colors.textSecondary }, children: "Scan for attention leaks · generate a remediation plan · apply with one click" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: runScan,
          disabled: scanning,
          className: "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all disabled:opacity-50 hover:scale-105",
          style: { background: "rgba(33,150,243,0.12)", color: "#818cf8", border: "1px solid rgba(33,150,243,0.25)" },
          children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { size: 12, className: "animate-spin" }),
            " Scanning…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { size: 12 }),
            " ",
            results ? "Re-scan" : "Run Scan"
          ] })
        }
      )
    ] }),
    scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl p-5 flex flex-col items-center text-center",
        style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-14 h-14 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2 border-accent-blue/20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { size: 20, className: "text-accent-blue" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mb-2", style: { color: colors.textPrimary }, children: scanStep }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-40 rounded-full h-1.5 overflow-hidden", style: { background: colors.border }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-accent-blue transition-all duration-500", style: { width: `${progress}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] mt-1.5 tabular-nums", style: { color: colors.textSecondary }, children: [
            progress,
            "%"
          ] })
        ]
      }
    ),
    !results && !scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl p-8 flex flex-col items-center text-center",
        style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-xl bg-accent-blue/10 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 28, className: "text-accent-blue" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base mb-1", style: { color: colors.textPrimary }, children: "No scan run yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs max-w-xs", style: { color: colors.textSecondary }, children: "Scan your system to detect attention leaks — running apps, browsing history, notification overload, and more." })
        ]
      }
    ),
    results && !scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-xl px-4 py-3 flex items-center gap-4",
          style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              results.issueCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 20, className: "text-accent-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 20, className: "text-accent-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold", style: { color: colors.textPrimary }, children: results.issueCount === 0 ? "Clean — no issues found" : `${results.issueCount} attention leak${results.issueCount !== 1 ? "s" : ""} found` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px]", style: { color: colors.textSecondary }, children: [
                  new Date(results.runAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
                  " ",
                  new Date(results.runAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 ml-auto flex-wrap", children: [
              { label: "Sites", value: results.recentDistractingSites.length, color: "#3b9eff" },
              { label: "Running", value: results.runningDistractors.length, color: "#f87171" },
              { label: "Installed", value: results.installedDistractors.length, color: "#fbbf24" },
              { label: "Extensions", value: results.browserExtensionsFound, color: "#546e7a" }
            ].map((chip) => chip.value > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-1 px-2 py-1 rounded-lg",
                style: { background: chip.color + "15", border: `1px solid ${chip.color}30` },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold tabular-nums", style: { color: chip.color }, children: chip.value }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px]", style: { color: colors.textSecondary }, children: chip.label })
                ]
              },
              chip.label
            )) }),
            results.issueCount > 0 && !planVisible && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: generatePlan,
                disabled: planBuilding,
                className: "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 disabled:opacity-60 flex-shrink-0",
                style: { background: "rgba(129,140,248,0.15)", color: "#c7d2fe", border: "1px solid rgba(129,140,248,0.3)" },
                children: planBuilding ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { size: 11, className: "animate-spin" }),
                  " Building plan…"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 11 }),
                  " Generate AI Plan"
                ] })
              }
            )
          ]
        }
      ),
      planVisible && planSteps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl overflow-hidden", style: { border: "1px solid rgba(129,140,248,0.3)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between px-4 py-3",
            style: { background: "rgba(129,140,248,0.1)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14, className: "text-indigo-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", style: { color: colors.textPrimary }, children: "Remediation Plan" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-indigo-400", children: [
                  appliedCount,
                  "/",
                  planSteps.length,
                  " applied"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                onChatWith && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onChatWith(buildChatMessage(results)),
                    className: "text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors",
                    children: "Ask Attentify instead →"
                  }
                ),
                pendingSteps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: applyAll,
                    disabled: applyingAll,
                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all hover:scale-105 disabled:opacity-60",
                    style: { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" },
                    children: applyingAll ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { size: 10, className: "animate-spin" }),
                      " Applying…"
                    ] }) : `Apply all ${pendingSteps.length} steps`
                  }
                ),
                appliedCount === planSteps.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[11px] text-accent-green font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 12 }),
                  " All applied"
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: colors.cardBg }, children: planSteps.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start gap-3 px-4 py-3 transition-colors",
            style: {
              borderBottom: i < planSteps.length - 1 ? `1px solid ${colors.border}` : "none",
              opacity: step.skipped ? 0.4 : 1
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold",
                  style: {
                    background: step.applied ? "rgba(52,211,153,0.2)" : step.skipped ? colors.accentBg : "rgba(129,140,248,0.2)",
                    color: step.applied ? "#34d399" : step.skipped ? colors.textMuted : "#a5b4fc",
                    border: `1px solid ${step.applied ? "rgba(52,211,153,0.3)" : step.skipped ? colors.border : "rgba(129,140,248,0.3)"}`
                  },
                  children: step.applied ? "✓" : i + 1
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[9px] px-1.5 py-0.5 rounded font-bold",
                      style: { background: step.tagColor + "20", color: step.tagColor },
                      children: step.tag
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-medium", style: { color: colors.textPrimary }, children: step.label })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] truncate", style: { color: colors.textSecondary }, children: step.description })
              ] }),
              !step.applied && !step.skipped && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => skipStep(step.id),
                    className: "hover:text-white transition-colors",
                    style: { color: colors.textSecondary },
                    title: "Skip this step",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => applyStep(step.id),
                    disabled: !!applying || applyingAll,
                    className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-105 disabled:opacity-50",
                    style: { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" },
                    children: applying === step.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { size: 9, className: "animate-spin" }),
                      " Applying…"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 9 }),
                      " Apply"
                    ] })
                  }
                )
              ] }),
              step.applied && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-accent-green flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 11 }),
                " Done"
              ] })
            ]
          },
          step.id
        )) })
      ] }),
      results.issues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 px-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-widest", style: { color: colors.textSecondary }, children: "Detected Issues" }),
          onChatWith && !planVisible && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onChatWith(buildChatMessage(results)),
              className: "ml-auto text-[10px] hover:text-accent-blue transition-colors",
              style: { color: colors.textSecondary },
              children: "Ask Attentify to handle all →"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl overflow-hidden", style: { border: `1px solid ${colors.border}` }, children: results.issues.map((issue, i) => {
          const sevColor = SEV_COLOR[issue.severity] ?? "#546e7a";
          const isFixed = fixedIds.has(issue.id);
          const isExpanded = expandedIssue === issue.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: {
                background: isFixed ? "rgba(52,211,153,0.04)" : i % 2 === 0 ? colors.rowEven : colors.rowOdd,
                borderBottom: i < results.issues.length - 1 ? `1px solid ${colors.border}` : "none",
                opacity: isFixed ? 0.6 : 1
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                    onClick: () => setExpandedIssue(isExpanded ? null : issue.id),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                          style: { background: sevColor + "18", color: isFixed ? "#34d399" : sevColor },
                          children: isFixed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 13, style: { color: "#34d399" } }) : CAT_ICON[issue.category]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                            style: { background: sevColor + "18", color: sevColor },
                            children: issue.severity
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold truncate", style: { color: colors.textPrimary }, children: issue.title })
                      ] }) }),
                      !isFixed && issue.fixAction !== "review-extensions" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: async (e) => {
                            e.stopPropagation();
                            await fixIssue(issue);
                          },
                          className: "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105 flex-shrink-0",
                          style: { background: "rgba(33,150,243,0.12)", color: "#818cf8", border: "1px solid rgba(33,150,243,0.2)" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 9 }),
                            " ",
                            FIX_LABEL[issue.fixAction ?? ""] ?? "Fix"
                          ]
                        }
                      ),
                      onChatWith && !isFixed && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            onChatWith(`Help me fix this scan issue: ${issue.title} — ${issue.description}`);
                          },
                          className: "text-[10px] hover:text-accent-blue transition-colors flex-shrink-0 ml-1",
                          style: { color: colors.textSecondary },
                          title: "Ask Attentify",
                          children: "Ask AI"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 ml-1", style: { color: colors.textSecondary }, children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 12 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12 }) })
                    ]
                  }
                ),
                isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "px-3 pb-3 ml-10 text-[10px] leading-relaxed",
                    style: { color: colors.textSecondary },
                    children: [
                      issue.description,
                      isFixed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-accent-green font-semibold", children: "· Fixed" })
                    ]
                  }
                )
              ]
            },
            issue.id
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StartupPanel, {})
  ] });
}
function StartupPanel() {
  const { colors } = useTheme();
  const [items, setItems] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(null);
  const [note, setNote] = reactExports.useState(null);
  const load = React.useCallback(() => {
    api$d.getStartupItems().then(setItems).catch(() => setItems([]));
  }, []);
  React.useEffect(() => {
    load();
  }, [load]);
  const disable = async (item) => {
    setBusy(item.id);
    setNote(null);
    try {
      const res = await api$d.disableStartupItem(item);
      if (res.ok) setItems((prev) => (prev ?? []).filter((i) => i.id !== item.id));
      else setNote({ id: item.id, text: res.error || "Could not disable this one." });
    } catch {
      setNote({ id: item.id, text: "Could not disable this one." });
    }
    setBusy(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4 mt-1", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 15, style: { color: colors.accent } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] font-semibold", style: { color: colors.textPrimary }, children: "Startup apps" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px]", style: { color: colors.textMuted }, children: "Stop apps from launching automatically at login — a faster, calmer boot." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: load, className: "text-[10px] px-2 py-1 rounded-lg", style: { border: `1px solid ${colors.border}`, color: colors.textMuted }, children: "Refresh" })
    ] }),
    items === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] py-3 text-center", style: { color: colors.textMuted }, children: "Scanning startup entries…" }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] py-3 text-center", style: { color: colors.textMuted }, children: "No auto-start apps found (or not supported on this OS)." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 mt-2", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] flex-1 truncate", style: { color: colors.textSecondary }, title: item.command, children: item.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded flex-shrink-0", style: { background: colors.accentBg, color: colors.textMuted }, children: item.location === "folder" ? "Startup folder" : item.location.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => void disable(item),
            disabled: busy === item.id,
            className: "text-[10px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0 transition-all disabled:opacity-50",
            style: { background: colors.negativeBg, color: colors.negative, border: `1px solid rgba(248,113,113,0.3)` },
            children: busy === item.id ? "Working…" : "Stop auto-start"
          }
        )
      ] }),
      note?.id === item.id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] pb-1", style: { color: colors.warning }, children: note.text })
    ] }, item.id)) })
  ] });
}
const api$c = window.electronAPI;
const PRESETS = [
  { label: "25 min — Pomodoro", ms: 25 * 60 * 1e3 },
  { label: "90 min — Flow state", ms: 90 * 60 * 1e3 },
  { label: "3 hours — Deep work", ms: 3 * 60 * 60 * 1e3 },
  { label: "4 hours — Half-day", ms: 4 * 60 * 60 * 1e3 }
];
function DeepFocusMode({ store, onRefresh }) {
  const { colors } = useTheme();
  const [duration, setDuration] = reactExports.useState(90 * 60 * 1e3);
  const [allowlistItem, setAllowlistItem] = reactExports.useState("");
  const [allowlist, setAllowlist] = reactExports.useState(["github.com", "notion.so", "localhost"]);
  const [starting, setStarting] = reactExports.useState(false);
  const activeSession = store.sessions.find((s) => s.active && s.mode === "deep");
  const handleStart = async () => {
    setStarting(true);
    await api$c.startSession("deep", duration, allowlist);
    onRefresh();
    setStarting(false);
  };
  const handleStop = async () => {
    const session = store.sessions.find((s) => s.active);
    if (session) await api$c.stopSession(session.id);
    onRefresh();
  };
  const addAllowlistItem = () => {
    const item = allowlistItem.trim().toLowerCase();
    if (item && !allowlist.includes(item)) {
      setAllowlist([...allowlist, item]);
      setAllowlistItem("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 animate-fade-in space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-bold text-xl flex items-center gap-2", style: { color: colors.textPrimary }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 20, className: "text-accent-amber" }),
        " Deep Focus Mode"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-0.5", style: { color: colors.textSecondary }, children: "Hardcore lockdown — blocks everything except your allowlist" })
    ] }),
    activeSession ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "card flex flex-col items-center py-10 text-center",
        style: { border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.05)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-16 h-16 rounded-full bg-accent-green/10 border border-accent-green/30 flex items-center justify-center mb-4",
              style: { boxShadow: "0 0 30px rgba(52,211,153,0.15)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 28, className: "text-accent-green" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-accent-green font-bold text-xl mb-1", children: "Deep Focus Active" }),
          activeSession.endsAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mb-6", style: { color: colors.textSecondary }, children: [
            "Until ",
            new Date(activeSession.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          ] }),
          activeSession.endsAt && Date.now() < activeSession.endsAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full",
              style: { background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14 }),
                " Locked until it ends"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleStop,
              className: "flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full transition-colors",
              style: { background: colors.cardBg, color: colors.textPrimary, border: `1px solid ${colors.border}` },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 14 }),
                " End session"
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mb-3", style: { color: colors.textPrimary }, children: "Session duration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 mb-3", children: PRESETS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDuration(p.ms),
            className: "px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
            style: {
              background: duration === p.ms ? "rgba(33,150,243,0.15)" : colors.cardBg,
              border: `1px solid ${duration === p.ms ? "rgba(33,150,243,0.4)" : colors.border}`,
              color: duration === p.ms ? colors.textPrimary : colors.textSecondary
            },
            children: p.label
          },
          p.ms
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mb-1", style: { color: colors.textPrimary }, children: "Allowlist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mb-3", style: { color: colors.textSecondary }, children: "Only these sites/apps are accessible during the session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: allowlist.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs",
            style: { background: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.textPrimary },
            children: [
              item,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setAllowlist(allowlist.filter((i) => i !== item)),
                  className: "hover:text-accent-orange transition-colors",
                  style: { color: colors.textSecondary },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 })
                }
              )
            ]
          },
          item
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "github.com",
              value: allowlistItem,
              onChange: (e) => setAllowlistItem(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && addAllowlistItem(),
              className: "flex-1 text-xs px-3 py-2 rounded-lg outline-none transition-colors",
              style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: addAllowlistItem,
              className: "text-xs px-3 py-2 rounded-lg transition-colors",
              style: { background: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.textPrimary },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleStart,
          disabled: starting,
          className: "w-full flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue-light disabled:opacity-60 text-white font-bold py-3.5 rounded-full text-base transition-all",
          style: { boxShadow: "0 0 20px rgba(33,150,243,0.2)" },
          children: [
            starting ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16, fill: "currentColor" }),
            starting ? "Activating…" : "Enter Deep Focus Mode"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center", style: { color: colors.textSecondary }, children: "Once started, you'll need to wait for the session to end to disable it." })
    ] })
  ] });
}
const api$b = window.electronAPI;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function ScheduleManager({ store, onRefresh }) {
  const { colors } = useTheme();
  const [creating, setCreating] = reactExports.useState(false);
  const [newName, setNewName] = reactExports.useState("No Social Media");
  const [newStart, setNewStart] = reactExports.useState("09:00");
  const [newEnd, setNewEnd] = reactExports.useState("17:00");
  const [newDays, setNewDays] = reactExports.useState([1, 2, 3, 4, 5]);
  const [newDomains, setNewDomains] = reactExports.useState("twitter.com, instagram.com, reddit.com");
  const handleCreate = async () => {
    const rule = {
      id: crypto.randomUUID(),
      name: newName,
      days: newDays,
      startTime: newStart,
      endTime: newEnd,
      domains: newDomains.split(",").map((d) => d.trim()).filter(Boolean),
      processes: [],
      active: true
    };
    const updated = [...store.schedules, rule];
    await api$b.setStore({ schedules: updated });
    onRefresh();
    setCreating(false);
  };
  const handleToggle = async (id) => {
    const updated = store.schedules.map((r) => r.id === id ? { ...r, active: !r.active } : r);
    await api$b.setStore({ schedules: updated });
    onRefresh();
  };
  const handleDelete = async (id) => {
    const updated = store.schedules.filter((r) => r.id !== id);
    await api$b.setStore({ schedules: updated });
    onRefresh();
  };
  const toggleDay = (d) => {
    setNewDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 animate-fade-in space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-bold text-xl flex items-center gap-2", style: { color: colors.textPrimary }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 20, className: "text-accent-amber" }),
          " Schedule Manager"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-0.5", style: { color: colors.textSecondary }, children: "Set recurring focus blocks that activate automatically" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setCreating(!creating),
          className: "flex items-center gap-2 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
            " New schedule"
          ]
        }
      )
    ] }),
    creating && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", style: { color: colors.textPrimary }, children: "New schedule" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs mb-1 block", style: { color: colors.textSecondary }, children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            className: "w-full text-xs px-3 py-2 rounded-lg outline-none transition-colors",
            style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs mb-1 block", style: { color: colors.textSecondary }, children: "Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "time",
              value: newStart,
              onChange: (e) => setNewStart(e.target.value),
              className: "w-full text-xs px-3 py-2 rounded-lg outline-none transition-colors",
              style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs mb-1 block", style: { color: colors.textSecondary }, children: "End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "time",
              value: newEnd,
              onChange: (e) => setNewEnd(e.target.value),
              className: "w-full text-xs px-3 py-2 rounded-lg outline-none transition-colors",
              style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs mb-2 block", style: { color: colors.textSecondary }, children: "Days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: DAYS.map((day, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => toggleDay(idx),
            className: "w-9 h-9 rounded-full text-xs font-semibold transition-all",
            style: {
              background: newDays.includes(idx) ? "rgba(33,150,243,0.2)" : colors.cardBg,
              border: `1px solid ${newDays.includes(idx) ? "rgba(33,150,243,0.5)" : colors.border}`,
              color: newDays.includes(idx) ? colors.textPrimary : colors.textSecondary
            },
            children: day
          },
          day
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs mb-1 block", style: { color: colors.textSecondary }, children: "Domains to block (comma-separated)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: newDomains,
            onChange: (e) => setNewDomains(e.target.value),
            className: "w-full text-xs px-3 py-2 rounded-lg outline-none transition-colors",
            style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCreate, className: "btn-primary flex-1", children: "Create schedule" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCreating(false),
            className: "px-4 py-2 rounded-full text-sm transition-colors",
            style: { color: colors.textSecondary, border: `1px solid ${colors.border}` },
            children: "Cancel"
          }
        )
      ] })
    ] }),
    store.schedules.length === 0 && !creating ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card flex flex-col items-center py-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 40, className: "mb-3", style: { color: colors.textSecondary } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", style: { color: colors.textPrimary }, children: "No schedules yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: colors.textSecondary }, children: "Create recurring focus blocks — e.g. block social media weekdays 9am–5pm" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: store.schedules.map((rule) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", style: { color: colors.textPrimary }, children: rule.name }),
          !rule.active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: { color: colors.textSecondary }, children: "(paused)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", style: { color: colors.textSecondary }, children: [
          rule.startTime,
          " – ",
          rule.endTime,
          " · ",
          rule.days.map((d) => DAYS[d]).join(", ")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-0.5 truncate", style: { color: colors.textSecondary }, children: [
          rule.domains.slice(0, 3).join(", "),
          rule.domains.length > 3 ? ` +${rule.domains.length - 3}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleToggle(rule.id), className: "hover:text-white transition-colors flex-shrink-0", style: { color: colors.textSecondary }, children: rule.active ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRight, { size: 22, className: "text-accent-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleLeft, { size: 22 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(rule.id), className: "hover:text-accent-orange transition-colors flex-shrink-0", style: { color: colors.textSecondary }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 15 }) })
    ] }, rule.id)) })
  ] });
}
const api$a = window.electronAPI;
const PLATFORMS = [
  {
    name: "TikTok",
    domain: "tiktok.com",
    score: 98,
    risk: "extreme",
    category: "Short Video",
    techniques: ["Infinite scroll", "Variable reward", "FOMO loop", "Hyper-personalization", "Haptic feedback timing", "Sound autoplay"],
    description: "Dopamine-loop optimized for sub-20s attention. Uses micro-ML models updated per watch second."
  },
  {
    name: "Instagram",
    domain: "instagram.com",
    score: 93,
    risk: "extreme",
    category: "Social / Reels",
    techniques: ["Infinite scroll", "Social comparison", "Variable reward", "Story urgency (24h)", "Notification hooks", "Explore rabbit holes"],
    description: "Reels feed is engagement-maximized; Stories create artificial urgency. Likes are metered to extend sessions."
  },
  {
    name: "YouTube",
    domain: "youtube.com",
    score: 87,
    risk: "extreme",
    category: "Video",
    techniques: ["Autoplay", "Recommendation rabbit holes", "Thumbnail clickbait", "Progress bar anxiety", "Comment hooks", "Notification bell conditioning"],
    description: "Autoplay alone extends sessions 3× intended. Recommendation engine optimizes for watch time, not satisfaction."
  },
  {
    name: "Twitter / X",
    domain: "x.com",
    score: 82,
    risk: "high",
    category: "Social / Microblog",
    techniques: ["Outrage optimization", "Pull-to-refresh reward", "Quote-tweet amplification", "Trending FOMO", "Notification flooding", "Streak mechanics"],
    description: "Timeline ranked by predicted engagement (anger > joy). Pull-to-refresh mimics slot machine lever."
  },
  {
    name: "Reddit",
    domain: "reddit.com",
    score: 75,
    risk: "high",
    category: "Forum / Social",
    techniques: ["Infinite scroll", "Upvote dopamine", "Award system", "Crosspost rabbit holes", "Notification hooks", "Feed personalization"],
    description: "Karma system conditions compulsive checking. Subreddit rabbit holes built for accidental hours-long sessions."
  },
  {
    name: "Snapchat",
    domain: "snapchat.com",
    score: 72,
    risk: "high",
    category: "Ephemeral Social",
    techniques: ["Streak mechanics", "Disappearing content urgency", "FOMO triggers", "Notification pressure", "Discover feed", "Social graph pressure"],
    description: "Snapstreaks create daily compulsion loops through fear of losing progress. Disappearing content manufactured urgency."
  },
  {
    name: "Twitch",
    domain: "twitch.tv",
    score: 68,
    risk: "high",
    category: "Live Streaming",
    techniques: ["Live FOMO", "Community belonging hooks", "Chat participation pull", "Sub streak pressure", "Bit/donation social proof", "Raid events"],
    description: "Live format creates acute FOMO. Chat interaction and sub streaks build compulsive daily check-ins."
  },
  {
    name: "LinkedIn",
    domain: "linkedin.com",
    score: 61,
    risk: "medium",
    category: "Professional Social",
    techniques: ["Social comparison", "Profile view FOMO", "Endorsement reciprocity", "Notification spam", "Engagement bait posts", "Job anxiety triggers"],
    description: "Anxiety-based engagement: profile views trigger status anxiety. Endorsement requests exploit reciprocity bias."
  },
  {
    name: "Facebook",
    domain: "facebook.com",
    score: 55,
    risk: "medium",
    category: "Social",
    techniques: ["Memory surfacing", "Event nudges", "Group notification floods", "Reaction system", "Marketplace hooks", "Watch tab autoplay"],
    description: '"On this day" memory surfacing exploits nostalgia. Group features designed to create daily mandatory check-ins.'
  },
  {
    name: "Pinterest",
    domain: "pinterest.com",
    score: 51,
    risk: "medium",
    category: "Visual Discovery",
    techniques: ["Infinite scroll", "Visual variable reward", "Collection completion", "Board rabbit holes", "Notification triggers"],
    description: "Visual infinite scroll with collection-building compulsion. Masonry layout optimized to prevent natural stopping points."
  },
  {
    name: "Netflix",
    domain: "netflix.com",
    score: 46,
    risk: "medium",
    category: "Streaming",
    techniques: ["Autoplay next episode", "Countdown timer pressure", "Season cliff-hangers", "Recommendation hooks", '"Are you still watching?" dismissal'],
    description: "15-second autoplay countdown exploits default bias. Cliff-hanger endings are production-mandated engagement tools."
  },
  {
    name: "Discord",
    domain: "discord.com",
    score: 34,
    risk: "low",
    category: "Messaging",
    techniques: ["Unread badge anxiety", "Server notification pressure", "Status presence", "Nitro FOMO", "Community belonging"],
    description: "Unread indicators and persistent notification badges create compulsive clearing behavior."
  },
  {
    name: "Hacker News",
    domain: "news.ycombinator.com",
    score: 28,
    risk: "low",
    category: "Link Aggregator",
    techniques: ["New post FOMO", "Comment thread rabbit holes", "Karma system"],
    description: "Lower manipulation intensity but comment threads can be deep time sinks."
  }
];
const TECHNIQUE_GLOSSARY = [
  { term: "Variable reward", explanation: "Unpredictable positive outcomes (likes, new posts) trigger dopamine release — identical to slot machine mechanics." },
  { term: "Infinite scroll", explanation: "Removes natural stopping points. Without pagination, session length is bounded only by willpower." },
  { term: "Autoplay", explanation: "Default continuation eliminates the active decision to keep watching. Most users never opt out." },
  { term: "FOMO loop", explanation: "Fear Of Missing Out manufactured through social proof, trending labels, and time-limited content." },
  { term: "Streak mechanics", explanation: `Arbitrary progress counters that create loss aversion — users feel they've "lost" something if they skip a day.` },
  { term: "Notification hooks", explanation: "Push notifications trigger app opens even during focus. Each open extends average session by 4–7 minutes." },
  { term: "Social comparison", explanation: "Curated highlight reels drive status anxiety, which increases engagement to seek validation." },
  { term: "Outrage optimization", explanation: "Content ranked by predicted engagement. Anger spreads 6× faster than positive content — so it gets surfaced more." }
];
const RISK_COLOR = {
  extreme: "#f87171",
  high: "#fbbf24",
  medium: "#34d399",
  low: "#546e7a"
};
function AlgoTrack({ store, onChatWith }) {
  const { colors } = useTheme();
  const [sessions, setSessions] = reactExports.useState([]);
  const [applying, setApplying] = reactExports.useState(null);
  const [refreshed, setRefreshed] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(null);
  const [showGlossary, setShowGlossary] = reactExports.useState(false);
  const blockedDomains = new Set(store.blocklist.domains.map((d) => d.domain));
  const load = reactExports.useCallback(() => {
    api$a.getAnalytics().then((data) => {
      setSessions(data.recentSessions);
      setRefreshed(true);
    }).catch(() => {
    });
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const timePerApp = /* @__PURE__ */ new Map();
  for (const s of sessions) {
    timePerApp.set(s.app, (timePerApp.get(s.app) ?? 0) + s.duration);
  }
  const blockDomain = async (domain) => {
    setApplying(domain);
    try {
      await api$a.addDomain(domain);
      store.blocklist.domains.push({ domain, addedAt: Date.now() });
    } finally {
      setApplying(null);
    }
  };
  const unblockDomain = async (domain) => {
    setApplying(domain);
    try {
      await api$a.removeDomain(domain);
      const idx = store.blocklist.domains.findIndex((d) => d.domain === domain);
      if (idx !== -1) store.blocklist.domains.splice(idx, 1);
    } finally {
      setApplying(null);
    }
  };
  const extremeCount = PLATFORMS.filter((p) => p.risk === "extreme").length;
  const blockedCount = PLATFORMS.filter((p) => blockedDomains.has(p.domain)).length;
  const handleAskDaemon = () => {
    if (!onChatWith) return;
    const topExposure = PLATFORMS.map((p) => {
      const appKey = [...timePerApp.keys()].find(
        (k) => k.toLowerCase().includes(p.name.split(" ")[0].toLowerCase()) || p.domain.split(".")[0].toLowerCase().includes(k.toLowerCase().slice(0, 4))
      );
      return { name: p.name, risk: p.risk, ms: appKey ? timePerApp.get(appKey) ?? 0 : 0 };
    }).filter((p) => p.ms > 0).sort((a, b) => b.ms - a.ms).slice(0, 3).map((p) => `${p.name} (${Math.floor(p.ms / 6e4)}m, ${p.risk} risk)`).join(", ");
    onChatWith(
      `I'm viewing AlgoTrack. I have ${blockedCount} of ${PLATFORMS.length} tracked platforms blocked. ${extremeCount} platforms are rated extreme risk. My measured exposure this week: ${topExposure || "none detected yet"}. Based on my usage patterns and the manipulation techniques these platforms use, which should I prioritize blocking, and why?`
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 animate-fade-in space-y-3 overflow-y-auto h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-bold text-xl flex items-center gap-2", style: { color: colors.textPrimary }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 19, className: "text-accent-amber" }),
          " AlgoTrack"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] mt-0.5", style: { color: colors.textSecondary }, children: [
          "Attention manipulation risk · ",
          PLATFORMS.length,
          " platforms ranked · ",
          blockedCount,
          " blocked"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        onChatWith && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleAskDaemon,
            className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors",
            style: { background: "rgba(33,150,243,0.1)", color: "#818cf8", border: "1px solid rgba(33,150,243,0.2)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 11 }),
              " Ask AI"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: load,
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            style: { background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.18)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 10 }),
              " Refresh"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: [
      { label: "Extreme Risk", value: extremeCount.toString(), color: "#f87171", sub: "platforms", tooltip: `${extremeCount} platforms rated extreme manipulation risk` },
      { label: "High Risk", value: PLATFORMS.filter((p) => p.risk === "high").length.toString(), color: "#fbbf24", sub: "platforms", tooltip: `${PLATFORMS.filter((p) => p.risk === "high").length} platforms rated high manipulation risk` },
      { label: "Blocked", value: blockedCount.toString(), color: "#34d399", sub: `of ${PLATFORMS.length}`, tooltip: `${blockedCount} of ${PLATFORMS.length} tracked platforms are currently blocked` },
      { label: "Techniques", value: "8", color: "#3b9eff", sub: "documented", tooltip: "Eight documented manipulation techniques" }
    ].map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-2.5 rounded-xl",
        title: chip.tooltip,
        style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold tabular-nums leading-none", style: { color: chip.color }, children: chip.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium mt-0.5", style: { color: colors.textPrimary }, children: chip.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px]", style: { color: colors.textSecondary }, children: chip.sub })
        ]
      },
      chip.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-2.5 px-3 py-2.5 rounded-xl",
        style: { background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 13, className: "text-accent-amber flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed", style: { color: colors.textSecondary }, children: "These platforms employ teams of engineers whose sole purpose is maximizing the time you spend on them. The scores below are derived from documented dark patterns, published research, and whistleblower disclosures." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl overflow-hidden", style: { border: `1px solid ${colors.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", style: { borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: colors.panelBg, borderBottom: `1px solid ${colors.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-wider w-8", style: { color: colors.textSecondary }, children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-wider", style: { color: colors.textSecondary }, children: "Platform" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-wider", style: { color: colors.textSecondary }, children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-wider w-20", style: { color: colors.textSecondary }, children: "Risk Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-wider", style: { color: colors.textSecondary }, children: "Top Techniques" }),
        refreshed && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-wider", style: { color: colors.textSecondary }, children: "Your Exposure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-wider w-20", style: { color: colors.textSecondary }, children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: PLATFORMS.map((platform, i) => {
        const isBlocked = blockedDomains.has(platform.domain);
        const isApplying = applying === platform.domain;
        const isExpanded = expanded === platform.name;
        const riskColor = RISK_COLOR[platform.risk];
        const appKey = [...timePerApp.keys()].find(
          (k) => k.toLowerCase().includes(platform.name.split(" ")[0].toLowerCase()) || platform.domain.split(".")[0].toLowerCase().includes(k.toLowerCase().slice(0, 4))
        );
        const exposure = appKey ? timePerApp.get(appKey) ?? 0 : 0;
        const fmtExp = (ms) => {
          const m = Math.floor(ms / 6e4);
          const h = Math.floor(m / 60);
          if (h > 0) return `${h}h ${m % 60}m`;
          return m > 0 ? `${m}m` : "—";
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "cursor-pointer transition-colors",
              style: {
                background: isBlocked ? "rgba(52,211,153,0.04)" : i % 2 === 0 ? colors.rowEven : colors.rowOdd,
                borderBottom: `1px solid ${colors.border}`
              },
              onClick: () => setExpanded(isExpanded ? null : platform.name),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-[10px] tabular-nums", style: { color: colors.textSecondary }, children: i + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold whitespace-nowrap", style: { color: colors.textPrimary }, children: platform.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide",
                      style: { background: riskColor + "20", color: riskColor },
                      children: platform.risk
                    }
                  ),
                  isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 10, style: { color: colors.textSecondary } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 10, style: { color: colors.textSecondary } })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-[10px] whitespace-nowrap", style: { color: colors.textSecondary }, children: platform.category }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-1.5 rounded-full overflow-hidden flex-shrink-0", style: { background: colors.border }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: { width: `${platform.score}%`, background: riskColor } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold tabular-nums", style: { color: riskColor }, children: platform.score })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-0.5 max-w-[220px]", children: [
                  platform.techniques.slice(0, 3).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[8px] px-1 py-0.5 rounded",
                      style: { background: colors.cardBg, color: colors.textSecondary },
                      children: t
                    },
                    t
                  )),
                  platform.techniques.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8px]", style: { color: colors.textSecondary }, children: [
                    "+",
                    platform.techniques.length - 3
                  ] })
                ] }) }),
                refreshed && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[10px] font-mono tabular-nums font-semibold",
                      style: { color: exposure > 36e5 ? "#f87171" : exposure > 0 ? "#fbbf24" : colors.textMuted },
                      children: fmtExp(exposure)
                    }
                  ),
                  exposure > 36e5 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[8px] text-accent-orange", children: "this week" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", onClick: (e) => e.stopPropagation(), children: isBlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => unblockDomain(platform.domain),
                    disabled: !!applying,
                    className: "text-[10px] px-2 py-1 rounded-lg font-semibold transition-all disabled:opacity-50",
                    style: { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" },
                    children: isApplying ? "…" : "✓ Blocked"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => blockDomain(platform.domain),
                    disabled: !!applying,
                    className: "flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50",
                    style: { background: "rgba(255,107,53,0.1)", color: "#ff6b35", border: "1px solid rgba(255,107,53,0.2)" },
                    children: isApplying ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 8, className: "animate-spin" }),
                      " …"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 8 }),
                      " Block"
                    ] })
                  }
                ) })
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: colors.panelBg, borderBottom: `1px solid ${colors.border}` }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: refreshed ? 5 : 4, className: "px-3 pb-3 pt-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed mb-2", style: { color: colors.textSecondary }, children: platform.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: platform.techniques.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-[9px] px-2 py-0.5 rounded-full",
                  style: { background: colors.cardBg, color: "#818cf8", border: `1px solid rgba(33,150,243,0.15)` },
                  children: t
                },
                t
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
          ] })
        ] }, platform.name);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl overflow-hidden", style: { border: `1px solid ${colors.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
          style: { background: colors.cardBg },
          onClick: () => setShowGlossary((v) => !v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold", style: { color: colors.textPrimary }, children: "Manipulation Technique Glossary" }),
            showGlossary ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 13, style: { color: colors.textSecondary } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13, style: { color: colors.textSecondary } })
          ]
        }
      ),
      showGlossary && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid grid-cols-2 gap-px",
          style: { background: colors.border, borderTop: `1px solid ${colors.border}` },
          children: TECHNIQUE_GLOSSARY.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2.5", style: { background: colors.cardBg }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold mb-0.5", style: { color: colors.textPrimary }, children: entry.term }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed", style: { color: colors.textSecondary }, children: entry.explanation })
          ] }, entry.term))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] text-center pb-1", style: { color: colors.textSecondary }, children: [
      "Risk scores derived from published research, app store disclosures, and whistleblower accounts · ",
      (/* @__PURE__ */ new Date()).getFullYear()
    ] })
  ] });
}
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function domainOf(s) {
  if (s.url) {
    try {
      return new URL(s.url).hostname.replace(/^www\./, "");
    } catch {
    }
  }
  return s.app;
}
function keyFor(s, groupBy) {
  switch (groupBy) {
    case "app":
      return s.app || "unknown";
    case "category":
      return s.category || "other";
    case "domain":
      return domainOf(s);
    case "hour":
      return String(new Date(s.startTime).getHours());
    case "weekday":
      return WEEKDAYS[new Date(s.startTime).getDay()];
  }
}
function runAnalyticsQuery(sessions, spec) {
  const cutoff = Date.now() - Math.max(1, spec.rangeDays) * 24 * 60 * 60 * 1e3;
  const filtered = sessions.filter((s) => {
    if (s.startTime < cutoff) return false;
    if (spec.distraction === "only" && !s.isDistraction) return false;
    if (spec.distraction === "exclude" && s.isDistraction) return false;
    return true;
  });
  const acc = /* @__PURE__ */ new Map();
  for (const s of filtered) {
    const k = keyFor(s, spec.groupBy);
    const cur = acc.get(k) ?? { time: 0, count: 0, focused: 0 };
    cur.time += s.duration;
    cur.count += 1;
    if (!s.isDistraction) cur.focused += s.duration;
    acc.set(k, cur);
  }
  const unit = spec.metric === "time" ? "ms" : spec.metric === "sessions" ? "count" : "percent";
  let rows = [...acc.entries()].map(([label, v]) => {
    const value = spec.metric === "time" ? v.time : spec.metric === "sessions" ? v.count : v.time > 0 ? Math.round(v.focused / v.time * 100) : 0;
    const detail = spec.metric === "focus_ratio" ? `${v.count} sessions` : spec.metric === "sessions" ? `${Math.round(v.time / 6e4)}m` : `${v.count} sessions`;
    return { label, value, detail };
  });
  if (spec.groupBy === "hour") rows.sort((a, b) => Number(a.label) - Number(b.label));
  else if (spec.groupBy === "weekday") rows.sort((a, b) => WEEKDAYS.indexOf(a.label) - WEEKDAYS.indexOf(b.label));
  else rows.sort((a, b) => b.value - a.value);
  if (spec.limit && spec.limit > 0 && spec.groupBy !== "hour" && spec.groupBy !== "weekday") {
    rows = rows.slice(0, spec.limit);
  }
  if (spec.groupBy === "hour") {
    rows = rows.map((r) => {
      const h = Number(r.label);
      const label = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
      return { ...r, label };
    });
  }
  const totalTime = filtered.reduce((a, s) => a + s.duration, 0);
  const totalFocused = filtered.reduce((a, s) => a + (s.isDistraction ? 0 : s.duration), 0);
  const total = spec.metric === "time" ? totalTime : spec.metric === "sessions" ? filtered.length : totalTime > 0 ? Math.round(totalFocused / totalTime * 100) : 0;
  return { rows, unit, total, matched: filtered.length };
}
const api$9 = window.electronAPI;
const EMPTY_SESSIONS = [];
function AnimatedStat({ value }) {
  const match = value.match(/^(\d+)(.*)$/);
  const rafRef = reactExports.useRef(0);
  const [displayed, setDisplayed] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!match) return;
    const target = parseInt(match[1]);
    const dur = 750;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(target * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  if (!match) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: value });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    displayed,
    match[2]
  ] });
}
function fmt$1(ms) {
  const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4), s = Math.floor(ms % 6e4 / 1e3);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
const INSIGHT_MIN_MS = 20 * 60 * 1e3;
function durOrZero(ms, hasData) {
  if (!hasData) return "No data";
  return ms > 0 ? fmt$1(ms) : "0m";
}
function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}
function fmtHour(h) {
  return h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
}
const CAT_COLOR$1 = {
  browser: "#3b9eff",
  social: "#f87171",
  entertainment: "#f87171",
  gaming: "#ff6b35",
  productivity: "#34d399",
  communication: "#fbbf24",
  development: "#34d399",
  system: "#546e7a",
  other: "#455a64"
};
const SEV = {
  high: { bg: "rgba(248,113,113,0.15)", text: "#f87171", label: "HIGH" },
  medium: { bg: "rgba(251,191,36,0.15)", text: "#fbbf24", label: "MED" },
  low: { bg: "rgba(52,211,153,0.15)", text: "#34d399", label: "LOW" }
};
const TYPE_LABELS = {
  "rapid-switching": "Rapid Switching",
  "repeated-visits": "Repeated Visits",
  "late-night": "Late Night",
  "long-session": "Long Session",
  "focus-drift": "Focus Drift",
  "doom-loop": "Doom Loop",
  "micro-escape": "Micro-Escape",
  "notification-fomo": "Notification FOMO",
  "video-rabbit-hole": "Video Rabbit Hole",
  "phantom-checking": "Phantom Checking",
  "pre-task-avoidance": "Pre-Task Avoidance",
  "news-anxiety": "News Anxiety",
  "tab-anxiety": "Tab Anxiety"
};
function buildDayRows(sessions) {
  const map = /* @__PURE__ */ new Map();
  for (const s of sessions) {
    const key = new Date(s.startTime).toISOString().split("T")[0];
    const cur = map.get(key) ?? { focused: 0, distracted: 0, sessions: 0, apps: /* @__PURE__ */ new Map() };
    if (s.isDistraction) cur.distracted += s.duration;
    else cur.focused += s.duration;
    cur.sessions++;
    cur.apps.set(s.app, (cur.apps.get(s.app) ?? 0) + s.duration);
    map.set(key, cur);
  }
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-7).map(([date, v]) => {
    const d = /* @__PURE__ */ new Date(date + "T12:00:00");
    const tracked = v.focused + v.distracted;
    const score = tracked > 0 ? Math.round(Math.min(100, v.focused / tracked * 120)) : 0;
    const distractRate = tracked > 0 ? Math.round(v.distracted / tracked * 100) : 0;
    const topApp = [...v.apps.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { day: days[d.getDay()], date, focused: v.focused, distracted: v.distracted, tracked, score, sessions: v.sessions, topApp, distractRate };
  });
}
function buildAppRows(sessions, totalTrackedMs) {
  const appMap = /* @__PURE__ */ new Map();
  for (const s of sessions) {
    const cur = appMap.get(s.app) ?? { totalTime: 0, sessions: 0, category: s.category, isDistraction: s.isDistraction };
    cur.totalTime += s.duration;
    cur.sessions++;
    if (s.isDistraction) cur.isDistraction = true;
    appMap.set(s.app, cur);
  }
  const base = totalTrackedMs || 1;
  return Array.from(appMap.entries()).map(([app, v]) => ({
    app,
    category: v.category,
    totalTime: v.totalTime,
    sessions: v.sessions,
    avgDuration: v.sessions > 0 ? Math.round(v.totalTime / v.sessions) : 0,
    pctOfTime: Math.round(v.totalTime / base * 100),
    isDistraction: v.isDistraction
  })).filter((r) => r.totalTime > 5e3).sort((a, b) => b.totalTime - a.totalTime).slice(0, 30);
}
function buildHourRows(sessions) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => new Date(s.startTime).toISOString().split("T")[0] === today);
  const map = /* @__PURE__ */ new Map();
  for (const s of todaySessions) {
    const h = new Date(s.startTime).getHours();
    const cur = map.get(h) ?? { focused: 0, distracted: 0, sessions: 0, apps: /* @__PURE__ */ new Map(), startTimes: [] };
    if (s.isDistraction) cur.distracted += s.duration;
    else cur.focused += s.duration;
    cur.sessions++;
    cur.apps.set(s.app, (cur.apps.get(s.app) ?? 0) + s.duration);
    cur.startTimes.push(s.startTime);
    map.set(h, cur);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b).map(([hour, v]) => {
    const total = v.focused + v.distracted;
    const ratio = total > 0 ? Math.round(v.focused / total * 100) : -1;
    const topApp = [...v.apps.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const trackedHrs = Math.max(total / 36e5, 0.0167);
    const switchRate = Math.round(v.sessions / trackedHrs);
    return { hour, focused: v.focused, distracted: v.distracted, ratio, sessions: v.sessions, topApp, switchRate };
  });
}
function buildHourOfWeekMatrix(sessions) {
  const matrix = Array.from(
    { length: 7 },
    () => Array.from({ length: 24 }, () => ({ focused: 0, distracted: 0 }))
  );
  for (const s of sessions) {
    const d = new Date(s.startTime);
    const dow = (d.getDay() + 6) % 7;
    const h = d.getHours();
    const cell = matrix[dow][h];
    if (s.isDistraction) cell.distracted += s.duration;
    else cell.focused += s.duration;
  }
  return matrix;
}
function buildCategoryBreakdown(sessions) {
  const map = /* @__PURE__ */ new Map();
  for (const s of sessions) map.set(s.category, (map.get(s.category) ?? 0) + s.duration);
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return [...map.entries()].map(([cat, ms]) => ({ cat, ms, color: CAT_COLOR$1[cat], pct: ms / total * 100 })).sort((a, b) => b.ms - a.ms).filter((r) => r.ms > 1e4);
}
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
function buildIdlePeriods(sessions) {
  const IDLE_MIN_MS = 3 * 60 * 1e3;
  const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime);
  const out = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].startTime - sorted[i].endTime;
    if (gap >= IDLE_MIN_MS) {
      out.push({ start: sorted[i].endTime, end: sorted[i + 1].startTime, duration: gap, prevApp: sorted[i].app, nextApp: sorted[i + 1].app });
    }
  }
  return out;
}
function buildRelapses(sessions) {
  const WINDOW_MS = 30 * 60 * 1e3;
  const distractions = [...sessions].filter((s) => s.isDistraction).sort((a, b) => a.startTime - b.startTime);
  const out = [];
  for (let i = 1; i < distractions.length; i++) {
    const prev = distractions[i - 1], curr = distractions[i];
    const gap = curr.startTime - prev.endTime;
    if (gap > 6e4 && gap < WINDOW_MS) {
      out.push({ ts: curr.startTime, app: curr.app, prevApp: prev.app, gapMs: gap, duration: curr.duration });
    }
  }
  return out;
}
function computeStreaks(sessions) {
  const sorted = [...sessions].filter((s) => !s.isDistraction).sort((a, b) => a.startTime - b.startTime);
  const GAP = 5 * 60 * 1e3;
  const streaks = [];
  let cur = 0, curEnd = 0;
  for (const s of sorted) {
    if (cur === 0 || s.startTime - curEnd > GAP) {
      if (cur > 0) streaks.push(cur);
      cur = s.duration;
    } else cur += s.duration;
    curEnd = s.endTime;
  }
  if (cur > 0) streaks.push(cur);
  const now = Date.now();
  let currentStreak = 0;
  for (const s of [...sessions].sort((a, b) => b.startTime - a.startTime)) {
    if (now - s.endTime > GAP) break;
    if (s.isDistraction) break;
    currentStreak += s.duration;
  }
  return {
    longest: streaks.length > 0 ? Math.max(...streaks) : 0,
    current: currentStreak,
    count: streaks.length,
    avgLen: streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0
  };
}
function cellColor(cell) {
  const total = cell.focused + cell.distracted;
  if (total < 3e4) return "rgba(20,38,60,0.5)";
  const r = cell.focused / total;
  if (r >= 0.7) return `rgba(52,211,153,${0.35 + r * 0.55})`;
  if (r >= 0.4) return `rgba(251,191,36,${0.4 + (1 - r) * 0.35})`;
  return `rgba(248,113,113,${0.45 + (1 - r) * 0.4})`;
}
function generateInsights(focusPct, weeklyDistracted, streaks, switchFreq, appRows, hourRows, totalWeekly) {
  if (totalWeekly === 0) return [];
  const out = [];
  if (focusPct >= 70)
    out.push({ label: "Focus", text: `${Math.round(focusPct)}% focus ratio this week — excellent. You're maintaining deep work discipline.`, color: "#34d399" });
  else if (focusPct >= 40)
    out.push({ label: "Focus", text: `${Math.round(focusPct)}% focus ratio — ${fmt$1(weeklyDistracted)} lost to distractions this week. Room to improve.`, color: "#fbbf24" });
  else
    out.push({ label: "Focus", text: `Only ${Math.round(focusPct)}% focus ratio — attention is heavily fragmented. Start by blocking your top distractor.`, color: "#f87171" });
  if (streaks.longest > 54e5)
    out.push({ label: "Streak", text: `Best run: ${fmt$1(streaks.longest)} unbroken. You reach 90m+ deep work blocks — protect that window.`, color: "#34d399" });
  else if (streaks.longest > 12e5)
    out.push({ label: "Streak", text: `Longest run: ${fmt$1(streaks.longest)}. Work toward 90-minute blocks for compounding deep work gains.`, color: "#34d399" });
  else if (streaks.longest > 0)
    out.push({ label: "Streak", text: `Longest run: ${fmt$1(streaks.longest)} — heavily fragmented. Start with 25-minute Pomodoro blocks and extend from there.`, color: "#fbbf24" });
  const topDist = appRows.find((r) => r.isDistraction);
  if (topDist && topDist.pctOfTime >= 3)
    out.push({ label: "Drain", text: `${topDist.app} took ${topDist.pctOfTime}% of tracked time (${fmt$1(topDist.totalTime)}). Blocking it is your highest-ROI change.`, color: "#f87171" });
  if (switchFreq > 20)
    out.push({ label: "Switching", text: `${switchFreq} context switches/h is fragmented. Each switch delays re-entry into deep focus by up to 23 minutes.`, color: "#f87171" });
  else if (switchFreq > 10)
    out.push({ label: "Switching", text: `${switchFreq} switches/h — moderate. Use timed focus sessions to reduce task-switching overhead.`, color: "#fbbf24" });
  else if (switchFreq > 0)
    out.push({ label: "Switching", text: `${switchFreq} switches/h — low context switching. Your focus depth is solid.`, color: "#34d399" });
  const peak = hourRows.filter((r) => r.ratio >= 0 && r.focused > 3e5).sort((a, b) => b.focused - a.focused)[0];
  if (peak)
    out.push({ label: "Peak Hour", text: `Today's strongest hour: ${fmtHour(peak.hour)} — ${fmt$1(peak.focused)} focused at ${peak.ratio}% ratio. Schedule hard work here.`, color: "#3b9eff" });
  return out.slice(0, 4);
}
function FocusLineChart({ hourRows }) {
  const W = 300, H = 72, PL = 8, PR = 28, PT = 6, PB = 12;
  const iW = W - PL - PR, iH = H - PT - PB;
  const pts = Array.from({ length: 24 }, (_, h) => ({ h, v: hourRows.find((r) => r.hour === h)?.ratio ?? -1 })).filter((p) => p.v >= 0);
  if (pts.length < 2) return null;
  const toX = (h) => PL + h / 23 * iW;
  const toY = (v) => PT + iH - v / 100 * iH;
  const lineStr = pts.map((p) => `${toX(p.h)},${toY(p.v)}`).join(" ");
  const areaPath = `M${toX(pts[0].h)},${PT + iH} ${pts.map((p) => `L${toX(p.h)},${toY(p.v)}`).join(" ")} L${toX(pts[pts.length - 1].h)},${PT + iH}Z`;
  const y70 = toY(70), y40 = toY(40);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", style: { display: "block", overflow: "visible" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#6366f1", stopOpacity: "0.25" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#6366f1", stopOpacity: "0.01" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: PL, y1: y70, x2: W - PR, y2: y70, stroke: "rgba(52,211,153,0.2)", strokeWidth: "0.6", strokeDasharray: "3,3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: PL, y1: y40, x2: W - PR, y2: y40, stroke: "rgba(248,113,113,0.2)", strokeWidth: "0.6", strokeDasharray: "3,3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: W - PR + 2, y: y70 + 3, fontSize: "5", fill: "rgba(52,211,153,0.55)", children: "70%" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: W - PR + 2, y: y40 + 3, fontSize: "5", fill: "rgba(248,113,113,0.55)", children: "40%" }),
    [0, 6, 12, 18, 23].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: toX(h), y: H - 1, fontSize: "4.5", fill: "rgba(99,102,241,0.35)", textAnchor: "middle", fontFamily: "Share Tech Mono, monospace", children: fmtHour(h) }, h)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: areaPath, fill: "url(#areaGrad)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: lineStr, fill: "none", stroke: "#6366f1", strokeWidth: "1.6", strokeLinejoin: "round", strokeLinecap: "round", filter: "url(#lineGlow)" }),
    pts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        cx: toX(p.h),
        cy: toY(p.v),
        r: "2",
        fill: p.v >= 70 ? "#34d399" : p.v >= 40 ? "#fbbf24" : "#f87171",
        stroke: "rgba(2,9,18,0.9)",
        strokeWidth: "0.8"
      },
      p.h
    ))
  ] });
}
function DonutChart({ segments }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const R = 34, sw = 13, cx = 44, cy = 44, size = 88;
  const circ = 2 * Math.PI * R;
  let cumPct = 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, style: { flexShrink: 0 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx, cy, r: R, fill: "none", stroke: "rgba(20,38,60,0.6)", strokeWidth: sw }),
    segments.map((seg, i) => {
      const pct = seg.value / total;
      const dash = pct * circ;
      const offset = -(cumPct * circ);
      cumPct += pct;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx,
          cy,
          r: R,
          fill: "none",
          stroke: seg.color,
          strokeWidth: sw,
          strokeDasharray: `${dash} ${circ - dash}`,
          strokeDashoffset: offset,
          transform: `rotate(-90 ${cx} ${cy})`,
          strokeLinecap: "butt"
        },
        i
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: cx, y: cy - 3, textAnchor: "middle", fontSize: "9", fontWeight: "700", fill: "white", children: segments.length }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: cx, y: cx + 8, textAnchor: "middle", fontSize: "5.5", fill: "rgba(107,132,160,0.9)", children: "categories" })
  ] });
}
function SessionTimeline({ sessions }) {
  const todayStart = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
  const now = Date.now();
  const dayMs = now - todayStart;
  const todaySessions = sessions.filter((s) => s.startTime >= todayStart).sort((a, b) => a.startTime - b.startTime);
  if (todaySessions.length === 0) return null;
  const hourMarks = [0, 3, 6, 9, 12, 15, 18, 21];
  const focusedMs = todaySessions.filter((s) => !s.isDistraction).reduce((t, s) => t + s.duration, 0);
  const distMs = todaySessions.filter((s) => s.isDistraction).reduce((t, s) => t + s.duration, 0);
  if (focusedMs + distMs < 12e4) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Today's Session Timeline" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] flex items-center gap-1", style: { color: "rgba(99,102,241,0.45)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-sm", style: { background: "rgba(52,211,153,0.7)" } }),
          fmt$1(focusedMs),
          " focused"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] flex items-center gap-1", style: { color: "rgba(99,102,241,0.45)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-sm", style: { background: "rgba(248,113,113,0.7)" } }),
          fmt$1(distMs),
          " distracted"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-md overflow-hidden", style: { height: 22, background: "rgba(20,38,60,0.5)" }, children: [
      todaySessions.map((s) => {
        const left = (s.startTime - todayStart) / dayMs * 100;
        const width = Math.max(s.duration / dayMs * 100, 0.12);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-0 bottom-0 transition-opacity hover:opacity-90",
            title: `${s.app} · ${fmt$1(s.duration)}`,
            style: {
              left: `${Math.min(left, 99.5)}%`,
              width: `${width}%`,
              background: s.isDistraction ? "rgba(248,113,113,0.75)" : "rgba(52,211,153,0.72)"
            }
          },
          s.id
        );
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 bottom-0 w-px bg-white/40", style: { right: 0 } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", style: { height: 10 }, children: [
      hourMarks.map((h) => {
        const pct = h * 36e5 / dayMs * 100;
        if (pct > 100) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -translate-x-1/2 text-[7.5px]", style: { left: `${pct}%`, color: "rgba(99,102,241,0.2)" }, children: fmtHour(h) }, h);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute text-[7.5px] right-0", style: { color: "rgba(99,102,241,0.45)" }, children: "now" })
    ] })
  ] });
}
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function HourOfWeekHeatmap({ matrix }) {
  const hasData = matrix.some((row) => row.some((c) => c.focused + c.distracted > 0));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Focus Heatmap — Hour of Week" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[8.5px]", style: { color: "rgba(99,102,241,0.45)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm inline-block", style: { background: "rgba(52,211,153,0.75)" } }),
          " focused"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm inline-block", style: { background: "rgba(251,191,36,0.65)" } }),
          " mixed"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm inline-block", style: { background: "rgba(248,113,113,0.7)" } }),
          " distracted"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-sm inline-block", style: { background: "rgba(20,38,60,0.5)" } }),
          " no data"
        ] })
      ] })
    ] }),
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center py-6", style: { color: "rgba(99,102,241,0.3)" }, children: "No session data yet — heatmap populates after several sessions" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5 flex-shrink-0", style: { paddingTop: 14 }, children: DOW_LABELS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8.5px] text-right leading-none", style: { height: 11, lineHeight: "11px", color: "rgba(99,102,241,0.45)" }, children: d }, d)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex mb-0.5", children: Array.from({ length: 24 }, (_, h) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-center", style: { minWidth: 0 }, children: [0, 6, 12, 18].includes(h) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[7.5px]", style: { color: "rgba(99,102,241,0.2)" }, children: fmtHour(h) }) }, h)) }),
        matrix.map((row, dow) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-px mb-px", children: row.map((cell, h) => {
          const total = cell.focused + cell.distracted;
          const ratioStr = total > 0 ? ` · ${Math.round(cell.focused / total * 100)}% focused` : "";
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex-1 rounded-sm",
              style: { height: 11, background: cellColor(cell), minWidth: 0 },
              title: `${DOW_LABELS[dow]} ${fmtHour(h)}${total > 0 ? ` · ${fmt$1(total)} tracked${ratioStr}` : " · no data"}`
            },
            h
          );
        }) }, dow))
      ] })
    ] })
  ] });
}
function HourlyHeatmapRow({ hourRows }) {
  const { colors } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Hourly Focus Map — Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[8.5px]", style: { color: colors.textMuted }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded inline-block", style: { background: "#34d399" } }),
          "focused"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded inline-block", style: { background: "#f87171" } }),
          "distracted"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded inline-block", style: { background: colors.border } }),
          "no data"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5 items-end", style: { height: 36 }, children: Array.from({ length: 24 }, (_, h) => {
      const row = hourRows.find((r) => r.hour === h);
      const total = row ? row.focused + row.distracted : 0;
      const ratio = row ? row.ratio : -1;
      const bg = ratio === -1 ? colors.border : ratio >= 70 ? `rgba(52,211,153,${0.35 + ratio / 100 * 0.6})` : ratio >= 40 ? `rgba(251,191,36,${0.35 + (100 - ratio) / 100 * 0.4})` : `rgba(248,113,113,${0.45 + (100 - ratio) / 100 * 0.45})`;
      const height = total > 0 ? Math.max(18, Math.min(100, total / 36e5 * 100)) : 6;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex-1 flex flex-col items-center gap-0",
          title: row ? `${fmtHour(h)}: ${fmt$1(row.focused)} focused, ${fmt$1(row.distracted)} distracted · ${ratio}% focus ratio` : `${fmtHour(h)}: no data`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-sm", style: { height: `${height}%`, minHeight: 3, background: bg } })
        },
        h
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between mt-1", children: [0, 3, 6, 9, 12, 15, 18, 21].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[7.5px]", style: { color: "rgba(99,102,241,0.2)" }, children: fmtHour(h) }, h)) })
  ] });
}
function CategoryBreakdown({ sessions }) {
  const cats = buildCategoryBreakdown(sessions);
  const total = cats.reduce((s, c) => s + c.ms, 0);
  const meaningfulMs = cats.filter((c) => c.cat.toLowerCase() !== "other").reduce((s, c) => s + c.ms, 0);
  if (cats.length === 0 || total < 12e4 || meaningfulMs / total < 0.15) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-center py-6 leading-relaxed", style: { color: "rgba(120,150,180,0.5)" }, children: [
      "Not enough recognised activity yet.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Category breakdown appears as apps are classified."
    ] });
  }
  const donutData = cats.slice(0, 7).map((c) => ({ label: c.cat, value: c.ms, color: c.color }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DonutChart, { segments: donutData }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1 min-w-0", children: cats.slice(0, 7).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full flex-shrink-0", style: { background: c.color } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9.5px] capitalize flex-1 truncate", style: { color: "rgba(180,210,235,0.6)" }, children: c.cat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9.5px] text-white font-mono tabular-nums", children: fmt$1(c.ms) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8.5px] w-7 text-right tabular-nums", style: { color: "rgba(99,102,241,0.3)" }, children: [
        Math.round(c.pct),
        "%"
      ] })
    ] }, c.cat)) })
  ] });
}
function DayScoreStrip({ dayRows }) {
  if (dayRows.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label mb-2", children: "7-Day Focus Score" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: dayRows.map((d) => {
      const color = d.score >= 70 ? "#34d399" : d.score >= 40 ? "#fbbf24" : "#f87171";
      const isToday = d.date === (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex-1 flex flex-col items-center gap-1",
          title: `${d.day} ${d.date}: ${d.score}% focus score · ${fmt$1(d.focused)} focused, ${fmt$1(d.distracted)} distracted`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-full rounded-md flex items-center justify-center text-[9px] font-bold",
                style: {
                  height: 32,
                  background: `${color}${isToday ? "30" : "18"}`,
                  border: `1px solid ${color}${isToday ? "60" : "25"}`,
                  color,
                  boxShadow: isToday ? `0 0 8px ${color}20` : "none"
                },
                children: d.tracked > 0 ? `${d.score}%` : "—"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8.5px]", style: { color: isToday ? "#818cf8" : "#6b84a0" }, children: d.day })
          ]
        },
        d.date
      );
    }) })
  ] });
}
function AppBarChart({ rows }) {
  const top = rows.slice(0, 10);
  const max = top[0]?.totalTime ?? 1;
  if (top.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-widest mb-2", style: { color: "rgba(99,102,241,0.45)" }, children: "Top Apps — Time Distribution" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: top.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2",
        title: `${row.app} — ${fmt$1(row.totalTime)} total (${row.pctOfTime}% of tracked time) · ${row.sessions} session${row.sessions !== 1 ? "s" : ""} · avg ${fmt$1(row.avgDuration)}/session · ${row.isDistraction ? "classified as distraction" : "classified as productive"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 text-[10px] truncate flex-shrink-0 text-right", style: { color: "rgba(180,210,235,0.6)" }, children: row.app }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-4 overflow-hidden", style: { background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full rounded-sm flex items-center px-1.5",
              style: {
                width: `${row.totalTime / max * 100}%`,
                background: row.isDistraction ? "linear-gradient(90deg, rgba(248,113,113,0.65), rgba(248,113,113,0.35))" : "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(99,102,241,0.25))",
                minWidth: 2
              },
              children: row.totalTime / max > 0.2 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-white/80 font-mono tabular-nums", children: fmt$1(row.totalTime) })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 text-right text-[9px] font-mono tabular-nums flex-shrink-0", style: { color: "rgba(99,102,241,0.45)" }, children: fmt$1(row.totalTime) })
        ]
      },
      row.app
    )) })
  ] });
}
function Analytics({ onChatWith }) {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [appSort, setAppSort] = reactExports.useState({ col: "totalTime", dir: "desc" });
  const [activeTab, setActiveTab] = reactExports.useState("apps");
  const [exporting, setExporting] = reactExports.useState("idle");
  const load = reactExports.useCallback(() => {
    setLoading(true);
    api$9.getAnalytics().then((d) => setData(d)).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const off = api$9.onStoreRefresh?.(() => load());
    return () => {
      off?.();
    };
  }, [load]);
  const dismissAlert = async (id) => {
    await api$9.dismissHeuristicAlert(id);
    load();
  };
  const handleExportPdf = async () => {
    if (exporting === "busy") return;
    setExporting("busy");
    try {
      const result = await api$9.exportPdf();
      const next = result.ok ? "done" : result.canceled ? "idle" : "error";
      setExporting(next);
      if (next !== "idle") setTimeout(() => setExporting("idle"), 2500);
    } catch {
      setExporting("error");
      setTimeout(() => setExporting("idle"), 2500);
    }
  };
  const { colors } = useTheme();
  const sessionsForDerive = data?.recentSessions ?? EMPTY_SESSIONS;
  const derived = reactExports.useMemo(() => {
    const totalTracked2 = sessionsForDerive.reduce((s, r) => s + r.duration, 0);
    return {
      totalTracked: totalTracked2,
      dayRows: buildDayRows(sessionsForDerive),
      appRows: buildAppRows(sessionsForDerive, totalTracked2),
      hourRows: buildHourRows(sessionsForDerive),
      matrix: buildHourOfWeekMatrix(sessionsForDerive),
      streaks: computeStreaks(sessionsForDerive),
      idlePeriods: buildIdlePeriods(sessionsForDerive),
      relapses: buildRelapses(sessionsForDerive)
    };
  }, [sessionsForDerive]);
  if (loading || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full animate-spin", style: { border: `2px solid ${colors.border}`, borderTopColor: colors.accent } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-widest", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: "Loading…" })
    ] }) });
  }
  const { today, weekly, heuristicAlerts, recentSessions } = data;
  const domains = data.domains ?? [];
  const totalWeekly = weekly.focusedTime + weekly.distractedTime;
  const focusPct = totalWeekly > 0 ? weekly.focusedTime / totalWeekly * 100 : 0;
  const activeAlerts = heuristicAlerts.filter((a) => !a.dismissed);
  const { totalTracked, dayRows, appRows, hourRows, matrix, streaks, idlePeriods, relapses } = derived;
  const weeklyAvgScore = dayRows.length > 0 ? Math.round(dayRows.reduce((s, r) => s + r.score, 0) / dayRows.length) : 0;
  const todayTracked = today.focusedTime + today.distractedTime + today.neutralTime;
  const switchFreq = recentSessions.length > 0 && totalTracked > 0 ? Math.round(recentSessions.length / (totalTracked / 36e5) * 10) / 10 : 0;
  const topDistractor = appRows.find((r) => r.isDistraction);
  const distractDebtMs = weekly.distractedTime;
  const avgDailyWastedMs = distractDebtMs > 0 ? Math.round(distractDebtMs / Math.max(dayRows.length, 1)) : 0;
  const insights = generateInsights(focusPct, weekly.distractedTime, streaks, switchFreq, appRows, hourRows, totalWeekly);
  const todayStart = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
  const todayIdlePeriods = idlePeriods.filter((ip) => ip.start >= todayStart);
  const todayIdleMs = todayIdlePeriods.reduce((s, ip) => s + ip.duration, 0);
  const todayRelapses = relapses.filter((r) => r.ts >= todayStart);
  const sortedApps = [...appRows].sort((a, b) => {
    const av = a[appSort.col];
    const bv = b[appSort.col];
    if (typeof av === "number" && typeof bv === "number") return appSort.dir === "asc" ? av - bv : bv - av;
    return appSort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  const toggleSort = (col) => setAppSort((p) => p.col === col ? { col, dir: p.dir === "asc" ? "desc" : "asc" } : { col, dir: "desc" });
  const SortIcon = ({ col }) => appSort.col !== col ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 9, style: { color: "rgba(99,102,241,0.25)" } }) : appSort.dir === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 9, style: { color: "#6366f1" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 9, style: { color: "#6366f1" } });
  const handleAskDaemon = () => {
    if (!onChatWith) return;
    const topApp = appRows[0]?.app ?? "unknown";
    const topDist = appRows.find((r) => r.isDistraction)?.app ?? "none";
    onChatWith(
      `Analytics: ${Math.round(focusPct)}% focus ratio this week, ${fmt$1(weekly.focusedTime)} focused, ${fmt$1(weekly.distractedTime)} distracted. Top app: "${topApp}", top distraction: "${topDist}". Today focus score: ${Math.round(today.focusScore)}%, ${today.blockEvents} blocks. Switch rate: ${switchFreq}/h. Longest streak: ${fmt$1(streaks.longest)}. Give me a detailed analysis and specific actions I should take.`
    );
  };
  const kpiChip = (chip, i, baseDelay = 0) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "section-panel flex flex-col gap-1 p-3 animate-entry",
      style: { animationDelay: `${baseDelay + i * 55}ms`, animationFillMode: "both", opacity: 0, cursor: "default" },
      title: chip.tooltip,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold leading-none data-value", style: { color: chip.color }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedStat, { value: chip.value }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] leading-tight", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: chip.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[8px]", style: { color: colors.textDim, fontFamily: '"Share Tech Mono", monospace' }, children: chip.sub })
      ]
    },
    chip.label
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart2, { size: 16, style: { color: colors.accent, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-[14px]", style: { color: colors.textPrimary }, children: "Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] mt-0.5", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: [
            recentSessions.length,
            " sessions tracked"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        onChatWith && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleAskDaemon,
            className: "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium transition-all hover:opacity-80",
            style: { background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 10 }),
              " Ask AI"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleExportPdf,
            disabled: exporting === "busy",
            className: "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
            style: {
              background: exporting === "done" ? "rgba(52,211,153,0.08)" : exporting === "error" ? "rgba(248,113,113,0.08)" : colors.accentBg,
              color: exporting === "done" ? "#34d399" : exporting === "error" ? "#f87171" : colors.textMuted,
              border: `1px solid ${exporting === "done" ? "rgba(52,211,153,0.3)" : exporting === "error" ? "rgba(248,113,113,0.3)" : colors.border}`
            },
            title: "Export report as PDF",
            children: exporting === "busy" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 9, className: "animate-spin" }),
              " Exporting…"
            ] }) : exporting === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 9 }),
              " Saved"
            ] }) : exporting === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 9 }),
              " Failed"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 9 }),
              " Export PDF"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: load,
            className: "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium transition-all hover:opacity-80",
            style: { background: colors.accentBg, color: colors.textMuted, border: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 9 }),
              " Refresh"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CustomAnalyticsSection, {}),
    totalWeekly < INSIGHT_MIN_MS ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel px-3 py-3 flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 12, style: { color: colors.accent, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed", style: { color: colors.textSecondary }, children: "Not enough data yet to draw conclusions — keep Attentify running and insights will appear once there's enough activity to be meaningful." })
    ] }) : insights.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", style: { gridTemplateColumns: `repeat(${insights.length}, 1fr)` }, children: insights.map((ins, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "section-panel px-3 py-2.5 flex flex-col gap-1.5 animate-entry",
        style: { borderLeft: `2px solid ${ins.color}`, animationDelay: `${i * 70}ms`, animationFillMode: "both", opacity: 0 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 9, style: { color: ins.color, flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-semibold uppercase tracking-wide", style: { color: ins.color, fontFamily: '"Share Tech Mono", monospace' }, children: ins.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed", style: { color: colors.textSecondary }, children: ins.text })
        ]
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnalyticsSectionHeader,
      {
        label: "Today",
        sub: (/* @__PURE__ */ new Date()).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-1.5", children: [
      { label: "Focus Score", value: todayTracked > 0 ? `${Math.round(today.focusScore)}%` : "No data", color: today.focusScore >= 70 ? "#34d399" : today.focusScore >= 40 ? "#fbbf24" : "#f87171", sub: todayTracked > 0 ? `${fmt$1(todayTracked)} tracked` : "keep tracking", tooltip: `${Math.round(today.focusScore)}% focus score` },
      { label: "Focused", value: durOrZero(today.focusedTime, todayTracked > 0), color: "#6366f1", sub: todayTracked > 0 ? `${Math.round(today.focusedTime / todayTracked * 100)}% of tracked` : "keep tracking", tooltip: `${fmt$1(today.focusedTime)} on productive apps today` },
      { label: "Distracted", value: durOrZero(today.distractedTime, todayTracked > 0), color: today.distractedTime > 36e5 ? "#f87171" : "#fbbf24", sub: todayTracked > 0 ? `${Math.round(today.distractedTime / todayTracked * 100)}% of tracked` : "keep tracking", tooltip: `${fmt$1(today.distractedTime)} on distracting apps` },
      { label: "Switch Rate", value: todayTracked > 0 ? `${switchFreq}/h` : "No data", color: switchFreq > 20 ? "#f87171" : switchFreq > 10 ? "#fbbf24" : "#34d399", sub: todayTracked > 0 ? switchFreq > 20 ? "fragmented" : "steady" : "keep tracking", tooltip: `${switchFreq} app switches/h` },
      { label: "Idle Time", value: durOrZero(todayIdleMs, todayTracked > 0), color: todayIdleMs > 36e5 ? "#fbbf24" : "rgba(99,102,241,0.5)", sub: todayIdlePeriods.length > 0 ? `${todayIdlePeriods.length} gap${todayIdlePeriods.length !== 1 ? "s" : ""} ≥3m` : todayTracked > 0 ? "no idle gaps" : "keep tracking", tooltip: `${fmt$1(todayIdleMs)} idle today (gaps ≥3m between sessions)` },
      { label: "Relapses", value: String(todayRelapses.length), color: todayRelapses.length > 3 ? "#f87171" : todayRelapses.length > 0 ? "#fbbf24" : "#34d399", sub: todayRelapses.length > 0 ? "returned to dist." : "none today", tooltip: `${todayRelapses.length} times returned to distraction within 30m` },
      { label: "Blocked", value: String(today.blockEvents || 0), color: "#6366f1", sub: "blocked today", tooltip: `${today.blockEvents} blocked attempts today` },
      { label: "Sessions", value: String(today.focusSessions), color: "#6366f1", sub: "started today", tooltip: `${today.focusSessions} focus sessions today` }
    ].map((chip, i) => kpiChip(chip, i, 0)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SessionTimeline, { sessions: recentSessions }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HourlyHeatmapRow, { hourRows }),
          hourRows.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label mb-2", children: "Focus Score Curve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FocusLineChart, { hourRows })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label mb-2.5", children: "Time by Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBreakdown, { sessions: recentSessions })
      ] })
    ] }),
    (todayRelapses.length > 0 || todayIdlePeriods.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(RelapseTracker, { relapses: todayRelapses, idlePeriods: todayIdlePeriods }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnalyticsSectionHeader,
      {
        label: "This Week",
        sub: `${dayRows.length} day${dayRows.length !== 1 ? "s" : ""} tracked · ${Math.round(focusPct)}% focus ratio`
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 gap-1.5", children: [
      { label: "Focus Time", value: fmt$1(weekly.focusedTime), color: "#34d399", sub: `${Math.round(focusPct)}% ratio`, tooltip: `${fmt$1(weekly.focusedTime)} focused this week` },
      { label: "Time Lost", value: fmt$1(weekly.distractedTime), color: weekly.distractedTime > 7 * 36e5 ? "#f87171" : "#fbbf24", sub: `${Math.round(100 - focusPct)}% ratio`, tooltip: `${fmt$1(weekly.distractedTime)} on distractions` },
      { label: "Avg Score", value: `${weeklyAvgScore}%`, color: weeklyAvgScore >= 70 ? "#34d399" : weeklyAvgScore >= 40 ? "#fbbf24" : "#f87171", sub: `${dayRows.length} days`, tooltip: `Average daily focus score` },
      { label: "Longest Run", value: streaks.longest > 0 ? fmt$1(streaks.longest) : "—", color: "#34d399", sub: "unbroken focus", tooltip: `Longest unbroken focus streak` },
      { label: "Avg Run", value: streaks.avgLen > 0 ? fmt$1(streaks.avgLen) : "—", color: "#6366f1", sub: `${streaks.count} streaks`, tooltip: `Average streak length` },
      { label: "Blocked", value: String(weekly.blockEvents), color: "#6366f1", sub: "this week", tooltip: `${weekly.blockEvents} total block events` }
    ].map((chip, i) => kpiChip(chip, i, 330)) }),
    totalWeekly > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Focus vs Distraction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-[9px]", style: { color: "rgba(99,102,241,0.4)", fontFamily: '"Share Tech Mono", monospace' }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-1.5", style: { background: "#34d399" } }),
                fmt$1(weekly.focusedTime),
                " focused"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-1.5", style: { background: "#ff6b35" } }),
                fmt$1(weekly.distractedTime),
                " distracted"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex overflow-hidden h-2", style: { background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }, children: [
            focusPct > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bar-fill", style: { width: `${focusPct}%`, background: "linear-gradient(90deg, rgba(0,100,50,0.9), rgba(52,211,153,0.85))" } }),
            weekly.distractedTime > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bar-fill delay-2", style: { width: `${weekly.distractedTime / totalWeekly * 100}%`, background: "linear-gradient(90deg, rgba(140,30,10,0.9), rgba(255,107,53,0.8))" } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex mt-1.5 gap-1", children: dayRows.map((d) => {
            const focused = d.tracked > 0 ? d.focused / d.tracked * 100 : 0;
            const distracted = d.tracked > 0 ? d.distracted / d.tracked * 100 : 0;
            const isToday = d.date === (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-0.5", title: `${d.day}: ${d.score}% focus score`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full overflow-hidden flex flex-col-reverse", style: { height: 20, background: "rgba(99,102,241,0.03)", border: isToday ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(99,102,241,0.06)" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: focused, background: "rgba(52,211,153,0.5)", minHeight: focused > 0 ? 1 : 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: distracted, background: "rgba(255,107,53,0.45)", minHeight: distracted > 0 ? 1 : 0 } }),
                d.tracked === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", style: { background: "rgba(99,102,241,0.03)" } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[7px] text-center data-value", style: { color: isToday ? "rgba(99,102,241,0.7)" : "rgba(99,102,241,0.25)" }, children: d.day.slice(0, 2) })
            ] }, d.date);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DayScoreStrip, { dayRows }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [
        { label: "Distraction Debt", value: fmt$1(distractDebtMs), sub: "lost this week", detail: avgDailyWastedMs > 0 ? `~${fmt$1(avgDailyWastedMs)}/day avg` : null, color: "#f87171" },
        { label: "Switch Cost", value: recentSessions.length > 0 ? fmt$1(recentSessions.length * 23 * 6e4) : "—", sub: "recovery overhead", detail: `${recentSessions.length} switches × 23m`, color: "#fbbf24" },
        { label: "Reclaim Potential", value: topDistractor ? fmt$1(topDistractor.totalTime) : "—", sub: topDistractor ? `block ${topDistractor.app}` : "no distractors", detail: topDistractor ? `${topDistractor.pctOfTime}% of time` : null, color: "#34d399" }
      ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "section-panel p-3 animate-entry",
          style: { borderLeft: `2px solid ${card.color}`, animationFillMode: "both", opacity: 0 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[8px] uppercase tracking-wide mb-1.5", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: card.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold leading-none data-value", style: { color: card.color }, children: card.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] mt-1 leading-snug", style: { color: colors.textSecondary }, children: card.sub }),
            card.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[8px] mt-0.5 data-value", style: { color: colors.textDim, fontFamily: '"Share Tech Mono", monospace' }, children: card.detail })
          ]
        },
        card.label
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsSectionHeader, { label: "Patterns", sub: "Hour-of-week focus distribution" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HourOfWeekHeatmap, { matrix }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsSectionHeader, { label: "Deep Dive", sub: `${recentSessions.length} sessions · ${sortedApps.length} apps tracked` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0", style: { borderBottom: `1px solid ${colors.border}` }, children: [
      { id: "apps", label: `Apps (${sortedApps.length})` },
      { id: "websites", label: `Websites (${domains.length})` },
      { id: "daily", label: `Daily (${dayRows.length}d)` },
      { id: "patterns", label: "Patterns" },
      { id: "alerts", label: `Alerts${activeAlerts.length > 0 ? ` (${activeAlerts.length})` : ""}` },
      { id: "log", label: `Log (${Math.min(recentSessions.length, 100)})` }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: "px-4 py-2 text-[10px] font-medium transition-all border-b-2 -mb-px",
        style: { color: activeTab === tab.id ? colors.accent : colors.textMuted, borderBottomColor: activeTab === tab.id ? colors.accent : "transparent", background: "transparent" },
        children: tab.label
      },
      tab.id
    )) }),
    activeTab === "apps" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AppBarChart, { rows: sortedApps }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AppTable, { rows: sortedApps, toggleSort, SortIcon })
    ] }),
    activeTab === "websites" && /* @__PURE__ */ jsxRuntimeExports.jsx(WebsitesTab, { domains, sessions: recentSessions }),
    activeTab === "daily" && /* @__PURE__ */ jsxRuntimeExports.jsx(DailyTable, { rows: dayRows }),
    activeTab === "patterns" && /* @__PURE__ */ jsxRuntimeExports.jsx(PatternsTab, { hourRows, streaks, sessions: recentSessions }),
    activeTab === "alerts" && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertsTable, { alerts: heuristicAlerts, onDismiss: dismissAlert }),
    activeTab === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityLog, { sessions: [...recentSessions].reverse().slice(0, 100) })
  ] });
}
function AnalyticsSectionHeader({ label, sub }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider flex-shrink-0", style: { color: "var(--label)", fontFamily: '"Share Tech Mono", monospace' }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "var(--border)" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] flex-shrink-0", style: { color: "var(--text-dim)", fontFamily: '"Share Tech Mono", monospace' }, children: sub })
  ] });
}
function Th({ children, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "th",
    {
      className: "px-2.5 py-2 text-left text-[8px] font-bold uppercase whitespace-nowrap",
      onClick,
      style: {
        cursor: onClick ? "pointer" : "default",
        color: "rgba(99,102,241,0.45)",
        background: "rgba(2,8,18,0.9)",
        borderBottom: "1px solid rgba(99,102,241,0.1)",
        fontFamily: '"Share Tech Mono", monospace',
        letterSpacing: "0.16em"
      },
      children
    }
  );
}
function AppTable({ rows, toggleSort, SortIcon }) {
  const { colors } = useTheme();
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { text: "No app activity recorded yet. The tracker populates as you use your device." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { onClick: () => toggleSort("app"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "App ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { col: "app" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Cat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { onClick: () => toggleSort("totalTime"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "Total ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { col: "totalTime" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { onClick: () => toggleSort("pctOfTime"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "% ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { col: "pctOfTime" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { onClick: () => toggleSort("sessions"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "Sessions ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { col: "sessions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { onClick: () => toggleSort("avgDuration"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "Avg ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { col: "avgDuration" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Type" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: i % 2 === 0 ? colors.rowEven : colors.rowOdd }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium truncate max-w-[140px]", style: { color: colors.textPrimary }, children: row.app }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide", style: { background: CAT_COLOR$1[row.category] + "22", color: CAT_COLOR$1[row.category] }, children: row.category.slice(0, 4) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: fmt$1(row.totalTime) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-1 overflow-hidden", style: { background: "rgba(99,102,241,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: { width: `${Math.min(100, row.pctOfTime)}%`, background: row.isDistraction ? "#f87171" : "#6366f1" } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tabular-nums", style: { color: "rgba(180,210,235,0.6)" }, children: [
          row.pctOfTime,
          "%"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: row.sessions }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: fmt$1(row.avgDuration) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: row.isDistraction ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase", style: { background: "rgba(248,113,113,0.15)", color: "#f87171" }, children: "DIST" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase", style: { background: "rgba(52,211,153,0.12)", color: "#34d399" }, children: "FOCUS" }) })
    ] }, row.app)) })
  ] }) });
}
function DailyTable({ rows }) {
  const { colors } = useTheme();
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { text: "No daily data yet — sessions accumulate here over time." });
  const totals = rows.reduce((acc, r) => ({
    focused: acc.focused + r.focused,
    distracted: acc.distracted + r.distracted,
    tracked: acc.tracked + r.tracked,
    sessions: acc.sessions + r.sessions
  }), { focused: 0, distracted: 0, tracked: 0, sessions: 0 });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Day" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Tracked" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Focused" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Distracted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Distract%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Score" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Sessions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Top App" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
      rows.map((row, i) => {
        const isToday = row.date === (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: {
          background: isToday ? colors.accentBg : i % 2 === 0 ? colors.rowEven : colors.rowOdd,
          outline: isToday ? "1px solid rgba(99,102,241,0.12)" : "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2.5 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-[11px] font-semibold", children: row.day }),
            isToday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[8px] px-1 py-0.5", style: { background: "rgba(99,102,241,0.12)", color: "#6366f1", fontFamily: '"Share Tech Mono", monospace' }, children: "today" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[10px] font-mono tabular-nums", style: { color: "rgba(99,102,241,0.3)" }, children: row.date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: row.tracked > 0 ? fmt$1(row.tracked) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: row.focused > 0 ? "#34d399" : "#4a6280" }, children: row.focused > 0 ? fmt$1(row.focused) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: row.distracted > 36e5 ? "#f87171" : row.distracted > 0 ? "#fbbf24" : "#4a6280" }, children: row.distracted > 0 ? fmt$1(row.distracted) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tabular-nums", style: { color: row.distractRate > 50 ? "#f87171" : row.distractRate > 25 ? "#fbbf24" : "#34d399" }, children: row.tracked > 0 ? `${row.distractRate}%` : "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-1 overflow-hidden", style: { background: "rgba(99,102,241,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: { width: `${row.score}%`, background: row.score >= 70 ? "#34d399" : row.score >= 40 ? "#fbbf24" : "#f87171" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tabular-nums font-mono", style: { color: row.score >= 70 ? "#34d399" : row.score >= 40 ? "#fbbf24" : "#f87171" }, children: [
              row.score,
              "%"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: row.sessions }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[10px] truncate max-w-[90px]", style: { color: "rgba(99,102,241,0.45)" }, children: row.topApp })
        ] }, row.date);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "rgba(99,102,241,0.04)", borderTop: "1px solid rgba(99,102,241,0.1)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2.5 py-1.5 text-[10px] font-bold text-white", colSpan: 2, children: [
          "Total (",
          rows.length,
          " days)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: fmt$1(totals.tracked) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "#34d399" }, children: fmt$1(totals.focused) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "#f87171" }, children: fmt$1(totals.distracted) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[10px]", style: { color: totals.tracked > 0 && totals.distracted / totals.tracked > 0.5 ? "#f87171" : "#fbbf24" }, children: totals.tracked > 0 ? `${Math.round(totals.distracted / totals.tracked * 100)}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3 })
      ] })
    ] })
  ] }) });
}
function PatternsTab({ hourRows, streaks, sessions }) {
  const { colors } = useTheme();
  const peakFocusHour = hourRows.length > 0 ? hourRows.filter((r) => r.ratio >= 0).reduce((best, r) => r.focused > best.focused ? r : best, hourRows[0]) : null;
  const peakDistractHour = hourRows.length > 0 ? hourRows.filter((r) => r.ratio >= 0).reduce((best, r) => r.distracted > best.distracted ? r : best, hourRows[0]) : null;
  const distractApps = sessions.filter((s) => s.isDistraction);
  const distractMap = /* @__PURE__ */ new Map();
  for (const s of distractApps) distractMap.set(s.app, (distractMap.get(s.app) ?? 0) + s.duration);
  const topDistractors = [...distractMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalDistracted = topDistractors.reduce((s, [, m]) => s + m, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: [
      { label: "Longest Focus Run", value: streaks.longest > 0 ? fmt$1(streaks.longest) : "—", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 12, style: { color: "#34d399" } }), color: "#34d399" },
      { label: "Current Streak", value: streaks.current > 0 ? fmt$1(streaks.current) : "None", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, style: { color: "#34d399" } }), color: streaks.current > 0 ? "#34d399" : "rgba(99,102,241,0.25)" },
      { label: "Avg Focus Run", value: streaks.avgLen > 0 ? fmt$1(streaks.avgLen) : "—", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12, style: { color: "rgba(99,102,241,0.5)" } }), color: "#6366f1" },
      { label: "Peak Focus Hour", value: peakFocusHour ? fmtHour(peakFocusHour.hour) : "—", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 12, style: { color: "#6366f1" } }), color: "#6366f1" }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
        s.icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: s.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-black data-value", style: { color: s.color, textShadow: `0 0 12px ${s.color}55` }, children: s.value })
    ] }, s.label)) }),
    hourRows.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Hourly Focus Score — Today" }),
        peakDistractHour && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px]", style: { color: "rgba(99,102,241,0.45)" }, children: [
          "Peak distraction: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#f87171" }, children: fmtHour(peakDistractHour.hour) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FocusLineChart, { hourRows })
    ] }),
    streaks.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label mb-2", children: "Focus Streak History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 flex-wrap", children: (() => {
        const focusSessions = [...sessions].filter((s) => !s.isDistraction).sort((a, b) => a.startTime - b.startTime);
        const GAP = 5 * 60 * 1e3;
        const streakBlocks = [];
        let cur = 0, curEnd = 0;
        for (const s of focusSessions) {
          if (cur === 0 || s.startTime - curEnd > GAP) {
            if (cur > 0) streakBlocks.push(cur);
            cur = s.duration;
          } else cur += s.duration;
          curEnd = s.endTime;
        }
        if (cur > 0) streakBlocks.push(cur);
        const maxBlock = Math.max(...streakBlocks, 1);
        return streakBlocks.slice(-20).map((ms, i) => {
          const h = Math.max(8, Math.round(ms / maxBlock * 40));
          const color = ms > 36e5 ? "#34d399" : ms > 18e5 ? "#34d399" : ms > 9e5 ? "#fbbf24" : "#546e7a";
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-sm flex-shrink-0", style: { width: 10, height: h, background: color, opacity: 0.8 }, title: fmt$1(ms) }, i);
        });
      })() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] mt-1.5 hud-label", style: { color: "rgba(99,102,241,0.25)" }, children: "Each bar = one unbroken focus streak · height = duration" })
    ] }),
    topDistractors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label mb-1.5", children: "Top Distraction Vectors — This Week" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "App" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Time Lost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Share of Distractions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Impact" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: topDistractors.map(([app, ms], i) => {
          const share = totalDistracted > 0 ? Math.round(ms / totalDistracted * 100) : 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: i % 2 === 0 ? colors.rowEven : colors.rowOdd }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[11px] font-medium truncate max-w-[160px]", style: { color: colors.textPrimary }, children: app }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: "#f87171" }, children: fmt$1(ms) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-1 overflow-hidden", style: { background: "rgba(99,102,241,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: { width: `${share}%`, background: "#f87171" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tabular-nums", style: { color: "rgba(180,210,235,0.6)" }, children: [
                share,
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded font-semibold", style: {
              background: share > 40 ? "rgba(248,113,113,0.15)" : share > 20 ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.1)",
              color: share > 40 ? "#f87171" : share > 20 ? "#fbbf24" : "#34d399"
            }, children: share > 40 ? "HIGH" : share > 20 ? "MED" : "LOW" }) })
          ] }, app);
        }) })
      ] }) })
    ] }),
    hourRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label mb-1.5", children: "Hourly Breakdown — Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Hour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Focused" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Distracted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Focus Ratio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Sessions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Switches/h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Top App" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: hourRows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: i % 2 === 0 ? colors.rowEven : colors.rowOdd }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap", style: { color: colors.textPrimary }, children: fmtHour(row.hour) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: row.focused > 0 ? "#34d399" : "#4a6280" }, children: row.focused > 0 ? fmt$1(row.focused) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: row.distracted > 0 ? "#f87171" : "#4a6280" }, children: row.distracted > 0 ? fmt$1(row.distracted) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: row.ratio >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-1 overflow-hidden", style: { background: "rgba(99,102,241,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: { width: `${row.ratio}%`, background: row.ratio >= 70 ? "#34d399" : row.ratio >= 40 ? "#fbbf24" : "#f87171" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tabular-nums", style: { color: row.ratio >= 70 ? "#34d399" : row.ratio >= 40 ? "#fbbf24" : "#f87171" }, children: [
              row.ratio,
              "%"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "rgba(99,102,241,0.2)" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.6)" }, children: row.sessions }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 tabular-nums text-[10px]", style: { color: row.switchRate > 20 ? "#f87171" : row.switchRate > 10 ? "#fbbf24" : "#34d399" }, children: row.switchRate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[10px] truncate max-w-[110px]", style: { color: "rgba(180,210,235,0.6)" }, children: row.topApp })
        ] }, row.hour)) })
      ] }) })
    ] })
  ] });
}
function AlertsTable({ alerts, onDismiss }) {
  const { colors } = useTheme();
  if (alerts.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { text: "No behavioral anomalies detected this week. Your focus patterns look clean." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Time" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Pattern" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Sev" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "App" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Action" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [...alerts].reverse().map((alert, i) => {
      const sev = SEV[alert.severity];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: alert.dismissed ? colors.panelBg : i % 2 === 0 ? colors.rowEven : colors.rowOdd, opacity: alert.dismissed ? 0.5 : 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2.5 py-1.5 text-[9px] font-mono whitespace-nowrap", style: { color: "rgba(99,102,241,0.45)" }, children: [
          fmtTime(alert.detectedAt),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "rgba(99,102,241,0.2)" }, children: fmtDate(alert.detectedAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[11px] font-medium text-white whitespace-nowrap", children: TYPE_LABELS[alert.type] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] px-1.5 py-0.5 rounded font-bold", style: { background: sev.bg, color: sev.text }, children: sev.label }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[10px] max-w-[200px] leading-tight", style: { color: "rgba(180,210,235,0.6)" }, children: alert.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 text-[9px] truncate max-w-[80px]", style: { color: "rgba(99,102,241,0.45)" }, children: alert.app ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: alert.dismissed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px]", style: { color: "rgba(99,102,241,0.2)" }, children: "dismissed" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onDismiss(alert.id), className: "flex items-center gap-1 text-[9px] px-2 py-1 hover:text-white transition-colors", style: { background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "rgba(99,102,241,0.5)", fontFamily: '"Share Tech Mono", monospace' }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 8 }),
          " Dismiss"
        ] }) })
      ] }, alert.id);
    }) })
  ] }) });
}
function ActivityLog({ sessions }) {
  const { colors } = useTheme();
  if (sessions.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { text: "No activity sessions recorded yet." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Start" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "End" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "App" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Domain / Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Duration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Cat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Type" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sessions.map((s, i) => {
      const domain = s.url ? extractDomain(s.url) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: s.isDistraction ? "rgba(248,113,113,0.04)" : i % 2 === 0 ? colors.rowEven : colors.rowOdd }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1 text-[9px] font-mono whitespace-nowrap tabular-nums", style: { color: colors.textSecondary }, children: fmtTime(s.startTime) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1 text-[9px] font-mono whitespace-nowrap tabular-nums", style: { color: colors.textMuted }, children: fmtTime(s.endTime) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-medium truncate max-w-[90px]", style: { color: colors.textPrimary }, children: s.app }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1", children: domain ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-mono truncate max-w-[150px]", style: { color: "#6366f1" }, children: domain }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[8px] truncate max-w-[150px]", style: { color: colors.textMuted }, children: s.title })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] truncate max-w-[150px]", style: { color: colors.textSecondary }, children: s.title }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1 text-[10px] font-mono tabular-nums whitespace-nowrap", style: { color: s.isDistraction ? "#f87171" : colors.textSecondary }, children: fmt$1(s.duration) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] px-1 py-0.5 rounded font-semibold", style: { background: CAT_COLOR$1[s.category] + "18", color: CAT_COLOR$1[s.category] }, children: s.category.slice(0, 4) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1", children: s.isDistraction ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 8, style: { color: "#f87171" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px]", style: { color: "#f87171" }, children: "dist" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px]", style: { color: "#34d399" }, children: "focus" }) })
      ] }, s.id);
    }) })
  ] }) });
}
function WebsitesTab({ domains, sessions }) {
  const { colors } = useTheme();
  const urlDomainMap = /* @__PURE__ */ new Map();
  for (const s of sessions) {
    if (!s.url) continue;
    const domain = extractDomain(s.url);
    if (!domain) continue;
    const cur = urlDomainMap.get(domain) ?? { total_ms: 0, visits: 0, isDistraction: s.isDistraction };
    cur.total_ms += s.duration;
    cur.visits++;
    if (s.isDistraction) cur.isDistraction = true;
    urlDomainMap.set(domain, cur);
  }
  const merged = /* @__PURE__ */ new Map();
  for (const d of domains) {
    merged.set(d.domain, { total_ms: d.total_ms, category: d.category, classification: d.classification, visits: 0, isDistraction: d.classification === "distract" });
  }
  for (const [domain, v] of urlDomainMap) {
    const existing = merged.get(domain);
    if (existing) {
      existing.visits = v.visits;
      if (v.total_ms > existing.total_ms) existing.total_ms = v.total_ms;
    } else {
      merged.set(domain, { total_ms: v.total_ms, category: "browser", classification: v.isDistraction ? "distract" : "neutral", visits: v.visits, isDistraction: v.isDistraction });
    }
  }
  const rows = [...merged.entries()].map(([domain, v]) => ({ domain, ...v })).filter((r) => r.total_ms > 5e3).sort((a, b) => b.total_ms - a.total_ms).slice(0, 50);
  const maxMs = rows[0]?.total_ms ?? 1;
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { text: "No website visits recorded yet. Website tracking activates when browser URLs are captured via system accessibility APIs." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-panel overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "hud-table", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Domain" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Category" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Classification" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Time" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Share" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Visits" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => {
      const pct = Math.round(row.total_ms / maxMs * 100);
      const clsColor = row.classification === "distract" ? "#f87171" : row.classification === "focus" ? "#34d399" : "#607d8b";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: row.classification === "distract" ? "rgba(248,113,113,0.03)" : i % 2 === 0 ? colors.rowEven : colors.rowOdd }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 9, style: { color: "rgba(99,102,241,0.35)", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-mono truncate max-w-[150px]", style: { color: colors.textPrimary }, children: row.domain })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded font-semibold capitalize", style: { background: "rgba(99,102,241,0.08)", color: "rgba(99,102,241,0.6)" }, children: row.category }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase", style: { background: clsColor + "22", color: clsColor }, children: row.classification }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 font-mono tabular-nums text-[10px]", style: { color: row.classification === "distract" ? "#f87171" : colors.textSecondary }, children: fmt$1(row.total_ms) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-1 overflow-hidden", style: { background: "rgba(99,102,241,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: { width: `${pct}%`, background: row.classification === "distract" ? "#f87171" : "#6366f1" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] tabular-nums", style: { color: "rgba(180,210,235,0.6)" }, children: [
            pct,
            "%"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2.5 py-1.5 tabular-nums text-[10px]", style: { color: "rgba(180,210,235,0.5)" }, children: row.visits > 0 ? row.visits : "—" })
      ] }, row.domain);
    }) })
  ] }) });
}
function RelapseTracker({ relapses, idlePeriods }) {
  const { colors } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 10, style: { color: relapses.length > 0 ? "#fbbf24" : "#34d399", flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Relapse Events — Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold data-value", style: { color: relapses.length > 3 ? "#f87171" : relapses.length > 0 ? "#fbbf24" : "#34d399" }, children: relapses.length })
      ] }),
      relapses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px]", style: { color: colors.textDim, fontFamily: '"Share Tech Mono", monospace' }, children: "No relapses today — discipline holding." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 max-h-28 overflow-y-auto", children: [...relapses].reverse().slice(0, 6).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-1 px-1.5", style: { background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-mono flex-shrink-0", style: { color: "rgba(99,102,241,0.35)" }, children: new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] truncate max-w-[80px]", style: { color: colors.textPrimary }, children: r.app }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8px] flex-shrink-0 ml-auto", style: { color: colors.textDim }, children: [
          "+",
          fmt$1(r.gapMs)
        ] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10, style: { color: "rgba(99,102,241,0.5)", flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hud-label", children: "Idle Gaps — Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[9px] font-mono", style: { color: "rgba(99,102,241,0.45)" }, children: [
          idlePeriods.length,
          " gap",
          idlePeriods.length !== 1 ? "s" : ""
        ] })
      ] }),
      idlePeriods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px]", style: { color: colors.textDim, fontFamily: '"Share Tech Mono", monospace' }, children: "No idle gaps ≥3m detected today." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 max-h-28 overflow-y-auto", children: [...idlePeriods].reverse().slice(0, 6).map((ip, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-1 px-1.5", style: { background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.08)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-mono flex-shrink-0", style: { color: "rgba(99,102,241,0.35)" }, children: new Date(ip.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold data-value flex-shrink-0", style: { color: ip.duration > 18e5 ? "#fbbf24" : "rgba(99,102,241,0.7)" }, children: fmt$1(ip.duration) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8px] truncate", style: { color: colors.textDim }, children: [
          "after ",
          ip.prevApp
        ] })
      ] }, i)) })
    ] })
  ] });
}
function EmptyState({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel py-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 18, style: { color: "rgba(99,102,241,0.25)" }, className: "mx-auto mb-2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] max-w-sm mx-auto leading-relaxed", style: { color: "rgba(99,102,241,0.3)", fontFamily: '"Share Tech Mono", monospace' }, children: text })
  ] });
}
const CARD_CAT_COLOR = {
  productivity: "#34d399",
  development: "#34d399",
  communication: "#fbbf24",
  browser: "#3b9eff",
  social: "#f87171",
  entertainment: "#f87171",
  gaming: "#f87171",
  system: "#64748b",
  other: "#475569"
};
function cardUnitFmt(value, unit) {
  if (unit === "ms") return fmt$1(value);
  if (unit === "percent") return `${value}%`;
  return String(value);
}
function CustomAnalyticsSection() {
  const { colors } = useTheme();
  const [cards, setCards] = reactExports.useState([]);
  const [sessions, setSessions] = reactExports.useState([]);
  const [desc, setDesc] = reactExports.useState("");
  const [building, setBuilding] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const loadCards = reactExports.useCallback(() => {
    api$9.getCustomCards().then(setCards).catch(() => setCards([]));
  }, []);
  reactExports.useEffect(() => {
    loadCards();
    api$9.getTimesheet(31).then((r) => setSessions(r.sessions ?? [])).catch(() => setSessions([]));
    const off = api$9.onStoreRefresh?.(() => {
      loadCards();
      api$9.getTimesheet(31).then((r) => setSessions(r.sessions ?? [])).catch(() => {
      });
    });
    return () => {
      off?.();
    };
  }, [loadCards]);
  const submit = async () => {
    const q = desc.trim();
    if (!q || building) return;
    setBuilding(true);
    setError("");
    try {
      const res = await api$9.buildAnalyticsCard(q);
      if (res.ok) {
        setDesc("");
        loadCards();
        api$9.getTimesheet(31).then((r) => setSessions(r.sessions ?? [])).catch(() => {
        });
      } else setError(res.error === "PAYWALL" ? "Free AI used up — add your key in Settings." : res.error || "Could not build that. Try rephrasing.");
    } catch {
      setError("Could not build that. Try rephrasing.");
    }
    setBuilding(false);
  };
  const remove = async (id) => {
    await api$9.deleteCustomCard(id);
    loadCards();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-panel p-3.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
          style: { background: colors.accentBg, border: `1px solid ${colors.border}` },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13, style: { color: colors.accent } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-semibold", style: { color: colors.textPrimary }, children: "Build your own analytics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px]", style: { color: colors.textMuted }, children: "Describe any metric — Attentify computes it from your activity and pins it here, live." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded-xl mb-1",
        style: { background: colors.inputBg, border: `1px solid ${colors.borderMid}` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13, style: { color: colors.accent, flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: desc,
              onChange: (e) => {
                setDesc(e.target.value);
                setError("");
              },
              onKeyDown: (e) => {
                if (e.key === "Enter") void submit();
              },
              disabled: building,
              placeholder: "e.g. “time on social media per weekday” or “my top 5 domains in the evening”",
              className: "flex-1 bg-transparent text-[12px] outline-none disabled:opacity-60",
              style: { color: colors.textPrimary, caretColor: colors.accent }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => void submit(),
              disabled: !desc.trim() || building,
              className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40 flex-shrink-0",
              style: { background: colors.accentBg, border: `1px solid ${colors.borderMid}`, color: colors.accent },
              children: building ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12, className: "animate-spin" }),
                " Building…"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Build ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 12 })
              ] })
            }
          )
        ]
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-1", style: { color: colors.negative }, children: error }),
    cards.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: ["Time per category this week", "Focus ratio by hour", "Top distracting domains", "Sessions by weekday"].map((ex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setDesc(ex),
        className: "px-2.5 py-1 rounded-full text-[10px] transition-colors",
        style: { background: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.textSecondary },
        children: ex
      },
      ex
    )) }),
    cards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3", children: cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(CustomCard, { card, sessions, onDelete: () => void remove(card.id) }, card.id)) })
  ] });
}
function CustomCard({ card, sessions, onDelete }) {
  const { colors } = useTheme();
  const res = reactExports.useMemo(() => runAnalyticsQuery(sessions, card.spec), [sessions, card.spec]);
  const max = Math.max(1, ...res.rows.map((r) => r.value));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-semibold truncate", style: { color: colors.textPrimary }, children: card.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px]", style: { color: colors.textMuted }, children: card.description || `${card.spec.metric.replace("_", " ")} by ${card.spec.groupBy} · last ${card.spec.rangeDays}d` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDelete, title: "Delete card", className: "flex-shrink-0 p-1 rounded transition-colors hover:opacity-100 opacity-50", style: { color: colors.textMuted }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
    ] }),
    res.matched === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] py-3 text-center", style: { color: colors.textMuted }, children: "No matching activity yet." }) : card.viz === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[26px] font-bold leading-none data-value", style: { color: colors.accent }, children: cardUnitFmt(res.total, res.unit) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9.5px] mt-1", style: { color: colors.textMuted }, children: [
        "across ",
        res.matched,
        " sessions"
      ] })
    ] }) : card.viz === "line" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardLineChart, { rows: res.rows, unit: res.unit }) : card.viz === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left", style: { borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-[9px] font-semibold uppercase tracking-wide py-1 pr-2", style: { color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }, children: card.spec.groupBy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-[9px] font-semibold uppercase tracking-wide py-1 px-2 text-right", style: { color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }, children: res.unit === "ms" ? "time" : res.unit === "percent" ? "focus" : "count" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-[9px] font-semibold uppercase tracking-wide py-1 pl-2 text-right", style: { color: colors.textMuted, borderBottom: `1px solid ${colors.border}` }, children: "detail" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: res.rows.slice(0, 12).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-[11px] py-1 pr-2 capitalize truncate", style: { color: colors.textSecondary, maxWidth: 120 }, children: r.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-[11px] py-1 px-2 text-right data-value", style: { color: colors.textPrimary }, children: cardUnitFmt(r.value, res.unit) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-[10px] py-1 pl-2 text-right", style: { color: colors.textMuted }, children: r.detail ?? "—" })
      ] }, r.label)) })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: res.rows.slice(0, 8).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", title: r.detail, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] w-24 truncate flex-shrink-0 capitalize", style: { color: colors.textSecondary }, children: r.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-3 rounded overflow-hidden", style: { background: "rgba(120,130,160,0.08)", minWidth: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded", style: { width: `${r.value / max * 100}%`, background: CARD_CAT_COLOR[r.label] ?? colors.accent, opacity: 0.9 } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] w-14 text-right flex-shrink-0 data-value", style: { color: colors.textPrimary }, children: cardUnitFmt(r.value, res.unit) })
    ] }, r.label)) })
  ] });
}
function CardLineChart({ rows, unit }) {
  const { colors } = useTheme();
  const W = 260, H = 96, PL = 4, PR = 4, PT = 8, PB = 16;
  const iW = W - PL - PR, iH = H - PT - PB;
  const pts = rows.slice(0, 24);
  if (pts.length < 2) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] py-3 text-center", style: { color: colors.textMuted }, children: "Not enough points to graph." });
  }
  const max = Math.max(1, ...pts.map((p) => p.value));
  const toX = (i) => PL + i / (pts.length - 1) * iW;
  const toY = (v) => PT + iH - v / max * iH;
  const line = pts.map((p, i) => `${toX(i)},${toY(p.value)}`).join(" ");
  const area = `M${toX(0)},${PT + iH} ${pts.map((p, i) => `L${toX(i)},${toY(p.value)}`).join(" ")} L${toX(pts.length - 1)},${PT + iH}Z`;
  const labelEvery = Math.ceil(pts.length / 6);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", style: { display: "block" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "cardArea", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: colors.accent, stopOpacity: "0.28" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: colors.accent, stopOpacity: "0.02" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: area, fill: "url(#cardArea)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: line, fill: "none", stroke: colors.accent, strokeWidth: "1.6", strokeLinejoin: "round", strokeLinecap: "round" }),
    pts.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: toX(i), cy: toY(p.value), r: "1.7", fill: colors.accent }, i)),
    pts.map((p, i) => i % labelEvery === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: toX(i), y: H - 4, fontSize: "6", fill: colors.textMuted, textAnchor: "middle", children: p.label }, `l${i}`) : null),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: PL, y: PT - 1, fontSize: "6", fill: colors.textMuted, children: unit === "ms" ? "peak " + fmt$1(max) : unit === "percent" ? "peak " + max + "%" : "peak " + max })
  ] });
}
const CATEGORY_ICONS = {
  apps: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 18 }),
  feeds: /* @__PURE__ */ jsxRuntimeExports.jsx(Rss, { size: 18 }),
  notifications: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18 })
};
const FIX_LABELS = {
  "add-domain-block": "Block Site",
  "add-process-block": "Block Apps",
  "enable-feed-guard": "Block All Feeds",
  "enable-notification-filter": "Start Focus Session",
  "review-extensions": "Open Extensions"
};
const SEV_COLORS = {
  high: "#f87171",
  medium: "#fbbf24",
  low: "#34d399"
};
function IssueCard({ issue, onFix, onAskAI, fixing, fixed }) {
  const { colors } = useTheme();
  const icon = CATEGORY_ICONS[issue.category] ?? /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { size: 18 });
  const sevColor = SEV_COLORS[issue.severity] ?? "#546e7a";
  const fixLabel = FIX_LABELS[issue.fixAction ?? ""] ?? "Fix Issue";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 p-4 rounded-xl transition-all duration-200",
      style: {
        background: fixed ? "rgba(52,211,153,0.05)" : colors.cardBg,
        border: fixed ? "1px solid rgba(52,211,153,0.2)" : `1px solid ${colors.border}`,
        opacity: fixed ? 0.6 : 1
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-9 h-9 rounded-lg flex items-center justify-center",
            style: { background: sevColor + "18", color: sevColor },
            children: fixed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 18, style: { color: "#34d399" } }) : icon
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0",
                style: { background: sevColor + "18", color: sevColor },
                children: issue.severity
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-xs truncate", style: { color: colors.textPrimary }, children: issue.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-relaxed mb-2.5", style: { color: colors.textSecondary }, children: issue.description }),
          !fixed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            onFix && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onFix(issue),
                disabled: fixing,
                className: "flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-60",
                style: { background: "rgba(33,150,243,0.15)", color: "#818cf8", border: "1px solid rgba(33,150,243,0.25)" },
                children: fixing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { size: 10, className: "animate-spin" }),
                  " Fixing…"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 10 }),
                  " ",
                  fixLabel
                ] })
              }
            ),
            onAskAI && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => onAskAI(issue),
                className: "flex items-center gap-1 text-[11px] transition-colors",
                style: { color: colors.textMuted },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 10 }),
                  " Ask Attentify"
                ]
              }
            )
          ] }),
          fixed && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: "#34d399" }, children: "Fixed — protection applied" })
        ] })
      ]
    }
  );
}
const api$8 = window.electronAPI;
const FEED_GUARD_DOMAINS = ["youtube.com", "instagram.com", "x.com", "twitter.com", "facebook.com", "tiktok.com"];
const categoryLabels = {
  apps: "Apps & Websites",
  feeds: "Algorithmic Feeds",
  notifications: "Notification Overload"
};
function FocusScanResults({ results, onNavigate, onRefresh, onChatWith }) {
  const { colors } = useTheme();
  const [fixingId, setFixingId] = reactExports.useState(null);
  const [fixed, setFixed] = reactExports.useState(/* @__PURE__ */ new Set());
  const [fixingAll, setFixingAll] = reactExports.useState(false);
  const [infoMsg, setInfoMsg] = reactExports.useState(null);
  if (!results) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: colors.textSecondary }, children: "No scan results. Run a Focus Scan from the Home screen." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary mt-4", onClick: () => onNavigate("home"), children: "Go to Home" })
    ] });
  }
  const applyFix = async (issue) => {
    switch (issue.fixAction) {
      case "add-domain-block": {
        const domains = results.recentDistractingSites.length > 0 ? results.recentDistractingSites : issue.affectedItem ? [issue.affectedItem] : [];
        for (const d of domains) {
          await api$8.addDomain(d);
        }
        break;
      }
      case "add-process-block": {
        let procs = [];
        if (issue.id === "running-distractors") procs = results.runningDistractors;
        else if (issue.id === "installed-distractors") procs = results.installedDistractors;
        else if (issue.id === "startup-distractors") procs = results.startupDistractors;
        else if (issue.affectedItem) procs = [issue.affectedItem];
        for (const p of procs) {
          await api$8.addProcess(p);
        }
        break;
      }
      case "enable-feed-guard": {
        for (const d of FEED_GUARD_DOMAINS) {
          await api$8.addDomain(d);
        }
        break;
      }
      case "enable-notification-filter": {
        await api$8.startSession("normal");
        break;
      }
      case "review-extensions": {
        setInfoMsg(
          "Open chrome://extensions (or your browser's extension manager) and remove or disable extensions you don't actively use. Each extension is a potential distraction vector."
        );
        return;
      }
    }
  };
  const handleFixIssue = async (issue) => {
    if (fixed.has(issue.id) || fixingId) return;
    setFixingId(issue.id);
    try {
      await applyFix(issue);
      setFixed((prev) => new Set(prev).add(issue.id));
      onRefresh();
    } finally {
      setFixingId(null);
    }
  };
  const handleAskAI = (issue) => {
    const msgMap = {
      "running-distractors": `Block these apps that are running right now and competing for my attention: ${results.runningDistractors.join(", ")}`,
      "installed-distractors": `I have ${results.installedDistractors.length} distracting apps installed (${results.installedDistractors.slice(0, 4).join(", ")}). Help me block them.`,
      "startup-distractors": `These apps auto-start with my computer: ${results.startupDistractors.join(", ")}. Block them during focus sessions.`,
      "recent-history": `I visited these distracting sites today: ${results.recentDistractingSites.slice(0, 5).join(", ")}. Block them for me.`,
      "feed-guard": "Block all algorithmic feeds — YouTube, Instagram, Twitter/X, TikTok, and Facebook.",
      "extensions": `I have ${results.browserExtensionsFound} browser extensions. Help me identify and remove distracting ones.`,
      "notification-filter": "Start a focus session to suppress desktop notifications."
    };
    const msg = msgMap[issue.id] ?? `Help me fix this: ${issue.title}`;
    onChatWith?.(msg);
  };
  const handleFixAll = async () => {
    setFixingAll(true);
    for (const issue of results.issues) {
      if (!fixed.has(issue.id) && issue.fixAction !== "review-extensions") {
        setFixingId(issue.id);
        try {
          await applyFix(issue);
          setFixed((prev) => new Set(prev).add(issue.id));
        } catch {
        }
        setFixingId(null);
      }
    }
    setFixingAll(false);
    onRefresh();
  };
  const categories = ["apps", "feeds", "notifications"];
  const issuesByCategory = (cat) => results.issues.filter((i) => i.category === cat);
  const unfixedCount = results.issues.filter((i) => !fixed.has(i.id)).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-6 pb-4 flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-bold text-2xl", style: { color: colors.textPrimary }, children: [
            "We found",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent-orange", children: unfixedCount }),
            " ",
            "attention leak",
            unfixedCount !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", style: { color: colors.textSecondary }, children: "Each issue below has a one-click fix or you can ask Attentify to handle it." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", style: { color: colors.textSecondary }, children: [
          "Scanned ",
          new Date(results.runAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-5", children: categories.map((cat, idx) => {
        const catIssues = issuesByCategory(cat);
        const allFixed = catIssues.length > 0 && catIssues.every((i) => fixed.has(i.id));
        const hasIssues = catIssues.length > 0;
        const remaining = catIssues.filter((i) => !fixed.has(i.id)).length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full justify-center", children: [
              allFixed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16, className: "text-accent-green flex-shrink-0" }) : hasIssues ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-[9px] font-bold", children: "!" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { size: 16, className: "flex-shrink-0", style: { color: colors.textSecondary } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs font-semibold truncate ${allFixed ? "text-accent-green" : hasIssues ? "" : ""}`,
                  style: !allFixed && hasIssues ? { color: colors.textPrimary } : !allFixed && !hasIssues ? { color: colors.textSecondary } : void 0,
                  children: categoryLabels[cat]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-0.5 w-full rounded-full",
                style: { background: allFixed ? "#34d399" : hasIssues ? "#ff6b35" : colors.border }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `text-[10px] ${allFixed ? "text-accent-green" : hasIssues ? "text-accent-orange" : ""}`,
                style: !allFixed && !hasIssues ? { color: colors.textSecondary } : void 0,
                children: allFixed ? "Fixed" : hasIssues ? `${remaining} issue${remaining !== 1 ? "s" : ""}` : "OK"
              }
            )
          ] }),
          idx < categories.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start pt-2 px-1 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, style: { color: colors.textSecondary } }) })
        ] }, cat);
      }) })
    ] }),
    infoMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-6 mb-2 flex-shrink-0 p-3 rounded-xl flex items-start gap-2.5", style: { background: "rgba(33,150,243,0.08)", border: "1px solid rgba(33,150,243,0.2)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { size: 14, className: "text-accent-blue flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed flex-1", style: { color: colors.textSecondary }, children: infoMsg }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setInfoMsg(null), className: "hover:text-white text-xs flex-shrink-0", style: { color: colors.textSecondary }, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-6 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: results.issues.map((issue) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      IssueCard,
      {
        issue,
        onFix: handleFixIssue,
        onAskAI: onChatWith ? handleAskAI : void 0,
        fixing: fixingId === issue.id || fixingAll,
        fixed: fixed.has(issue.id)
      },
      issue.id
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 px-6 pb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "linear-gradient(to right, #ff6b35, transparent)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs whitespace-nowrap", style: { color: colors.textSecondary }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "These issues are high priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 12, style: { color: colors.textSecondary } })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleFixAll,
            disabled: fixingAll || unfixedCount === 0,
            className: "flex items-center gap-2 bg-accent-blue hover:bg-accent-blue-light disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm",
            children: fixingAll ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" }),
              "Fixing…"
            ] }) : unfixedCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 16 }),
              "All fixed!"
            ] }) : `Fix all ${unfixedCount} issue${unfixedCount !== 1 ? "s" : ""}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onNavigate("home"),
            className: "text-sm transition-colors underline underline-offset-2",
            style: { color: colors.textSecondary },
            children: "Skip for now"
          }
        )
      ] })
    ] })
  ] });
}
const api$7 = window.electronAPI;
const PATTERN_TAXONOMY = [
  {
    type: "rapid-switching",
    name: "Rapid App-Switching",
    icon: "⚡",
    definition: "Compulsive cycling between applications at a rate incompatible with sustained cognitive work.",
    signatures: ["20+ window switches in 20 minutes", "No single app held for more than 2–3 minutes", "Switching accelerates under stress or boredom"],
    mechanism: "Each switch triggers a micro-dose of novelty — a low-intensity dopamine hit. The brain learns that switching relieves discomfort, reinforcing the behavior independent of any productive outcome.",
    citation: "Gloria Mark (UC Irvine): average cost of a distraction is 23 min to fully regain focus. Knowledge workers switch tasks every 3 min on average.",
    detectionCriteria: "> 20 switches in a 20-min window AND > 5 more than the previous check cycle.",
    severity: "medium"
  },
  {
    type: "repeated-visits",
    name: "Compulsive Checking",
    icon: "🔄",
    definition: "Returning to the same distraction site multiple times in a short window with no new information available.",
    signatures: ["5+ visits to the same domain in 20 minutes", "Each visit is brief (under 2 min)", "Visits cluster around boredom or cognitive load spikes"],
    mechanism: "Variable-reward conditioning — the same mechanism as slot machines. Refreshing Twitter/Reddit occasionally yields a novel post (reward), making every refresh feel potentially rewarding. The brain cannot resist.",
    citation: "BF Skinner's variable-ratio reinforcement schedule produces the highest and most resistant response rates of any conditioning paradigm.",
    detectionCriteria: "≥ 5 visits to the same distraction domain within 20 minutes.",
    severity: "high"
  },
  {
    type: "late-night",
    name: "Late-Night Doomscrolling",
    icon: "🌙",
    definition: "Passive consumption of stimulating content (news, social feeds, video) after 11 PM, compromising sleep architecture.",
    signatures: ["Browser active after 23:00", "Session length > 20 min", "Content is emotionally activating (news, conflict, drama)"],
    mechanism: "Blue light suppresses melatonin; stimulating content raises cortisol. The combination delays sleep onset and reduces deep-sleep stages. Tomorrow's executive function and attention are directly impaired.",
    citation: "Matthew Walker (2017): adults who sleep < 7h show 20–40% reduction in prefrontal cortex function — the area responsible for impulse control and focus.",
    detectionCriteria: "Hour is 23:00–04:00, ≥ 3 browser sessions in the last 20 min, not already alerted in the last 30 min.",
    severity: "high"
  },
  {
    type: "long-session",
    name: "Feed Black Hole",
    icon: "🕳️",
    definition: "An unbroken distraction session long enough for the original intent to be completely forgotten.",
    signatures: ["Single distraction app session > 25 minutes", "No productive app in between", "Session follows a clear trigger (task difficulty, notification)"],
    mechanism: 'Algorithmic feeds are designed with infinite scroll and autoplay to eliminate the natural stopping point. The question "should I continue?" is never presented. The original intent (checking one thing) is buried under 30 minutes of unintended content.',
    citation: "YouTube autoplay drives 70% of total watch time (internal Google data, cited in multiple congressional testimonies).",
    detectionCriteria: "Single isDistraction session > 25 min started in the last 30 min, not already alerted within 60s.",
    severity: "medium"
  },
  {
    type: "focus-drift",
    name: "Focus Drift",
    icon: "🌊",
    definition: "Gradual slide from a productive flow state into distraction without a conscious decision to stop working.",
    signatures: ["Two consecutive productive sessions followed by two distraction sessions", "No context-switch event (notification, meeting) between them", "Often occurs 45–90 min into a work block"],
    mechanism: "Attention residue from a completed task (or micro-fatigue) creates a brief opening. A single distraction visit exploits that opening, and without a hard stop, each subsequent visit becomes easier to justify.",
    citation: 'Sophie Leroy (2009): "attention residue" from task-switching leaves a cognitive tax that compounds across the workday.',
    detectionCriteria: "Last 4 recent sessions: first 2 non-distraction, last 2 distraction. Not alerted within 10 min.",
    severity: "medium"
  },
  {
    type: "doom-loop",
    name: "Doom Loop",
    icon: "🔁",
    definition: "Cycling robotically between 2–3 distraction apps with zero productive activity between them.",
    signatures: ["2–3 apps each visited 3+ times in 20 min", "All are distraction-classified", "No productive work interspersed", "Cycling accelerates as each app fails to satisfy"],
    mechanism: "Each app fails to deliver a satisfying reward, so the brain immediately seeks another. This is structurally identical to compulsive checking rituals in OCD — the behavior is self-reinforcing because it temporarily relieves the anxiety of *not* checking.",
    citation: "Same neural circuits as OCD rituals: orbitofrontal cortex → striatum → thalamus loop (Saxena & Rauch, 2002).",
    detectionCriteria: "≥ 6 recent sessions, 2–3 apps each with ≥ 3 visits, all distraction, all sessions are in the top apps. Not alerted within 15 min.",
    severity: "high"
  },
  {
    type: "micro-escape",
    name: "Micro-Escapes",
    icon: "💨",
    definition: "Sub-90-second bursts of distraction so brief they feel harmless — but collectively create continuous partial attention.",
    signatures: ["5+ distraction opens under 90 seconds in 10 minutes", "Each visit is too short to consume anything", "Triggered by discomfort at any cognitive difficulty"],
    mechanism: '"Continuous partial attention" (Linda Stone): present everywhere, focused nowhere. Even brief escapes break the cognitive thread of the current task. The brain learns that discomfort can always be interrupted, which raises the activation threshold for sustained effort.',
    citation: 'Linda Stone (1997) coined "continuous partial attention" — later validated by fMRI studies showing disrupted default-mode network recovery after micro-interruptions.',
    detectionCriteria: "≥ 5 distraction sessions under 90s in the last 10 min. Not alerted within 10 min.",
    severity: "medium"
  },
  {
    type: "notification-fomo",
    name: "Notification FOMO",
    icon: "🔔",
    definition: "High-frequency checking of communication apps driven by fear of missing messages, not actual communication need.",
    signatures: ["8+ checks/hour on messaging apps", "Most checks result in zero new messages", "Checking accelerates when a response is expected"],
    mechanism: "Fear of Missing Out is a manufactured anxiety — each notification badge is deliberately designed to create exactly this reflex. The checking behavior is rewarded intermittently (sometimes there *is* a message), making it extremely persistent.",
    citation: "Average knowledge worker checks email 74 times per day (McKinsey Global Institute, 2012). Slack users average 9 hours/day with the app open.",
    detectionCriteria: "Communication apps (discord/slack/teams/telegram/etc.) at ≥ 8 sessions/hour in a 15-min window. Not alerted within 15 min.",
    severity: "medium"
  },
  {
    type: "video-rabbit-hole",
    name: "Video Rabbit Hole",
    icon: "📺",
    definition: "Progressively longer engagement with algorithmically-served video content far beyond original intent.",
    signatures: ["> 20 min in video platform in a 35-min window", "Content progressively diverges from initial search", "Session has no natural endpoint"],
    mechanism: `Autoplay eliminates the "should I watch another?" decision. Recommendation algorithms optimize for engagement (watch time), not for your goals. The content you're watching now bears no resemblance to what you came for.`,
    citation: "Guillaume Chaslot (ex-YouTube engineer): recommender is designed to maximize watch time, systematically directing users toward more extreme content to maintain engagement.",
    detectionCriteria: "Browser sessions on video platform domains totalling > 20 min in the last 35 min. Not alerted within 20 min.",
    severity: "high"
  },
  {
    type: "phantom-checking",
    name: "Phantom Checking",
    icon: "👻",
    definition: "App opens so brief they serve no purpose — the behavior is automatic, executed before any conscious decision is made.",
    signatures: ["4+ app opens under 30 seconds in 10 minutes", "User closes app immediately each time", "Often phone-mirror behavior (checking without knowing why)"],
    mechanism: "The checking motion has become decoupled from the intention to check. This is a conditioned reflex — the cue (boredom, stress, an idle moment) triggers the motor routine automatically. The decision comes after the action.",
    citation: 'Charles Duhigg "The Power of Habit": habits become automatic loops (cue → routine → reward) that operate below conscious awareness.',
    detectionCriteria: "≥ 4 app opens under 30 seconds in the last 10 min. Not alerted within 10 min.",
    severity: "low"
  },
  {
    type: "pre-task-avoidance",
    name: "Pre-Task Avoidance",
    icon: "🚪",
    definition: "Distraction that occurs specifically in the window before starting a known important task — procrastination with a clear trigger.",
    signatures: ["Distraction begins immediately after switching from a productive context", "Duration tracks with task difficulty/aversion", 'Often involves "prep" tasks (email, reading) to feel productive'],
    mechanism: "The anticipatory anxiety of starting a hard task is more aversive than the task itself. Distraction provides immediate relief. The brain learns: when a hard task is imminent, escape is available.",
    citation: "Pychyl & Flett (2012): procrastination is primarily an emotion regulation strategy, not a time management failure.",
    detectionCriteria: "Productive session followed immediately by distraction before any new productive work begins. [Not yet auto-detected]",
    severity: "medium"
  },
  {
    type: "news-anxiety",
    name: "News Anxiety Loop",
    icon: "📰",
    definition: "Repeated checking of news aggregators driven by hypervigilance, not information need — consuming more news increases anxiety rather than reducing it.",
    signatures: ["4+ news/aggregator visits in 15 minutes", "Visits trigger emotional activation, not resolution", "Checking increases after distressing headlines"],
    mechanism: "News is optimized for threat salience — the brain's threat-detection system treats each headline as a potential survival concern. Checking resolves the immediate uncertainty but generates new anxiety (what else might be happening?), creating a loop.",
    citation: "74% of US adults say news causes stress, yet most check it multiple times daily (APA Stress in America, 2020).",
    detectionCriteria: "≥ 4 browser sessions on news domains in the last 15 min. Not alerted within 15 min.",
    severity: "medium"
  },
  {
    type: "tab-anxiety",
    name: "Tab Anxiety",
    icon: "🗂️",
    definition: "Accumulating large numbers of open browser tabs as a form of digital hoarding — each tab represents an unresolved intention.",
    signatures: ["20+ open tabs across browser windows", "Tabs are rarely revisited after opening", "New tabs are opened faster than existing ones are closed"],
    mechanism: "Each open tab is a cognitive IOU — a promise to yourself that you'll return to it. The accumulation creates background anxiety and a constant sense of incompleteness. The tabs don't get read; they get shuffled.",
    citation: "Tab hoarders report the same emotional profile as physical hoarders: anxiety at the thought of closing tabs, despite acknowledging they will never read most of them.",
    detectionCriteria: "Tab count monitoring. [Not yet auto-detected — requires browser extension integration]",
    severity: "low"
  }
];
const SEVERITY_COLOR = {
  high: "#ff6b35",
  medium: "#fbbf24",
  low: "#818cf8"
};
const SEVERITY_BG = {
  high: "rgba(255,107,53,0.1)",
  medium: "rgba(251,191,36,0.1)",
  low: "rgba(100,181,246,0.1)"
};
function timeAgo$1(ts) {
  const diff = Date.now() - ts;
  if (diff < 6e4) return "just now";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  return `${Math.floor(diff / 864e5)}d ago`;
}
function Patterns({ heuristicAlerts, onChatWith }) {
  const { colors } = useTheme();
  const [expandedAlert, setExpandedAlert] = reactExports.useState(null);
  const [expandedPattern, setExpandedPattern] = reactExports.useState(null);
  const [allAlerts, setAllAlerts] = reactExports.useState(heuristicAlerts);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setAllAlerts(heuristicAlerts);
  }, [heuristicAlerts]);
  const refresh = async () => {
    setRefreshing(true);
    try {
      const data = await api$7.getAnalytics();
      setAllAlerts(data.heuristicAlerts);
    } finally {
      setRefreshing(false);
    }
  };
  const patternStats = /* @__PURE__ */ new Map();
  for (const a of allAlerts) {
    const cur = patternStats.get(a.type) ?? { count: 0, last: 0 };
    patternStats.set(a.type, { count: cur.count + 1, last: Math.max(cur.last, a.detectedAt) });
  }
  const undismissed = allAlerts.filter((a) => !a.dismissed);
  const recent = [...allAlerts].sort((a, b) => b.detectedAt - a.detectedAt).slice(0, 30);
  const handleAskAI = () => {
    if (!onChatWith) return;
    const top3 = [...patternStats.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 3);
    const summary = top3.map(([type, s]) => {
      const def = PATTERN_TAXONOMY.find((p) => p.type === type);
      return `${def?.name ?? type} (${s.count}×)`;
    }).join(", ");
    onChatWith(`My top attention patterns this session are: ${summary}. Help me understand what's driving these and give me a concrete plan to address the most frequent one.`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex-shrink-0 flex items-center justify-between px-6 py-4",
        style: { borderBottom: `1px solid ${colors.border}` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 17, className: "text-accent-orange" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-base leading-tight", style: { color: colors.textPrimary }, children: "Patterns" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px]", style: { color: colors.textSecondary }, children: [
                "Named attention pathologies · ",
                undismissed.length,
                " active"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleAskAI,
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105",
                style: { background: "rgba(33,150,243,0.12)", color: "#818cf8", border: "1px solid rgba(33,150,243,0.22)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 11 }),
                  "Ask AI"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: refresh,
                disabled: refreshing,
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50",
                style: { background: colors.accentBg, color: colors.textSecondary, border: `1px solid ${colors.border}` },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 11, className: refreshing ? "animate-spin" : "" }),
                  "Refresh"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 p-6", children: [
      patternStats.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [...patternStats.entries()].sort((a, b) => b[1].count - a[1].count).map(([type, stats]) => {
        const def = PATTERN_TAXONOMY.find((p) => p.type === type);
        if (!def) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setExpandedPattern(expandedPattern === type ? null : type),
            className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105",
            style: {
              background: SEVERITY_BG[def.severity],
              border: `1px solid ${SEVERITY_COLOR[def.severity]}44`,
              color: SEVERITY_COLOR[def.severity]
            },
            title: def.definition,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: def.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: def.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                  style: { background: `${SEVERITY_COLOR[def.severity]}33`, color: SEVERITY_COLOR[def.severity] },
                  children: stats.count
                }
              )
            ]
          },
          type
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold mb-3 flex items-center gap-2", style: { color: colors.textPrimary }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, style: { color: colors.textSecondary } }),
          "Detected This Session",
          recent.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal ml-1", style: { color: colors.textSecondary }, children: "— none yet" })
        ] }),
        recent.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5", children: recent.map((alert) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl overflow-hidden",
            style: {
              border: `1px solid ${alert.dismissed ? colors.border : `${SEVERITY_COLOR[alert.severity]}33`}`,
              background: alert.dismissed ? colors.cardBg : SEVERITY_BG[alert.severity],
              opacity: alert.dismissed ? 0.55 : 1
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  className: "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                  onClick: () => setExpandedAlert(expandedAlert === alert.id ? null : alert.id),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        style: { background: alert.dismissed ? colors.border : SEVERITY_COLOR[alert.severity] }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium truncate", style: { color: colors.textPrimary }, children: alert.title }),
                      alert.switchRate !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", style: { color: colors.textSecondary }, children: [
                        alert.switchRate,
                        "/h"
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] flex-shrink-0", style: { color: colors.textSecondary }, children: timeAgo$1(alert.detectedAt) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0",
                        style: { background: `${SEVERITY_COLOR[alert.severity]}22`, color: SEVERITY_COLOR[alert.severity] },
                        children: alert.severity
                      }
                    ),
                    expandedAlert === alert.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 12, className: "flex-shrink-0", style: { color: colors.textSecondary } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12, className: "flex-shrink-0", style: { color: colors.textSecondary } })
                  ]
                }
              ),
              expandedAlert === alert.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-3 flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: { color: colors.textSecondary }, children: alert.description }),
                alert.app && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px]", style: { color: colors.textSecondary }, children: [
                  "Source: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: colors.textPrimary }, children: alert.app })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => onChatWith?.(`I just got a "${alert.title}" alert. ${alert.description} Help me address this right now.`),
                      className: "flex items-center gap-1 text-accent-blue text-[11px] hover:underline",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 10 }),
                        "Ask AI for help"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", style: { color: colors.textSecondary }, children: new Date(alert.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
                ] })
              ] })
            ]
          },
          alert.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl flex flex-col items-center justify-center py-8 text-center",
            style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 20, className: "mb-2", style: { color: colors.textSecondary } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: { color: colors.textSecondary }, children: "No patterns detected yet this session." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-1", style: { color: colors.textSecondary }, children: "Patterns appear here as you work — Attentify watches quietly." })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold mb-1 flex items-center gap-2", style: { color: colors.textPrimary }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 14, style: { color: colors.textSecondary } }),
          "Pattern Taxonomy"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mb-3", style: { color: colors.textSecondary }, children: "13 named attention pathologies — definitions, mechanisms, and detection criteria." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5", children: PATTERN_TAXONOMY.map((pattern) => {
          const stats = patternStats.get(pattern.type);
          const isExpanded = expandedPattern === pattern.type;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-xl overflow-hidden",
              style: {
                border: `1px solid ${stats ? `${SEVERITY_COLOR[pattern.severity]}33` : colors.border}`,
                background: stats ? SEVERITY_BG[pattern.severity] : colors.cardBg
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    className: "w-full flex items-center gap-3 px-4 py-3 text-left",
                    onClick: () => setExpandedPattern(isExpanded ? null : pattern.type),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base flex-shrink-0 w-6", children: pattern.icon }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", style: { color: colors.textPrimary }, children: pattern.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                              style: { background: `${SEVERITY_COLOR[pattern.severity]}22`, color: SEVERITY_COLOR[pattern.severity] },
                              children: pattern.severity
                            }
                          ),
                          stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", style: { color: colors.textSecondary }, children: [
                            "Detected ",
                            stats.count,
                            "× · last ",
                            timeAgo$1(stats.last)
                          ] })
                        ] }),
                        !isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] mt-0.5 truncate", style: { color: colors.textSecondary }, children: pattern.definition })
                      ] }),
                      isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 13, className: "flex-shrink-0", style: { color: colors.textSecondary } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13, className: "flex-shrink-0", style: { color: colors.textSecondary } })
                    ]
                  }
                ),
                isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 flex flex-col gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: { color: colors.textSecondary }, children: pattern.definition }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider mb-1.5", style: { color: colors.textSecondary }, children: "Behavioral Signatures" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-1", children: pattern.signatures.map((sig, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-[11px]", style: { color: colors.textSecondary }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10, className: "mt-0.5 flex-shrink-0", style: { color: colors.textMuted } }),
                      sig
                    ] }, i)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider mb-1", style: { color: colors.textSecondary }, children: "Mechanism" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-relaxed", style: { color: colors.textSecondary }, children: pattern.mechanism })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider mb-1", style: { color: colors.textSecondary }, children: "Research" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] italic leading-relaxed", style: { color: colors.textSecondary }, children: pattern.citation })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider mb-1", style: { color: colors.textSecondary }, children: "Detection Criteria" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-mono leading-relaxed", style: { color: colors.textSecondary }, children: pattern.detectionCriteria })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => onChatWith?.(`Tell me more about the "${pattern.name}" pattern and what I can do to break this habit.`),
                        className: "flex items-center gap-1 text-accent-blue text-[11px] hover:underline",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 10 }),
                          "Ask AI about this pattern"
                        ]
                      }
                    ),
                    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", style: { color: colors.textSecondary }, children: [
                      "· detected ",
                      stats.count,
                      " time",
                      stats.count !== 1 ? "s" : "",
                      " this session"
                    ] })
                  ] })
                ] })
              ]
            },
            pattern.type
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 h-4" })
    ] })
  ] });
}
const api$6 = window.electronAPI;
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1e3);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "#f87171" : pct >= 65 ? "#fbbf24" : "#6366f1";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1", style: { background: "rgba(255,255,255,0.06)", borderRadius: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${pct}%`, height: "100%", background: color, borderRadius: 1, transition: "width 0.4s ease" } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] font-bold", style: { color, fontFamily: '"Share Tech Mono", monospace', minWidth: 26 }, children: [
      pct,
      "%"
    ] })
  ] });
}
function SourceBadge({ source }) {
  if (!source) return null;
  const map = {
    url_visit: { label: "URL", color: "#6366f1" },
    search_prediction: { label: "SEARCH", color: "#fbbf24" },
    ai_url: { label: "AI", color: "#a78bfa" },
    sweep: { label: "SWEEP", color: "#818cf8" },
    session: { label: "SESSION", color: "#81c784" }
  };
  const m = Object.entries(map).find(([k]) => source.includes(k));
  if (!m) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "text-[8px] font-bold uppercase tracking-widest px-1 py-0.5",
      style: {
        color: m[1].color,
        background: `${m[1].color}18`,
        border: `1px solid ${m[1].color}30`,
        fontFamily: '"Share Tech Mono", monospace'
      },
      children: m[1].label
    }
  );
}
function Actions({ onChatWith, liveAutoBlocks = [] }) {
  const { colors } = useTheme();
  const [inferences, setInferences] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [historyOpen, setHistoryOpen] = reactExports.useState(false);
  const [resolving, setResolving] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api$6.getInferences();
      setInferences(rows);
    } catch {
    }
    setLoading(false);
  }, []);
  reactExports.useEffect(() => {
    void load();
    const off = api$6.onInferenceSuggest(() => void load());
    return off;
  }, [load]);
  reactExports.useEffect(() => {
    if (liveAutoBlocks.length > 0) void load();
  }, [liveAutoBlocks, load]);
  const resolve = async (id, status) => {
    setResolving(id);
    await api$6.resolveInference(id, status);
    await load();
    setResolving(null);
  };
  const pending = inferences.filter((i) => i.status === "pending");
  const autoBlocked = inferences.filter((i) => i.status === "auto_applied");
  const history = inferences.filter((i) => i.status === "confirmed" || i.status === "rejected");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full overflow-hidden", style: { background: colors.mainBg }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex-shrink-0 flex items-center justify-between px-6 py-4",
        style: { borderBottom: "1px solid rgba(99,102,241,0.08)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h1",
              {
                className: "text-[13px] font-bold uppercase tracking-widest",
                style: { color: colors.textPrimary, fontFamily: '"Share Tech Mono", monospace', letterSpacing: "0.2em" },
                children: "Actions"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] mt-0.5", style: { color: colors.textMuted }, children: [
              "AI inference decisions · ",
              pending.length,
              " pending review"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => void load(),
              className: "flex items-center gap-1.5 px-3 py-1.5 transition-all hover:scale-105",
              style: {
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.18)",
                color: "rgba(99,102,241,0.7)",
                fontSize: 9,
                fontFamily: '"Share Tech Mono", monospace',
                letterSpacing: "0.15em"
              },
              children: [
                loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 9, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 9 }),
                "Refresh"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-4 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 11, style: { color: "#fbbf24" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-label", style: { color: "#fbbf24" }, children: "Pending Review" }),
          pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-[8px] font-bold px-1.5 py-0.5",
              style: {
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.4)",
                color: "#fbbf24",
                fontFamily: '"Share Tech Mono", monospace'
              },
              children: pending.length
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "rgba(251,191,36,0.12)" } })
        ] }),
        pending.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 px-4 py-3",
            style: { background: "rgba(251,191,36,0.03)", border: "1px solid rgba(251,191,36,0.08)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 13, style: { color: "rgba(251,191,36,0.3)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px]", style: { color: colors.textMuted }, children: "No pending suggestions — AI hasn't flagged anything new." })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pending.map((inf) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "hud-panel",
            style: { padding: "12px 14px", borderColor: "rgba(251,191,36,0.2)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0",
                      style: {
                        background: "rgba(251,191,36,0.12)",
                        border: "1px solid rgba(251,191,36,0.3)",
                        color: "#fbbf24",
                        fontFamily: '"Share Tech Mono", monospace'
                      },
                      children: inf.type
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] font-bold truncate", style: { color: colors.textPrimary }, children: inf.value })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] flex-shrink-0", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: timeAgo(inf.created_at) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ConfidenceBar, { value: inf.confidence }),
              inf.reasoning && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-2 leading-relaxed", style: { color: colors.textSecondary }, children: inf.reasoning }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SourceBadge, { source: inf.evidence?.source ?? "" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => void resolve(inf.id, "rejected"),
                    disabled: resolving === inf.id,
                    className: "flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50",
                    style: {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: colors.textMuted,
                      fontFamily: '"Share Tech Mono", monospace'
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { size: 9 }),
                      "Dismiss"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => void resolve(inf.id, "confirmed"),
                    disabled: resolving === inf.id,
                    className: "flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50",
                    style: {
                      background: "rgba(248,113,113,0.1)",
                      border: "1px solid rgba(248,113,113,0.3)",
                      color: "#f87171",
                      fontFamily: '"Share Tech Mono", monospace'
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 9 }),
                      "Block Now"
                    ]
                  }
                )
              ] })
            ]
          },
          inf.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 11, style: { color: "#f87171" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-label", style: { color: "#f87171" }, children: "Auto-Blocked by AI" }),
          autoBlocked.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-[8px] font-bold px-1.5 py-0.5",
              style: {
                background: "rgba(248,113,113,0.15)",
                border: "1px solid rgba(248,113,113,0.4)",
                color: "#f87171",
                fontFamily: '"Share Tech Mono", monospace'
              },
              children: autoBlocked.length
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "rgba(248,113,113,0.12)" } })
        ] }),
        autoBlocked.length === 0 && liveAutoBlocks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 px-4 py-3",
            style: { background: "rgba(248,113,113,0.03)", border: "1px solid rgba(248,113,113,0.08)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 13, style: { color: "rgba(248,113,113,0.3)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px]", style: { color: colors.textMuted }, children: "No auto-blocks yet. Inference engine is monitoring." })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          liveAutoBlocks.map((evt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "hud-panel",
              style: { padding: "10px 14px", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.04)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { background: "#f87171" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold", style: { color: "#f87171" }, children: evt.domain }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-bold px-1 py-0.5", style: { background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", fontFamily: "monospace" }, children: "LIVE" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] font-bold", style: { color: "#f87171", fontFamily: '"Share Tech Mono", monospace' }, children: [
                    Math.round(evt.confidence * 100),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px]", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: timeAgo(evt.ts) })
                ] })
              ] })
            },
            `live-${evt.ts}`
          )),
          autoBlocked.map((inf) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "hud-panel",
              style: { padding: "10px 14px", borderColor: "rgba(248,113,113,0.15)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 11, style: { color: "#f87171", flexShrink: 0 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] font-bold truncate", style: { color: colors.textPrimary }, children: inf.value }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-[8px] font-bold px-1.5 py-0.5 flex-shrink-0",
                        style: {
                          background: "rgba(248,113,113,0.1)",
                          border: "1px solid rgba(248,113,113,0.25)",
                          color: "#f87171",
                          fontFamily: '"Share Tech Mono", monospace'
                        },
                        children: "BLOCKED"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] flex-shrink-0", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: timeAgo(inf.created_at) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ConfidenceBar, { value: inf.confidence }),
                inf.reasoning && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-2 leading-relaxed", style: { color: colors.textSecondary }, children: inf.reasoning }),
                onChatWith && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onChatWith(`Why was ${inf.value} auto-blocked by the AI?`),
                    className: "mt-2 text-[9px] uppercase tracking-widest transition-colors hover:text-white",
                    style: { color: "rgba(99,102,241,0.5)", fontFamily: '"Share Tech Mono", monospace' },
                    children: "Ask AI why →"
                  }
                )
              ]
            },
            inf.id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 11, style: { color: "rgba(99,102,241,0.5)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-label", children: "What AI Monitors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "rgba(99,102,241,0.08)" } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "hud-panel grid grid-cols-2 gap-px",
            style: { padding: 0, overflow: "hidden", borderColor: "rgba(99,102,241,0.1)" },
            children: [
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 10 }), label: "Search queries", desc: "Predicts destination sites from what you search", color: "#fbbf24" },
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 10 }), label: "URL visits", desc: "Instant match against 200+ distraction domains", color: "#6366f1" },
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10 }), label: "AI reasoning", desc: "Haiku evaluates unknown sites against your goals", color: "#a78bfa" },
              { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }), label: "Usage sweeps", desc: "Periodic scan of 7-day browsing history", color: "#818cf8" }
            ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", style: { borderRight: "1px solid rgba(99,102,241,0.06)", borderBottom: "1px solid rgba(99,102,241,0.06)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: item.color }, children: item.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold uppercase tracking-widest", style: { color: item.color, fontFamily: '"Share Tech Mono", monospace' }, children: item.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] leading-relaxed", style: { color: colors.textMuted }, children: item.desc })
            ] }, item.label))
          }
        )
      ] }),
      history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setHistoryOpen((p) => !p),
            className: "flex items-center gap-2 w-full mb-3 group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11, style: { color: colors.textMuted } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-label group-hover:text-white transition-colors", children: "History" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px]", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: [
                "(",
                history.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "rgba(99,102,241,0.08)" } }),
              historyOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 10, style: { color: colors.textMuted } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 10, style: { color: colors.textMuted } })
            ]
          }
        ),
        historyOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: history.slice(0, 20).map((inf) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 px-3 py-2",
            style: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" },
            children: [
              inf.status === "confirmed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 11, style: { color: "#34d399", flexShrink: 0 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { size: 11, style: { color: colors.textMuted, flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-[10px] truncate", style: { color: inf.status === "confirmed" ? colors.textPrimary : colors.textMuted }, children: inf.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-[8px] font-bold uppercase px-1.5 py-0.5 flex-shrink-0",
                  style: {
                    background: inf.status === "confirmed" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${inf.status === "confirmed" ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)"}`,
                    color: inf.status === "confirmed" ? "#34d399" : colors.textMuted,
                    fontFamily: '"Share Tech Mono", monospace'
                  },
                  children: inf.status
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] flex-shrink-0", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: timeAgo(inf.resolved_at ?? inf.created_at) })
            ]
          },
          inf.id
        )) })
      ] })
    ] })
  ] });
}
const api$5 = window.electronAPI;
function SectionHeader({ icon, label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "rgba(99,102,241,0.6)" }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "text-[9px] font-bold uppercase tracking-widest",
        style: { color: "rgba(99,102,241,0.5)", fontFamily: '"Share Tech Mono", monospace', letterSpacing: "0.2em" },
        children: label
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px", style: { background: "rgba(99,102,241,0.08)" } })
  ] });
}
function SettingsView({ store, onRefresh, onNavigate }) {
  const { colors, theme, toggle } = useTheme();
  const currentMode = store.settings.blockingMode ?? "auto";
  const [apiInput, setApiInput] = reactExports.useState("");
  const [apiSaved, setApiSaved] = reactExports.useState(false);
  const [hasKey, setHasKey] = reactExports.useState(null);
  const [usage, setUsage] = reactExports.useState(null);
  const [cloud, setCloud] = reactExports.useState(null);
  const [licenseInput, setLicenseInput] = reactExports.useState("");
  const [licenseBusy, setLicenseBusy] = reactExports.useState(false);
  const [checkingOut, setCheckingOut] = reactExports.useState(false);
  const [version, setVersion] = reactExports.useState("");
  reactExports.useEffect(() => {
    api$5.getAppVersion?.().then(setVersion).catch(() => {
    });
  }, []);
  const [changeCount, setChangeCount] = reactExports.useState(null);
  const [changelog, setChangelog] = reactExports.useState(null);
  const [confirmRevert, setConfirmRevert] = reactExports.useState(false);
  const [reverting, setReverting] = reactExports.useState(false);
  const [revertResult, setRevertResult] = reactExports.useState(null);
  const refreshSafety = () => {
    api$5.getSafetyStatus().then((s) => setChangeCount(s.changeCount)).catch(() => {
    });
  };
  const handleRevert = async () => {
    setReverting(true);
    try {
      const res = await api$5.revertAllChanges();
      setRevertResult(res);
      setConfirmRevert(false);
      refreshSafety();
      onRefresh();
    } finally {
      setReverting(false);
    }
  };
  const toggleLog = async () => {
    if (changelog) {
      setChangelog(null);
      return;
    }
    try {
      setChangelog(await api$5.getChangeLog(200));
    } catch {
      setChangelog([]);
    }
  };
  React.useEffect(() => {
    api$5.getApiKeyStatus().then((s) => setHasKey(s.hasKey));
    api$5.getUsage().then(setUsage).catch(() => {
    });
    api$5.getCloud().then(setCloud).catch(() => {
    });
    const off = api$5.onUsageChanged((u) => setUsage(u));
    return off;
  }, []);
  reactExports.useEffect(() => {
    refreshSafety();
  }, []);
  const saveLicense = async () => {
    if (!licenseInput.trim()) return;
    setLicenseBusy(true);
    const state = await api$5.setCloudLicense(licenseInput.trim());
    setCloud(state);
    setLicenseInput("");
    setLicenseBusy(false);
    api$5.getUsage().then(setUsage).catch(() => {
    });
  };
  const clearLicense = async () => {
    const state = await api$5.clearCloudLicense();
    setCloud(state);
    api$5.getUsage().then(setUsage).catch(() => {
    });
  };
  const subscribe = async () => {
    setCheckingOut(true);
    try {
      const res = await api$5.cloudCheckout();
      if (res.url) await api$5.openExternal(res.url);
    } catch {
    }
    setCheckingOut(false);
  };
  const setMode = async (mode) => {
    await api$5.setStore({ settings: { ...store.settings, blockingMode: mode } });
    onRefresh();
  };
  const saveApiKey = async () => {
    if (!apiInput.trim()) return;
    await api$5.setApiKey(apiInput.trim());
    setApiInput("");
    setApiSaved(true);
    setHasKey(true);
    setTimeout(() => setApiSaved(false), 2500);
  };
  const deleteApiKey = async () => {
    await api$5.deleteApiKey();
    setHasKey(false);
    onRefresh();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full overflow-hidden", style: { background: colors.mainBg }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex-shrink-0 px-6 py-4",
        style: { borderBottom: "1px solid rgba(99,102,241,0.08)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h1",
            {
              className: "text-[13px] font-bold uppercase tracking-widest",
              style: { color: colors.textPrimary, fontFamily: '"Share Tech Mono", monospace', letterSpacing: "0.2em" },
              children: "Settings"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-0.5", style: { color: colors.textMuted }, children: "Configure how Attentify responds to threats" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-5 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 11 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 11 }), label: "Appearance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between p-4 rounded-lg",
            style: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-medium", style: { color: colors.textPrimary }, children: "Theme" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-0.5", style: { color: colors.textMuted }, children: theme === "dark" ? "Dark — easier on the eyes at night" : "Light — brighter for daytime" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: toggle,
                  className: "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
                  style: { background: colors.accentBg, border: `1px solid ${colors.border}`, color: colors.accent },
                  children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 13 }),
                    " Switch to light"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 13 }),
                    " Switch to dark"
                  ] })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] mt-2 text-right", style: { color: colors.textDim }, children: [
          "Attentify",
          version ? ` v${version}` : ""
        ] })
      ] }),
      onNavigate && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 11 }), label: "Extra Modules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onNavigate("algo-track"),
            className: "w-full flex items-center gap-3 p-4 rounded-lg text-left transition-all hover:brightness-110",
            style: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 16, style: { color: colors.accent, flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-medium", style: { color: colors.textPrimary }, children: "AlgoTrack" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-0.5", style: { color: colors.textMuted }, children: "See how algorithmic feeds pull you in — an optional side module." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, style: { color: colors.textMuted } })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 11 }), label: "Threat Response Mode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => void setMode("auto"),
              className: "relative text-left p-4 transition-all duration-200 hover:scale-[1.01]",
              style: {
                background: currentMode === "auto" ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.02)",
                border: currentMode === "auto" ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(255,255,255,0.07)"
              },
              children: [
                currentMode === "auto" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2.5 right-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 11, style: { color: "#f87171" } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-6 h-6 flex items-center justify-center flex-shrink-0",
                      style: {
                        background: currentMode === "auto" ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.04)",
                        border: currentMode === "auto" ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(255,255,255,0.08)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 11, style: { color: currentMode === "auto" ? "#f87171" : colors.textMuted } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[11px] font-bold uppercase tracking-widest",
                      style: {
                        color: currentMode === "auto" ? "#f87171" : colors.textSecondary,
                        fontFamily: '"Share Tech Mono", monospace'
                      },
                      children: "Auto-Block"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed", style: { color: colors.textMuted }, children: "Sites above the confidence threshold are blocked immediately. No approval needed." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-1", children: [
                  ["adult", "gambling", "social"].map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[8px] px-1.5 py-0.5 uppercase tracking-wide",
                      style: {
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        color: "rgba(255,100,100,0.7)",
                        fontFamily: '"Share Tech Mono", monospace'
                      },
                      children: tag
                    },
                    tag
                  )),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[8px] px-1.5 py-0.5 uppercase tracking-wide",
                      style: {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: colors.textMuted,
                        fontFamily: '"Share Tech Mono", monospace'
                      },
                      children: "+ more"
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => void setMode("ask"),
              className: "relative text-left p-4 transition-all duration-200 hover:scale-[1.01]",
              style: {
                background: currentMode === "ask" ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                border: currentMode === "ask" ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.07)"
              },
              children: [
                currentMode === "ask" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2.5 right-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 11, style: { color: "#6366f1" } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-6 h-6 flex items-center justify-center flex-shrink-0",
                      style: {
                        background: currentMode === "ask" ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
                        border: currentMode === "ask" ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 11, style: { color: currentMode === "ask" ? "#6366f1" : colors.textMuted } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[11px] font-bold uppercase tracking-widest",
                      style: {
                        color: currentMode === "ask" ? "#6366f1" : colors.textSecondary,
                        fontFamily: '"Share Tech Mono", monospace'
                      },
                      children: "Ask First"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed", style: { color: colors.textMuted }, children: "All detected threats are queued in the Actions tab. You decide what gets blocked." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-[8px] px-1.5 py-0.5 uppercase tracking-wide",
                    style: {
                      background: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.18)",
                      color: "rgba(99,102,241,0.6)",
                      fontFamily: '"Share Tech Mono", monospace'
                    },
                    children: "Review in Actions →"
                  }
                ) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "mt-3 px-3 py-2.5 flex items-center gap-2",
            style: { background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.07)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-1 rounded-full flex-shrink-0", style: { background: "rgba(99,102,241,0.4)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] leading-relaxed", style: { color: colors.textMuted }, children: currentMode === "auto" ? "High-confidence threats (adult, gambling, dating ≥85%) are blocked instantly. Lower-confidence items are still queued in Actions for review." : "All detected threats are queued as pending in the Actions tab regardless of confidence. Nothing is blocked without your approval." })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 11 }), label: "AI Usage & Cloud" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "p-4 space-y-3",
            style: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" },
            children: cloud?.active ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold", style: { color: "#34d399" }, children: "Cloud active — unlimited AI" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] mt-0.5", style: { color: colors.textMuted }, children: [
                  cloud.email ? `Subscribed as ${cloud.email}` : "Subscription active",
                  " · $5/mo"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => void clearLicense(),
                  className: "px-3 py-2 text-[9px] font-bold uppercase tracking-widest",
                  style: { background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "rgba(248,113,113,0.7)", fontFamily: '"Share Tech Mono", monospace' },
                  children: "Unlink"
                }
              )
            ] }) : usage?.hasOwnKey ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px]", style: { color: colors.textSecondary }, children: "Using your own API key — usage is billed directly to you and is never metered here." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold", style: { color: colors.textPrimary }, children: "Free AI credit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tabular-nums", style: { color: usage?.exhausted ? "#f87171" : "#34d399" }, children: [
                  "$",
                  (usage?.usedUsd ?? 0).toFixed(2),
                  " / $",
                  (usage?.limitUsd ?? 1).toFixed(2),
                  " used"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: { background: "rgba(255,255,255,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-full rounded-full transition-all",
                  style: {
                    width: `${Math.min(100, Math.round((usage?.usedUsd ?? 0) / (usage?.limitUsd || 1) * 100))}%`,
                    background: usage?.exhausted ? "#ff5252" : "#34d399"
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px]", style: { color: colors.textMuted }, children: usage?.exhausted ? "Your free AI credit is used up. Subscribe to Cloud for $5/mo to keep using AI features — or add your own key below." : "The app includes free AI to get you started. When it runs out, subscribe to Cloud ($5/mo) or add your own key." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => void subscribe(),
                  disabled: checkingOut,
                  className: "flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50",
                  style: { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontFamily: '"Share Tech Mono", monospace' },
                  children: checkingOut ? "Opening…" : "Subscribe $5/mo"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "password",
                    value: licenseInput,
                    onChange: (e) => setLicenseInput(e.target.value),
                    onKeyDown: (e) => e.key === "Enter" && void saveLicense(),
                    placeholder: "Have a license? pd_live_…",
                    className: "flex-1 px-3 py-2 text-[10px] outline-none",
                    style: { background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: colors.textPrimary }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => void saveLicense(),
                    disabled: !licenseInput.trim() || licenseBusy,
                    className: "px-3 py-2 text-[9px] font-bold uppercase tracking-widest disabled:opacity-40",
                    style: { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", color: "#6366f1", fontFamily: '"Share Tech Mono", monospace' },
                    children: licenseBusy ? "…" : "Link"
                  }
                )
              ] }),
              cloud?.license && !cloud.active && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px]", style: { color: "#ff8866" }, children: "That license isn’t active yet — check your subscription or re-enter it." })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { size: 11 }), label: "AI API Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4",
            style: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-2 h-2 rounded-full flex-shrink-0",
                    style: { background: hasKey ? "#34d399" : "#fbbf24", boxShadow: hasKey ? "0 0 6px #34d399" : "0 0 6px #fbbf24" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", style: { color: hasKey ? "#34d399" : "#6366f1" }, children: hasKey === null ? "Checking..." : hasKey ? "Your own API key configured" : "Optional — AI already works via included free credit" })
              ] }),
              hasKey ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex-1 px-3 py-2 text-[10px]",
                    style: { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", color: colors.textMuted },
                    children: "••••••••••••••••••••••••"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => void deleteApiKey(),
                    className: "px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105",
                    style: {
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.25)",
                      color: "rgba(248,113,113,0.7)",
                      fontFamily: '"Share Tech Mono", monospace'
                    },
                    children: "Remove"
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "password",
                    value: apiInput,
                    onChange: (e) => setApiInput(e.target.value),
                    onKeyDown: (e) => e.key === "Enter" && void saveApiKey(),
                    placeholder: "sk-ant-... or sk-or-...",
                    className: "flex-1 px-3 py-2 text-[10px] outline-none",
                    style: { background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: colors.textPrimary }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => void saveApiKey(),
                    disabled: !apiInput.trim(),
                    className: "px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-40",
                    style: {
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      color: "#6366f1",
                      fontFamily: '"Share Tech Mono", monospace'
                    },
                    children: apiSaved ? "Saved ✓" : "Save"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[9px]", style: { color: colors.textMuted }, children: "Anthropic API key (sk-ant-...) or OpenRouter key (sk-or-...). Used for AI inference, guard alerts, and the Attentify assistant." })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 11 }), label: "System Protection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4",
            style: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold", style: { color: colors.textPrimary }, children: "Admin Privileges" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-0.5", style: { color: colors.textMuted }, children: store.elevation === "full" ? "Running elevated — hosts-file domain blocking active." : "Not elevated — domain blocking requires admin rights." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex-shrink-0 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest",
                    style: {
                      background: store.elevation === "full" ? "rgba(52,211,153,0.08)" : "rgba(251,191,36,0.08)",
                      border: `1px solid ${store.elevation === "full" ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`,
                      color: store.elevation === "full" ? "#34d399" : "#fbbf24",
                      fontFamily: '"Share Tech Mono", monospace'
                    },
                    children: store.elevation === "full" ? "Full" : "Limited"
                  }
                )
              ] }),
              store.elevation !== "full" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] mt-3", style: { color: "rgba(251,191,36,0.6)" }, children: "Run the app as Administrator once — it will register a Task Scheduler entry so future launches are automatically elevated without a UAC prompt." })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 11 }), label: "Safety & Recovery" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4 rounded-lg",
            style: { background: colors.cardBg, border: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16, style: { color: "#6366f1", marginTop: 2, flexShrink: 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-medium", style: { color: colors.textPrimary }, children: "Restore my system" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-0.5 leading-relaxed", style: { color: colors.textMuted }, children: "Undo everything Attentify has changed on this device — hosts-file blocks, firewall rules, browser DNS policies and the login startup entry — returning it to how it was before. Every change is recorded, so nothing is guessed at." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] mt-1.5", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: changeCount === null ? "" : `${changeCount} change${changeCount === 1 ? "" : "s"} recorded` })
                ] })
              ] }),
              revertResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "mt-3 p-3 rounded-md",
                  style: {
                    background: revertResult.ok ? "rgba(52,211,153,0.06)" : "rgba(251,191,36,0.06)",
                    border: `1px solid ${revertResult.ok ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}`
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { size: 11, style: { color: revertResult.ok ? "#34d399" : "#fbbf24" } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold", style: { color: revertResult.ok ? "#34d399" : "#fbbf24" }, children: revertResult.ok ? "System restored" : "Restored with warnings" })
                    ] }),
                    revertResult.undone.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px]", style: { color: colors.textMuted }, children: [
                      "· ",
                      u
                    ] }, i)),
                    revertResult.errors.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px]", style: { color: "#fbbf24" }, children: [
                      "! ",
                      e
                    ] }, `e${i}`))
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-3", children: [
                !confirmRevert ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      setRevertResult(null);
                      setConfirmRevert(true);
                    },
                    className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:brightness-110",
                    style: { background: "rgba(255,90,90,0.10)", border: "1px solid rgba(255,90,90,0.30)", color: "#ff7a7a" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 12 }),
                      " Restore my system"
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: handleRevert,
                      disabled: reverting,
                      className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-60",
                      style: { background: "rgba(255,90,90,0.16)", border: "1px solid rgba(255,90,90,0.45)", color: "#ff7a7a" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 12 }),
                        " ",
                        reverting ? "Restoring…" : "Yes, undo everything"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setConfirmRevert(false),
                      disabled: reverting,
                      className: "px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-60",
                      style: { background: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.textMuted },
                      children: "Cancel"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: toggleLog,
                    className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:brightness-110 ml-auto",
                    style: { background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)", color: "#a5b4fc" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 12 }),
                      " ",
                      changelog ? "Hide change log" : "View change log"
                    ]
                  }
                )
              ] }),
              changelog && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "mt-3 rounded-md overflow-y-auto",
                  style: { maxHeight: 220, background: "rgba(0,0,0,0.18)", border: `1px solid ${colors.border}` },
                  children: changelog.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] p-3", style: { color: colors.textMuted }, children: "No changes recorded yet." }) : changelog.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-2 px-3 py-1.5",
                      style: { borderBottom: i < changelog.length - 1 ? `1px solid ${colors.border}` : "none" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                            style: { background: "rgba(99,102,241,0.08)", color: "#a5b4fc", fontFamily: '"Share Tech Mono", monospace', flexShrink: 0, minWidth: 54, textAlign: "center" },
                            children: c.category
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] flex-1 min-w-0 truncate", style: { color: colors.textPrimary }, children: [
                          c.action,
                          c.target ? `: ${c.target}` : "",
                          c.detail && !c.target ? ` — ${c.detail}` : ""
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] flex-shrink-0", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: new Date(c.ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) })
                      ]
                    },
                    i
                  ))
                }
              )
            ]
          }
        )
      ] })
    ] })
  ] });
}
const api$4 = window.electronAPI;
const SCAN_STEPS = [
  { label: "Scanning installed applications…", duration: 2500 },
  { label: "Checking browser history patterns…", duration: 2800 },
  { label: "Analyzing notification load…", duration: 2200 },
  { label: "Identifying algorithmic feeds…", duration: 2e3 },
  { label: "Profiling focus vulnerabilities…", duration: 2500 },
  { label: "Generating attention risk report…", duration: 2e3 }
];
function Onboarding({ onComplete }) {
  const { colors } = useTheme();
  const [step, setStep] = reactExports.useState("welcome");
  const [scanProgress, setScanProgress] = reactExports.useState(0);
  const [scanStepIdx, setScanStepIdx] = reactExports.useState(0);
  const [issueCount, setIssueCount] = reactExports.useState(0);
  const [elevation, setElevation] = reactExports.useState("checking");
  const autoAdvanceRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (step !== "permission") return;
    setElevation("checking");
    api$4.requestElevation().then((status) => {
      setElevation(status);
      if (status === "full") {
        autoAdvanceRef.current = setTimeout(() => setStep("scanning"), 1800);
      }
    }).catch(() => setElevation("soft"));
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [step]);
  reactExports.useEffect(() => {
    if (step !== "scanning") return;
    let elapsed = 0;
    const total = SCAN_STEPS.reduce((sum, s) => sum + s.duration, 0);
    const timers = [];
    SCAN_STEPS.forEach((s, idx) => {
      const t = setTimeout(() => {
        setScanStepIdx(idx);
        setScanProgress(Math.round((elapsed + s.duration / 2) / total * 100));
      }, elapsed);
      elapsed += s.duration;
      timers.push(t);
    });
    const done = setTimeout(async () => {
      setScanProgress(100);
      try {
        const results = await api$4.runScan();
        setIssueCount(results.issueCount);
      } catch {
        setIssueCount(5);
      }
      setTimeout(() => setStep("results"), 500);
    }, total);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);
  const handleRelaunchAsAdmin = async () => {
    setElevation("relaunching");
    try {
      await api$4.relaunchAsAdmin();
    } catch {
      setElevation("soft");
    }
  };
  const Wrapper = ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "flex flex-col items-center justify-center w-screen h-screen overflow-hidden",
      style: { background: colors.mainBg },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex flex-col items-center text-center max-w-lg px-8 w-full", children })
    }
  );
  if (step === "welcome") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Wrapper, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", style: { filter: "drop-shadow(0 0 24px rgba(42,168,234,0.35))" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { size: 150 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-extrabold mb-2", style: { letterSpacing: "-0.02em", color: colors.textPrimary }, children: "Attentify" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-accent-blue font-semibold text-lg mb-3", children: "Anti mind virus." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base leading-relaxed mb-10", style: { color: colors.textSecondary }, children: [
        "The internet is engineered to steal your attention.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "We're engineered to get it back."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setStep("permission"),
          className: "flex items-center gap-2 bg-accent-blue hover:bg-accent-blue-light text-white font-bold px-10 py-4 rounded-full text-lg transition-all hover:scale-105",
          style: { boxShadow: "0 0 40px rgba(33,150,243,0.35)" },
          children: [
            "Get started ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-6", style: { color: colors.textMuted }, children: "No accounts. No telemetry. Everything stays on your device." })
    ] });
  }
  if (step === "permission") {
    const isChecking = elevation === "checking";
    const isElevated = elevation === "full";
    const isRelaunching = elevation === "relaunching";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Wrapper, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500",
          style: {
            background: isElevated ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.1)",
            border: `1px solid ${isElevated ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}`,
            boxShadow: isElevated ? "0 0 30px rgba(52,211,153,0.15)" : "0 0 30px rgba(251,191,36,0.1)"
          },
          children: isElevated ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 36, className: "text-accent-green" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 36, className: "text-accent-amber" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold mb-3", style: { color: colors.textPrimary }, children: isElevated ? "Full protection enabled" : "Administrator access needed" }),
      isChecking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm mb-8", style: { color: colors.textSecondary }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border border-t-transparent rounded-full animate-spin", style: { borderColor: colors.textSecondary, borderTopColor: "transparent" } }),
        "Checking system permissions…"
      ] }),
      isElevated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full mb-8 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", style: { color: colors.textSecondary }, children: "The app is running with administrator rights. All protection features are active." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 text-left", children: [
          "Hosts file blocking active",
          "DNS-over-HTTPS bypass blocked",
          "Process killing enabled",
          "Session enforcement ready"
        ].map((cap) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg", style: { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 12, className: "text-accent-green flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent-green text-[11px] font-medium", children: cap })
        ] }, cap)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: { color: colors.textMuted }, children: "Proceeding to initial scan in a moment…" })
      ] }),
      elevation === "soft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed mb-4", style: { color: colors.textSecondary }, children: "Attentify needs administrator rights to edit your system's hosts file — this is how site blocking works at the network layer, before browsers even load the page." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full p-4 rounded-xl mb-6 text-left", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold mb-2 uppercase tracking-wider", style: { color: colors.textSecondary }, children: "What admin access enables" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: [
            ["Hosts file blocking", "Sinkhole blocked domains at the OS level — no browser workaround"],
            ["DoH bypass prevention", "Block DNS-over-HTTPS so browsers use system DNS"],
            ["Process enforcement", "Kill blocked apps during deep focus sessions"]
          ].map(([title, desc]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 11, className: "text-accent-blue mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", style: { color: colors.textPrimary }, children: [
                title,
                " "
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", style: { color: colors.textSecondary }, children: desc })
            ] })
          ] }, title)) })
        ] })
      ] }),
      !isChecking && !isElevated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleRelaunchAsAdmin,
            disabled: isRelaunching,
            className: "flex items-center justify-center gap-2 text-white font-bold px-10 py-4 rounded-full text-base transition-all w-full max-w-xs hover:scale-105 disabled:opacity-60",
            style: { background: "rgba(33,150,243,0.9)", boxShadow: "0 0 25px rgba(33,150,243,0.3)" },
            children: isRelaunching ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16, className: "animate-spin" }),
              " Relaunching…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16 }),
              " Relaunch as Administrator"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: colors.textMuted }, children: "A UAC dialog will appear — click Yes to grant access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStep("scanning"),
            className: "text-sm underline underline-offset-2 transition-colors mt-1",
            style: { color: colors.textSecondary },
            children: "Continue without admin (limited protection)"
          }
        )
      ] }),
      isElevated && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setStep("scanning"),
          className: "flex items-center gap-2 text-white font-bold px-10 py-3.5 rounded-full transition-all hover:scale-105",
          style: { background: "rgba(52,211,153,0.8)", boxShadow: "0 0 20px rgba(52,211,153,0.2)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 }),
            " Continue to scan"
          ]
        }
      )
    ] });
  }
  if (step === "scanning") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Wrapper, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 h-24 rounded-full border border-accent-blue/20 flex items-center justify-center mx-auto relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2 border-accent-blue border-t-transparent animate-spin", style: { animationDuration: "1s" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-2 rounded-full border border-accent-blue/20 border-b-transparent animate-spin", style: { animationDuration: "1.8s", animationDirection: "reverse" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { size: 32, className: "text-accent-blue" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-2", style: { color: colors.textPrimary }, children: "Running Focus Scan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-8 h-5 transition-all duration-300", style: { color: colors.textSecondary }, children: SCAN_STEPS[scanStepIdx]?.label ?? "Finalizing…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-xs rounded-full overflow-hidden mb-2", style: { height: 3, background: colors.border }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full rounded-full transition-all duration-700",
          style: { width: `${scanProgress}%`, background: "linear-gradient(90deg, #1565c0, #3b9eff, #42a5f5)" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs tabular-nums", style: { color: colors.textSecondary }, children: [
        scanProgress,
        "%"
      ] })
    ] });
  }
  if (step === "results") {
    const severity = issueCount >= 8 ? "critical" : issueCount >= 4 ? "high" : "moderate";
    const sevColors = { critical: "#f87171", high: "#ff6b35", moderate: "#fbbf24" };
    const sevColor = sevColors[severity];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Wrapper, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6",
          style: { background: `${sevColor}18`, border: `1px solid ${sevColor}44`, boxShadow: `0 0 30px ${sevColor}22` },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { size: 36, style: { color: sevColor } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-3xl font-bold mb-2", style: { color: colors.textPrimary }, children: [
        "We found",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: sevColor }, children: issueCount }),
        " ",
        "attention leak",
        issueCount !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base mb-3", style: { color: colors.textSecondary }, children: severity === "critical" ? "Your device is heavily exposed to algorithmic attention drain." : severity === "high" ? "Several high-risk distractions are installed and configured to grab you." : "A few attention risks were found. Let's lock them down." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-8", style: { color: colors.textSecondary }, children: "Review each issue individually and decide what to block." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onComplete,
          className: "flex items-center gap-2 text-white font-bold px-10 py-4 rounded-full text-lg transition-all hover:scale-105",
          style: { background: "rgba(33,150,243,0.9)", boxShadow: "0 0 30px rgba(33,150,243,0.3)" },
          children: [
            "See full report ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-4", style: { color: colors.textMuted }, children: "You can dismiss any issue or block with one click" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Wrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}) });
}
const api$3 = window.electronAPI;
const CAT_COLOR = {
  productivity: "#34d399",
  development: "#34d399",
  communication: "#fbbf24",
  browser: "#3b9eff",
  social: "#f87171",
  entertainment: "#f87171",
  gaming: "#f87171",
  system: "#64748b",
  other: "#475569"
};
const PRODUCTIVE_CATS = /* @__PURE__ */ new Set(["productivity", "development"]);
const DISTRACTING_CATS = /* @__PURE__ */ new Set(["social", "entertainment", "gaming"]);
function fmt(ms) {
  const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  const s = Math.floor(ms / 1e3);
  return s > 0 ? `${s}s` : "—";
}
function fmtHM(ms) {
  const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  return `${h}:${String(m).padStart(2, "0")}`;
}
function dayKey(ts) {
  return new Date(ts).toISOString().split("T")[0];
}
function fmtDay(d) {
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function buildDays(sessions, weekStart) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart + i * 864e5);
    days.push({
      key: dayKey(date.getTime()),
      date,
      total: 0,
      productive: 0,
      distracting: 0,
      neutral: 0,
      byCategory: /* @__PURE__ */ new Map(),
      byApp: /* @__PURE__ */ new Map()
    });
  }
  const index = new Map(days.map((d) => [d.key, d]));
  for (const s of sessions) {
    const d = index.get(dayKey(s.startTime));
    if (!d) continue;
    d.total += s.duration;
    if (PRODUCTIVE_CATS.has(s.category)) d.productive += s.duration;
    else if (DISTRACTING_CATS.has(s.category) || s.isDistraction) d.distracting += s.duration;
    else d.neutral += s.duration;
    d.byCategory.set(s.category, (d.byCategory.get(s.category) ?? 0) + s.duration);
    const a = d.byApp.get(s.app) ?? { ms: 0, category: s.category, sessions: 0 };
    a.ms += s.duration;
    a.sessions += 1;
    d.byApp.set(s.app, a);
  }
  return days;
}
function Timesheets({ onChatWith }) {
  const { colors } = useTheme();
  const [sessions, setSessions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [weekOffset, setWeekOffset] = reactExports.useState(0);
  const [selectedDay, setSelectedDay] = reactExports.useState(null);
  const load = reactExports.useCallback(() => {
    setLoading(true);
    api$3.getTimesheet(28).then((r) => setSessions(r.sessions ?? [])).catch(() => setSessions([])).finally(() => setLoading(false));
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const off = api$3.onStoreRefresh?.(() => load());
    return () => {
      off?.();
    };
  }, [load]);
  const weekStart = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    now.setHours(0, 0, 0, 0);
    const dow = (now.getDay() + 6) % 7;
    return now.getTime() - dow * 864e5 + weekOffset * 7 * 864e5;
  }, [weekOffset]);
  const days = reactExports.useMemo(() => buildDays(sessions, weekStart), [sessions, weekStart]);
  const weekTotal = days.reduce((a, d) => a + d.total, 0);
  const weekProductive = days.reduce((a, d) => a + d.productive, 0);
  const weekDistracting = days.reduce((a, d) => a + d.distracting, 0);
  const productivityPct = weekTotal > 0 ? Math.round(weekProductive / weekTotal * 100) : 0;
  const maxDay = Math.max(1, ...days.map((d) => d.total));
  const weekApps = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const d of days) for (const [app, v] of d.byApp) {
      const cur = map.get(app) ?? { ms: 0, category: v.category, sessions: 0 };
      cur.ms += v.ms;
      cur.sessions += v.sessions;
      map.set(app, cur);
    }
    return [...map.entries()].map(([app, v]) => ({ app, ...v })).sort((a, b) => b.ms - a.ms).slice(0, 12);
  }, [days]);
  const selected = selectedDay ? days.find((d) => d.key === selectedDay) ?? null : null;
  const weekLabel = `${fmtDay(new Date(weekStart))} – ${fmtDay(new Date(weekStart + 6 * 864e5))}`;
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full animate-spin", style: { border: `2px solid ${colors.border}`, borderTopColor: colors.accent } }) });
  }
  const Stat = ({ label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 p-3.5 rounded-xl", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px]", style: { color: colors.textMuted }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[22px] font-semibold leading-none data-value", style: { color: color ?? colors.textPrimary }, children: value })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 animate-fade-in max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 16, style: { color: colors.accent } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-[15px]", style: { color: colors.textPrimary }, children: "Timesheets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: colors.textMuted }, children: "Where your logged time went, day by day" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWeekOffset((w) => w - 1), className: "p-1.5 rounded-lg", style: { border: `1px solid ${colors.border}`, color: colors.textMuted }, title: "Previous week", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] px-2 min-w-[150px] text-center", style: { color: colors.textSecondary }, children: weekLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setWeekOffset((w) => Math.min(0, w + 1)),
            disabled: weekOffset >= 0,
            className: "p-1.5 rounded-lg disabled:opacity-40",
            style: { border: `1px solid ${colors.border}`, color: colors.textMuted },
            title: "Next week",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: load,
            className: "flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg ml-1",
            style: { background: colors.accentBg, color: colors.textMuted, border: `1px solid ${colors.border}` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 11 }),
              " Refresh"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Logged this week", value: fmt(weekTotal) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Productive", value: fmt(weekProductive), color: colors.positive }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Distracting", value: fmt(weekDistracting), color: colors.negative }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Productivity", value: `${productivityPct}%`, color: productivityPct >= 60 ? colors.positive : productivityPct >= 35 ? colors.warning : colors.negative })
    ] }),
    weekTotal === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-6 text-center", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px]", style: { color: colors.textSecondary }, children: "No time logged this week." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] mt-1", style: { color: colors.textMuted }, children: "Keep Attentify running — your timesheet fills in as you work." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium mb-3", style: { color: colors.textMuted }, children: "Daily breakdown — click a day for details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: days.map((d) => {
          const isToday = d.key === dayKey(Date.now());
          const isSel = d.key === selectedDay;
          const cats = [...d.byCategory.entries()].sort((a, b) => b[1] - a[1]);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelectedDay(isSel ? null : d.key),
              className: "w-full flex items-center gap-3 py-1.5 px-2 rounded-lg text-left transition-colors",
              style: { background: isSel ? colors.accentBg : "transparent" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] w-24 flex-shrink-0", style: { color: isToday ? colors.accent : colors.textSecondary, fontWeight: isToday ? 600 : 400 }, children: fmtDay(d.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-5 rounded-md overflow-hidden flex", style: { background: "rgba(120,130,160,0.08)", minWidth: 0 }, children: cats.map(([cat, ms]) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: `${cat}: ${fmt(ms)}`, style: { width: `${ms / maxDay * 100}%`, background: CAT_COLOR[cat] } }, cat)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] w-16 text-right flex-shrink-0 data-value", style: { color: colors.textPrimary }, children: fmtHM(d.total) })
              ]
            },
            d.key
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3", style: { borderTop: `1px solid ${colors.border}` }, children: ["productivity", "development", "browser", "communication", "social", "entertainment", "gaming", "system", "other"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-[10px] capitalize", style: { color: colors.textMuted }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm", style: { background: CAT_COLOR[c] } }),
          " ",
          c
        ] }, c)) })
      ] }),
      selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[12px] font-medium", style: { color: colors.textPrimary }, children: [
            fmtDay(selected.date),
            " — time entries"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px]", style: { color: colors.textMuted }, children: [
            fmt(selected.total),
            " total"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TimeEntryTable, { rows: [...selected.byApp.entries()].map(([app, v]) => ({ app, ...v })).sort((a, b) => b.ms - a.ms), total: selected.total, colors })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] font-medium mb-3", style: { color: colors.textPrimary }, children: "Top apps this week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TimeEntryTable, { rows: weekApps, total: weekTotal, colors })
      ] }),
      onChatWith && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onChatWith(`Look at my timesheet for the week of ${weekLabel}: ${fmt(weekTotal)} logged, ${fmt(weekProductive)} productive (${productivityPct}%), ${fmt(weekDistracting)} distracting. Where am I leaking time and what should I change?`),
          className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium transition-colors hover:brightness-110",
          style: { background: colors.accentBg, border: `1px solid ${colors.border}`, color: colors.accent },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 13 }),
            " Ask Attentify about this week"
          ]
        }
      )
    ] })
  ] });
}
function TimeEntryTable({ rows, total, colors }) {
  const max = Math.max(1, ...rows.map((r) => r.ms));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", title: `${r.app} · ${r.sessions} session${r.sessions !== 1 ? "s" : ""} · ${total > 0 ? Math.round(r.ms / total * 100) : 0}% of the day`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm flex-shrink-0", style: { background: CAT_COLOR[r.category] } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] w-40 truncate flex-shrink-0", style: { color: colors.textSecondary }, children: r.app }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-3 rounded overflow-hidden", style: { background: "rgba(120,130,160,0.08)", minWidth: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded", style: { width: `${r.ms / max * 100}%`, background: CAT_COLOR[r.category], opacity: 0.85 } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] w-16 text-right flex-shrink-0 data-value", style: { color: colors.textPrimary }, children: fmt(r.ms) })
  ] }, r.app)) });
}
const api$2 = window.electronAPI;
function Section({ icon, title, count, defaultOpen = true, children }) {
  const { colors } = useTheme();
  const [open, setOpen] = reactExports.useState(defaultOpen);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl overflow-hidden", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen((v) => !v), className: "w-full flex items-center gap-2 px-3.5 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: colors.accent }, children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12.5px] font-semibold flex-1 text-left", style: { color: colors.textPrimary }, children: title }),
      count !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full", style: { background: colors.accentBg, color: colors.textMuted }, children: count }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14, style: { color: colors.textMuted } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, style: { color: colors.textMuted } })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3.5 pb-3.5 pt-0.5", children })
  ] });
}
function FlowNode({ label, text, tone = "neutral", confidence }) {
  const { colors } = useTheme();
  const toneColor = tone === "accent" ? colors.accent : tone === "positive" ? colors.positive : tone === "warning" ? colors.warning : tone === "negative" ? colors.negative : colors.textMuted;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg px-3 py-2", style: { background: colors.inputBg, borderLeft: `2px solid ${toneColor}`, border: `1px solid ${colors.border}`, borderLeftWidth: 2, borderLeftColor: toneColor }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8.5px] font-bold uppercase tracking-widest", style: { color: toneColor, fontFamily: '"Share Tech Mono", monospace' }, children: label }),
      confidence !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: { width: 44, background: colors.border }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: { width: `${Math.round(confidence * 100)}%`, background: toneColor } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] data-value", style: { color: colors.textMuted }, children: [
          Math.round(confidence * 100),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] leading-snug mt-0.5", style: { color: colors.textSecondary }, children: text })
  ] });
}
function Connector() {
  const { colors } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", style: { height: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { size: 12, style: { color: colors.textDim } }) });
}
function ReasoningChain({ inf, onResolve }) {
  const { colors } = useTheme();
  const [open, setOpen] = reactExports.useState(false);
  const kind = inf.type === "domain" ? "site" : "app";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg mb-2", style: { border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen((v) => !v), className: "w-full flex items-center gap-2 px-3 py-2 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, style: { color: colors.accent, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[12px] flex-1", style: { color: colors.textPrimary }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: inf.value }),
        " is likely a distraction ",
        kind
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] data-value flex-shrink-0", style: { color: colors.textMuted }, children: [
        Math.round(inf.confidence * 100),
        "%"
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13, style: { color: colors.textMuted } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 13, style: { color: colors.textMuted } })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlowNode, { label: "Signal", text: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Attentify observed activity on ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: inf.value }),
        " in your tracked behavior."
      ] }), tone: "neutral" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Connector, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlowNode, { label: "Inferred", text: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: inf.value }),
        " is likely a distraction ",
        kind,
        " for you."
      ] }), tone: "accent", confidence: inf.confidence }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Connector, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlowNode, { label: "Because", text: inf.reasoning || "It matches patterns of distraction seen in your activity.", tone: "muted" }),
      inf.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Connector, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlowNode, { label: "Suggested", text: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Block ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: inf.value }),
          " to protect your focus."
        ] }), tone: "warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onResolve(inf.id, "confirmed"),
              className: "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded-lg transition-all",
              style: { background: colors.positiveBg, color: colors.positive, border: `1px solid rgba(52,211,153,0.3)` },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }),
                " Confirm & block"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onResolve(inf.id, "rejected"),
              className: "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded-lg transition-all",
              style: { background: colors.cardBg, color: colors.textMuted, border: `1px solid ${colors.border}` },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }),
                " Not a distraction"
              ]
            }
          )
        ] })
      ] }),
      inf.status !== "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] mt-2", style: { color: colors.textDim }, children: [
        "Resolved: ",
        inf.status
      ] })
    ] })
  ] });
}
function PatternChain({ alert }) {
  const { colors } = useTheme();
  const [open, setOpen] = reactExports.useState(false);
  const tone = alert.severity === "high" ? "negative" : alert.severity === "medium" ? "warning" : "positive";
  const toneColor = tone === "negative" ? colors.negative : tone === "warning" ? colors.warning : colors.positive;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg mb-2", style: { border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen((v) => !v), className: "w-full flex items-center gap-2 px-3 py-2 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full flex-shrink-0", style: { background: toneColor } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] flex-1 font-medium", style: { color: colors.textPrimary }, children: alert.title }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13, style: { color: colors.textMuted } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 13, style: { color: colors.textMuted } })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlowNode, { label: "Pattern detected", text: alert.title, tone }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Connector, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlowNode, { label: "What it means", text: alert.description, tone: "muted" })
    ] })
  ] });
}
function Logic() {
  const { colors } = useTheme();
  const [inferences, setInferences] = reactExports.useState([]);
  const [goals, setGoals] = reactExports.useState([]);
  const [prefs, setPrefs] = reactExports.useState([]);
  const [context, setContext] = reactExports.useState([]);
  const [alerts, setAlerts] = reactExports.useState([]);
  const [topDistractor, setTopDistractor] = reactExports.useState(null);
  const [input, setInput] = reactExports.useState("");
  const [adding, setAdding] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const load = reactExports.useCallback(() => {
    Promise.all([
      api$2.getInferences().then((r) => setInferences(r)).catch(() => {
      }),
      api$2.getGoals().then((r) => setGoals(r)).catch(() => {
      }),
      api$2.getPreferences().then(setPrefs).catch(() => {
      }),
      api$2.getUserContext().then(setContext).catch(() => {
      }),
      api$2.getAnalytics().then((d) => {
        setAlerts((d.heuristicAlerts ?? []).filter((a) => !a.dismissed));
        const byApp = /* @__PURE__ */ new Map();
        for (const s of (d.recentSessions ?? []).filter((s2) => s2.isDistraction)) byApp.set(s.app, (byApp.get(s.app) ?? 0) + s.duration);
        setTopDistractor([...byApp.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null);
      }).catch(() => {
      })
    ]).finally(() => setLoading(false));
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const off = api$2.onStoreRefresh?.(() => load());
    return () => {
      off?.();
    };
  }, [load]);
  const resolve = async (id, action) => {
    await api$2.resolveInference(id, action).catch(() => {
    });
    load();
  };
  const addContext = async () => {
    const t = input.trim();
    if (!t || adding) return;
    setAdding(true);
    try {
      const res = await api$2.addUserContext(t);
      if (res.ok && res.note) {
        setContext((prev) => [res.note, ...prev]);
        setInput("");
      }
    } catch {
    }
    setAdding(false);
  };
  const delContext = async (id) => {
    await api$2.deleteUserContext(id).catch(() => {
    });
    setContext((prev) => prev.filter((c) => c.id !== id));
  };
  const pending = inferences.filter((i) => i.status === "pending");
  const activeInf = pending.length > 0 ? pending : inferences.slice(0, 6);
  const chip = (label, value, color) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg px-3 py-2 flex-1 min-w-[90px]", style: { background: colors.cardBg, border: `1px solid ${colors.border}` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[16px] font-bold leading-none data-value", style: { color: color ?? colors.textPrimary }, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px] mt-1", style: { color: colors.textMuted }, children: label })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-5 py-5 space-y-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 17, style: { color: colors.accent } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[15px] font-semibold", style: { color: colors.textPrimary }, children: "Logic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: colors.textMuted }, children: "How Attentify reasons about your attention — and what it's working from." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: load, className: "p-1.5 rounded-lg", style: { border: `1px solid ${colors.border}`, color: colors.textMuted }, title: "Refresh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2.5", children: [
        chip("Goals", goals.length, colors.accent),
        chip("Learned prefs", prefs.length),
        chip("Live signals", pending.length, pending.length ? colors.warning : colors.textMuted),
        chip("Patterns", alerts.length, alerts.length ? colors.negative : colors.textMuted),
        chip("Top drain", topDistractor ?? "—", topDistractor ? colors.negative : colors.textMuted)
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full animate-spin", style: { border: `2px solid ${colors.border}`, borderTopColor: colors.accent } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 14 }), title: "Context I'm using", count: goals.length + prefs.length + context.length, children: goals.length === 0 && prefs.length === 0 && context.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: colors.textMuted }, children: "Nothing yet. Set a goal in chat, or add context below — it sharpens my reasoning." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          goals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px] font-semibold uppercase tracking-wide mb-1.5", style: { color: colors.textMuted }, children: "Your goals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: goals.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] px-2 py-1 rounded-lg", style: { background: colors.accentBg, color: colors.textSecondary, border: `1px solid ${colors.border}` }, children: g.text }, g.id)) })
          ] }),
          context.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px] font-semibold uppercase tracking-wide mb-1.5", style: { color: colors.textMuted }, children: "Context you gave me" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: context.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-center gap-2 px-2.5 py-1.5 rounded-lg", style: { background: colors.inputBg, border: `1px solid ${colors.border}` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 11, style: { color: colors.accent, flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11.5px] flex-1", style: { color: colors.textSecondary }, children: c.text }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void delContext(c.id), className: "opacity-0 group-hover:opacity-100 transition-opacity", style: { color: colors.textMuted }, title: "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 11 }) })
            ] }, c.id)) })
          ] }),
          prefs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px] font-semibold uppercase tracking-wide mb-1.5", style: { color: colors.textMuted }, children: "Learned about you" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: prefs.slice(0, 12).map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2.5 py-1.5 rounded-lg", style: { background: colors.inputBg, border: `1px solid ${colors.border}` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] flex-1", style: { color: colors.textSecondary }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { style: { color: colors.textPrimary }, children: p.key }),
                ": ",
                p.value
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8.5px] px-1.5 py-0.5 rounded", style: { background: colors.accentBg, color: colors.textMuted }, children: [
                p.source === "user" ? "you told me" : "inferred",
                " · ",
                p.scope
              ] })
            ] }, i)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14 }), title: "Live reasoning", count: activeInf.length, defaultOpen: activeInf.length > 0, children: activeInf.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: colors.textMuted }, children: "No active signals. As you work, Attentify surfaces reasoning about what's pulling your focus here." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mb-2", style: { color: colors.textMuted }, children: "Each chain shows how a signal in your behavior becomes a conclusion. Click to expand." }),
          activeInf.map((inf) => /* @__PURE__ */ jsxRuntimeExports.jsx(ReasoningChain, { inf, onResolve: resolve }, inf.id))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 14 }), title: "Behavioral patterns", count: alerts.length, defaultOpen: alerts.length > 0, children: alerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px]", style: { color: colors.textMuted }, children: "No patterns detected recently." }) : alerts.slice(0, 12).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(PatternChain, { alert: a }, a.id)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 px-5 py-3", style: { borderTop: `1px solid ${colors.border}`, background: colors.mainBg }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-xl", style: { background: colors.inputBg, border: `1px solid ${colors.borderMid}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13, style: { color: colors.accent, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") void addContext();
            },
            disabled: adding,
            placeholder: "Tell Attentify something to inform it — e.g. “Reddit is for work” or “I do night shifts”",
            className: "flex-1 bg-transparent text-[12px] outline-none disabled:opacity-60",
            style: { color: colors.textPrimary, caretColor: colors.accent }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => void addContext(),
            disabled: !input.trim() || adding,
            className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40 flex-shrink-0",
            style: { background: colors.accentBg, border: `1px solid ${colors.borderMid}`, color: colors.accent },
            children: adding ? "Adding…" : "Add context"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px] mt-1.5 text-center", style: { color: colors.textDim }, children: "Stored on your device and used to inform how Attentify reasons about you." })
    ] }) })
  ] });
}
const WELCOME_TEXT = "Hey. I'm Attentify, your focus assistant. Tell me what you need to focus on and I'll block everything that gets in the way.\n\nTry: **Block Instagram for 2 hours** or **Start a deep focus session**";
const DEFAULT_TITLES = /* @__PURE__ */ new Set(["New chat", "Chat"]);
const api$1 = window.electronAPI;
function cleanForDisplay(text) {
  let t = text;
  t = t.replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, "");
  t = t.replace(/<function_results>[\s\S]*?<\/function_results>/gi, "");
  t = t.replace(/<invoke\b[\s\S]*?<\/invoke>/gi, "");
  t = t.replace(/<\/?(?:antml:[a-z_]+|tool_call|tool_use|parameter)\b[^>]*>/gi, "");
  t = t.replace(/```(?:json|tool_code|xml|tool_use)?\s*[[{][\s\S]*?[\]}]\s*```/gi, "");
  const openers = [
    t.indexOf("<function_calls>"),
    t.search(/<invoke\b/),
    t.search(/```(?:json|tool_code|tool_use)/)
  ].filter((i) => i >= 0);
  if (openers.length) t = t.slice(0, Math.min(...openers));
  const trimmed = t.trim();
  if (/^[[{][\s\S]*[\]}]$/.test(trimmed) && /"(name|parameters|tool_name|recipient_name|input|domain|action)"\s*:/.test(trimmed)) {
    return "";
  }
  return t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}
const QUICK_COMMANDS = [
  "I'm writing until 5pm, keep me off social",
  "Hide YouTube Shorts but keep my subscriptions",
  "No music videos or rage bait in my feed",
  "What's been eating my focus this week?"
];
function looksLikeDebug(content) {
  const t = content.trim();
  if (!t) return true;
  if (/^[[{]/.test(t) && /"(distraction|distractionProbability|intent|confidence|category|reasoning|predicted_domain)"\s*:/.test(t)) return true;
  if (/analyze browsing context|distractionProbability|goalAligned|"behavior"\s*:\s*\{|"dwellMs"/.test(t)) return true;
  return false;
}
function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  lines.forEach((line, lineIdx) => {
    if (line.startsWith("### ")) {
      elements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[11px] mt-2 mb-0.5", children: renderInline(line.slice(4)) }, lineIdx));
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-xs mt-2 mb-0.5", children: renderInline(line.slice(3)) }, lineIdx));
      return;
    }
    if (line.startsWith("# ")) {
      elements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-xs mt-2 mb-1", children: renderInline(line.slice(2)) }, lineIdx));
      return;
    }
    if (/^[-*•]\s/.test(line)) {
      elements.push(
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 my-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 opacity-60 flex-shrink-0", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: renderInline(line.slice(2)) })
        ] }, lineIdx)
      );
      return;
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 my-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-shrink-0 opacity-60", children: [
              match[1],
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: renderInline(match[2]) })
          ] }, lineIdx)
        );
        return;
      }
    }
    if (/^---+$/.test(line.trim())) {
      elements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "my-2 opacity-20" }, lineIdx));
      return;
    }
    if (line.trim() === "") {
      if (lineIdx > 0 && lineIdx < lines.length - 1) {
        elements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5" }, lineIdx));
      }
      return;
    }
    elements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderInline(line) }, lineIdx));
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: elements });
}
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: part.slice(2, -2) }, i);
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "italic opacity-80", children: part.slice(1, -1) }, i);
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-1 py-0.5 rounded text-[10px] font-mono", style: { background: "rgba(255,255,255,0.1)" }, children: part.slice(1, -1) }, i);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: part }, i);
  }) });
}
function ChatPanel({ onClose, onRefresh, initialMessage = "", variant = "panel" }) {
  const isFull = variant === "full";
  const { colors } = useTheme();
  const [messages, setMessages] = reactExports.useState([]);
  const [input, setInput] = reactExports.useState(initialMessage);
  const [sending, setSending] = reactExports.useState(false);
  const [activeToolName, setActiveToolName] = reactExports.useState(null);
  const [streamingId, setStreamingId] = reactExports.useState(null);
  const [confirmClear, setConfirmClear] = reactExports.useState(false);
  const [paywalled, setPaywalled] = reactExports.useState(false);
  const [checkingOut, setCheckingOut] = reactExports.useState(false);
  const [attachments, setAttachments] = reactExports.useState([]);
  const bottomRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const streamingIdRef = reactExports.useRef(null);
  const scrollContainerRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const attachmentsRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  const [conversations, setConversations] = reactExports.useState([]);
  const [currentConvId, setCurrentConvId] = reactExports.useState(null);
  const [showConvMenu, setShowConvMenu] = reactExports.useState(false);
  const currentConvIdRef = reactExports.useRef(null);
  const conversationsRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    currentConvIdRef.current = currentConvId;
  }, [currentConvId]);
  reactExports.useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  const welcomeMsg = () => [{ id: "welcome", role: "assistant", content: WELCOME_TEXT, timestamp: Date.now() }];
  const [checkpointByMsg, setCheckpointByMsg] = reactExports.useState({});
  const [confirmRestore, setConfirmRestore] = reactExports.useState(null);
  const [restoringId, setRestoringId] = reactExports.useState(null);
  const [restoreNote, setRestoreNote] = reactExports.useState(null);
  const loadCheckpoints = reactExports.useCallback(async (convId) => {
    try {
      const cps = await api$1.getCheckpoints(convId);
      const map = {};
      for (const c of cps) if (c.message_id) map[c.message_id] = { id: c.id, label: c.label };
      setCheckpointByMsg(map);
    } catch {
      setCheckpointByMsg({});
    }
  }, []);
  const doRestore = reactExports.useCallback(async (cpId, label) => {
    setRestoringId(cpId);
    let res = { ok: false };
    try {
      res = await api$1.restoreCheckpoint(cpId);
    } catch {
      res = { ok: false, error: "Restore failed" };
    }
    setRestoringId(null);
    setConfirmRestore(null);
    setRestoreNote(res.ok ? `Reverted to “${label || "this point"}”` : res.error || "Could not revert");
    if (res.ok) onRefresh();
    setTimeout(() => setRestoreNote(null), 4e3);
  }, [onRefresh]);
  const loadConversation = reactExports.useCallback(async (id) => {
    void loadCheckpoints(id);
    try {
      const rows = await api$1.getConversationMessages(id, 200);
      const visible = (rows ?? []).filter((r) => r.role === "user" || r.role === "assistant").filter((r) => !looksLikeDebug(r.content.startsWith("[proactive] ") ? r.content.slice(12) : r.content)).map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content.startsWith("[proactive] ") ? r.content.slice(12) : r.content,
        timestamp: r.ts
      }));
      setMessages(visible.length > 0 ? visible : welcomeMsg());
    } catch {
      setMessages(welcomeMsg());
    }
  }, []);
  reactExports.useEffect(() => {
    void (async () => {
      let convs = [];
      try {
        convs = await api$1.getConversations();
      } catch {
        convs = [];
      }
      if (!convs || convs.length === 0) {
        try {
          convs = [await api$1.createConversation("Chat")];
        } catch {
          convs = [];
        }
      }
      setConversations(convs);
      const cur = convs[0]?.id ?? null;
      setCurrentConvId(cur);
      if (cur) void loadConversation(cur);
      else setMessages(welcomeMsg());
    })();
  }, [loadConversation]);
  const refreshConversations = reactExports.useCallback(() => {
    api$1.getConversations().then(setConversations).catch(() => {
    });
  }, []);
  const newConversation = reactExports.useCallback(async () => {
    try {
      const c = await api$1.createConversation("New chat");
      setConversations((prev) => [c, ...prev]);
      setCurrentConvId(c.id);
      setMessages(welcomeMsg());
      setShowConvMenu(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
    }
  }, []);
  const switchConversation = reactExports.useCallback((id) => {
    setShowConvMenu(false);
    if (id === currentConvIdRef.current) return;
    setCurrentConvId(id);
    void loadConversation(id);
  }, [loadConversation]);
  const deleteConv = reactExports.useCallback(async (id) => {
    await api$1.deleteConversation(id).catch(() => {
    });
    const remaining = conversationsRef.current.filter((c) => c.id !== id);
    setConversations(remaining);
    if (currentConvIdRef.current === id) {
      if (remaining[0]) {
        setCurrentConvId(remaining[0].id);
        void loadConversation(remaining[0].id);
      } else {
        try {
          const c = await api$1.createConversation("Chat");
          setConversations([c]);
          setCurrentConvId(c.id);
          setMessages(welcomeMsg());
        } catch {
        }
      }
    }
  }, [loadConversation]);
  reactExports.useEffect(() => {
    const offChunk = api$1.onChatChunk((chunk) => {
      setMessages((prev) => {
        const id = streamingIdRef.current;
        if (!id) return prev;
        return prev.map(
          (m) => m.id === id ? { ...m, content: chunk } : m
        );
      });
    });
    const offTool = api$1.onChatTool((toolName) => {
      setActiveToolName(toolName);
      setTimeout(() => setActiveToolName(null), 3e3);
    });
    const offDone = api$1.onChatDone((evt) => {
      const sid = streamingIdRef.current;
      setSending(false);
      setStreamingId(null);
      streamingIdRef.current = null;
      setActiveToolName(null);
      setMessages(
        (prev) => prev.map(
          (m) => m.id === sid || m.streaming ? { ...m, id: evt.id, content: evt.content, streaming: false } : m
        )
      );
      refreshConversations();
      if (currentConvIdRef.current) void loadCheckpoints(currentConvIdRef.current);
      onRefresh();
    });
    const offError = api$1.onChatError((err) => {
      setSending(false);
      setStreamingId(null);
      streamingIdRef.current = null;
      setActiveToolName(null);
      const isPaywall = err === "PAYWALL";
      if (isPaywall) setPaywalled(true);
      setMessages((prev) => [
        ...prev.filter((m) => !m.streaming),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: isPaywall ? "You've used up your **$1 of free AI**. Subscribe to **Attentify Cloud** for **$5/month** to keep using the assistant — or add your own OpenRouter key in Settings (never metered)." : `Error: ${err}`,
          timestamp: Date.now()
        }
      ]);
    });
    return () => {
      offChunk();
      offTool();
      offDone();
      offError();
    };
  }, [onRefresh]);
  reactExports.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 120;
    if (nearBottom || !sending) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, sending]);
  reactExports.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const sendMessage = reactExports.useCallback(async (text) => {
    const atts = attachmentsRef.current;
    if (!text.trim() && atts.length === 0 || sending) return;
    setSending(true);
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
      images: atts.length ? atts.map((a) => a.dataUrl) : void 0
    };
    const assistantId = crypto.randomUUID();
    streamingIdRef.current = assistantId;
    setStreamingId(assistantId);
    const streamingMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true
    };
    setMessages((prev) => [...prev, userMsg, streamingMsg]);
    setInput("");
    setAttachments([]);
    const convId = currentConvIdRef.current ?? void 0;
    if (convId && text.trim()) {
      const conv = conversationsRef.current.find((c) => c.id === convId);
      if (conv && DEFAULT_TITLES.has(conv.title)) {
        const title = text.trim().replace(/\s+/g, " ").slice(0, 40);
        api$1.renameConversation(convId, title).catch(() => {
        });
        setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, title } : c));
      }
    }
    api$1.chatStart(text.trim() || "What do you see in this image?", atts.map((a) => ({ media_type: a.mediaType, data: a.data })), convId);
  }, [sending]);
  const addFiles = reactExports.useCallback((files) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 4);
    for (const file of imgs) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const comma = dataUrl.indexOf(",");
        setAttachments((prev) => prev.length >= 4 ? prev : [...prev, {
          id: crypto.randomUUID(),
          dataUrl,
          mediaType: file.type,
          data: dataUrl.slice(comma + 1)
        }]);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const clearHistory = reactExports.useCallback(async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3e3);
      return;
    }
    await api$1.clearChatHistory(currentConvIdRef.current ?? void 0);
    setConfirmClear(false);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "History cleared. I'm Attentify, your focus assistant — tell me what you need to focus on.",
      timestamp: Date.now()
    }]);
  }, [confirmClear]);
  const handleSubscribe = reactExports.useCallback(async () => {
    setCheckingOut(true);
    try {
      const res = await api$1.cloudCheckout();
      if (res.url) await api$1.openExternal(res.url);
    } catch {
    }
    setCheckingOut(false);
  }, []);
  const showQuickCommands = messages.length <= 1 || messages.length === 1 && messages[0]?.id === "welcome";
  const currentConv = conversations.find((c) => c.id === currentConvId);
  const convTitle = currentConv?.title || "Chat";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: isFull ? "flex flex-col h-full w-full max-w-3xl mx-auto" : "flex flex-col w-[380px] h-full flex-shrink-0 animate-slide-in-right",
      style: isFull ? { background: "transparent" } : { background: colors.panelBg, borderLeft: `1px solid ${colors.border}` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between px-4 py-2.5 flex-shrink-0", style: { borderBottom: `1px solid ${colors.border}` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { size: isFull ? 30 : 26 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowConvMenu((v) => !v), className: "flex flex-col items-start min-w-0 titlebar-nodrag", title: "Switch conversation", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-semibold text-[13px] max-w-[180px] truncate", style: { color: colors.textPrimary }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: convTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12, style: { opacity: 0.6, flexShrink: 0 } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", style: { color: colors.textMuted }, children: "Runs locally · private" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 titlebar-nodrag", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => void newConversation(), title: "New chat", className: "transition-colors p-1.5 rounded", style: { color: colors.textMuted }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => void clearHistory(),
                title: confirmClear ? "Click again to confirm" : "Clear this conversation",
                className: "transition-colors p-1.5 rounded",
                style: { color: confirmClear ? "#f87171" : colors.textMuted, background: confirmClear ? "rgba(248,113,113,0.1)" : "transparent" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
              }
            ),
            onClose && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "transition-colors p-1", style: { color: colors.textMuted }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
          ] }),
          showConvMenu && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40", onClick: () => setShowConvMenu(false) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute z-50 left-4 top-full mt-1 w-64 rounded-xl overflow-hidden shadow-xl", style: { background: colors.panelBg, border: `1px solid ${colors.borderMid}` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-72 overflow-y-auto py-1", children: [
                conversations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2 text-[11px]", style: { color: colors.textMuted }, children: "No conversations yet" }),
                conversations.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    onClick: () => switchConversation(c.id),
                    className: "group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                    style: { background: c.id === currentConvId ? colors.accentBg : "transparent" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 12, style: { color: c.id === currentConvId ? colors.accent : colors.textMuted, flexShrink: 0 } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-[12px] truncate", style: { color: c.id === currentConvId ? colors.textPrimary : colors.textSecondary }, children: c.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            void deleteConv(c.id);
                          },
                          title: "Delete conversation",
                          className: "opacity-0 group-hover:opacity-100 transition-opacity p-0.5",
                          style: { color: colors.textMuted },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 11 })
                        }
                      )
                    ]
                  },
                  c.id
                ))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => void newConversation(),
                  className: "w-full flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium transition-colors",
                  style: { borderTop: `1px solid ${colors.border}`, color: colors.accent },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13 }),
                    " New chat"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        restoreNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 flex-shrink-0", style: { background: colors.accentBg, borderBottom: `1px solid ${colors.border}` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, style: { color: colors.accent } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px]", style: { color: colors.textSecondary }, children: restoreNote })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollContainerRef, className: "flex-1 overflow-y-auto px-4 py-4 space-y-3", children: [
          messages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`, children: [
              msg.role === "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 mt-0.5 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { size: 24 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "select-text max-w-[85%] px-3 py-2.5 text-xs leading-relaxed",
                  style: {
                    background: msg.role === "user" ? colors.userBubbleBg : colors.aiBubbleBg,
                    border: `1px solid ${msg.role === "user" ? colors.userBubbleBorder : colors.aiBubbleBorder}`,
                    color: msg.role === "user" ? colors.userBubbleText : colors.aiBubbleText,
                    borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "4px 12px 12px 12px"
                  },
                  children: [
                    msg.images && msg.images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-1.5", children: msg.images.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "attachment", className: "rounded-lg", style: { maxWidth: 140, maxHeight: 140, objectFit: "cover", border: `1px solid ${colors.border}` } }, i)) }),
                    msg.streaming && msg.content === "" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 py-0.5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full animate-bounce", style: { background: colors.textMuted, animationDelay: `${i * 150}ms` } }, i)) }) : renderMarkdown(msg.role === "assistant" ? cleanForDisplay(msg.content) : msg.content),
                    msg.streaming && msg.content !== "" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-3 ml-0.5 rounded-sm animate-pulse", style: { background: colors.textMuted, verticalAlign: "text-bottom" } })
                  ]
                }
              )
            ] }),
            msg.role === "user" && checkpointByMsg[msg.id] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mt-1 pr-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => confirmRestore === checkpointByMsg[msg.id].id ? void doRestore(checkpointByMsg[msg.id].id, checkpointByMsg[msg.id].label) : setConfirmRestore(checkpointByMsg[msg.id].id),
                disabled: restoringId === checkpointByMsg[msg.id].id,
                className: "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100",
                style: { color: confirmRestore === checkpointByMsg[msg.id].id ? colors.warning : colors.textMuted, border: `1px solid ${colors.border}` },
                title: "Revert blocks, schedules and cards to how they were before this message",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 10 }),
                  restoringId === checkpointByMsg[msg.id].id ? "Reverting…" : confirmRestore === checkpointByMsg[msg.id].id ? "Click to confirm" : "Restore checkpoint"
                ]
              }
            ) })
          ] }, msg.id)),
          activeToolName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, className: "text-accent-blue" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "px-3 py-2 text-[10px] italic flex items-center gap-1.5",
                style: { color: colors.textMuted },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-1 rounded-full bg-accent-blue animate-pulse" }),
                  "Using tool: ",
                  activeToolName
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
        ] }),
        showQuickCommands && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mb-2", style: { color: colors.textMuted }, children: "Quick commands:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: QUICK_COMMANDS.map((cmd) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => sendMessage(cmd),
              className: "px-2.5 py-1.5 rounded-full text-[10px] transition-colors",
              style: { background: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.textSecondary },
              children: cmd
            },
            cmd
          )) })
        ] }),
        paywalled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-2 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => void handleSubscribe(),
            disabled: checkingOut,
            className: "w-full py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 rounded-xl",
            style: { background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" },
            children: checkingOut ? "Opening checkout…" : "Subscribe — $5/month"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 px-4 pb-4", style: { borderTop: `1px solid ${colors.border}`, paddingTop: 12 }, children: [
          attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: attachments.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: { width: 52, height: 52 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.dataUrl, alt: "attachment", className: "rounded-lg w-full h-full", style: { objectFit: "cover", border: `1px solid ${colors.border}` } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setAttachments((prev) => prev.filter((x) => x.id !== a.id)),
                className: "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center",
                style: { background: colors.negative, color: "#fff" },
                title: "Remove",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 9 })
              }
            )
          ] }, a.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "image/*",
                multiple: true,
                className: "hidden",
                onChange: (e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => fileInputRef.current?.click(),
                disabled: sending || attachments.length >= 4,
                title: "Attach image",
                className: "w-9 h-9 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 disabled:opacity-40",
                style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textMuted },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 14 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: inputRef,
                type: "text",
                placeholder: "Block Twitter for 2 hours…",
                value: input,
                onChange: (e) => setInput(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && !e.shiftKey && sendMessage(input),
                onPaste: (e) => {
                  const imgs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
                  if (imgs.length) {
                    e.preventDefault();
                    addFiles(imgs);
                  }
                },
                disabled: sending,
                className: "flex-1 text-xs px-3 py-2.5 rounded-xl outline-none transition-colors disabled:opacity-60",
                style: { background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => sendMessage(input),
                disabled: !input.trim() && attachments.length === 0 || sending,
                className: "w-9 h-9 flex items-center justify-center bg-accent-blue hover:bg-accent-blue-light disabled:opacity-40 rounded-xl transition-colors flex-shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14, className: "text-white" })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const api = window.electronAPI;
function App() {
  const [store, setStore] = reactExports.useState(null);
  const [view, setView] = reactExports.useState("home");
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const [chatPreFill, setChatPreFill] = reactExports.useState("");
  const [scanResults, setScanResults] = reactExports.useState(null);
  const [heuristicAlerts, setHeuristicAlerts] = reactExports.useState([]);
  const [liveAutoBlocks, setLiveAutoBlocks] = reactExports.useState([]);
  const [pendingActionCount, setPendingActionCount] = reactExports.useState(0);
  const [breakMode, setBreakMode] = reactExports.useState(null);
  const [alwaysOn, setAlwaysOn] = reactExports.useState(false);
  const [platform, setPlatform] = reactExports.useState("windows");
  const { colors, theme, toggle: toggleTheme } = useTheme();
  const handleNavigate = reactExports.useCallback((v) => {
    setView(v);
  }, []);
  reactExports.useCallback((results) => {
    setScanResults(results);
    setView("focus-scan-results");
    api.getStore().then(setStore);
  }, []);
  const handleOnboardingComplete = reactExports.useCallback(() => {
    api.setStore({ onboardingComplete: true }).then(setStore);
  }, []);
  const refreshStore = reactExports.useCallback(() => {
    api.getStore().then(setStore);
  }, []);
  reactExports.useEffect(() => {
    api.getStore().then((s) => {
      setStore(s);
      if (s.breakMode && Date.now() < s.breakMode.endsAt) {
        setBreakMode(s.breakMode);
      }
    });
  }, []);
  reactExports.useEffect(() => {
    api.getAlwaysOn().then((r) => setAlwaysOn(r.enabled)).catch(() => {
    });
  }, []);
  reactExports.useEffect(() => {
    api.getPlatform().then(setPlatform).catch(() => {
    });
  }, []);
  const toggleAlwaysOn = reactExports.useCallback(async () => {
    const next = !alwaysOn;
    setAlwaysOn(next);
    try {
      await api.setAlwaysOn(next);
    } catch {
      setAlwaysOn(!next);
    }
  }, [alwaysOn]);
  reactExports.useEffect(() => {
    const offStart = api.onBreakStarted((evt) => setBreakMode(evt));
    const offEnd = api.onBreakEnded(() => {
      setBreakMode(null);
      api.getStore().then(setStore);
    });
    return () => {
      offStart();
      offEnd();
    };
  }, []);
  reactExports.useEffect(() => {
    api.onHeuristicAlert((alerts) => setHeuristicAlerts(alerts));
  }, []);
  reactExports.useEffect(() => {
    const offGuard = api.onGuardAlert(() => {
    });
    const offBlock = api.onInferenceAutoBlocked((evt) => {
      setLiveAutoBlocks((prev) => [{ ...evt, ts: Date.now() }, ...prev].slice(0, 20));
    });
    return () => {
      offGuard();
      offBlock();
    };
  }, []);
  reactExports.useEffect(() => {
    api.onOverlayOpenChat?.((msg) => {
      setChatPreFill(msg);
      setChatOpen(true);
    });
    api.onOverlayNavigate?.((view2) => handleNavigate(view2));
    const off = api.onNavigate?.((view2) => handleNavigate(view2));
    return () => {
      off?.();
    };
  }, [handleNavigate]);
  reactExports.useEffect(() => {
    const loadPending = () => {
      api.getInferences("pending").then((rows) => {
        setPendingActionCount(rows.length);
      }).catch(() => {
      });
    };
    loadPending();
    const off = api.onInferenceSuggest(() => loadPending());
    return off;
  }, []);
  if (!store) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-screen w-screen bg-navy-850", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-navy-400 text-sm", children: "Loading Attentify…" })
    ] }) });
  }
  if (!store.onboardingComplete) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Onboarding, { onComplete: handleOnboardingComplete });
  }
  const activeSession = store.sessions.find((s) => s.active);
  const activeAlerts = heuristicAlerts.filter((a) => !a.dismissed);
  const activeAlertCount = activeAlerts.length;
  activeAlerts[activeAlerts.length - 1] ?? null;
  const renderView = () => {
    switch (view) {
      case "home":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { variant: "full", onRefresh: refreshStore, initialMessage: chatPreFill }, "home-chat");
      case "timesheets":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Timesheets, { onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      case "logic":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Logic, {});
      case "focus-shield":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Overview, { store, onRefresh: refreshStore, onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      case "deep-clean":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DeepClean, { store, onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      case "insights":
      case "analytics":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, { onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      case "deep-focus":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DeepFocusMode, { store, onRefresh: refreshStore });
      case "schedule-manager":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleManager, { store, onRefresh: refreshStore });
      case "algo-track":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AlgoTrack, { store, onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      case "patterns":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Patterns, { heuristicAlerts, onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      case "actions":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Actions, { onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        }, liveAutoBlocks });
      case "settings":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsView, { store, onRefresh: refreshStore, onNavigate: handleNavigate });
      case "focus-scan-results":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FocusScanResults, { results: scanResults, store, onNavigate: handleNavigate, onRefresh: refreshStore, onChatWith: (msg) => {
          setChatPreFill(msg);
          setChatOpen(true);
        } });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { variant: "full", onRefresh: refreshStore, initialMessage: chatPreFill }, "home-chat");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-screen w-full overflow-hidden", style: { background: colors.rootBg, transition: "background 0.2s ease" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "titlebar-drag flex items-center justify-between px-4 flex-shrink-0",
        style: {
          height: 32,
          background: colors.panelBg,
          borderBottom: `1px solid ${colors.border}`,
          transition: "background 0.2s ease"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            platform === "mac" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "titlebar-nodrag flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => api.closeWindow(),
                    className: "w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition-all",
                    title: "Close"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => api.minimizeWindow(),
                    className: "w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-90 transition-all",
                    title: "Minimize"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => api.maximizeWindow(),
                    className: "w-3 h-3 rounded-full bg-[#28c840] hover:brightness-90 transition-all",
                    title: "Zoom"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-3", style: { background: "rgba(99,102,241,0.15)" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => void toggleAlwaysOn(),
                className: "titlebar-nodrag flex items-center gap-1.5 rounded-full transition-all",
                title: alwaysOn ? "Always-On is enabled: protection keeps running in the background (and at login) even when this window is closed. Click to turn off." : "Turn on Always-On: protection stays active at all times like an antivirus, even when the app is closed, and starts automatically at login.",
                style: {
                  padding: "2px 8px",
                  border: `1px solid ${alwaysOn ? "rgba(52,211,153,0.45)" : "rgba(99,102,241,0.15)"}`,
                  background: alwaysOn ? "rgba(52,211,153,0.10)" : "transparent"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "rounded-full",
                      style: {
                        width: 6,
                        height: 6,
                        background: alwaysOn ? "#34d399" : "rgba(99,102,241,0.3)",
                        boxShadow: alwaysOn ? "0 0 6px #34d399" : "none"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: '"Share Tech Mono", monospace', fontSize: 9, letterSpacing: "0.15em", color: alwaysOn ? "#34d399" : "rgba(99,102,241,0.4)" }, children: "ALWAYS ON" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { size: 18, style: { opacity: 0.9 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: toggleTheme,
                className: "titlebar-nodrag flex items-center justify-center rounded transition-colors hover:bg-white/5",
                style: { width: 22, height: 22, color: colors.textMuted },
                title: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
                children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { size: 12 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { size: 12 })
              }
            )
          ] }),
          platform !== "mac" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "titlebar-nodrag flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => api.minimizeWindow(),
                className: "flex items-center justify-center transition-colors hover:bg-white/5",
                style: { width: 32, height: 32, color: "rgba(99,102,241,0.5)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => api.maximizeWindow(),
                className: "flex items-center justify-center transition-colors hover:bg-white/5",
                style: { width: 32, height: 32, color: "rgba(99,102,241,0.5)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 10 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => api.closeWindow(),
                className: "flex items-center justify-center transition-colors hover:bg-[#e81123]",
                style: { width: 32, height: 32, color: "rgba(99,102,241,0.5)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 60 } })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Sidebar,
        {
          currentView: view,
          onNavigate: handleNavigate,
          onChatOpen: () => setChatOpen(true),
          activeSession,
          elevation: store.elevation,
          alertCount: activeAlertCount,
          pendingActionCount
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "main",
        {
          className: "flex-1 overflow-hidden relative flex flex-col",
          style: { background: colors.mainBg, transition: "background 0.2s ease" },
          children: [
            breakMode && Date.now() < breakMode.endsAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex-shrink-0 flex items-center justify-between px-5 py-1.5",
                style: { background: "rgba(251,191,36,0.05)", borderBottom: "1px solid rgba(251,191,36,0.18)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { size: 12, style: { color: "#fbbf24" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-[10px] font-bold uppercase tracking-widest",
                        style: { color: "#fbbf24", fontFamily: '"Share Tech Mono", monospace', letterSpacing: "0.2em" },
                        children: "Break Mode Active"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: [
                      "· resumes ",
                      new Date(breakMode.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "text-[10px] uppercase tracking-widest transition-colors hover:text-white",
                      style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' },
                      onClick: async () => {
                        await api.endBreak();
                        setBreakMode(null);
                      },
                      children: "End Break"
                    }
                  )
                ]
              }
            ),
            activeSession && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex-shrink-0 flex items-center justify-between px-5 py-1.5",
                style: {
                  background: "rgba(52,211,153,0.04)",
                  borderBottom: "1px solid rgba(52,211,153,0.15)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-1.5 h-1.5 rounded-full animate-pulse",
                        style: { background: "#34d399", boxShadow: "0 0 6px #34d399" }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-[10px] font-bold uppercase tracking-widest",
                        style: { color: "#34d399", fontFamily: '"Share Tech Mono", monospace', letterSpacing: "0.2em" },
                        children: "Focus Session Active"
                      }
                    ),
                    activeSession.endsAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' }, children: [
                      "· ends ",
                      new Date(activeSession.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    ] })
                  ] }),
                  activeSession.mode === "deep" && activeSession.endsAt && Date.now() < activeSession.endsAt ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[10px] uppercase tracking-widest",
                      style: { color: "#fbbf24", fontFamily: '"Share Tech Mono", monospace' },
                      title: "Deep Focus is locked until its timer ends.",
                      children: "Locked"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "text-[10px] uppercase tracking-widest transition-colors hover:text-white",
                      style: { color: colors.textMuted, fontFamily: '"Share Tech Mono", monospace' },
                      onClick: async () => {
                        await api.stopSession(activeSession.id);
                        refreshStore();
                      },
                      children: "End"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 min-h-0 animate-fade-in ${view === "home" || view === "logic" ? "overflow-hidden" : "overflow-y-auto"}`, children: renderView() }, view)
          ]
        }
      ),
      chatOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { onClose: () => {
        setChatOpen(false);
        setChatPreFill("");
      }, onRefresh: refreshStore, initialMessage: chatPreFill })
    ] })
  ] });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) })
);
