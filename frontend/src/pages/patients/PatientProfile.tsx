import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { 
  ArrowLeft, 
  Activity, 
  FileText, 
  Clock, 
  AlertCircle, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  TestTube, 
  CheckCircle2, 
  MessageSquare, 
  Send,
  Building2,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { usePatient, usePatientResults, usePatientNotes, useCreatePatientNote } from "@/hooks/usePatients"
import { useAuthStore } from "@/store/auth"
import toast from "react-hot-toast"

export function PatientProfile() {
  const { user } = useAuthStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const isLab = location.pathname.startsWith('/lab') || user?.role === 'LABORATORY'
  const backPath = isLab ? '/lab/patients' : '/patients'

  const { data: patientResponse, isLoading } = usePatient(id!)
  const { data: resultsResponse } = usePatientResults(id!)
  const { data: notesResponse } = usePatientNotes(id!)
  const createNoteMutation = useCreatePatientNote()

  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState("")

  const patientData = patientResponse?.data || patientResponse
  const history: any[] = resultsResponse?.data || resultsResponse || []
  const notes: any[] = notesResponse?.data || notesResponse || []

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-forest)]" />
        <span className="text-sm font-medium text-slate-500">Retrieving patient records...</span>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-800 mb-2">Patient Record Not Found</h2>
        <p className="text-slate-500 max-w-sm mb-8">
          The requested patient record could not be retrieved or may have been archived securely.
        </p>
        <Button onClick={() => navigate(backPath)} className="bg-[var(--color-forest)] hover:bg-[var(--color-forest-dark)] text-white rounded-full px-8 h-12">
          Return to Directory
        </Button>
      </div>
    )
  }

  const firstName = patientData.userId?.firstName || patientData.user?.firstName || ""
  const lastName = patientData.userId?.lastName || patientData.user?.lastName || ""
  const fullName = `${firstName} ${lastName}`.trim() || "Patient Profile"
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "PT"
  const phone = patientData.userId?.phone || patientData.user?.phone || patientData.phone || "-"
  const email = patientData.userId?.email || patientData.user?.email || patientData.email || "-"
  const patientCode = `PT-${String(patientData._id || patientData.id).slice(-6).toUpperCase()}`

  let ageText = ""
  if (patientData.dateOfBirth) {
    const dob = new Date(patientData.dateOfBirth)
    const diffMs = Date.now() - dob.getTime()
    const ageDt = new Date(diffMs)
    const age = Math.abs(ageDt.getUTCFullYear() - 1970)
    if (!isNaN(age)) {
      ageText = `${age} yrs`
    }
  }

  const completedCount = history.filter(
    (h: any) => h.status === 'COMPLETED' || h.status === 'FINAL' || h.status === 'RELEASED'
  ).length

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) {
      toast.error("Please enter a note before submitting")
      return
    }

    try {
      await createNoteMutation.mutateAsync({
        id: patientData._id || patientData.id,
        note: {
          note: newNoteText.trim(),
          author: user?.role === 'LABORATORY' 
            ? 'Laboratory Staff' 
            : (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Clinical Staff'),
        }
      })
      toast.success("Clinical note added successfully")
      setNewNoteText("")
      setIsAddingNote(false)
    } catch {
      toast.error("Failed to add clinical note")
    }
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 font-sans animate-in fade-in duration-500">
      
      {/* ─────────────────────────────────────────────────────────────
          PREMIUM HEADER AREA
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(backPath)} 
            className="mb-6 -ml-3 text-slate-500 hover:text-[var(--color-forest)] hover:bg-slate-100/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
          </Button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Clinical Profile
            </h1>
            <span className="font-mono text-sm font-semibold text-[var(--color-forest)] bg-[var(--color-lime-light)] px-3 py-1 rounded-full border border-[var(--color-lime)]">
              {patientCode}
            </span>
          </div>
          <p className="text-slate-500 text-lg">Comprehensive patient history and diagnostic records.</p>
        </div>

        <div className="flex items-center gap-3">
          {isLab && (
            <Button
              onClick={() => navigate('/lab/dashboard')}
              className="h-12 px-6 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-[var(--color-forest)] shadow-sm font-medium transition-all"
            >
              <TestTube className="h-4 w-4 mr-2" /> Lab Workspace
            </Button>
          )}
          <Button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="h-12 px-6 rounded-full bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-dark)] shadow-lg shadow-[var(--color-forest)]/20 font-medium transition-all"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Add Clinical Note
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PATIENT IDENTITY CARD (HERO)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-lime-light)] opacity-40 rounded-bl-full -z-0 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 opacity-60 rounded-tr-full -z-0 blur-3xl"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
          {/* Avatar */}
          <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-[var(--color-forest)] to-emerald-800 text-white flex items-center justify-center shadow-xl shadow-[var(--color-forest)]/20 shrink-0 rotate-3 transition-transform hover:rotate-0 duration-300">
            <span className="font-serif text-5xl font-bold">{initials}</span>
          </div>
          
          {/* Info */}
          <div className="flex-1 text-center lg:text-left space-y-6 w-full">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {fullName}
              </h2>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {patientData.gender && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium capitalize">
                    {patientData.gender.toLowerCase()}
                  </span>
                )}
                {ageText && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                    {ageText}
                  </span>
                )}
                {patientData.riskLevel && patientData.riskLevel !== "PENDING" && (
                  <div className="scale-110 origin-left"><StatusBadge status={patientData.riskLevel} /></div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-forest)] shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone</div>
                  <div className="text-sm font-semibold text-slate-800">{phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-forest)] shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</div>
                  <div className="text-sm font-semibold text-slate-800">{email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-forest)] shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date of Birth</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PREMIUM METRICS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-[var(--color-lime-light)] text-[var(--color-forest)] flex items-center justify-center mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Health Status</div>
          <div className="text-xl font-serif font-bold text-slate-800">
            {patientData.riskLevel && patientData.riskLevel !== "PENDING" ? patientData.riskLevel : "Pending"}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Lab Tests</div>
          <div className="text-xl font-serif font-bold text-slate-800">
            {history.length} <span className="text-sm text-slate-500 font-sans font-medium">Orders</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Completed</div>
          <div className="text-xl font-serif font-bold text-slate-800">
            {completedCount} <span className="text-sm text-slate-500 font-sans font-medium">Finalized</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Clinical Notes</div>
          <div className="text-xl font-serif font-bold text-slate-800">
            {notes.length} <span className="text-sm text-slate-500 font-sans font-medium">Entries</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT GRID
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: DIAGNOSTIC HISTORY */}
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-3">
                <TestTube className="h-6 w-6 text-[var(--color-forest)]" />
                Diagnostic History
              </h2>
              <span className="text-sm font-medium text-[var(--color-forest)] bg-[var(--color-lime-light)] px-4 py-1.5 rounded-full">
                {history.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Date & Ref</th>
                    <th className="px-8 py-5">Test Panel</th>
                    <th className="px-8 py-5">Facility</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length > 0 ? (
                    history.map((item: any, idx: number) => {
                      const refCode = item.referralCode || item.bookingId?.referralCode || `CRV-${String(item._id || item.id).slice(-6).toUpperCase()}`
                      const pkgName = item.package || item.packageId?.name || "Diagnostic Panel"
                      const labName = item.lab || item.laboratoryId?.name || "Partner Laboratory"
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-800 mb-1">
                              {item.date ? new Date(item.date).toLocaleDateString() : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-")}
                            </div>
                            <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {refCode}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-sm font-bold text-[var(--color-forest)]">
                              {pkgName}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                              <Building2 className="h-4 w-4 text-slate-400" /> {labName}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <StatusBadge status={item.status || "PENDING"} />
                          </td>
                          <td className="px-8 py-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              {(user?.role === 'LABORATORY' || user?.role === 'ADMIN' || (user?.role as any) === 'SUPER_ADMIN') && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-9 px-4 rounded-full text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                  onClick={() => navigate(`/lab/dashboard/${item.referralCode || refCode}`)}
                                >
                                  Upload
                                </Button>
                              )}
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-9 px-4 rounded-full text-xs font-bold bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-dark)] shadow-md shadow-[var(--color-forest)]/20 flex items-center gap-1.5"
                                onClick={() => navigate(`/client/results/${item._id || item.referralCode || refCode}`)}
                              >
                                View Report <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="h-16 w-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
                            <TestTube className="h-8 w-8" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">
                            No Diagnostic Records
                          </h3>
                          <p className="text-sm text-slate-500 mb-6">
                            This patient has not yet completed any laboratory diagnostic tests.
                          </p>
                          {isLab && (
                            <Button 
                              className="rounded-full bg-[var(--color-forest)] text-white h-11 px-8"
                              onClick={() => navigate('/lab/dashboard')}
                            >
                              Go to Lab Workspace
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLINICAL NOTES & DETAILS */}
        <div className="space-y-8">
          
          {/* Clinical Notes Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col h-[600px]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Clinical Notes
              </h2>
            </div>

            {isAddingNote && (
              <form onSubmit={handleCreateNote} className="p-6 border-b border-slate-100 bg-purple-50/30 animate-in fade-in slide-in-from-top-4">
                <textarea
                  rows={4}
                  required
                  placeholder="Enter clinical observations, diagnostic notes..."
                  className="w-full rounded-2xl border-0 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/20 outline-none shadow-sm resize-none mb-3"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-10 rounded-full text-slate-600 hover:bg-slate-100"
                    onClick={() => { setIsAddingNote(false); setNewNoteText("") }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createNoteMutation.isPending}
                    className="h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                  >
                    {createNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Save Note
                  </Button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/10">
              {notes.length > 0 ? (
                notes.map((note: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">
                          {note.author === "System" ? <AlertCircle className="h-4 w-4" /> : note.author.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {note.author || "Clinician"}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.date ? new Date(note.date).toLocaleDateString() : (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "Recent")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-10">
                      {note.note}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                  <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <p className="font-serif text-lg font-bold text-slate-800 mb-1">No Entries Yet</p>
                  <p className="text-sm text-slate-500 max-w-[200px] mx-auto">
                    Click "Add Clinical Note" to record observations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Details Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-3">
              <User className="h-5 w-5 text-[var(--color-lime)]" /> Personal Info
            </h3>
            <div className="space-y-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Residential Address</div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                  <span className="text-slate-200 text-sm leading-relaxed">
                    {patientData.address?.street 
                      ? `${patientData.address.street}, ${patientData.address.city || ""}` 
                      : (patientData.address || "No address on file")}
                  </span>
                </div>
              </div>
              <div className="pt-5 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-slate-400">System ID</span>
                <span className="font-mono text-xs bg-black/30 px-3 py-1 rounded-full text-slate-300">
                  {String(patientData._id || patientData.id)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

