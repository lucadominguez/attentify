import { b as reactExports, R as React, j as jsxRuntimeExports, c as client } from "./globals-Niz52e0z.js";
import { Z as Zap, E as Eye, B as Brain, A as AlertTriangle, S as Shield, X } from "./zap-By6eoHVO.js";
const api = window.electronAPI;
const DISMISS_AFTER = 12e3;
const TYPE_CONFIG = {
  "auto-block": { color: "#f87171", dimColor: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", icon: Shield, label: "BLOCKED" },
  "suggest": { color: "#fbbf24", dimColor: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.35)", icon: AlertTriangle, label: "FLAGGED" },
  "heuristic": { color: "#a78bfa", dimColor: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.35)", icon: Brain, label: "PATTERN" },
  "guard": { color: "#6366f1", dimColor: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.30)", icon: Eye, label: "GUARD" },
  "proactive": { color: "#34d399", dimColor: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.30)", icon: Zap, label: "DAEMON" }
};
const ACTION_STYLE = {
  block: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", color: "#f87171" },
  break: { bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)", color: "#fcd34d" },
  chat: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", color: "#6366f1" },
  "view-actions": { bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.18)", color: "rgba(99,102,241,0.7)" },
  dismiss: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.35)" }
};
function OverlayCard() {
  const [notif, setNotif] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState(1);
  const [acting, setActing] = reactExports.useState(false);
  const timerRef = reactExports.useRef(null);
  const startRef = reactExports.useRef(0);
  const dismiss = (id) => {
    if (timerRef.current) clearInterval(timerRef.current);
    api.overlayDismiss(id);
    setNotif(null);
    setProgress(1);
  };
  const handleAction = async (action) => {
    if (!notif || acting) return;
    setActing(true);
    if (timerRef.current) clearInterval(timerRef.current);
    switch (action.type) {
      case "block":
        if (action.domain) await api.addDomain(action.domain);
        break;
      case "break":
        await api.startBreak(action.durationMs ?? 3e5);
        break;
      case "chat":
        api.overlayAction(notif.id, action);
        break;
      case "view-actions":
        api.overlayAction(notif.id, action);
        break;
    }
    api.overlayDismiss(notif.id);
    setNotif(null);
    setProgress(1);
    setActing(false);
  };
  reactExports.useEffect(() => {
    const offShow = api.onOverlayShow((n) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setNotif(n);
      setProgress(1);
      setActing(false);
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current;
        const remaining = 1 - elapsed / DISMISS_AFTER;
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          api.overlayDismiss(n.id);
          setNotif(null);
          setProgress(1);
        } else {
          setProgress(remaining);
        }
      }, 80);
    });
    const offUpdate = api.onOverlayUpdate((update) => {
      setNotif((prev) => prev?.id === update.id ? { ...prev, aiMessage: update.aiMessage } : prev);
    });
    api.overlayReady?.();
    return () => {
      offShow();
      offUpdate();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  React.useLayoutEffect(() => {
    if (notif) api.overlayShown?.(notif.id);
  }, [notif]);
  if (!notif) return null;
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG["guard"];
  const Icon = cfg.icon;
  const displayMessage = notif.aiMessage ?? notif.rawMessage;
  const isLoading = !notif.aiMessage;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 0,
        pointerEvents: "none"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              width: 400,
              background: "rgba(4,10,20,0.97)",
              border: `1px solid ${cfg.border}`,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 40px ${cfg.dimColor}`,
              pointerEvents: "all",
              userSelect: "none",
              animation: "slideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 2, background: `linear-gradient(90deg, ${cfg.color}, transparent)` } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: cfg.dimColor,
                  border: `1px solid ${cfg.border}`,
                  flexShrink: 0
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 12, style: { color: cfg.color } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: cfg.color,
                  fontFamily: '"Share Tech Mono", monospace',
                  flex: 1
                }, children: [
                  cfg.label,
                  notif.domain && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "rgba(255,255,255,0.35)", marginLeft: 6 }, children: [
                    "· ",
                    notif.domain
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => dismiss(notif.id),
                    style: { background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.25)", display: "flex" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0 12px 10px", minHeight: 40 }, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 3, alignItems: "center", paddingTop: 4 }, children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                animation: `pulse 1s ${i * 0.2}s ease-in-out infinite`
              } }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
                fontSize: 12,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.82)",
                margin: 0,
                fontWeight: 400
              }, children: displayMessage }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, padding: "0 12px 10px", flexWrap: "wrap" }, children: notif.actions.map((action) => {
                const s = ACTION_STYLE[action.type] ?? ACTION_STYLE.dismiss;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => void handleAction(action),
                    disabled: acting,
                    style: {
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "5px 10px",
                      cursor: acting ? "default" : "pointer",
                      opacity: acting ? 0.5 : 1,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      color: s.color,
                      fontFamily: '"Share Tech Mono", monospace',
                      transition: "opacity 0.15s"
                    },
                    children: action.label
                  },
                  action.label
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 2, background: "rgba(255,255,255,0.06)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                height: "100%",
                width: `${progress * 100}%`,
                background: cfg.color,
                opacity: 0.5,
                transition: "width 0.08s linear"
              } }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px) translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; }
        }
      ` })
      ]
    }
  );
}
client.createRoot(document.getElementById("overlay-root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverlayCard, {}) })
);
