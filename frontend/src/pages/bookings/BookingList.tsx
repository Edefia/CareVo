import { useState } from "react"
import { Search, Filter, Plus, Calendar as CalendarIcon, Clock, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

const mockBookings = [
  { id: "BK-1029", patient: "Kwame Mensah", package: "Basic Wellness", date: "2023-10-25", time: "09:00 AM", lab: "Accra Central", status: "SCHEDULED" },
  { id: "BK-1030", patient: "Ama Osei", package: "Comprehensive", date: "2023-10-25", time: "10:30 AM", lab: "Kumasi Diagnostic", status: "PENDING" },
  { id: "BK-1031", patient: "John Doe", package: "Lipid Profile", date: "2023-10-24", time: "08:00 AM", lab: "Accra Central", status: "ATTENDED" },
  { id: "BK-1032", patient: "Jane Smith", package: "Basic Wellness", date: "2023-10-24", time: "09:15 AM", lab: "Tema General Hub", status: "CANCELLED" },
]

export function BookingList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBookings = mockBookings.filter(b => 
    b.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bookings & Appointments</h2>
          <p className="text-muted-foreground">Manage laboratory appointments across the platform.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2" onClick={() => navigate('/bookings/new')}>
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bookings..." 
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
              { header: "Booking ID", accessorKey: "id" },
              { header: "Patient", accessorKey: "patient" },
              { header: "Package", accessorKey: "package" },
              { header: "Laboratory", accessorKey: "lab" },
              { 
                header: "Schedule", 
                cell: (row) => (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm font-medium">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {row.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-3 w-3" />
                      {row.time}
                    </div>
                  </div>
                )
              },
              { 
                header: "Status", 
                cell: (row) => <StatusBadge status={row.status} />
              },
              { 
                header: "Actions", 
                cell: () => (
                  <Button variant="ghost" size="icon" title="Edit Booking">
                    <Edit2 className="h-4 w-4 text-slate-600" />
                  </Button>
                )
              },
            ]}
            data={filteredBookings}
          />
        </CardContent>
      </Card>
    </div>
  )
}
