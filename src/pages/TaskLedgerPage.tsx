import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ListTodo } from "lucide-react"

export default function TaskLedgerPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Task Ledger</h1>
        <p className="text-muted-foreground text-sm">
          Track and log all development tasks, statuses, and deadlines.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ListTodo className="size-5" />
            </div>
            <CardTitle>Kanban Board & Tasks</CardTitle>
            <CardDescription>Drag and drop tasks to update progress</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Feature coming soon. Track tasks across Todo, In Progress, and Done lists.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
