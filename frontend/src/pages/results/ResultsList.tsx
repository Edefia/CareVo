import { useState } from "react"
import { Search, Filter, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

import { useResults } from "@/hooks/useResults"



export function ResultsList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const { data: resultsData, isLoading } = useResults()
  const results = resultsData?.items || resultsData || []

  const filteredResults = Array.isArray(results) ? results.filter((res: any) => 
    (res.patientId || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (res._id || res.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

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
              { header: "Result ID", cell: (row) => row._id || row.id },
              { header: "Patient ID", cell: (row) => row.patientId || "Unknown" },
              { header: "Booking/Package", cell: (row) => row.bookingId || "Unknown" },
              { header: "Laboratory", cell: (row) => row.laboratoryId || "Unknown" },
              { header: "Test Date", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Biomarkers", 
                cell: (row) => <span>{row.biomarkers?.length || 0} entered</span>
              },
              { 
                header: "Actions", 
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="View Details" onClick={() => navigate(`/results/${row._id || row.id}`)}>
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
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
