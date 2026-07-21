import { workspaceService } from './workspaces'
import type { Workspace, Member } from './workspaces'
import { taskService } from './tasks'
import type { Task } from './tasks'
import { proofTrailService } from './proofTrail'
import type { ProofEntry } from './proofTrail'
import { standupService } from './standups'
import type { Standup } from './standups'
import { effortMeterService } from './effortMeter'
import type { MemberEffort } from './effortMeter'
import { finalReportService } from './finalReport'
import type { MemberReport } from './finalReport'

export type { Workspace, Member, Task, ProofEntry, Standup, MemberEffort, MemberReport }

export const dbService = {
  ...workspaceService,
  ...taskService,
  ...proofTrailService,
  ...standupService,
  ...effortMeterService,
  ...finalReportService,
}
