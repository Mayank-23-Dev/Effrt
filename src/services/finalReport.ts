import { effortMeterService } from './effortMeter'
import type { MemberEffort } from './effortMeter'
import { standupService } from './standups'

export interface MemberReport extends MemberEffort {
  contributionPercentage: number
  missedStandupDays: number
}

export const finalReportService = {
  async getWorkspaceReport(workspaceId: string): Promise<MemberReport[]> {
    const efforts = await effortMeterService.getWorkspaceEffort(workspaceId)
    const standups = await standupService.getStandups(workspaceId)

    // Compute weighted scores
    const weightedScores = efforts.map((eff) => {
      // W = completed * (0.5 + 0.5 * onTimeRate / 100)
      const weight = 0.5 + 0.5 * (eff.onTimeCompletionRate / 100)
      const score = eff.tasksCompleted * weight
      return { memberId: eff.memberId, score }
    })

    const totalWeightedScore = weightedScores.reduce((acc, curr) => acc + curr.score, 0)

    // Compute standup compliance: check last 5 days
    // Let's count how many days in the last 5 days each member missed standup
    const today = new Date()
    const last5DaysStr: string[] = []
    for (let i = 0; i < 5; i++) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      last5DaysStr.push(d.toISOString().split('T')[0])
    }

    return efforts.map((eff) => {
      const scoreObj = weightedScores.find((s) => s.memberId === eff.memberId)
      const contributionPercentage = totalWeightedScore > 0
        ? Math.round(((scoreObj?.score || 0) / totalWeightedScore) * 100)
        : 0

      // Count missed standups in the last 5 days
      const memberStandups = standups.filter((s) => s.member_id === eff.memberId)
      let missedStandupDays = 0
      last5DaysStr.forEach((dateStr) => {
        const hasSu = memberStandups.some((su) => su.date === dateStr)
        if (!hasSu) {
          missedStandupDays++
        }
      })

      return {
        ...eff,
        contributionPercentage,
        missedStandupDays
      }
    })
  }
}
