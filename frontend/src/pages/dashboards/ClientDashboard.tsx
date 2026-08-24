import { Link } from "react-router-dom"
import {
  Heart, Droplets, Activity, Calendar, FileText, Bell,
  CheckCircle2, AlertTriangle, Info, ArrowRight, Shield,
  ClipboardList, FlaskConical, TrendingUp, Sparkles,
  Stethoscope, BookOpen, ChevronRight
} from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { useResults } from "@/hooks/useResults"
import { useBookings } from "@/hooks/useBookings"

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

// ─── Onboarding View (First Visit) ──────────────────────────────────────────

function OnboardingView({ userName }: { userName: string }) {
  const pillars = [
    {
      icon: Heart,
      title: "Cardiovascular Health",
      color: "#DC2626",
      bgColor: "rgba(220,38,38,0.06)",
      description: "Your heart pumps over 100,000 times a day. CareVo screens for early signs of heart disease by measuring blood pressure, cholesterol levels, and triglycerides.",
      biomarkers: ["Blood Pressure", "Total Cholesterol", "LDL/HDL Ratio", "Triglycerides"],
      fact: "Heart disease is the #1 cause of death worldwide. Early screening can reduce risk by up to 80%."
    },
    {
      icon: Droplets,
      title: "Renal (Kidney) Health",
      color: "#0F76E0",
      bgColor: "rgba(15,118,224,0.06)",
      description: "Your kidneys filter 200 litres of blood daily. CareVo checks kidney function through creatinine, eGFR, and urine analysis to catch issues before symptoms appear.",
      biomarkers: ["Creatinine", "eGFR", "Urea", "Urine Protein"],
      fact: "1 in 10 adults has chronic kidney disease, but most don't know until it's advanced."
    },
    {
      icon: Activity,
      title: "Metabolic Health",
      color: "#D97706",
      bgColor: "rgba(217,119,6,0.06)",
      description: "Metabolic health affects how your body processes energy. CareVo screens for diabetes and metabolic syndrome through glucose, HbA1c, and insulin levels.",
      biomarkers: ["Fasting Glucose", "HbA1c", "Insulin", "BMI"],
      fact: "Over 530 million adults live with diabetes. Early detection through screening is key to prevention."
    }
  ]

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
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-forest)] via-[#1E4D35] to-[#2D5A40] p-[32px] md:p-[48px] text-white shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-lime)]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[var(--color-mint)]/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>

        <div className="relative z-10 max-w-[640px]">
          <div className="flex items-center gap-2 mb-[16px]">
            <Sparkles className="h-5 w-5 text-[var(--color-lime)]" />
            <span className="text-[13px] font-semibold tracking-wide text-[var(--color-lime)] uppercase">Welcome to CareVo</span>
          </div>
          <h1 className="font-serif text-[32px] md:text-[40px] font-semibold leading-tight mb-[16px]">
            Hello, {userName}. <br />
            Let's start your health journey.
          </h1>
          <p className="font-sans text-[16px] md:text-[17px] text-white/80 leading-relaxed mb-[28px]">
            CareVo screens for early signs of cardiovascular, kidney, and metabolic disease — the three leading causes of preventable illness. Book your first screening to get your personalised health baseline.
          </p>
          <Link to="/client/bookings/new">
            <Button className="h-[52px] px-[28px] text-[15px] bg-[var(--color-lime)] text-[var(--color-forest)] hover:bg-[var(--color-lime-dark)] shadow-md font-semibold gap-2">
              <Calendar className="h-4 w-4" />
              Book Your First Screening
            </Button>
          </Link>
        </div>
      </div>

      {/* ── THE 3 HEALTH PILLARS ── */}
      <div>
        <div className="mb-[24px]">
          <h2 className="font-serif text-[26px] font-semibold text-[var(--color-forest)]">What We Screen For</h2>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mt-1">Three health pillars that form the foundation of preventive care.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="p-[28px] flex-1" style={{ backgroundColor: pillar.bgColor }}>
                <div className="flex items-center gap-[12px] mb-[20px]">
                  <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full" style={{ backgroundColor: `${pillar.color}15` }}>
                    <pillar.icon className="h-[22px] w-[22px]" style={{ color: pillar.color }} />
                  </div>
                  <h3 className="font-sans text-[17px] font-bold text-[var(--color-forest)]">{pillar.title}</h3>
                </div>
                <p className="font-sans text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-[20px]">
                  {pillar.description}
                </p>
                <div className="space-y-[8px] mb-[16px]">
                  <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Key Biomarkers</div>
                  <div className="flex flex-wrap gap-[6px]">
                    {pillar.biomarkers.map((b) => (
                      <span key={b} className="inline-flex items-center px-[10px] py-[4px] rounded-full text-[12px] font-medium bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white border-t border-[var(--color-border)] px-[28px] py-[16px]">
                <div className="flex items-start gap-[8px]">
                  <BookOpen className="h-4 w-4 text-[var(--color-text-muted)] shrink-0 mt-[2px]" />
                  <p className="text-[13px] text-[var(--color-text-muted)] leading-snug italic">
                    {pillar.fact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW CAREVO WORKS ── */}
      <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-xl)] p-[32px] md:p-[40px] border border-[var(--color-border)]">
        <div className="mb-[32px] text-center">
          <h2 className="font-serif text-[26px] font-semibold text-[var(--color-forest)]">How CareVo Works</h2>
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

function ReturningUserView({ userName, results, bookings }: { userName: string; results: any[]; bookings: any[] }) {
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
<<<<<<< HEAD
              Based on your most recent CareVo screening results.
=======
              Based on your most recent CareBis Prime screening.
>>>>>>> bd51494230ae3f46a5b12de7b5135f8179699274
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
              { icon: Shield, label: "My Referrals", to: "/client/referrals", color: "text-[#D97706]" },
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
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ClientDashboard() {
  const { user } = useAuthStore()
  const { data: resultsData, isLoading: resultsLoading } = useResults()
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings()

  const userName = user?.firstName || 'Client'

  // Extract results array from API response
  const results: any[] = resultsData?.items || resultsData?.data || resultsData || []
  const actualResults = Array.isArray(results) ? results : []

  // Extract bookings array
  const bookings: any[] = bookingsData?.items || bookingsData?.data || bookingsData || []
  const actualBookings = Array.isArray(bookings) ? bookings : []

  const hasResults = actualResults.length > 0

  // Loading state
  if (resultsLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (hasResults) {
    return <ReturningUserView userName={userName} results={actualResults} bookings={actualBookings} />
  }

  return <OnboardingView userName={userName} />
}
