import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Heart, Droplets, Activity, Calendar, FileText, Bell,
  CheckCircle2, AlertTriangle, Info, ArrowRight,
  ClipboardList, FlaskConical, TrendingUp, Sparkles,
  Stethoscope, ChevronRight, Search, Clock, X, TestTube,
  HeartPulse
} from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { useResults } from "@/hooks/useResults"
import { useBookings } from "@/hooks/useBookings"
import { usePackages } from "@/hooks/usePackages"
import { useHealthAccount } from "@/hooks/useHealthAccount"
import { useFollowUpPendingCount } from "@/hooks/useFollowUps"
import { CardCornerPattern } from "@/components/shared/CardCornerPattern"
import { HeroCornerHealthPattern } from "@/components/shared/HeroCornerHealthPattern"

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRiskFromFlag(flag: string | null): string | null {
  switch (flag) {
    case 'NORMAL': return 'LOW'
    case 'HIGH': return 'MODERATE'
    case 'CRITICAL': return 'HIGH'
    case 'LOW': return 'MODERATE'
    default: return null
  }
}

function computeOverallRisk(flags: string[]): string {
  if (flags.includes('CRITICAL')) return 'HIGH'
  if (flags.includes('HIGH')) return 'MODERATE'
  return 'LOW'
}

