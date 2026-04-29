import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Mission, SessionMode } from "../types";
import { generateMissions } from "../lib/mockPlan";

export type AppState = {
  sessionMode: SessionMode;
  sessionEmail: string;
  goalTitle: string;
  goalBody: string;
  constraints: string;
  clarifyAnswers: Record<string, string>;
  missions: Mission[];
  focusMissionId: string | null;
  pomodoroRemaining: number | null;
  pomodoroPaused: boolean;
  completedMissionIds: string[];
  /** Finished 25m runs (timer reached 0). */
  pomodoroFullRuns: number;
  /** Start / resume presses (engagement). */
  pomodoroStarts: number;
};

const POMO = 25 * 60;

const defaultState: AppState = {
  sessionMode: null,
  sessionEmail: "",
  goalTitle: "",
  goalBody: "",
  constraints: "",
  clarifyAnswers: {},
  missions: [],
  focusMissionId: null,
  pomodoroRemaining: null,
  pomodoroPaused: true,
  completedMissionIds: [],
  pomodoroFullRuns: 0,
  pomodoroStarts: 0,
};

export type AppContextValue = AppState & {
  signInGuest: () => void;
  signInDemo: (email: string) => void;
  resetSession: () => void;
  setGoal: (title: string, body: string, constraints: string) => void;
  setClarify: (key: string, value: string) => void;
  buildDraftPlan: () => void;
  regeneratePlan: () => void;
  deleteMission: (id: string) => void;
  updateMissionTitle: (id: string, title: string) => void;
  setFocusMission: (id: string | null) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  completeFocusedMission: () => void;
};

const AppCtx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<AppState>(defaultState);

  const signInGuest = useCallback(() => {
    setS((p) => ({ ...p, sessionMode: "guest", sessionEmail: "" }));
  }, []);

  const signInDemo = useCallback((email: string) => {
    setS((p) => ({
      ...p,
      sessionMode: "signed",
      sessionEmail: email,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setS(defaultState);
  }, []);

  const setGoal = useCallback(
    (goalTitle: string, goalBody: string, constraints: string) => {
      setS((p) => ({ ...p, goalTitle, goalBody, constraints }));
    },
    []
  );

  const setClarify = useCallback((key: string, value: string) => {
    setS((p) => ({
      ...p,
      clarifyAnswers: { ...p.clarifyAnswers, [key]: value },
    }));
  }, []);

  const buildDraftPlan = useCallback(() => {
    setS((p) => {
      const missions = generateMissions(
        `${p.goalTitle}\n${p.goalBody}`,
        p.clarifyAnswers
      );
      const first = missions[0]?.id ?? null;
      return { ...p, missions, focusMissionId: first };
    });
  }, []);

  const regeneratePlan = useCallback(() => {
    setS((p) => {
      const missions = generateMissions(`${p.goalTitle}\n${p.goalBody}`, {
        ...p.clarifyAnswers,
        _regen: String(Date.now()),
      });
      const first = missions[0]?.id ?? null;
      return {
        ...p,
        missions,
        focusMissionId: first,
        pomodoroRemaining: null,
        pomodoroPaused: true,
      };
    });
  }, []);

  const deleteMission = useCallback((id: string) => {
    setS((p) => {
      const missions = p.missions.filter((m) => m.id !== id);
      let focusMissionId = p.focusMissionId;
      if (focusMissionId === id) {
        focusMissionId = missions[0]?.id ?? null;
      }
      return {
        ...p,
        missions,
        focusMissionId,
        completedMissionIds: p.completedMissionIds.filter((x) => x !== id),
      };
    });
  }, []);

  const updateMissionTitle = useCallback((id: string, title: string) => {
    setS((p) => ({
      ...p,
      missions: p.missions.map((m) => (m.id === id ? { ...m, title } : m)),
    }));
  }, []);

  const setFocusMission = useCallback((id: string | null) => {
    setS((p) => ({
      ...p,
      focusMissionId: id,
      pomodoroRemaining: null,
      pomodoroPaused: true,
    }));
  }, []);

  const startPomodoro = useCallback(() => {
    setS((p) => {
      const wasPaused = p.pomodoroPaused;
      return {
        ...p,
        pomodoroRemaining: p.pomodoroRemaining ?? POMO,
        pomodoroPaused: false,
        pomodoroStarts: wasPaused ? p.pomodoroStarts + 1 : p.pomodoroStarts,
      };
    });
  }, []);

  const pausePomodoro = useCallback(() => {
    setS((p) => ({ ...p, pomodoroPaused: true }));
  }, []);

  const resetPomodoro = useCallback(() => {
    setS((p) => ({
      ...p,
      pomodoroRemaining: POMO,
      pomodoroPaused: true,
    }));
  }, []);

  const tickPomodoro = useCallback(() => {
    setS((p) => {
      if (p.pomodoroPaused || p.pomodoroRemaining === null) return p;
      const next = Math.max(0, p.pomodoroRemaining - 1);
      const finished = next === 0 && p.pomodoroRemaining > 0;
      return {
        ...p,
        pomodoroRemaining: next,
        pomodoroPaused: next === 0 ? true : p.pomodoroPaused,
        pomodoroFullRuns: finished ? p.pomodoroFullRuns + 1 : p.pomodoroFullRuns,
      };
    });
  }, []);

  const completeFocusedMission = useCallback(() => {
    setS((p) => {
      if (!p.focusMissionId) return p;
      if (p.completedMissionIds.includes(p.focusMissionId)) return p;
      return {
        ...p,
        completedMissionIds: [...p.completedMissionIds, p.focusMissionId],
        pomodoroRemaining: null,
        pomodoroPaused: true,
      };
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...s,
      signInGuest,
      signInDemo,
      resetSession,
      setGoal,
      setClarify,
      buildDraftPlan,
      regeneratePlan,
      deleteMission,
      updateMissionTitle,
      setFocusMission,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
      tickPomodoro,
      completeFocusedMission,
    }),
    [
      s,
      signInGuest,
      signInDemo,
      resetSession,
      setGoal,
      setClarify,
      buildDraftPlan,
      regeneratePlan,
      deleteMission,
      updateMissionTitle,
      setFocusMission,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
      tickPomodoro,
      completeFocusedMission,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
