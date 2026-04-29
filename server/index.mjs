/**
 * Minimal CodeQuest AI proxy — deploy anywhere (Railway, Render, Fly, VPS).
 * Env: OPENAI_API_KEY (required), OPENAI_MODEL (default gpt-4o-mini), PORT, CORS_ORIGIN (*)
 *
 * Routes: POST /plan { goalText, clarifyAnswers }, POST /chat { messages, context } → { reply }
 */
import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT) || 8787;
const API_KEY = process.env.OPENAI_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ORIGIN = process.env.CORS_ORIGIN || "*";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

async function openaiChat(messages, temperature) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages, temperature }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("No message content");
  return content.trim();
}

function tryParseJsonObject(content) {
  let s = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(s);
  } catch {
    const i = s.indexOf("{");
    const j = s.lastIndexOf("}");
    if (i >= 0 && j > i) {
      return JSON.parse(s.slice(i, j + 1));
    }
    throw new Error("Model did not return JSON");
  }
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const u = new URL(req.url || "/", "http://localhost");
  const pathname = u.pathname || "/";
  if (
    req.method === "GET" &&
    (pathname === "/" || pathname === "/health")
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "codequest-ai" }));
    return;
  }
  if (req.method !== "POST" || !["/plan", "/chat"].includes(pathname)) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  if (!API_KEY) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "OPENAI_API_KEY not configured" }));
    return;
  }
  try {
    const body = await readJson(req);
    if (pathname === "/plan") {
      const goalText = String(body.goalText ?? "");
      const clarify =
        typeof body.clarifyAnswers === "object" && body.clarifyAnswers
          ? body.clarifyAnswers
          : {};
      const sys = `You are a project planning assistant. Return ONLY valid JSON with shape {"missions":[{"id":"string","title":"string","rationale":"string","difficulty":"easy"|"medium"|"hard","etaMinutes":number}, ...]} for 4-7 missions. difficulty must be lowercase. No markdown.`;
      const user = `Goal and notes:\n${goalText}\n\nClarifications JSON:\n${JSON.stringify(clarify)}`;
      const content = await openaiChat(
        [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        0.4
      );
      const json = tryParseJsonObject(content);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(json));
      return;
    }
    if (pathname === "/chat") {
      const messagesRaw = body.messages;
      const ctx = body.context ?? {};
      const messages = Array.isArray(messagesRaw) ? messagesRaw : [];
      const ctxStr = JSON.stringify(ctx);
      const sys = `You are a concise coach for CodeQuest (student focus & task structuring). Answer clearly in short paragraphs. App context:\n${ctxStr}`;
      const openaiMessages = [{ role: "system", content: sys }];
      for (const m of messages) {
        if (!m || typeof m !== "object") continue;
        const role = m.role === "assistant" ? "assistant" : "user";
        openaiMessages.push({ role, content: String(m.content ?? "") });
      }
      const reply = await openaiChat(openaiMessages, 0.55);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ reply }));
      return;
    }
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(e?.message || e) }));
  }
});

server.listen(PORT, () => {
  console.log(`CodeQuest AI server listening on http://localhost:${PORT}`);
});
