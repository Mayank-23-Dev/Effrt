import { supabase, isSupabaseConfigured, mockDB } from '../lib/supabase'

export interface Standup {
  id: string
  workspace_id: string
  member_id: string
  content: string
  date: string
  created_at: string
}

export const standupService = {
  async submitStandup(workspaceId: string, memberId: string, content: string): Promise<Standup> {
    if (isSupabaseConfigured && supabase) {
      const dateStr = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('standups')
        .upsert(
          { workspace_id: workspaceId, member_id: memberId, content, date: dateStr },
          { onConflict: 'member_id,date' }
        )
        .select()
        .single()

      if (error) throw error

      const { proofTrailService } = await import('./proofTrail')
      await proofTrailService.addProofEntry(workspaceId, memberId, 'submitted their daily standup update', null)

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
  }
}
