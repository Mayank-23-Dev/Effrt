import { workspaceService } from './workspaces'
import type { Workspace, Member } from './workspaces'
import { taskService } from './tasks'
import type { Task } from './tasks'
import { proofTrailService } from './proofTrail'
import type { ProofEntry } from './proofTrail'
import { standupService } from './standups'
import type { Standup } from './standups'

export type { Workspace, Member, Task, ProofEntry, Standup }

export const dbService = {
  ...workspaceService,
  ...taskService,
  ...proofTrailService,
  ...standupService,
}
