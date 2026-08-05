import { useState, useEffect } from "react"
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { dbService } from "@/services/db"
import type { Task, Member } from "@/services/db"
import { getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ListTodo, Plus, ArrowRight } from "lucide-react"

// Draggable Task Card
interface TaskCardProps {
  task: Task
  members: Member[]
}

function TaskCard({ task, members }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : 1,
      }
    : undefined

  const assignee = members.find(m => m.id === task.assignee_id)

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 bg-zinc-950/40 border text-left rounded-lg cursor-grab active:cursor-grabbing hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 group relative select-none ${
        isOverdue ? "border-red-950/80 bg-red-950/5" : "border-zinc-900"
      }`}
    >
      <div className="text-xs font-semibold text-zinc-200">{task.title}</div>
      
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="size-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[8px] text-zinc-400 shrink-0">
            {assignee ? getInitials(assignee.name) : "?"}
          </div>
          <span className="truncate">{assignee?.name || "Unassigned"}</span>
        </div>
        
        {task.due_date && (
          <span className={`shrink-0 ${isOverdue ? "text-red-400 font-bold" : "text-zinc-600"}`}>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}

// Droppable Column
interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  members: Member[]
}

function KanbanColumn({ id, title, tasks, members }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-4 p-4 border border-zinc-900 bg-card/20 min-h-[480px] transition-colors rounded-xl shadow-md ${
        isOver ? "bg-zinc-900/10 border-zinc-700" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          {title} ({tasks.length})
        </h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} members={members} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-16 text-[10px] font-mono text-zinc-600 border border-dashed border-zinc-900/60 rounded-lg">
            No tasks in this stage
          </div>
        )}
      </div>
    </div>
  )
}

// Main Page
export default function TaskLedgerPage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
  })
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  // New task form fields
  const [title, setTitle] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo")

  const loadData = async (wsId: string) => {
    try {
      setLoading(true)
      const workspaceTasks = await dbService.getTasks(wsId)
      const workspaceMembers = await dbService.getMembers(wsId)
      setTasks(workspaceTasks)
      setMembers(workspaceMembers)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(activeWorkspaceId)

    const handleSync = () => {
      const currentId = localStorage.getItem("effrt_current_workspace_id") || "demo-workspace-uuid"
      setActiveWorkspaceId(currentId)
      loadData(currentId)
    }

    const handleCustomChange = (e: any) => {
      if (e.detail) {
        setActiveWorkspaceId(e.detail)
        loadData(e.detail)
      }
    }

    window.addEventListener("effrt_db_sync", handleSync)
    window.addEventListener("effrt_workspace_changed", handleCustomChange)
    
    const unsubscribe = dbService.subscribeToChanges(activeWorkspaceId, () => {
      loadData(activeWorkspaceId)
    })

    return () => {
      window.removeEventListener("effrt_db_sync", handleSync)
      window.removeEventListener("effrt_workspace_changed", handleCustomChange)
      unsubscribe()
    }
  }, [activeWorkspaceId])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as "todo" | "in_progress" | "done"

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistically update
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completed_at: newStatus === "done" ? new Date().toISOString() : null,
            }
          : t
      )
    )

    try {
      const currentMemberId = localStorage.getItem(`effrt_current_member_id_${activeWorkspaceId}`) || "member-mayank-uuid"
      await dbService.updateTaskStatus(activeWorkspaceId, taskId, currentMemberId, newStatus)
      window.dispatchEvent(new CustomEvent("effrt_db_sync"))
    } catch (e) {
      console.error("Failed to drag and update task status:", e)
      loadData(activeWorkspaceId)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const assignedVal = assigneeId === "unassigned" || assigneeId === "" ? null : assigneeId
      const dueVal = dueDate === "" ? null : new Date(dueDate).toISOString()
      
      await dbService.createTask(
        activeWorkspaceId,
        title.trim(),
        assignedVal,
        status,
        dueVal
      )
      
      setTitle("")
      setAssigneeId("")
      setDueDate("")
      setStatus("todo")
      setDialogOpen(false)
      
      loadData(activeWorkspaceId)
      window.dispatchEvent(new CustomEvent("effrt_db_sync"))
    } catch (e) {
      console.error(e)
    }
  }

  const totalTasks = tasks.length
  const completedTasksCount = tasks.filter(t => t.status === "done").length
  const inProgressTasksCount = tasks.filter(t => t.status === "in_progress").length
  const overdueTasksCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      
      {/* Title Header with Add Task Dialog Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <ListTodo className="size-8 text-zinc-400" /> Task Ledger
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Review workspace tasks, assign members, and drag status cards to generate unforgeable proof logs.
          </p>
        </div>

        {/* Create Task Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <Button className="h-10 text-xs font-semibold uppercase bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-lg flex items-center gap-2">
              <Plus className="size-4" /> Create Task
            </Button>
          } />
          <DialogContent className="max-w-md bg-zinc-950 border border-zinc-900 text-zinc-200 rounded-xl p-6 shadow-2xl">
            <DialogHeader className="border-b border-zinc-900/60 pb-3">
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-white">Create Workspace Task</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Task Title</label>
                <Input 
                  placeholder="e.g. Implement layout styling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-zinc-950 border-zinc-900 text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="bg-zinc-950 border border-zinc-900 text-xs h-10 px-3 outline-none focus:border-zinc-700 text-zinc-300 font-mono rounded-lg"
                  >
                    <option value="unassigned">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-900 text-xs h-10 px-3 outline-none focus:border-zinc-700 text-zinc-300 font-mono rounded-lg"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Due Date</label>
                <Input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-zinc-950 border-zinc-900 text-xs h-10 focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono text-zinc-300 rounded-lg"
                />
              </div>

              <Button type="submit" className="w-full h-10 text-xs font-semibold uppercase bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white rounded-lg mt-2 flex items-center justify-center gap-2">
                Submit Task <ArrowRight className="size-3.5" />
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Total Tasks</span>
          <span className="text-2xl font-black text-white font-mono">{totalTasks}</span>
        </div>
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Completed</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{completedTasksCount}</span>
        </div>
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">In Progress</span>
          <span className="text-2xl font-black text-zinc-300 font-mono">{inProgressTasksCount}</span>
        </div>
        <div className="p-4 bg-card/40 border border-zinc-900 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Overdue</span>
          <span className="text-2xl font-black text-red-500 font-mono">{overdueTasksCount}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 font-mono text-zinc-500 text-xs animate-pulse">
          Loading tasks from ledger...
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              id="todo"
              title="To Do"
              tasks={tasks.filter((t) => t.status === "todo")}
              members={members}
            />
            <KanbanColumn
              id="in_progress"
              title="In Progress"
              tasks={tasks.filter((t) => t.status === "in_progress")}
              members={members}
            />
            <KanbanColumn
              id="done"
              title="Done"
              tasks={tasks.filter((t) => t.status === "done")}
              members={members}
            />
          </div>
        </DndContext>
      )}
    </div>
  )
}
