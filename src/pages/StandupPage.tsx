import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CalendarRange } from "lucide-react"

export default function StandupPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Standup Digest</h1>
        <p className="text-muted-foreground text-sm">
          Daily standups, updates, and AI-summarized executive reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <CalendarRange className="size-5" />
            </div>
            <CardTitle>Daily Digest</CardTitle>
            <CardDescription>View today's standup submissions</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Feature coming soon. Write daily updates, generate AI digests, and spot missing members.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
