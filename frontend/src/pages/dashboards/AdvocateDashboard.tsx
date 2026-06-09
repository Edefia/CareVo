import { StatCard } from "@/components/shared/StatCard"
import { Users, AlertCircle, Activity, CheckSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function AdvocateDashboard() {
  const patientData = [
    { patientName: "Kwame Mensah", lastResult: "Oct 12, 2023", riskLevel: "HIGH", lastContact: "Oct 15, 2023", nextFollowUp: "Oct 20, 2023", isOverdue: true },
    { patientName: "Ama Osei", lastResult: "Oct 14, 2023", riskLevel: "MODERATE", lastContact: "Oct 16, 2023", nextFollowUp: "Oct 25, 2023", isOverdue: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Advocate Dashboard</h2>
        <p className="text-muted-foreground">Manage your patients and follow-up tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Patients" value="45" icon={Users} color="blue" />
        <StatCard title="Overdue Follow-ups" value="3" icon={AlertCircle} color="red" />
        <StatCard title="Active Tasks" value="12" icon={Activity} color="amber" />
        <StatCard title="Completed This Week" value="8" icon={CheckSquare} color="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patients Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={[
                { header: "Patient Name", accessorKey: "patientName" },
                { header: "Last Result", accessorKey: "lastResult" },
                { 
                  header: "Risk Level", 
                  cell: (row) => <StatusBadge status={row.riskLevel} />
                },
                { header: "Last Contact", accessorKey: "lastContact" },
                { 
                  header: "Next Follow-up", 
                  cell: (row) => (
                    <span className={row.isOverdue ? "text-red-500 font-medium" : ""}>
                      {row.nextFollowUp}
                    </span>
                  )
                },
                { 
                  header: "Action", 
                  cell: () => (
                    <div className="flex gap-2">
                      <Button size="sm">Log Interaction</Button>
                      <Button size="sm" variant="outline">Profile</Button>
                    </div>
                  )
                },
              ]}
              data={patientData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Board Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="font-medium">TO DO</div>
                <div className="text-xl font-bold">5</div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                <div className="font-medium">IN PROGRESS</div>
                <div className="text-xl font-bold">7</div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <div className="font-medium">COMPLETED</div>
                <div className="text-xl font-bold">8</div>
              </div>
            </div>
            <Button className="w-full mt-6" variant="outline">Open Task Board →</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
