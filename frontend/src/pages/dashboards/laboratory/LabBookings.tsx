import { useState } from "react"
import { Search, Calendar as CalendarIcon, CheckCircle, CheckCircle2, XCircle, RefreshCw, FileText, ChevronRight, User, Phone, Mail } from "lucide-react"
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { StatusBadge } from "@/components/shared/StatusBadge"

export function LabBookings() {
  const { data: bookingsData, isLoading } = useBookings()
  const updateStatus = useUpdateBookingStatus()

  const bookingsRaw = bookingsData?.items || bookingsData?.data || (Array.isArray(bookingsData) ? bookingsData : [])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const filteredBookings = bookingsRaw.filter((b: any) => 
    b._id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.patientId?.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.patientId?.userId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status })
      toast.success(`Booking marked as ${status}`)
      if (selectedBooking?._id === id) {
        setSelectedBooking({ ...selectedBooking, status })
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update booking status")
    }
  }

  // --- 2-Pane Layout ---
  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--color-lims-bg)]">
      
      {/* LEFT PANE: BOOKING LIST */}
      <div className={`shrink-0 h-full w-full md:w-[380px] bg-white border-r border-[var(--color-lims-border)] flex flex-col z-20 shadow-sm ${selectedBooking ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-[var(--color-lims-border)] bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--color-lims-text)] font-sans flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[var(--color-lims-accent)]" />
                Bookings
              </h2>
              <p className="text-[12px] text-[var(--color-lims-text-muted)] mt-1">Manage scheduled appointments</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or Patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-[13px] bg-white border border-[var(--color-lims-border)] rounded-md focus:outline-none focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <RefreshCw className="h-5 w-5 animate-spin mb-2" />
              <span className="text-[12px]">Loading bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-[13px] font-medium text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-lims-border)]">
              {filteredBookings.map((booking: any) => {
                const isSelected = selectedBooking?._id === booking._id
                const patientName = booking.patientId?.userId ? `${booking.patientId.userId.firstName} ${booking.patientId.userId.lastName}` : "Unknown Patient"
                const date = new Date(booking.scheduledAt).toLocaleDateString()
                const time = new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                
                return (
                  <div
                    key={booking._id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`p-4 cursor-pointer transition-colors group relative ${
                      isSelected 
                        ? 'bg-[var(--color-lims-accent)]/5' 
                        : 'hover:bg-gray-50/80 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-lims-accent)]" />
                    )}
                    
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="font-semibold text-[13px] text-[var(--color-lims-text)] line-clamp-1 pr-2">
                        {patientName}
                      </div>
                      <div className="shrink-0"><StatusBadge status={booking.status} /></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-lims-text-muted)]">
                      <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3"/> {date} - {time}
                      </span>
                      <span className="font-mono font-medium text-[var(--color-lims-accent)]">{booking._id.substring(0, 8)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: DETAILS */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedBooking ? 'hidden md:flex' : 'flex'}`}>
        {!selectedBooking ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--color-lims-border)] mb-4">
              <CalendarIcon className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-700 mb-2">Booking Details</h3>
            <p className="text-[13px] text-gray-500 max-w-sm">
              Select an appointment from the list to view patient details, tests requested, and manage the booking status.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white m-4 md:m-6 rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden animate-fade-in-up">
            {/* Right Pane Header */}
            <div className="shrink-0 h-[60px] border-b border-[var(--color-lims-border)] px-6 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2 text-[var(--color-lims-text-muted)]"
                  onClick={() => setSelectedBooking(null)}
                >
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>
                <h3 className="text-[15px] font-bold text-[var(--color-lims-text)]">
                  Booking #{selectedBooking._id.substring(0, 8)}
                </h3>
                <StatusBadge status={selectedBooking.status} />
              </div>
              
              <div className="flex gap-2">
                {selectedBooking.status === 'PENDING' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedBooking._id, 'CONFIRMED')} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[12px]">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Accept
                  </Button>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedBooking._id, 'COMPLETED')} className="bg-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent)]/90 text-white h-8 text-[12px]">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Completed
                  </Button>
                )}
                {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selectedBooking._id, 'CANCELLED')} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 text-[12px]">
                    <XCircle className="w-4 h-4 mr-1.5" /> Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Right Pane Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <div className="max-w-3xl space-y-8">
                
                {/* Schedule Info */}
                <div className="flex flex-wrap gap-4 bg-gray-50/50 p-4 rounded-md border border-[var(--color-lims-border)]">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-1">Scheduled For</div>
                    <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-lims-text)]">
                      <CalendarIcon className="w-4 h-4 text-[var(--color-lims-accent)]" /> 
                      {new Date(selectedBooking.scheduledAt).toLocaleDateString()} at {new Date(selectedBooking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-1">Location</div>
                    <div className="text-[14px] font-medium text-[var(--color-lims-text)]">
                      {selectedBooking.locationType === 'HOME' ? 'Home Collection' : 'In-Clinic'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-1">Referral Code</div>
                    <div className="text-[14px] font-mono font-medium text-[var(--color-lims-text)] bg-white px-2 py-0.5 rounded border border-[var(--color-lims-border)] inline-block">
                      {selectedBooking.referralCode || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div>
                  <h4 className="text-[13px] font-bold text-[var(--color-lims-text)] mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--color-lims-accent)]" /> Patient Information
                  </h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-1">Full Name</div>
                      <div className="text-[13px] text-[var(--color-lims-text)]">{selectedBooking.patientId?.userId?.firstName} {selectedBooking.patientId?.userId?.lastName}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-1">Contact</div>
                      <div className="text-[13px] text-[var(--color-lims-text)] flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.patientId?.userId?.phone || "N/A"}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.patientId?.userId?.email || "N/A"}</span>
                      </div>
                    </div>
                    {selectedBooking.medicalNotes && (
                      <div className="col-span-2">
                        <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-1">Medical Notes</div>
                        <div className="text-[13px] text-amber-800 bg-amber-50 p-3 rounded border border-amber-200">
                          {selectedBooking.medicalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requested Tests */}
                <div>
                  <h4 className="text-[13px] font-bold text-[var(--color-lims-text)] mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-lims-accent)]" /> Requested Tests
                  </h4>
                  <div className="bg-white border border-[var(--color-lims-border)] rounded-md overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead className="bg-gray-50/50 text-[11px] uppercase text-[var(--color-lims-text-muted)] font-bold text-left border-b border-[var(--color-lims-border)]">
                        <tr>
                          <th className="px-4 py-3">Package / Service</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-lims-border)] text-[var(--color-lims-text)]">
                        {selectedBooking.packageId ? (
                          <tr>
                            <td className="px-4 py-3 font-medium">{selectedBooking.packageId.name}</td>
                            <td className="px-4 py-3">{selectedBooking.packageId.category || "General"}</td>
                            <td className="px-4 py-3">{selectedBooking.durationMinutes} mins</td>
                          </tr>
                        ) : (
                          <tr>
                            <td className="px-4 py-3" colSpan={3}>No specific package found. Reason: {selectedBooking.reason}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {selectedBooking.packageId?.features && selectedBooking.packageId.features.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase mb-2">Biomarkers to Collect</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.packageId.features.map((feature: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded text-[12px] font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
