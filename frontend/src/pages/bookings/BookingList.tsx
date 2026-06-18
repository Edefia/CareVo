import { useState } from "react"
import { Search, Filter, Plus, Calendar as CalendarIcon, Clock, MoreVertical, CheckCircle, XCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

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
  const [page, setPage] = useState(1)

  const { data: bookingsResponse, isLoading } = useBookings({ page, limit: 20 })
  const updateStatusMutation = useUpdateBookingStatus()

  const bookingsData = bookingsResponse?.data || bookingsResponse
  const bookings = bookingsData?.items || bookingsData?.data || (Array.isArray(bookingsData) ? bookingsData : [])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status })
      toast.success(`Booking status updated to ${status}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update booking status")
    }
  }

  const filteredBookings = bookings.filter((b: any) => 
    searchTerm === "" ||
    (b.patientId?.userId?.firstName + " " + b.patientId?.userId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b._id || "").toLowerCase().includes(searchTerm.toLowerCase())
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
              <form 
                className="relative w-full md:w-64"
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(1)
                }}
              >
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bookings..." 
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
                  { header: "Booking ID", cell: (row: any) => <span className="font-mono text-xs">{row._id?.substring(0, 8)}</span> },
                  { header: "Patient", cell: (row: any) => row.patientId?.userId ? `${row.patientId.userId.firstName} ${row.patientId.userId.lastName}` : "Unknown" },
                  { header: "Reason/Package", cell: (row: any) => row.packageId?.name || row.reason || "N/A" },
                  { header: "Laboratory", cell: (row: any) => row.staffId?.laboratoryId?.name || "N/A" },
                  { 
                    header: "Schedule", 
                    cell: (row: any) => (
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
                    cell: (row: any) => <StatusBadge status={row.status} />
                  },
                  { 
                    header: "Actions", 
                    cell: (row: any) => {
                      const id = row._id;
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
              />
              
              {/* Pagination Controls */}
              {bookingsData?.totalPages > 1 && (
                <div className="flex items-center justify-between py-4 border-t border-[var(--color-border)] mt-4">
                  <div className="text-sm text-slate-500">
                    Page {page} of {bookingsData.totalPages}
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
                      onClick={() => setPage(p => Math.min(bookingsData.totalPages, p + 1))}
                      disabled={page === bookingsData.totalPages}
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
    </div>
  )
}
