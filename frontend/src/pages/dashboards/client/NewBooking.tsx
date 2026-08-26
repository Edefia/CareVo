import { useState, useEffect } from "react"
import {
  ArrowLeft, CheckCircle, CheckCircle2, ChevronRight, MapPin,
  Calendar as CalendarIcon, Clock, Heart, Droplets,
  Activity, Copy, Download, Share2, Info, QrCode,
  Shield, User, Phone, Mail, AlertTriangle,
  Stethoscope, Building2, Star, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { usePackages } from "@/hooks/usePackages"
import { useLaboratories } from "@/hooks/useLaboratories"
import { bookingService } from "@/api/services/bookings"
import { LoadingState } from "@/components/shared/LoadingState"
import toast from "react-hot-toast"

// ─── Constants ──────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  { value: "07:00", label: "7:00 AM", period: "morning" },
  { value: "08:00", label: "8:00 AM", period: "morning" },
  { value: "09:00", label: "9:00 AM", period: "morning" },
  { value: "10:00", label: "10:00 AM", period: "morning" },
  { value: "11:00", label: "11:00 AM", period: "morning" },
  { value: "13:00", label: "1:00 PM", period: "afternoon" },
  { value: "14:00", label: "2:00 PM", period: "afternoon" },
  { value: "15:00", label: "3:00 PM", period: "afternoon" },
]

const STEP_LABELS = ["Package", "Appointment", "Patient Info", "Review", "Confirmed"]

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPillarIcon(name: string) {
  if (name?.includes('Cardio') || name?.includes('Heart')) return Heart
  if (name?.includes('Renal') || name?.includes('Kidney')) return Droplets
  if (name?.includes('Metabolic') || name?.includes('Diabetes')) return Activity
  return Stethoscope
}

function getPillarColor(name: string) {
  if (name?.includes('Cardio') || name?.includes('Heart')) return { color: "#DC2626", bg: "#DC262612" }
  if (name?.includes('Renal') || name?.includes('Kidney')) return { color: "#0F76E0", bg: "#0F76E012" }
  if (name?.includes('Metabolic') || name?.includes('Diabetes')) return { color: "#D97706", bg: "#D9770612" }
  return { color: "var(--color-forest)", bg: "var(--color-surface-2)" }
}

function getMinDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1) // minimum next day
  return d.toISOString().split('T')[0]
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function NewBooking() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: packagesResponse, isLoading: packagesLoading } = usePackages()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form state
  const [selectedPackage, setSelectedPackage] = useState("")
  const [locationType, setLocationType] = useState("")
  const [selectedLab, setSelectedLab] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const packagesRaw = packagesResponse?.data || packagesResponse
  const packages = packagesRaw?.data || packagesRaw || []
  const selectedPkg = packages.find((p: any) => (p._id || p.id) === selectedPackage)

  const { data: labsData } = useLaboratories(selectedPkg ? { packageId: selectedPkg._id || selectedPkg.id } : undefined)
  const labs = labsData?.items || labsData?.data || labsData || []

  // Patient info (pre-filled from auth)
  const [patientInfo, setPatientInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    emergencyContact: "",
    emergencyPhone: "",
  })

  // Medical checklist
  const [medicalInfo, setMedicalInfo] = useState({
    hasAllergies: false,
    allergyDetails: "",
    onMedication: false,
    medicationDetails: "",
    recentSurgery: false,
    surgeryDetails: "",
  })

  // Consent
  const [consentPrep, setConsentPrep] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)

  // Booking result
  const [bookingResult, setBookingResult] = useState<any>(null)

  // Pre-fill user data on mount
  useEffect(() => {
    if (user) {
      setPatientInfo(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  // Derived data
  const selectedLabData = labs.find((l: any) => (l._id || l.id) === selectedLab)
  const requiresFasting = selectedPkg?.requiresFasting || selectedPkg?.features?.some((f: string) => f.toLowerCase().includes('fasting'))

  // Package price display — handle both pesewa and cedi formats
  const getDisplayPrice = (pkg: any) => {
    if (!pkg) return "0.00"
    const price = pkg.price || 0
    return (price / 100).toFixed(2)
  }

  // ─── Validation ─────────────────────────────────────────────────────────

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1: return !!selectedPackage
      case 2: return !!locationType && !!date && !!time && (locationType === 'HOME' || !!selectedLab)
      case 3: return !!patientInfo.firstName && !!patientInfo.lastName && !!patientInfo.email && !!patientInfo.phone && consentPrep && consentTerms
      case 4: return true
      default: return false
    }
  }

  // ─── Submission ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const scheduledAt = new Date(`${date}T${time}:00`)
      const result = await bookingService.createBooking({
        patientId: (user as any)?.patientId || (user as any)?._id || user?.id,
        packageId: selectedPackage,
        locationType,
        laboratoryId: selectedLab || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: selectedPkg?.duration || 30,
        emergencyContact: patientInfo.emergencyContact,
        emergencyPhone: patientInfo.emergencyPhone,
        medicalNotes: buildMedicalNotes(),
      })
      setBookingResult(result?.data || result)
      setStep(5)
      toast.success("Booking created successfully!")
    } catch (error: any) {
      console.error("Booking failed", error)
      toast.error(error?.response?.data?.message || "Failed to create booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const buildMedicalNotes = () => {
    const notes: string[] = []
    if (medicalInfo.hasAllergies) notes.push(`Allergies: ${medicalInfo.allergyDetails}`)
    if (medicalInfo.onMedication) notes.push(`Medications: ${medicalInfo.medicationDetails}`)
    if (medicalInfo.recentSurgery) notes.push(`Recent surgery: ${medicalInfo.surgeryDetails}`)
    return notes.length > 0 ? notes.join('; ') : undefined
  }

  const handleCopyCode = () => {
    const code = bookingResult?.referralCode || ""
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Referral code copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNext = () => {
    if (step === 4) {
      handleSubmit()
    } else {
      setStep(s => Math.min(5, s + 1))
    }
  }

  const handleBack = () => {
    if (step === 1) {
      navigate('/client/dashboard')
    } else {
      setStep(s => Math.max(1, s - 1))
    }
  }

  if (packagesLoading) {
    return <LoadingState message="Loading available packages..." />
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">

      {/* ── PROGRESS HEADER ── */}
      {step < 5 && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)] px-[24px] py-[20px]">
          <div className="mx-auto max-w-[900px]">
            {/* Back button + Step info */}
            <div className="flex items-center justify-between mb-[16px]">
              <button onClick={handleBack} className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{step === 1 ? "Dashboard" : "Back"}</span>
              </button>
              <div className="text-[13px] font-medium text-[var(--color-text-muted)]">
                Step {step} of 4
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-[8px]">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 flex flex-col items-center gap-[8px]">
                  <div className="w-full h-[4px] rounded-full overflow-hidden bg-[var(--color-surface-2)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        step > s ? 'bg-[var(--color-forest)] w-full' :
                        step === s ? 'bg-[var(--color-lime-dark)] w-full' :
                        'w-0'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:block ${
                    step >= s ? 'text-[var(--color-forest)]' : 'text-[var(--color-text-muted)]'
                  }`}>
                    {STEP_LABELS[s - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 py-[32px] md:py-[48px] px-[24px]">
        <div className="mx-auto max-w-[900px]">

          {/* ━━━ STEP 1: PACKAGE SELECTION ━━━ */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-[8px]">Choose Your Screening Package</h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">Select the health areas you want to screen. Each package includes a comprehensive panel of biomarker tests.</p>
              </div>

              <div className="grid gap-[16px] md:grid-cols-2">
                {packages.map((pkg: any) => {
                  const pkgId = pkg._id || pkg.id
                  const isSelected = selectedPackage === pkgId
                  const Icon = getPillarIcon(pkg.name)
                  const colors = getPillarColor(pkg.name)
                  const features = pkg.features || pkg.tests || []
                  const isMostPopular = pkg.isMostPopular || pkg.name?.includes('Complete') || pkg.name?.includes('Comprehensive')

                  return (
                    <div
                      key={pkgId}
                      onClick={() => setSelectedPackage(pkgId)}
                      className={`relative flex flex-col rounded-[var(--radius-xl)] border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-[var(--color-forest)] shadow-md ring-1 ring-[var(--color-forest)]/10'
                          : 'border-[var(--color-border)] hover:border-[var(--color-forest)]/30 hover:shadow-sm'
                      }`}
                    >
                      {/* Popular badge */}
                      {isMostPopular && (
                        <div className="absolute top-0 right-0 bg-[var(--color-forest)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-xl">
                          Most Popular
                        </div>
                      )}

                      {/* Card content */}
                      <div className="p-[24px] flex-1">
                        {/* Header row: Icon + Price */}
                        <div className="flex items-start justify-between mb-[16px]">
                          <div className="flex items-center gap-[12px]">
                            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full" style={{ backgroundColor: colors.bg }}>
                              <Icon className="h-[22px] w-[22px]" style={{ color: colors.color }} />
                            </div>
                            <div>
                              <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">{pkg.name}</h3>
                              <div className="flex items-center gap-2 mt-[4px]">
                                <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
                                  <Clock className="h-3 w-3" /> ~{pkg.duration || 30} mins
                                </span>
                                {(pkg.requiresFasting) && (
                                  <span className="flex items-center gap-1 text-[12px] text-[#D97706] font-medium">
                                    <AlertTriangle className="h-3 w-3" /> Fasting
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-serif text-[24px] font-bold text-[var(--color-forest)]">
                              GH₵{getDisplayPrice(pkg)}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="font-sans text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-[16px]">
                          {pkg.description}
                        </p>

                        {/* Tests list */}
                        <div className="space-y-[6px]">
                          <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[8px]">Tests Included ({features.length})</div>
                          {features.slice(0, 4).map((test: string, i: number) => (
                            <div key={i} className="flex items-center gap-[8px] text-[13px] text-[var(--color-text-secondary)]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-lime-dark)] shrink-0" />
                              <span>{test}</span>
                            </div>
                          ))}
                          {features.length > 4 && (
                            <div className="text-[12px] text-[var(--color-text-muted)] ml-[22px]">
                              + {features.length - 4} more tests
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className={`px-[24px] py-[14px] border-t transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-forest)] border-[var(--color-forest)]'
                          : 'bg-[var(--color-surface-2)]/50 border-[var(--color-border)]'
                      }`}>
                        <div className="flex items-center justify-center gap-2">
                          {isSelected ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-[var(--color-lime)]" />
                              <span className="text-[13px] font-semibold text-white">Selected</span>
                            </>
                          ) : (
                            <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Click to select</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ━━━ STEP 2: APPOINTMENT DETAILS ━━━ */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-[8px]">Schedule Your Appointment</h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">Choose where and when you'd like to have your screening.</p>
              </div>

              {/* Fasting advisory */}
              {requiresFasting && (
                <div className="flex items-start gap-[16px] p-[20px] bg-[#FFFBEB] border border-[#D97706]/20 rounded-[var(--radius-lg)] mb-[28px]">
                  <div className="shrink-0 flex items-center justify-center h-[40px] w-[40px] rounded-full bg-[#D97706]/10">
                    <AlertTriangle className="h-5 w-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#92400E] mb-[4px]">Fasting Required</h4>
                    <p className="text-[13px] text-[#92400E]/80 leading-relaxed">
                      Your selected package (<strong>{selectedPkg?.name}</strong>) requires an <strong>8–12 hour fast</strong> before sample collection.
                      Drink only water — no food, juice, coffee, or alcohol. Morning appointments are recommended for comfort.
                    </p>
                  </div>
                </div>
              )}

              {/* Location Type */}
              <div className="mb-[28px]">
                <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[12px] block">Where would you like to be seen?</Label>
                <div className="grid sm:grid-cols-2 gap-[12px]">
                  {[
                    {
                      type: "HOME",
                      icon: MapPin,
                      title: "Home Collection",
                      description: "A certified phlebotomist will come to your location for sample collection.",
                      note: "Coming Soon — Currently unavailable",
                      disabled: true
                    },
                    {
                      type: "CLINIC",
                      icon: Building2,
                      title: "In-Clinic Visit",
                      description: "Visit one of our certified partner laboratories for your screening.",
                      note: "Walk-in at your scheduled time",
                      disabled: false
                    }
                  ].map((loc) => (
                    <div
                      key={loc.type}
                      onClick={() => {
                        if (loc.disabled) return;
                        setLocationType(loc.type);
                        if (loc.type === 'HOME') setSelectedLab("");
                      }}
                      className={`rounded-[var(--radius-lg)] border-2 p-[20px] transition-all duration-200 ${
                        loc.disabled
                          ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] bg-gray-50'
                          : locationType === loc.type
                            ? 'cursor-pointer border-[var(--color-forest)] bg-[var(--color-surface-2)]/50 shadow-sm'
                            : 'cursor-pointer border-[var(--color-border)] hover:border-[var(--color-forest)]/30'
                      }`}
                    >
                      <div className="flex items-start gap-[14px]">
                        <div className={`shrink-0 flex h-[40px] w-[40px] items-center justify-center rounded-full ${
                          locationType === loc.type ? 'bg-[var(--color-forest)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                        }`}>
                          <loc.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-sans text-[15px] font-bold text-[var(--color-text-primary)] mb-[4px]">
                            {loc.title}
                          </h4>
                          <p className="font-sans text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-[8px]">{loc.description}</p>
                          <span className={`text-[11px] font-medium italic ${loc.disabled ? 'text-red-500' : 'text-[var(--color-text-muted)]'}`}>
                            {loc.note}
                          </span>
                        </div>
                        {locationType === loc.type && (
                          <CheckCircle className="h-5 w-5 text-[var(--color-forest)] shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Laboratory selection (for CLINIC only) */}
              {locationType === "CLINIC" && (
                <div className="mb-[28px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[12px] block">Select a Partner Laboratory</Label>
                  <div className="flex flex-col gap-[10px]">
                    {(Array.isArray(labs) ? labs : []).map((lab: any) => {
                      const labId = lab._id || lab.id
                      const isLSelected = selectedLab === labId
                      return (
                        <div
                          key={labId}
                          onClick={() => setSelectedLab(labId)}
                          className={`flex items-center justify-between p-[18px] rounded-[var(--radius-lg)] border-2 cursor-pointer transition-all ${
                            isLSelected
                              ? 'border-[var(--color-forest)] bg-[var(--color-surface-2)]/50 shadow-sm'
                              : 'border-[var(--color-border)] hover:border-[var(--color-forest)]/30'
                          }`}
                        >
                          <div className="flex items-center gap-[14px]">
                            <div className={`shrink-0 flex h-[40px] w-[40px] items-center justify-center rounded-full ${
                              isLSelected ? 'bg-[var(--color-forest)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                            }`}>
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-sans text-[14px] font-bold text-[var(--color-text-primary)]">{lab.name}</h4>
                              <div className="flex items-center gap-[8px] mt-[2px]">
                                <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                                  <MapPin className="h-3 w-3" /> {
                                    typeof (lab.location?.address || lab.address) === 'object' 
                                      ? [lab.address?.street, lab.address?.city].filter(Boolean).join(', ') || "Ghana"
                                      : (lab.location?.address || lab.address || "Ghana")
                                  }
                                </span>
                                {lab.rating && (
                                  <span className="flex items-center gap-1 text-[12px] text-[#D97706] font-medium">
                                    <Star className="h-3 w-3 fill-current" /> {lab.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-[11px] font-medium text-[var(--color-lime-dark)] bg-[#16A34A]/10 px-2 py-1 rounded-full">CareVo Certified</span>
                            {isLSelected && <CheckCircle className="h-5 w-5 text-[var(--color-forest)]" />}
                          </div>
                        </div>
                      )
                    })}
                    {(!Array.isArray(labs) || labs.length === 0) && (
                      <div className="p-[24px] text-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]">
                        <Building2 className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                        <p className="text-[14px] text-[var(--color-text-muted)]">No laboratories available yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-[20px]">
                {/* Date */}
                <div>
                  <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[12px] block">
                    Preferred Date
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-[14px] top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-[40px] h-[52px] text-[15px] bg-white border-[var(--color-border)] focus:border-[var(--color-forest)] rounded-[var(--radius-md)]"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={getMinDate()}
                    />
                  </div>
                  {requiresFasting && date && (
                    <p className="text-[12px] text-[#D97706] mt-[8px] flex items-center gap-1">
                      <Info className="h-3 w-3" /> Begin fasting the evening before — no food after 10 PM.
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[12px] block">
                    Preferred Time
                  </Label>
                  <div className="grid grid-cols-2 gap-[8px]">
                    {TIME_SLOTS.map((slot) => {
                      const isDisabled = !date
                      const isSelected = time === slot.value
                      const isMorning = slot.period === "morning"
                      return (
                        <button
                          key={slot.value}
                          disabled={isDisabled}
                          onClick={() => setTime(slot.value)}
                          className={`flex items-center justify-center gap-[6px] px-[12px] py-[12px] rounded-[var(--radius-sm)] border-2 text-[13px] font-medium transition-all ${
                            isDisabled ? 'opacity-40 cursor-not-allowed border-[var(--color-border)] bg-gray-50 text-[var(--color-text-muted)]' :
                            isSelected ? 'border-[var(--color-forest)] bg-[var(--color-forest)] text-white shadow-sm' :
                            'border-[var(--color-border)] hover:border-[var(--color-forest)]/30 text-[var(--color-text-secondary)] bg-white'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {slot.label}
                          {requiresFasting && isMorning && !isSelected && !isDisabled && (
                            <span className="text-[9px] text-[#16A34A] font-bold">★</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {!date && (
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-[8px]">Select a date first to choose a time slot.</p>
                  )}
                  {requiresFasting && date && (
                    <p className="text-[11px] text-[#16A34A] mt-[8px]">★ Morning slots recommended for fasting tests.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ━━━ STEP 3: PATIENT INFORMATION ━━━ */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-[8px]">Verify Your Information</h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">Please confirm your details and provide medical information for a safe screening experience.</p>
              </div>

              {/* Personal details */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[28px] mb-[24px] shadow-sm">
                <div className="flex items-center gap-[10px] mb-[24px]">
                  <User className="h-5 w-5 text-[var(--color-forest)]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Personal Details</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-[16px]">
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">First Name *</Label>
                    <Input
                      value={patientInfo.firstName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">Last Name *</Label>
                    <Input
                      value={patientInfo.lastName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      <Mail className="h-3 w-3 inline mr-1" /> Email *
                    </Label>
                    <Input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      <Phone className="h-3 w-3 inline mr-1" /> Phone *
                    </Label>
                    <Input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                      placeholder="e.g. 024 123 4567"
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency contact */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[28px] mb-[24px] shadow-sm">
                <div className="flex items-center gap-[10px] mb-[24px]">
                  <Shield className="h-5 w-5 text-[#0F76E0]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Emergency Contact</h3>
                  <span className="text-[12px] text-[var(--color-text-muted)] font-medium">(Recommended)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-[16px]">
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">Contact Name</Label>
                    <Input
                      value={patientInfo.emergencyContact}
                      onChange={(e) => setPatientInfo({ ...patientInfo, emergencyContact: e.target.value })}
                      placeholder="Full name"
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">Contact Phone</Label>
                    <Input
                      type="tel"
                      value={patientInfo.emergencyPhone}
                      onChange={(e) => setPatientInfo({ ...patientInfo, emergencyPhone: e.target.value })}
                      placeholder="e.g. 024 987 6543"
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Medical history */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[28px] mb-[24px] shadow-sm">
                <div className="flex items-center gap-[10px] mb-[24px]">
                  <Stethoscope className="h-5 w-5 text-[#D97706]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Medical History</h3>
                </div>
                <div className="space-y-[20px]">
                  {/* Allergies */}
                  <div>
                    <label className="flex items-center gap-[10px] cursor-pointer mb-[8px]">
                      <input
                        type="checkbox"
                        checked={medicalInfo.hasAllergies}
                        onChange={(e) => setMedicalInfo({ ...medicalInfo, hasAllergies: e.target.checked })}
                        className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                      />
                      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">I have known allergies</span>
                    </label>
                    {medicalInfo.hasAllergies && (
                      <Input
                        value={medicalInfo.allergyDetails}
                        onChange={(e) => setMedicalInfo({ ...medicalInfo, allergyDetails: e.target.value })}
                        placeholder="Please describe (e.g., latex, iodine, medications)"
                        className="ml-[28px] h-[44px] animate-in fade-in slide-in-from-top-2 duration-200"
                      />
                    )}
                  </div>

                  {/* Medications */}
                  <div>
                    <label className="flex items-center gap-[10px] cursor-pointer mb-[8px]">
                      <input
                        type="checkbox"
                        checked={medicalInfo.onMedication}
                        onChange={(e) => setMedicalInfo({ ...medicalInfo, onMedication: e.target.checked })}
                        className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                      />
                      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">I am currently on medication</span>
                    </label>
                    {medicalInfo.onMedication && (
                      <Input
                        value={medicalInfo.medicationDetails}
                        onChange={(e) => setMedicalInfo({ ...medicalInfo, medicationDetails: e.target.value })}
                        placeholder="List current medications"
                        className="ml-[28px] h-[44px] animate-in fade-in slide-in-from-top-2 duration-200"
                      />
                    )}
                  </div>

                  {/* Recent surgery */}
                  <div>
                    <label className="flex items-center gap-[10px] cursor-pointer mb-[8px]">
                      <input
                        type="checkbox"
                        checked={medicalInfo.recentSurgery}
                        onChange={(e) => setMedicalInfo({ ...medicalInfo, recentSurgery: e.target.checked })}
                        className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                      />
                      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">I have had surgery in the last 6 months</span>
                    </label>
                    {medicalInfo.recentSurgery && (
                      <Input
                        value={medicalInfo.surgeryDetails}
                        onChange={(e) => setMedicalInfo({ ...medicalInfo, surgeryDetails: e.target.value })}
                        placeholder="Brief description and date"
                        className="ml-[28px] h-[44px] animate-in fade-in slide-in-from-top-2 duration-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[28px]">
                <div className="flex items-center gap-[10px] mb-[20px]">
                  <Shield className="h-5 w-5 text-[var(--color-forest)]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Consent & Acknowledgement</h3>
                </div>
                <div className="space-y-[16px]">
                  <label className="flex items-start gap-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentPrep}
                      onChange={(e) => setConsentPrep(e.target.checked)}
                      className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)] mt-[2px]"
                    />
                    <span className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
                      I understand the preparation requirements for this screening
                      {requiresFasting && " (including the 8–12 hour fasting requirement)"}
                      , and I confirm that the medical information provided above is accurate.
                    </span>
                  </label>
                  <label className="flex items-start gap-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)] mt-[2px]"
                    />
                    <span className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
                      I agree to CareVo's Terms of Service and Privacy Policy, and I consent to having my health data securely stored and processed for clinical purposes.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ━━━ STEP 4: REVIEW & CONFIRM ━━━ */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[32px]">
                <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-[8px]">Review Your Booking</h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">Please review all details before confirming. You'll receive your referral code upon confirmation.</p>
              </div>

              <div className="grid md:grid-cols-[1fr_340px] gap-[24px]">
                {/* Main summary */}
                <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-sm">
                  {/* Package */}
                  <div className="p-[24px] border-b border-[var(--color-border)]">
                    <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[12px]">Screening Package</div>
                    <div className="flex items-center gap-[14px]">
                      {(() => {
                        const Icon = getPillarIcon(selectedPkg?.name || "")
                        const colors = getPillarColor(selectedPkg?.name || "")
                        return (
                          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full" style={{ backgroundColor: colors.bg }}>
                            <Icon className="h-[22px] w-[22px]" style={{ color: colors.color }} />
                          </div>
                        )
                      })()}
                      <div>
                        <h4 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)]">{selectedPkg?.name}</h4>
                        <p className="text-[13px] text-[var(--color-text-secondary)]">
                          {(selectedPkg?.features || selectedPkg?.tests || []).length} tests included • ~{selectedPkg?.duration || 30} mins
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment */}
                  <div className="p-[24px] border-b border-[var(--color-border)]">
                    <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[12px]">Appointment Details</div>
                    <div className="grid sm:grid-cols-2 gap-[16px]">
                      <div className="flex items-center gap-[10px]">
                        <CalendarIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">Date</div>
                          <div className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[10px]">
                        <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">Time</div>
                          <div className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {TIME_SLOTS.find(s => s.value === time)?.label || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[10px]">
                        {locationType === 'HOME' ? <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" /> : <Building2 className="h-4 w-4 text-[var(--color-text-muted)]" />}
                        <div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">Location</div>
                          <div className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {locationType === 'HOME' ? 'Home Collection' : selectedLabData?.name || 'In-Clinic Visit'}
                          </div>
                        </div>
                      </div>
                      {requiresFasting && (
                        <div className="flex items-center gap-[10px]">
                          <AlertTriangle className="h-4 w-4 text-[#D97706]" />
                          <div>
                            <div className="text-[11px] text-[#D97706]">Preparation</div>
                            <div className="text-[14px] font-medium text-[#D97706]">8–12 hour fast required</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient */}
                  <div className="p-[24px]">
                    <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[12px]">Patient</div>
                    <div className="text-[15px] font-medium text-[var(--color-text-primary)]">{patientInfo.firstName} {patientInfo.lastName}</div>
                    <div className="text-[13px] text-[var(--color-text-secondary)] mt-1">{patientInfo.email} • {patientInfo.phone}</div>
                  </div>
                </div>

                {/* Price card */}
                <div className="bg-[var(--color-forest)] rounded-[var(--radius-xl)] p-[28px] text-white shadow-lg self-start sticky top-[120px]">
                  <div className="text-[12px] uppercase tracking-wider font-bold text-white/60 mb-[20px]">Order Summary</div>

                  <div className="space-y-[14px] mb-[20px]">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-white/80">{selectedPkg?.name}</span>
                      <span className="font-medium">GH₵{getDisplayPrice(selectedPkg)}</span>
                    </div>
                    {locationType === 'HOME' && (
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="text-white/80">Home collection fee</span>
                        <span className="font-medium text-white/60">Included</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/20 pt-[16px] flex justify-between items-center">
                    <span className="text-[15px] text-white/80">Total</span>
                    <span className="font-serif text-[28px] font-bold text-[var(--color-lime)]">GH₵{getDisplayPrice(selectedPkg)}</span>
                  </div>

                  <div className="mt-[16px] text-[12px] text-white/50 text-center">
                    Payment will be processed via Paystack after confirmation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ━━━ STEP 5: CONFIRMATION ━━━ */}
          {step === 5 && (
            <div className="animate-in zoom-in-95 duration-500 max-w-[640px] mx-auto text-center py-[32px]">
              {/* Success animation */}
              <div className="flex justify-center mb-[24px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--color-lime)]/20 rounded-full animate-ping"></div>
                  <div className="relative flex items-center justify-center h-[80px] w-[80px] bg-[#F0FDF4] rounded-full border-2 border-[#16A34A]/20">
                    <CheckCircle className="h-[40px] w-[40px] text-[#16A34A]" />
                  </div>
                </div>
              </div>

              <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] mb-[8px]">Booking Confirmed!</h1>
              <p className="font-sans text-[16px] text-[var(--color-text-secondary)] mb-[40px]">
                Your screening has been scheduled. Check your email for details.
              </p>

              {/* Referral code card */}
              {bookingResult?.referralCode && (
                <div className="bg-[var(--color-forest)] rounded-[var(--radius-xl)] p-[40px] shadow-lg mb-[24px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <QrCode className="w-40 h-40" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-[16px]">Your Referral Code</div>
                    <div className="font-serif text-[36px] sm:text-[44px] font-bold tracking-[0.12em] text-[var(--color-lime)] leading-tight mb-[12px]">
                      {bookingResult.referralCode}
                    </div>
                    <p className="font-sans text-[14px] text-white/70">
                      Present this code at the laboratory reception.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-[12px] mb-[40px]">
                <Button variant="outline" className="gap-2" onClick={handleCopyCode}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied ✓" : "Copy Code"}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm text-left overflow-hidden mb-[32px]">
                <div className="bg-[var(--color-surface-2)] px-[24px] py-[16px] border-b border-[var(--color-border)] flex justify-between items-center">
                  <span className="font-mono text-[15px] font-bold text-[var(--color-forest)] tracking-widest">{bookingResult?.referralCode || "—"}</span>
                  <span className="bg-[#FEF9C3] text-[#A16207] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Pending Lab Confirmation</span>
                </div>
                <div className="p-[24px] space-y-[16px]">
                  <div className="grid sm:grid-cols-2 gap-[16px]">
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Package</div>
                      <div className="font-medium text-[14px]">{selectedPkg?.name}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Date & Time</div>
                      <div className="font-medium text-[14px]">
                        {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"} at {TIME_SLOTS.find(s => s.value === time)?.label || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Location</div>
                      <div className="font-medium text-[14px]">{locationType === 'HOME' ? 'Home Collection' : selectedLabData?.name || 'In-Clinic Visit'}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Total</div>
                      <div className="font-serif text-[18px] font-bold text-[var(--color-forest)]">GH₵{getDisplayPrice(selectedPkg)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preparation guide */}
              <div className="text-left bg-[var(--color-surface-2)] p-[24px] rounded-[var(--radius-xl)] mb-[40px] border border-[var(--color-border)]">
                <h4 className="font-bold text-[15px] mb-[16px] text-[var(--color-text-primary)]">What to Expect</h4>
                <ol className="list-decimal list-inside space-y-[12px] text-[14px] text-[var(--color-text-secondary)]">
                  <li>The laboratory will confirm your booking within <strong>2 hours</strong>.</li>
                  <li>Check your email for appointment details and your referral code.</li>
                  {requiresFasting && <li><span className="font-semibold text-[#D97706]">Begin fasting 8–12 hours before your appointment. Drink water only.</span></li>}
                  <li>Arrive <strong>10 minutes early</strong> and present your referral code at reception.</li>
                  <li>Results will be available within <strong>2–5 business days</strong> on your CareVo dashboard.</li>
                </ol>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-[12px] justify-center">
                <Button onClick={() => navigate('/client/dashboard')} className="h-[52px] px-[28px] text-[15px]">
                  Go to My Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/client/billing')} className="h-[52px] px-[28px] text-[15px]">
                  View Billing
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── FOOTER ACTIONS (Steps 1-4) ── */}
      {step < 5 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)] p-[20px] z-40">
          <div className="mx-auto max-w-[900px] flex justify-between items-center">
            <Button variant="ghost" onClick={handleBack} className="text-[14px] gap-1">
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Dashboard" : "Back"}
            </Button>

            <div className="flex items-center gap-[16px]">
              {selectedPkg && step > 1 && (
                <div className="hidden sm:flex items-center gap-[8px] text-[13px] text-[var(--color-text-secondary)]">
                  <span className="font-medium">{selectedPkg?.name}</span>
                  <span className="text-[var(--color-text-muted)]">•</span>
                  <span className="font-serif font-bold text-[var(--color-forest)]">GH₵{getDisplayPrice(selectedPkg)}</span>
                </div>
              )}

              <Button
                onClick={handleNext}
                className="h-[48px] px-[28px] text-[14px] gap-2"
                disabled={!canProceed(step) || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirming...
                  </>
                ) : step === 4 ? (
                  <>Confirm Booking</>
                ) : (
                  <>Continue <ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
