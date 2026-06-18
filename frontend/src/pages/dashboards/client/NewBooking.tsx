import { useState } from "react"
import { Calendar as CalendarIcon, MapPin, CheckCircle2, ChevronRight, Activity, Heart, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { usePackages } from "@/hooks/usePackages"
import { useAuthStore } from "@/store/auth"
import { bookingService } from "@/api/services/bookings"
import { LoadingState } from "@/components/shared/LoadingState"

export function NewBooking() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: packagesResponse, isLoading } = usePackages()
  
  const packagesData = packagesResponse?.data || packagesResponse
  const packages = packagesData?.data || packagesData || []

  const [step, setStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBook = async () => {
    setIsSubmitting(true)
    try {
      await bookingService.createBooking({
        patientId: (user as any)?.patientId || (user as any)?._id || user?.id,
        packageId: selectedPackage,
        locationType: selectedType,
        scheduledAt: new Date(date).toISOString(),
      })
      navigate('/client/bookings')
    } catch (error) {
      console.error("Booking failed", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPackageIcon = (iconName: string) => {
    switch (iconName) {
      case 'CARDIO': return Heart;
      case 'METABOLIC': return Droplets;
      case 'COMPREHENSIVE': return Activity;
      default: return Activity;
    }
  }

  if (isLoading) {
    return <LoadingState message="Fetching available packages..." />
  }

  const selectedPkgData = packages.find((p: any) => p._id === selectedPackage)

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">Book a Screening</h1>
        <p className="text-muted-foreground mt-1">Select your package and schedule your appointment.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm transition-colors ${
            step >= s ? 'bg-[var(--color-forest)] text-white ring-4 ring-white' : 'bg-slate-100 text-slate-400 ring-4 ring-white'
          }`}>
            {s}
          </div>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-6 md:p-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-900">Step 1: Select a Package</h2>
              <div className="grid gap-4">
                {packages.map((pkg: any) => {
                  const Icon = getPackageIcon(pkg.pillarIcon)
                  return (
                    <div 
                      key={pkg._id}
                      onClick={() => setSelectedPackage(pkg._id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex items-center justify-between ${
                        selectedPackage === pkg._id ? 'border-[var(--color-lime-dark)] bg-[var(--color-lime-dark)]/5' : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${pkg.bgColor}`}>
                          <Icon className={`h-6 w-6 ${pkg.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                          <p className="text-sm text-slate-500">{pkg.features.join(" • ")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xl font-bold text-[var(--color-forest)]">GH₵{(pkg.price / 100).toFixed(2)}</div>
                        {selectedPackage === pkg._id && <CheckCircle2 className="h-5 w-5 text-[var(--color-lime-dark)] inline-block mt-1" />}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end pt-4">
                <Button disabled={!selectedPackage} onClick={() => setStep(2)}>
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-900">Step 2: Appointment Details</h2>
              
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700">Where would you like to be seen?</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setSelectedType("HOME")}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex items-start gap-3 ${
                      selectedType === "HOME" ? 'border-[var(--color-lime-dark)] bg-[var(--color-lime-dark)]/5' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">Home Collection</h4>
                      <p className="text-sm text-slate-500">A professional phlebotomist will come to your home.</p>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => setSelectedType("CLINIC")}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex items-start gap-3 ${
                      selectedType === "CLINIC" ? 'border-[var(--color-lime-dark)] bg-[var(--color-lime-dark)]/5' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <CalendarIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">In-Clinic Visit</h4>
                      <p className="text-sm text-slate-500">Visit one of our partner laboratories.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6 pt-6 border-t">
                <label className="text-sm font-semibold text-slate-700">Select Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-1/2" />
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button disabled={!selectedType || !date} onClick={() => setStep(3)}>
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-900">Step 3: Review & Confirm</h2>
              
              <div className="bg-slate-50 rounded-xl p-6 border space-y-4">
                <div className="flex justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-slate-500">Package</p>
                    <p className="font-bold text-slate-900">{selectedPkgData?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Price</p>
                    <p className="font-serif text-xl font-bold text-[var(--color-forest)]">GH₵{selectedPkgData ? (selectedPkgData.price / 100).toFixed(2) : "0.00"}</p>
                  </div>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-slate-500">Appointment Type</p>
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      {selectedType === 'HOME' ? <MapPin className="h-4 w-4 text-slate-400"/> : <CalendarIcon className="h-4 w-4 text-slate-400"/>}
                      {selectedType === 'HOME' ? 'Home Collection' : 'In-Clinic Visit'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-medium text-slate-900">{new Date(date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleBook} disabled={isSubmitting} className="min-w-[140px]">
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
