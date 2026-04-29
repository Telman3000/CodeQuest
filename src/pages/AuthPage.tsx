import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function AuthPage() {
  const { sessionMode, signInGuest, signInDemo } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (sessionMode) navigate("/goal", { replace: true });
  }, [sessionMode, navigate]);

  const onDemo = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    signInDemo(trimmed.length ? trimmed : "student@innopolis.university");
    navigate("/goal");
  };

  return (
    <div className="card">
      <h2 className="page-title">Authentication</h2>
      <p className="lead">
        Sign in (demo local state), continue as guest, or use the HIAD prototype flow.
      </p>

      <div className="actions" style={{ marginTop: 0 }}>
        <button type="button" className="btn btn-primary" onClick={() => { signInGuest(); navigate("/goal"); }}>
          Continue as guest
        </button>
      </div>

      <form onSubmit={onDemo} style={{ marginTop: 20 }}>
        <label htmlFor="email">Email (demo)</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="t.nuruzov@innopolis.university"
        />

        <label htmlFor="pwd" style={{ marginTop: 14 }}>Password (not checked)</label>
        <input
          id="pwd"
          type="password"
          autoComplete="current-password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="••••••••"
        />

        <div className="actions">
          <button type="submit" className="btn btn-primary">Continue</button>
        </div>

        <p className="hint">No backend yet: credentials are ignored except email display.</p>
      </form>
    </div>
  );
}
