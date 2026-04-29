import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function ProgressPage() {
  const { missions, completedMissionIds, goalTitle } = useApp();
  const navigate = useNavigate();

  const pending = missions.filter((m) => !completedMissionIds.includes(m.id));
  const done = missions.filter((m) => completedMissionIds.includes(m.id));

  return (
    <div className="card">
      <h2 className="page-title">Progress dashboard</h2>
      <p className="lead">
        Snapshot after one or more work blocks for project: <strong>{goalTitle}</strong>
      </p>

      <p className="hint">
        Done: <strong>{done.length}</strong> / {missions.length} · Pending:{" "}
        <strong>{pending.length}</strong>
      </p>

      {done.length > 0 && (
        <>
          <h3 style={{ marginTop: 16, marginBottom: 8, fontSize: "1rem" }}>Finished recently</h3>
          <ul style={{ paddingLeft: 18, marginTop: 0 }}>
            {done.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
        </>
      )}

      {pending.length > 0 && (
        <>
          <h3 style={{ marginTop: 16, marginBottom: 8, fontSize: "1rem" }}>Still open</h3>
          <ul style={{ paddingLeft: 18, marginTop: 0 }}>
            {pending.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
        </>
      )}

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => navigate("/complete")}>
          Completion step
        </button>
        <button type="button" className="btn" onClick={() => navigate("/execute")}>
          Back to timer
        </button>
      </div>
    </div>
  );
}
