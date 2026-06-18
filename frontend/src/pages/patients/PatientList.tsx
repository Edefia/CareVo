import { useState } from "react"
import { Search, Filter, Plus, FileText, Activity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

import { usePatients } from "@/hooks/usePatients"
import { NewPatientModal } from "./NewPatientModal"

export function PatientList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: patientsResponse, isLoading } = usePatients({ page, limit: 20 })
  
  const patientsData = patientsResponse?.data || patientsResponse
  const patients = patientsData?.items || patientsData?.data || (Array.isArray(patientsData) ? patientsData : [])

  // Client-side filtering for search term
  const filteredPatients = patients.filter((p: any) => {
    const firstName = p.userId?.firstName || ''
    const lastName = p.userId?.lastName || ''
    return `${firstName} ${lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p._id || p.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patients Directory</h2>
          <p className="text-muted-foreground">Manage and view all patient records.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
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
              <form 
                className="relative w-full md:w-64"
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(1)
                }}
              >
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : (
            <>
              <DataTable 
                columns={[
                  { 
                    header: "Patient ID", 
                    cell: (row: any) => <span className="font-mono text-xs">{row._id?.substring(0, 8)}</span> 
                  },
                  { 
                    header: "Name", 
                    cell: (row: any) => {
                      const firstName = row.userId?.firstName || ''
                      const lastName = row.userId?.lastName || ''
                      return <span className="font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate(`/patients/${row._id}`)}>{firstName} {lastName}</span>
                    }
                  },
                  { header: "Gender", cell: (row: any) => <span className="capitalize">{row.gender?.toLowerCase() || "-"}</span> },
                  { 
                    header: "Date of Birth", 
                    cell: (row: any) => row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : "-"
                  },
                  { 
                    header: "Phone", 
                    cell: (row: any) => row.userId?.phone || row.phone || "-" 
                  },
                  { 
                    header: "Risk Level", 
                    cell: (row: any) => row.riskLevel && row.riskLevel !== "PENDING" ? <StatusBadge status={row.riskLevel} /> : <span className="text-muted-foreground">-</span>
                  },
                  { header: "Registered", cell: (row: any) => new Date(row.createdAt).toLocaleDateString() },
                  { 
                    header: "Actions", 
                    cell: (row: any) => (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="View Profile" onClick={() => navigate(`/patients/${row._id}`)}>
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

              {/* Pagination Controls */}
              {patientsData?.totalPages > 1 && (
                <div className="flex items-center justify-between py-4 border-t border-[var(--color-border)] mt-4">
                  <div className="text-sm text-slate-500">
                    Page {page} of {patientsData.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(patientsData.totalPages, p + 1))}
                      disabled={page === patientsData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <NewPatientModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
