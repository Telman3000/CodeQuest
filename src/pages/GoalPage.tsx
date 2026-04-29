import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function GoalPage() {
  const { goalTitle, goalBody, constraints, setGoal } = useApp();
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const title = String(fd.get("title") ?? "").trim();
    const body = String(fd.get("body") ?? "").trim();
    const cons = String(fd.get("constraints") ?? "").trim();
    setGoal(title, body, cons);
    navigate("/clarify");
  };

  return (
    <div className="card">
      <h2 className="page-title">Goal input</h2>
      <p className="lead">Describe what you want to ship. Optionally note constraints.</p>

      <form onSubmit={submit}>
        <label htmlFor="title">Project goal (short)</label>
        <input id="title" name="title" required defaultValue={goalTitle} placeholder="Example: Telegram bot for class reminders" />

        <label htmlFor="body" style={{ marginTop: 14 }}>Context &amp; details</label>
        <textarea id="body" name="body" required defaultValue={goalBody} placeholder="Tech stack expectations, MVP scope, deadline pressure, teammates, etc." />

        <label htmlFor="constraints" style={{ marginTop: 14 }}>Limits (optional)</label>
        <textarea id="constraints" name="constraints" defaultValue={constraints} placeholder="Time budget per week, must-have features, things you refuse to tackle now." />

        <div className="actions">
          <button type="submit" className="btn btn-primary">Continue to clarification</button>
        </div>
      </form>
    </div>
  );
}
