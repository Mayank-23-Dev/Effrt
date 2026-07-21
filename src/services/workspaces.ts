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

export const workspaceService = {
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

  async addMember(workspaceId: string, name: string): Promise<Member> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('members')
        .insert([{ workspace_id: workspaceId, name }])
        .select()
        .single()
      if (error) throw error

      // Log action to proof trail
      const { proofTrailService } = await import('./proofTrail')
      await proofTrailService.addProofEntry(workspaceId, data.id, 'joined the workspace', null)

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

  async getWorkspace(id: string): Promise<Workspace | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('workspaces')
        .select()
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data
    } else {
      const ws = mockDB.get().workspaces.find((w: any) => w.id === id)
      return ws || null
    }
  },

  subscribeToChanges(workspaceId: string, onUpdate: () => void): () => void {
    const client = supabase
    if (isSupabaseConfigured && client) {
      const channel = client
        .channel(`workspace-${workspaceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', filter: `workspace_id=eq.${workspaceId}` },
          () => onUpdate()
        )
        .subscribe()

      return () => {
        client.removeChannel(channel)
      }
    } else {
      const handleSync = () => onUpdate()
      window.addEventListener('effrt_db_sync', handleSync)
      return () => {
        window.removeEventListener('effrt_db_sync', handleSync)
      }
    }
  }
}
