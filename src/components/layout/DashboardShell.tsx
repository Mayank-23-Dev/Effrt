import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-transparent text-foreground dark">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64 min-h-screen">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
