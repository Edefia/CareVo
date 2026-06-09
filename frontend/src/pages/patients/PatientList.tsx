import { useState } from "react"
import { Search, Filter, Plus, FileText, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

const mockPatients = [
  { id: "PAT-001", name: "Kwame Mensah", gender: "Male", dob: "1980-05-15", phone: "+233 24 123 4567", riskLevel: "HIGH", lastVisit: "2023-10-12" },
  { id: "PAT-002", name: "Ama Osei", gender: "Female", dob: "1992-11-20", phone: "+233 20 987 6543", riskLevel: "LOW", lastVisit: "2023-10-14" },
  { id: "PAT-003", name: "John Doe", gender: "Male", dob: "1975-03-08", phone: "+233 55 555 5555", riskLevel: "MODERATE", lastVisit: "2023-09-28" },
  { id: "PAT-004", name: "Jane Smith", gender: "Female", dob: "1988-07-22", phone: "+233 24 444 4444", riskLevel: "PENDING", lastVisit: "2023-10-18" },
]

export function PatientList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patients Directory</h2>
          <p className="text-muted-foreground">Manage and view all patient records.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Patients</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients..." 
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
              { header: "Patient ID", accessorKey: "id" },
              { 
                header: "Name", 
                cell: (row) => <span className="font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate(`/patients/${row.id}`)}>{row.name}</span>
              },
              { header: "Gender", accessorKey: "gender" },
              { header: "Date of Birth", accessorKey: "dob" },
              { header: "Phone", accessorKey: "phone" },
              { 
                header: "Risk Level", 
                cell: (row) => row.riskLevel !== "PENDING" ? <StatusBadge status={row.riskLevel} /> : <span className="text-muted-foreground">-</span>
              },
              { header: "Last Visit", accessorKey: "lastVisit" },
              { 
                header: "Actions", 
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="View Profile" onClick={() => navigate(`/patients/${row.id}`)}>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" title="View Results">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                )
              },
            ]}
            data={filteredPatients}
          />
        </CardContent>
      </Card>
    </div>
  )
}
