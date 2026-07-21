import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function EffortMeterPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Effort Meter</h1>
        <p className="text-muted-foreground text-sm">
          Analytics dashboard showing individual task performance, velocity, and effort index.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Activity className="size-5" />
            </div>
            <CardTitle>Velocity Analytics</CardTitle>
            <CardDescription>Visualize individual work trends</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Feature coming soon. Monitor contribution metrics, charts, and detect potential slacking.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
