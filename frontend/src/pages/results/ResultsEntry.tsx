import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowLeft, FileText, UploadCloud, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TEST_PARAMETERS, SCREENING_PACKAGES } from "@/lib/constants"

export function ResultsEntry() {
  const navigate = useNavigate()
  const { referralCode } = useParams<{ referralCode: string }>()
  
  // Since we don't have a real backend mapping referralCode -> package yet,
  // we'll mock the data based on the route param or default to Complete Wellness.
  const code = referralCode || "CRV-2025-A7K3P2"
  
  const mockClient = {
    name: "Kwame Mensah",
    packageId: "pkg-4", // Complete Wellness
    dob: "1985-04-12",
    gender: "Male"
  }

  const selectedPackage = SCREENING_PACKAGES.find(p => p.id === mockClient.packageId)
  
  // Initialize form data based on required pillars for the package
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleInputChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // API call would go here
      toast.success("Results submitted for interpretation!")
      navigate('/lab/dashboard')
    } catch (error) {
      toast.error("Failed to submit results")
    }
  }

  if (!selectedPackage) return <div>Loading...</div>

  // Group parameters by pillar based on what the package covers
  const packagePillars = selectedPackage.pillar

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1000px] mx-auto pb-[96px]">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0">
          <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Button>
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Enter Results for {code}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">Client:</span> {mockClient.name}
            <span className="text-[var(--color-border)] px-2">|</span>
            <span className="font-medium text-[var(--color-text-primary)]">Package:</span> {selectedPackage.name}
          </div>
        </div>
      </div>

      <div className="grid gap-[32px] md:grid-cols-[1fr_320px]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LEFT COLUMN: FORM ENTRY
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="space-y-[32px]">
          
          <div className="bg-[#EFF6FF] border border-[#0F76E0]/20 rounded-[var(--radius-lg)] p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-[#0F76E0] shrink-0 mt-0.5" />
            <p className="text-[14px] text-[#0F76E0] font-medium leading-snug">
              Please enter the raw values from your laboratory equipment. CareVo's clinical interpreters will automatically calculate the risk levels based on these inputs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[48px]">
            
            {/* Render form sections per pillar */}
            {packagePillars.map((pillar) => {
              // @ts-ignore
              const parameters = TEST_PARAMETERS[pillar]
              if (!parameters) return null

              return (
                <div key={pillar} className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
                  <div className="px-[24px] py-[16px] bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                    <h2 className="font-sans text-[16px] font-bold text-[var(--color-forest)] uppercase tracking-wider">
                      {pillar} Panel
                    </h2>
                  </div>
                  <div className="p-[24px] grid gap-[24px] sm:grid-cols-2">
                    {parameters.map((param: any) => (
                      <div key={param.id} className="space-y-1.5">
                        <Label htmlFor={param.id} className="text-[14px] font-medium text-[var(--color-text-primary)]">
                          {param.name}
                        </Label>
                        <div className="relative">
                          <Input 
                            id={param.id} 
                            type="number" 
                            step="any"
                            className="pr-[64px] h-[48px] text-[16px]"
                            value={formData[param.id] || ""}
                            onChange={(e) => handleInputChange(param.id, e.target.value)}
                          />
                          <div className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-[var(--color-text-muted)] font-medium bg-transparent pointer-events-none">
                            {param.unit}
                          </div>
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] mt-1 ml-1">
                          Normal Range: {param.normalRange} {param.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
              <Button type="submit" className="h-[52px] px-[32px] text-[16px] gap-2 shadow-md">
                <FileText className="h-5 w-5" />
                Submit Results for Interpretation
              </Button>
            </div>
          </form>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RIGHT COLUMN: UPLOAD / NOTES
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="space-y-[24px]">
          
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[24px] shadow-sm">
            <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] mb-4">Original PDF Report</h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-4">
              Upload the original machine output or signed laboratory PDF for the interpreter's reference.
            </p>
            <div className="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 text-center hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
              <UploadCloud className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
              <div className="text-[14px] font-medium text-[var(--color-forest)]">Click to upload</div>
              <div className="text-[12px] text-[var(--color-text-muted)] mt-1">PDF or Image up to 5MB</div>
            </div>
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[24px] shadow-sm">
            <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] mb-4">Lab Notes (Optional)</h3>
            <textarea 
              className="w-full h-[120px] rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-[14px] resize-none focus:border-[var(--color-forest)] focus:outline-none"
              placeholder="Add any technical notes or observations for the interpreter..."
            ></textarea>
          </div>

        </div>

      </div>
    </div>
  )
}
