
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Calendar, AlertCircle, CheckCircle2, Info, FileText, ArrowRight, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResultDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  // Mock Data aligned with Image 3 Requirements
  const resultData = {
    id: id || "R-8842",
    package: "Comprehensive Wellness Screen",
    date: "Oct 12, 2025",
    overallRisk: "MODERATE",
    interpreterName: "Dr. Michael Chen",
    interpretationSummary: "Your overall profile is good, but there are a few areas of concern. Blood pressure and LDL cholesterol are slightly elevated. This increases your cardiovascular risk profile. Kidney and metabolic panels are within healthy limits.",
    recommendations: [
      "Adopt a heart-healthy diet low in saturated fats and sodium.",
      "Engage in at least 150 minutes of moderate-intensity aerobic exercise per week.",
      "Consider a follow-up appointment in 3 months to re-check lipid panel."
    ],
    tests: [
      { category: "Cardiovascular", name: "Systolic Blood Pressure", result: "135", unit: "mmHg", refRange: "< 120", risk: "HIGH", isOutlier: true },
      { category: "Cardiovascular", name: "Diastolic Blood Pressure", result: "88", unit: "mmHg", refRange: "< 80", risk: "MODERATE", isOutlier: true },
      { category: "Cardiovascular", name: "Total Cholesterol", result: "4.8", unit: "mmol/L", refRange: "< 5.0", risk: "LOW", isOutlier: false },
      { category: "Cardiovascular", name: "LDL Cholesterol", result: "3.2", unit: "mmol/L", refRange: "< 3.0", risk: "MODERATE", isOutlier: true },
      { category: "Renal", name: "Creatinine", result: "85", unit: "μmol/L", refRange: "60 - 110", risk: "LOW", isOutlier: false },
      { category: "Renal", name: "eGFR", result: "95", unit: "mL/min/1.73m²", refRange: "> 90", risk: "LOW", isOutlier: false },
      { category: "Metabolic", name: "Fasting Glucose", result: "5.1", unit: "mmol/L", refRange: "3.9 - 5.5", risk: "LOW", isOutlier: false },
      { category: "Metabolic", name: "HbA1c", result: "5.4", unit: "%", refRange: "< 5.7", risk: "LOW", isOutlier: false },
    ]
  }

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'LOW': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="h-5 w-5" /> }
      case 'MODERATE': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Info className="h-5 w-5" /> }
      case 'HIGH': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="h-5 w-5" /> }
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <Info className="h-5 w-5" /> }
    }
  }

  const overallRisk = getRiskStyles(resultData.overallRisk)

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1000px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/client/results')} className="mt-1 shrink-0 bg-white shadow-sm border border-slate-200">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Laboratory Results
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[14px] text-slate-500">
            <span className="font-medium text-slate-900 bg-white px-3 py-1 rounded-full border shadow-sm">{resultData.package}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {resultData.date}</span>
            <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Ref: {resultData.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        
        {/* LEFT COLUMN: Results Table & Interpretation */}
        <div className="space-y-8">
          
          {/* INTERPRETATION SUMMARY */}
          <div className="bg-white rounded-2xl p-6 border shadow-[var(--shadow-card)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-lime-light)] opacity-50 rounded-bl-[100px] -z-0"></div>
            <div className="relative z-10">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-[var(--color-forest)] mb-4">
                <Stethoscope className="h-5 w-5 text-[var(--color-lime-dark)]" /> 
                Interpretation Summary
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                "{resultData.interpretationSummary}"
              </p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                  {resultData.interpreterName.charAt(4)}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-900">{resultData.interpreterName}</span>
                  <span className="text-slate-500 block text-xs">Clinical Interpreter</span>
                </div>
              </div>
            </div>
          </div>

          {/* TEST RESULTS TABLE */}
          <div className="bg-white rounded-2xl border shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-serif text-lg font-semibold text-slate-900">Test Results Table</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b">
                    <th className="px-6 py-4">Biomarker</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4">Ref Range</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {resultData.tests.map((test, idx) => (
                    <tr key={idx} className={`border-b last:border-0 ${test.isOutlier ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{test.name}</div>
                        <div className="text-xs text-slate-500">{test.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-lg ${test.isOutlier ? 'text-red-600' : 'text-slate-900'}`}>
                          {test.result}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{test.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {test.refRange}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getRiskStyles(test.risk).bg} ${getRiskStyles(test.risk).color} ${getRiskStyles(test.risk).border}`}>
                          {test.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Risk Indicator & Recommendations & Follow-Up */}
        <div className="space-y-6">
          
          {/* OVERALL RISK INDICATOR */}
          <div className={`rounded-2xl p-6 border shadow-sm ${overallRisk.bg} ${overallRisk.border}`}>
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overall Risk Indicator</div>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-white shadow-sm ${overallRisk.color}`}>
                {overallRisk.icon}
              </div>
              <div>
                <div className={`font-serif text-3xl font-bold ${overallRisk.color}`}>
                  {resultData.overallRisk}
                </div>
              </div>
            </div>
          </div>

          {/* PERSONALIZED RECOMMENDATIONS */}
          <div className="bg-white rounded-2xl p-6 border shadow-[var(--shadow-card)]">
            <h3 className="font-serif text-lg font-semibold text-[var(--color-forest)] mb-4">
              Personalized Recommendations
            </h3>
            <ul className="space-y-3">
              {resultData.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-[var(--color-lime)] text-[var(--color-forest)] flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* FOLLOW-UP ACTION BUTTON */}
          <div className="bg-[var(--color-forest)] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/10 group-hover:to-white/20 transition-all"></div>
            <h3 className="font-serif text-xl font-semibold mb-2 relative z-10">Next Steps Required</h3>
            <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">
              Based on your moderate risk indicators, it is highly recommended to schedule a follow-up consultation.
            </p>
            <Link to={`/client/journey`} className="relative z-10 block">
              <Button className="w-full h-12 bg-[var(--color-lime)] text-[var(--color-forest)] hover:bg-[var(--color-lime-dark)] font-bold shadow-lg shadow-[var(--color-lime)]/20 animate-pulse transition-all">
                Plan Follow-Up Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
