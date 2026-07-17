import { a as createLucideIcon, b as reactExports, j as jsxRuntimeExports, c as client, R as React } from "./globals-CPnurcRi.js";
import { a as Coffee, C as Clock } from "./coffee-BdKGZsry.js";
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ArrowLeft = createLucideIcon("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ShieldAlert = createLucideIcon("ShieldAlert", [
  ["path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10", key: "1irkt0" }],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
]);
const api = window.electronAPI;
const BREAK_OPTIONS = [
  { label: "5 min", ms: 5 * 60 * 1e3 },
  { label: "15 min", ms: 15 * 60 * 1e3 },
  { label: "30 min", ms: 30 * 60 * 1e3 }
];
function InterstitialWarning() {
  const [data, setData] = reactExports.useState(null);
  const [countdown, setCountdown] = reactExports.useState(null);
  const [proceedReady, setProceedReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    api.onInterstitialData((d) => setData(d));
  }, []);
  reactExports.useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setProceedReady(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1e3);
    return () => clearTimeout(t);
  }, [countdown]);
  const handleProceedRequest = () => {
    setCountdown(30);
    setProceedReady(false);
  };
  const handleProceed = () => {
    api.proceedAnyway();
    setData(null);
    setCountdown(null);
    setProceedReady(false);
  };
  const handleGoBack = () => {
    api.hideInterstitial();
    setData(null);
    setCountdown(null);
    setProceedReady(false);
  };
  const handleBreak = async (ms) => {
    await api.startBreak(ms, "interstitial");
    setData(null);
    setCountdown(null);
    setProceedReady(false);
  };
  const sessionEnd = data?.endsAt ? new Date(data.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col w-screen h-screen overflow-hidden select-none rounded-2xl",
      style: {
        background: "linear-gradient(160deg, rgba(13,30,53,0.66) 0%, rgba(8,15,30,0.76) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        boxShadow: [
          "0 28px 72px rgba(0,0,0,0.6)",
          "0 0 0 1px rgba(248,113,113,0.28)",
          "inset 0 1px 0 rgba(255,255,255,0.14)",
          "inset 0 0 80px rgba(248,113,113,0.07)"
        ].join(", ")
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "titlebar-drag flex items-center justify-end h-7 px-3 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleGoBack,
            className: "text-white/50 hover:text-white/75 transition-colors text-xs leading-none",
            style: { WebkitAppRegion: "no-drag" },
            children: "✕"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center px-8 pb-5 flex-1 min-h-0 justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0",
                style: {
                  background: "rgba(248,113,113,0.12)",
                  border: "1.5px solid rgba(248,113,113,0.35)",
                  boxShadow: "0 0 24px rgba(248,113,113,0.18)"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 26, style: { color: "#f87171" } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-extrabold text-white leading-tight", style: { letterSpacing: "-0.01em" }, children: "Attention hazard" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/75 text-sm mt-1 leading-snug", children: [
                "Blocked",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: { color: "#f87171" }, children: data?.blocked ?? "…" }),
                ". You asked it to."
              ] }),
              sessionEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/50 text-xs mt-1", children: [
                "Focus session ends at ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/75", children: sessionEnd })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleGoBack,
                className: "flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all w-full max-w-[220px] justify-center hover:brightness-110",
                style: { background: "#6366f1", boxShadow: "0 0 20px rgba(99,102,241,0.30)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
                  "Go back"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { size: 10, className: "text-white/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/40 text-[10px]", children: "Take a break:" }),
              BREAK_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => void handleBreak(opt.ms),
                  className: "text-white/50 hover:text-white/90 text-[10px] transition-colors px-1.5 py-0.5 rounded",
                  style: { border: "1px solid rgba(255,255,255,0.06)" },
                  children: opt.label
                },
                opt.ms
              ))
            ] }),
            countdown !== null && !proceedReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-white/50 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Proceeding in ",
                countdown,
                "s…"
              ] })
            ] }) : proceedReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleProceed, className: "text-white/60 hover:text-white/90 text-xs transition-colors", children: [
              "Proceed to ",
              data?.blocked ?? "site"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleProceedRequest, className: "text-white/40 hover:text-white/60 text-xs transition-colors", children: "Proceed anyway (30s delay)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40 text-[10px]", children: "The good algorithm is protecting you." })
          ] })
        ] })
      ]
    }
  );
}
client.createRoot(document.getElementById("interstitial-root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InterstitialWarning, {}) })
);
