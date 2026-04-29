import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { aiConfigured } from "../lib/aiClient";

export function ClarifyPage() {
  const { clarifyAnswers, buildDraftPlan, planLoading, planError } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const clarifyPatch = {
      deadline: String(fd.get("deadline") ?? ""),
      scope: String(fd.get("scope") ?? ""),
      risk: String(fd.get("risk") ?? ""),
    };
    setBusy(true);
    const ok = await buildDraftPlan(clarifyPatch);
    setBusy(false);
    if (ok) navigate("/plan");
  };

  const loading = busy || planLoading;

  return (
    <div className="card">
      <h2 className="page-title">Clarification</h2>
      <p className="lead">Short prompts before drafting a mission plan.</p>

      <form onSubmit={submit}>
        <label htmlFor="deadline">Deadline / time budget</label>
        <input
          id="deadline"
          name="deadline"
          required
          defaultValue={clarifyAnswers.deadline}
          placeholder="e.g. submit in 2 weeks, ~10h/week"
        />

        <label htmlFor="scope" style={{ marginTop: 14 }}>Expected scope size</label>
        <input
          id="scope"
          name="scope"
          required
          defaultValue={clarifyAnswers.scope}
          placeholder="small MVP / medium / large exploratory"
        />

        <label htmlFor="risk" style={{ marginTop: 14 }}>Main blocker or fear</label>
        <textarea
          id="risk"
          name="risk"
          required
          defaultValue={clarifyAnswers.risk}
          placeholder="Procrastination traps, vague requirements, infra setup, etc."
        />

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Generating…" : "Generate draft plan"}
          </button>
          <button type="button" className="btn" disabled={loading} onClick={() => navigate("/goal")}>
            Back
          </button>
        </div>

        <p className="hint">
          {aiConfigured()
            ? "Planner calls your deployed AI API (see server/). Falls back to offline mock if the request fails."
            : "Offline mock in mockPlan.ts. Set VITE_AI_API_BASE for cloud planning + chat."}
        </p>
        {planError && <div className="error">{planError}</div>}
      </form>
    </div>
  );
}
