import { StatCard } from "@/components/shared/StatCard"
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function InterpreterDashboard() {
  const queueData = [
    { patient: "Kwame Mensah", lab: "Accra Central", testDate: "Oct 12, 2023", submitted: "2 days ago", priority: "URGENT", riskLevel: "HIGH", status: "IN_PROGRESS" },
    { patient: "Ama Osei", lab: "Kumasi Diagnostic", testDate: "Oct 14, 2023", submitted: "1 day ago", priority: "NORMAL", riskLevel: "PENDING", status: "SUBMITTED" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Interpreter Dashboard</h2>
        <p className="text-muted-foreground">Review test results and provide clinical interpretations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned to Me" value="12" icon={FileText} color="blue" />
        <StatCard title="In Draft" value="3" icon={Clock} color="amber" />
        <StatCard title="Published Today" value="8" icon={CheckCircle} color="green" />
        <StatCard title="Critical Risk" value="1" icon={AlertTriangle} color="red" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results Assigned to Me</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Patient", accessorKey: "patient" },
              { header: "Lab", accessorKey: "lab" },
              { header: "Test Date", accessorKey: "testDate" },
              { header: "Submitted", accessorKey: "submitted" },
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
                cell: (row) => row.riskLevel !== "PENDING" ? <StatusBadge status={row.riskLevel} /> : <span className="text-muted-foreground text-xs">-</span>
              },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Action", 
                cell: () => <Button size="sm">Open & Interpret</Button>
              },
            ]}
            data={queueData}
          />
        </CardContent>
      </Card>
    </div>
  )
}
