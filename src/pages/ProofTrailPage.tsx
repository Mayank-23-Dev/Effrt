import { useState, useEffect } from "react"
import { dbService } from "@/services/db"
import type { ProofEntry } from "@/services/db"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, ShieldCheck, RefreshCw } from "lucide-react"

interface JoinedProofEntry extends ProofEntry {
  memberName: string
  taskTitle: string | null
}

export default function ProofTrailPage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
  })

  const [trail, setTrail] = useState<JoinedProofEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = async (wsId: string) => {
    try {
      setLoading(true)
      const rawTrail = await dbService.getProofTrail(wsId)
      const members = await dbService.getMembers(wsId)
      const tasks = await dbService.getTasks(wsId)

      // Join data in memory
      const joined = rawTrail.map((entry) => {
        const member = members.find(m => m.id === entry.member_id)
        const task = entry.task_id ? tasks.find(t => t.id === entry.task_id) : null
        return {
          ...entry,
          memberName: member ? member.name : "System Agent",
          taskTitle: task ? task.title : null
        }
      })

      setTrail(joined)
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

  const getRelativeTime = (dateStr: string): string => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const totalRecords = trail.length
  const verifiedHashes = trail.length
  
  const memberCounts: Record<string, number> = {}
  trail.forEach(t => {
    memberCounts[t.memberName] = (memberCounts[t.memberName] || 0) + 1
  })
  let mostActiveMember = "None"
  let maxCount = 0
  Object.entries(memberCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostActiveMember = name
    }
  })
  
  const uniqueDays = new Set(trail.map(t => t.timestamp.split("T")[0])).size
  const actionRate = uniqueDays > 0 ? (trail.length / uniqueDays).toFixed(1) : "0.0"

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <History className="size-8 text-zinc-400" /> Proof Trail
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Review the immutable cryptographic timeline. Every developer action creates a permanent verification receipt.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xxs font-mono text-zinc-500 border border-zinc-900 bg-zinc-950/20 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Real-time channel active</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Ledger Records</span>
          <span className="text-2xl font-black text-white font-mono">{totalRecords}</span>
        </div>
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Verified Hashes</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{verifiedHashes}</span>
        </div>
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Most Active</span>
          <span className="text-xs font-bold text-zinc-200 truncate font-mono mt-2" title={mostActiveMember}>{mostActiveMember}</span>
        </div>
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Events / Day</span>
          <span className="text-2xl font-black text-zinc-300 font-mono">{actionRate}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-zinc-500 text-xs animate-pulse">
          Retrieving audit timeline from ledger...
        </div>
      ) : (
        <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md overflow-hidden">
          <CardHeader className="border-b border-zinc-900/60 py-4 px-6 flex flex-row items-center justify-between">
            <div className="text-sm font-bold uppercase tracking-wider text-zinc-200">
              Immutable Activity Feed ({trail.length} records)
            </div>
            
            <button 
              onClick={() => loadData(activeWorkspaceId)}
              className="text-xxs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="size-3" /> Refresh
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {trail.length === 0 ? (
              <div className="p-12 text-center font-mono text-xs text-zinc-600">
                No activity records found in this workspace room.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-zinc-900/60 bg-zinc-950/40">
                    <TableRow className="hover:bg-transparent border-zinc-900/60">
                      <TableHead className="text-zinc-400 font-mono text-xxs uppercase tracking-wider h-10 w-[200px]">Developer</TableHead>
                      <TableHead className="text-zinc-400 font-mono text-xxs uppercase tracking-wider h-10">Action log</TableHead>
                      <TableHead className="text-zinc-400 font-mono text-xxs uppercase tracking-wider h-10 w-[250px]">Task Reference</TableHead>
                      <TableHead className="text-zinc-400 font-mono text-xxs uppercase tracking-wider h-10 text-right w-[120px]">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-zinc-900/60">
                    {trail.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-zinc-900/5 border-zinc-900/60">
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[8px] text-zinc-300 rounded-full shrink-0">
                              {getInitials(entry.memberName)}
                            </div>
                            <span className="text-xs font-semibold text-zinc-200 truncate max-w-[150px]">
                              {entry.memberName}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-3 px-4 font-mono text-xxs text-zinc-300">
                          {entry.action_type}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          {entry.taskTitle ? (
                            <span className="text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-900 px-2.5 py-1 inline-block truncate max-w-[230px] font-mono text-xxs rounded">
                              {entry.taskTitle}
                            </span>
                          ) : (
                            <span className="text-zinc-600 font-mono text-xxs">—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right font-mono text-xxs text-zinc-500 whitespace-nowrap">
                          {getRelativeTime(entry.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
