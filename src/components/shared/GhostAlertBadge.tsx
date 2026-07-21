import { Badge } from "@/components/ui/badge"
import { Ghost, AlertTriangle } from "lucide-react"

interface GhostAlertBadgeProps {
  className?: string
  reason?: string
}

export function GhostAlertBadge({ className, reason = "Missed standup" }: GhostAlertBadgeProps) {
  return (
    <Badge 
      variant="destructive" 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-xs bg-red-950/40 text-red-400 border border-red-800/60 transition-all duration-300 hover:bg-red-950/60 hover:text-red-300 shadow-sm animate-pulse ${className}`}
    >
      <Ghost className="size-3.5" />
      <span>{reason}</span>
      <AlertTriangle className="size-3 text-red-500" />
    </Badge>
  )
}
