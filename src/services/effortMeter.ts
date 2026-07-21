import { workspaceService } from './workspaces'
import { taskService } from './tasks'
import { proofTrailService } from './proofTrail'

export interface MemberEffort {
  memberId: string
  name: string
  tasksAssigned: number
  tasksCompleted: number
  onTimeCompletionRate: number // 0 to 100
  daysSinceLastActivity: number | null
  isGhost: boolean // Inactive 48+ hours
}

export const effortMeterService = {
  async getWorkspaceEffort(workspaceId: string): Promise<MemberEffort[]> {
    const [members, tasks, proofTrail] = await Promise.all([
      workspaceService.getMembers(workspaceId),
      taskService.getTasks(workspaceId),
      proofTrailService.getProofTrail(workspaceId),
    ])

    const now = new Date()

    return members.map((member) => {
      // 1. Filter tasks for this member
      const memberTasks = tasks.filter((t) => t.assignee_id === member.id)
      const tasksAssigned = memberTasks.length
      const completedTasks = memberTasks.filter((t) => t.status === 'done')
      const tasksCompleted = completedTasks.length

      // 2. Compute on-time completion %
      let onTimeCount = 0
      completedTasks.forEach((t) => {
        if (!t.due_date) {
          onTimeCount++
        } else {
          const compDate = new Date(t.completed_at || '')
          const dueDate = new Date(t.due_date)
          if (compDate <= dueDate) {
            onTimeCount++
          }
        }
      })
      const onTimeCompletionRate = tasksCompleted > 0
        ? Math.round((onTimeCount / tasksCompleted) * 100)
        : 100 // Default to 100% if no completed tasks

      // 3. Compute days since last activity from proof trail
      const memberTrail = proofTrail.filter((p) => p.member_id === member.id)
      let daysSinceLastActivity: number | null = null
      let isGhost = false

      if (memberTrail.length > 0) {
        // Find the maximum timestamp (most recent activity)
        const latestTime = new Date(
          Math.max(...memberTrail.map((t) => new Date(t.timestamp).getTime()))
        )
        const diffMs = now.getTime() - latestTime.getTime()
        daysSinceLastActivity = parseFloat((diffMs / (1000 * 60 * 60 * 24)).toFixed(1))
        isGhost = diffMs >= 48 * 60 * 60 * 1000 // 48 hours
      } else {
        // Use joined_at as fallback if no activity in proof trail yet
        const joinedTime = new Date(member.joined_at)
        const diffMs = now.getTime() - joinedTime.getTime()
        daysSinceLastActivity = parseFloat((diffMs / (1000 * 60 * 60 * 24)).toFixed(1))
        isGhost = diffMs >= 48 * 60 * 60 * 1000
      }

      return {
        memberId: member.id,
        name: member.name,
        tasksAssigned,
        tasksCompleted,
        onTimeCompletionRate,
        daysSinceLastActivity,
        isGhost,
      }
    })
  }
}
