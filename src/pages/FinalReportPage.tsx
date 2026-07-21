import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function FinalReportPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Final Report</h1>
        <p className="text-muted-foreground text-sm">
          Generate comprehensive work summaries, velocity statistics, and proof trails.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <FileText className="size-5" />
            </div>
            <CardTitle>Export Report</CardTitle>
            <CardDescription>Assemble deliverables and stats</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Feature coming soon. Assemble the final summary, export tables of completed tasks, and download PDF or markdown formats.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
