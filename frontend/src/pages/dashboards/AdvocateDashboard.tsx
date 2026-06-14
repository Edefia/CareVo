import { StatCard } from "@/components/shared/StatCard"
import { usePatients } from "@/hooks/usePatients"
import { useResults } from "@/hooks/useResults"
import { Users, AlertCircle, Activity, CheckSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function AdvocateDashboard() {
  const { data: patientsData } = usePatients()
  const patients = patientsData?.items || patientsData || []

  const { data: resultsData } = useResults()
  const results = resultsData?.items || resultsData || []

  // Combine patients with their latest results (simulated since there is no specific advocacy endpoint right now)
  const patientData = Array.isArray(patients) ? patients.map((p: any) => {
    const patientResults = Array.isArray(results) ? results.filter((r: any) => r.patientId === p._id || r.patientId === p.id) : []
    const lastResult = patientResults[0]
    return {
      id: p._id || p.id,
      patientName: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : "Unknown",
      lastResult: lastResult ? new Date(lastResult.createdAt).toLocaleDateString() : "No Results",
      riskLevel: "PENDING", // Real risk level would come from interpretation
      lastContact: "Not contacted",
      nextFollowUp: "Not set",
      isOverdue: false
    }
  }) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Advocate Dashboard</h2>
        <p className="text-muted-foreground">Manage your patients and follow-up tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Patients" value={patients.length.toString()} icon={Users} color="blue" />
        <StatCard title="Overdue Follow-ups" value="0" icon={AlertCircle} color="red" />
        <StatCard title="Active Tasks" value="0" icon={Activity} color="amber" />
        <StatCard title="Completed This Week" value="0" icon={CheckSquare} color="green" />
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
                <div className="text-xl font-bold">0</div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                <div className="font-medium">IN PROGRESS</div>
                <div className="text-xl font-bold">0</div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <div className="font-medium">COMPLETED</div>
                <div className="text-xl font-bold">0</div>
              </div>
            </div>
            <Button className="w-full mt-6" variant="outline">Open Task Board →</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