const getRiskColor = (risk: string | null) => {
  switch (risk) {
    case 'LOW': return 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20'
    case 'MODERATE': return 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20'
    case 'HIGH': return 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20'
    default: return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

const getRiskIcon = (risk: string | null) => {
  switch (risk) {
    case 'LOW': return <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
    case 'MODERATE': return <Info className="h-5 w-5 text-[#D97706]" />
    case 'HIGH': return <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
    default: return null
  }
}

// Extract the latest value for a specific biomarker from results
function extractLatestBiomarker(
  results: any[],
  biomarkerNames: string[]
): { value: string; flag: string; date: string } | null {
  for (const result of results) {
    if (result.status !== 'FINAL' && result.status !== 'AMENDED') continue
    const biomarkers = result.biomarkers || []
    for (const name of biomarkerNames) {
      const found = biomarkers.find(
        (b: any) => b.name?.toLowerCase().includes(name.toLowerCase())
      )
      if (found) {
        return {
          value: `${found.value} ${found.unit}`,
          flag: found.flag,
          date: result.collectionDate || result.createdAt,
        }
      }
    }
  }
  return null
}

// ─── Individual Tests Catalog Component ─────────────────────────────────────

function IndividualTestsCatalog({ packages }: { packages: any[] }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  const categories = [
    { id: "ALL", label: "All Tests" },
    { id: "General Health", label: "General Health" },
    { id: "Chronic & Metabolic", label: "Chronic & Metabolic" },
    { id: "Infectious Disease", label: "Infectious Disease" },
    { id: "Sexual & Reproductive Health", label: "Sexual Health" },
  ]

  const filteredTests = useMemo(() => {
    return packages.filter((test: any) => {
      const q = search.toLowerCase().trim()
      const matchesSearch = !q || 
        test.name?.toLowerCase().includes(q) ||
        test.description?.toLowerCase().includes(q) ||
        test.commonFor?.toLowerCase().includes(q)

      const matchesCategory = selectedCategory === "ALL" || test.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [packages, search, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-[26px] md:text-[30px] font-semibold text-[var(--color-forest)]">
            Available Diagnostic Tests
          </h2>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mt-1">
            Select a specific test to choose where to do it, compare partner lab prices, and book your appointment.
          </p>
        </div>
        <div className="text-[13px] font-medium text-[var(--color-text-muted)]">
          Showing <span className="font-bold text-[var(--color-forest)]">{filteredTests.length}</span> tests
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search test (e.g. HbA1c, FBC, Lipid, Malaria)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-text-primary)] placeholder:text-gray-400 focus:border-[var(--color-forest)] focus:ring-1 focus:ring-[var(--color-forest)] outline-none shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[var(--color-forest)] text-white shadow-xs font-semibold"
                  : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="relative overflow-hidden flex flex-col justify-between p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-xs hover:border-[var(--color-forest)]/40 hover:shadow-md transition-all group"
            >
              {/* Delicate line pattern at the top-right corner */}
              <CardCornerPattern patternId={test.id || test.name} color={test.color} />

              <div className="relative z-10">
                {/* Top badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${test.color}15`, color: test.color }}
                  >
                    {test.category}
                  </span>
                  
                  {test.fastingRequired ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="h-3 w-3" /> Fasting ({test.fastingHours})
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      No Fasting Required
                    </span>
                  )}
                </div>

                {/* Test Name */}
                <h3 className="font-sans text-[17px] font-bold text-[var(--color-forest)] group-hover:text-[var(--color-lime-dark)] transition-colors mb-2">
                  {test.name}
                </h3>

                {/* Description */}
                <p className="font-sans text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {test.description}
                </p>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--color-text-muted)] mb-5">
                  <span className="flex items-center gap-1">
                    <TestTube className="h-3.5 w-3.5 text-gray-400" />
                    {test.sampleType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {test.turnaroundTime}
                  </span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="relative z-10 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[12px] text-gray-500 font-medium truncate max-w-[50%] mr-2" title={test.commonFor}>
                  {test.commonFor}
                </span>
                <Link to={`/client/bookings/new?package=${test._id || test.id || ''}&test=${encodeURIComponent(test.name)}`}>
                  <Button className="h-[40px] px-5 bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-mid)] hover:text-white text-[13px] font-semibold gap-1.5 shadow-sm transition-colors shrink-0">
                    Book This Test <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-[var(--color-border)]">
          <TestTube className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h4 className="text-[15px] font-bold text-gray-700 mb-1">No diagnostic tests match your search</h4>
          <p className="text-[13px] text-gray-500 mb-4">Try searching with a different term or clear the filters.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory("ALL"); }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Shared Dashboard Components ────────────────────────────────────────────

interface DashboardStats {
  totalBookings: number
  totalResults: number
  trackedParams: number
  pendingFollowUps: number
  hasUrgentFollowUp: boolean
  hasEmergencyFollowUp: boolean
}

function FollowUpAlertBanner({
  pendingFollowUps,
  hasUrgentFollowUp,
  hasEmergencyFollowUp,
}: {
  pendingFollowUps: number
  hasUrgentFollowUp: boolean
  hasEmergencyFollowUp: boolean
}) {
  if (pendingFollowUps <= 0) return null

  const isEmergency = hasEmergencyFollowUp
  const isUrgent = hasUrgentFollowUp

  return (
    <div
      className={`rounded-[var(--radius-lg)] border-l-4 p-4 flex items-center justify-between gap-4 ${
        isEmergency
          ? 'bg-[#FEF2F2] border-l-[#DC2626]'
          : isUrgent
          ? 'bg-[#FEF9C3] border-l-[#D97706]'
          : 'bg-[#FEF9C3] border-l-[#D97706]'
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className={`h-5 w-5 shrink-0 ${
            isEmergency ? 'text-[#DC2626]' : 'text-[#D97706]'
          }`}
        />
        <p
          className={`text-sm font-medium ${
            isEmergency ? 'text-red-800' : 'text-amber-800'
          }`}
        >
          You have {pendingFollowUps} follow-up action{pendingFollowUps !== 1 ? 's' : ''} requiring your attention.
        </p>
      </div>
      <Link to="/client/follow-up">
        <Button
          size="sm"
          variant="outline"
          className={`gap-1 text-xs font-semibold shrink-0 ${
            isEmergency
              ? 'border-red-300 text-red-700 hover:bg-red-50'
              : 'border-amber-300 text-amber-700 hover:bg-amber-50'
          }`}
        >
          View Follow-Ups
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  )
}

function DashboardStatsRow({ stats }: { stats: DashboardStats }) {
  const { totalBookings, totalResults, trackedParams, pendingFollowUps, hasUrgentFollowUp, hasEmergencyFollowUp } = stats

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Bookings stat */}
      <Link to="/client/bookings" className="group">
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[var(--color-forest)]" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900">{totalBookings}</p>
          <p className="text-xs text-slate-500 mt-0.5">total bookings</p>
        </div>
      </Link>

      {/* Results stat */}
      <Link to="/client/results" className="group">
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900">{totalResults}</p>
          <p className="text-xs text-slate-500 mt-0.5">lab results</p>
        </div>
      </Link>

      {/* Health Account stat */}
      <Link to="/client/health-account" className="group">
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900">{trackedParams}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {trackedParams > 0 ? 'parameters being tracked' : 'Start tracking →'}
          </p>
        </div>
      </Link>

      {/* Follow-Ups stat */}
      <Link to="/client/follow-up" className="group">
        <div className={`p-5 rounded-[var(--radius-lg)] border shadow-xs hover:shadow-md transition-shadow ${
          pendingFollowUps > 0
            ? hasEmergencyFollowUp
              ? 'border-red-200 bg-red-50/50'
              : hasUrgentFollowUp
              ? 'border-amber-200 bg-amber-50/50'
              : 'border-amber-200 bg-amber-50/50'
            : 'border-[var(--color-border)] bg-white'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              pendingFollowUps > 0
                ? hasEmergencyFollowUp
                  ? 'bg-red-100'
                  : hasUrgentFollowUp
                  ? 'bg-amber-100'
                  : 'bg-amber-100'
                : 'bg-green-100'
            }`}>
              <ClipboardList className={`h-5 w-5 ${
                pendingFollowUps > 0
                  ? hasEmergencyFollowUp
                    ? 'text-red-600'
                    : hasUrgentFollowUp
                    ? 'text-amber-600'
                    : 'text-amber-600'
                  : 'text-green-600'
              }`} />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900">{pendingFollowUps}</p>
          <p className={`text-xs mt-0.5 ${
            pendingFollowUps > 0
              ? hasEmergencyFollowUp
                ? 'text-red-700 font-medium'
                : hasUrgentFollowUp
                ? 'text-amber-700 font-medium'
                : 'text-amber-700 font-medium'
              : 'text-green-600 font-medium'
          }`}>
            {pendingFollowUps > 0 ? 'pending follow-up actions' : 'All clear ✓'}
          </p>
        </div>
      </Link>
    </div>
  )
}

// ─── Onboarding View (First Visit) ──────────────────────────────────────────

function OnboardingView({ userName, packages, stats }: { userName: string; packages: any[]; stats: DashboardStats }) {
  const steps = [
    {
      icon: ClipboardList,
      title: "Book a Screening",
      description: "Choose from our carefully designed health packages — Cardio, Renal, Metabolic, or a Complete Wellness Screen."
    },
    {
      icon: FlaskConical,
      title: "Visit a Partner Lab",
      description: "Go to any of our certified partner laboratories at your scheduled time. A professional phlebotomist handles your sample collection."
    },
    {
      icon: Stethoscope,
      title: "Expert Interpretation",
      description: "A qualified medical interpreter reviews your results and provides personalised risk assessments and actionable recommendations."
    },
    {
      icon: TrendingUp,
      title: "Track Your Health",
      description: "Monitor your biomarkers over time, receive follow-up reminders, and take control of your long-term health."
    }
  ]

  return (
    <div className="space-y-[40px] md:space-y-[56px]">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-forest)] p-[32px] md:p-[48px] text-white shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-lime)]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[var(--color-mint)]/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>

        {/* Seamless Luminous Health Vital Pattern (Top-Right Corner) */}
        <HeroCornerHealthPattern />

        <div className="relative z-10 max-w-[640px]">
          <div className="flex items-center gap-2 mb-[16px]">
            <Sparkles className="h-5 w-5 text-[var(--color-lime)]" />
            <span className="text-[13px] font-semibold tracking-wide text-[var(--color-lime)] uppercase">Welcome to CareBis Prime</span>
          </div>
          <h1 className="font-serif text-[32px] md:text-[40px] font-semibold leading-tight mb-[16px]">
            Hello, {userName}. <br />
            Let's start your health journey.
          </h1>
          <p className="font-sans text-[16px] md:text-[17px] text-white/80 leading-relaxed mb-[28px]">
            CareBis Prime screens for early signs of cardiovascular, kidney, and metabolic disease — the three leading causes of preventable illness. Book your first screening to get your personalised health baseline.
          </p>
          <Link to="/client/bookings/new">
            <Button className="h-[52px] px-[28px] text-[15px] bg-[var(--color-lime)] text-white hover:bg-[var(--color-lime-dark)] shadow-md font-semibold gap-2">
              <Calendar className="h-4 w-4" />
              Book Your First Screening
            </Button>
          </Link>
        </div>
      </div>

      {/* ── QUICK STATS ROW ── */}
      <DashboardStatsRow stats={stats} />

      {/* ── INDIVIDUAL DIAGNOSTIC TESTS DIRECTORY ── */}
      <IndividualTestsCatalog packages={packages} />

      {/* ── HOW CAREBIS PRIME WORKS ── */}
      <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-xl)] p-[32px] md:p-[40px] border border-[var(--color-border)]">
        <div className="mb-[32px] text-center">
          <h2 className="font-serif text-[26px] font-semibold text-[var(--color-forest)]">How CareBis Prime Works</h2>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mt-1">Four simple steps to understand your health.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto mb-[16px] flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white border-2 border-[var(--color-forest)] shadow-sm">
                <step.icon className="h-[24px] w-[24px] text-[var(--color-forest)]" />
              </div>
              <div className="absolute top-[28px] left-[calc(50%+36px)] w-[calc(100%-72px)] h-[2px] bg-[var(--color-border)] hidden lg:block" style={{ display: i === steps.length - 1 ? 'none' : undefined }}></div>
              <div className="text-[12px] font-bold text-[var(--color-lime-dark)] uppercase tracking-wider mb-[8px]">Step {i + 1}</div>
              <h4 className="font-sans text-[15px] font-bold text-[var(--color-forest)] mb-[8px]">{step.title}</h4>
              <p className="font-sans text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HEALTH TIPS ── */}
      <div>
        <div className="mb-[24px]">
          <h2 className="font-serif text-[26px] font-semibold text-[var(--color-forest)]">Preventive Health Tips</h2>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mt-1">Simple, evidence-based actions to improve your health baseline.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          {[
            {
              icon: Heart,
              color: "#DC2626",
              title: "For Your Heart",
              tips: ["Aim for 150 minutes of moderate exercise per week", "Limit sodium intake to under 2,300 mg/day", "Include omega-3 rich foods (fish, nuts, seeds)"]
            },
            {
              icon: Droplets,
              color: "#0F76E0",
              title: "For Your Kidneys",
              tips: ["Drink at least 2 litres of water daily", "Monitor blood pressure regularly", "Reduce intake of processed foods and excess protein"]
            },
            {
              icon: Activity,
              color: "#D97706",
              title: "For Your Metabolism",
              tips: ["Maintain a healthy BMI (18.5–24.9)", "Choose whole grains over refined carbohydrates", "Get 7–9 hours of quality sleep each night"]
            }
          ].map((tip) => (
            <div key={tip.title} className="p-[24px] bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-[10px] mb-[16px]">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full" style={{ backgroundColor: `${tip.color}12` }}>
                  <tip.icon className="h-[18px] w-[18px]" style={{ color: tip.color }} />
                </div>
                <h4 className="font-sans text-[15px] font-bold text-[var(--color-forest)]">{tip.title}</h4>
              </div>
              <ul className="space-y-[10px]">
                {tip.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-[8px] text-[13px] text-[var(--color-text-secondary)] leading-snug">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-lime)] shrink-0 mt-[1px]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-[28px] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm">
        <div className="mb-4 sm:mb-0">
          <h4 className="font-sans text-[17px] font-bold text-[var(--color-forest)]">Ready to take the first step?</h4>
          <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">Book your baseline screening and understand where you stand.</p>
        </div>
        <Link to="/client/bookings/new">
          <Button className="h-[48px] px-[24px] gap-2 shadow-md">
            <Calendar className="h-4 w-4" />
            Book a Screening
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Returning User View (Has Results) ──────────────────────────────────────

function ReturningUserView({
  userName,
  results,
  bookings,
  packages,
  stats,
}: {
  userName: string
  results: any[]
  bookings: any[]
  packages: any[]
  stats: DashboardStats
}) {
  // Sort results by date descending
  const sortedResults = [...results].sort((a, b) =>
    new Date(b.collectionDate || b.createdAt).getTime() - new Date(a.collectionDate || a.createdAt).getTime()
  )

  // Extract latest biomarker data from real results
  const bpData = extractLatestBiomarker(sortedResults, ['Blood Pressure (Systolic)', 'Systolic'])
  const bpDiastolic = extractLatestBiomarker(sortedResults, ['Blood Pressure (Diastolic)', 'Diastolic'])
  const glucoseData = extractLatestBiomarker(sortedResults, ['Fasting Blood Glucose', 'Fasting Glucose', 'Glucose'])
  const cholData = extractLatestBiomarker(sortedResults, ['Total Cholesterol', 'Cholesterol'])
  const egfrData = extractLatestBiomarker(sortedResults, ['eGFR'])

  const cardio = {
    hasData: !!bpData,
    value: bpData && bpDiastolic
      ? `${parseFloat(bpData.value)}/${parseFloat(bpDiastolic.value)} mmHg`
      : bpData ? bpData.value : "—",
    risk: bpData ? getRiskFromFlag(bpData.flag) : null,
    label: "Latest Reading",
  }

  const metabolic = {
    hasData: !!glucoseData,
    value: glucoseData ? glucoseData.value : "—",
    risk: glucoseData ? getRiskFromFlag(glucoseData.flag) : null,
    label: "Fasting",
  }

  const renal = {
    hasData: !!(cholData || egfrData),
    value: cholData ? cholData.value : egfrData ? egfrData.value : "—",
    risk: cholData ? getRiskFromFlag(cholData.flag) : egfrData ? getRiskFromFlag(egfrData.flag) : null,
    label: cholData ? "Total" : "eGFR",
    title: cholData ? "Cholesterol" : "Kidney Function",
  }

  // Compute overall risk from all available flags
  const allFlags = sortedResults.slice(0, 5).flatMap(r =>
    (r.biomarkers || []).map((b: any) => b.flag)
  ).filter(Boolean)
  const overallRisk = allFlags.length > 0 ? computeOverallRisk(allFlags) : null

  // Format recent results for display
  const recentResults = sortedResults.slice(0, 4).map((r) => ({
    id: r._id || r.id,
    package: r.panelName || "Screening",
    date: new Date(r.collectionDate || r.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }),
    referralCode: r.referralCode || "—",
    risk: computeOverallRisk((r.biomarkers || []).map((b: any) => b.flag)),
    pillar: r.panelName?.includes('Cardio') ? 'CARDIO' :
            r.panelName?.includes('Renal') || r.panelName?.includes('Kidney') ? 'RENAL' :
            r.panelName?.includes('Metabolic') ? 'METABOLIC' : 'CARDIO'
  }))

  // Pending bookings
  const pendingBookings = (bookings || []).filter((b: any) => b.status === 'PENDING' || b.status === 'CONFIRMED')

  const pillarCards = [
    {
      icon: Activity,
      iconColor: "#DC2626",
      iconBg: "rgba(220,38,38,0.1)",
      cardBg: "rgba(220,38,38,0.04)",
      title: "Blood Pressure",
      ...cardio,
    },
    {
      icon: Droplets,
      iconColor: "#0F76E0",
      iconBg: "rgba(15,118,224,0.1)",
      cardBg: "rgba(15,118,224,0.04)",
      title: "Blood Glucose",
      ...metabolic,
    },
    {
      icon: Heart,
      iconColor: "#D97706",
      iconBg: "rgba(217,119,6,0.1)",
      cardBg: "rgba(217,119,6,0.04)",
      title: renal.title || "Cholesterol",
      hasData: renal.hasData,
      value: renal.value,
      risk: renal.risk,
      label: renal.label,
    }
  ]

  return (
    <div className="space-y-[32px] md:space-y-[48px]">

      {/* ── WELCOME BANNER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Welcome back, {userName}.
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Your Cardio, Renal, and Metabolic health — all in one place.
          </p>
        </div>
        <Link to="/client/bookings/new">
          <Button className="h-[48px] px-[24px] gap-2 shadow-md hover:shadow-lg transition-all">
            <Calendar className="h-4 w-4" />
            Book a Screening
          </Button>
        </Link>
      </div>

      {/* ── UPCOMING BOOKING ALERT ── */}
      {pendingBookings.length > 0 && (
        <div className="flex items-center gap-[16px] p-[20px] bg-[#EFF6FF] border border-[#0F76E0]/20 rounded-[var(--radius-lg)] shadow-sm">
          <div className="shrink-0 flex items-center justify-center h-[44px] w-[44px] rounded-full bg-[#0F76E0]/10">
            <Calendar className="h-5 w-5 text-[#0F76E0]" />
          </div>
          <div className="flex-1">
            <h4 className="font-sans text-[14px] font-bold text-[#0F76E0]">
              You have {pendingBookings.length} upcoming {pendingBookings.length === 1 ? 'appointment' : 'appointments'}
            </h4>
            <p className="font-sans text-[13px] text-[#0F76E0]/70">
              Next: {new Date(pendingBookings[0].scheduledAt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/client/bookings">
            <Button variant="outline" className="border-[#0F76E0]/30 text-[#0F76E0] hover:bg-[#0F76E0]/5">
              View <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* ── QUICK STATS ROW ── */}
      <DashboardStatsRow stats={stats} />

      {/* ── HEALTH SUMMARY CARDS (THE 3 PILLARS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        {pillarCards.map((card) => (
          <div key={card.title} className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
            <div className="p-[24px] flex-1" style={{ backgroundColor: card.cardBg }}>
              <div className="flex items-center justify-between mb-[24px]">
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full" style={{ backgroundColor: card.iconBg }}>
                    <card.icon className="h-[20px] w-[20px]" style={{ color: card.iconColor }} />
                  </div>
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">{card.title}</h3>
                </div>
                {card.hasData && card.risk && (
                  <div className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskColor(card.risk)}`}>
                    {card.risk} RISK
                  </div>
                )}
              </div>

              <div className="mb-[8px]">
                <span className="font-sans text-[13px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">{card.label}</span>
              </div>
              <div className="font-serif text-[36px] font-semibold text-[var(--color-text-primary)] leading-none">
                {card.value}
              </div>
              {!card.hasData && (
                <div className="mt-2 text-[13px] text-[var(--color-text-muted)]">No screening yet</div>
              )}
            </div>
            <div className="bg-white border-t border-[var(--color-border)] px-[24px] py-[16px]">
              <Link to="/client/results" className="text-[14px] font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors flex items-center gap-1">
                View History <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── NO DATA CTA ── */}
      {!cardio.hasData && !metabolic.hasData && !renal.hasData && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-[var(--color-surface-2)] p-[24px] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <div className="mb-4 sm:mb-0">
            <h4 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Get your baseline health picture</h4>
            <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">Book a Complete Wellness Screen to start monitoring your health.</p>
          </div>
          <Link to="/client/bookings/new">
            <Button>Book Now</Button>
          </Link>
        </div>
      )}

      {/* ── RISK STATUS INDICATOR ── */}
      {overallRisk && (
        <div className={`flex items-center gap-[20px] p-[24px] rounded-[var(--radius-xl)] border shadow-sm ${
          overallRisk === 'LOW' ? 'bg-[#F0FDF4] border-[#16A34A]/20' :
          overallRisk === 'MODERATE' ? 'bg-[#FFFBEB] border-[#D97706]/20' :
          'bg-[#FEF2F2] border-[#DC2626]/20'
        }`}>
          <div className="shrink-0 flex items-center justify-center h-[56px] w-[56px] rounded-full bg-white shadow-sm border border-black/5">
            {getRiskIcon(overallRisk)}
          </div>
          <div>
            <h3 className={`font-serif text-[24px] font-bold ${
              overallRisk === 'LOW' ? 'text-[#16A34A]' :
              overallRisk === 'MODERATE' ? 'text-[#D97706]' :
              'text-[#DC2626]'
            }`}>
              Overall Health Risk: {overallRisk}
            </h3>
            <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mt-1">
              Based on your most recent CareBis Prime screening.
            </p>
          </div>
        </div>
      )}

      {/* ── LOWER CONTENT GRID ── */}
      <div className="grid gap-[32px] lg:grid-cols-[2fr_1fr]">

        {/* RECENT TEST RESULTS */}
        <div>
          <h2 className="mb-[20px] font-serif text-[24px] font-semibold text-[var(--color-forest)]">
            Recent Screening Results
          </h2>
          {recentResults.length === 0 ? (
            <div className="p-[40px] text-center bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)]">
              <FileText className="h-10 w-10 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-[15px] text-[var(--color-text-secondary)]">No screening results yet.</p>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1">Your results will appear here once they're ready.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {recentResults.map((result) => (
                <div key={result.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-[20px] bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-[16px] mb-4 sm:mb-0">
                    <div className={`flex shrink-0 h-[48px] w-[48px] items-center justify-center rounded-[var(--radius-md)] ${
                      result.pillar === 'CARDIO' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                      result.pillar === 'RENAL' ? 'bg-[#0F76E0]/10 text-[#0F76E0]' :
                      'bg-[#D97706]/10 text-[#D97706]'
                    }`}>
                      {result.pillar === 'CARDIO' && <Heart className="h-6 w-6" />}
                      {result.pillar === 'RENAL' && <Droplets className="h-6 w-6" />}
                      {result.pillar === 'METABOLIC' && <Activity className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-[16px] font-bold text-[var(--color-text-primary)]">{result.package}</span>
                        <span className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider border ${getRiskColor(result.risk)}`}>
                          {result.risk} RISK
                        </span>
                      </div>
                      <div className="font-sans text-[13px] text-[var(--color-text-secondary)] flex items-center flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {result.date}</span>
                        {result.referralCode !== '—' && (
                          <>
                            <span className="hidden sm:inline text-[var(--color-border)]">|</span>
                            <span className="font-mono text-[12px] bg-[var(--color-surface-2)] px-1 rounded text-[var(--color-forest)]">{result.referralCode}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link to={`/client/results/${result.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto text-[14px]">
                      View Report
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS PANEL */}
        <div>
          <h2 className="mb-[20px] font-serif text-[24px] font-semibold text-[var(--color-forest)]">
            Quick Actions
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
            {[
              { icon: Calendar, label: "Book a Screening", to: "/client/bookings/new", color: "text-[var(--color-forest)]" },
              { icon: FileText, label: "View All Results", to: "/client/results", color: "text-[#0F76E0]" },
              { icon: Sparkles, label: "Patient Journey", to: "/client/journey", color: "text-[#D97706]" },
              { icon: Bell, label: "Billing & Payments", to: "/client/billing", color: "text-[#16A34A]" },
            ].map((action, i, arr) => (
              <Link key={action.label} to={action.to} className={`flex items-center gap-[16px] p-[20px] hover:bg-[var(--color-surface-2)] transition-colors ${i !== arr.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}>
                <div className="shrink-0">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="font-sans text-[14px] font-medium text-[var(--color-text-primary)] flex-1">{action.label}</span>
                <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── BROWSE INDIVIDUAL TESTS ── */}
      <div className="pt-6 border-t border-[var(--color-border)]">
        <IndividualTestsCatalog packages={packages} />
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ClientDashboard() {
  const { user } = useAuthStore()
  const { data: resultsData, isLoading: resultsLoading } = useResults()
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings()
  const { data: packagesResponse, isLoading: packagesLoading } = usePackages()
  const { data: healthAccountData, isLoading: healthAccountLoading } = useHealthAccount()
  const { data: pendingFollowUpsData, isLoading: followUpsLoading } = useFollowUpPendingCount()

  const userName = user?.firstName || 'Client'

  // Extract results array from API response
  const results: any[] = resultsData?.items || resultsData?.data || resultsData || []
  const actualResults = Array.isArray(results) ? results : []

  // Extract bookings array
  const bookings: any[] = bookingsData?.items || bookingsData?.data || bookingsData || []
  const actualBookings = Array.isArray(bookings) ? bookings : []

  // Extract packages array
  const packagesRaw = packagesResponse?.data || packagesResponse
  const actualPackages = packagesRaw?.data || packagesRaw || []

  const hasResults = actualResults.length > 0

  const trackedParams = Object.keys(healthAccountData || {}).length
  const pendingFollowUps = pendingFollowUpsData?.pendingCount || 0
  const hasUrgentFollowUp = !!pendingFollowUpsData?.hasUrgent
  const hasEmergencyFollowUp = !!pendingFollowUpsData?.hasEmergency

  const stats: DashboardStats = {
    totalBookings: actualBookings.length,
    totalResults: actualResults.length,
    trackedParams,
    pendingFollowUps,
    hasUrgentFollowUp,
    hasEmergencyFollowUp,
  }

  // Loading state
  if (resultsLoading || bookingsLoading || packagesLoading || healthAccountLoading || followUpsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-[24px]">
      {/* ── PENDING FOLLOW-UP ALERT BANNER (At the very top of dashboard content area) ── */}
      <FollowUpAlertBanner
        pendingFollowUps={stats.pendingFollowUps}
        hasUrgentFollowUp={stats.hasUrgentFollowUp}
        hasEmergencyFollowUp={stats.hasEmergencyFollowUp}
      />

      {hasResults ? (
        <ReturningUserView
          userName={userName}
          results={actualResults}
          bookings={actualBookings}
          packages={actualPackages}
          stats={stats}
        />
      ) : (
        <OnboardingView
          userName={userName}
          packages={actualPackages}
          stats={stats}
        />
      )}
    </div>
  )
}
