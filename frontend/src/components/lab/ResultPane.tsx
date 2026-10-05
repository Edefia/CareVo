import * as React from "react"
import { useBookings } from "@/hooks/useBookings"
import { useResults, useCreateResult, useUpdateResult, useSubmitForApproval } from "@/hooks/useResults"
import { TEST_PARAMETERS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, FileText, Send, Clock, User, Activity } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface ResultPaneProps {
  referralCode: string;
}

export function ResultPane({ referralCode }: ResultPaneProps) {
  // 1. Fetch the selected booking
  const { data: bookingsData } = useBookings()
  const bookings = bookingsData?.items || bookingsData || []
  const booking = bookings.find((b: any) => b.referralCode === referralCode)

  // 2. Fetch results to see if one exists for this booking
  const { data: resultsData } = useResults({ bookingId: booking?._id || booking?.id })
  const results = resultsData?.items || resultsData || []
  const resultRecord = results[0] // Assuming one result per booking

  const createResultMutation = useCreateResult()
  const updateResultMutation = useUpdateResult()
  const submitForApprovalMutation = useSubmitForApproval()

  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [labFindings, setLabFindings] = React.useState("")

  // Load existing values into form when resultRecord is loaded
  React.useEffect(() => {
    if (resultRecord && resultRecord.biomarkers) {
      const newForm: Record<string, string> = {}
      resultRecord.biomarkers.forEach((b: any) => {
        newForm[b.name] = b.value
      })
      setFormData(newForm)
      setLabFindings(resultRecord.laboratoryFindings || "")
    }
  }, [resultRecord])

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
        Booking not found for {referralCode}
      </div>
    )
  }

  const patient = booking.patientId?.userId
  const name = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Client"
  const mrn = booking.patientId?.mrn || "MRN-PENDING"

  const isCompleted = booking.status === 'COMPLETED' || resultRecord?.status === 'FINAL'
  const isPendingApproval = resultRecord?.testStatus === 'COMPLETE' && resultRecord?.status === 'PRELIMINARY'
  
  // Combine logic to find required parameters based on package
  // Real logic would look at booking.packageId.testsIncluded, but we mock with TEST_PARAMETERS
  const parameters = Object.values(TEST_PARAMETERS).filter((param: any) => {
    // If it's a specific package, we'd filter. For now, show all if package is 'Complete Wellness'
    if (booking.packageId?.name === 'Complete Wellness') return true;
    return param.pillar === booking.packageId?.pillar?.[0]; 
  })
  
  // Fallback: If no parameters match, just show all for demo
  const displayParams = parameters.length > 0 ? parameters : Object.values(TEST_PARAMETERS).slice(0, 5)

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveDraft = () => {
    if (isCompleted || isPendingApproval) return;
    
    const biomarkers = displayParams.map((param: any) => {
      const valStr = formData[param.id] || formData[param.name] || ""
      return {
        name: param.id || param.name,
        value: valStr,
        unit: param.unit,
        flag: valStr ? 'NORMAL' : 'PENDING' // simplified logic
      }
    }).filter(b => b.value !== "")

    if (resultRecord) {
      updateResultMutation.mutate({
        id: resultRecord._id || resultRecord.id,
        biomarkers,
        laboratoryFindings: labFindings
      }, {
        onSuccess: () => toast.success("Draft saved successfully")
      })
    } else {
      createResultMutation.mutate({
        bookingId: booking._id || booking.id,
        patientId: booking.patientId?._id || booking.patientId,
        biomarkers,
        laboratoryFindings: labFindings
      }, {
        onSuccess: () => toast.success("Draft created successfully")
      })
    }
  }

  const handleSubmitForApproval = () => {
    if (!resultRecord) {
      toast.error("Please save a draft first")
      return;
    }
    // Verify all fields filled
    const allFilled = displayParams.every((param: any) => {
      const val = formData[param.id] || formData[param.name]
      return val && val.trim() !== ""
    })
    
    if (!allFilled) {
      toast.error("Please enter all results before submitting for approval")
      return;
    }

    submitForApprovalMutation.mutate({
      id: resultRecord._id || resultRecord.id,
      notes: "Submitted for clinical interpretation"
    }, {
      onSuccess: () => toast.success("Submitted for approval")
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Top Action Bar */}
      <div className="shrink-0 h-[64px] bg-white border-b border-[var(--color-lims-border)] px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden -ml-2 text-[var(--color-lims-text-muted)] hover:bg-[var(--color-lims-bg)]"
            onClick={() => window.history.back()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-lims-text)] font-sans leading-tight">
              {name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-[var(--color-lims-text-muted)] font-medium">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {mrn}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-lims-border)]" />
              <span className="font-mono bg-[var(--color-lims-bg)] px-1.5 rounded">{referralCode}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCompleted ? (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 text-green-700 font-semibold text-sm border border-green-200">
               <CheckCircle className="w-4 h-4" /> Result Finalized
             </div>
          ) : isPendingApproval ? (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-sm border border-amber-200">
               <Clock className="w-4 h-4" /> Pending Approval
             </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={updateResultMutation.isPending || createResultMutation.isPending}
                className="h-9 px-4 font-semibold text-[var(--color-lims-text)] border-[var(--color-lims-border)] hover:bg-[var(--color-lims-bg)] shadow-sm"
              >
                Save Draft
              </Button>
              <Button 
                onClick={handleSubmitForApproval}
                disabled={submitForApprovalMutation.isPending}
                className="h-9 px-4 font-semibold bg-[var(--color-lims-accent)] hover:bg-[var(--color-lims-accent-hover)] text-white shadow-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit for Approval
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-[1000px] mx-auto space-y-6">
          
          {/* Status Banner */}
          {resultRecord?.placementId && (
            <div className="bg-white border border-[var(--color-lims-border)] p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-lims-bg)] flex items-center justify-center border border-[var(--color-lims-border)]">
                  <Activity className="w-5 h-5 text-[var(--color-lims-accent)]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-0.5">Placement ID</div>
                  <div className="font-mono font-bold text-lg text-[var(--color-lims-text)]">{resultRecord.placementId}</div>
                </div>
              </div>
              
              <div className="text-right">
                 <div className="text-sm font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-0.5">Collection Date</div>
                 <div className="font-medium text-[var(--color-lims-text)]">
                   {new Date(resultRecord.collectionDate || booking.scheduledAt).toLocaleString()}
                 </div>
              </div>
            </div>
          )}

          {/* Biomarker Grid */}
          <div className="bg-white border border-[var(--color-lims-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-lims-border)] bg-[var(--color-lims-bg)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--color-lims-text)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-lims-accent)]" />
                Test Parameters
              </h3>
              <span className="text-xs font-semibold bg-white border border-[var(--color-lims-border)] px-2 py-1 rounded text-[var(--color-lims-text-muted)]">
                {Object.keys(formData).filter(k => formData[k]).length} / {displayParams.length} Completed
              </span>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-lims-border)] bg-gray-50/50">
                    <th className="px-5 py-3 text-xs font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider w-1/3">Parameter</th>
                    <th className="px-5 py-3 text-xs font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Result Value</th>
                    <th className="px-5 py-3 text-xs font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Ref Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-lims-border)]">
                  {displayParams.map((param: any) => {
                    const key = param.id || param.name;
                    const val = formData[key] || "";
                    const isFilled = val !== "";
                    
                    return (
                      <tr key={key} className="hover:bg-[var(--color-lims-bg)]/50 transition-colors">
                        <td className="px-5 py-3 align-middle">
                          <span className="font-medium text-[14px] text-[var(--color-lims-text)]">{param.name}</span>
                        </td>
                        <td className="px-5 py-3 align-middle">
                          <div className="relative max-w-[200px]">
                            <Input
                              type="number"
                              step="any"
                              disabled={isCompleted || isPendingApproval}
                              value={val}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className={cn(
                                "h-10 pr-12 font-medium bg-white",
                                isFilled ? "border-green-500 focus-visible:ring-green-500" : ""
                              )}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-lims-text-muted)]">
                              {param.unit}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 align-middle">
                           <span className="text-sm text-[var(--color-lims-text-muted)]">{param.referenceRange} {param.unit}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Laboratory Findings */}
          <div className="bg-white border border-[var(--color-lims-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-lims-border)] bg-[var(--color-lims-bg)]">
              <h3 className="font-bold text-[var(--color-lims-text)] flex items-center gap-2">
                Laboratory Findings & Notes
              </h3>
            </div>
            <div className="p-5">
              <textarea
                disabled={isCompleted || isPendingApproval}
                value={labFindings}
                onChange={(e) => setLabFindings(e.target.value)}
                placeholder="Enter macroscopic observations, sample quality issues, or internal notes..."
                className="w-full h-32 p-3 text-sm border border-[var(--color-lims-border)] rounded-md outline-none focus:border-[var(--color-lims-accent)] focus:ring-1 focus:ring-[var(--color-lims-accent)] resize-none disabled:bg-[var(--color-lims-bg)] disabled:opacity-75"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
