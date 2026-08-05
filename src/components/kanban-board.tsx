import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { dbService } from '../services/db'
import type { Task, Member } from '../services/db'
import { Plus, Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { getInitials } from '../lib/utils'

interface KanbanBoardProps {
  workspaceId: string
  currentMember: Member
  members: Member[]
  tasks: Task[]
  onRefresh: () => void
}

export default function KanbanBoard({ workspaceId, currentMember, members, tasks, onRefresh }: KanbanBoardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Drag State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null)

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle) return

    setIsCreating(true)
    try {
      await dbService.createTask(
        workspaceId,
        taskTitle.trim(),
        assigneeId || null,
        'todo',
        dueDate ? new Date(dueDate).toISOString() : null
      )
      
      // Reset form
      setTaskTitle('')
      setAssigneeId('')
      setDueDate('')
      setIsDialogOpen(false)
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await dbService.deleteTask(id)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.setData('text/plain', id)
    // Add custom drag visual class or state if needed
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setActiveOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    setActiveOverColumn(columnStatus)
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
    if (!taskId) return

    try {
      await dbService.updateTaskStatus(workspaceId, taskId, currentMember.id, targetStatus)
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDraggedTaskId(null)
      setActiveOverColumn(null)
    }
  }

  const getMemberInitials = (id: string | null) => {
    if (!id) return '?'
    const member = members.find((m) => m.id === id)
    if (!member) return '?'
    return getInitials(member.name)
  }

  const getMemberName = (id: string | null) => {
    if (!id) return 'Unassigned'
    const member = members.find((m) => m.id === id)
    return member ? member.name : 'Unknown'
  }

  const isOverdue = (task: Task) => {
    if (task.status === 'done' || !task.due_date) return false
    return new Date(task.due_date).getTime() < Date.now()
  }

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const columns = [
    { title: 'To Do', status: 'todo' as const, bg: 'bg-zinc-950/40 border-zinc-900' },
    { title: 'In Progress', status: 'in_progress' as const, bg: 'bg-zinc-950/40 border-zinc-900' },
    { title: 'Done', status: 'done' as const, bg: 'bg-zinc-950/40 border-zinc-900' }
  ]

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Board Header */}
      <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📋 Task Ledger
          </h2>
          <p className="text-xs text-zinc-400">
            Drag cards between columns to update status. Moves are logged instantly.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-2 py-2 px-4 rounded-lg shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="size-4" /> Add Task
        </Button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status)
          const isCurrentOver = activeOverColumn === col.status

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              onDragLeave={() => setActiveOverColumn(null)}
              className={`flex flex-col min-h-[500px] max-h-[650px] rounded-xl border p-4 transition-all duration-300 ${col.bg} ${
                isCurrentOver 
                  ? 'border-violet-500/80 bg-zinc-900/40 shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/30 scale-[1.01]' 
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold tracking-wider text-zinc-300 uppercase">
                  {col.title}
                </span>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5">
                  {colTasks.length}
                </Badge>
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-grow">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-grow py-12 border-2 border-dashed border-zinc-900 rounded-lg text-zinc-600">
                    <p className="text-xs">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const overdue = isOverdue(task)
                    return (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`group cursor-grab active:cursor-grabbing bg-zinc-900/60 border-zinc-800 hover:border-zinc-700/80 transition-all duration-200 shadow-md ${
                          draggedTaskId === task.id ? 'opacity-40 scale-95 border-dashed border-violet-500' : ''
                        }`}
                      >
                        <CardContent className="p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-zinc-200 text-sm leading-snug group-hover:text-white transition-colors">
                              {task.title}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/40 pt-2.5 mt-1">
                            {/* Assignee Avatar */}
                            <div className="flex items-center gap-1.5">
                              <Avatar className="size-6 border border-zinc-700 text-[10px] bg-zinc-800 font-bold">
                                <AvatarFallback className="text-zinc-300">
                                  {getMemberInitials(task.assignee_id)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] text-zinc-400 font-medium">
                                {getMemberName(task.assignee_id)}
                              </span>
                            </div>

                            {/* Due Date Badge */}
                            {task.due_date && (
                              <Badge
                                variant="secondary"
                                className={`text-[10px] flex items-center gap-1 font-medium ${
                                  task.status === 'done'
                                    ? 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-400'
                                    : overdue
                                    ? 'bg-red-950/30 border border-red-900/40 text-red-400 animate-pulse'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {task.status === 'done' ? (
                                  <CheckCircle className="size-3" />
                                ) : overdue ? (
                                  <AlertTriangle className="size-3" />
                                ) : (
                                  <Calendar className="size-3" />
                                )}
                                {formatDueDate(task.due_date)}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* CREATE TASK DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white rounded-xl max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="size-5 text-violet-400" /> Create Task
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Fill in the task details to log it to the team ledger.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="taskTitle" className="text-zinc-300 text-sm font-semibold">
                Task Title
              </Label>
              <Input
                id="taskTitle"
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-violet-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignee" className="text-zinc-300 text-sm font-semibold">
                Assignee
              </Label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === currentMember.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate" className="text-zinc-300 text-sm font-semibold">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus-visible:ring-violet-500"
              />
            </div>

            <DialogFooter className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                {isCreating ? 'Adding Task...' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
