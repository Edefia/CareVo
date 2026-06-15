import { Calendar, Clock, MapPin, Video, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useBookings } from "@/hooks/useBookings"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LoadingState } from "@/components/shared/LoadingState"

export function ClientBookings() {
  const navigate = useNavigate()
  const { data: bookingsData, isLoading } = useBookings()
  
  const bookings = bookingsData?.items || bookingsData || []
  
  // Sort bookings by date, newest first
  const sortedBookings = Array.isArray(bookings) ? [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []

  if (isLoading) {
    return <LoadingState message="Fetching your bookings..." />
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming appointments and screening history.</p>
        </div>
        <Button onClick={() => navigate('/client/bookings/new')} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Book New Screening
        </Button>
      </div>

      {sortedBookings.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't scheduled any screenings or consultations yet. Stay on top of your health by booking your first session.
            </p>
            <Button onClick={() => navigate('/client/bookings/new')} size="lg">
              Book a Screening
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {sortedBookings.map((booking: any) => {
            const isUpcoming = booking.status === "CONFIRMED" || booking.status === "PENDING"
            
            return (
              <Card key={booking._id || booking.id} className={`overflow-hidden transition-all ${isUpcoming ? 'border-l-4 border-l-[var(--color-forest)]' : ''}`}>
                <CardContent className="p-0 sm:flex">
                  {/* Date Block */}
                  <div className={`sm:w-48 p-6 flex flex-row sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r ${isUpcoming ? 'bg-[var(--color-surface-2)]' : 'bg-slate-50'}`}>
                    <div className="text-center">
                      <div className="text-sm font-semibold uppercase tracking-widest text-[var(--color-forest)] mb-1">
                        {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="font-serif text-4xl font-bold text-slate-900">
                        {new Date(booking.date).getDate()}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {new Date(booking.date).getFullYear()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end sm:items-center mt-0 sm:mt-4 gap-2">
                      <StatusBadge status={booking.status} />
                      <span className="flex items-center text-sm font-medium text-slate-600 bg-white px-2 py-1 rounded-md shadow-sm border mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {booking.time || 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{booking.package}</h3>
                        <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border">
                          {booking.referralCode || booking._id?.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-start text-slate-600">
                          {booking.type === 'HOME' ? (
                            <MapPin className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                          ) : booking.type === 'VIRTUAL' ? (
                            <Video className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                          ) : (
                            <Calendar className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{booking.type === 'HOME' ? 'Home Sample Collection' : booking.type === 'VIRTUAL' ? 'Teleconsultation' : 'In-Clinic Screening'}</p>
                            <p className="text-sm mt-0.5">{booking.location || 'Location details will be provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex flex-wrap gap-3 items-center justify-between">
                      <p className="text-sm text-slate-500 flex items-center">
                        {booking.status === 'COMPLETED' ? (
                          <><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Completed successfully</>
                        ) : booking.status === 'CANCELLED' ? (
                          <><AlertCircle className="w-4 h-4 mr-1 text-red-500" /> Booking cancelled</>
                        ) : (
                          'Please ensure you fast for 8-12 hours before the screening.'
                        )}
                      </p>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        {booking.status === 'PENDING' && (
                          <Button variant="outline" className="flex-1 sm:flex-none">Reschedule</Button>
                        )}
                        {booking.meetingLink && booking.status === 'CONFIRMED' && (
                          <Button className="flex-1 sm:flex-none gap-2">
                            <Video className="w-4 h-4" /> Join Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
