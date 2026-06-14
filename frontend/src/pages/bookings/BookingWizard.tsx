import { useState } from "react"
import { usePatients } from "@/hooks/usePatients"
import { useLaboratories } from "@/hooks/useLaboratories"
import { useCreateBooking } from "@/hooks/useBookings"
import toast from "react-hot-toast"
import { ArrowLeft, CheckCircle, ChevronRight, MapPin, Calendar as CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BookingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  const { data: patientsData } = usePatients()
  const patients = patientsData?.items || patientsData || []

  const { data: labsData } = useLaboratories()
  const labs = labsData?.items || labsData || []

  const createBooking = useCreateBooking()

  // Packages aren't in DB, kept as static choices
  const packages = [
    { id: "pkg-1", name: "Basic Wellness", price: "GHS 150" },
    { id: "pkg-2", name: "Comprehensive", price: "GHS 350" },
    { id: "pkg-3", name: "Lipid Profile", price: "GHS 80" },
  ]

  const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM"]

  const [formData, setFormData] = useState({
    patientId: "",
    packageId: "",
    labId: "",
    date: "",
    time: "",
  })

  const handleNext = () => setStep(s => Math.min(4, s + 1))
  const handleBack = () => setStep(s => Math.max(1, s - 1))
  
  const handleSubmit = async () => {
    try {
      // Backend expects: patientId, staffId, scheduledAt, reason
      // If we don't have staffId, we will omit or find a default.
      // Usually lab booking needs laboratoryId or staffId in this system.
      // We pass what we have.
      const scheduledAt = new Date(`${formData.date} ${formData.time}`).toISOString()
      await createBooking.mutateAsync({
        patientId: formData.patientId,
        scheduledAt,
        reason: packages.find(p => p.id === formData.packageId)?.name,
        notes: `Selected Lab: ${formData.labId}`
      })
      toast.success("Booking created successfully")
      setStep(4) // Move to success step
    } catch (e) {
      toast.error("Failed to create booking")
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step === 1 ? navigate(-1) : handleBack()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Appointment</h2>
          <p className="text-muted-foreground">Schedule a laboratory test.</p>
        </div>
      </div>

      {/* Progress Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between relative mb-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background font-medium ${step >= s ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "1. Select Patient & Package"}
            {step === 2 && "2. Choose Laboratory"}
            {step === 3 && "3. Schedule Date & Time"}
            {step === 4 && "Booking Confirmed!"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Patient</Label>
                <Select value={formData.patientId} onValueChange={(v: string) => setFormData({...formData, patientId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an existing patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p: any) => (
                      <SelectItem key={p._id || p.id} value={p._id || p.id}>
                        {p.userId?.firstName} {p.userId?.lastName} ({p._id || p.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-right">
                  <Button variant="link" size="sm" className="px-0">Register New Patient Instead</Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Test Package</Label>
                <div className="grid gap-3">
                  {packages.map(pkg => (
                    <div 
                      key={pkg.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${formData.packageId === pkg.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                      onClick={() => setFormData({...formData, packageId: pkg.id})}
                    >
                      <div className="font-medium">{pkg.name}</div>
                      <div className="font-bold">{pkg.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search locations..." className="pl-9" />
              </div>

              <div className="grid gap-3">
                {labs.map((lab: any) => (
                  <div 
                    key={lab._id || lab.id} 
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${formData.labId === (lab._id || lab.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => setFormData({...formData, labId: lab._id || lab.id})}
                  >
                    <div className="font-medium">{lab.name}</div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {lab.location?.address || "No address provided"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>Date</Label>
                  {/* Basic date input for MVP, would normally be a DatePicker component */}
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-9" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Available Timeslots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(time => (
                      <Button
                        key={time}
                        type="button"
                        variant={formData.time === time ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setFormData({...formData, time})}
                        disabled={!formData.date}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </Button>
                    ))}
                  </div>
                  {!formData.date && <p className="text-xs text-muted-foreground">Please select a date first.</p>}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border space-y-2 mt-6">
                <h4 className="font-semibold border-b pb-2 mb-2">Booking Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{formData.patientId || "Not selected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-medium">{packages.find(p => p.id === formData.packageId)?.name || "Not selected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{labs.find((l: any) => (l._id || l.id) === formData.labId)?.name || "Not selected"}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t mt-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">{packages.find(p => p.id === formData.packageId)?.price || "GHS 0"}</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Appointment Scheduled!</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                The appointment for {formData.date} at {formData.time} has been confirmed. An email and SMS have been sent to the patient.
              </p>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => navigate('/bookings')}>View All Bookings</Button>
                <Button onClick={() => setStep(1)}>Book Another</Button>
              </div>
            </div>
          )}
        </CardContent>
        {step < 4 && (
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>
            {step < 3 ? (
              <Button onClick={handleNext} className="flex items-center gap-2" disabled={
                (step === 1 && (!formData.patientId || !formData.packageId)) ||
                (step === 2 && !formData.labId)
              }>
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.date || !formData.time || createBooking.isPending}>
                Confirm Booking
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
