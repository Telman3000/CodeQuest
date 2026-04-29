import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PerformanceRadar } from "../components/PerformanceRadar";
import { useApp } from "../context/AppContext";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function ProgressPage() {
  const {
    missions,
    completedMissionIds,
    goalTitle,
    pomodoroFullRuns,
    pomodoroStarts,
  } = useApp();
  const navigate = useNavigate();

  const pending = missions.filter((m) => !completedMissionIds.includes(m.id));
  const done = missions.filter((m) => completedMissionIds.includes(m.id));

  const metrics = useMemo(() => {
    const total = missions.length || 1;
    const doneN = done.length;
    const pendN = pending.length;
    const taskCompletion = Math.round((doneN / total) * 100);

    const finishRate =
      pomodoroStarts > 0 ? pomodoroFullRuns / pomodoroStarts : 0;
    const focusQuality = Math.round(
      clamp(
        42 +
          taskCompletion * 0.38 +
          pomodoroFullRuns * 9 +
          finishRate * 28,
        18,
        96
      )
    );

    const balanceHint = pendN - doneN;
    const restBalance = Math.round(
      clamp(66 + balanceHint * -4 + finishRate * 22, 28, 94)
    );

    const consistency = Math.round(
      clamp(36 + doneN * 11 + pomodoroFullRuns * 8, 22, 97)
    );

    return [
      { label: "Task completion", value: taskCompletion },
      { label: "Focus quality", value: focusQuality },
      { label: "Rest balance", value: restBalance },
      { label: "Consistency", value: consistency },
    ];
  }, [
    missions.length,
    done.length,
    pending.length,
    pomodoroFullRuns,
    pomodoroStarts,
  ]);

  return (
    <div className="card">
      <h2 className="page-title">Progress dashboard</h2>
      <p className="lead">
        Snapshot after one or more work blocks for project: <strong>{goalTitle}</strong>
      </p>

      <p className="hint">
        Done: <strong>{done.length}</strong> / {missions.length} · Pending:{" "}
        <strong>{pending.length}</strong>
        {pomodoroStarts > 0 && (
          <>
            {" "}
            · Pomodoro runs finished: <strong>{pomodoroFullRuns}</strong> /{" "}
            <strong>{pomodoroStarts}</strong> started
          </>
        )}
      </p>

      <div className="progress-radar-row">
        <PerformanceRadar metrics={metrics} />
        <ul className="radar-legend" aria-label="Radar metrics">
          {metrics.map((m) => (
            <li key={m.label}>
              <span className="radar-legend-label">{m.label}</span>
              <span className="radar-legend-value">{m.value}%</span>
            </li>
          ))}
        </ul>
      </div>

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
