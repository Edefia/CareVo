import { Link } from "react-router-dom"
import { Heart, Droplets, Activity, Calendar, FileText, Bell, CheckCircle2, AlertTriangle, Info, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"

export function ClientDashboard() {
  const { user } = useAuthStore()

  // MOCK DATA (will be replaced by real API data later)
  const hasScreenings = true
  const overallRisk = 'MODERATE' // LOW | MODERATE | HIGH

  const cardio = {
    hasData: true,
    value: "135/88 mmHg",
    risk: "MODERATE"
  }

  const renal = {
    hasData: false,
    value: "—",
    risk: null
  }

  const metabolic = {
    hasData: true,
    value: "5.1 mmol/L",
    risk: "LOW"
  }

  const recentResults = [
    {
      id: 1,
      package: "Cardio Essentials",
      pillar: "CARDIO",
      date: "Oct 12, 2025",
      lab: "AccuLab Diagnostics",
      referralCode: "CRV-2025-KA8X3T",
      risk: "MODERATE"
    },
    {
      id: 2,
      package: "Metabolic Check",
      pillar: "METABOLIC",
      date: "Jun 14, 2025",
      lab: "MediScan Ghana",
      referralCode: "CRV-2025-AM7P2R",
      risk: "LOW"
    }
  ]

  const notifications = [
    { id: 1, text: "Your Cardio Essentials results are ready.", time: "2 hours ago", type: "result" },
    { id: 2, text: "Booking CRV-2025-A7K3P2 confirmed for Oct 12.", time: "1 day ago", type: "booking" },
    { id: 3, text: "Follow-up recommended — book within 30 days.", time: "1 week ago", type: "alert" },
    { id: 4, text: "Reminder: Your next screening is due in 3 months.", time: "2 weeks ago", type: "reminder" }
  ]

  // Helper for risk badge styling
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

  return (
    <div className="space-y-[32px] md:space-y-[48px]">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          WELCOME BANNER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Welcome back, {user?.firstName || 'Client'}.
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEALTH SUMMARY CARDS (THE 3 PILLARS)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        
        {/* BLOOD PRESSURE CARD */}
        <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="p-[24px] flex-1" style={{ backgroundColor: 'rgba(220,38,38,0.04)' }}>
            <div className="flex items-center justify-between mb-[24px]">
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#DC2626]/10">
                  <Activity className="h-[20px] w-[20px] text-[#DC2626]" />
                </div>
                <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Blood Pressure</h3>
              </div>
              {cardio.hasData && (
                <div className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskColor(cardio.risk)}`}>
                  {cardio.risk} RISK
                </div>
              )}
            </div>
            
            <div className="mb-[8px]">
              <span className="font-sans text-[13px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Latest Reading</span>
            </div>
            <div className="font-serif text-[36px] font-semibold text-[var(--color-text-primary)] leading-none">
              {cardio.value}
            </div>
            {!cardio.hasData && (
              <div className="mt-2 text-[13px] text-[var(--color-text-muted)]">No screening yet</div>
            )}
          </div>
          <div className="bg-white border-t border-[var(--color-border)] px-[24px] py-[16px]">
            <Link to="/client/results" className="text-[14px] font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors flex items-center gap-1">
              View History <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* BLOOD GLUCOSE CARD */}
        <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="p-[24px] flex-1" style={{ backgroundColor: 'rgba(15,118,224,0.04)' }}>
            <div className="flex items-center justify-between mb-[24px]">
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#0F76E0]/10">
                  <Droplets className="h-[20px] w-[20px] text-[#0F76E0]" />
                </div>
                <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Blood Glucose</h3>
              </div>
              {metabolic.hasData && (
                <div className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskColor(metabolic.risk)}`}>
                  {metabolic.risk} RISK
                </div>
              )}
            </div>
            
            <div className="mb-[8px]">
              <span className="font-sans text-[13px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Fasting</span>
            </div>
            <div className="font-serif text-[36px] font-semibold text-[var(--color-text-primary)] leading-none">
              {metabolic.value}
            </div>
            {!metabolic.hasData && (
              <div className="mt-2 text-[13px] text-[var(--color-text-muted)]">No screening yet</div>
            )}
          </div>
          <div className="bg-white border-t border-[var(--color-border)] px-[24px] py-[16px]">
            <Link to="/client/results" className="text-[14px] font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors flex items-center gap-1">
              View History <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* CHOLESTEROL CARD */}
        <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="p-[24px] flex-1" style={{ backgroundColor: 'rgba(217,119,6,0.04)' }}>
            <div className="flex items-center justify-between mb-[24px]">
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#D97706]/10">
                  <Heart className="h-[20px] w-[20px] text-[#D97706]" />
                </div>
                <h3 className="font-sans text-[16px] font-bold text-[var(--color-forest)]">Cholesterol</h3>
              </div>
              {renal.hasData && (
                <div className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskColor(renal.risk)}`}>
                  {renal.risk} RISK
                </div>
              )}
            </div>
            
            <div className="mb-[8px]">
              <span className="font-sans text-[13px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Total</span>
            </div>
            <div className="font-serif text-[36px] font-semibold text-[var(--color-text-primary)] leading-none">
              5.2 mmol/L
            </div>
            {!renal.hasData && (
              <div className="mt-2 text-[13px] text-[var(--color-text-muted)]">No screening yet</div>
            )}
          </div>
          <div className="bg-white border-t border-[var(--color-border)] px-[24px] py-[16px]">
            <Link to="/client/results" className="text-[14px] font-medium text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] transition-colors flex items-center gap-1">
              View History <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA If No Screenings */}
      {(!cardio.hasData && !renal.hasData && !metabolic.hasData) && (
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RISK STATUS INDICATOR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {hasScreenings && (
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
              Based on your most recent CareVo screening.
            </p>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LOWER CONTENT GRID
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[32px] lg:grid-cols-[2fr_1fr]">
        
        {/* RECENT TEST RESULTS */}
        <div>
          <h2 className="mb-[20px] font-serif text-[24px] font-semibold text-[var(--color-forest)]">
            Recent Screening Results
          </h2>
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
                      <span className="hidden sm:inline text-[var(--color-border)]">|</span>
                      <span>{result.lab}</span>
                      <span className="hidden sm:inline text-[var(--color-border)]">|</span>
                      <span className="font-mono text-[12px] bg-[var(--color-surface-2)] px-1 rounded text-[var(--color-forest)]">{result.referralCode}</span>
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
        </div>

        {/* NOTIFICATIONS PANEL */}
        <div>
          <h2 className="mb-[20px] font-serif text-[24px] font-semibold text-[var(--color-forest)]">
            Notifications
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
            {notifications.map((notif, i) => (
              <div key={notif.id} className={`p-[20px] flex items-start gap-[16px] ${i !== notifications.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}>
                <div className="mt-1">
                  {notif.type === 'result' && <FileText className="h-5 w-5 text-[var(--color-lime-dark)]" />}
                  {notif.type === 'booking' && <Calendar className="h-5 w-5 text-[#0F76E0]" />}
                  {notif.type === 'alert' && <AlertTriangle className="h-5 w-5 text-[#D97706]" />}
                  {notif.type === 'reminder' && <Bell className="h-5 w-5 text-[#8B5CF6]" />}
                </div>
                <div>
                  <p className="font-sans text-[14px] font-medium text-[var(--color-text-primary)] mb-1 leading-snug">
                    {notif.text}
                  </p>
                  <p className="font-sans text-[12px] text-[var(--color-text-muted)]">
                    {notif.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
