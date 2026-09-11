import { Link } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  Shield,
  BadgeCheck,
  FileText,
  Compass,
  CheckCircle,
} from "lucide-react"

export function LandingPage() {
  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative flex min-h-[calc(100vh-72px)] items-center bg-[var(--color-white)] py-12 lg:py-0">
        <div className="mx-auto w-full max-w-[1200px] px-[24px] md:px-[48px] lg:px-[80px]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            
            {/* Left Column (55%) */}
            <div className="w-full lg:w-[55%] flex flex-col items-start text-left z-10">
              {/* Pre-heading tag */}
              <div className="mb-[24px] inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
                <Activity className="h-3 w-3" />
                Preventive Healthcare Platform
              </div>

              {/* Main Heading */}
              <h1 className="mb-[24px] leading-[1.05]">
                <span className="block font-serif text-[48px] md:text-[60px] lg:text-[68px] font-normal italic text-[var(--color-text-primary)]">
                  Care Before
                </span>
                <span className="block font-serif text-[48px] md:text-[60px] lg:text-[68px] font-bold not-italic text-[var(--color-forest)]">
                  Illness Starts.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mb-[40px] max-w-[460px] font-sans text-[16px] md:text-[18px] font-normal leading-[1.75] text-[var(--color-text-secondary)]">
                CareBis Prime connects you to trusted health screening services, so you can catch what you cannot feel, understand what it means, and know exactly what to do next.
              </p>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row gap-[16px] w-full sm:w-auto">
                <Link to="/login">
                  <button className="h-[52px] px-[32px] w-full sm:w-auto rounded-full bg-[var(--color-lime)] text-[16px] font-semibold text-white transition-all duration-150 hover:bg-[var(--color-lime-dark)] hover:-translate-y-[1px]">
                    Book a Screening Today
                  </button>
                </Link>
                <a href="#how-it-works">
                  <button className="h-[52px] px-[24px] w-full sm:w-auto rounded-full bg-transparent text-[16px] font-medium text-[var(--color-forest)] transition-all duration-150 hover:bg-[var(--color-surface-2)] inline-flex items-center gap-2">
                    See How It Works <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="mt-[48px] flex items-center gap-[32px] flex-wrap">
                <div className="flex flex-col">
                  <span className="font-serif text-[20px] font-bold text-[var(--color-forest)]">
                    4 Screening Categories
                  </span>
                </div>
                <div className="h-[36px] w-[1px] bg-[var(--color-border)] hidden sm:block" />
                <div className="flex flex-col">
                  <span className="font-serif text-[20px] font-bold text-[var(--color-forest)]">
                    Verified Partner Labs
                  </span>
                </div>
                <div className="h-[36px] w-[1px] bg-[var(--color-border)] hidden sm:block" />
                <div className="flex flex-col hidden sm:flex">
                  <span className="font-serif text-[20px] font-bold text-[var(--color-forest)]">
                    Plain-Language Results
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (45%) */}
            <div className="w-full lg:w-[45%] relative h-[400px] sm:h-[560px] mt-12 lg:mt-0">
              {/* Background Shape */}
              <div className="absolute right-0 bottom-0 h-[480px] w-[80%] rounded-[var(--radius-xl)] bg-[var(--color-forest)] z-0 hidden lg:block" />

              {/* Photo Card 1 (main, tall — left) */}
              <div className="absolute left-0 top-0 h-[380px] w-[54%] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)] z-[2]">
                <img
                  src="/images/hero-doctor-consultation.jpg"
                  alt="Black African doctor consulting with a patient during a health screening"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Photo Card 2 (right, upper) */}
              <div className="absolute right-0 top-[28px] h-[220px] w-[42%] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)] z-[2]">
                <img
                  src="/images/lab-scientist.png"
                  alt="Medical laboratory scientist analyzing screening samples under a microscope"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Photo Card 3 (right, lower) */}
              <div className="absolute right-0 bottom-0 h-[200px] w-[42%] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)] z-[2] hidden sm:block">
                <img
                  src="/images/health-tracking.png"
                  alt="Healthcare professional reviewing health tracking metrics and digital results on a tablet"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Floating Info Card */}
              <div className="absolute bottom-[80px] left-[33%] z-[3] rounded-[var(--radius-md)] bg-white px-[18px] py-[14px] shadow-[var(--shadow-card-hover)]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-[var(--color-lime)]" />
                  <span className="font-sans text-[13px] font-semibold text-[var(--color-forest)]">
                    Results in plain language
                  </span>
                </div>
                <div className="font-sans text-[11px] text-[var(--color-text-muted)]">
                  No jargon. No confusion.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOW IT WORKS SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" className="bg-[var(--color-off-white)] py-[96px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          {/* Section Header */}
          <div className="text-center mb-[64px]">
            <div className="mb-[16px] inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
              Simple Process
            </div>
            <h2 className="font-serif text-[36px] md:text-[48px] leading-tight text-[var(--color-text-primary)]">
              Simple. Straightforward. Three Steps.
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-[48px]">

            {/* Step 1 — Choose Your Screening (content left, visual right) */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 pb-[48px] border-b border-dashed border-[var(--color-border)]">
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -top-4 left-0 font-serif text-[80px] font-bold text-[rgba(4,47,100,0.08)] leading-none select-none pointer-events-none">
                  01
                </div>
                <div className="relative pt-4">
                  <div className="font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-lime-dark)] mb-[12px]">
                    Step 01
                  </div>
                  <h3 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-text-primary)] mb-[16px]">
                    Choose Your Screening
                  </h3>
                  <p className="font-sans text-[16px] leading-[1.75] text-[var(--color-text-secondary)]">
                    Browse our screening categories and select the one that fits your needs — whether it's a routine check, infectious disease testing, or a specific health concern.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] p-[32px]">
                  <div className="flex flex-col gap-3">
                    {["General Health Check", "Infectious Disease", "Sexual & Reproductive", "Chronic Disease Risk"].map((label) => (
                      <div key={label} className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-forest)] px-4 py-3">
                        <div className="h-2 w-2 rounded-full bg-[var(--color-lime)]" />
                        <span className="font-sans text-[14px] font-medium text-white">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 — Book Online (visual left, content right) */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16 pb-[48px] border-b border-dashed border-[var(--color-border)]">
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -top-4 left-0 font-serif text-[80px] font-bold text-[rgba(4,47,100,0.08)] leading-none select-none pointer-events-none">
                  02
                </div>
                <div className="relative pt-4">
                  <div className="font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-lime-dark)] mb-[12px]">
                    Step 02
                  </div>
                  <h3 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-text-primary)] mb-[16px]">
                    Book Online
                  </h3>
                  <p className="font-sans text-[16px] leading-[1.75] text-[var(--color-text-secondary)]">
                    Pick a time that works for you and confirm your appointment. We will connect you to a trusted partner lab near you.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
                  <div className="relative h-[180px] w-full overflow-hidden bg-[var(--color-surface-2)]">
                    <img
                      src="/images/lab-scientist.png"
                      alt="Verified partner laboratory with certified clinical laboratory scientists"
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="absolute bottom-3 left-3 rounded-full bg-[var(--color-forest)]/90 backdrop-blur-sm px-3 py-1 font-sans text-[11px] font-semibold text-white flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[var(--color-lime)]" />
                      Verified Partner Lab Network
                    </div>
                  </div>
                  <div className="p-[24px]">
                    {/* Mini calendar */}
                    <div className="mb-4">
                      <div className="font-sans text-[13px] font-semibold text-[var(--color-text-primary)] mb-2">Select Date</div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <div key={i} className="font-sans text-[11px] font-medium text-[var(--color-text-muted)]">{d}</div>
                        ))}
                        {[14, 15, 16, 17, 18, 19, 20].map((d) => (
                          <div
                            key={d}
                            className={`h-8 flex items-center justify-center rounded-[var(--radius-sm)] font-sans text-[13px] ${
                              d === 17
                                ? "bg-[var(--color-lime)] font-bold text-white"
                                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                            }`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Time slots */}
                    <div className="font-sans text-[13px] font-semibold text-[var(--color-text-primary)] mb-2">Available Times</div>
                    <div className="grid grid-cols-2 gap-2">
                      {["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"].map((t, i) => (
                        <div
                          key={t}
                          className={`h-9 flex items-center justify-center rounded-[var(--radius-md)] font-sans text-[12px] font-medium border ${
                            i === 1
                              ? "bg-[var(--color-lime)] border-[var(--color-lime)] text-white font-bold"
                              : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — Get Results & Guidance (content left, visual right) */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 pb-[48px] border-b border-dashed border-[var(--color-border)]">
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -top-4 left-0 font-serif text-[80px] font-bold text-[rgba(4,47,100,0.08)] leading-none select-none pointer-events-none">
                  03
                </div>
                <div className="relative pt-4">
                  <div className="font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-lime-dark)] mb-[12px]">
                    Step 03
                  </div>
                  <h3 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-text-primary)] mb-[16px]">
                    Get Results &amp; Guidance
                  </h3>
                  <p className="font-sans text-[16px] leading-[1.75] text-[var(--color-text-secondary)]">
                    Receive your results in plain language. We help you understand what they mean and what your next steps should be — no medical jargon, no confusion.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-[24px] shadow-[var(--shadow-card)]">
                  {/* Results preview rows */}
                  <div className="flex flex-col divide-y divide-[var(--color-border)]">
                    <div className="flex items-center justify-between py-3">
                      <span className="font-sans text-[14px] font-medium text-[var(--color-text-primary)]">Blood Glucose</span>
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">92 mg/dL</span>
                        <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 font-sans text-[12px] font-semibold text-[#16A34A]">Normal</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-sans text-[14px] font-medium text-[var(--color-text-primary)]">Cholesterol</span>
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">218 mg/dL</span>
                        <span className="rounded-full bg-[#D97706]/10 px-3 py-1 font-sans text-[12px] font-semibold text-[#D97706]">Review</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-sans text-[14px] font-medium text-[var(--color-text-primary)]">Blood Pressure</span>
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">120/78</span>
                        <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 font-sans text-[12px] font-semibold text-[#16A34A]">Normal</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div className="font-sans text-[13px] font-semibold text-[var(--color-forest)] mb-2">What this means for you:</div>
                    <p className="font-sans text-[13px] text-[var(--color-text-muted)] leading-[1.6]">
                      Your glucose and blood pressure are within healthy ranges. Your cholesterol is slightly elevated — we recommend discussing this with a healthcare provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 — Your Health, All in One Place (visual left, content right) */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -top-4 left-0 font-serif text-[80px] font-bold text-[rgba(4,47,100,0.08)] leading-none select-none pointer-events-none">
                  04
                </div>
                <div className="relative pt-4">
                  <div className="font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-lime-dark)] mb-[12px]">
                    Step 04
                  </div>
                  <h3 className="font-serif text-[28px] md:text-[32px] font-semibold text-[var(--color-text-primary)] mb-[16px]">
                    Your Health, All in One Place
                  </h3>
                  <p className="font-sans text-[16px] leading-[1.75] text-[var(--color-text-secondary)]">
                    Every CareBis Prime user gets a personal health account. It stores your screening history, past results, and health records in one secure place, so you always have a clear picture of how your health has changed over time, and everything you need is ready whenever you need it.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-forest)] overflow-hidden shadow-[var(--shadow-card-hover)]">
                  <div className="relative h-[220px] w-full overflow-hidden bg-black/20">
                    <img
                      src="/images/health-tracking.png"
                      alt="Healthcare professional reviewing health tracking metrics and digital results on a tablet"
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="absolute bottom-3 left-3 rounded-full bg-[var(--color-forest)]/90 backdrop-blur-sm px-3 py-1 font-sans text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
                      <Activity className="h-3.5 w-3.5 text-[var(--color-lime)]" />
                      Results &amp; Health Tracking
                    </div>
                  </div>
                  <div className="p-[24px]">
                    <div className="font-sans text-[12px] font-bold uppercase tracking-wider text-[var(--color-lime)] mb-3">
                      Digital Health Record
                    </div>
                    {/* Health Timeline */}
                    <div className="relative flex flex-col gap-4">
                      <div className="absolute left-[7px] top-[14px] bottom-[14px] w-[2px] bg-white/20" />
                      {[
                        { date: "Jun 2025", test: "General Health Check", badge: "All Clear", badgeColor: "#16A34A" },
                        { date: "Mar 2025", test: "Infectious Disease Panel", badge: "Normal", badgeColor: "#16A34A" },
                        { date: "Dec 2024", test: "Chronic Disease Risk", badge: "Review", badgeColor: "#D97706" },
                      ].map((entry) => (
                        <div key={entry.date} className="relative flex items-start gap-4 pl-6">
                          <div className="absolute left-0 top-[6px] h-4 w-4 rounded-full border-2 border-white/40 bg-[var(--color-forest)]" />
                          <div>
                            <div className="font-sans text-[11px] font-medium uppercase tracking-wider text-white/50 mb-0.5">
                              {entry.date}
                            </div>
                            <div className="font-sans text-[14px] font-semibold text-white mb-0.5">
                              {entry.test}
                            </div>
                            <span
                              className="inline-block rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${entry.badgeColor}20`,
                                color: entry.badgeColor,
                              }}
                            >
                              {entry.badge}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          WHY CAREBIS PRIME SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[var(--color-white)] py-[96px] px-[24px] md:px-[80px]">
        <div className="mx-auto max-w-[1200px]">
          {/* Section Header */}
          <div className="text-center mb-[64px]">
            <div className="mb-[16px] inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
              Why Choose Us
            </div>
            <h2 className="font-serif text-[36px] md:text-[48px] leading-tight text-[var(--color-text-primary)]">
              Why People Choose CareBis Prime
            </h2>
          </div>

          {/* 2×2 Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {[
              {
                icon: Shield,
                title: "Prevention, Not Reaction",
                body: "Most serious health conditions are preventable or manageable when caught early. We help you stay ahead of them.",
              },
              {
                icon: BadgeCheck,
                title: "Trusted Partner Labs",
                body: "Every facility we work with is vetted for quality and reliability. You are always in safe hands.",
              },
              {
                icon: FileText,
                title: "Results You Can Actually Understand",
                body: "We translate your results into simple language and walk you through what they mean for your health.",
              },
              {
                icon: Compass,
                title: "Guidance at Every Step",
                body: "From choosing the right test to deciding on next steps — we are with you throughout the process.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-[32px] transition-all duration-250 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
              >
                <div className="mb-[20px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[rgba(4,47,100,0.08)]">
                  <card.icon className="h-6 w-6 text-[var(--color-forest)]" />
                </div>
                <h3 className="mb-[8px] font-sans text-[18px] font-semibold text-[var(--color-forest)]">
                  {card.title}
                </h3>
                <p className="font-sans text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM CTA SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-[24px] md:px-[48px] lg:px-[80px] pb-[96px]">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-forest)] px-[24px] py-[80px] text-center md:px-[80px]">
          {/* Decorative circle */}
          <div className="pointer-events-none absolute -right-[100px] -top-[100px] h-[500px] w-[500px] rounded-full bg-[rgba(40,103,182,0.12)] z-0" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-[24px] inline-flex rounded-full bg-white/10 px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-white border border-white/20">
              Start Today
            </div>
            <h2 className="mb-[16px] font-serif text-[36px] sm:text-[56px] leading-tight text-white">
              Your health does not have to be a mystery.
            </h2>
            <p className="mb-[48px] max-w-[520px] font-sans text-[16px] sm:text-[18px] text-white/75 leading-[1.6]">
              Book a screening today and get the clarity you deserve.
            </p>

            <Link to="/services">
              <button className="h-[52px] px-[36px] rounded-full bg-white text-[16px] font-semibold text-[var(--color-forest)] transition-all duration-150 hover:bg-[var(--color-off-white)] hover:-translate-y-[1px]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
