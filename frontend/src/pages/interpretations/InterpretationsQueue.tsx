import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

import { useInterpretations } from "@/hooks/useInterpretations"



export function InterpretationsQueue() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const { data: queueData, isLoading } = useInterpretations()
  const queue = queueData?.items || queueData || []

  const filteredQueue = Array.isArray(queue) ? queue.filter((item: any) => {
    const patientName = item.patientId?.userId ? `${item.patientId.userId.firstName} ${item.patientId.userId.lastName}` : "";
    const referralCode = item.resultId?.referralCode || "";
    const term = searchTerm.toLowerCase();
    
    return patientName.toLowerCase().includes(term) || 
           referralCode.toLowerCase().includes(term) ||
           (item._id || item.id || "").toLowerCase().includes(term);
  }) : []

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
              { 
                header: "Referral Code", 
                cell: (row) => <span className="font-mono font-medium text-[var(--color-forest)] bg-[var(--color-lime)]/20 px-2 py-1 rounded">{row.resultId?.referralCode || row.id?.substring(0,8)}</span> 
              },
              { 
                header: "Patient", 
                cell: (row) => {
                  const patient = row.patientId?.userId;
                  return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown"
                } 
              },
              { 
                header: "Package", 
                cell: (row) => <span className="font-medium">{row.resultId?.panelName || "Unknown"}</span> 
              },
              { 
                header: "Laboratory", 
                cell: (row) => <span className="text-muted-foreground">{row.resultId?.laboratoryId?.name || "Unknown"}</span> 
              },
              { 
                header: "Submitted", 
                cell: (row) => new Date(row.createdAt).toLocaleDateString() 
              },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <Button size="sm" onClick={() => navigate(`/interpretations/${row._id || row.id}`)}>
                    {row.status === "DRAFT" || row.status === "IN_PROGRESS" ? "Continue" : "View"}
                  </Button>
                )
              },
            ]}
            data={filteredQueue}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
