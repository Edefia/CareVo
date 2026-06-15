import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Activity, FileText, Calendar, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { usePatients } from "@/hooks/usePatients"
// import { useBookings } from "@/hooks/useBookings"

export function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: patientsData, isLoading } = usePatients()
  
  // Real app would fetch specific patient, bookings, and interpretations
  const patients = patientsData?.data || []
  const patientData = patients.find((p: any) => p._id === id) || {
    _id: id || "Unknown",
    user: { firstName: "Loading...", lastName: "", email: "", phone: "" },
    gender: "-",
    dateOfBirth: "-",
    address: { street: "", city: "", state: "" },
    registeredAt: new Date().toISOString(),
  }

  // Real data would come from API hooks
  const history: any[] = []
  const notes: any[] = []

  const fullName = `${patientData.user?.firstName || ""} ${patientData.user?.lastName || ""}`.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{fullName || "Patient Profile"}</h2>
            <p className="text-muted-foreground">ID: {patientData._id.substring(0,8)}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Demographics & Risk */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Contact</div>
                <div className="font-medium">{patientData.user?.phone || "-"}</div>
                <div className="font-medium text-sm">{patientData.user?.email || "-"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Gender</div>
                  <div className="font-medium">{patientData.gender}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">DOB</div>
                  <div className="font-medium">
                    {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : "-"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="font-medium">
                  {patientData.address?.street ? `${patientData.address.street}, ${patientData.address.city}` : "-"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-full dark:bg-slate-800">
                  <Activity className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Health Status</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Awaiting enough data for health assessment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History & Notes */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test History</CardTitle>
              <CardDescription>Previous bookings and laboratory results.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <DataTable 
                  columns={[
                    { header: "Date", accessorKey: "date" },
                    { header: "Package", accessorKey: "package" },
                    { header: "Laboratory", accessorKey: "lab" },
                    { 
                      header: "Status", 
                      cell: (row) => <StatusBadge status={row.status} />
                    },
                    { 
                      header: "Action", 
                      cell: () => (
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          View
                        </Button>
                      )
                    },
                  ]}
                  data={history}
                />
              ) : (
                <EmptyState 
                  icon={<FileText className="h-10 w-10 text-muted-foreground" />}
                  title="No test history"
                  description="This patient has no recorded test history yet."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Clinical Interpretations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-6">
                  {notes.map((note, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Timeline Line */}
                      {idx !== notes.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-border"></div>
                      )}
                      
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted border ring-4 ring-background">
                        {note.author === "System" ? (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{note.author}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {note.date}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border mt-2">
                          {note.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Activity className="h-10 w-10 text-muted-foreground" />}
                  title="No clinical notes"
                  description="No interpretations or notes have been recorded."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
