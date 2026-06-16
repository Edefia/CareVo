import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowLeft, FileText, UploadCloud, Info, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TEST_PARAMETERS } from "@/lib/constants"
import { useResultsStore } from "@/store/results"

export function ResultsEntry() {
  const navigate = useNavigate()
  const { referralCode } = useParams<{ referralCode: string }>()
  const { assignedClients, submitLabResult } = useResultsStore()
  
  const client = assignedClients.find(c => c.referralCode === referralCode)
  
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [labNotes, setLabNotes] = useState("")
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Client Not Found</h2>
        <p className="text-gray-500 mt-2">The referral code {referralCode} does not exist in your queue.</p>
        <Button onClick={() => navigate(-1)} className="mt-6">Go Back</Button>
      </div>
    )
  }

  const handleInputChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert flat formData to structured labData by pillar
    const labData: Record<string, any[]> = {}
    const packagePillars = client.package === "Complete Wellness" ? ["CARDIO", "RENAL", "METABOLIC"] : [client.pillar]
    
    packagePillars.forEach(pillar => {
      // @ts-expect-error test parameters
      const parameters = TEST_PARAMETERS[pillar]
      if (parameters) {
        labData[pillar] = parameters.map((param: any) => {
          const valStr = formData[param.id] || "0"
          const valNum = parseFloat(valStr)
          
          // Basic Outlier checking based on string parsing
          let isOutlier = false
          if (param.normalRange.includes('<')) {
            const max = parseFloat(param.normalRange.replace('<', '').trim())
            isOutlier = valNum >= max
          } else if (param.normalRange.includes('>')) {
            const min = parseFloat(param.normalRange.replace('>', '').trim())
            isOutlier = valNum <= min
          } else if (param.normalRange.includes('-')) {
            const [min, max] = param.normalRange.split('-').map((n: string) => parseFloat(n.trim()))
            isOutlier = valNum < min || valNum > max
          }

          return {
            name: param.name,
            value: valStr,
            unit: param.unit,
            normalRange: param.normalRange,
            isOutlier
          }
        })
      }
    })

    try {
      submitLabResult(client.referralCode, labData, labNotes)
      toast.success("Results submitted for interpretation!")
      navigate('/lab/dashboard')
    } catch {
      toast.error("Failed to submit results")
    }
  }

  // Handle Drag and Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const packagePillars = client.package === "Complete Wellness" ? ["CARDIO", "RENAL", "METABOLIC"] : [client.pillar]

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1000px] mx-auto pb-[96px] animate-fade-in-up">
      
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 shrink-0 hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Button>
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Enter Results for {client.referralCode}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">Client:</span> {client.clientName}
            <span className="text-[var(--color-border)] px-2">|</span>
            <span className="font-medium text-[var(--color-text-primary)]">Package:</span> {client.package}
          </div>
        </div>
      </div>

      <div className="grid gap-[32px] md:grid-cols-[1fr_320px]">
        
        {/* LEFT COLUMN: FORM ENTRY */}
        <div className="space-y-[32px]">
          
          <div className="bg-[#EFF6FF] border border-[#0F76E0]/20 rounded-[var(--radius-lg)] p-5 flex items-start gap-3 shadow-sm">
            <Info className="h-5 w-5 text-[#0F76E0] shrink-0 mt-0.5" />
            <p className="text-[14px] text-[#0F76E0] font-medium leading-snug">
              Please enter the exact raw values from your laboratory equipment. CareVo's clinical interpreters will automatically calculate the risk levels based on these inputs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[48px]">
            {packagePillars.map((pillar) => {
              // @ts-expect-error test parameters
              const parameters = TEST_PARAMETERS[pillar]
              if (!parameters) return null

              return (
                <div key={pillar} className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="px-[24px] py-[16px] bg-gradient-to-r from-[var(--color-surface-2)] to-white border-b border-[var(--color-border)]">
                    <h2 className="font-sans text-[16px] font-bold text-[var(--color-forest)] uppercase tracking-wider">
                      {pillar} Panel
                    </h2>
                  </div>
                  <div className="p-[24px] grid gap-[24px] sm:grid-cols-2 bg-white">
                    {parameters.map((param: any) => {
                      const value = formData[param.id] || ""
                      const isFilled = value !== ""

                      return (
                        <div key={param.id} className="space-y-1.5 group">
                          <Label htmlFor={param.id} className="text-[14px] font-medium text-[var(--color-text-primary)] transition-colors group-focus-within:text-[var(--color-forest)]">
                            {param.name}
                          </Label>
                          <div className="relative">
                            <Input 
                              id={param.id} 
                              type="number" 
                              step="any"
                              required
                              className={`pr-[72px] h-[48px] text-[16px] font-medium transition-all ${isFilled ? 'border-[var(--color-forest)] bg-[#F0FDF4]/50' : 'bg-gray-50 focus:bg-white'}`}
                              value={value}
                              onChange={(e) => handleInputChange(param.id, e.target.value)}
                            />
                            <div className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-muted)] font-medium bg-transparent pointer-events-none px-1 rounded">
                              {param.unit}
                            </div>
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)] mt-1 ml-1 font-medium">
                            Normal Range: <span className="text-[var(--color-text-secondary)]">{param.normalRange} {param.unit}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
              <Button type="submit" className="h-[52px] px-[32px] text-[16px] gap-2 shadow-md bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] transition-all">
                <FileText className="h-5 w-5" />
                Submit Results for Interpretation
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: UPLOAD / NOTES */}
        <div className="space-y-[24px]">
          
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[24px] shadow-sm">
            <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] mb-4">Original PDF Report</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
              Upload the original machine output or signed laboratory PDF for the interpreter's reference.
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,image/*"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />

            <div 
              className={`border-2 border-dashed rounded-[var(--radius-lg)] p-6 text-center transition-all cursor-pointer relative overflow-hidden group
                ${isDragging ? 'border-[var(--color-forest)] bg-[#F0FDF4]' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-2)]'}
                ${file ? 'border-[#16A34A] bg-[#F0FDF4]' : ''}
              `}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center animate-fade-in-up">
                  <CheckCircle className="h-10 w-10 text-[#16A34A] mb-2" />
                  <div className="text-[14px] font-medium text-[var(--color-text-primary)] truncate max-w-full px-2">{file.name}</div>
                  <div className="text-[12px] text-[#16A34A] mt-1 font-medium">Ready for submission</div>
                </div>
              ) : (
                <>
                  <UploadCloud className={`h-8 w-8 mx-auto mb-2 transition-colors ${isDragging ? 'text-[var(--color-forest)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-forest)]'}`} />
                  <div className="text-[14px] font-medium text-[var(--color-forest)]">Click or drag file to upload</div>
                  <div className="text-[12px] text-[var(--color-text-muted)] mt-1">PDF or Image up to 5MB</div>
                </>
              )}
            </div>
            {file && (
              <Button variant="ghost" size="sm" className="w-full mt-3 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setFile(null)}>
                Remove File
              </Button>
            )}
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[24px] shadow-sm">
            <h3 className="font-sans text-[16px] font-bold text-[var(--color-text-primary)] mb-4">Lab Notes (Optional)</h3>
            <textarea 
              className="w-full h-[120px] rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-[14px] resize-none focus:border-[var(--color-forest)] focus:ring-1 focus:ring-[var(--color-forest)] transition-all outline-none bg-gray-50 focus:bg-white"
              placeholder="Add any technical notes or observations for the interpreter..."
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
            ></textarea>
          </div>

        </div>

      </div>
    </div>
  )
}
