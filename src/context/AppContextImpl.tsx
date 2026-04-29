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
import type { Mission, SessionMode } from "../types";
import { resolvePlanMissions } from "../lib/aiClient";

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
  planLoading: boolean;
  planError: string | null;
  planNotice: string | null;
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
  planLoading: false,
  planError: null,
  planNotice: null,
};

export type AppContextValue = AppState & {
  signInGuest: () => void;
  signInDemo: (email: string) => void;
  resetSession: () => void;
  setGoal: (title: string, body: string, constraints: string) => void;
  setClarify: (key: string, value: string) => void;
  buildDraftPlan: (clarifyPatch?: Record<string, string>) => Promise<boolean>;
  regeneratePlan: () => Promise<boolean>;
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
  const stateRef = useRef(s);
  useEffect(() => {
    stateRef.current = s;
  }, [s]);

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

  const buildDraftPlan = useCallback(async (clarifyPatch?: Record<string, string>): Promise<boolean> => {
    const p = stateRef.current;
    const mergedClarify = clarifyPatch ? { ...p.clarifyAnswers, ...clarifyPatch } : p.clarifyAnswers;
    stateRef.current = { ...p, clarifyAnswers: mergedClarify };
    setS((cur) => ({
      ...cur,
      clarifyAnswers: mergedClarify,
      planLoading: true,
      planError: null,
      planNotice: null,
    }));
    try {
      const goalText = `${stateRef.current.goalTitle}\n${stateRef.current.goalBody}`;
      const { missions, notice } = await resolvePlanMissions(goalText, mergedClarify);
      if (!missions.length) {
        setS((cur) => ({
          ...cur,
          planLoading: false,
          planError: "Planner returned an empty list.",
          planNotice: null,
        }));
        return false;
      }
      setS((cur) => ({
        ...cur,
        missions,
        focusMissionId: missions[0]?.id ?? null,
        planLoading: false,
        planError: null,
        planNotice: notice,
      }));
      return true;
    } catch (e) {
      setS((cur) => ({
        ...cur,
        planLoading: false,
        planError: String((e as Error).message),
        planNotice: null,
      }));
      return false;
    }
  }, []);

  const regeneratePlan = useCallback(async (): Promise<boolean> => {
    const p = stateRef.current;
    setS((cur) => ({ ...cur, planLoading: true, planError: null, planNotice: null }));
    try {
      const clarify = { ...p.clarifyAnswers, _regen: String(Date.now()) };
      const goalText = `${p.goalTitle}\n${p.goalBody}`;
      const { missions, notice } = await resolvePlanMissions(goalText, clarify);
      if (!missions.length) {
        setS((cur) => ({
          ...cur,
          planLoading: false,
          planError: "Planner returned an empty list.",
          planNotice: null,
        }));
        return false;
      }
      setS((cur) => ({
        ...cur,
        missions,
        focusMissionId: missions[0]?.id ?? null,
        pomodoroRemaining: null,
        pomodoroPaused: true,
        planLoading: false,
        planError: null,
        planNotice: notice,
      }));
      return true;
    } catch (e) {
      setS((cur) => ({
        ...cur,
        planLoading: false,
        planError: String((e as Error).message),
        planNotice: null,
      }));
      return false;
    }
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
