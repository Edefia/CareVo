import { Link } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  FileText,
  Heart,
  Droplets,
  QrCode,
  TrendingUp,
  CheckCircle2,
  Menu,
  X,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-off-white)] font-sans text-[var(--color-text-primary)]">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NAVIGATION BAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-50 w-full bg-[var(--color-white)] transition-all duration-200 border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-[24px] md:px-[48px]">
          
          {/* Left: Brand */}
          <Link to="/" className="flex items-center gap-1">
            <span className="font-serif text-[22px] font-semibold text-[var(--color-forest)]">CareBis Prime</span>
            <sup className="text-[10px] font-bold text-[var(--color-forest)] mt-1">®</sup>
          </Link>

          {/* Center: Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-[32px] text-[14px] font-medium text-[var(--color-text-secondary)]">
            <a href="#how-it-works" className="hover:text-[var(--color-forest)] hover:font-semibold transition-all">How It Works</a>
            <div className="group relative">
              <a href="#services" className="flex items-center gap-1 hover:text-[var(--color-forest)] hover:font-semibold transition-all">
                Services <ChevronDown className="h-4 w-4" />
              </a>
              <div className="absolute left-0 top-full hidden w-[220px] pt-4 group-hover:block">
                <div className="rounded-md border border-[var(--color-border)] bg-white p-2 shadow-lg">
                  <a href="#" className="block rounded px-3 py-2 text-[14px] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-forest)]">Cardio Health</a>
                  <a href="#" className="block rounded px-3 py-2 text-[14px] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-forest)]">Renal Health</a>
                  <a href="#" className="block rounded px-3 py-2 text-[14px] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-forest)]">Metabolic Health</a>
                  <div className="my-1 border-t border-[var(--color-border)]"></div>
                  <a href="#" className="block rounded px-3 py-2 text-[14px] font-medium text-[var(--color-forest)] hover:bg-[var(--color-surface-2)]">Complete Wellness</a>
                </div>
              </div>
            </div>
            <a href="#for-labs" className="hover:text-[var(--color-forest)] hover:font-semibold transition-all">For Labs</a>
            <a href="#about" className="hover:text-[var(--color-forest)] hover:font-semibold transition-all">About</a>
          </nav>

          {/* Right: Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-[12px]">
            <a href="#contact" className="text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] hover:bg-[var(--color-surface-2)] px-3 py-2 rounded-md transition-colors mr-2">Contact</a>
            <Link to="/login">
              <Button variant="secondary" className="h-[40px] px-5 text-[14px]">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="h-[40px] px-5 text-[14px]">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[var(--color-text-secondary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] bg-white px-[24px] py-[16px] shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-[16px] text-[15px] font-medium text-[var(--color-text-secondary)] mb-4">
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-forest)]">How It Works</a>
              <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-forest)]">Services</a>
              <a href="#for-labs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-forest)]">For Labs</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-forest)]">About</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-forest)]">Contact</a>
            </nav>
            <div className="flex flex-col gap-[12px] pt-4 border-t border-[var(--color-border)]">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full h-[44px]">Log In</Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-[44px]">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative flex min-h-[calc(100vh-72px)] items-center bg-[var(--color-white)] py-12 lg:py-0">
          <div className="mx-auto w-full max-w-[1280px] px-[24px] md:px-[48px] lg:px-[80px]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
              
              {/* Left Column: Text (52%) */}
              <div className="w-full lg:w-[52%] flex flex-col items-start text-left z-10">
                {/* Pre-heading tag */}
                <div className="mb-[24px] inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
                  <Activity className="h-3 w-3" />
                  Preventive Healthcare Platform
                </div>

                {/* Main Heading */}
                <h1 className="mb-[24px] leading-[1.05]">
                  <span className="block font-serif text-[48px] md:text-[60px] lg:text-[68px] font-normal italic text-[var(--color-text-primary)]">Preventive care,</span>
                  <span className="block font-serif text-[48px] md:text-[60px] lg:text-[68px] font-bold text-[var(--color-forest)]">Real results.</span>
                </h1>

                {/* Sub-heading */}
                <p className="mb-[40px] max-w-[440px] font-sans text-[16px] md:text-[18px] font-normal leading-[1.7] text-[var(--color-text-secondary)]">
                  CareBis Prime monitors your Cardio, Renal, and Metabolic health — delivering early screening, expert interpretation, and personalised guidance before illness takes hold.
                </p>

                {/* CTA Row */}
                <div className="flex flex-col sm:flex-row gap-[16px] w-full sm:w-auto">
                  <Link to="/register">
                    <Button className="h-[52px] px-[32px] w-full sm:w-auto text-[16px]">Book a Screening</Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button variant="ghost" className="h-[52px] px-[24px] w-full sm:w-auto text-[16px] gap-2">
                      See How It Works <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>

                {/* Stats Row */}
                <div className="mt-[48px] flex items-center gap-[32px]">
                  <div className="flex flex-col">
                    <span className="font-serif text-[28px] font-bold text-[var(--color-forest)]">3</span>
                    <span className="font-sans text-[13px] font-medium text-[var(--color-text-muted)]">Health pillars monitored</span>
                  </div>
                  <div className="h-[36px] w-[1px] bg-[var(--color-border)]"></div>
                  <div className="flex flex-col">
                    <span className="font-serif text-[28px] font-bold text-[var(--color-forest)]">98%</span>
                    <span className="font-sans text-[13px] font-medium text-[var(--color-text-muted)]">Satisfaction rate</span>
                  </div>
                  <div className="h-[36px] w-[1px] bg-[var(--color-border)] hidden sm:block"></div>
                  <div className="flex flex-col hidden sm:flex">
                    <span className="font-serif text-[28px] font-bold text-[var(--color-forest)]">24hr</span>
                    <span className="font-sans text-[13px] font-medium text-[var(--color-text-muted)]">Result turnaround</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual (48%) */}
              <div className="w-full lg:w-[48%] relative h-[400px] sm:h-[540px] mt-12 lg:mt-0">
                {/* Background Shape */}
                <div className="absolute right-0 bottom-0 h-[480px] w-[85%] rounded-[var(--radius-xl)] bg-[var(--color-forest)] z-0 hidden lg:block"></div>

                {/* Photo Card 1 (Main - Tall) */}
                <div className="absolute left-0 top-0 h-[380px] w-[60%] lg:w-[52%] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)] z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=500&fit=crop" 
                    alt="Doctor consulting patient" 
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Photo Card 2 (Right - Shorter) */}
                <div className="absolute right-0 top-[24px] h-[240px] w-[45%] lg:w-[44%] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)] z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=360&h=280&fit=crop" 
                    alt="Blood draw" 
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Photo Card 3 (Right - Lower) */}
                <div className="absolute right-0 bottom-0 h-[200px] w-[45%] lg:w-[44%] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)] z-10 hidden sm:block">
                  <img 
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=360&h=240&fit=crop" 
                    alt="Lab equipment" 
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Floating Stat Card */}
                <div className="absolute bottom-[40px] lg:bottom-[80px] left-[20%] lg:left-[36%] z-20 rounded-[var(--radius-md)] bg-[var(--color-white)] px-[18px] py-[14px] shadow-[var(--shadow-card-hover)]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                      <Activity className="h-3 w-3 text-[var(--color-lime)]" />
                    </div>
                    <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-[var(--color-forest)]">Live Results</span>
                  </div>
                  <div className="font-sans text-[13px] font-semibold text-[var(--color-forest)]">Fast & Reliable Delivery</div>
                  <div className="font-sans text-[11px] text-[var(--color-text-muted)]">Lab-Trusted. Doorstep Delivered.</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TRUSTED BY LOGOS BAR
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-2)] px-[24px] py-[32px] md:px-[80px]">
          <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row items-center justify-between gap-8">
            <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Trusted by leading laboratories
            </div>
            <div className="flex flex-wrap items-center justify-center gap-[32px] md:gap-[48px] opacity-60 grayscale">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-[24px] w-[80px] md:w-[100px] rounded-sm bg-[var(--color-text-muted)] opacity-30"></div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HOW IT WORKS SECTION (7 Steps)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="how-it-works" className="bg-[var(--color-white)] py-[96px] px-[24px] md:px-[80px]">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
              
              {/* Left Column: Title & Photo */}
              <div className="w-full lg:w-[45%] lg:sticky lg:top-[120px]">
                <div className="mb-[24px] inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
                  The CareBis Prime Journey
                </div>
                <h2 className="mb-[16px] font-serif text-[42px] leading-tight text-[var(--color-text-primary)]">
                  How CareBis Prime works
                </h2>
                <p className="mb-[48px] max-w-[380px] font-sans text-[16px] text-[var(--color-text-muted)] leading-[1.6]">
                  From booking to understanding your results in 7 clear steps.
                </p>

                <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-lg hidden lg:block">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=560&h=420&fit=crop" 
                    alt="Patient health screening" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Right Column: 7 Steps */}
              <div className="w-full lg:w-[55%]">
                
                {/* Group 1: Booking */}
                <div className="mb-[16px] font-sans text-[13px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Part 1: Booking
                </div>
                
                <div className="relative flex flex-col gap-[32px] mb-[48px]">
                  <div className="absolute left-[20px] top-[40px] bottom-[20px] w-[2px] border-l-2 border-[var(--color-border)] z-0 hidden sm:block"></div>
                  
                  {/* Step 1 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-white)] font-serif text-[18px] font-bold text-[var(--color-forest)] border-2 border-[var(--color-forest)]">
                      1
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-text-primary)] mb-2">Select Your Package</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        Choose from our Cardio, Renal, Metabolic, or Complete Wellness screening packages based on your health goals.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-white)] font-serif text-[18px] font-bold text-[var(--color-forest)] border-2 border-[var(--color-forest)]">
                      2
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-text-primary)] mb-2">Choose a Laboratory</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        Select a CareBis Prime partner laboratory near you that offers your chosen package.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-white)] font-serif text-[18px] font-bold text-[var(--color-forest)] border-2 border-[var(--color-forest)]">
                      3
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-text-primary)] mb-2">Pick a Date & Time</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        Schedule your appointment at a time that works for you. Same-week slots are usually available.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)] font-serif text-[18px] font-bold text-white shadow-md">
                      4
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-forest)] mb-2">Get Your Referral Code</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        Receive your unique CareBis Prime Referral Code — your digital key that connects your booking to the laboratory securely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group 2: Results */}
                <div className="mb-[16px] font-sans text-[13px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Part 2: Results & Care
                </div>
                
                <div className="relative flex flex-col gap-[32px]">
                  <div className="absolute left-[20px] top-[40px] bottom-[20px] w-[2px] border-l-2 border-[var(--color-border)] z-0 hidden sm:block"></div>
                  
                  {/* Step 5 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-white)] font-serif text-[18px] font-bold text-[var(--color-forest)] border-2 border-[var(--color-forest)]">
                      5
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-text-primary)] mb-2">Visit the Lab</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        Attend your appointment. The lab identifies you using your Referral Code and conducts your tests.
                      </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-white)] font-serif text-[18px] font-bold text-[var(--color-forest)] border-2 border-[var(--color-forest)]">
                      6
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-text-primary)] mb-2">Expert Interpretation</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        CareBis Prime's clinical interpreters review your raw results and deliver a plain-English health report with risk classification.
                      </p>
                    </div>
                  </div>

                  {/* Step 7 */}
                  <div className="relative z-10 flex items-start gap-[24px]">
                    <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)] font-serif text-[18px] font-bold text-[var(--color-lime)] shadow-md border-2 border-[var(--color-forest)]">
                      7
                    </div>
                    <div className="pt-2">
                      <h3 className="font-sans text-[18px] font-semibold text-[var(--color-text-primary)] mb-2">Receive & Act</h3>
                      <p className="font-sans text-[15px] text-[var(--color-text-muted)] leading-[1.6]">
                        Access your personalised report in your dashboard. Book follow-up care if recommended — all within CareBis Prime.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-[48px] flex gap-[16px]">
                  <Link to="/register">
                    <Button>Start Your Journey</Button>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FEATURES / PILLARS SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="services" className="bg-[var(--color-forest)] px-[24px] py-[96px] md:px-[80px] text-white">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-[64px] text-center sm:text-left">
              <div className="mb-[24px] inline-flex rounded-full bg-white/10 px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-white border border-white/20">
                Core Health Pillars
              </div>
              <h2 className="mb-[16px] font-serif text-[42px] md:text-[48px] font-semibold leading-tight text-white max-w-[600px]">
                Healthcare that actually explains itself.
              </h2>
              <p className="max-w-[500px] font-sans text-[17px] leading-[1.6] text-white/70 mx-auto sm:mx-0">
                We focus on the three foundational pillars of metabolic syndrome and chronic disease prevention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              
              {/* Card 1: Cardio */}
              <div className="group rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-[28px] transition-colors duration-200 hover:bg-white/10">
                <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)] bg-[#DC2626]/20">
                  <Heart className="h-[26px] w-[26px] text-[#DC2626]" />
                </div>
                <h3 className="mb-[8px] font-sans text-[17px] font-semibold text-white">Cardio Health Monitoring</h3>
                <p className="font-sans text-[14px] leading-[1.7] text-white/65">
                  Track blood pressure, cholesterol, and lipid panels to prevent heart disease before it starts.
                </p>
              </div>

              {/* Card 2: Renal */}
              <div className="group rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-[28px] transition-colors duration-200 hover:bg-white/10">
                <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)] bg-[#0F76E0]/20">
                  <Droplets className="h-[26px] w-[26px] text-[#0F76E0]" />
                </div>
                <h3 className="mb-[8px] font-sans text-[17px] font-semibold text-white">Renal Health Screening</h3>
                <p className="font-sans text-[14px] leading-[1.7] text-white/65">
                  Monitor kidney function with creatinine, eGFR, and urine analysis — catching early decline when it's most treatable.
                </p>
              </div>

              {/* Card 3: Metabolic */}
              <div className="group rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-[28px] transition-colors duration-200 hover:bg-white/10">
                <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)] bg-[#D97706]/20">
                  <Activity className="h-[26px] w-[26px] text-[#D97706]" />
                </div>
                <h3 className="mb-[8px] font-sans text-[17px] font-semibold text-white">Metabolic Health Panels</h3>
                <p className="font-sans text-[14px] leading-[1.7] text-white/65">
                  Screen for diabetes and insulin resistance with fasting glucose, HbA1c, and BMI profiling.
                </p>
              </div>

              {/* Card 4: Referral Codes */}
              <div className="group rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-[28px] transition-colors duration-200 hover:bg-white/10">
                <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)] bg-white/10">
                  <QrCode className="h-[26px] w-[26px] text-white" />
                </div>
                <h3 className="mb-[8px] font-sans text-[17px] font-semibold text-white">Secure Referral Codes</h3>
                <p className="font-sans text-[14px] leading-[1.7] text-white/65">
                  Every booking generates a unique Referral Code that securely links you to your laboratory — no paperwork required.
                </p>
              </div>

              {/* Card 5: Interpretation */}
              <div className="group rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-[28px] transition-colors duration-200 hover:bg-white/10">
                <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)] bg-white/10">
                  <FileText className="h-[26px] w-[26px] text-white" />
                </div>
                <h3 className="mb-[8px] font-sans text-[17px] font-semibold text-white">Clinical Interpretation</h3>
                <p className="font-sans text-[14px] leading-[1.7] text-white/65">
                  Your raw results are reviewed by trained CareBis Prime interpreters who translate complex data into personalised health guidance.
                </p>
              </div>

              {/* Card 6: Progress Tracking */}
              <div className="group rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-[28px] transition-colors duration-200 hover:bg-white/10">
                <div className="mb-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[var(--radius-md)] bg-white/10">
                  <TrendingUp className="h-[26px] w-[26px] text-white" />
                </div>
                <h3 className="mb-[8px] font-sans text-[17px] font-semibold text-white">Track Your Progress</h3>
                <p className="font-sans text-[14px] leading-[1.7] text-white/65">
                  Compare results over time to see how lifestyle changes are improving your Cardio, Renal, and Metabolic health.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOR LABORATORIES SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="for-labs" className="bg-[var(--color-off-white)] py-[96px] px-[24px] md:px-[80px]">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              {/* Left Column */}
              <div className="w-full lg:w-1/2">
                <div className="mb-[24px] inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-forest)]">
                  For Laboratory Partners
                </div>
                <h2 className="mb-[24px] font-serif text-[44px] leading-tight text-[var(--color-text-primary)]">
                  Join the CareBis Prime laboratory network.
                </h2>
                <p className="mb-[40px] max-w-[440px] font-sans text-[16px] text-[var(--color-text-secondary)] leading-[1.7]">
                  Expand your reach and streamline your operations with our digital-first platform built specifically for modern labs.
                </p>

                <div className="mb-[48px] flex flex-col gap-[16px]">
                  {[
                    "Accept pre-paid bookings via Referral Codes",
                    "Digital result entry for Cardio, Renal & Metabolic panels",
                    "Automatic result routing to CareBis Prime Interpreters",
                    "Real-time analytics on your lab's performance"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-[12px]">
                      <CheckCircle2 className="h-5 w-5 text-[var(--color-lime)] shrink-0" />
                      <span className="font-sans text-[15px] font-medium text-[var(--color-text-primary)]">{item}</span>
                    </div>
                  ))}
                </div>

                <Button>Register Your Laboratory</Button>
              </div>

              {/* Right Column: Mini Dashboard */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <div className="w-full max-w-[500px] rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card-hover)] overflow-hidden border border-[var(--color-border)]">
                  {/* Fake Topbar */}
                  <div className="bg-[var(--color-forest)] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-[14px] font-semibold text-white">CareBis Prime</span>
                      <span className="text-[10px] text-white/70 uppercase">Laboratory</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-white/30"></div>
                      <div className="h-2 w-2 rounded-full bg-white/30"></div>
                    </div>
                  </div>
                  {/* Fake Content */}
                  <div className="p-5 bg-[var(--color-off-white)]">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-md border border-[var(--color-border)] p-3 shadow-sm">
                          <div className="h-6 w-6 rounded-full bg-[var(--color-surface-2)] mb-2"></div>
                          <div className="h-4 w-12 bg-slate-200 rounded-sm mb-1"></div>
                          <div className="h-2 w-16 bg-slate-100 rounded-sm"></div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-md border border-[var(--color-border)] shadow-sm overflow-hidden">
                      <div className="bg-[var(--color-surface-2)] h-8 border-b border-[var(--color-border)] px-4 py-2 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">Assigned Clients Queue</span>
                      </div>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 border-b border-[var(--color-border)] flex items-center px-4 gap-4">
                          <div className="font-mono text-[11px] text-[var(--color-forest)] font-semibold">CRV-2025-A7K3P2</div>
                          <div className="h-2 w-24 bg-slate-100 rounded-sm"></div>
                          <div className="h-6 w-16 bg-[var(--color-forest)] rounded-md ml-auto text-[10px] text-white flex items-center justify-center">Enter</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CTA SECTION (BOTTOM)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-[24px] md:px-[48px] pb-[96px] mt-[96px]">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-forest)] px-[24px] py-[96px] text-center md:px-[80px]">
            {/* Decorative blurred circle */}
            <div className="pointer-events-none absolute -right-[100px] -top-[100px] h-[400px] w-[400px] rounded-full bg-[#7EE8A2]/10 blur-[64px] z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-[24px] inline-flex rounded-full bg-white/10 px-[14px] py-[4px] font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-white border border-white/20">
                Start Today
              </div>
              <h2 className="mb-[16px] font-serif text-[42px] sm:text-[56px] leading-tight text-white">
                Take control of your health.
              </h2>
              <p className="mb-[48px] max-w-[520px] font-sans text-[16px] sm:text-[18px] text-white/75 leading-[1.6]">
                Book your first screening in under 3 minutes. <br className="hidden sm:block" /> Know your results. Understand your body.
              </p>

              <div className="flex flex-col sm:flex-row gap-[16px]">
                <Link to="/register">
                  <Button variant="dark" className="h-[52px] px-[32px] w-full sm:w-auto">Book a Screening</Button>
                </Link>
                <a href="#for-labs">
                  <Button className="h-[52px] px-[32px] w-full sm:w-auto bg-transparent border border-white text-white hover:bg-white/10">For Laboratories &rarr;</Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="bg-[#0F1F16] pt-[64px] pb-[32px] px-[24px] md:px-[80px] text-white/60">
        <div className="mx-auto max-w-[1280px]">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[48px] mb-[64px]">
            {/* Column 1: Brand */}
            <div>
              <div className="mb-4 font-serif text-[24px] font-semibold text-white">CareBis Prime</div>
              <p className="font-sans text-[14px] leading-relaxed mb-6">Preventive care for everyone.</p>
              <div className="flex gap-[16px]">
                {/* Social Placeholders */}
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors"><span className="text-white text-[12px]">in</span></div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors"><span className="text-white text-[12px]">tw</span></div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors"><span className="text-white text-[12px]">ig</span></div>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h4 className="mb-[20px] font-sans text-[13px] font-semibold uppercase tracking-wider text-white">Platform</h4>
              <ul className="flex flex-col gap-[12px] font-sans text-[14px]">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#for-labs" className="hover:text-white transition-colors">For Labs</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="mb-[20px] font-sans text-[13px] font-semibold uppercase tracking-wider text-white">Company</h4>
              <ul className="flex flex-col gap-[12px] font-sans text-[14px]">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 className="mb-[20px] font-sans text-[13px] font-semibold uppercase tracking-wider text-white">Legal</h4>
              <ul className="flex flex-col gap-[12px] font-sans text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-[24px] font-sans text-[13px] gap-4">
            <div>&copy; {new Date().getFullYear()} CareBis Prime Health. All rights reserved.</div>
            <div>Made with care in Ghana 🇬🇭</div>
          </div>

        </div>
      </footer>
    </div>
  )
}
