import type { Mission } from "../types";

function id(seed: string, i: number) {
  let h = 0;
  const s = seed + ":" + String(i);
  for (let j = 0; j < s.length; j++) h = Math.imul(31, h) + s.charCodeAt(j) | 0;
  return "m_" + Math.abs(h).toString(16);
}

/**
 * Offline mock "AI" planner: deterministic from goal + answers (+ optional regen key).
 */
export function generateMissions(goalText: string, answers: Record<string, string>): Mission[] {
  const g = (goalText + JSON.stringify(answers)).toLowerCase();
  const hasDb = /\b(database|postgres|sqlite|mongo)\b/.test(g);
  const hasUi = /\b(ui|interface|frontend|react)\b/.test(g);
  const scope = answers.scope ?? "";
  const deadline = (answers.deadline ?? "").trim();
  const risk = (answers.risk ?? "").trim();

  const base: Omit<Mission, "id">[] = [];

  base.push({
    title: `Clarify requirements for: ${truncate(goalText.split("\n")[0] || "your project", 48)}`,
    rationale:
      "This mission reduces ambiguity early so downstream tasks align with constraints you mentioned." +
      (deadline ? ` Time box from clarification: ${truncate(deadline, 80)}.` : "") +
      (risk ? ` Watch for: ${truncate(risk, 100)}` : ""),
    difficulty: "easy",
    etaMinutes: 40,
  });

  base.push({
    title: hasDb ? "Set up persistence + minimal schema" : "Define data model placeholders / mock layer",
    rationale:
      "A structured data story prevents rework when you connect UI flows to real persistence later.",
    difficulty: mediumFromScope(scope),
    etaMinutes: hasDb ? 120 : 60,
  });

  base.push({
    title: hasUi ? "Skeleton UI flows for the main scenario" : "Specify core interaction flow (UX sketch)",
    rationale:
      "Separates UX structure from polishing so iteration stays cheap while you validate the loop.",
    difficulty: "medium",
    etaMinutes: 90,
  });

  if (hasUi && hasDb) {
    base.push({
      title: "Wire CRUD/UI to persistence with graceful errors",
      rationale:
      "Keeps risky integration explicit and observable (aligned with clarification-driven planning).",
      difficulty: "hard",
      etaMinutes: 150,
    });
  }

  base.push({
    title: "Review checklist: scope, demo path, docs",
    rationale:
      "Explicit completion criteria reduce regeneration churn and stabilize trust in generated plans." +
      (scope ? ` Scope note: ${truncate(scope, 90)}.` : ""),
    difficulty: "easy",
    etaMinutes: 35,
  });

  const regenKey = answers["_regen"] ?? "";
  return base.map((m, i) => ({ ...m, id: id(g + ":" + regenKey, i) }));
}

function truncate(t: string, n: number) {
  const s = t.trim();
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

function mediumFromScope(scope: string): Mission["difficulty"] {
  if (/large|complex|heavy/i.test(scope)) return "hard";
  if (/medium|moderate/i.test(scope)) return "medium";
  return "medium";
}
