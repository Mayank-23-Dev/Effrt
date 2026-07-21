import { supabase, isSupabaseConfigured, mockDB } from '../lib/supabase'

export interface Workspace {
  id: string
  name: string
  invite_code: string
  created_at: string
}

export interface Member {
  id: string
  workspace_id: string
  name: string
  joined_at: string
}

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

export interface ProofEntry {
  id: string
  workspace_id: string
  member_id: string
  action_type: string
  task_id: string | null
  timestamp: string
}

export interface Standup {
  id: string
  workspace_id: string
  member_id: string
  content: string
  date: string
  created_at: string
}

export const dbService = {
  // 1. WORKSPACES
  async createWorkspace(name: string, inviteCode: string): Promise<Workspace> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, invite_code: inviteCode.toUpperCase().trim() }])
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      return mockDB.createWorkspace(name, inviteCode)
    }
  },

  async getWorkspaceByCode(code: string): Promise<Workspace | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('workspaces')
        .select()
        .eq('invite_code', code.toUpperCase().trim())
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      return mockDB.getWorkspaceByCode(code)
    }
  },

  // 2. MEMBERS
  async addMember(workspaceId: string, name: string): Promise<Member> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('members')
        .insert([{ workspace_id: workspaceId, name }])
        .select()
        .single()
      if (error) throw error

      // Log action to proof trail
      await this.addProofEntry(workspaceId, data.id, 'joined the workspace', null)

      return data
    } else {
      return mockDB.addMember(workspaceId, name)
    }
  },

  async getMembers(workspaceId: string): Promise<Member[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('members')
        .select()
        .eq('workspace_id', workspaceId)
      if (error) throw error
      return data || []
    } else {
      return mockDB.getMembers(workspaceId)
    }
  },

  // 3. TASKS
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
        await this.addProofEntry(workspaceId, assigneeId, `was assigned task '${title}'`, data.id)
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
      // First get current task to compare status
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

      // Log action to proof trail
      if (newStatus === 'done') {
        await this.addProofEntry(workspaceId, memberId, `completed task '${currentTask.title}'`, taskId)
      } else {
        await this.addProofEntry(workspaceId, memberId, `moved task '${currentTask.title}' to ${newStatus.replace('_', ' ')}`, taskId)
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
  },

  // 4. PROOF TRAIL
  async addProofEntry(
    workspaceId: string,
    memberId: string,
    actionType: string,
    taskId: string | null
  ): Promise<ProofEntry> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('proof_trail')
        .insert([{
          workspace_id: workspaceId,
          member_id: memberId,
          action_type: actionType,
          task_id: taskId
        }])
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      return mockDB.addProofEntry(workspaceId, memberId, actionType, taskId) as ProofEntry
    }
  },

  async getProofTrail(workspaceId: string): Promise<ProofEntry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('proof_trail')
        .select()
        .eq('workspace_id', workspaceId)
        .order('timestamp', { ascending: false })
      if (error) throw error
      return data || []
    } else {
      return mockDB.getProofTrail(workspaceId) as ProofEntry[]
    }
  },

  // 5. STANDUPS
  async submitStandup(workspaceId: string, memberId: string, content: string): Promise<Standup> {
    if (isSupabaseConfigured && supabase) {
      const dateStr = new Date().toISOString().split('T')[0]
      
      // Upsert standup
      const { data, error } = await supabase
        .from('standups')
        .upsert(
          { workspace_id: workspaceId, member_id: memberId, content, date: dateStr },
          { onConflict: 'member_id,date' }
        )
        .select()
        .single()

      if (error) throw error

      // Log action to proof trail
      await this.addProofEntry(workspaceId, memberId, 'submitted their daily standup update', null)

      return data
    } else {
      return mockDB.submitStandup(workspaceId, memberId, content) as Standup
    }
  },

  async getStandups(workspaceId: string): Promise<Standup[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('standups')
        .select()
        .eq('workspace_id', workspaceId)
      if (error) throw error
      return data || []
    } else {
      return mockDB.getStandups(workspaceId) as Standup[]
    }
  },

  // 6. REALTIME SUBSCRIPTION
  subscribeToChanges(workspaceId: string, onUpdate: () => void): () => void {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`workspace-${workspaceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', filter: `workspace_id=eq.${workspaceId}` },
          () => onUpdate()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      // Simulate real-time update listeners in the browser
      const handleSync = () => onUpdate()
      window.addEventListener('effrt_db_sync', handleSync)
      return () => {
        window.removeEventListener('effrt_db_sync', handleSync)
      }
    }
  }
}
