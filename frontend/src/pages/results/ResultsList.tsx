import { useState } from "react"
import { Search, Filter, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

const mockResults = [
  { id: "RES-2023-1029", patient: "Kwame Mensah", package: "Basic Wellness", date: "2023-10-12", status: "FINALIZED", lab: "Accra Central", risk: "HIGH" },
  { id: "RES-2023-1030", patient: "Ama Osei", package: "Comprehensive", date: "2023-10-14", status: "SUBMITTED", lab: "Kumasi Diagnostic", risk: "PENDING" },
  { id: "RES-2023-1031", patient: "John Doe", package: "Lipid Profile", date: "2023-10-15", status: "DRAFT", lab: "Accra Central", risk: "PENDING" },
]

export function ResultsList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredResults = mockResults.filter(res => 
    res.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Test Results</h2>
          <p className="text-muted-foreground">View and manage all laboratory test results.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Results Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by ID or Patient..." 
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
              { header: "Result ID", accessorKey: "id" },
              { header: "Patient Name", accessorKey: "patient" },
              { header: "Package", accessorKey: "package" },
              { header: "Laboratory", accessorKey: "lab" },
              { header: "Test Date", accessorKey: "date" },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Risk", 
                cell: (row) => row.risk !== "PENDING" ? <StatusBadge status={row.risk} /> : <span className="text-muted-foreground">-</span>
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="View Details" onClick={() => navigate(`/results/${row.id}`)}>
                      <FileText className="h-4 w-4 text-blue-600" />
                    </Button>
                    {row.status === "FINALIZED" && (
                      <Button variant="ghost" size="icon" title="Download PDF">
                        <Download className="h-4 w-4 text-slate-600" />
                      </Button>
                    )}
                  </div>
                )
              },
            ]}
            data={filteredResults}
          />
        </CardContent>
      </Card>
    </div>
  )
}
