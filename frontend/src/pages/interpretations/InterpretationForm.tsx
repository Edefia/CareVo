import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, CheckCircle, Heart, Droplets, Activity, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InterpretationForm() {
  const navigate = useNavigate()
  const { referralCode } = useParams<{ referralCode: string }>()
  
  // Mocking data based on route
  const code = referralCode || "CRV-2025-A7K3P2"
  
  const mockResult = {
    clientName: "Kwame Mensah",
    package: "Complete Wellness",
    pillars: ["CARDIO", "RENAL", "METABOLIC"],
    labData: {
      CARDIO: [
        { name: "Systolic Blood Pressure", value: "135", unit: "mmHg", normalRange: "< 120", isOutlier: true },
        { name: "Diastolic Blood Pressure", value: "88", unit: "mmHg", normalRange: "< 80", isOutlier: true },
        { name: "Total Cholesterol", value: "4.8", unit: "mmol/L", normalRange: "< 5.0", isOutlier: false }
      ],
      RENAL: [
        { name: "Creatinine", value: "85", unit: "μmol/L", normalRange: "60 - 110", isOutlier: false },
        { name: "eGFR", value: "95", unit: "mL/min/1.73m²", normalRange: "> 90", isOutlier: false }
      ],
      METABOLIC: [
        { name: "Fasting Blood Glucose", value: "5.1", unit: "mmol/L", normalRange: "3.9 - 5.5", isOutlier: false },
        { name: "HbA1c", value: "5.4", unit: "%", normalRange: "< 5.7", isOutlier: false },
        { name: "Body Mass Index", value: "28.5", unit: "kg/m²", normalRange: "18.5 - 24.9", isOutlier: true }
      ]
    }
  }

  const [formData, setFormData] = useState({
    CARDIO: { risk: "", notes: "" },
    RENAL: { risk: "", notes: "" },
    METABOLIC: { risk: "", notes: "" },
    followUp: ""
  })

  const handlePillarChange = (pillar: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [pillar]: { ...prev[pillar as keyof typeof prev], [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // API Call
      toast.success("Interpretation published successfully!")
      navigate('/interpreter/dashboard')
    } catch (e) {
      toast.error("Failed to publish interpretation")
    }
  }

  const renderPillarIcon = (pillar: string) => {
    switch(pillar) {
      case 'CARDIO': return <div className="h-8 w-8 rounded-full bg-[#DC2626]/10 flex items-center justify-center"><Heart className="h-4 w-4 text-[#DC2626]" /></div>
      case 'RENAL': return <div className="h-8 w-8 rounded-full bg-[#0F76E0]/10 flex items-center justify-center"><Droplets className="h-4 w-4 text-[#0F76E0]" /></div>
      case 'METABOLIC': return <div className="h-8 w-8 rounded-full bg-[#D97706]/10 flex items-center justify-center"><Activity className="h-4 w-4 text-[#D97706]" /></div>
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto pb-[96px]">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0">
          <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Button>
        <div className="flex-1">
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Clinical Interpretation
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">Referral Code:</span> <span className="font-mono text-[var(--color-forest)]">{code}</span>
            <span className="text-[var(--color-border)] px-2">|</span>
            <span className="font-medium text-[var(--color-text-primary)]">Package:</span> {mockResult.package}
          </div>
        </div>
      </div>

      <div className="grid gap-[32px] lg:grid-cols-[1fr_1.2fr]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LEFT COLUMN: READ-ONLY LAB DATA
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="space-y-[24px]">
          <h2 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)]">Raw Laboratory Results</h2>
          
          {mockResult.pillars.map((pillar) => {
            // @ts-ignore
            const items = mockResult.labData[pillar]
            if (!items) return null

            return (
              <div key={pillar} className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm overflow-hidden mb-6">
                <div className="px-[20px] py-[16px] bg-[var(--color-surface-2)] border-b border-[var(--color-border)] flex items-center gap-3">
                  {renderPillarIcon(pillar)}
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{pillar}</h3>
                </div>
                <div className="p-[20px] flex flex-col gap-4">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-[15px] text-[var(--color-text-primary)]">{item.name}</div>
                        <div className="text-[12px] text-[var(--color-text-muted)] mt-1">Normal: {item.normalRange} {item.unit}</div>
                      </div>
                      <div className={`text-right px-3 py-1.5 rounded-lg border ${item.isOutlier ? 'bg-[#FEF2F2] border-[#DC2626]/20' : 'bg-[#F0FDF4] border-[#16A34A]/20'}`}>
                        <div className={`font-bold text-[18px] leading-none ${item.isOutlier ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                          {item.value} <span className="text-[12px] font-medium opacity-70">{item.unit}</span>
                        </div>
                        {item.isOutlier && (
                          <div className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider mt-1 flex items-center justify-end gap-1">
                            <AlertCircle className="h-3 w-3" /> Out of Range
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RIGHT COLUMN: INTERPRETER INPUT
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="space-y-[24px]">
          <h2 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)]">Clinical Assessment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-[24px]">
            {mockResult.pillars.map((pillar) => (
              <div key={pillar} className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm p-[24px]">
                <div className="flex items-center gap-3 mb-6">
                  {renderPillarIcon(pillar)}
                  <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{pillar} Assessment</h3>
                </div>

                <div className="space-y-[20px]">
                  <div>
                    <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                      Risk Classification <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      // @ts-ignore
                      value={formData[pillar].risk} 
                      onValueChange={(val: string) => handlePillarChange(pillar, 'risk', val)}
                    >
                      <SelectTrigger className="w-[200px] h-[44px]">
                        <SelectValue placeholder="Select Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low Risk</SelectItem>
                        <SelectItem value="MODERATE">Moderate Risk</SelectItem>
                        <SelectItem value="HIGH">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                      Clinical Notes (Patient-Facing) <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      className="w-full h-[120px] rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-[14px] resize-none focus:border-[var(--color-forest)] focus:outline-none"
                      placeholder="Explain these results in plain English. Avoid medical jargon."
                      // @ts-ignore
                      value={formData[pillar].notes}
                      onChange={(e) => handlePillarChange(pillar, 'notes', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm p-[24px]">
              <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] mb-4">Overall Plan</h3>
              
              <div>
                <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                  Recommended Follow-up
                </label>
                <Input 
                  className="h-[48px] text-[15px]"
                  placeholder="e.g., See GP within 2 weeks, or Repeat fasting glucose in 3 months"
                  value={formData.followUp}
                  onChange={(e) => setFormData({...formData, followUp: e.target.value})}
                />
              </div>

              <div className="mt-[32px] pt-[24px] border-t border-[var(--color-border)] flex justify-end">
                <Button type="submit" className="h-[52px] px-[32px] text-[16px] gap-2 shadow-md font-semibold bg-[#16A34A] hover:bg-[#15803d]">
                  <FileText className="h-5 w-5" />
                  Publish Interpretation
                </Button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
