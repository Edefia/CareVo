import { StatCard } from "@/components/shared/StatCard"
import { CalendarCheck, FileText, Activity, HeartPulse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, John</h2>
          <p className="text-muted-foreground">Here is your health overview.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>Book New Package</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Upcoming Bookings" value="1" icon={CalendarCheck} color="blue" />
        <StatCard title="Test Results" value="3" icon={FileText} color="teal" />
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
            <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="font-semibold text-lg">Comprehensive Wellness Package</div>
              <div className="text-muted-foreground mt-1">Accra Central Laboratory</div>
              <div className="flex items-center gap-4 mt-4">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                  Oct 25, 2023
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                  09:00 AM
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1">Reschedule</Button>
              <Button variant="outline" className="flex-1">Get Directions</Button>
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
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <div className="font-medium">Basic Wellness Package</div>
                  <div className="text-sm text-muted-foreground">Tested on Sep 15, 2023</div>
                </div>
                <Button variant="outline" size="sm">View Report</Button>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <div className="font-medium">Lipid Profile</div>
                  <div className="text-sm text-muted-foreground">Tested on Jun 10, 2023</div>
                </div>
                <Button variant="outline" size="sm">View Report</Button>
              </div>
            </div>
            <Button variant="link" className="mt-2 px-0 w-full">View all results →</Button>
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
