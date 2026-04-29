import { Routes, Route, Navigate } from "react-router-dom";
import { Shell, RequireAuth, RequireDraft, RequirePlan } from "./Shell";
import { AuthPage } from "./pages/AuthPage";
import { GoalPage } from "./pages/GoalPage";
import { ClarifyPage } from "./pages/ClarifyPage";
import { PlanPage } from "./pages/PlanPage";
import { ExecutePage } from "./pages/ExecutePage";
import { ProgressPage } from "./pages/ProgressPage";
import { CompletePage } from "./pages/CompletePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<Navigate to="/auth" replace />} />

        <Route path="auth" element={<AuthPage />} />

        <Route
          path="goal"
          element={
            <RequireAuth>
              <GoalPage />
            </RequireAuth>
          }
        />

        <Route
          path="clarify"
          element={
            <RequireAuth>
              <RequireDraft>
                <ClarifyPage />
              </RequireDraft>
            </RequireAuth>
          }
        />

        <Route
          path="plan"
          element={
            <RequireAuth>
              <RequireDraft>
                <PlanPage />
              </RequireDraft>
            </RequireAuth>
          }
        />

        <Route
          path="execute"
          element={
            <RequireAuth>
              <RequireDraft>
                <RequirePlan>
                  <ExecutePage />
                </RequirePlan>
              </RequireDraft>
            </RequireAuth>
          }
        />

        <Route
          path="progress"
          element={
            <RequireAuth>
              <RequireDraft>
                <RequirePlan>
                  <ProgressPage />
                </RequirePlan>
              </RequireDraft>
            </RequireAuth>
          }
        />

        <Route
          path="complete"
          element={
            <RequireAuth>
              <RequireDraft>
                <RequirePlan>
                  <CompletePage />
                </RequirePlan>
              </RequireDraft>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Route>
    </Routes>
  );
}
