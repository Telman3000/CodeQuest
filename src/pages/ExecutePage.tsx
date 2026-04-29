import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExecutePage() {
  const navigate = useNavigate();
  const {
    missions,
    focusMissionId,
    setFocusMission,
    pomodoroRemaining,
    pomodoroPaused,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    tickPomodoro,
    completeFocusedMission,
    completedMissionIds,
  } = useApp();

  const focused = missions.find((m) => m.id === focusMissionId) ?? missions[0] ?? null;
  const display = pomodoroRemaining ?? 25 * 60;

  useEffect(() => {
    if (!focusMissionId && missions[0]?.id) setFocusMission(missions[0].id);
  }, [focusMissionId, missions, setFocusMission]);

  useEffect(() => {
    if (pomodoroPaused || pomodoroRemaining === null || pomodoroRemaining <= 0) return;
    const id = window.setInterval(() => tickPomodoro(), 1000);
    return () => window.clearInterval(id);
  }, [pomodoroPaused, pomodoroRemaining, tickPomodoro]);

  useEffect(() => () => pausePomodoro(), [pausePomodoro]);

  const doneFocus = Boolean(
    focusMissionId && completedMissionIds.includes(focusMissionId)
  );

  return (
    <div className="card">
      <h2 className="page-title">Execution mode</h2>
      <p className="hint">
        Focus Pomodoro is tied to a chosen mission from plan review — same principle as described in HIAD prototypes.
      </p>

      <label htmlFor="mission">Focused mission</label>
      <select
        id="mission"
        value={focusMissionId ?? ""}
        onChange={(e) =>
          setFocusMission(e.target.value ? e.target.value : null)
        }
      >
        {missions.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </select>

      {focused && (
        <div style={{ marginTop: 14 }}>
          <div className="hint">Why this task:</div>
          <div className="rationale">{focused.rationale}</div>
        </div>
      )}

      <div style={{ marginTop: 16 }} className="timer" aria-live="polite">
        {fmt(display)}
      </div>
      <div className="hint" style={{ marginTop: 6 }}>
        Timer is {pomodoroPaused ? "paused" : "running"} · default 25:00 blocks
      </div>

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={startPomodoro}>
          Start / resume
        </button>
        <button type="button" className="btn" onClick={pausePomodoro}>Pause</button>
        <button type="button" className="btn" onClick={resetPomodoro}>Reset timer</button>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!focusMissionId || doneFocus}
          onClick={completeFocusedMission}
        >
          Mark mission done this cycle
        </button>

        <button type="button" className="btn" onClick={() => navigate("/plan")}>
          Back to plan
        </button>

        <button type="button" className="btn btn-primary" onClick={() => navigate("/progress")}>
          Dashboard
        </button>
      </div>

      {doneFocus && (
        <p className="hint" style={{ marginTop: 12 }}>
          This mission is already marked done for reporting.
        </p>
      )}
    </div>
  );
}
