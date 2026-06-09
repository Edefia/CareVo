import { StatCard } from "@/components/shared/StatCard"
import { Users, Building2, FileText, Receipt } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

const mockRevenueData = Array.from({ length: 7 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 5000) + 1000,
}))

const mockRiskData = [
  { name: "Low", value: 450, color: "#16A34A" },
  { name: "Moderate", value: 200, color: "#D97706" },
  { name: "High", value: 100, color: "#EA580C" },
  { name: "Critical", value: 50, color: "#DC2626" },
]

export function PlatformAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Admin Dashboard</h2>
        <p className="text-muted-foreground">Monitor platform performance and pending work.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value="12,345" icon={Users} color="blue" />
        <StatCard title="Active Labs" value="45" icon={Building2} color="teal" />
        <StatCard title="Unpaid Invoices" value="GHS 45,230" icon={Receipt} color="red" />
        <StatCard title="Pending Interpretations" value="156" icon={FileText} color="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue This Month (GHS)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="revenue" fill="#1E4E79" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockRiskData.map((entry, index) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Results Awaiting Interpretation</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { header: "Patient", accessorKey: "patient" },
              { header: "Laboratory", accessorKey: "laboratory" },
              { header: "Test Date", accessorKey: "testDate" },
              { 
                header: "Days Waiting", 
                cell: (row) => (
                  <span className={row.daysWaiting > 3 ? "text-red-500 font-medium" : ""}>
                    {row.daysWaiting}
                  </span>
                )
              },
              { 
                header: "Priority", 
                cell: (row) => <StatusBadge status={row.priority} />
              },
              { 
                header: "Action", 
                cell: () => <Button size="sm">Assign</Button>
              },
            ]}
            data={[
              { patient: "Kwame Mensah", laboratory: "Accra Central", testDate: "Oct 12, 2023", daysWaiting: 4, priority: "URGENT" },
              { patient: "Ama Osei", laboratory: "Kumasi Diagnostic", testDate: "Oct 14, 2023", daysWaiting: 2, priority: "NORMAL" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
