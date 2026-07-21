import { useState } from "react"
import { NavLink } from "react-router-dom"
import { 
  Search, 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Building2,
  ListTodo,
  History,
  Gauge,
  CalendarRange,
  FileText
} from "lucide-react"
import { EffrtLogo } from "@/components/shared/EffrtLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

const sidebarItems: SidebarItem[] = [
  { name: "Workspace", href: "/", icon: Building2 },
  { name: "Task Ledger", href: "/tasks", icon: ListTodo },
  { name: "Proof Trail", href: "/proof", icon: History },
  { name: "Effort Meter", href: "/effort", icon: Gauge },
  { name: "Standup Digest", href: "/standup", icon: CalendarRange },
  { name: "Final Report", href: "/report", icon: FileText },
]

export function AppTopbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          } />
          <SheetContent side="left" className="w-64 bg-card/95 p-0">
            <SheetHeader className="h-14 border-b border-border px-6 flex justify-center text-left">
              <SheetTitle>
                <NavLink to="/" className="flex items-center gap-1 font-semibold" onClick={() => setOpen(false)}>
                  <EffrtLogo className="size-7 text-foreground shrink-0" />
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent text-lg font-bold tracking-tight">
                    EFFRT
                  </span>
                </NavLink>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 space-y-1 p-4 flex flex-col gap-1">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-250",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks, members..."
            className="pl-9 h-9 w-full rounded-md border-border bg-muted/40 transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="relative size-8 rounded-full border border-border">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">AG</AvatarFallback>
              </Avatar>
            </Button>
          } />
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Mayank</p>
                <p className="text-xs leading-none text-muted-foreground">admin@effrt.dev</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="size-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="size-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
