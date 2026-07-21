import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function WorkspacePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace</h1>
        <p className="text-muted-foreground text-sm">
          Manage your development team workspaces and collaboration invite codes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Building2 className="size-5" />
            </div>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Configure members and access codes</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Feature coming soon. Here you will be able to switch workspaces, add members, or view invite links.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
