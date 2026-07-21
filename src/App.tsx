import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardShell } from "@/components/layout/DashboardShell"
import LandingPage from "@/pages/LandingPage"
import WorkspacePage from "@/pages/WorkspacePage"
import TaskLedgerPage from "@/pages/TaskLedgerPage"
import ProofTrailPage from "@/pages/ProofTrailPage"
import EffortMeterPage from "@/pages/EffortMeterPage"
import StandupPage from "@/pages/StandupPage"
import FinalReportPage from "@/pages/FinalReportPage"
import { AuthPage } from "@/components/auth"
import { Particles } from "@/components/background-particles"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground dark relative">
      {/* Global interactive background particles */}
      <Particles className="z-0" quantity={140} color="#ffffff" refresh />

      {/* Main app wrapper with positive z-index to overlay on top of background particles */}
      <div className="relative z-10 min-h-screen">
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Pages */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />

            {/* Dashboard Workspace Routes */}
            <Route element={<DashboardShell />}>
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/tasks" element={<TaskLedgerPage />} />
              <Route path="/proof" element={<ProofTrailPage />} />
              <Route path="/effort" element={<EffortMeterPage />} />
              <Route path="/standup" element={<StandupPage />} />
              <Route path="/report" element={<FinalReportPage />} />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
