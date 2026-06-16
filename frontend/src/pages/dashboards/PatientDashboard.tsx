import { StatCard } from "@/components/shared/StatCard"
import { useAuthStore } from "@/store/auth"
import { useBookings } from "@/hooks/useBookings"
import { useResults } from "@/hooks/useResults"
import { CalendarCheck, FileText, Activity, HeartPulse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PatientDashboard() {
  const { user } = useAuthStore()
  const { data: bookingsData } = useBookings()
  const bookings = bookingsData?.items || bookingsData || []
  
  const { data: resultsData } = useResults()
  const results = resultsData?.items || resultsData || []

  const nextBooking = bookings[0]
  const recentResults = results.slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {user?.firstName || "Patient"}</h2>
          <p className="text-muted-foreground">Here is your health overview.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>Book New Package</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Upcoming Bookings" value={bookings.length.toString()} icon={CalendarCheck} color="blue" />
        <StatCard title="Test Results" value={results.length.toString()} icon={FileText} color="teal" />
        <StatCard title="Health Score" value="85/100" icon={Activity} color="green" />
        <StatCard title="Active Goals" value="2" icon={HeartPulse} color="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Upcoming Booking</CardTitle>
            <CardDescription>Your next scheduled laboratory visit.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {nextBooking ? (
              <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="font-semibold text-lg">{nextBooking.reason || "Scheduled Appointment"}</div>
                <div className="text-muted-foreground mt-1">{nextBooking.staffId?.laboratoryId?.name || "CareVo Laboratory"}</div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                    {new Date(nextBooking.scheduledAt).toLocaleDateString()}
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                    {new Date(nextBooking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No upcoming bookings</div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" disabled={!nextBooking}>Reschedule</Button>
              <Button variant="outline" className="flex-1" disabled={!nextBooking}>Get Directions</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>Your latest interpreted health results.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentResults.length > 0 ? recentResults.map((res: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b pb-4 last:border-0">
                  <div>
                    <div className="font-medium">Test Result {res._id || res.id}</div>
                    <div className="text-sm text-muted-foreground">Tested on {new Date(res.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Button variant="outline" size="sm">View Report</Button>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">No recent results</div>
              )}
            </div>
            <Button variant="ghost" className="mt-2 px-0 w-full underline text-blue-600 hover:bg-transparent">View all results →</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <HeartPulse className="h-8 w-8 text-blue-500 mb-2" />
              <h4 className="font-semibold">Increase Cardio</h4>
              <p className="text-sm text-muted-foreground mt-1">Based on your recent lipid profile, 30 mins of daily cardio is recommended.</p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <Activity className="h-8 w-8 text-green-500 mb-2" />
              <h4 className="font-semibold">Hydration Goal</h4>
              <p className="text-sm text-muted-foreground mt-1">Try to drink at least 8 glasses of water a day.</p>
            </div>
            <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
              <FileText className="h-8 w-8 text-amber-500 mb-2" />
              <h4 className="font-semibold">Follow-up Needed</h4>
              <p className="text-sm text-muted-foreground mt-1">Your advocate recommends a follow-up test next month.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
