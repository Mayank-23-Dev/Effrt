import { supabase, isSupabaseConfigured, mockDB } from '../lib/supabase'

export interface Task {
  id: string
  workspace_id: string
  title: string
  assignee_id: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export const taskService = {
  async createTask(
    workspaceId: string,
    title: string,
    assigneeId: string | null,
    status: 'todo' | 'in_progress' | 'done',
    dueDate: string | null
  ): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          workspace_id: workspaceId,
          title,
          assignee_id: assigneeId,
          status,
          due_date: dueDate,
          completed_at: status === 'done' ? new Date().toISOString() : null
        }])
        .select()
        .single()
      if (error) throw error

      if (assigneeId) {
        const { proofTrailService } = await import('./proofTrail')
        await proofTrailService.addProofEntry(workspaceId, assigneeId, `was assigned task '${title}'`, data.id)
      }

      return data
    } else {
      return mockDB.createTask(workspaceId, title, assigneeId, status, dueDate) as Task
    }
  },

  async updateTaskStatus(
    workspaceId: string,
    taskId: string,
    memberId: string,
    newStatus: 'todo' | 'in_progress' | 'done'
  ): Promise<Task | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('status, title')
        .eq('id', taskId)
        .single()

      if (!currentTask) return null
      if (currentTask.status === newStatus) return null

      const completedAt = newStatus === 'done' ? new Date().toISOString() : null

      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus, completed_at: completedAt })
        .eq('id', taskId)
        .select()
        .single()
      if (error) throw error

      const { proofTrailService } = await import('./proofTrail')
      if (newStatus === 'done') {
        await proofTrailService.addProofEntry(workspaceId, memberId, `completed task '${currentTask.title}'`, taskId)
      } else {
        await proofTrailService.addProofEntry(workspaceId, memberId, `moved task '${currentTask.title}' to ${newStatus.replace('_', ' ')}`, taskId)
      }

      return data
    } else {
      return mockDB.updateTaskStatus(workspaceId, taskId, memberId, newStatus) as Task
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
    } else {
      mockDB.deleteTask(taskId)
    }
  },

  async getTasks(workspaceId: string): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select()
        .eq('workspace_id', workspaceId)
      if (error) throw error
      return data || []
    } else {
      return mockDB.getTasks(workspaceId) as Task[]
    }
  }
}
