import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle, ClipboardList, Clock,
  ChevronDown, ChevronUp, User, FileText, MapPin,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFollowUps, useAcknowledgeFollowUp } from "@/hooks/useFollowUps"
import { LoadingState } from "@/components/shared/LoadingState"
import toast from "react-hot-toast"
import type { FollowUp } from "@/api/services/followUps"

// ─── Helpers ────────────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  FURTHER_TESTING: "Further Testing",
  MEDICATION_REFERRAL: "Medication Referral",
  CLINICIAN_APPOINTMENT: "Clinician Appointment",
  FACILITY_TRANSFER: "Facility Transfer",
}

const urgencyConfig: Record<string, { color: string; borderColor: string; label: string }> = {
  ROUTINE: { color: "bg-[#16A34A]", borderColor: "border-l-[#16A34A]", label: "Routine" },
  URGENT: { color: "bg-[#D97706]", borderColor: "border-l-[#D97706]", label: "Urgent" },
  EMERGENCY: { color: "bg-[#DC2626]", borderColor: "border-l-[#DC2626]", label: "Emergency" },
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  ACKNOWLEDGED: { bg: "bg-blue-50", text: "text-blue-700", label: "Acknowledged" },
  IN_PROGRESS: { bg: "bg-indigo-50", text: "text-indigo-700", label: "In Progress" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", label: "Completed" },
  CLOSED: { bg: "bg-slate-100", text: "text-slate-600", label: "Closed" },
}

function getInterpreterName(interpreter: FollowUp["interpreterId"]): string {
  if (typeof interpreter === "string") return "Interpreter"
  return `Dr. ${interpreter.firstName} ${interpreter.lastName}`
}

function getResultInfo(result: FollowUp["resultId"]): { name: string; date: string } {
  if (typeof result === "string") return { name: "Test Result", date: "" }
  return {
    name: result.panelName,
    date: result.collectionDate
      ? new Date(result.collectionDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
      : "",
  }
}

// ─── Follow Up Card ─────────────────────────────────────────────────────────

function FollowUpCard({
  followUp,
  onAcknowledge,
  isAcknowledging,
}: {
  followUp: FollowUp
  onAcknowledge: (id: string) => void
  isAcknowledging: boolean
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const urgency = urgencyConfig[followUp.urgency] || urgencyConfig.ROUTINE
  const status = statusConfig[followUp.status] || statusConfig.PENDING
  const interpreter = getInterpreterName(followUp.interpreterId)
  const result = getResultInfo(followUp.resultId)

  return (
    <Card className={`overflow-hidden border-l-4 ${urgency.borderColor} transition-all hover:shadow-md`}>
      {/* Urgency top strip */}
      <div className={`h-1 ${urgency.color}`} />

      <CardContent className="p-0">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Left column */}
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-[var(--color-surface-2)] text-[var(--color-forest)] border-[var(--color-forest)]/20 font-medium">
                  {typeLabels[followUp.type] || followUp.type}
                </Badge>
                <Badge variant="outline" className={`${urgency.color} text-white border-0 text-xs`}>
                  {urgency.label}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Referred by: <span className="font-medium text-slate-800">{interpreter}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Linked result: <span className="font-medium text-slate-800">{result.name}</span>{result.date ? ` — ${result.date}` : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Date issued: {new Date(followUp.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col items-start sm:items-end gap-3">
              <Badge variant="outline" className={`${status.bg} ${status.text} border-0 px-3 py-1 text-sm`}>
                {status.label}
              </Badge>

              {followUp.status === "PENDING" && (
                <Button
                  onClick={() => onAcknowledge(followUp._id)}
                  disabled={isAcknowledging}
                  size="sm"
                  className="gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  Acknowledge
                </Button>
              )}
            </div>
          </div>

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1 text-sm text-[var(--color-forest)] hover:underline font-medium"
          >
            {expanded ? "Hide Details" : "View Details"}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Expanded section */}
          {expanded && (
            <div className="mt-4 pt-4 border-t space-y-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Interpreter Notes</h4>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                  {followUp.notes}
                </p>
              </div>

              {followUp.facility && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Recommended Facility/Clinician:</span>
                    <p className="text-sm text-slate-600">{followUp.facility}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 sm:px-6 py-3 bg-slate-50/50">
          <button
            onClick={() => {
              const resultId = typeof followUp.resultId === "string" ? followUp.resultId : followUp.resultId._id
              navigate(`/client/results/${resultId}`)
            }}
            className="flex items-center gap-1.5 text-sm text-[var(--color-forest)] hover:underline font-medium"
          >
            View Linked Result
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function ClientFollowUp() {
  const { data: followUps, isLoading } = useFollowUps()
  const acknowledgeMutation = useAcknowledgeFollowUp()
  const [showCompleted, setShowCompleted] = useState(false)

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Follow-up acknowledged.")
      },
      onError: () => {
        toast.error("Failed to acknowledge follow-up.")
      },
    })
  }

  if (isLoading) {
    return <LoadingState message="Loading your follow-ups..." />
  }

  const allFollowUps = Array.isArray(followUps) ? followUps : []
  const activeFollowUps = allFollowUps.filter(
    (f) => !["COMPLETED", "CLOSED"].includes(f.status)
  )
  const completedFollowUps = allFollowUps.filter(
    (f) => ["COMPLETED", "CLOSED"].includes(f.status)
  )

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      {/* Empty State */}
      {allFollowUps.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No follow-ups at this time.</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              If any of your results require follow-up care, your CareBis interpreter will create a follow-up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Follow-Ups */}
          {activeFollowUps.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[var(--color-forest)]" />
                Active Follow-Ups ({activeFollowUps.length})
              </h2>
              <div className="grid gap-4">
                {activeFollowUps.map((followUp) => (
                  <FollowUpCard
                    key={followUp._id}
                    followUp={followUp}
                    onAcknowledge={handleAcknowledge}
                    isAcknowledging={acknowledgeMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Follow-Ups */}
          {completedFollowUps.length > 0 && (
            <div className="space-y-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Completed Follow-Ups ({completedFollowUps.length})
              </button>

              {showCompleted && (
                <div className="grid gap-4 animate-in fade-in slide-in-from-top-2">
                  {completedFollowUps.map((followUp) => (
                    <FollowUpCard
                      key={followUp._id}
                      followUp={followUp}
                      onAcknowledge={handleAcknowledge}
                      isAcknowledging={acknowledgeMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
