import { StatCard } from "@/components/shared/StatCard"
import { CalendarCheck, FileText, CheckCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function LabAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lab Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage your laboratory's daily operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Bookings" value="24" icon={CalendarCheck} color="blue" />
        <StatCard title="Pending Results Entry" value="12" icon={FileText} color="amber" />
        <StatCard title="Finalized Today" value="8" icon={CheckCircle} color="green" />
        <StatCard title="Active Staff Count" value="5" icon={Users} color="teal" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Booking Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Time", accessorKey: "time" },
              { header: "Patient Name", accessorKey: "patientName" },
              { header: "Package", accessorKey: "packageName" },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { header: "Assigned Staff", accessorKey: "assignedStaff" },
              { 
                header: "Actions", 
                cell: (row) => {
                  if (row.status === "PENDING") {
                    return (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Confirm</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">Cancel</Button>
                      </div>
                    )
                  }
                  if (row.status === "CONFIRMED") {
                    return (
                      <div className="flex gap-2">
                        <Button size="sm">Mark Attended</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">Cancel</Button>
                      </div>
                    )
                  }
                  if (row.status === "ATTENDED") {
                    return <StatusBadge status="Results Entered?" className="bg-blue-50" />
                  }
                  return null
                }
              },
            ]}
            data={[
              { time: "09:00 AM", patientName: "Kwame Mensah", packageName: "Basic Wellness", status: "PENDING", assignedStaff: "-" },
              { time: "09:30 AM", patientName: "Ama Osei", packageName: "Comprehensive", status: "CONFIRMED", assignedStaff: "Sarah Jones" },
              { time: "10:00 AM", patientName: "John Doe", packageName: "Basic Wellness", status: "ATTENDED", assignedStaff: "Michael Smith" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Name", accessorKey: "name" },
              { header: "Role", accessorKey: "role" },
              { header: "Results Entered Today", accessorKey: "resultsEntered" },
              { header: "Last Active", accessorKey: "lastActive" },
            ]}
            data={[
              { name: "Sarah Jones", role: "Lab Tech", resultsEntered: 5, lastActive: "10 mins ago" },
              { name: "Michael Smith", role: "Lab Tech", resultsEntered: 3, lastActive: "Just now" },
            ]}
          />
          <Button variant="link" className="mt-4 px-0">Manage Staff →</Button>
        </CardContent>
      </Card>
    </div>
  )
}
