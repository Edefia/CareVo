
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Activity, FileText, Clock, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { usePatient, usePatientResults, usePatientNotes } from "@/hooks/usePatients"
import { EditPatientModal } from "./EditPatientModal"

import { useAuthStore } from "@/store/auth"

export function PatientProfile() {
  const { user } = useAuthStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: patientResponse, isLoading } = usePatient(id!)
  const { data: resultsResponse } = usePatientResults(id!)
  const { data: notesResponse } = usePatientNotes(id!)
  
  const patientData = patientResponse?.data || patientResponse
  const history = resultsResponse?.data || resultsResponse || []
  const notes = notesResponse?.data || notesResponse || []

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-forest)]" />
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Patient Not Found</h2>
        <Button onClick={() => navigate('/patients')} className="mt-4">Back to Directory</Button>
      </div>
    )
  }

  const fullName = `${patientData.userId?.firstName || patientData.user?.firstName || ""} ${patientData.userId?.lastName || patientData.user?.lastName || ""}`.trim()
  const phone = patientData.userId?.phone || patientData.user?.phone || patientData.phone || "-"
  const email = patientData.userId?.email || patientData.user?.email || patientData.email || "-"

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto animate-fade-in-up pb-[96px]">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-[var(--color-surface-2)]">
            <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </Button>
          <div>
            <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-1">
              {fullName || "Patient Profile"}
            </h1>
            <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
              Patient ID: <span className="font-mono text-[var(--color-text-primary)]">
                PT-{String(patientData._id || patientData.id).slice(-6).toUpperCase()}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {user?.role !== 'INTERPRETER' && (
            <Button variant="outline" className="gap-2 border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="font-medium">Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-[32px] lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Demographics & Risk */}
        <div className="space-y-[24px]">
          {/* Patient Information Card */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-[18px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-center gap-2">
              <h2 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)]">Patient Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-[13px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Contact</div>
                <div className="font-medium text-[var(--color-text-primary)] text-[15px]">{phone}</div>
                <div className="font-medium text-[var(--color-text-secondary)] text-[14px]">{email}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[13px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Gender</div>
                  <div className="font-medium text-[var(--color-text-primary)] text-[15px] capitalize">{patientData.gender || "-"}</div>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">DOB</div>
                  <div className="font-medium text-[var(--color-text-primary)] text-[15px]">
                    {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : "-"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[13px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Address</div>
                <div className="font-medium text-[var(--color-text-primary)] text-[15px]">
                  {patientData.address?.street ? `${patientData.address.street}, ${patientData.address.city}` : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Health Status Card */}
          <div className="bg-[#F0FDF4] rounded-[var(--radius-xl)] border border-[#16A34A]/20 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-[#16A34A]/20 shrink-0 shadow-sm">
              <Activity className="h-6 w-6 text-[#16A34A]" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-[var(--color-text-primary)] text-lg">Health Status</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                {patientData.riskLevel && patientData.riskLevel !== "PENDING" ? (
                  <>Current assessed risk: <StatusBadge status={patientData.riskLevel} /></>
                ) : (
                  "Awaiting enough data for a comprehensive health assessment."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: History & Notes */}
        <div className="space-y-[32px]">
          
          {/* Test History Card */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-[18px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-lime)]/20 shadow-sm shrink-0">
                  <FileText className="h-4 w-4 text-[var(--color-forest)]" />
                </div>
                Test History
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-gray-50/30">
                    <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                    <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Package</th>
                    <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Laboratory</th>
                    <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? history.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/50 transition-colors">
                      <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-text-secondary)]">
                        {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] font-medium text-[var(--color-text-primary)]">
                        {item.package || "-"}
                      </td>
                      <td className="px-[24px] py-[16px] text-[14px] text-[var(--color-text-secondary)]">
                        {item.lab || "-"}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <StatusBadge status={item.status || "PENDING"} />
                      </td>
                      <td className="px-[24px] py-[16px] text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[var(--color-forest)] hover:text-[var(--color-forest-mid)] hover:bg-[var(--color-lime)]/20 font-medium"
                          onClick={() => {
                            if (user?.role === 'INTERPRETER') {
                              navigate(`/interpreter/editor/${item.referralCode || item._id}`)
                            } else {
                              toast.info("Detailed results view coming soon")
                            }
                          }}
                        >
                          {user?.role === 'INTERPRETER' ? "Review Results" : "View Results"}
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-[24px] py-[64px] text-center">
                        <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                          <div className="h-14 w-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="font-medium text-[16px] text-[var(--color-text-secondary)]">No test history</p>
                          <p className="text-[14px] mt-1">This patient has no recorded test history yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Interpretations Card */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-[18px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 shadow-sm shrink-0">
                  <Activity className="h-4 w-4 text-orange-500" />
                </div>
                Clinical Interpretations
              </h2>
            </div>
            <div className="p-6">
              {notes.length > 0 ? (
                <div className="space-y-6">
                  {notes.map((note: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx !== notes.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-[var(--color-border)]"></div>
                      )}
                      
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[var(--color-border)] shadow-sm">
                        {note.author === "System" ? (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-[var(--color-forest)]" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-bold text-[var(--color-text-primary)]">{note.author || "Clinical Interpreter"}</p>
                          <div className="flex items-center text-[12px] font-medium text-[var(--color-text-muted)]">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            {note.date ? new Date(note.date).toLocaleDateString() : "Unknown Date"}
                          </div>
                        </div>
                        <p className="text-[14px] text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] p-4 rounded-lg border border-[var(--color-border)] mt-2 leading-relaxed">
                          {note.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)] py-8">
                  <Activity className="h-10 w-10 mb-3 opacity-20" />
                  <p className="font-medium text-[15px] text-[var(--color-text-secondary)]">No clinical notes</p>
                  <p className="text-[14px] mt-1">No interpretations or notes have been recorded.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <EditPatientModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} patient={patientData} />
    </div>
  )
}
