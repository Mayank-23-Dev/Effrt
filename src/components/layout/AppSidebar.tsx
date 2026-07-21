import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  Building2, 
  ListTodo, 
  History, 
  Gauge, 
  CalendarRange, 
  FileText
} from "lucide-react"
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
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
            AG
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-semibold text-foreground">Mayank</span>
            <span className="truncate text-[10px] text-muted-foreground">Workspace Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
