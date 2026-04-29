import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function ClarifyPage() {
  const { clarifyAnswers, setClarify, buildDraftPlan } = useApp();
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setClarify("deadline", String(fd.get("deadline") ?? ""));
    setClarify("scope", String(fd.get("scope") ?? ""));
    setClarify("risk", String(fd.get("risk") ?? ""));
    buildDraftPlan();
    navigate("/plan");
  };

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
          <button type="submit" className="btn btn-primary">
            Generate draft plan
          </button>
          <button type="button" className="btn" onClick={() => navigate("/goal")}>
            Back
          </button>
        </div>

        <p className="hint">Planner runs locally (`mockPlan.ts`): no servers, no keys.</p>
      </form>
    </div>
  );
}
