import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DashboardShell } from "@/components/layout/DashboardShell"
import WorkspacePage from "@/pages/WorkspacePage"
import TaskLedgerPage from "@/pages/TaskLedgerPage"
import ProofTrailPage from "@/pages/ProofTrailPage"
import EffortMeterPage from "@/pages/EffortMeterPage"
import StandupPage from "@/pages/StandupPage"
import FinalReportPage from "@/pages/FinalReportPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardShell />}>
          <Route path="/" element={<WorkspacePage />} />
          <Route path="/tasks" element={<TaskLedgerPage />} />
          <Route path="/proof" element={<ProofTrailPage />} />
          <Route path="/effort" element={<EffortMeterPage />} />
          <Route path="/standup" element={<StandupPage />} />
          <Route path="/report" element={<FinalReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
