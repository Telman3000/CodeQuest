import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { aiConfigured } from "../lib/aiClient";
import { useAiAssistant } from "../context/AiAssistantContext";
import { useApp } from "../context/AppContext";
import { CodeQuestLogo } from "./CodeQuestLogo";

export function AiDock() {
  const { sessionMode } = useApp();
  const ai = useAiAssistant();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = ai.dockWidth;
      const side = ai.dockSide;
      const onMove = (ev: MouseEvent) => {
        const delta = side === "right" ? startX - ev.clientX : ev.clientX - startX;
        ai.setDockWidth(startW + delta);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [ai.dockWidth, ai.dockSide, ai.setDockWidth]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [ai.messages, ai.chatLoading]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || ai.chatLoading) return;
    setDraft("");
    await ai.sendChat(t);
  };

  if (!sessionMode) return null;

  if (ai.dockMode === "hidden") {
    return (
      <button
        type="button"
        className="ai-dock-fab"
        title="Open AI assistant"
        aria-label="Open AI assistant"
        onClick={() => ai.setDockMode("docked")}
        style={ai.dockSide === "right" ? { right: 16, left: "auto" } : { left: 16, right: "auto" }}
      >
        <CodeQuestLogo size={30} className="ai-dock-fab-logo" />
      </button>
    );
  }

  const docked = ai.dockMode === "docked";
  const full = ai.dockMode === "fullscreen";

  return (
    <aside
      className={
        full ? "ai-dock ai-dock-fullscreen" : `ai-dock ai-dock-${ai.dockSide}`
      }
      style={
        full
          ? undefined
          : {
              width: ai.dockWidth,
              [ai.dockSide]: 0,
            }
      }
      aria-label="AI chat"
    >
      {!full && (
        <button
          type="button"
          className={`ai-dock-resize ${ai.dockSide}`}
          aria-label="Resize panel"
          onMouseDown={onResizeStart}
        />
      )}
      <div className="ai-dock-inner">
        <header className="ai-dock-head">
          <div className="ai-dock-head-title">
            <CodeQuestLogo size={32} className="ai-dock-head-logo" />
            <div>
              <div className="ai-dock-title">AI chat</div>
              <div className="ai-dock-sub">
                {aiConfigured() ? "Cloud assistant" : "Offline coach (mock)"}
              </div>
            </div>
          </div>
          <div className="ai-dock-toolbar">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title="Move to other side"
              onClick={() => ai.toggleDockSide()}
            >
              ↔
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title={full ? "Exit full screen" : "Full screen"}
              onClick={() => ai.setDockMode(full ? "docked" : "fullscreen")}
            >
              {full ? "⤓" : "⤢"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title="Hide panel"
              onClick={() => ai.setDockMode("hidden")}
            >
              ✕
            </button>
          </div>
        </header>

        <div className="ai-dock-messages" ref={scrollRef}>
          {ai.messages.map((m) => (
            <div key={m.id} className={`ai-msg ai-msg-${m.role}`}>
              <div className="ai-msg-label">{m.role === "user" ? "You" : "Assistant"}</div>
              <div className="ai-msg-text">{m.text}</div>
            </div>
          ))}
          {ai.chatLoading && <div className="hint ai-msg-pending">Thinking…</div>}
        </div>

        {ai.chatError && <div className="error ai-dock-err">{ai.chatError}</div>}

        <form className="ai-dock-form" onSubmit={submit}>
          <label htmlFor="ai-chat-input" className="sr-only">
            Message to assistant
          </label>
          <textarea
            id="ai-chat-input"
            className="ai-dock-input"
            rows={docked ? 3 : 4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask AI for clarification…"
            disabled={ai.chatLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const t = draft.trim();
                if (!t || ai.chatLoading) return;
                setDraft("");
                void ai.sendChat(t);
              }
            }}
          />
          <button type="submit" className="btn btn-primary ai-dock-send" disabled={ai.chatLoading}>
            Send
          </button>
        </form>
      </div>
    </aside>
  );
}
