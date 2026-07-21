import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { History } from "lucide-react"

export default function ProofTrailPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Proof Trail</h1>
        <p className="text-muted-foreground text-sm">
          An immutable audit log tracking all developer actions, commits, and activity logs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <History className="size-5" />
            </div>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Real-time audit trailing of all work</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Feature coming soon. View every single change, update, and submission in this workspace.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
