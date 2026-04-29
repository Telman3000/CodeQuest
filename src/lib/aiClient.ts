import type { Mission } from "../types";
import { generateMissions } from "./mockPlan";

function stripAiBase(): string {
  const raw = (import.meta.env.VITE_AI_API_BASE as string | undefined)?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

/** Public URL of your deployed `server/` (e.g. https://codequest-api.up.railway.app). No trailing slash. */
export function getAiApiBase(): string {
  return stripAiBase();
}

export function aiConfigured(): boolean {
  return Boolean(stripAiBase());
}

function isDifficulty(x: unknown): x is Mission["difficulty"] {
  return x === "easy" || x === "medium" || x === "hard";
}

function normalizeMission(x: unknown, i: number): Mission | null {
  if (!x || typeof x !== "object") return null;
  const m = x as Record<string, unknown>;
  const title = typeof m.title === "string" ? m.title.trim() : "";
  const rationale = typeof m.rationale === "string" ? m.rationale.trim() : "";
  const id =
    typeof m.id === "string" && m.id.trim()
      ? m.id.trim()
      : `m_remote_${i}_${Math.random().toString(36).slice(2, 9)}`;
  const difficulty = isDifficulty(m.difficulty) ? m.difficulty : "medium";
  const eta =
    typeof m.etaMinutes === "number" && Number.isFinite(m.etaMinutes)
      ? Math.max(5, Math.round(m.etaMinutes))
      : 45;
  if (!title) return null;
  return {
    id,
    title,
    rationale: rationale || "Derived from AI plan.",
    difficulty,
    etaMinutes: eta,
  };
}

export function parseMissionsPayload(data: unknown): Mission[] {
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  const rawList = root.missions;
  if (!Array.isArray(rawList)) return [];
  const out: Mission[] = [];
  rawList.forEach((item, i) => {
    const m = normalizeMission(item, i);
    if (m) out.push(m);
  });
  return out;
}

export async function fetchRemotePlan(
  goalText: string,
  clarifyAnswers: Record<string, string>
): Promise<Mission[]> {
  const base = stripAiBase();
  if (!base) throw new Error("VITE_AI_API_BASE is not set");
  const res = await fetch(`${base}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalText, clarifyAnswers }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `Plan API failed (${res.status})`);
  }
  const json: unknown = await res.json();
  const missions = parseMissionsPayload(json);
  if (!missions.length) {
    throw new Error("Plan API returned no missions");
  }
  return missions;
}

/** Remote plan when `VITE_AI_API_BASE` is set; otherwise local mock. On failure, falls back to mock and returns notice. */
export async function resolvePlanMissions(
  goalText: string,
  clarifyAnswers: Record<string, string>
): Promise<{ missions: Mission[]; notice: string | null }> {
  if (!stripAiBase()) {
    return { missions: generateMissions(goalText, clarifyAnswers), notice: null };
  }
  try {
    const missions = await fetchRemotePlan(goalText, clarifyAnswers);
    return { missions, notice: null };
  } catch (e) {
    return {
      missions: generateMissions(goalText, clarifyAnswers),
      notice: `AI planner unavailable (${(e as Error).message}). Using offline mock.`,
    };
  }
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatContextPayload = {
  goalTitle: string;
  goalBody: string;
  constraints: string;
  missions: { id: string; title: string; rationale: string; difficulty: string; etaMinutes: number }[];
};

export async function fetchRemoteChat(
  messages: ChatTurn[],
  context: ChatContextPayload
): Promise<string> {
  const base = stripAiBase();
  if (!base) throw new Error("AI API base URL is not set");
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `Chat API failed (${res.status})`);
  }
  const json: unknown = await res.json();
  if (json && typeof json === "object") {
    const r = (json as Record<string, unknown>).reply;
    if (typeof r === "string" && r.trim()) return r.trim();
  }
  throw new Error("Chat API returned empty reply");
}

export function mockChatReply(userText: string, ctx: ChatContextPayload): string {
  const q = userText.toLowerCase();
  const titles = ctx.missions.map((m, i) => `${i + 1}. ${m.title}`).join("\n");
  if (/\border\b|\bsequence\b|\bbefore\b|\bwhy\b/.test(q)) {
    return [
      "For ordering, prefer: reduce ambiguity → stable foundation → visible user value → integration risk → polish.",
      "If two tasks share one risky integration, do the integration spike earlier so later steps are predictable.",
      titles ? `\nCurrent list:\n${titles}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (/\btime\b|\bpomodoro\b|\bfocus\b/.test(q)) {
    return "Use short focus blocks on a single mission; avoid mid-block context switches. Mark done only when the outcome for that slice is real (even if small).";
  }
  if (ctx.missions.length === 0) {
    return "Set your goal and run clarification so I can tailor missions. Until then, try breaking work into: clarify → model → skeleton flow → checklist.";
  }
  return [
    "Here’s a concrete next step: pick one mission and define a checklist of 3–7 observable outcomes.",
    titles ? `\nYou can ask: “Why mission #2 before #3?” about:\n${titles}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
