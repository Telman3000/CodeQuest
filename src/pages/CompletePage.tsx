import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function CompletePage() {
  const navigate = useNavigate();
  const { completedMissionIds, missions, resetSession } = useApp();

  return (
    <div className="card">
      <h2 className="page-title">Cycle complete</h2>
      <p className="lead">
        You tracked <strong>{completedMissionIds.length}</strong> mission completions across{" "}
        <strong>{missions.length}</strong> draft items in this sandbox session.
      </p>
      <p className="hint">
        Next step recommended in-report: regenerate only part of plan, revise clarifications,
        or adjust focus pacing when overruns repeat.
      </p>

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => navigate("/progress")}>
          Back to dashboard
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            resetSession();
            navigate("/auth");
          }}
        >
          New session
        </button>
      </div>
    </div>
  );
}
