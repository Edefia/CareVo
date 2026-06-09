import { StatCard } from "@/components/shared/StatCard"
import { FileText, CheckCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"

export function LabStaffDashboard() {
  const pendingData = [
    { patientName: "John Doe", dob: "1980-05-15", package: "Basic Wellness", bookingTime: "09:00 AM", status: "DRAFT" },
    { patientName: "Jane Smith", dob: "1992-11-20", package: "Comprehensive", bookingTime: "10:30 AM", status: "DRAFT" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lab Staff Dashboard</h2>
        <p className="text-muted-foreground">Enter results for attended patients.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="My Pending Queue" value="2" icon={FileText} color="amber" />
        <StatCard title="Finalized Today" value="5" icon={CheckCircle} color="green" />
        <StatCard title="Patients Seen Today" value="7" icon={Users} color="blue" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patients Awaiting Results Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingData.length === 0 ? (
            <EmptyState 
              icon={CheckCircle} 
              title="All Caught Up" 
              description="No pending results. You are all caught up." 
            />
          ) : (
            <DataTable 
              columns={[
                { header: "Patient Name", accessorKey: "patientName" },
                { header: "Date of Birth", accessorKey: "dob" },
                { header: "Package", accessorKey: "package" },
                { header: "Booking Time", accessorKey: "bookingTime" },
                { 
                  header: "Status", 
                  cell: (row) => <StatusBadge status={row.status} />
                },
                { 
                  header: "Action", 
                  cell: () => <Button size="sm">Enter Results</Button>
                },
              ]}
              data={pendingData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
