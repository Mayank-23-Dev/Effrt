import { useState, useEffect } from "react"
import { dbService } from "@/services/db"
import type { Workspace, Member } from "@/services/db"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Users, Key, Building2, Plus, ArrowRight, Loader2 } from "lucide-react"
import { GithubIcon } from "@/components/github-icon"

export default function WorkspacePage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
  })
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)

  // Form states
  const [createName, setCreateName] = useState("")
  const [createCode, setCreateCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [joinName, setJoinName] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // GitHub States
  const [githubRepo, setGithubRepo] = useState("")
  const [linkedRepo, setLinkedRepo] = useState("")
  const [commits, setCommits] = useState<any[]>([])
  const [fetchingCommits, setFetchingCommits] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [verifiedCommits, setVerifiedCommits] = useState<string[]>([])

  const loadWorkspaceData = async (wsId: string) => {
    try {
      setLoading(true)
      const ws = await dbService.getWorkspace(wsId)
      if (ws) {
        setWorkspace(ws)
        const mems = await dbService.getMembers(wsId)
        setMembers(mems)
      } else if (wsId === "demo-workspace-uuid") {
        const allWss = await dbService.getWorkspace("demo-workspace-uuid")
        if (allWss) {
          setWorkspace(allWss)
          const mems = await dbService.getMembers("demo-workspace-uuid")
          setMembers(mems)
        }
      }
      setErrorMsg(null)
    } catch (e) {
      console.error(e)
      setErrorMsg("Failed to load workspace data.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommits = async (repoName: string) => {
    try {
      setFetchingCommits(true)
      setRepoError(null)
      const cleanRepo = repoName.trim().replace(/https:\/\/github\.com\//, "")
      const response = await fetch(`https://api.github.com/repos/${cleanRepo}/commits?per_page=5`)
      
      if (!response.ok) {
        throw new Error("Repository not found or public API limit reached. Using demo commits fallback.")
      }
      
      const data = await response.json()
      const formatted = data.map((item: any) => ({
        sha: item.sha,
        message: item.commit.message.split("\n")[0],
        author: item.commit.author.name,
        date: item.commit.author.date
      }))
      
      setCommits(formatted)
    } catch (e: any) {
      console.warn(e)
      setRepoError(e.message || "Failed to fetch repository commits.")
      const demoCommits = [
        { sha: "a1b2c3d4e5f6g7h8i9j0", message: "feat: implement cryptographic ledger verification flow", author: "Mayank", date: new Date().toISOString() },
        { sha: "f7e6d5c4b3a210987654", message: "fix: resolve workspace anchor jump behavior", author: "Mayank", date: new Date().toISOString() },
        { sha: "9876543210abcdef0123", message: "docs: add api reference for standup digest weights", author: "Mayank", date: new Date().toISOString() }
      ]
      setCommits(demoCommits)
    } finally {
      setFetchingCommits(false)
    }
  }

  useEffect(() => {
    loadWorkspaceData(activeWorkspaceId)

    const handleSync = () => {
      const currentId = localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
      setActiveWorkspaceId(currentId)
      loadWorkspaceData(currentId)
    }

    const handleCustomChange = (e: any) => {
      if (e.detail) {
        setActiveWorkspaceId(e.detail)
        loadWorkspaceData(e.detail)
      }
    }

    window.addEventListener("effrt_db_sync", handleSync)
    window.addEventListener("effrt_workspace_changed", handleCustomChange)
    
    const unsubscribe = dbService.subscribeToChanges(activeWorkspaceId, () => {
      loadWorkspaceData(activeWorkspaceId)
    })

    return () => {
      window.removeEventListener("effrt_db_sync", handleSync)
      window.removeEventListener("effrt_workspace_changed", handleCustomChange)
      unsubscribe()
    }
  }, [activeWorkspaceId])

  // Load saved Repo on activeWorkspaceId change
  useEffect(() => {
    const savedRepo = localStorage.getItem(`effrt_github_repo_${activeWorkspaceId}`)
    if (savedRepo) {
      setGithubRepo(savedRepo)
      setLinkedRepo(savedRepo)
      fetchCommits(savedRepo)
    } else {
      setGithubRepo("")
      setLinkedRepo("")
      setCommits([])
      setRepoError(null)
    }
  }, [activeWorkspaceId])

  const copyToClipboard = async () => {
    if (!workspace?.invite_code) return
    try {
      await navigator.clipboard.writeText(workspace.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy!", err)
    }
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim() || !createCode.trim()) {
      setErrorMsg("All fields are required to create a workspace.")
      return
    }

    try {
      const code = createCode.toUpperCase().trim()
      const existing = await dbService.getWorkspaceByCode(code)
      if (existing) {
        setErrorMsg("Invite code is already taken. Please choose another.")
        return
      }

      const newWs = await dbService.createWorkspace(createName.trim(), code)
      const adminMember = await dbService.addMember(newWs.id, "Mayank")
      localStorage.setItem(`effrt_current_member_id_${newWs.id}`, adminMember.id)
      
      localStorage.setItem("effrt_current_workspace_id", newWs.id)
      window.dispatchEvent(new CustomEvent("effrt_workspace_changed", { detail: newWs.id }))
      
      setCreateName("")
      setCreateCode("")
      setSuccessMsg(`Workspace "${newWs.name}" created successfully!`)
      setErrorMsg(null)
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to create workspace.")
    }
  }

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim() || !joinName.trim()) {
      setErrorMsg("All fields are required to join a workspace.")
      return
    }

    try {
      const code = joinCode.toUpperCase().trim()
      const ws = await dbService.getWorkspaceByCode(code)
      if (!ws) {
        setErrorMsg("Workspace not found for this invite code.")
        return
      }

      const currentMembers = await dbService.getMembers(ws.id)
      let member = currentMembers.find(m => m.name.toLowerCase() === joinName.trim().toLowerCase())
      
      if (!member) {
        member = await dbService.addMember(ws.id, joinName.trim())
      }

      localStorage.setItem(`effrt_current_member_id_${ws.id}`, member.id)
      localStorage.setItem("effrt_current_workspace_id", ws.id)
      window.dispatchEvent(new CustomEvent("effrt_workspace_changed", { detail: ws.id }))

      setJoinCode("")
      setJoinName("")
      setSuccessMsg(`Joined "${ws.name}" successfully!`)
      setErrorMsg(null)
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to join workspace.")
    }
  }

  const handleLinkRepo = async () => {
    if (!githubRepo.trim()) return
    const cleanRepo = githubRepo.trim().replace(/https:\/\/github\.com\//, "")
    setLinkedRepo(cleanRepo)
    localStorage.setItem(`effrt_github_repo_${activeWorkspaceId}`, cleanRepo)
    await fetchCommits(cleanRepo)
  }

  const handleVerifyCommit = async (commit: any) => {
    try {
      const wsId = activeWorkspaceId
      const memberId = localStorage.getItem(`effrt_current_member_id_${wsId}`) || "member-mayank-uuid"
      
      const actionMessage = `GitHub Commit Verified: "${commit.message}" (SHA: ${commit.sha.substring(0, 7)})`
      await dbService.addProofEntry(wsId, memberId, actionMessage, null)
      
      setVerifiedCommits(prev => [...prev, commit.sha])
      
      window.dispatchEvent(new CustomEvent("effrt_db_sync"))
    } catch (e) {
      console.error(e)
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Workspace</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Configure collaboration keys, invite engineering members, and switch active project rooms.
          </p>
        </div>
        
        {successMsg && (
          <div className="text-emerald-400 text-xs border border-emerald-950 bg-emerald-950/10 px-4 py-2 font-mono rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="text-red-400 text-xs border border-red-950 bg-red-950/10 px-4 py-2 font-mono rounded-lg">
            {errorMsg}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-zinc-500 text-xs animate-pulse">
          Loading workspace database...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            <Card className="bg-card/40 border-zinc-900 rounded-xl relative shadow-md">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white rounded-lg">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      {workspace?.name || "No Active Workspace"}
                    </CardTitle>
                    <CardDescription className="text-xxs text-zinc-500 font-mono mt-0.5">
                      ID: {workspace?.id || "N/A"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Access Key</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-zinc-950 border border-zinc-900 px-4 py-2 font-mono text-lg font-bold tracking-widest text-white select-all rounded-lg">
                      {workspace?.invite_code || "N/A"}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={copyToClipboard}
                      disabled={!workspace}
                      size="icon"
                      className="size-10 bg-zinc-950 border-zinc-900 hover:border-zinc-700 rounded-lg"
                    >
                      {copied ? <Check className="size-4.5 text-emerald-500" /> : <Copy className="size-4.5 text-zinc-400" />}
                    </Button>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xxs text-zinc-500">
                  <span>Room created at:<br /></span>
                  <span className="text-zinc-300">
                    {workspace ? new Date(workspace.created_at).toLocaleString() : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6 flex flex-row items-center gap-2.5">
                <Users className="size-4.5 text-zinc-400" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Joined Room Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {members.length === 0 ? (
                  <div className="p-8 text-center font-mono text-xs text-zinc-600">
                    No members associated with this workspace.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900/60">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 hover:bg-zinc-950/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-200">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-zinc-200 block">{member.name}</span>
                            <span className="text-xxs text-zinc-500 font-mono">
                              ID: {member.id}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[10px] text-zinc-500">
                          <span>Joined:<br /></span>
                          <span className="text-zinc-400">
                            {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GitHub Repository Sync Card */}
            <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GithubIcon className="size-5 text-zinc-400 fill-zinc-400" />
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      GitHub Repository Sync
                    </CardTitle>
                    <CardDescription className="text-xxs text-zinc-500 mt-0.5">
                      Link a public repository to verify developer commits and append them to the proof trail.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="e.g. facebook/react"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="bg-zinc-950 border-zinc-900 text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg flex-1 font-mono"
                  />
                  <Button 
                    onClick={handleLinkRepo}
                    disabled={fetchingCommits}
                    className="h-10 text-xs font-semibold uppercase bg-white hover:bg-zinc-200 text-black rounded-lg px-4 flex items-center gap-2"
                  >
                    {fetchingCommits && <Loader2 className="size-3.5 animate-spin" />}
                    Sync Commits
                  </Button>
                </div>

                {repoError && (
                  <span className="text-zinc-400 font-mono text-[10px] block leading-relaxed border border-zinc-800/80 bg-zinc-900/20 p-2.5 rounded-lg">
                    ⚠️ {repoError}
                  </span>
                )}

                {commits.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Latest Commits ({linkedRepo})</span>
                    <div className="divide-y divide-zinc-900/60 border border-zinc-900 rounded-lg bg-zinc-950/20 overflow-hidden">
                      {commits.map((commit) => {
                        const isVerified = verifiedCommits.includes(commit.sha)
                        return (
                          <div key={commit.sha} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-950/10 transition-all">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-xs font-semibold text-zinc-200 truncate">{commit.message}</span>
                              <div className="flex items-center gap-2 text-xxs font-mono text-zinc-500">
                                <span className="text-zinc-400 truncate">Author: {commit.author}</span>
                                <span>•</span>
                                <span className="text-zinc-600 font-bold">{commit.sha.substring(0, 7)}</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleVerifyCommit(commit)}
                              disabled={isVerified}
                              size="sm"
                              className={`h-8 px-3 text-[10px] font-bold uppercase rounded-lg transition-all shrink-0 ${
                                isVerified 
                                  ? "bg-zinc-900 border border-zinc-800 text-emerald-400 cursor-default" 
                                  : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white"
                              }`}
                            >
                              {isVerified ? (
                                <span className="flex items-center gap-1"><Check className="size-3" /> Verified</span>
                              ) : (
                                "Verify Commit"
                              )}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          <div className="flex flex-col gap-8">
            
            <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                  <Key className="size-4 text-zinc-400" /> Join Room
                </CardTitle>
                <CardDescription className="text-xxs text-zinc-500 mt-1">
                  Access an existing workspace using a room invite code.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleJoinWorkspace} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Invite Code</label>
                    <Input 
                      placeholder="e.g. EFFRT-DEMO"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="bg-zinc-950 border-zinc-900 uppercase font-mono text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Your Developer Name</label>
                    <Input 
                      placeholder="e.g. John Doe"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      className="bg-zinc-950 border-zinc-900 text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg"
                    />
                  </div>

                  <Button type="submit" className="w-full h-10 text-xs font-semibold uppercase bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-lg mt-2 flex items-center justify-center gap-2">
                    Enter Workspace <ArrowRight className="size-3.5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-zinc-900 rounded-xl shadow-md">
              <CardHeader className="border-b border-zinc-900/60 py-4 px-6">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                  <Plus className="size-4 text-zinc-400" /> Create Room
                </CardTitle>
                <CardDescription className="text-xxs text-zinc-500 mt-1">
                  Initiate a brand new contribution workspace ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Workspace Name</label>
                    <Input 
                      placeholder="e.g. Mobile App Team"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      className="bg-zinc-950 border-zinc-900 text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Unique Invite Code</label>
                    <Input 
                      placeholder="e.g. MY-ROOM-KEY"
                      value={createCode}
                      onChange={(e) => setCreateCode(e.target.value)}
                      className="bg-zinc-950 border-zinc-900 uppercase font-mono text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg"
                    />
                  </div>

                  <Button type="submit" className="w-full h-10 text-xs font-semibold uppercase bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-lg mt-2 flex items-center justify-center gap-2">
                    Create Workspace <Plus className="size-3.5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  )
}
