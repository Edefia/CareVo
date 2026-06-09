import { useState } from "react"
import { Search, Plus, User, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/StatusBadge"

const mockTasks = [
  { id: "TSK-001", title: "Follow up on elevated HbA1c", patient: "Kwame Mensah", due: "Today", status: "TODO", priority: "HIGH" },
  { id: "TSK-002", title: "Discuss weight management plan", patient: "Ama Osei", due: "Tomorrow", status: "TODO", priority: "NORMAL" },
  { id: "TSK-003", title: "Schedule follow-up lipid profile", patient: "John Doe", due: "Next Week", status: "IN_PROGRESS", priority: "NORMAL" },
  { id: "TSK-004", title: "Send dietary recommendations", patient: "Jane Smith", due: "Overdue", status: "DONE", priority: "LOW" },
]

export function TaskBoard() {
  const [searchTerm, setSearchTerm] = useState("")

  const columns = [
    { id: "TODO", label: "To Do" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "DONE", label: "Completed" },
  ]

  const getFilteredTasksByStatus = (status: string) => {
    return mockTasks.filter(t => 
      t.status === status && 
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.patient.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advocacy Task Board</h2>
          <p className="text-muted-foreground">Manage patient interactions and follow-ups.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="w-80 shrink-0 flex flex-col rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border overflow-hidden">
            <div className="p-4 border-b bg-muted/30 font-semibold flex justify-between items-center">
              {column.label}
              <span className="bg-background text-xs px-2 py-1 rounded-full border shadow-sm">
                {getFilteredTasksByStatus(column.id).length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {getFilteredTasksByStatus(column.id).map(task => (
                <div key={task.id} className="bg-card p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={task.priority} />
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2">
                      <span className="sr-only">Menu</span>
                      ...
                    </Button>
                  </div>
                  <h4 className="font-medium text-sm leading-snug mb-3">{task.title}</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <User className="mr-2 h-3 w-3" />
                      {task.patient}
                    </div>
                    <div className={`flex items-center ${task.due === 'Overdue' ? 'text-red-500 font-medium' : ''}`}>
                      {task.due === 'Overdue' ? <AlertCircle className="mr-2 h-3 w-3" /> : <Clock className="mr-2 h-3 w-3" />}
                      Due: {task.due}
                    </div>
                  </div>
                </div>
              ))}
              {getFilteredTasksByStatus(column.id).length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
