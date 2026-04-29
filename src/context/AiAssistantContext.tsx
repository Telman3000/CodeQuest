import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  aiConfigured,
  fetchRemoteChat,
  mockChatReply,
  type ChatContextPayload,
  type ChatTurn,
} from "../lib/aiClient";
import { useApp } from "./AppContext";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

const LS_W = "codequest-ai-dock-width";
const LS_SIDE = "codequest-ai-dock-side";

function loadWidth(): number {
  try {
    const n = Number(localStorage.getItem(LS_W));
    if (Number.isFinite(n) && n >= 280 && n <= 720) return n;
  } catch {
    /* ignore */
  }
  return 380;
}

function loadSide(): "left" | "right" {
  try {
    return localStorage.getItem(LS_SIDE) === "left" ? "left" : "right";
  } catch {
    return "right";
  }
}

const initialWelcome: ChatMsg = {
  id: "welcome",
  role: "assistant",
  text:
    "Ask things like: “Why mission #2 before #3?” — I’ll explain ordering and tradeoffs. Set VITE_AI_API_BASE to your deployed server URL for real model replies.",
};

export type AiDockMode = "docked" | "fullscreen" | "hidden";

type AiAssistantValue = {
  dockSide: "left" | "right";
  dockWidth: number;
  dockMode: AiDockMode;
  messages: ChatMsg[];
  chatLoading: boolean;
  chatError: string | null;
  setDockMode: (v: AiDockMode) => void;
  toggleDockSide: () => void;
  setDockWidth: (w: number) => void;
  sendChat: (text: string) => Promise<void>;
};

const AiCtx = createContext<AiAssistantValue | null>(null);

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const messagesRef = useRef<ChatMsg[]>([initialWelcome]);
  const [messages, setMessages] = useState<ChatMsg[]>([initialWelcome]);

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [dockSide, setDockSide] = useState<"left" | "right">(loadSide);
  const [dockWidth, setDockWidthState] = useState(loadWidth);
  const [dockMode, setDockMode] = useState<AiDockMode>("docked");

  useEffect(() => {
    if (!app.sessionMode) {
      messagesRef.current = [initialWelcome];
      setMessages([initialWelcome]);
      setDockMode("docked");
    }
  }, [app.sessionMode]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_W, String(dockWidth));
    } catch {
      /* ignore */
    }
  }, [dockWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SIDE, dockSide);
    } catch {
      /* ignore */
    }
  }, [dockSide]);

  const setDockWidth = useCallback((w: number) => {
    setDockWidthState(Math.min(720, Math.max(280, Math.round(w))));
  }, []);

  const toggleDockSide = useCallback(() => {
    setDockSide((s) => (s === "right" ? "left" : "right"));
  }, []);

  const buildContext = useCallback((): ChatContextPayload => {
    return {
      goalTitle: app.goalTitle,
      goalBody: app.goalBody,
      constraints: app.constraints,
      missions: app.missions.map((m) => ({
        id: m.id,
        title: m.title,
        rationale: m.rationale,
        difficulty: m.difficulty,
        etaMinutes: m.etaMinutes,
      })),
    };
  }, [app.goalTitle, app.goalBody, app.constraints, app.missions]);

  const sendChat = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || chatLoading) return;
      setChatError(null);
      setChatLoading(true);
      const userMsg: ChatMsg = { id: uid(), role: "user", text };
      const merged = [...messagesRef.current, userMsg];
      messagesRef.current = merged;
      setMessages(merged);
      const turns: ChatTurn[] = merged.map((m) => ({
        role: m.role,
        content: m.text,
      }));
      const ctx = buildContext();
      try {
        let reply: string;
        if (aiConfigured()) {
          try {
            reply = await fetchRemoteChat(turns, ctx);
          } catch {
            reply = mockChatReply(text, ctx);
          }
        } else {
          reply = mockChatReply(text, ctx);
        }
        const bot: ChatMsg = { id: uid(), role: "assistant", text: reply };
        const out = [...messagesRef.current, bot];
        messagesRef.current = out;
        setMessages(out);
      } catch (e) {
        setChatError(String((e as Error).message));
      } finally {
        setChatLoading(false);
      }
    },
    [buildContext, chatLoading]
  );

  const value = useMemo<AiAssistantValue>(
    () => ({
      dockSide,
      dockWidth,
      dockMode,
      messages,
      chatLoading,
      chatError,
      setDockMode,
      toggleDockSide,
      setDockWidth,
      sendChat,
    }),
    [
      dockSide,
      dockWidth,
      dockMode,
      messages,
      chatLoading,
      chatError,
      toggleDockSide,
      setDockWidth,
      sendChat,
    ]
  );

  return <AiCtx.Provider value={value}>{children}</AiCtx.Provider>;
}

export function useAiAssistant(): AiAssistantValue {
  const v = useContext(AiCtx);
  if (!v) throw new Error("useAiAssistant must be used within AiAssistantProvider");
  return v;
}
