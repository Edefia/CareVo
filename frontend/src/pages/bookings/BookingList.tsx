import { useState } from "react"
import { Search, Filter, Plus, Calendar as CalendarIcon, Clock, MoreVertical, CheckCircle, XCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"

import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



export function BookingList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const { data: bookingsData, isLoading } = useBookings()
  const bookings = bookingsData?.items || bookingsData || []
  const updateStatusMutation = useUpdateBookingStatus()

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status })
  }

  const filteredBookings = Array.isArray(bookings) ? bookings.filter((b: any) => 
    (b.patientId?.userId?.firstName + " " + b.patientId?.userId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b._id || b.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

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
              { header: "Booking ID", cell: (row) => row._id || row.id },
              { header: "Patient", cell: (row) => row.patientId?.userId ? `${row.patientId.userId.firstName} ${row.patientId.userId.lastName}` : "Unknown" },
              { header: "Reason/Package", cell: (row) => row.packageId?.name || row.package || row.reason || "N/A" },
              { header: "Laboratory", cell: (row) => row.staffId?.laboratoryId?.name || "N/A" },
              { 
                header: "Schedule", 
                cell: (row) => (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm font-medium">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(row.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-3 w-3" />
                      {new Date(row.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                cell: (row) => {
                  const id = row._id || row.id;
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {row.status === 'PENDING' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(id, 'CONFIRMED')} className="cursor-pointer text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept Booking
                          </DropdownMenuItem>
                        )}
                        {row.status === 'CONFIRMED' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(id, 'COMPLETED')} className="cursor-pointer text-blue-600">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Completed
                          </DropdownMenuItem>
                        )}
                        {(row.status === 'PENDING' || row.status === 'CONFIRMED') && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(id, 'CANCELLED')} className="cursor-pointer text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="cursor-pointer">
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
              },
            ]}
            data={filteredBookings}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
