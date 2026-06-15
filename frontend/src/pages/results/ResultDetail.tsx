import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Calendar, Heart, Droplets, Activity, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResultDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  // Mock Data
  const mockReport = {
    id: id || "1",
    package: "Complete Wellness",
    date: "Oct 12, 2025",
    overallRisk: "MODERATE",
    followUp: "See GP within 2 weeks to discuss elevated blood pressure and BMI.",
    pillars: [
      {
        name: "CARDIO",
        title: "Cardio Health",
        risk: "MODERATE",
        interpreterNotes: "Your blood pressure is slightly elevated above the normal range. While your cholesterol levels are excellent, the blood pressure reading suggests we should keep an eye on your cardiovascular health. Consider reducing sodium intake and increasing moderate exercise.",
        labData: [
          { name: "Systolic Blood Pressure", value: "135", unit: "mmHg", normalRange: "< 120", isOutlier: true },
          { name: "Diastolic Blood Pressure", value: "88", unit: "mmHg", normalRange: "< 80", isOutlier: true },
          { name: "Total Cholesterol", value: "4.8", unit: "mmol/L", normalRange: "< 5.0", isOutlier: false }
        ]
      },
      {
        name: "RENAL",
        title: "Renal Health",
        risk: "LOW",
        interpreterNotes: "Your kidney function markers are all within optimal ranges. Your eGFR indicates excellent filtration rate, and creatinine is normal. Maintain good hydration to keep your kidneys healthy.",
        labData: [
          { name: "Creatinine", value: "85", unit: "μmol/L", normalRange: "60 - 110", isOutlier: false },
          { name: "eGFR", value: "95", unit: "mL/min/1.73m²", normalRange: "> 90", isOutlier: false }
        ]
      },
      {
        name: "METABOLIC",
        title: "Metabolic Health",
        risk: "LOW",
        interpreterNotes: "Your blood sugar and HbA1c (long-term average sugar) are in the healthy range, indicating no signs of diabetes. Your BMI is slightly elevated, but given your other healthy markers, this is not a major concern currently.",
        labData: [
          { name: "Fasting Blood Glucose", value: "5.1", unit: "mmol/L", normalRange: "3.9 - 5.5", isOutlier: false },
          { name: "HbA1c", value: "5.4", unit: "%", normalRange: "< 5.7", isOutlier: false },
          { name: "Body Mass Index", value: "28.5", unit: "kg/m²", normalRange: "18.5 - 24.9", isOutlier: true }
        ]
      }
    ]
  }

  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)

  const togglePillar = (pillarName: string) => {
    setExpandedPillar(prev => prev === pillarName ? null : pillarName)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20'
      case 'MODERATE': return 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20'
      case 'HIGH': return 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20'
      default: return 'bg-gray-100 text-gray-500 border-gray-200'
    }
  }

  const getRiskIcon = (risk: string, className = "h-5 w-5") => {
    switch (risk) {
      case 'LOW': return <CheckCircle2 className={`${className} text-[#16A34A]`} />
      case 'MODERATE': return <Info className={`${className} text-[#D97706]`} />
      case 'HIGH': return <AlertCircle className={`${className} text-[#DC2626]`} />
      default: return null
    }
  }

  const renderPillarIcon = (pillar: string) => {
    switch(pillar) {
      case 'CARDIO': return <Heart className="h-5 w-5 text-[#DC2626]" />
      case 'RENAL': return <Droplets className="h-5 w-5 text-[#0F76E0]" />
      case 'METABOLIC': return <Activity className="h-5 w-5 text-[#D97706]" />
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[800px] mx-auto pb-[96px]">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/client/dashboard')} className="mt-1 shrink-0">
          <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Button>
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Your Health Report
          </h1>
          <div className="flex items-center gap-2 text-[15px] text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">{mockReport.package}</span>
            <span className="text-[var(--color-border)] px-2">|</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {mockReport.date}</span>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERALL SUMMARY
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`p-[32px] rounded-[var(--radius-xl)] border shadow-sm ${getRiskColor(mockReport.overallRisk)}`}>
        <div className="flex items-center gap-[16px] mb-6">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-black/5">
            {getRiskIcon(mockReport.overallRisk, "h-8 w-8")}
          </div>
          <div>
            <div className="text-[13px] font-bold uppercase tracking-wider mb-1 opacity-80">Overall Health Risk</div>
            <div className="font-serif text-[32px] font-bold leading-none">{mockReport.overallRisk}</div>
          </div>
        </div>

        <div className="bg-white/60 p-[20px] rounded-[var(--radius-lg)] border border-black/5">
          <div className="text-[13px] font-bold uppercase tracking-wider mb-2 opacity-80">Recommended Follow-up</div>
          <div className="font-medium text-[16px] leading-snug">{mockReport.followUp}</div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PILLAR BREAKDOWN
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-[24px]">
        <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)]">Detailed Breakdown</h2>
        
        {mockReport.pillars.map((pillar) => (
          <div key={pillar.name} className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm overflow-hidden">
            {/* Pillar Header */}
            <div className="p-[24px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-[40px] w-[40px] items-center justify-center rounded-[var(--radius-md)] ${
                  pillar.name === 'CARDIO' ? 'bg-[#DC2626]/10' :
                  pillar.name === 'RENAL' ? 'bg-[#0F76E0]/10' :
                  'bg-[#D97706]/10'
                }`}>
                  {renderPillarIcon(pillar.name)}
                </div>
                <div>
                  <h3 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)]">{pillar.title}</h3>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskColor(pillar.risk)}`}>
                {pillar.risk} RISK
              </div>
            </div>

            {/* Interpreter Notes */}
            <div className="p-[24px]">
              <p className="font-sans text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                {pillar.interpreterNotes}
              </p>
            </div>

            {/* Raw Data Accordion */}
            <div className="border-t border-[var(--color-border)] bg-gray-50/50">
              <button 
                onClick={() => togglePillar(pillar.name)}
                className="w-full px-[24px] py-[16px] flex items-center justify-between text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <span>View Raw Lab Data</span>
                {expandedPillar === pillar.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {expandedPillar === pillar.name && (
                <div className="px-[24px] pb-[24px] pt-[8px] animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-3">
                    {pillar.labData.map((data, i) => (
                      <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${data.isOutlier ? 'bg-[#FEF2F2] border-[#DC2626]/20' : 'bg-white border-[var(--color-border)]'}`}>
                        <div>
                          <div className="font-medium text-[14px] text-[var(--color-text-primary)]">{data.name}</div>
                          <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Normal: {data.normalRange} {data.unit}</div>
                        </div>
                        <div className={`text-right font-bold text-[16px] ${data.isOutlier ? 'text-[#DC2626]' : 'text-[var(--color-text-primary)]'}`}>
                          {data.value} <span className="text-[12px] font-medium opacity-60 ml-1">{data.unit}</span>
                          {data.isOutlier && <div className="text-[10px] uppercase tracking-wider text-[#DC2626] mt-1">Out of Range</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CALL TO ACTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mt-[48px] p-[32px] bg-[var(--color-forest)] rounded-[var(--radius-xl)] text-white text-center flex flex-col items-center">
        <h3 className="font-serif text-[28px] font-semibold mb-2">Continue Your Journey</h3>
        <p className="font-sans text-[16px] text-white/80 mb-6 max-w-[400px]">
          Based on your results, taking proactive steps now can significantly improve your long-term health.
        </p>
        <Link to="/client/bookings/new">
          <Button variant="outline" className="h-[52px] px-[32px] text-[16px] bg-white text-[var(--color-forest)] hover:bg-white/90 border-transparent">
            Book Follow-up Screening
          </Button>
        </Link>
      </div>

    </div>
  )
}
