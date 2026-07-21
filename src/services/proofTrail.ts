import { supabase, isSupabaseConfigured, mockDB } from '../lib/supabase'

export interface ProofEntry {
  id: string
  workspace_id: string
  member_id: string
  action_type: string
  task_id: string | null
  timestamp: string
}

export const proofTrailService = {
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
  }
}
