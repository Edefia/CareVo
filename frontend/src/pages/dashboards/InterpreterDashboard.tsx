import { StatCard } from "@/components/shared/StatCard"
import { useInterpretations } from "@/hooks/useInterpretations"
import { useNavigate } from "react-router-dom"
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function InterpreterDashboard() {
  const navigate = useNavigate()
  const { data: queueDataObj, isLoading } = useInterpretations()
  const queueData = queueDataObj?.items || queueDataObj || []

  const inDraft = Array.isArray(queueData) ? queueData.filter((i: any) => i.status === "DRAFT").length : 0
  const published = Array.isArray(queueData) ? queueData.filter((i: any) => i.status === "FINALIZED").length : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Interpreter Dashboard</h2>
        <p className="text-muted-foreground">Review test results and provide clinical interpretations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned to Me" value={queueData.length.toString()} icon={FileText} color="blue" />
        <StatCard title="In Draft" value={inDraft.toString()} icon={Clock} color="amber" />
        <StatCard title="Published Today" value={published.toString()} icon={CheckCircle} color="green" />
        <StatCard title="Critical Risk" value="0" icon={AlertTriangle} color="red" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results Assigned to Me</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Patient", cell: (row) => row.patientId || "Unknown" },
              { header: "Result ID", cell: (row) => row.resultId || "Unknown" },
              { header: "Assigned Date", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
              { header: "Last Updated", cell: (row) => new Date(row.updatedAt).toLocaleDateString() },
              { 
                header: "Priority", 
                cell: (row) => (
                  <div className="flex items-center space-x-2">
                    {row.priority === "URGENT" && (
                      <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                    )}
                    <StatusBadge status={row.priority} />
                  </div>
                )
              },
              { 
                header: "Risk Level", 
                cell: (row) => <span className="text-muted-foreground text-xs">-</span>
              },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Action", 
                cell: (row) => <Button size="sm" onClick={() => navigate(`/interpretations/${row._id || row.id}`)}>Open & Interpret</Button>
              },
            ]}
            data={queueData}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
