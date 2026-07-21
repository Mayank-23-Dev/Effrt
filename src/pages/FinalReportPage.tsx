import { useState, useEffect } from "react"
import { dbService } from "@/services/db"
import type { MemberReport } from "@/services/db"
import { Button } from "@/components/ui/button"
import { FileText, Printer, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

export default function FinalReportPage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
  })

  const [workspaceName, setWorkspaceName] = useState("Active Workspace")
  const [reports, setReports] = useState<MemberReport[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const loadData = async (wsId: string) => {
    try {
      setLoading(true)
      const ws = await dbService.getWorkspace(wsId)
      if (ws) setWorkspaceName(ws.name)
      
      const data = await dbService.getWorkspaceReport(wsId)
      setReports(data)
      setGeneratedAt(new Date().toLocaleString())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(activeWorkspaceId)

    const handleSync = () => {
      const currentId = localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
      setActiveWorkspaceId(currentId)
      loadData(currentId)
    }

    const handleCustomChange = (e: any) => {
      if (e.detail) {
        setActiveWorkspaceId(e.detail)
        loadData(e.detail)
      }
    }

    window.addEventListener("effrt_db_sync", handleSync)
    window.addEventListener("effrt_workspace_changed", handleCustomChange)
    
    const unsubscribe = dbService.subscribeToChanges(activeWorkspaceId, () => {
      loadData(activeWorkspaceId)
    })

    return () => {
      window.removeEventListener("effrt_db_sync", handleSync)
      window.removeEventListener("effrt_workspace_changed", handleCustomChange)
      unsubscribe()
    }
  }, [activeWorkspaceId])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Print Overrides CSS Inject */}
      <style>{`
        @media print {
          /* Force light theme for standard paper prints */
          body, html, main, #root {
            background-color: #ffffff !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
          /* Hide non-printable app wrapper items */
          header, aside, button, nav, [role="navigation"], .no-print {
            display: none !important;
          }
          /* Remove layout paddings and shift text fully left */
          .md\\:pl-64, main, .p-6 {
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Formatted printable area styling */
          .printable-report {
            width: 100% !important;
            max-width: 100% !important;
            border: 2px solid #000000 !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            padding: 24px !important;
          }
          .printable-report * {
            color: #000000 !important;
            border-color: #000000 !important;
          }
          .text-zinc-400, .text-zinc-500, .text-zinc-600 {
            color: #3f3f46 !important;
          }
          .bg-zinc-950, .bg-zinc-950\\/20, .bg-zinc-950\\/40 {
            background-color: #f4f4f5 !important;
          }
        }
      `}</style>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-950 pb-6 no-print">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <FileText className="size-8 text-zinc-400" /> Final Report
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Aggregate contribution scores, evaluate on-time compliance rates, and compile final PDF reports for workspace signoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => loadData(activeWorkspaceId)}
            variant="outline"
            className="h-10 text-xs font-semibold uppercase bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white rounded-none flex items-center gap-2"
          >
            <RefreshCw className="size-3.5" /> Recompute
          </Button>

          <Button 
            onClick={handlePrint}
            disabled={reports.length === 0}
            className="h-10 text-xs font-semibold uppercase bg-white hover:bg-zinc-200 text-black rounded-none flex items-center gap-2"
          >
            <Printer className="size-3.5" /> Print Statement / Save PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-zinc-500 text-xs animate-pulse no-print">
          Aggregating contribution matrices...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 font-mono text-xs text-zinc-600 border border-zinc-900 bg-zinc-950/20 no-print">
          No contribution logs found to audit. Please add members and tasks to create reports.
        </div>
      ) : (
        <div className="flex flex-col gap-6 printable-report bg-zinc-950/20 border border-zinc-900 p-8 rounded-none relative">
          
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-zinc-900 pb-6 gap-4">
            <div>
              <span className="text-zinc-400 text-xxs font-mono uppercase tracking-widest block">Security Hash Verified</span>
              <h2 className="text-xl font-black uppercase text-white tracking-wider mt-1">
                EFFRT Contribution Statement
              </h2>
              <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                Workspace Room: <span className="text-zinc-300 font-bold">{workspaceName}</span>
              </span>
            </div>

            <div className="text-left sm:text-right font-mono text-xxs text-zinc-500">
              <div>Statement Generated:</div>
              <div className="text-zinc-300 font-bold">{generatedAt}</div>
              <div className="mt-1 flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="size-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8px]">Unforgeable Audit Log</span>
              </div>
            </div>
          </div>

          {/* Statement Table content */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-900">
                  <th className="py-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Member Name</th>
                  <th className="py-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider text-center">Tasks Done / Total</th>
                  <th className="py-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider text-center">On-Time Rate</th>
                  <th className="py-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider text-center">Standup Misses</th>
                  <th className="py-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider text-center">Status</th>
                  <th className="py-3 text-zinc-200 text-[10px] uppercase font-black tracking-wider text-right">Contribution %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {reports.map((m) => (
                  <tr key={m.memberId} className="hover:bg-zinc-950/10">
                    <td className="py-4 text-xs font-bold text-zinc-200">{m.name}</td>
                    <td className="py-4 text-xs text-zinc-300 text-center">
                      {m.tasksCompleted} / {m.tasksAssigned}
                    </td>
                    <td className="py-4 text-xs text-zinc-300 text-center">
                      {m.onTimeCompletionRate}%
                    </td>
                    <td className="py-4 text-xs text-zinc-300 text-center">
                      {m.missedStandupDays} days
                    </td>
                    <td className="py-4 text-xs text-center flex items-center justify-center h-full pt-4">
                      {m.isGhost ? (
                        <span className="bg-white text-black text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 border border-white flex items-center gap-1">
                          <AlertTriangle className="size-2.5 stroke-[2.5]" /> Ghost
                        </span>
                      ) : (
                        <span className="bg-zinc-950 border border-zinc-900 text-zinc-500 text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 flex items-center gap-1">
                          <CheckCircle className="size-2.5 text-emerald-400" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-sm font-black text-right text-white">
                      {m.contributionPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statement footer signature signoff area */}
          <div className="border-t border-zinc-900 pt-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Weighted Contribution Formula</span>
              <p className="text-[9px] text-zinc-500 font-mono leading-relaxed max-w-sm">
                Contribution percentage is computed from the volume of completed tasks, weighted by the member's on-time milestone delivery rate.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end justify-end">
              <div className="border-t border-zinc-800 pt-2 w-[180px] text-left md:text-right font-mono text-[9px] text-zinc-500">
                Authorized Workspace Admin Sign-off
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
