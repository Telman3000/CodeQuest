import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function PlanPage() {
  const {
    missions,
    regeneratePlan,
    deleteMission,
    updateMissionTitle,
    setFocusMission,
    focusMissionId,
  } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!missions.length) navigate("/clarify", { replace: true });
  }, [missions.length, navigate]);

  return (
    <div className="card">
      <h2 className="page-title">Plan review</h2>
      <p className="lead">
        Draft missions with short rationale. Edit titles, delete noisy items, regenerate the whole draft, then move to focus mode.
      </p>

      {missions.map((m) => (
        <div key={m.id} className="mission">
          <input
            type="text"
            value={m.title}
            onChange={(e) => updateMissionTitle(m.id, e.target.value)}
          />
          <div className="mission-meta">
            {m.difficulty} · ~{m.etaMinutes} min
            {focusMissionId === m.id ? " · focus" : ""}
          </div>
          <div className="rationale">{m.rationale}</div>
          <div className="actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn" onClick={() => setFocusMission(m.id)}>
              Set focus mission
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => deleteMission(m.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="actions">
        <button type="button" className="btn" onClick={() => { regeneratePlan(); }}>
          Regenerate
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!focusMissionId}
          onClick={() => navigate("/execute")}
        >
          Continue to execution
        </button>
        <button type="button" className="btn" onClick={() => navigate("/clarify")}>
          Back to clarification
        </button>
      </div>
      {!focusMissionId && (
        <div className="error">Pick one mission as focus before execution.</div>
      )}
    </div>
  );
}
