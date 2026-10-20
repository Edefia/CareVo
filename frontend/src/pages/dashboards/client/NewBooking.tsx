import { useState, useEffect, useMemo } from "react"
import {
  ArrowLeft, CheckCircle, ChevronRight, MapPin,
  Calendar as CalendarIcon, Clock,
  Copy, Info, QrCode,
  Shield, User, Phone, Mail, AlertTriangle,
  Stethoscope, Building2, Star, Search,
  CreditCard, ArrowRight, Sparkles, Check
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
import {
  type IndividualTest
} from "@/lib/individualTests"
import { CardCornerPattern } from "@/components/shared/CardCornerPattern"
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

const STEP_LABELS = ["Select Test", "Choose Lab", "Schedule", "Patient Info", "Review", "Confirmed"]

// Categories are now dynamically generated from the tests

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMinDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1) // minimum next day
  return d.toISOString().split('T')[0]
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'General Health':
      return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' }
    case 'Chronic & Metabolic':
      return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' }
    case 'Infectious Disease':
      return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444' }
    case 'Sexual & Reproductive Health':
      return { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF', dot: '#A855F7' }
    default:
      return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', dot: '#6B7280' }
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function NewBooking() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: packagesResponse, isLoading: packagesLoading } = usePackages()

  const [searchParams] = window.location.search
    ? [new URLSearchParams(window.location.search)]
    : [new URLSearchParams()]

  const initialPackage = searchParams.get('package') || ""
  const initialTestName = searchParams.get('test') || ""

  // Step state: if a test or package is passed via URL, start directly on Step 2 (Choose Lab)
  const [step, setStep] = useState(initialPackage || initialTestName ? 2 : 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Test catalog state for Step 1
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Tests")

  // Form state
  const [selectedTestName, setSelectedTestName] = useState(initialTestName)
  const [selectedPackage, setSelectedPackage] = useState(initialPackage)
  const [locationType, setLocationType] = useState("CLINIC")
  const [selectedLab, setSelectedLab] = useState(user?.role === 'LABORATORY' ? (user as any).laboratoryId || user.id : "")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  // Normalize packages
  const packagesRaw = packagesResponse?.data || packagesResponse
  const packages = packagesRaw?.data || packagesRaw || []

  // Generate catalog of individual tests directly from packages
  const individualTests = useMemo(() => {
    if (!Array.isArray(packages)) return []
    return packages.map((pkg: any) => ({
      id: pkg._id || pkg.id,
      name: pkg.name,
      category: pkg.category || 'General Health',
      description: pkg.description || 'Comprehensive diagnostic test.',
      sampleType: pkg.sampleType || 'Blood (Venous)',
      fastingRequired: pkg.fastingRequired || pkg.testsIncluded?.some((t: string) => t.toLowerCase().includes('fasting')) || false,
      fastingHours: pkg.fastingHours || '',
      turnaroundTime: pkg.turnaroundTime || '24-48 hours',
      packageId: pkg._id || pkg.id,
      commonFor: pkg.commonFor || (pkg.testsIncluded?.length ? pkg.testsIncluded.join(", ") : "Routine checkup"),
      color: pkg.color
    } as IndividualTest))
  }, [packages])

  const categoriesList = useMemo(() => {
    const cats = new Set(individualTests.map(t => t.category).filter(Boolean))
    return ["All Tests", ...Array.from(cats)]
  }, [individualTests])

  // Resolve currently selected individual test
  const selectedTest: IndividualTest | undefined = useMemo(() => {
    if (selectedTestName) {
      const match = individualTests.find(
        (t) =>
          t.name.toLowerCase() === selectedTestName.toLowerCase() ||
          t.id.toLowerCase() === selectedTestName.toLowerCase()
      )
      if (match) return match
    }
    if (selectedPackage) {
      return individualTests.find((t) => t.packageId === selectedPackage)
    }
    return undefined
  }, [selectedTestName, selectedPackage, individualTests])

  // If selectedTest is resolved and has a packageId, keep selectedPackage synced
  useEffect(() => {
    if (selectedTest?.packageId && selectedPackage !== selectedTest.packageId) {
      setSelectedPackage(selectedTest.packageId)
    }
  }, [selectedTest, selectedPackage])

  // If initialTestName was in query params and we found the test, sync its name
  useEffect(() => {
    if (initialTestName && !selectedTestName) {
      setSelectedTestName(initialTestName)
    }
  }, [initialTestName, selectedTestName])

  // Resolved package for API hook
  const selectedPkg = packages.find(
    (p: any) => (p._id || p.id) === (selectedPackage || selectedTest?.packageId)
  )

  // Laboratories offering this test
  const { data: labsData, isLoading: labsLoading } = useLaboratories(
    (selectedPkg || selectedTest?.packageId) ? { packageId: selectedPkg?._id || selectedPkg?.id || selectedTest?.packageId } : undefined
  )
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
      setPatientInfo((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  // Derived data
  const selectedLabData = Array.isArray(labs)
    ? labs.find((l: any) => (l._id || l.id) === selectedLab)
    : undefined

  const requiresFasting =
    selectedTest?.fastingRequired ||
    selectedPkg?.requiresFasting ||
    selectedPkg?.features?.some((f: string) => f.toLowerCase().includes("fasting"))

  // Price display based on selected lab
  const getDisplayPrice = () => {
    if (selectedLabData && selectedLabData.packagePrice) {
      return Number(selectedLabData.packagePrice).toFixed(2)
    }
    return "0.00"
  }

  // Filtered tests for Step 1
  const filteredTests = useMemo(() => {
    return individualTests.filter((t) => {
      const matchesCategory =
        selectedCategory === "All Tests" || t.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.commonFor.toLowerCase().includes(query) ||
        t.sampleType.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
  }, [individualTests, selectedCategory, searchQuery])

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleSelectTest = (test: IndividualTest) => {
    setSelectedTestName(test.name)
    if (test.packageId) {
      setSelectedPackage(test.packageId)
    }
    // Proceed directly to Step 2 (Choose Laboratory)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return !!selectedTestName || !!selectedPackage
      case 2:
        return !!locationType && (locationType === "HOME" || !!selectedLab)
      case 3:
        return !!date && !!time
      case 4:
        return (
          !!patientInfo.firstName &&
          !!patientInfo.lastName &&
          !!patientInfo.email &&
          !!patientInfo.phone &&
          consentPrep &&
          consentTerms
        )
      case 5:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const scheduledAt = new Date(`${date}T${time}:00`)
      const effectivePackageId = selectedPackage || selectedTest?.packageId

      const result = await bookingService.createBooking({
        patientId: (user as any)?.patientId || (user as any)?._id || user?.id,
        packageId: effectivePackageId,
        locationType,
        laboratoryId: selectedLab || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: selectedPkg?.duration || 30,
        emergencyContact: patientInfo.emergencyContact,
        emergencyPhone: patientInfo.emergencyPhone,
        medicalNotes: buildMedicalNotes(),
        reason: selectedTest ? `Test: ${selectedTest.name}` : (selectedPkg?.name || 'Screening Booking'),
      })

      setBookingResult(result?.data || result)
      setStep(6)
      toast.success("Booking created successfully!")
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      console.error("Booking failed", error)
      toast.error(
        error?.response?.data?.message || "Failed to create booking. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const buildMedicalNotes = () => {
    const notes: string[] = []
    if (medicalInfo.hasAllergies) notes.push(`Allergies: ${medicalInfo.allergyDetails}`)
    if (medicalInfo.onMedication) notes.push(`Medications: ${medicalInfo.medicationDetails}`)
    if (medicalInfo.recentSurgery) notes.push(`Recent surgery: ${medicalInfo.surgeryDetails}`)
    return notes.length > 0 ? notes.join("; ") : undefined
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
    if (step === 5) {
      handleSubmit()
    } else {
      setStep((s) => Math.min(6, s + 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step === 1) {
      navigate(user?.role === 'LABORATORY' ? '/lab/dashboard' : '/client/dashboard')
    } else {
      setStep((s) => Math.max(1, s - 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (packagesLoading) {
    return <LoadingState message="Loading available diagnostic tests..." />
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">

      {/* ── MINIMAL PROGRESS HEADER ── */}
      {step < 6 && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
          {/* Continuous Minimal Progress Line */}
          <div className="h-[3px] w-full bg-[var(--color-surface-2)]">
            <div 
              className="h-full bg-[var(--color-forest)] transition-all duration-500 ease-in-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          
          <div className="px-[20px] py-[12px] mx-auto max-w-[1000px] flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {step === 1 ? "Dashboard" : "Back"}
              </span>
            </button>
            <div className="flex items-center gap-[12px]">
              <span className="text-[12px] font-bold text-[var(--color-text-secondary)]">
                Step {step} <span className="text-[var(--color-text-muted)] font-normal">of 5</span>
              </span>
              <span className="text-[13px] font-semibold text-[var(--color-forest)]">
                {STEP_LABELS[step - 1]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 py-[28px] md:py-[40px] px-[20px] sm:px-[24px]">
        <div className="mx-auto max-w-[1000px]">

          {/* ━━━ STEP 1: INDIVIDUAL TEST SELECTION ━━━ */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-[24px] text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-forest)] text-[12px] font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-lime-dark)]" />
                  Individual Diagnostic Tests
                </div>
                <h1 className="font-serif text-[28px] md:text-[34px] font-bold text-[var(--color-forest)] tracking-tight mb-[8px]">
                  Select the Diagnostic Test You Need
                </h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)] max-w-3xl">
                  Choose a specific test from our accredited diagnostic catalog. After selecting your test, you will choose an accredited partner laboratory to perform it.
                </p>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[16px] md:p-[20px] shadow-sm mb-[24px]">
                <div className="flex flex-col md:flex-row gap-[16px] items-stretch md:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search tests (e.g., Full Blood Count, HbA1c, Malaria, HIV, Lipid...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-[40px] h-[46px] text-[14px] bg-[var(--color-surface-2)]/40 border-[var(--color-border)] focus:bg-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-[12px] top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-forest)] font-medium px-1.5 py-0.5"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Test count badge */}
                  <div className="text-[13px] font-medium text-[var(--color-text-muted)] shrink-0 self-center">
                    Showing <span className="text-[var(--color-forest)] font-bold">{filteredTests.length}</span> diagnostic tests
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-[8px] overflow-x-auto pt-[16px] border-t border-[var(--color-border)]/60 mt-[16px] pb-1 scrollbar-none">
                  {categoriesList.map((cat) => {
                    const isActive = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 px-[14px] py-[8px] rounded-full text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-[var(--color-forest)] text-white shadow-sm"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-forest)]"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Grid of Individual Tests */}
              {filteredTests.length > 0 ? (
                <div className="grid gap-[16px] md:grid-cols-2 lg:grid-cols-3">
                  {filteredTests.map((test) => {
                    const isSelected =
                      selectedTestName.toLowerCase() === test.name.toLowerCase()
                    const catStyle = getCategoryColor(test.category)

                    return (
                      <div
                        key={test.id}
                        onClick={() => handleSelectTest(test)}
                        className={`group relative overflow-hidden flex flex-col justify-between rounded-[var(--radius-xl)] border-2 cursor-pointer transition-all duration-200 bg-white p-[20px] text-left ${
                          isSelected
                            ? "border-[var(--color-forest)] shadow-md ring-2 ring-[var(--color-forest)]/15"
                            : "border-[var(--color-border)] hover:border-[var(--color-forest)]/40 hover:shadow-md"
                        }`}
                      >
                        {/* Decorative line pattern at top right */}
                        <CardCornerPattern patternId={`nb-${test.id || test.name}`} color={catStyle.text || test.color} />

                        <div className="relative z-10">
                          {/* Category Tag & Fasting Badge */}
                          <div className="flex items-center justify-between gap-2 mb-[12px] flex-wrap">
                            <span
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                              style={{
                                backgroundColor: catStyle.bg,
                                color: catStyle.text,
                                border: `1px solid ${catStyle.border}`
                              }}
                            >
                              {test.category}
                            </span>

                            {test.fastingRequired ? (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3" />
                                {test.fastingHours ? `${test.fastingHours} Fast` : 'Fasting'}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                No Fasting
                              </span>
                            )}
                          </div>

                          {/* Test Name */}
                          <h3 className="font-serif text-[17px] font-bold text-[var(--color-forest)] group-hover:text-[var(--color-forest-dark)] transition-colors leading-snug mb-[8px]">
                            {test.name}
                          </h3>

                          {/* Description */}
                          <p className="font-sans text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-[16px] line-clamp-3">
                            {test.description}
                          </p>

                          {/* Specimen and Turnaround Details */}
                          <div className="space-y-[6px] mb-[16px] pt-[12px] border-t border-[var(--color-border)]/60 text-[12px]">
                            <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                              <span className="text-[var(--color-text-muted)] font-medium">Sample:</span>
                              <span className="font-medium text-[var(--color-forest)]">{test.sampleType}</span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                              <span className="text-[var(--color-text-muted)] font-medium">Turnaround:</span>
                              <span className="font-medium text-[var(--color-forest)] flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[var(--color-lime-dark)]" />
                                {test.turnaroundTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CTA button */}
                        <div className="relative z-10 pt-[8px]">
                          <Button
                            size="sm"
                            className={`w-full h-[40px] text-[13px] font-medium gap-1.5 transition-all ${
                              isSelected
                                ? "bg-[var(--color-forest)] text-white"
                                : "bg-[var(--color-surface-2)] text-[var(--color-forest)] hover:bg-[var(--color-forest)] hover:text-white"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectTest(test)
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check className="h-4 w-4 text-[var(--color-lime)]" />
                                Selected — Continue
                              </>
                            ) : (
                              <>
                                Select Test
                                <ChevronRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-[64px] bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[32px]">
                  <Search className="h-10 w-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
                  <h3 className="font-serif text-[18px] font-bold text-[var(--color-forest)] mb-1">
                    No diagnostic tests found
                  </h3>
                  <p className="text-[14px] text-[var(--color-text-secondary)] max-w-md mx-auto mb-4">
                    We couldn't find any test matching "{searchQuery}". Try searching with another term or reset your category filter.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("All Tests")
                    }}
                  >
                    Reset Search & Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ━━━ STEP 2: CHOOSE LABORATORY & SCHEDULE ━━━ */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">

              {/* ── SELECTED TEST CHIP / BANNER ── */}
              <div className="bg-gradient-to-r from-[var(--color-forest)] to-[#1E3A2F] text-white rounded-[var(--radius-xl)] p-[20px] sm:p-[24px] mb-[28px] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] uppercase font-bold tracking-wider text-[var(--color-lime)] mb-[4px]">
                      <Stethoscope className="h-4 w-4" />
                      Selected Diagnostic Test
                    </div>
                    <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-white mb-[6px]">
                      {selectedTest?.name || selectedPkg?.name || "Diagnostic Screening"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-[12px] text-[13px] text-white/80">
                      {selectedTest?.category && (
                        <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-white text-[12px] font-medium">
                          {selectedTest.category}
                        </span>
                      )}
                      {selectedTest?.sampleType && (
                        <span>Sample: <strong className="text-white">{selectedTest.sampleType}</strong></span>
                      )}
                      {selectedTest?.turnaroundTime && (
                        <span>• Results: <strong className="text-white">{selectedTest.turnaroundTime}</strong></span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="self-start sm:self-center bg-white/10 hover:bg-white text-white hover:text-[var(--color-forest)] border-white/30 text-[13px] font-medium shrink-0"
                  >
                    Change Test
                  </Button>
                </div>
              </div>

              {/* Header */}
              <div className="mb-[24px]">
                <h1 className="font-serif text-[26px] md:text-[30px] font-semibold text-[var(--color-forest)] mb-[6px]">
                  Choose Where to Do This Test
                </h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
                  Select a certified partner laboratory for your sample collection.
                </p>
              </div>



              {/* Location Type */}
              <div className="mb-[28px]">
                <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[12px] block">
                  Testing Location Type
                </Label>
                <div className="grid sm:grid-cols-2 gap-[12px]">
                  {[
                    {
                      type: "CLINIC",
                      icon: Building2,
                      title: "In-Clinic Visit",
                      description: "Visit an accredited partner laboratory for professional sample collection.",
                      note: "Recommended • Instant walk-in at scheduled time",
                      disabled: false,
                    },
                    {
                      type: "HOME",
                      icon: MapPin,
                      title: "Home Sample Collection",
                      description: "A certified phlebotomist visits your home or office for sample collection.",
                      note: "Coming Soon — Currently unavailable in your area",
                      disabled: true,
                    },
                  ].map((loc) => (
                    <div
                      key={loc.type}
                      onClick={() => {
                        if (loc.disabled) return
                        setLocationType(loc.type)
                        if (loc.type === "HOME") setSelectedLab("")
                      }}
                      className={`rounded-[var(--radius-lg)] border-2 p-[20px] transition-all duration-200 ${
                        loc.disabled
                          ? "opacity-50 cursor-not-allowed border-[var(--color-border)] bg-gray-50"
                          : locationType === loc.type
                          ? "cursor-pointer border-[var(--color-forest)] bg-[var(--color-surface-2)]/50 shadow-sm"
                          : "cursor-pointer border-[var(--color-border)] hover:border-[var(--color-forest)]/30"
                      }`}
                    >
                      <div className="flex items-start gap-[14px]">
                        <div
                          className={`shrink-0 flex h-[40px] w-[40px] items-center justify-center rounded-full ${
                            locationType === loc.type
                              ? "bg-[var(--color-forest)] text-white"
                              : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          <loc.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-sans text-[15px] font-bold text-[var(--color-text-primary)] mb-[4px]">
                            {loc.title}
                          </h4>
                          <p className="font-sans text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-[8px]">
                            {loc.description}
                          </p>
                          <span
                            className={`text-[11px] font-medium ${
                              loc.disabled ? "text-amber-700" : "text-[var(--color-lime-dark)] font-semibold"
                            }`}
                          >
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

              {/* Laboratory selection (for CLINIC) */}
              {locationType === "CLINIC" && (
                <div className="mb-[28px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-[12px]">
                    <Label className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      Select Where to Do This Test (Partner Laboratories)
                    </Label>
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {Array.isArray(labs) ? labs.length : 0} facilities available
                    </span>
                  </div>

                  {labsLoading ? (
                    <div className="p-8 text-center bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                      <div className="h-6 w-6 border-2 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-[13px] text-[var(--color-text-muted)]">Loading partner laboratories...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[12px]">
                      {(Array.isArray(labs) ? labs : []).map((lab: any) => {
                        const labId = lab._id || lab.id
                        const isLSelected = selectedLab === labId
                        return (
                          <div
                            key={labId}
                            onClick={() => setSelectedLab(labId)}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-[18px] rounded-[var(--radius-lg)] border-2 cursor-pointer transition-all gap-[14px] ${
                              isLSelected
                                ? "border-[var(--color-forest)] bg-[var(--color-surface-2)]/60 shadow-sm"
                                : "border-[var(--color-border)] hover:border-[var(--color-forest)]/40 bg-white"
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-[14px]">
                              <div
                                className={`shrink-0 flex h-[44px] w-[44px] items-center justify-center rounded-full ${
                                  isLSelected
                                    ? "bg-[var(--color-forest)] text-white"
                                    : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                                }`}
                              >
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-sans text-[15px] font-bold text-[var(--color-text-primary)]">
                                    {lab.name}
                                  </h4>
                                  <span className="text-[11px] font-medium text-[var(--color-lime-dark)] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    CareBis Prime Certified
                                  </span>
                                </div>
                                <div className="flex items-center gap-[12px] mt-[4px] text-[12px] text-[var(--color-text-secondary)] flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                                    {typeof (lab.location?.address || lab.address) === "object"
                                      ? [lab.address?.street, lab.address?.city].filter(Boolean).join(", ") || "Accra, Ghana"
                                      : (lab.location?.address || lab.address || "Accra, Ghana")}
                                  </span>
                                  {lab.rating && (
                                    <span className="flex items-center gap-1 text-[#D97706] font-medium">
                                      <Star className="h-3 w-3 fill-current" /> {lab.rating}
                                    </span>
                                  )}
                                  <span className="text-[var(--color-text-muted)]">
                                    • Turnaround: {selectedTest?.turnaroundTime || "24–48 hours"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-[16px] sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Test Fee</div>
                                <div className="font-serif text-[19px] font-bold text-[var(--color-forest)]">
                                  GH₵{lab.packagePrice ? Number(lab.packagePrice).toFixed(2) : "0.00"}
                                </div>
                              </div>
                              <div className="flex flex-col sm:items-end gap-[8px] mt-[12px] sm:mt-0">
                                <Button
                                  variant={isLSelected ? "default" : "outline"}
                                  size="sm"
                                  className={`h-[36px] px-[16px] text-[13px] font-semibold transition-all ${
                                    isLSelected
                                      ? "bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-dark)]"
                                      : "text-[var(--color-forest)] border-[var(--color-forest)]/30 hover:bg-[var(--color-forest)] hover:text-white"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedLab(labId)
                                  }}
                                >
                                  {isLSelected ? "Selected" : "Select Lab"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {(!Array.isArray(labs) || labs.length === 0) && (
                        <div className="p-[28px] text-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] bg-white">
                          <Building2 className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                          <p className="text-[14px] font-medium text-[var(--color-text-primary)] mb-1">
                            No partner laboratories currently listed for this diagnostic test.
                          </p>
                          <p className="text-[12px] text-[var(--color-text-muted)]">
                            Please contact CareBis Prime support or select another diagnostic test.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ━━━ STEP 3: SCHEDULE ━━━ */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Header */}
              <div className="mb-[24px]">
                <h1 className="font-serif text-[26px] md:text-[30px] font-semibold text-[var(--color-forest)] mb-[6px]">
                  Choose Your Appointment Time
                </h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
                  Pick your preferred appointment date and time slot for the test.
                </p>
              </div>

              {/* Fasting advisory */}
              {requiresFasting && (
                <div className="flex items-start gap-[16px] p-[20px] bg-[#FFFBEB] border border-[#D97706]/30 rounded-[var(--radius-lg)] mb-[28px] shadow-sm">
                  <div className="shrink-0 flex items-center justify-center h-[40px] w-[40px] rounded-full bg-[#D97706]/15">
                    <AlertTriangle className="h-5 w-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#92400E] mb-[4px]">
                      Clinical Preparation: Fasting Required ({selectedTest?.fastingHours || '8–12 hours'})
                    </h4>
                    <p className="text-[13px] text-[#92400E]/90 leading-relaxed">
                      This diagnostic test requires an <strong>{selectedTest?.fastingHours || '8–12 hour fast'}</strong> prior to sample collection.
                      Drink water only — strictly avoid solid food, juice, coffee, tea, and alcohol. Morning appointment slots are highly recommended for comfort.
                    </p>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-[20px] bg-white p-[24px] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm">
                {/* Date */}
                <div>
                  <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[10px] block">
                    Preferred Appointment Date *
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-[14px] top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-[40px] h-[50px] text-[15px] bg-[var(--color-surface-2)]/40 border-[var(--color-border)] focus:bg-white focus:border-[var(--color-forest)] rounded-[var(--radius-md)]"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={getMinDate()}
                    />
                  </div>
                  {requiresFasting && date && (
                    <p className="text-[12px] text-[#D97706] mt-[8px] flex items-center gap-1 font-medium">
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      Begin fasting the evening before — no solid food after 10 PM.
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <Label className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-[10px] block">
                    Preferred Time Slot *
                  </Label>
                  <div className="grid grid-cols-2 gap-[8px]">
                    {TIME_SLOTS.map((slot) => {
                      const isDisabled = !date
                      const isSelected = time === slot.value
                      const isMorning = slot.period === "morning"
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setTime(slot.value)}
                          className={`flex items-center justify-center gap-[6px] px-[10px] py-[11px] rounded-[var(--radius-sm)] border-2 text-[13px] font-medium transition-all ${
                            isDisabled
                              ? "opacity-40 cursor-not-allowed border-[var(--color-border)] bg-gray-50 text-[var(--color-text-muted)]"
                              : isSelected
                              ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white shadow-sm"
                              : "border-[var(--color-border)] hover:border-[var(--color-forest)]/30 text-[var(--color-text-secondary)] bg-white"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {slot.label}
                          {requiresFasting && isMorning && !isSelected && !isDisabled && (
                            <span className="text-[10px] text-[#16A34A] font-bold">★</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {!date && (
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-[8px]">
                      Select an appointment date above first.
                    </p>
                  )}
                  {requiresFasting && date && (
                    <p className="text-[11px] text-[#16A34A] mt-[8px] font-medium">
                      ★ Morning slots are recommended for fasting tests.
                    </p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ━━━ STEP 4: PATIENT INFORMATION & CONSENT ━━━ */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[24px]">
                <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-[6px]">
                  Confirm Patient Information
                </h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
                  Please verify your identity details and provide medical background for a secure screening.
                </p>
              </div>

              {/* Personal details */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] sm:p-[28px] mb-[20px] shadow-sm">
                <div className="flex items-center gap-[10px] mb-[20px]">
                  <User className="h-5 w-5 text-[var(--color-forest)]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">
                    Personal Details
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-[16px]">
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      First Name *
                    </Label>
                    <Input
                      value={patientInfo.firstName}
                      onChange={(e) =>
                        setPatientInfo({ ...patientInfo, firstName: e.target.value })
                      }
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      Last Name *
                    </Label>
                    <Input
                      value={patientInfo.lastName}
                      onChange={(e) =>
                        setPatientInfo({ ...patientInfo, lastName: e.target.value })
                      }
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      <Mail className="h-3.5 w-3.5 inline mr-1 text-[var(--color-text-muted)]" /> Email *
                    </Label>
                    <Input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) =>
                        setPatientInfo({ ...patientInfo, email: e.target.value })
                      }
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      <Phone className="h-3.5 w-3.5 inline mr-1 text-[var(--color-text-muted)]" /> Phone Number *
                    </Label>
                    <Input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) =>
                        setPatientInfo({ ...patientInfo, phone: e.target.value })
                      }
                      placeholder="e.g. 024 123 4567"
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency contact */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] sm:p-[28px] mb-[20px] shadow-sm">
                <div className="flex items-center gap-[10px] mb-[20px]">
                  <Shield className="h-5 w-5 text-[#0F76E0]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">
                    Emergency Contact
                  </h3>
                  <span className="text-[12px] text-[var(--color-text-muted)] font-medium">
                    (Recommended)
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-[16px]">
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      Contact Name
                    </Label>
                    <Input
                      value={patientInfo.emergencyContact}
                      onChange={(e) =>
                        setPatientInfo({ ...patientInfo, emergencyContact: e.target.value })
                      }
                      placeholder="Full name of next of kin"
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-[6px] block">
                      Contact Phone
                    </Label>
                    <Input
                      type="tel"
                      value={patientInfo.emergencyPhone}
                      onChange={(e) =>
                        setPatientInfo({ ...patientInfo, emergencyPhone: e.target.value })
                      }
                      placeholder="e.g. 024 987 6543"
                      className="h-[48px] bg-[var(--color-surface-2)]/50 border-[var(--color-border)] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Medical history */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] sm:p-[28px] mb-[20px] shadow-sm">
                <div className="flex items-center gap-[10px] mb-[20px]">
                  <Stethoscope className="h-5 w-5 text-[#D97706]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">
                    Clinical Notes & History
                  </h3>
                </div>
                <div className="space-y-[16px]">
                  <div>
                    <label className="flex items-center gap-[10px] cursor-pointer mb-[8px]">
                      <input
                        type="checkbox"
                        checked={medicalInfo.hasAllergies}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, hasAllergies: e.target.checked })
                        }
                        className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                      />
                      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                        I have known allergies (latex, iodine, medications)
                      </span>
                    </label>
                    {medicalInfo.hasAllergies && (
                      <Input
                        value={medicalInfo.allergyDetails}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, allergyDetails: e.target.value })
                        }
                        placeholder="Please describe allergy specifics"
                        className="ml-[28px] h-[44px] animate-in fade-in slide-in-from-top-2 duration-200"
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-[10px] cursor-pointer mb-[8px]">
                      <input
                        type="checkbox"
                        checked={medicalInfo.onMedication}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, onMedication: e.target.checked })
                        }
                        className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                      />
                      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                        I am currently on prescription medication
                      </span>
                    </label>
                    {medicalInfo.onMedication && (
                      <Input
                        value={medicalInfo.medicationDetails}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, medicationDetails: e.target.value })
                        }
                        placeholder="List current prescription medications"
                        className="ml-[28px] h-[44px] animate-in fade-in slide-in-from-top-2 duration-200"
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-[10px] cursor-pointer mb-[8px]">
                      <input
                        type="checkbox"
                        checked={medicalInfo.recentSurgery}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, recentSurgery: e.target.checked })
                        }
                        className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                      />
                      <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                        I have had surgery in the past 6 months
                      </span>
                    </label>
                    {medicalInfo.recentSurgery && (
                      <Input
                        value={medicalInfo.surgeryDetails}
                        onChange={(e) =>
                          setMedicalInfo({ ...medicalInfo, surgeryDetails: e.target.value })
                        }
                        placeholder="Brief description and approximate date"
                        className="ml-[28px] h-[44px] animate-in fade-in slide-in-from-top-2 duration-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] sm:p-[28px]">
                <div className="flex items-center gap-[10px] mb-[16px]">
                  <Shield className="h-5 w-5 text-[var(--color-forest)]" />
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">
                    Consent & Clinical Acknowledgement
                  </h3>
                </div>
                <div className="space-y-[14px]">
                  <label className="flex items-start gap-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentPrep}
                      onChange={(e) => setConsentPrep(e.target.checked)}
                      className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)] mt-[2px]"
                    />
                    <span className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                      I understand the clinical preparation requirements for this test
                      {requiresFasting &&
                        ` (including the ${selectedTest?.fastingHours || "8–12 hour"} fasting requirement)`}
                      , and I confirm that all information provided above is accurate.
                    </span>
                  </label>
                  <label className="flex items-start gap-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="h-[18px] w-[18px] rounded border-[var(--color-border)] text-[var(--color-forest)] focus:ring-[var(--color-forest)] mt-[2px]"
                    />
                    <span className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                      I agree to CareBis Prime's Terms of Service and HIPAA/GDPR clinical privacy regulations, and I consent to having my diagnostic health data securely processed.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ━━━ STEP 5: REVIEW & CONFIRM ━━━ */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-[24px]">
                <h1 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-forest)] mb-[6px]">
                  Review Your Test Booking
                </h1>
                <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
                  Confirm your diagnostic test, appointment time, and partner laboratory before submitting.
                </p>
              </div>

              <div className="grid md:grid-cols-[1fr_360px] gap-[24px]">
                {/* Main Summary */}
                <div className="space-y-[16px]">
                  {/* Test & Lab card */}
                  <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-sm">
                    {/* Test Header */}
                    <div className="p-[24px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                      <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[8px]">
                        Diagnostic Test
                      </div>
                      <div className="flex items-start justify-between gap-[16px]">
                        <div>
                          <h3 className="font-serif text-[20px] font-bold text-[var(--color-forest)]">
                            {selectedTest?.name || selectedPkg?.name}
                          </h3>
                          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                            {selectedTest?.description || selectedPkg?.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-[10px] mt-[12px]">
                        {selectedTest?.category && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {selectedTest.category}
                          </span>
                        )}
                        {selectedTest?.sampleType && (
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Sample: {selectedTest.sampleType}
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedTest?.turnaroundTime || "24–48 hours"}
                        </span>
                      </div>
                    </div>

                    {/* Laboratory & Appointment Details */}
                    <div className="p-[24px] space-y-[20px]">
                      <div>
                        <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[8px]">
                          Partner Laboratory
                        </div>
                        <div className="flex items-center gap-[12px]">
                          <div className="h-10 w-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-forest)]">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-[var(--color-forest)]">
                              {selectedLabData?.name || "CareBis Prime Partner Laboratory"}
                            </div>
                            <div className="text-[13px] text-[var(--color-text-secondary)] flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                              {typeof (selectedLabData?.location?.address || selectedLabData?.address) === "object"
                                ? [selectedLabData?.address?.street, selectedLabData?.address?.city].filter(Boolean).join(", ") || "Accra, Ghana"
                                : (selectedLabData?.location?.address || selectedLabData?.address || "Accra, Ghana")}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-[16px] pt-[16px] border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-[10px]">
                          <CalendarIcon className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                          <div>
                            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Date</div>
                            <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                              {date
                                ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-[10px]">
                          <Clock className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
                          <div>
                            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Time Slot</div>
                            <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                              {TIME_SLOTS.find((s) => s.value === time)?.label || "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {requiresFasting && (
                        <div className="p-[14px] rounded-[var(--radius-md)] bg-[#FFFBEB] border border-[#FDE68A] flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0" />
                          <span className="text-[12px] text-[#92400E] font-medium">
                            Clinical Requirement: Fasting ({selectedTest?.fastingHours || "8–12 hours"}) required before this appointment.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Info Card */}
                  <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] shadow-sm">
                    <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-[12px]">
                      Patient & Contact Information
                    </div>
                    <div className="text-[15px] font-bold text-[var(--color-forest)]">
                      {patientInfo.firstName} {patientInfo.lastName}
                    </div>
                    <div className="text-[13px] text-[var(--color-text-secondary)] mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{patientInfo.email}</span>
                      <span>•</span>
                      <span>{patientInfo.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Price Order Summary Sidebar */}
                <div className="bg-[var(--color-forest)] rounded-[var(--radius-xl)] p-[28px] text-white shadow-lg self-start sticky top-[100px]">
                  <div className="text-[12px] uppercase tracking-wider font-bold text-white/60 mb-[20px] flex items-center justify-between">
                    <span>Order Summary</span>
                    <Shield className="h-4 w-4 text-[var(--color-lime)]" />
                  </div>

                  <div className="space-y-[14px] mb-[24px]">
                    <div className="flex justify-between items-start text-[14px]">
                      <span className="text-white/80 pr-2">
                        {selectedTest?.name || selectedPkg?.name}
                      </span>
                      <span className="font-semibold shrink-0">GH₵{getDisplayPrice()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-white/60">Partner Lab Facility</span>
                      <span className="text-white/80 text-[12px]">{selectedLabData?.name || "Selected Laboratory"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-white/60">Platform Booking Fee</span>
                      <span className="font-medium text-[var(--color-lime)]">Waived</span>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-[16px] mb-[20px] flex justify-between items-center">
                    <span className="text-[15px] text-white/80 font-medium">Total Amount</span>
                    <span className="font-serif text-[30px] font-bold text-[var(--color-lime)]">
                      GH₵{getDisplayPrice()}
                    </span>
                  </div>

                  <div className="space-y-[12px]">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full h-[50px] bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 text-[var(--color-forest)] font-bold text-[15px] shadow-md gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin"></div>
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          Confirm & Book Test
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-[11px] text-white/60 text-center leading-relaxed">
                      Secured via Paystack. You will receive an invoice and referral code upon confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ━━━ STEP 5: CONFIRMATION & PAYMENT ━━━ */}
          {step === 5 && (
            <div className="animate-in zoom-in-95 duration-500 max-w-[680px] mx-auto text-center py-[20px]">
              {/* Success animation */}
              <div className="flex justify-center mb-[20px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--color-lime)]/30 rounded-full animate-ping"></div>
                  <div className="relative flex items-center justify-center h-[80px] w-[80px] bg-[#F0FDF4] rounded-full border-2 border-[#16A34A]/30">
                    <CheckCircle className="h-[44px] w-[44px] text-[#16A34A]" />
                  </div>
                </div>
              </div>

              <h1 className="font-serif text-[32px] md:text-[38px] font-bold text-[var(--color-forest)] mb-[8px]">
                Diagnostic Test Booked!
              </h1>
              <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mb-[32px]">
                Your appointment has been registered with our accredited partner laboratory.
              </p>

              {/* Referral code card */}
              {bookingResult?.referralCode && (
                <div className="bg-[var(--color-forest)] rounded-[var(--radius-xl)] p-[36px] shadow-xl mb-[24px] relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <QrCode className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-[12px]">
                      Your Laboratory Referral Code
                    </div>
                    <div className="font-serif text-[36px] sm:text-[44px] font-bold tracking-[0.14em] text-[var(--color-lime)] leading-tight mb-[14px]">
                      {bookingResult.referralCode}
                    </div>
                    <p className="font-sans text-[13px] text-white/80 max-w-sm mx-auto mb-[20px]">
                      Present this referral code at the laboratory reception for seamless check-in.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyCode}
                      className="bg-white/15 hover:bg-white text-white hover:text-[var(--color-forest)] border border-white/20 text-[13px] font-medium gap-2"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Referral Code Copied!" : "Copy Referral Code"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Primary Direct Payment CTA Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 rounded-[var(--radius-xl)] p-[24px] mb-[28px] text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#B45309] font-bold text-[13px] uppercase tracking-wider mb-1">
                      <CreditCard className="h-4 w-4" />
                      Pending Payment (GH₵{getDisplayPrice()})
                    </div>
                    <h4 className="font-serif text-[18px] font-bold text-[var(--color-forest)]">
                      Complete Payment via Paystack
                    </h4>
                    <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                      Pay now online to guarantee instant processing and automatic receipt generation.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/client/billing')}
                    className="h-[48px] px-[24px] bg-[var(--color-forest)] hover:bg-[var(--color-forest-dark)] text-white font-bold text-[14px] shrink-0 gap-2 shadow-md"
                  >
                    Proceed to Payment
                    <ArrowRight className="h-4 w-4 text-[var(--color-lime)]" />
                  </Button>
                </div>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm text-left overflow-hidden mb-[28px]">
                <div className="bg-[var(--color-surface-2)] px-[24px] py-[16px] border-b border-[var(--color-border)] flex justify-between items-center">
                  <span className="font-mono text-[14px] font-bold text-[var(--color-forest)] tracking-widest">
                    {bookingResult?.referralCode || "CRV-BOOKING"}
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Pending Lab Verification
                  </span>
                </div>
                <div className="p-[24px] space-y-[16px]">
                  <div className="grid sm:grid-cols-2 gap-[16px]">
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">
                        Diagnostic Test
                      </div>
                      <div className="font-semibold text-[14px] text-[var(--color-forest)]">
                        {selectedTest?.name || selectedPkg?.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">
                        Laboratory
                      </div>
                      <div className="font-semibold text-[14px] text-[var(--color-text-primary)]">
                        {selectedLabData?.name || "CareBis Prime Certified Laboratory"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">
                        Date & Time
                      </div>
                      <div className="font-semibold text-[14px] text-[var(--color-text-primary)]">
                        {date
                          ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}{" "}
                        at {TIME_SLOTS.find((s) => s.value === time)?.label || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">
                        Total Fee
                      </div>
                      <div className="font-serif text-[18px] font-bold text-[var(--color-forest)]">
                        GH₵{getDisplayPrice()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Preparation Guide */}
              <div className="text-left bg-[var(--color-surface-2)]/60 p-[24px] rounded-[var(--radius-xl)] mb-[32px] border border-[var(--color-border)]">
                <h4 className="font-bold text-[15px] mb-[12px] text-[var(--color-forest)]">
                  Next Steps for Your Appointment
                </h4>
                <ol className="list-decimal list-inside space-y-[10px] text-[13px] text-[var(--color-text-secondary)]">
                  <li>
                    Complete payment online via <strong className="text-[var(--color-forest)]">Paystack</strong> on the Billing page or at the laboratory.
                  </li>
                  {requiresFasting && (
                    <li className="text-[#B45309] font-medium">
                      Remember to fast ({selectedTest?.fastingHours || "8–12 hours"}) prior to sample collection. Water only.
                    </li>
                  )}
                  <li>
                    Arrive <strong>10 minutes early</strong> at the laboratory and present your referral code (<strong className="font-mono">{bookingResult?.referralCode}</strong>).
                  </li>
                  <li>
                    Your diagnostic results will be securely verified and posted to your <strong>CareBis Prime Client Dashboard</strong> within {selectedTest?.turnaroundTime || "24–48 hours"}.
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-[12px] justify-center">
                <Button
                  onClick={() => navigate('/client/billing')}
                  className="h-[50px] px-[28px] text-[15px] font-bold bg-[var(--color-forest)] text-white shadow-md gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(user?.role === 'LABORATORY' ? '/lab/dashboard' : '/client/dashboard')}
                  className="h-[50px] px-[24px] text-[15px] font-medium"
                >
                  Go to {user?.role === 'LABORATORY' ? 'Lab Dashboard' : 'Client Dashboard'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedTestName("")
                    setSelectedPackage("")
                    setSelectedLab("")
                    setDate("")
                    setTime("")
                    setBookingResult(null)
                    setStep(1)
                  }}
                  className="h-[50px] px-[20px] text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-forest)]"
                >
                  Book Another Test
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── FOOTER ACTIONS (Steps 1-4) ── */}
      {step < 5 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)] p-[16px] sm:p-[20px] z-40">
          <div className="mx-auto max-w-[1000px] flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-[14px] gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-forest)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Back to Dashboard" : "Back"}
            </Button>

            <div className="flex items-center gap-[16px]">
              {(selectedTest || selectedPkg) && step > 1 && (
                <div className="hidden sm:flex items-center gap-[8px] text-[13px] text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-forest)]">
                    {selectedTest?.name || selectedPkg?.name}
                  </span>
                  {selectedLab && (
                    <>
                      <span className="text-[var(--color-text-muted)]">•</span>
                      <span className="font-serif font-bold text-[var(--color-forest)]">
                        GH₵{getDisplayPrice()}
                      </span>
                    </>
                  )}
                </div>
              )}

              <Button
                onClick={handleNext}
                className="h-[46px] px-[28px] text-[14px] font-semibold gap-2 bg-[var(--color-forest)] hover:bg-[var(--color-forest-dark)] text-white shadow-sm"
                disabled={!canProceed(step) || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : step === 4 ? (
                  <>
                    Confirm & Book Test
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
