import { useState, useEffect } from "react"
import { useLaboratories } from "@/hooks/useLaboratories"

import toast from "react-hot-toast"
import { 
  ArrowLeft, CheckCircle, CheckCircle2, ChevronRight, MapPin, 
  Calendar as CalendarIcon, Clock, Heart, Droplets, 
  Activity, Copy, Download, Share2, Info, QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { SCREENING_PACKAGES, generateReferralCode } from "@/lib/constants"

export function BookingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  const { data: labsData } = useLaboratories()
  const labs = labsData?.items || labsData || [
    { id: '1', name: 'AccuLab Diagnostics', location: { address: 'Accra, Greater Accra' }, rating: 4.8 },
    { id: '2', name: 'MediScan Ghana', location: { address: 'Kumasi, Ashanti' }, rating: 4.9 }
  ]

  const [formData, setFormData] = useState({
    packageId: "",
    labId: "",
    date: "",
    time: "",
    referralCode: ""
  })

  const [copied, setCopied] = useState(false)

  // Auto-generate referral code when reaching step 6
  useEffect(() => {
    if (step === 6 && !formData.referralCode) {
      setFormData(prev => ({ ...prev, referralCode: generateReferralCode() }))
    }
  }, [step, formData.referralCode])

  const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM"]
  const selectedPackage = SCREENING_PACKAGES.find(p => p.id === formData.packageId)
  const selectedLab = labs.find((l: any) => (l._id || l.id) === formData.labId)

  const handleNext = () => {
    if (step === 6) {
      handleSubmit()
    } else {
      setStep(s => Math.min(7, s + 1))
    }
  }
  
  const handleBack = () => setStep(s => Math.max(1, s - 1))
  
  const handleSubmit = async () => {
    try {
      // In real life, send to backend
      toast.success("Booking created successfully")
      setStep(7) // Move to confirmation step
    } catch (e) {
      toast.error("Failed to create booking")
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    "Package",
    "Laboratory",
    "Location",
    "Date & Time",
    "Preview",
    "Referral Code",
    "Confirm"
  ]

  // Helper for pillar icons
  const renderPillars = (pillars: string[]) => {
    return (
      <div className="flex -space-x-1">
        {pillars.includes('CARDIO') && <div className="z-30 rounded-full bg-[#DC2626] p-1.5 border-2 border-white"><Heart className="h-3 w-3 text-white" /></div>}
        {pillars.includes('RENAL') && <div className="z-20 rounded-full bg-[#0F76E0] p-1.5 border-2 border-white"><Droplets className="h-3 w-3 text-white" /></div>}
        {pillars.includes('METABOLIC') && <div className="z-10 rounded-full bg-[#D97706] p-1.5 border-2 border-white"><Activity className="h-3 w-3 text-white" /></div>}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-off-white)]">
      
      {/* HEADER WITH PROGRESS */}
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] px-[24px] py-[20px] shadow-sm">
        <div className="mx-auto max-w-[1000px] flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => step === 1 ? navigate('/client/dashboard') : handleBack()} className="shrink-0">
            <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </Button>
          
          <div className="hidden md:flex flex-1 mx-[48px] items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[var(--color-surface-2)] -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--color-forest)] -z-10 transition-all duration-300" 
              style={{ width: `${((step - 1) / 6) * 100}%` }}
            ></div>
            
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors ${
                  step > i + 1 ? 'border-[var(--color-forest)] bg-[var(--color-forest)] text-white' : 
                  step === i + 1 ? 'border-[var(--color-forest)] bg-white text-[var(--color-forest)]' : 
                  'border-[var(--color-border)] bg-white text-[var(--color-text-muted)]'
                }`}>
                  {step > i + 1 ? <CheckCircle className="h-3 w-3" /> : i + 1}
                </div>
                <span className={`text-[11px] font-medium ${step >= i + 1 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>

          <div className="md:hidden flex-1 text-center font-sans text-[14px] font-bold text-[var(--color-text-primary)]">
            Step {step} of 7: {steps[step - 1]}
          </div>

          <div className="w-[40px] shrink-0"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 py-[48px] px-[24px]">
        <div className="mx-auto max-w-[800px]">
          
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 1: SELECT PACKAGE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[32px] font-semibold text-[var(--color-forest)] mb-2">Choose Your Screening Package</h1>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">Select the health areas you want to screen today.</p>
              </div>

              <div className="grid gap-[20px] md:grid-cols-2">
                {SCREENING_PACKAGES.map(pkg => (
                  <div 
                    key={pkg.id} 
                    onClick={() => setFormData({...formData, packageId: pkg.id})}
                    className={`relative flex flex-col p-[24px] rounded-[var(--radius-xl)] border-2 cursor-pointer transition-all duration-200 ${
                      formData.packageId === pkg.id 
                        ? 'border-[var(--color-forest)] bg-[var(--color-surface-2)]/50 shadow-md transform scale-[1.01]' 
                        : 'border-[var(--color-border)] bg-white hover:border-[var(--color-forest)]/30 hover:shadow-sm'
                    }`}
                  >
                    {pkg.isMostPopular && (
                      <div className="absolute top-0 right-[24px] -translate-y-1/2 bg-[var(--color-lime-dark)] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      {renderPillars(pkg.pillar)}
                      <div className="font-serif text-[28px] font-semibold text-[var(--color-text-primary)]">GHS {pkg.price}</div>
                    </div>
                    
                    <h3 className="font-sans text-[18px] font-bold text-[var(--color-forest)] mb-2">{pkg.name}</h3>
                    <p className="font-sans text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-4 flex-1">
                      {pkg.description}
                    </p>
                    
                    <div className="space-y-2 border-t border-[var(--color-border)] pt-4 mb-4">
                      <div className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Tests Included:</div>
                      {pkg.tests.slice(0, 4).map((test, i) => (
                        <div key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-lime)] shrink-0 mt-[2px]" />
                          <span>{test}</span>
                        </div>
                      ))}
                      {pkg.tests.length > 4 && (
                        <div className="text-[12px] text-[var(--color-text-muted)] italic ml-6">
                          + {pkg.tests.length - 4} more tests
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[13px] font-medium text-[var(--color-text-muted)] bg-white rounded-md p-2 border border-[var(--color-border)]/50">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> ~{pkg.duration} mins</span>
                      {pkg.requiresFasting && <span className="flex items-center gap-1 text-[#D97706]"><Info className="h-4 w-4" /> Fasting Required</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 2: CHOOSE LABORATORY
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[32px] font-semibold text-[var(--color-forest)] mb-2">Choose a Partner Laboratory</h1>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">These laboratories are certified to conduct your selected package.</p>
              </div>

              <div className="relative mb-[24px]">
                <MapPin className="absolute left-[16px] top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                <Input placeholder="Search locations (e.g., Accra, Kumasi)..." className="pl-[44px] h-[56px] text-[16px]" />
              </div>

              <div className="flex flex-col gap-[16px]">
                {labs.map((lab: any) => (
                  <div 
                    key={lab.id} 
                    onClick={() => setFormData({...formData, labId: lab.id})}
                    className={`flex flex-col sm:flex-row justify-between p-[24px] rounded-[var(--radius-lg)] border-2 cursor-pointer transition-all duration-200 ${
                      formData.labId === lab.id 
                        ? 'border-[var(--color-forest)] bg-[var(--color-surface-2)]/50 shadow-sm' 
                        : 'border-[var(--color-border)] bg-white hover:border-[var(--color-forest)]/30'
                    }`}
                  >
                    <div>
                      <h3 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)] mb-1">{lab.name}</h3>
                      <div className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)] mb-3">
                        <MapPin className="h-4 w-4" /> {lab.location?.address}
                      </div>
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="font-medium text-[var(--color-forest)] bg-[#7EE8A2]/20 px-2 py-1 rounded">Certified for CareVo</span>
                        <span className="flex items-center text-[#D97706] font-medium">★ {lab.rating}</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col justify-center items-start sm:items-end">
                      <div className="text-[13px] text-[var(--color-text-muted)] mb-2">Available slots this week: <span className="font-bold text-[var(--color-text-primary)]">12</span></div>
                      <Button variant={formData.labId === lab.id ? "default" : "outline"} className="w-full sm:w-auto">
                        {formData.labId === lab.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 3: LOCATION CONFIRMATION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 3 && selectedLab && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-[600px] mx-auto">
              <div className="mb-[32px] text-center">
                <h1 className="font-serif text-[32px] font-semibold text-[var(--color-forest)] mb-2">Confirm Location</h1>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">Verify the address of your selected laboratory.</p>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden shadow-sm">
                <div className="h-[200px] bg-slate-200 w-full relative flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-[var(--color-forest)] absolute" />
                  <span className="text-slate-400 font-medium">Map Embed Placeholder</span>
                </div>
                <div className="p-[32px] text-center">
                  <h3 className="font-serif text-[24px] font-semibold text-[var(--color-text-primary)] mb-2">{selectedLab.name}</h3>
                  <p className="font-sans text-[16px] text-[var(--color-text-secondary)] mb-6">{selectedLab.location?.address}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                    <div className="p-3 bg-[var(--color-surface-2)] rounded-lg">
                      <div className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Opening Hours</div>
                      <div className="text-[14px] font-medium text-[var(--color-text-primary)]">Mon-Fri: 7AM - 5PM</div>
                    </div>
                    <div className="p-3 bg-[var(--color-surface-2)] rounded-lg">
                      <div className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Contact</div>
                      <div className="text-[14px] font-medium text-[var(--color-text-primary)]">030 200 1234</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-lg text-left mb-8">
                    <Info className="h-5 w-5 text-[#16A34A] shrink-0 mt-[2px]" />
                    <p className="text-[14px] text-[#16A34A] font-medium">
                      Directions note: Present your Referral Code when you arrive at reception. No payment needed at the lab if prepaid online.
                    </p>
                  </div>

                  <Button onClick={handleNext} className="w-full h-[56px] text-[16px]">Confirm this location</Button>
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 4: DATE & TIME
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[32px] font-semibold text-[var(--color-forest)] mb-2">Choose Your Appointment</h1>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">Select when you would like to visit the laboratory.</p>
              </div>

              {selectedPackage?.requiresFasting && (
                <div className="flex items-start gap-3 p-4 bg-[#FFFBEB] border border-[#D97706]/20 rounded-lg mb-[32px]">
                  <Activity className="h-5 w-5 text-[#D97706] shrink-0 mt-[2px]" />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#D97706] mb-1">Fasting Required</h4>
                    <p className="text-[14px] text-[#D97706]/80 leading-snug">
                      Your selected package ({selectedPackage.name}) requires you to fast for 8 hours before the test. Morning appointments are highly recommended.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-[32px]">
                <div className="bg-white p-[24px] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm">
                  <Label className="text-[16px] mb-4 block">Select Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-[16px] top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                    <Input 
                      type="date" 
                      className="pl-[44px] h-[56px] text-[16px] bg-[var(--color-surface-2)] border-transparent focus:bg-white focus:border-[var(--color-forest)]" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="bg-white p-[24px] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm">
                  <Label className="text-[16px] mb-4 block">Select Time</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map(time => (
                      <div 
                        key={time}
                        onClick={() => formData.date && setFormData({...formData, time})}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          !formData.date ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] bg-gray-50' :
                          formData.time === time ? 'border-[var(--color-forest)] bg-[var(--color-surface-2)]/50 text-[var(--color-forest)] font-bold' : 
                          'border-[var(--color-border)] hover:border-[var(--color-forest)]/30 text-[var(--color-text-secondary)] font-medium'
                        }`}
                      >
                        <Clock className="mr-2 h-4 w-4" /> {time}
                      </div>
                    ))}
                  </div>
                  {!formData.date && <p className="text-[13px] text-[var(--color-text-muted)] mt-4 text-center">Please select a date first.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 5: PREVIEW TEST DETAILS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 5 && selectedPackage && selectedLab && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[32px] text-center">
                <h1 className="font-serif text-[32px] font-semibold text-[var(--color-forest)] mb-2">What to Expect</h1>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">Review your booking details and preparation instructions.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-[24px] mb-[32px]">
                {/* Left Column: Tests */}
                <div className="bg-white p-[32px] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm">
                  <h3 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)] mb-6">Tests included in {selectedPackage.name}</h3>
                  <div className="flex flex-col gap-4">
                    {selectedPackage.tests.slice(0, 6).map((test, i) => (
                      <div key={i} className="flex gap-3 pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                        <div>
                          <div className="text-[14px] font-bold text-[var(--color-text-primary)]">{test}</div>
                          <div className="text-[13px] text-[var(--color-text-muted)] mt-1">Measures key indicators for early detection.</div>
                        </div>
                      </div>
                    ))}
                    {selectedPackage.tests.length > 6 && (
                      <div className="text-center pt-2 text-[13px] font-medium text-[var(--color-forest)]">
                        + {selectedPackage.tests.length - 6} more tests
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Prep */}
                <div className="bg-[var(--color-forest)] text-white p-[32px] rounded-[var(--radius-xl)] shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-[18px] font-bold mb-6">How to prepare</h3>
                    <div className="flex flex-col gap-4">
                      {selectedPackage.requiresFasting && (
                        <div className="flex gap-3 items-start">
                          <Activity className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                          <span className="text-[15px] text-white/90">Fast for 8 hours before your appointment</span>
                        </div>
                      )}
                      <div className="flex gap-3 items-start">
                        <Droplets className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                        <span className="text-[15px] text-white/90">Drink water — stay hydrated for the blood draw</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Heart className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                        <span className="text-[15px] text-white/90">Avoid strenuous exercise 24 hours before</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <QrCode className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                        <span className="text-[15px] text-white/90">Bring your Referral Code (we'll generate it next)</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Clock className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                        <span className="text-[15px] text-white/90">Arrive 10 minutes early</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card inside Prep column */}
                  <div className="mt-8 bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
                    <div className="text-[12px] uppercase tracking-wider font-bold text-white/60 mb-2">Booking Summary</div>
                    <div className="font-semibold text-[15px] mb-1">{selectedPackage.name}</div>
                    <div className="text-[14px] text-white/80">{selectedLab.name}</div>
                    <div className="text-[14px] text-white/80">{formData.date} at {formData.time}</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
                      <span className="text-white/80 text-[14px]">Total</span>
                      <span className="font-serif text-[24px] font-bold text-[var(--color-lime)]">GHS {selectedPackage.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 6: REFERRAL CODE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-[600px] mx-auto text-center">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[36px] font-semibold text-[var(--color-forest)] mb-2">Your Referral Code</h1>
                <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
                  This is your unique booking identifier. Present it at the lab.
                </p>
              </div>

              {/* The Code Box */}
              <div className="bg-[var(--color-forest)] rounded-[var(--radius-xl)] p-[48px] shadow-[var(--shadow-card-hover)] mb-[24px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <QrCode className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <div className="text-[12px] font-bold uppercase tracking-widest text-white/60 mb-4">Official CareVo Booking</div>
                  <div className="font-serif text-[40px] sm:text-[48px] font-bold tracking-[0.15em] text-[var(--color-lime)] break-all leading-tight mb-4">
                    {formData.referralCode}
                  </div>
                  <p className="font-sans text-[14px] text-white/80">
                    Show this code at the laboratory reception.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-[16px] mb-[48px]">
                <Button variant="outline" className="gap-2" onClick={handleCopyCode}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied ✓" : "Copy Code"}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" /> Share WhatsApp
                </Button>
              </div>

              <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] p-4 text-left border border-[var(--color-border)]">
                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 mb-3">
                  <span className="font-semibold text-[var(--color-text-primary)]">{selectedPackage?.name}</span>
                  <span className="font-bold text-[var(--color-forest)]">GHS {selectedPackage?.price}</span>
                </div>
                <div className="text-[14px] text-[var(--color-text-secondary)]">
                  {selectedLab?.name} • {formData.date} @ {formData.time}
                </div>
                <div className="mt-3 text-[12px] text-[#D97706] font-medium text-center">
                  Payment is collected at the laboratory.
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              STEP 7: CONFIRMATION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 7 && (
            <div className="animate-in zoom-in-95 duration-500 max-w-[600px] mx-auto text-center py-[48px]">
              <div className="flex justify-center mb-[24px]">
                <CheckCircle className="h-[72px] w-[72px] text-[var(--color-lime-dark)]" />
              </div>
              <h1 className="font-serif text-[36px] font-semibold text-[var(--color-forest)] mb-2">Booking Confirmed!</h1>
              <p className="font-sans text-[16px] text-[var(--color-text-secondary)] mb-[48px]">
                Your screening has been scheduled.
              </p>

              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm text-left overflow-hidden mb-[32px]">
                <div className="bg-[var(--color-surface-2)] px-[24px] py-[16px] border-b border-[var(--color-border)] flex justify-between items-center">
                  <span className="font-mono text-[16px] font-bold text-[var(--color-forest)] tracking-widest">{formData.referralCode}</span>
                  <span className="bg-[#FEF9C3] text-[#A16207] text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">Pending Confirmation</span>
                </div>
                <div className="p-[24px] space-y-4">
                  <div>
                    <div className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Package</div>
                    <div className="font-medium text-[15px]">{selectedPackage?.name}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Laboratory</div>
                    <div className="font-medium text-[15px]">{selectedLab?.name}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Date & Time</div>
                    <div className="font-medium text-[15px]">{formData.date} at {formData.time}</div>
                  </div>
                </div>
              </div>

              <div className="text-left bg-[var(--color-surface-2)] p-[24px] rounded-[var(--radius-lg)] mb-[48px]">
                <h4 className="font-bold text-[15px] mb-4 text-[var(--color-text-primary)]">Next Steps</h4>
                <ol className="list-decimal list-inside space-y-3 text-[14px] text-[var(--color-text-secondary)]">
                  <li>Check your email for your Referral Code and appointment details.</li>
                  <li>The laboratory will confirm your booking within 2 hours.</li>
                  {selectedPackage?.requiresFasting && <li><span className="font-semibold text-[#D97706]">Fast for 8 hours before your appointment.</span></li>}
                  <li>Arrive 10 minutes early and present your Referral Code.</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/client/dashboard')} className="h-[52px] px-8 text-[16px]">
                  Go to My Dashboard
                </Button>
                <Button variant="outline" onClick={() => setStep(1)} className="h-[52px] px-8 text-[16px]">
                  Book Another
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER ACTIONS (Steps 1-6) */}
      {step < 7 && (
        <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] p-[24px] z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="mx-auto max-w-[1000px] flex justify-between items-center">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="text-[15px]">
              Back
            </Button>
            
            <Button 
              onClick={handleNext} 
              className="h-[48px] px-8 text-[15px]"
              disabled={
                (step === 1 && !formData.packageId) ||
                (step === 2 && !formData.labId) ||
                (step === 4 && (!formData.date || !formData.time))
              }
            >
              {step === 6 ? "Confirm Booking" : "Continue"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
