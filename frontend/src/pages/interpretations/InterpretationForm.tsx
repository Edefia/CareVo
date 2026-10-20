import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, Heart, Droplets, Activity, AlertCircle, XCircle, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useResultsStore } from "@/store/results"
import { followUpService } from "@/api/services/followUps"
import { apiClient } from "@/api/client"

export function InterpretationForm() {
  const navigate = useNavigate()
  const { referralCode } = useParams<{ referralCode: string }>()
  const { pendingInterpretations, publishInterpretation } = useResultsStore()
  
  const result = pendingInterpretations.find(p => p.referralCode === referralCode)

  const [formData, setFormData] = useState<Record<string, { risk: string, notes: string }>>({})
  const [followUp, setFollowUp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── Follow-Up Creation State ─────────────────────────────────────────────
  const [createFollowUp, setCreateFollowUp] = useState(false)
  const [followUpType, setFollowUpType] = useState<"FURTHER_TESTING" | "MEDICATION_REFERRAL" | "CLINICIAN_APPOINTMENT" | "FACILITY_TRANSFER">("CLINICIAN_APPOINTMENT")
  const [followUpUrgency, setFollowUpUrgency] = useState<"ROUTINE" | "URGENT" | "EMERGENCY">("ROUTINE")
  const [followUpFacility, setFollowUpFacility] = useState("")
  const [followUpNotes, setFollowUpNotes] = useState("")

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Result Not Found</h2>
        <p className="text-gray-500 mt-2">The referral code {referralCode} does not have pending results.</p>
        <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
      </div>
    )
  }

  const handlePillarChange = (pillar: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [pillar]: { ...(prev[pillar] || { risk: "", notes: "" }), [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (createFollowUp && !followUpNotes.trim()) {
      toast.error("Please provide instructions in the Notes for Client field.")
      return
    }

    setIsSubmitting(true)
    try {
      if (createFollowUp) {
        let clientId = (result as any).clientId
        let resultId = (result as any).resultId || (result as any)._id || result.id
        const interpretationId = (result as any).interpretationId || (result as any)._id || result.id

        if (!clientId) {
          try {
            const res = await apiClient.get('/results', { params: { search: result.referralCode } })
            const found = res.data?.data?.items?.[0] || res.data?.items?.[0] || res.data?.[0]
            if (found) {
              resultId = found._id || found.id
              clientId = found.patientId?.userId?._id || found.patientId?.userId || found.patientId?._id || found.patientId
            }
          } catch (e) {
            console.warn('Could not look up backend result by referralCode', e)
          }
        }

        if (clientId && resultId) {
          await followUpService.createFollowUp({
            clientId: String(clientId),
            resultId: String(resultId),
            interpretationId: String(interpretationId || resultId),
            type: followUpType,
            urgency: followUpUrgency,
            facility: followUpFacility.trim() || null,
            notes: followUpNotes.trim(),
          })
          toast.success("Follow-up care recommendation created.")
        }
      }

      publishInterpretation(result.referralCode, { assessments: formData, followUp })
      toast.success("Interpretation published successfully!")
      navigate('/interpreter/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Failed to publish interpretation")
    } finally {
      setIsSubmitting(false)
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
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto pb-[96px] animate-fade-in-up">
      
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Button>
        <div className="flex-1">
          <h1 className="font-serif text-[32px] md:text-[40px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Clinical Interpretation
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">Referral Code:</span> <span className="font-mono text-[var(--color-forest)] bg-[var(--color-lime)]/20 px-2 py-0.5 rounded">{result.referralCode}</span>
            <span className="text-[var(--color-border)] px-2">|</span>
            <span className="font-medium text-[var(--color-text-primary)]">Patient:</span> {result.clientName}
            <span className="text-[var(--color-border)] px-2">|</span>
            <span className="font-medium text-[var(--color-text-primary)]">Package:</span> {result.package}
          </div>
        </div>
      </div>

      <div className="grid gap-[32px] lg:grid-cols-[1fr_1.2fr]">
        
        {/* LEFT COLUMN: READ-ONLY LAB DATA */}
        <div className="space-y-[24px]">
          <h2 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Raw Laboratory Results</h2>
          
          {result.pillars.map((pillar) => {
            const items = result.labData[pillar]
            if (!items) return null

            const hasOutliers = items.some(i => i.isOutlier)

            return (
              <div key={pillar} className={`bg-white rounded-[var(--radius-xl)] border shadow-sm overflow-hidden mb-6 transition-all duration-300 ${hasOutliers ? 'border-red-200' : 'border-[var(--color-border)]'}`}>
                <div className={`px-[20px] py-[16px] border-b flex items-center justify-between ${hasOutliers ? 'bg-red-50/50 border-red-100' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'}`}>
                  <div className="flex items-center gap-3">
                    {renderPillarIcon(pillar)}
                    <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{pillar}</h3>
                  </div>
                  {hasOutliers && (
                    <div className="text-[12px] font-bold text-red-600 uppercase flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full animate-pulse-glow">
                      <AlertCircle className="w-3 h-3" /> Attention Required
                    </div>
                  )}
                </div>
                <div className="p-[20px] flex flex-col gap-4">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-[15px] text-[var(--color-text-primary)]">{item.name}</div>
                        <div className="text-[12px] text-[var(--color-text-muted)] mt-1">Normal: {item.normalRange} {item.unit}</div>
                      </div>
                      <div className={`text-right px-4 py-2 rounded-lg border transition-all ${item.isOutlier ? 'bg-[#FEF2F2] border-[#DC2626]/30 shadow-sm relative' : 'bg-[#F0FDF4] border-[#16A34A]/20'}`}>
                        <div className={`font-bold text-[20px] leading-none ${item.isOutlier ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                          {item.value} <span className="text-[12px] font-medium opacity-70 ml-1">{item.unit}</span>
                        </div>
                        {item.isOutlier && (
                          <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 shadow-md">
                             <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        {item.isOutlier && (
                          <div className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider mt-1.5 flex items-center justify-end gap-1">
                            Out of Range
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {result.labNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[var(--radius-lg)] p-4">
              <h4 className="text-sm font-bold text-yellow-800 mb-1">Lab Notes:</h4>
              <p className="text-sm text-yellow-900">{result.labNotes}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERPRETER INPUT */}
        <div className="space-y-[24px]">
          <h2 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Clinical Assessment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-[24px]">
            {result.pillars.map((pillar) => {
              const currentRisk = formData[pillar]?.risk || ""

              return (
                <div key={pillar} className="glass-panel rounded-[var(--radius-xl)] shadow-sm p-[24px] transition-all hover:shadow-[var(--shadow-card-hover)] relative overflow-hidden">
                   {/* Risk background hint */}
                  {currentRisk === "HIGH" && <div className="absolute inset-0 bg-red-50 opacity-50 pointer-events-none"></div>}
                  {currentRisk === "LOW" && <div className="absolute inset-0 bg-green-50 opacity-50 pointer-events-none"></div>}
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    {renderPillarIcon(pillar)}
                    <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{pillar} Assessment</h3>
                  </div>

                  <div className="space-y-[20px] relative z-10">
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                        Risk Classification <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={currentRisk} 
                        onValueChange={(val: string) => handlePillarChange(pillar, 'risk', val)}
                        required
                      >
                        <SelectTrigger className={`w-full sm:w-[240px] h-[48px] font-medium transition-colors ${currentRisk === 'HIGH' ? 'bg-red-50 border-red-200 text-red-700' : currentRisk === 'MODERATE' ? 'bg-orange-50 border-orange-200 text-orange-700' : currentRisk === 'LOW' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white'}`}>
                          <SelectValue placeholder="Select Risk Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW" className="font-medium text-green-700">Low Risk</SelectItem>
                          <SelectItem value="MODERATE" className="font-medium text-orange-700">Moderate Risk</SelectItem>
                          <SelectItem value="HIGH" className="font-medium text-red-700">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                        Clinical Notes (Patient-Facing) <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        required
                        className="w-full h-[140px] rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-[14px] resize-none focus:border-[var(--color-forest)] focus:ring-1 focus:ring-[var(--color-forest)] transition-all outline-none bg-white/80 focus:bg-white leading-relaxed"
                        placeholder="Explain these results in plain English. Avoid medical jargon. Provide actionable lifestyle advice if applicable."
                        value={formData[pillar]?.notes || ""}
                        onChange={(e) => handlePillarChange(pillar, 'notes', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="glass-panel rounded-[var(--radius-xl)] shadow-sm p-[24px]">
              <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] mb-4">Overall Plan</h3>
              
              <div>
                <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                  Recommended Follow-up
                </label>
                <Input 
                  className="h-[52px] text-[15px] bg-white/80 focus:bg-white"
                  placeholder="e.g., See GP within 2 weeks, or Repeat fasting glucose in 3 months"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              </div>
            </div>

            {/* ── CREATE FOLLOW-UP TOGGLE CARD ── */}
            <div className={`rounded-[var(--radius-xl)] border p-[24px] transition-all ${createFollowUp ? 'bg-amber-50/40 border-amber-300 shadow-sm' : 'glass-panel border-[var(--color-border)] shadow-sm'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${createFollowUp ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)]">
                      Create Follow-Up
                    </h3>
                    <p className="text-[13px] text-[var(--color-text-secondary)]">
                      Refer this client for further care, tests, or clinician appointment.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                  <input
                    type="checkbox"
                    checked={createFollowUp}
                    onChange={(e) => setCreateFollowUp(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-lime)]"></div>
                </label>
              </div>

              {createFollowUp && (
                <div className="mt-6 pt-6 border-t border-amber-200/60 space-y-5 animate-fade-in-up">
                  {/* Follow-Up Type */}
                  <div>
                    <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                      Follow-Up Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={followUpType}
                      onValueChange={(val: any) => setFollowUpType(val)}
                    >
                      <SelectTrigger className="w-full h-[48px] bg-white font-medium">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FURTHER_TESTING">Further Testing</SelectItem>
                        <SelectItem value="MEDICATION_REFERRAL">Medication Referral</SelectItem>
                        <SelectItem value="CLINICIAN_APPOINTMENT">Clinician Appointment</SelectItem>
                        <SelectItem value="FACILITY_TRANSFER">Facility Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Urgency Radio */}
                  <div>
                    <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-2">
                      Urgency <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'ROUTINE', label: 'Routine', color: 'text-green-700 border-green-300 bg-green-50' },
                        { value: 'URGENT', label: 'Urgent', color: 'text-amber-700 border-amber-300 bg-amber-50' },
                        { value: 'EMERGENCY', label: 'Emergency', color: 'text-red-700 border-red-300 bg-red-50' },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer font-medium text-sm transition-all ${
                            followUpUrgency === item.value
                              ? `${item.color} font-bold ring-2 ring-offset-1 ring-current`
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="followUpUrgency"
                            value={item.value}
                            checked={followUpUrgency === item.value}
                            onChange={() => setFollowUpUrgency(item.value as any)}
                            className="sr-only"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Facility / Clinician */}
                  <div>
                    <label className="block text-[14px] font-bold text-[var(--color-text-primary)] mb-1">
                      Recommended Facility / Clinician <span className="text-xs font-normal text-gray-500">(Optional)</span>
                    </label>
                    <Input
                      className="h-[48px] bg-white"
                      placeholder="e.g. Korle-Bu Teaching Hospital, Dr. Ama Owusu"
                      value={followUpFacility}
                      onChange={(e) => setFollowUpFacility(e.target.value)}
                    />
                  </div>

                  {/* Notes for Client */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[14px] font-bold text-[var(--color-text-primary)]">
                        Notes for Client <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs ${followUpNotes.length > 750 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                        {followUpNotes.length}/800
                      </span>
                    </div>
                    <textarea
                      required={createFollowUp}
                      maxLength={800}
                      rows={4}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-[14px] resize-none focus:border-[var(--color-forest)] focus:ring-1 focus:ring-[var(--color-forest)] outline-none bg-white leading-relaxed"
                      placeholder="Explain what the client needs to do and why..."
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-[16px] flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[56px] px-[40px] text-[16px] gap-2 shadow-lg font-semibold bg-[#16A34A] hover:bg-[#15803d] transition-all hover:scale-[1.02] active:scale-95"
              >
                <CheckCircle className="h-5 w-5" />
                {isSubmitting ? "Publishing..." : "Submit Interpretation"}
              </Button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
