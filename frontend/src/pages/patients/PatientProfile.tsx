import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Activity, FileText, Calendar, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable } from "@/components/shared/DataTable"

export function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock data for the specific patient
  const patient = {
    id: id || "PAT-001",
    name: "Kwame Mensah",
    gender: "Male",
    dob: "1980-05-15 (43 yrs)",
    phone: "+233 24 123 4567",
    email: "kwame.mensah@example.com",
    address: "123 Independence Ave, Accra",
    riskLevel: "HIGH",
    registeredAt: "2023-01-10",
  }

  const mockHistory = [
    { date: "2023-10-12", package: "Comprehensive Wellness", lab: "Accra Central", status: "COMPLETED", risk: "HIGH" },
    { date: "2023-04-05", package: "Basic Wellness", lab: "Accra Central", status: "COMPLETED", risk: "MODERATE" },
  ]

  const mockNotes = [
    { date: "2023-10-15", author: "Dr. Sarah Jones (Advocate)", note: "Patient advised to reduce sodium intake and start daily 30m walks. Follow-up scheduled." },
    { date: "2023-04-08", author: "System", note: "Automated risk alert triggered: Elevated LDL." },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
            <p className="text-muted-foreground">ID: {patient.id} • Registered {patient.registeredAt}</p>
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
                <div className="font-medium">{patient.phone}</div>
                <div className="font-medium text-sm">{patient.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Gender</div>
                  <div className="font-medium">{patient.gender}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">DOB</div>
                  <div className="font-medium">{patient.dob}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="font-medium">{patient.address}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full dark:bg-red-900/50">
                  <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Current Risk Level</h3>
                  <div className="mt-2">
                    <StatusBadge status={patient.riskLevel} />
                  </div>
                  <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-2">
                    Requires active monitoring and lifestyle intervention.
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
                    header: "Risk Assessment", 
                    cell: (row) => <StatusBadge status={row.risk} />
                  },
                  { 
                    header: "Action", 
                    cell: () => (
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        View Report
                      </Button>
                    )
                  },
                ]}
                data={mockHistory}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Clinical Notes & Interactions</CardTitle>
              </div>
              <Button variant="outline" size="sm">Add Note</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockNotes.map((note, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* Timeline Line */}
                    {idx !== mockNotes.length - 1 && (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
