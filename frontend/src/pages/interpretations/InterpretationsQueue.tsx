import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

const mockQueue = [
  { id: "INT-1029", patient: "Kwame Mensah", package: "Basic Wellness", submitted: "2 hours ago", status: "SUBMITTED", priority: "URGENT" },
  { id: "INT-1030", patient: "Ama Osei", package: "Comprehensive", submitted: "1 day ago", status: "IN_PROGRESS", priority: "NORMAL" },
  { id: "INT-1031", patient: "John Doe", package: "Lipid Profile", submitted: "2 days ago", status: "DRAFT", priority: "NORMAL" },
]

export function InterpretationsQueue() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredQueue = mockQueue.filter(item => 
    item.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interpretations Queue</h2>
          <p className="text-muted-foreground">Manage and process pending clinical interpretations.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Assigned Results</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search queue..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "ID", accessorKey: "id" },
              { header: "Patient Name", accessorKey: "patient" },
              { header: "Package", accessorKey: "package" },
              { header: "Submitted", accessorKey: "submitted" },
              { 
                header: "Priority", 
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    {row.priority === "URGENT" && <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>}
                    <StatusBadge status={row.priority} />
                  </div>
                )
              },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <Button size="sm" onClick={() => navigate(`/interpretations/${row.id}`)}>
                    {row.status === "DRAFT" || row.status === "IN_PROGRESS" ? "Continue" : "Start"}
                  </Button>
                )
              },
            ]}
            data={filteredQueue}
          />
        </CardContent>
      </Card>
    </div>
  )
}
