import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { cn, getInitials } from "@/lib/utils"
import { dbService } from "@/services/db"
import { 
  Building2, 
  ListTodo, 
  History, 
  Gauge, 
  CalendarRange, 
  FileText,
  LogOut,
  Shield,
  Settings,
  Copy,
  Check,
  Activity,
  Terminal,
  Info
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EffrtLogo } from "@/components/shared/EffrtLogo"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

const sidebarItems: SidebarItem[] = [
  { name: "Workspace", href: "/workspace", icon: Building2 },
  { name: "Task Ledger", href: "/tasks", icon: ListTodo },
  { name: "Proof Trail", href: "/proof", icon: History },
  { name: "Effort Meter", href: "/effort", icon: Gauge },
  { name: "Standup Digest", href: "/standup", icon: CalendarRange },
  { name: "Final Report", href: "/report", icon: FileText },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const [activeMemberName, setActiveMemberName] = useState("Mayank")
  const [activeMemberId, setActiveMemberId] = useState("N/A")
  const [activeWorkspaceName, setActiveWorkspaceName] = useState("Demo Workspace")
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("N/A")
  const [activeWorkspaceCode, setActiveWorkspaceCode] = useState("N/A")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Copy states
  const [copiedMemberId, setCopiedMemberId] = useState(false)
  const [copiedWorkspaceId, setCopiedWorkspaceId] = useState(false)

  const updateMember = async () => {
    try {
      const wsId = localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
      setActiveWorkspaceId(wsId)
      
      const ws = await dbService.getWorkspace(wsId)
      if (ws) {
        setActiveWorkspaceName(ws.name)
        setActiveWorkspaceCode(ws.invite_code)
      }
      
      const memberId = localStorage.getItem(`effrt_current_member_id_${wsId}`)
      if (memberId) {
        setActiveMemberId(memberId)
        const members = await dbService.getMembers(wsId)
        const active = members.find(m => m.id === memberId)
        if (active) {
          setActiveMemberName(active.name)
          return
        }
      } else {
        setActiveMemberId("N/A")
      }
      
      const wsIdFallback = localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
      const members = await dbService.getMembers(wsIdFallback)
      if (members.length > 0) {
        setActiveMemberName(members[0].name)
        setActiveMemberId(members[0].id)
      } else {
        setActiveMemberName("Mayank")
        setActiveMemberId("N/A")
      }
    } catch (e) {
      setActiveMemberName("Mayank")
      setActiveMemberId("N/A")
    }
  }

  useEffect(() => {
    updateMember()
    window.addEventListener("effrt_workspace_changed", updateMember)
    window.addEventListener("effrt_db_sync", updateMember)
    
    return () => {
      window.removeEventListener("effrt_workspace_changed", updateMember)
      window.removeEventListener("effrt_db_sync", updateMember)
    }
  }, [])

  const handleLogout = () => {
    const wsId = localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
    localStorage.removeItem(`effrt_current_member_id_${wsId}`)
    localStorage.removeItem("effrt_current_workspace_id")
    setDialogOpen(false)
    navigate("/")
  }

  const copyToClipboard = async (text: string, type: "member" | "workspace") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "member") {
        setCopiedMemberId(true)
        setTimeout(() => setCopiedMemberId(false), 2000)
      } else {
        setCopiedWorkspaceId(true)
        setTimeout(() => setCopiedWorkspaceId(false), 2000)
      }
    } catch (e) {
      console.error(e)
    }
  }


  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-md">
      <div className="flex h-14 items-center border-b border-border px-6">
        <NavLink to="/workspace" className="flex items-center gap-1 font-semibold">
          <EffrtLogo className="size-7 text-foreground shrink-0" />
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent text-lg font-bold tracking-tight">
            EFFRT
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 space-y-1 p-4 flex flex-col gap-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/workspace"}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <item.icon className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <div className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-accent hover:text-foreground transition-all duration-200 cursor-pointer w-full group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary group-hover:bg-primary/20 shrink-0">
                  {getInitials(activeMemberName)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-semibold text-foreground">{activeMemberName}</span>
                  <span className="truncate text-[10px] text-muted-foreground">Workspace Member</span>
                </div>
              </div>
              <Settings className="size-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
            </div>
          } />
          
          <DialogContent className="max-w-md bg-zinc-950 border border-zinc-900 text-zinc-200 rounded-xl p-6 shadow-2xl">
            <DialogHeader className="border-b border-zinc-900/60 pb-3 flex flex-row items-center gap-2">
              <Settings className="size-4.5 text-zinc-400" />
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-white">System Settings & Profile</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-5 mt-4">
              
              {/* Profile Details Block */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 flex items-center gap-4">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-black text-primary border border-primary/20 shadow-inner">
                  {getInitials(activeMemberName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{activeMemberName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="size-3 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Workspace Member</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 font-mono text-[9px] text-zinc-600 bg-zinc-900/40 border border-zinc-900 px-2 py-0.5 rounded w-fit max-w-full">
                    <span className="truncate">UID: {activeMemberId}</span>
                    <button 
                      onClick={() => copyToClipboard(activeMemberId, "member")} 
                      className="hover:text-white transition-colors shrink-0"
                      title="Copy Member ID"
                    >
                      {copiedMemberId ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Workspace Block */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono flex items-center gap-1.5">
                  <Building2 className="size-3 text-zinc-600" /> Session Workspace
                </span>
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 flex flex-col gap-2 font-mono text-xxs text-zinc-400">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-zinc-600 uppercase font-bold">Room Name:</span>
                    <span className="text-zinc-300 font-bold truncate max-w-[150px]">{activeWorkspaceName}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4 border-t border-zinc-900/60 pt-2">
                    <span className="text-zinc-600 uppercase font-bold">Invite Key:</span>
                    <span className="text-zinc-300 font-bold bg-zinc-900/60 px-2 py-0.5 border border-zinc-900 rounded">{activeWorkspaceCode}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4 border-t border-zinc-900/60 pt-2">
                    <span className="text-zinc-600 uppercase font-bold">Room ID:</span>
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <span className="text-zinc-400 truncate">{activeWorkspaceId}</span>
                      <button 
                        onClick={() => copyToClipboard(activeWorkspaceId, "workspace")}
                        className="hover:text-white transition-colors shrink-0"
                        title="Copy Workspace ID"
                      >
                        {copiedWorkspaceId ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Info Block */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono flex items-center gap-1.5">
                  <Terminal className="size-3 text-zinc-600" /> Environment status
                </span>
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 flex flex-col gap-2 font-mono text-xxs text-zinc-500">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Activity className="size-3 text-emerald-400" /> Realtime Channel</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-zinc-900/60 pt-2">
                    <span className="flex items-center gap-1.5"><Info className="size-3 text-zinc-600" /> Data Source</span>
                    <span className="text-zinc-400">SUPABASE / LOCAL</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-zinc-900/60 pt-4 mt-1">
                <Button 
                  onClick={() => setDialogOpen(false)}
                  variant="outline"
                  className="flex-1 h-10 text-xs font-semibold uppercase bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400 rounded-lg"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleLogout}
                  className="flex-1 h-10 text-xs font-semibold uppercase bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 text-red-400 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="size-3.5" /> Log Out
                </Button>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  )
}
