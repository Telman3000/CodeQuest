import { NavLink, Navigate, Outlet } from "react-router-dom";
import type { ReactElement } from "react";
import { AiDock } from "./components/AiDock";
import { CodeQuestLogo } from "./components/CodeQuestLogo";
import { useApp } from "./context/AppContext";
import type { SessionMode } from "./types";

const steps = [
  { path: "/auth", label: "Auth" },
  { path: "/goal", label: "Goal" },
  { path: "/clarify", label: "Clarify" },
  { path: "/plan", label: "Plan" },
  { path: "/execute", label: "Execute" },
  { path: "/progress", label: "Progress" },
  { path: "/complete", label: "Done" },
] as const;

function stepReachable(
  path: (typeof steps)[number]["path"],
  s: {
    sessionMode: SessionMode;
    goalTitle: string;
    goalBody: string;
    missionsLength: number;
  }
): boolean {
  const draftOk = Boolean(s.sessionMode && s.goalTitle.trim() && s.goalBody.trim());
  const planOk = draftOk && s.missionsLength > 0;
  switch (path) {
    case "/auth":
      return true;
    case "/goal":
      return Boolean(s.sessionMode);
    case "/clarify":
      return draftOk;
    case "/plan":
    case "/execute":
    case "/progress":
    case "/complete":
      return planOk;
    default:
      return false;
  }
}

export function Shell() {
  const { sessionMode, goalTitle, goalBody, missions, resetSession } = useApp();
  const navCtx = {
    sessionMode,
    goalTitle,
    goalBody,
    missionsLength: missions.length,
  };

  return (
    <div className="app-shell">
      <header className="app-brand">
        <div className="app-brand-block">
          <CodeQuestLogo size={42} className="app-logo" />
          <div>
            <h1>CodeQuest</h1>
            <div className="hint">Focus &amp; task structuring · HIAD flow</div>
          </div>
        </div>
        {sessionMode && (
          <button type="button" className="btn btn-ghost" onClick={resetSession}>
            Sign out
          </button>
        )}
      </header>

      <nav className="steps" aria-label="Flow">
        {steps.map((item) => {
          const reachable = stepReachable(item.path, navCtx);
          if (!reachable) {
            return (
              <span key={item.path} className="step disabled" title="Complete earlier steps first">
                {item.label}
              </span>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "step active" : "step")}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />

      <AiDock />
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactElement }) {
  const { sessionMode } = useApp();
  if (!sessionMode) return <Navigate to="/auth" replace />;
  return children;
}

export function RequireDraft({ children }: { children: ReactElement }) {
  const { goalTitle, goalBody } = useApp();
  if (!goalTitle.trim() || !goalBody.trim()) {
    return <Navigate to="/goal" replace />;
  }
  return children;
}

export function RequirePlan({ children }: { children: ReactElement }) {
  const { missions } = useApp();
  if (!missions.length) return <Navigate to="/clarify" replace />;
  return children;
}
