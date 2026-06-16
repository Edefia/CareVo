import { StatCard } from "@/components/shared/StatCard"
import { Users, Building2, FileText, Receipt } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"

const mockRegistrationData = Array.from({ length: 30 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  count: Math.floor(Math.random() * 50) + 10,
}))

const mockStatusData = [
  { name: "Draft", value: 400, color: "#9ca3af" },
  { name: "Finalized", value: 300, color: "#3b82f6" },
  { name: "Submitted", value: 300, color: "#f59e0b" },
  { name: "Interpreted", value: 200, color: "#14b8a6" },
  { name: "Released", value: 100, color: "#22c55e" },
]

export function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of the entire CareVo Health platform.</p>
      </div>

      {/* Section 1 - Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value="12,345" icon={Users} color="blue" />
        <StatCard title="Laboratories" value="48" icon={Building2} color="teal" />
        <StatCard title="Pending Interps." value="156" icon={FileText} color="amber" />
        <StatCard title="Unpaid Invoices" value="GHS 45,230" icon={Receipt} color="red" />
      </div>

      {/* Section 2 - Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Registrations (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRegistrationData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E4E79" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1E4E79" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#1E4E79" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Results by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3 - Tables Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <DataTable 
              columns={[
                { header: "Timestamp", accessorKey: "timestamp" },
                { header: "Actor", accessorKey: "actor" },
                { header: "Action", accessorKey: "action" },
              ]}
              data={[
                { timestamp: "2 mins ago", actor: "Admin User", action: "Updated Lab Settings" },
                { timestamp: "5 mins ago", actor: "System", action: "Daily Backup" },
              ]}
            />
            <Button variant="ghost" className="mt-4 px-0 underline text-blue-600 hover:bg-transparent">View all audit logs →</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Laboratories</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <DataTable 
              columns={[
                { header: "Name", accessorKey: "name" },
                { header: "Location", accessorKey: "location" },
                { header: "Status", accessorKey: "status" },
              ]}
              data={[
                { name: "Accra Central Lab", location: "Accra", status: "Active" },
                { name: "Kumasi Diagnostic Center", location: "Kumasi", status: "Active" },
              ]}
            />
            <Button variant="ghost" className="mt-4 px-0 underline text-blue-600 hover:bg-transparent">View all laboratories →</Button>
          </CardContent>
        </Card>
      </div>

      {/* Section 4 - Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline">Invite Staff</Button>
        <Button variant="outline">Register Laboratory</Button>
        <Button variant="outline">View Audit Logs</Button>
        <Button variant="outline">Analytics</Button>
      </div>
    </div>
  )
}
