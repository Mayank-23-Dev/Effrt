import { useState, useEffect } from "react"
import { dbService } from "@/services/db"
import type { MemberEffort } from "@/services/db"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Gauge, AlertTriangle, CheckCircle, ShieldAlert as ShieldIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function EffortMeterPage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
  })

  const [efforts, setEfforts] = useState<MemberEffort[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = async (wsId: string) => {
    try {
      setLoading(true)
      const data = await dbService.getWorkspaceEffort(wsId)
      setEfforts(data)
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-900 p-2.5 font-mono text-xxs leading-relaxed rounded-lg">
          <p className="font-bold text-zinc-300 mb-1">{label}</p>
          {payload.map((item: any) => (
            <p key={item.name} style={{ color: item.fill }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate aggregates
  const totalAssigned = efforts.reduce((sum, e) => sum + e.tasksAssigned, 0)
  const totalCompleted = efforts.reduce((sum, e) => sum + e.tasksCompleted, 0)
  const avgOnTime = efforts.length > 0 ? Math.round(efforts.reduce((sum, e) => sum + e.onTimeCompletionRate, 0) / efforts.length) : 0
  const ghostCount = efforts.filter(e => e.isGhost).length

  let healthGrade = "D"
  if (avgOnTime >= 90) healthGrade = "A+"
  else if (avgOnTime >= 80) healthGrade = "A"
  else if (avgOnTime >= 70) healthGrade = "B"
  else if (avgOnTime >= 50) healthGrade = "C"

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <Gauge className="size-8 text-zinc-400" /> Effort Meter
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Analyze team action velocity, task completion success, and automatically flag inactive accounts with Ghost badges.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-zinc-500 text-xs animate-pulse">
          Computing contribution analytics...
        </div>
      ) : efforts.length === 0 ? (
        <div className="text-center py-20 font-mono text-xs text-zinc-600 border border-zinc-900 bg-card/40 rounded-xl shadow-md">
          No member data available to chart. Join a member to view metrics.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Workspace Health Grade & Audit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Health Score / Radial Gauge */}
            <Card className="bg-card/40 border-zinc-900 rounded-xl p-6 shadow-md flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Workspace Health</span>
                <span className="text-3xl font-black text-white font-mono mt-1">{avgOnTime}%</span>
                <span className="text-xxs text-zinc-400 font-mono mt-1">Average On-Time Rate</span>
              </div>
              <div className="relative size-16 flex items-center justify-center bg-zinc-900/60 rounded-full border border-zinc-800">
                <span className="text-xl font-black text-emerald-400 font-mono">{healthGrade}</span>
              </div>
            </Card>

            {/* Total Completion Velocity */}
            <Card className="bg-card/40 border-zinc-900 rounded-xl p-6 shadow-md flex flex-col justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Completion Velocity</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white font-mono">{totalCompleted}</span>
                  <span className="text-xxs text-zinc-500 font-mono">/ {totalAssigned} Tasks Done</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-white h-1.5 rounded-full" 
                    style={{ width: `${totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] uppercase tracking-widest font-bold text-zinc-500 font-mono mt-1">
                  <span>Progress</span>
                  <span>{totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0}%</span>
                </div>
              </div>
            </Card>

            {/* Member Risk Board */}
            <Card className="bg-card/40 border-zinc-900 rounded-xl p-6 shadow-md flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Inactivity Risk</span>
                <span className="text-2xl font-black text-white font-mono mt-1">{ghostCount} / {efforts.length}</span>
                <span className="text-xxs text-zinc-400 font-mono mt-1">Flagged Inactive Members</span>
              </div>
              <div className="flex items-center gap-1.5">
                {ghostCount > 0 ? (
                  <span className="bg-red-950/40 text-red-400 border border-red-950 font-mono text-[9px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg animate-pulse">
                    Risk Warning
                  </span>
                ) : (
                  <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-950 font-mono text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg">
                    Optimal
                  </span>
                )}
              </div>
            </Card>

          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Completed vs Assigned */}
            <Card className="bg-card/40 border-zinc-900 rounded-xl p-6 shadow-md">
              <CardHeader className="p-0 border-b border-zinc-900/60 pb-3 mb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Task Completion Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={efforts}
                    margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#71717a" 
                      tick={{ fill: "#71717a", fontSize: 9, fontFamily: "monospace" }} 
                    />
                    <YAxis 
                      stroke="#71717a" 
                      tick={{ fill: "#71717a", fontSize: 9, fontFamily: "monospace" }} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(24, 24, 27, 0.2)" }} />
                    <Legend 
                      wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingTop: 10 }}
                      iconSize={10}
                    />
                    <Bar name="Assigned Tasks" dataKey="tasksAssigned" fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
                    <Bar name="Completed Tasks" dataKey="tasksCompleted" fill="#ffffff" stroke="#ffffff" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2: On-Time completion rate */}
            <Card className="bg-card/40 border-zinc-900 rounded-xl p-6 shadow-md">
              <CardHeader className="p-0 border-b border-zinc-900/60 pb-3 mb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  On-Time Completion Rate (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={efforts}
                    margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#71717a" 
                      tick={{ fill: "#71717a", fontSize: 9, fontFamily: "monospace" }} 
                    />
                    <YAxis 
                      stroke="#71717a" 
                      tick={{ fill: "#71717a", fontSize: 9, fontFamily: "monospace" }} 
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(24, 24, 27, 0.2)" }} />
                    <Legend 
                      wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingTop: 10 }}
                      iconSize={10}
                    />
                    <Bar name="On-Time Rate %" dataKey="onTimeCompletionRate" fill="#a1a1aa" stroke="#a1a1aa" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>

          {/* Member Inactivity & Ghost Alert Status List */}
          <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md">
            <CardHeader className="border-b border-zinc-900/60 py-4 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                <ShieldIcon className="size-4 text-zinc-400" /> Active Member Inactivity Board
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-900/60">
                {efforts.map((m) => (
                  <div key={m.memberId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-zinc-950/10">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-200">{m.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xxs font-mono text-zinc-500">
                            Last Active: {m.daysSinceLastActivity !== null ? `${m.daysSinceLastActivity} days ago` : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {m.isGhost ? (
                        <span className="bg-white text-black font-mono text-[9px] uppercase tracking-widest font-extrabold px-3 py-1.5 border border-white animate-pulse flex items-center gap-1.5 rounded-lg">
                          <AlertTriangle className="size-3 stroke-[2.5]" /> Ghost Alert
                        </span>
                      ) : (
                        <span className="bg-zinc-950 border border-zinc-900 text-zinc-400 font-mono text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-lg">
                          <CheckCircle className="size-3 text-emerald-400" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  )
}
