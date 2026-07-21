import { useState, useEffect } from "react"
import { dbService } from "@/services/db"
import type { Member, Standup } from "@/services/db"
import { aiService } from "@/services/ai"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarRange, Sparkles, AlertTriangle, Save, Loader2, RefreshCw } from "lucide-react"

export default function StandupPage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
  })

  const [workspaceName, setWorkspaceName] = useState("Active Workspace")
  const [members, setMembers] = useState<Member[]>([])
  const [standups, setStandups] = useState<Standup[]>([])
  
  // Local input values for standups indexed by member_id
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  
  // AI Digest states
  const [digest, setDigest] = useState<string | null>(null)
  const [generatingDigest, setGeneratingDigest] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async (wsId: string) => {
    try {
      setLoading(true)
      const ws = await dbService.getWorkspace(wsId)
      if (ws) setWorkspaceName(ws.name)
      
      const workspaceMembers = await dbService.getMembers(wsId)
      const workspaceStandups = await dbService.getStandups(wsId)
      
      setMembers(workspaceMembers)
      setStandups(workspaceStandups)

      // Initialize inputs with today's standup entries if any
      const todayStr = new Date().toISOString().split("T")[0]
      const values: Record<string, string> = {}
      workspaceMembers.forEach((m) => {
        const todaySu = workspaceStandups.find(s => s.member_id === m.id && s.date === todayStr)
        values[m.id] = todaySu ? todaySu.content : ""
      })
      setInputValues(values)
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

  const handleSaveStandup = async (memberId: string) => {
    const content = inputValues[memberId] || ""
    if (!content.trim()) return

    try {
      setSavingId(memberId)
      await dbService.submitStandup(activeWorkspaceId, memberId, content.trim())
      
      // Reload standups list
      const workspaceStandups = await dbService.getStandups(activeWorkspaceId)
      setStandups(workspaceStandups)
      
      window.dispatchEvent(new CustomEvent("effrt_db_sync"))
    } catch (e) {
      console.error("Failed to submit standup:", e)
    } finally {
      setSavingId(null)
    }
  }

  const handleInputChange = (memberId: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [memberId]: value
    }))
  }

  const handleGenerateDigest = async () => {
    const todayStr = new Date().toISOString().split("T")[0]
    
    // 1. Gather all of today's standups
    const todayStandups = members.map((m) => {
      const su = standups.find(s => s.member_id === m.id && s.date === todayStr)
      return {
        memberName: m.name,
        content: su ? su.content : ""
      }
    }).filter(s => s.content !== "")

    // 2. Identify missing members
    const missingMembers = members.filter((m) => {
      const hasSu = standups.some(s => s.member_id === m.id && s.date === todayStr)
      return !hasSu
    }).map(m => m.name)

    try {
      setGeneratingDigest(true)
      const summary = await aiService.generateStandupDigest(workspaceName, todayStandups, missingMembers)
      setDigest(summary)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingDigest(false)
    }
  }

  // Check if a member has no standup entry for 2+ consecutive days
  const isMissingConsecutiveStandups = (memberId: string) => {
    const memberStandups = standups.filter(s => s.member_id === memberId)
    const todayStr = new Date().toISOString().split("T")[0]
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const hasToday = memberStandups.some(s => s.date === todayStr)
    const hasYesterday = memberStandups.some(s => s.date === yesterdayStr)

    // No standup entry today and no standup entry yesterday -> 2 consecutive days missing
    return !hasToday && !hasYesterday
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <CalendarRange className="size-8 text-zinc-400" /> Standup Digest
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Input daily standup updates per member and generate automated project summaries leveraging AI synthesis.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-zinc-500 text-xs animate-pulse">
          Retrieving standup database logs...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Daily inputs form (Left/Center Column) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Today's Standup Entries
                </CardTitle>
                <button 
                  onClick={() => loadData(activeWorkspaceId)}
                  className="text-xxs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="size-3" /> Sync
                </button>
              </CardHeader>
              <CardContent className="p-0">
                {members.length === 0 ? (
                  <div className="p-8 text-center font-mono text-xs text-zinc-600">
                    No members in workspace. Go to the Workspace tab to join.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900/60">
                    {members.map((m) => {
                      const todayStr = new Date().toISOString().split("T")[0]
                      const hasSubmittedToday = standups.some(s => s.member_id === m.id && s.date === todayStr)
                      const isSlacking = isMissingConsecutiveStandups(m.id)

                      return (
                        <div key={m.id} className="p-4 flex flex-col gap-3 hover:bg-zinc-950/10 transition-all">
                          
                          {/* Member Title line */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="size-6 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[8px] text-zinc-300 rounded-full shrink-0">
                                {getInitials(m.name)}
                              </div>
                              <span className="text-xs font-semibold text-zinc-200 truncate">{m.name}</span>
                              {hasSubmittedToday ? (
                                <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-950 font-mono text-[8px] uppercase px-1.5 py-0.5 rounded">
                                  Submitted
                                </span>
                              ) : (
                                <span className="bg-zinc-900/60 text-zinc-500 border border-zinc-900 font-mono text-[8px] uppercase px-1.5 py-0.5 rounded">
                                  Awaiting
                                </span>
                              )}
                            </div>

                            {isSlacking && (
                              <span className="bg-white text-black font-mono text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 border border-white animate-pulse flex items-center gap-1 rounded-lg">
                                <AlertTriangle className="size-2.5 stroke-[2.5]" /> Ghost Alert
                              </span>
                            )}
                          </div>

                          {/* Input row */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="What I did today / blocker details..."
                              value={inputValues[m.id] || ""}
                              onChange={(e) => handleInputChange(m.id, e.target.value)}
                              className="bg-zinc-950 border-zinc-900 text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700 flex-1 rounded-lg"
                            />
                            <Button
                              onClick={() => handleSaveStandup(m.id)}
                              disabled={savingId === m.id || !(inputValues[m.id] || "").trim()}
                              size="sm"
                              className="h-9 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-lg shrink-0"
                            >
                              {savingId === m.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Save className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI digest area (Right Column) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md h-fit">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                  <Sparkles className="size-4 text-white" /> AI Executive summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-4">
                <p className="text-xxs text-zinc-500 leading-relaxed font-mono">
                  Leverage Groq Llama-3 compiler to synthesize daily standup entries into a unified manager digest.
                </p>

                <Button
                  onClick={handleGenerateDigest}
                  disabled={generatingDigest || members.length === 0}
                  className="w-full h-10 text-xs font-semibold uppercase bg-white hover:bg-zinc-200 text-black rounded-lg flex items-center justify-center gap-2"
                >
                  {generatingDigest ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Generating Digest...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" /> Generate AI Digest
                    </>
                  )}
                </Button>

                {digest && (
                  <div className="border border-zinc-800 bg-zinc-950/40 p-4 font-mono text-xxs leading-relaxed text-zinc-300 whitespace-pre-wrap rounded-lg shadow-inner">
                    {digest}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
