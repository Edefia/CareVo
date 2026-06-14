import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useBooking } from "@/hooks/useBookings"
import { useCreateResult } from "@/hooks/useResults"
import toast from "react-hot-toast"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { FileUpload } from "@/components/shared/FileUpload"


export function ResultsEntry() {
  const navigate = useNavigate()
  const { bookingId } = useParams<{ bookingId: string }>()
  
  const { data: bookingData, isLoading } = useBooking(bookingId as string)
  const booking = bookingData?.data || bookingData
  
  const createResult = useCreateResult()
  const [formData, setFormData] = useState({
    fastingBloodSugar: "",
    hba1c: "",
    totalCholesterol: "",
    hdl: "",
    ldl: "",
    triglycerides: "",
    notes: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const biomarkers = [
        { name: "Fasting Blood Sugar", value: formData.fastingBloodSugar, unit: "mg/dL", referenceRange: "70-99" },
        { name: "HbA1c", value: formData.hba1c, unit: "%", referenceRange: "< 5.7" },
        { name: "Total Cholesterol", value: formData.totalCholesterol, unit: "mg/dL", referenceRange: "< 200" },
        { name: "HDL", value: formData.hdl, unit: "mg/dL", referenceRange: "> 40" },
        { name: "LDL", value: formData.ldl, unit: "mg/dL", referenceRange: "< 100" },
        { name: "Triglycerides", value: formData.triglycerides, unit: "mg/dL", referenceRange: "< 150" }
      ].filter(b => b.value !== "")

      await createResult.mutateAsync({
        bookingId,
        patientId: booking.patientId._id || booking.patientId,
        biomarkers,
        notes: formData.notes
      })
      toast.success("Results submitted successfully!")
      navigate('/results')
    } catch (error) {
      toast.error("Failed to submit results")
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!booking) return <div>Booking not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Results Entry</h2>
            <StatusBadge status="DRAFT" />
          </div>
          <p className="text-muted-foreground">{booking.reason || "Basic Wellness Package"} • {booking.patientId?.userId ? `${booking.patientId.userId.firstName} ${booking.patientId.userId.lastName}` : "Unknown"}</p>
        </div>
        <div>
          <Button variant="outline" className="mr-2">Save Draft</Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2" disabled={createResult.isPending}>
            <Save className="h-4 w-4" />
            Submit Results
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Context */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Patient</div>
                <div className="font-medium">{booking.patientId?.userId ? `${booking.patientId.userId.firstName} ${booking.patientId.userId.lastName}` : "Unknown"}</div>
                <div className="text-sm">{booking.patientId?._id || booking.patientId}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Booking Ref</div>
                <div className="font-medium">{booking._id || booking.id}</div>
                <div className="text-sm">{new Date(booking.scheduledAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Package</div>
                <div className="font-medium">{booking.reason || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Documents</CardTitle>
              <CardDescription>Upload raw machine outputs or PDF reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onUpload={(files) => console.log(files)} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Entry Form */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Biomarker Data Entry</CardTitle>
              <CardDescription>Enter the discrete values for the requested tests.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                <div className="space-y-4">
                  <h3 className="font-semibold border-b pb-2">Glucose Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fastingBloodSugar">Fasting Blood Sugar (mg/dL)</Label>
                      <Input 
                        id="fastingBloodSugar" 
                        name="fastingBloodSugar" 
                        type="number" 
                        placeholder="e.g. 95" 
                        value={formData.fastingBloodSugar} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hba1c">HbA1c (%)</Label>
                      <Input 
                        id="hba1c" 
                        name="hba1c" 
                        type="number" 
                        step="0.1" 
                        placeholder="e.g. 5.4" 
                        value={formData.hba1c} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold border-b pb-2">Lipid Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalCholesterol">Total Cholesterol (mg/dL)</Label>
                      <Input 
                        id="totalCholesterol" 
                        name="totalCholesterol" 
                        type="number" 
                        placeholder="e.g. 180" 
                        value={formData.totalCholesterol} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hdl">HDL (mg/dL)</Label>
                      <Input 
                        id="hdl" 
                        name="hdl" 
                        type="number" 
                        placeholder="e.g. 50" 
                        value={formData.hdl} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ldl">LDL (mg/dL)</Label>
                      <Input 
                        id="ldl" 
                        name="ldl" 
                        type="number" 
                        placeholder="e.g. 100" 
                        value={formData.ldl} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="triglycerides">Triglycerides (mg/dL)</Label>
                      <Input 
                        id="triglycerides" 
                        name="triglycerides" 
                        type="number" 
                        placeholder="e.g. 120" 
                        value={formData.triglycerides} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Lab Technician Notes (Optional)</Label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Any specific observations during the test..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

              </form>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-between p-4 border-t mt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>Discard Changes</Button>
              <Button onClick={handleSubmit} disabled={createResult.isPending}>Validate & Submit</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
