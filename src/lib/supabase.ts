import { createClient } from '@supabase/supabase-js'

// Try to grab environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Real client (will be null if not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// BroadcastChannel for simulating realtime sync across tabs when using LocalStorage
const syncChannel = typeof window !== 'undefined' ? new BroadcastChannel('effrt_sync_channel') : null

// Simulated database interface using LocalStorage
export interface DBState {
  workspaces: any[]
  members: any[]
  tasks: any[]
  proof_trail: any[]
  standups: any[]
}

const getInitialState = (): DBState => {
  const defaultState: DBState = {
    workspaces: [],
    members: [],
    tasks: [],
    proof_trail: [],
    standups: []
  }

  if (typeof window === 'undefined') return defaultState

  const saved = localStorage.getItem('effrt_db')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse simulated DB, resetting.', e)
    }
  }

  // Pre-seed some demo data if the DB is completely empty to make review instant
  const workspaceId = 'demo-workspace-uuid'
  const memberAId = 'member-mayank-uuid'
  const memberBId = 'member-john-uuid'
  const memberCId = 'member-sarah-uuid' // The ghost slacker!

  const seedState: DBState = {
    workspaces: [
      {
        id: workspaceId,
        name: 'Vite React App & Supabase Setup',
        invite_code: 'EFFRT-DEMO',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    members: [
      { id: memberAId, workspace_id: workspaceId, name: 'Mayank (Project Lead)', joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: memberBId, workspace_id: workspaceId, name: 'John (Backend Dev)', joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: memberCId, workspace_id: workspaceId, name: 'Sarah (UI Designer)', joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    tasks: [
      {
        id: 'task-1',
        workspace_id: workspaceId,
        title: 'Draft database schema.sql',
        assignee_id: memberBId,
        status: 'done',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-2',
        workspace_id: workspaceId,
        title: 'Initialize React + Vite scaffold',
        assignee_id: memberAId,
        status: 'done',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-3',
        workspace_id: workspaceId,
        title: 'Create workspace joining components',
        assignee_id: memberAId,
        status: 'in_progress',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-4',
        workspace_id: workspaceId,
        title: 'Setup Supabase client & routing',
        assignee_id: memberBId,
        status: 'done',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-5',
        workspace_id: workspaceId,
        title: 'Design wireframes and theme rules',
        assignee_id: memberCId, // Sarah
        status: 'todo',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // OVERDUE!
        completed_at: null,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    proof_trail: [
      {
        id: 'log-1',
        workspace_id: workspaceId,
        member_id: memberAId,
        action_type: 'joined the workspace',
        task_id: null,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'log-2',
        workspace_id: workspaceId,
        member_id: memberBId,
        action_type: 'joined the workspace',
        task_id: null,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString()
      },
      {
        id: 'log-3',
        workspace_id: workspaceId,
        member_id: memberCId,
        action_type: 'joined the workspace',
        task_id: null,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
      },
      {
        id: 'log-4',
        workspace_id: workspaceId,
        member_id: memberBId,
        action_type: "completed task 'Draft database schema.sql'",
        task_id: 'task-1',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'log-5',
        workspace_id: workspaceId,
        member_id: memberAId,
        action_type: "completed task 'Initialize React + Vite scaffold'",
        task_id: 'task-2',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'log-6',
        workspace_id: workspaceId,
        member_id: memberBId,
        action_type: "completed task 'Setup Supabase client & routing'",
        task_id: 'task-4',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    standups: [
      {
        id: 'su-1',
        workspace_id: workspaceId,
        member_id: memberAId,
        content: 'Finished setting up Vite and Tailwind. Now working on task-3 join component.',
        date: new Date(Date.now()).toISOString().split('T')[0],
        created_at: new Date().toISOString()
      },
      {
        id: 'su-2',
        workspace_id: workspaceId,
        member_id: memberBId,
        content: 'Database tables verified. Built standard migration scripts.',
        date: new Date(Date.now()).toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }
      // Sarah skipped standup (Ghost Alert!)
    ]
  }

  localStorage.setItem('effrt_db', JSON.stringify(seedState))
  return seedState
}

// Global simulated state in memory
let simulatedDB = getInitialState()

const saveSimulatedDB = () => {
  localStorage.setItem('effrt_db', JSON.stringify(simulatedDB))
  syncChannel?.postMessage('db_update')
}

// Listen for updates from other tabs
if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data === 'db_update') {
      const saved = localStorage.getItem('effrt_db')
      if (saved) {
        try {
          simulatedDB = JSON.parse(saved)
          // Dispatch custom event to trigger React re-renders in this tab
          window.dispatchEvent(new CustomEvent('effrt_db_sync'))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}

// Simulated DB client wrapper
export const mockDB = {
  get: () => ({ ...simulatedDB }),

  createWorkspace: (name: string, inviteCode: string) => {
    const ws = {
      id: crypto.randomUUID(),
      name,
      invite_code: inviteCode.toUpperCase().trim(),
      created_at: new Date().toISOString()
    }
    simulatedDB.workspaces.push(ws)
    saveSimulatedDB()
    return ws
  },

  getWorkspaceByCode: (code: string) => {
    return simulatedDB.workspaces.find(
      (w) => w.invite_code.toUpperCase().trim() === code.toUpperCase().trim()
    ) || null
  },

  addMember: (workspaceId: string, name: string) => {
    const member = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      name,
      joined_at: new Date().toISOString()
    }
    simulatedDB.members.push(member)

    // Log action to proof trail
    mockDB.addProofEntry(workspaceId, member.id, 'joined the workspace', null)

    saveSimulatedDB()
    return member
  },

  getMembers: (workspaceId: string) => {
    return simulatedDB.members.filter((m) => m.workspace_id === workspaceId)
  },

  createTask: (workspaceId: string, title: string, assigneeId: string | null, status: string, dueDate: string | null) => {
    const task = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      title,
      assignee_id: assigneeId,
      status,
      due_date: dueDate,
      completed_at: status === 'done' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    }
    simulatedDB.tasks.push(task)

    if (assigneeId) {
      mockDB.addProofEntry(workspaceId, assigneeId, `was assigned task '${title}'`, task.id)
    }

    saveSimulatedDB()
    return task
  },

  updateTaskStatus: (workspaceId: string, taskId: string, memberId: string, newStatus: string) => {
    const task = simulatedDB.tasks.find((t) => t.id === taskId)
    if (!task) return null

    const oldStatus = task.status
    if (oldStatus === newStatus) return task

    task.status = newStatus
    if (newStatus === 'done') {
      task.completed_at = new Date().toISOString()
      mockDB.addProofEntry(workspaceId, memberId, `completed task '${task.title}'`, taskId)
    } else {
      task.completed_at = null
      mockDB.addProofEntry(workspaceId, memberId, `moved task '${task.title}' to ${newStatus.replace('_', ' ')}`, taskId)
    }

    saveSimulatedDB()
    return task
  },

  deleteTask: (taskId: string) => {
    simulatedDB.tasks = simulatedDB.tasks.filter((t) => t.id !== taskId)
    saveSimulatedDB()
  },

  getTasks: (workspaceId: string) => {
    return simulatedDB.tasks.filter((t) => t.workspace_id === workspaceId)
  },

  addProofEntry: (workspaceId: string, memberId: string, actionType: string, taskId: string | null) => {
    const entry = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      member_id: memberId,
      action_type: actionType,
      task_id: taskId,
      timestamp: new Date().toISOString()
    }
    simulatedDB.proof_trail.unshift(entry) // Add to beginning for scrolling log feed
    saveSimulatedDB()
    return entry
  },

  getProofTrail: (workspaceId: string) => {
    return simulatedDB.proof_trail.filter((p) => p.workspace_id === workspaceId)
  },

  submitStandup: (workspaceId: string, memberId: string, content: string) => {
    const dateStr = new Date().toISOString().split('T')[0]
    
    // Check if standup for today already exists, if so overwrite
    const existingIdx = simulatedDB.standups.findIndex(
      (s) => s.member_id === memberId && s.date === dateStr
    )

    const standup = {
      id: existingIdx >= 0 ? simulatedDB.standups[existingIdx].id : crypto.randomUUID(),
      workspace_id: workspaceId,
      member_id: memberId,
      content,
      date: dateStr,
      created_at: new Date().toISOString()
    }

    if (existingIdx >= 0) {
      simulatedDB.standups[existingIdx] = standup
    } else {
      simulatedDB.standups.push(standup)
      mockDB.addProofEntry(workspaceId, memberId, 'submitted their daily standup update', null)
    }

    saveSimulatedDB()
    return standup
  },

  getStandups: (workspaceId: string) => {
    return simulatedDB.standups.filter((s) => s.workspace_id === workspaceId)
  }
}
