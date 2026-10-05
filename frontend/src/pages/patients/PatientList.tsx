import { useState } from "react"
import { Search, Filter, Plus, FileText, Activity, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate, useLocation } from "react-router-dom"
import { usePatients } from "@/hooks/usePatients"
import { NewPatientModal } from "./NewPatientModal"

export function PatientList() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLab = location.pathname.startsWith('/lab')
  const patientBasePath = isLab ? '/lab/patients' : '/patients'

  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: patientsResponse, isLoading } = usePatients({ page, limit: 20 })
  
  const patientsData = patientsResponse?.data || patientsResponse
  const patients = patientsData?.items || patientsData?.data || (Array.isArray(patientsData) ? patientsData : [])

  const filteredPatients = patients.filter((p: any) => {
    const firstName = p.userId?.firstName || ''
    const lastName = p.userId?.lastName || ''
    return `${firstName} ${lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p._id || p.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] md:text-[22px] font-bold text-[var(--color-lims-text)] font-sans tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--color-lims-accent)]" />
            Patients Directory
          </h2>
          <p className="text-[13px] text-[var(--color-lims-text-muted)] mt-1">Manage and view all patient records.</p>
        </div>
        <Button 
          className="bg-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent)]/90 text-white shadow-sm flex items-center gap-2 h-9 text-[13px] px-4" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-4 md:px-6 md:py-4 border-b border-[var(--color-lims-border)] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-[15px] font-bold text-[var(--color-lims-text)] font-sans">
            All Patients
          </h3>
          <div className="flex items-center gap-2">
            <form 
              className="relative w-full md:w-64"
              onSubmit={(e) => {
                e.preventDefault()
                setPage(1)
              }}
            >
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search patients..." 
                className="w-full h-9 pl-9 pr-4 text-[13px] bg-white border border-[var(--color-lims-border)] rounded-md focus:outline-none focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[var(--color-lims-border)] text-gray-500 hover:text-[var(--color-lims-accent)] shadow-sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center flex-col text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-lims-accent)] mb-2" />
              <span className="text-[12px]">Loading patients...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable 
                columns={[
                  { 
                    header: "Patient ID", 
                    cell: (row: any) => <span className="font-mono text-[12px] font-medium text-[var(--color-lims-text-muted)] bg-gray-100 px-1.5 py-0.5 rounded">PT-{String(row._id || row.id).slice(-6).toUpperCase()}</span> 
                  },
                  { 
                    header: "Name", 
                    cell: (row: any) => {
                      const firstName = row.userId?.firstName || ''
                      const lastName = row.userId?.lastName || ''
                      return <span className="text-[13px] font-semibold text-[var(--color-lims-text)] hover:text-[var(--color-lims-accent)] cursor-pointer transition-colors" onClick={() => navigate(`${patientBasePath}/${row._id}`)}>{firstName} {lastName}</span>
                    }
                  },
                  { header: "Gender", cell: (row: any) => <span className="capitalize text-[13px] text-[var(--color-lims-text)]">{row.gender?.toLowerCase() || "-"}</span> },
                  { 
                    header: "Date of Birth", 
                    cell: (row: any) => <span className="text-[13px] text-[var(--color-lims-text)]">{row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : "-"}</span>
                  },
                  { 
                    header: "Phone", 
                    cell: (row: any) => <span className="text-[13px] text-[var(--color-lims-text)]">{row.userId?.phone || row.phone || "-"}</span> 
                  },
                  { 
                    header: "Risk Level", 
                    cell: (row: any) => row.riskLevel && row.riskLevel !== "PENDING" ? <StatusBadge status={row.riskLevel} /> : <span className="text-gray-400">-</span>
                  },
                  { header: "Registered", cell: (row: any) => <span className="text-[13px] text-[var(--color-lims-text-muted)]">{new Date(row.createdAt).toLocaleDateString()}</span> },
                  { 
                    header: "Actions", 
                    cell: (row: any) => (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent)]/10" title="View Profile" onClick={() => navigate(`${patientBasePath}/${row._id}`)}>
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="View Results" onClick={() => navigate(`${patientBasePath}/${row._id}`)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  },
                ]}
                data={filteredPatients}
              />

              {/* Pagination Controls */}
              {patientsData?.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-[var(--color-lims-border)] bg-gray-50/30">
                  <div className="text-[12px] text-[var(--color-lims-text-muted)] font-medium">
                    Page {page} of {patientsData.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[12px] border-[var(--color-lims-border)] text-[var(--color-lims-text)] shadow-sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[12px] border-[var(--color-lims-border)] text-[var(--color-lims-text)] shadow-sm"
                      onClick={() => setPage(p => Math.min(patientsData.totalPages, p + 1))}
                      disabled={page === patientsData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NewPatientModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
