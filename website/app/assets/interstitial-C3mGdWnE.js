import { a as createLucideIcon, r as reactExports, j as jsxRuntimeExports, c as client, R as React } from "./globals-Bcwv0s08.js";
import { a as Coffee, C as Clock } from "./coffee-BtKI5A9m.js";
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
        background: "linear-gradient(160deg, #0d1e35 0%, #080f1e 100%)",
        border: "1px solid rgba(255,107,53,0.25)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "titlebar-drag flex items-center justify-end h-7 px-3 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleGoBack,
            className: "text-navy-600 hover:text-navy-400 transition-colors text-xs leading-none",
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
                  background: "rgba(255,107,53,0.12)",
                  border: "1.5px solid rgba(255,107,53,0.35)",
                  boxShadow: "0 0 24px rgba(255,107,53,0.18)"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 26, className: "text-accent-orange" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-extrabold text-white leading-tight", style: { letterSpacing: "-0.01em" }, children: "Attention hazard" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-navy-400 text-sm mt-1 leading-snug", children: [
                "Blocked",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent-orange font-semibold", children: data?.blocked ?? "…" }),
                " ",
                "— you asked it to."
              ] }),
              sessionEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-navy-600 text-xs mt-1", children: [
                "Focus session ends at ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-navy-400", children: sessionEnd })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleGoBack,
                className: "flex items-center gap-2 bg-accent-blue hover:bg-accent-blue-light text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all w-full max-w-[220px] justify-center",
                style: { boxShadow: "0 0 20px rgba(33,150,243,0.25)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
                  "Go back"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { size: 10, className: "text-navy-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-navy-700 text-[10px]", children: "Take a break:" }),
              BREAK_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => void handleBreak(opt.ms),
                  className: "text-navy-600 hover:text-navy-300 text-[10px] transition-colors px-1.5 py-0.5 rounded",
                  style: { border: "1px solid rgba(255,255,255,0.06)" },
                  children: opt.label
                },
                opt.ms
              ))
            ] }),
            countdown !== null && !proceedReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-navy-600 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Proceeding in ",
                countdown,
                "s…"
              ] })
            ] }) : proceedReady ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleProceed, className: "text-navy-500 hover:text-navy-300 text-xs transition-colors", children: [
              "Proceed to ",
              data?.blocked ?? "site"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleProceedRequest, className: "text-navy-700 hover:text-navy-500 text-xs transition-colors", children: "Proceed anyway (30s delay)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-navy-700 text-[10px]", children: "The good algorithm is protecting you." })
          ] })
        ] })
      ]
    }
  );
}
client.createRoot(document.getElementById("interstitial-root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InterstitialWarning, {}) })
);
