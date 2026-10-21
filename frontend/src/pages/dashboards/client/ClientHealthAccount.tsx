import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  HeartPulse, TrendingUp, Calendar, TestTube,
  AlertTriangle, CheckCircle2, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useHealthAccount, useExportHistory, useRemoveParameter } from "@/hooks/useHealthAccount"
import { LoadingState } from "@/components/shared/LoadingState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts"
import toast from "react-hot-toast"
import type { HealthAccountEntry } from "@/api/services/healthAccount"

// ─── Helpers ────────────────────────────────────────────────────────────────

const pillarColors: Record<string, { bg: string; text: string; border: string }> = {
  CARDIO: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  RENAL: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  METABOLIC: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
}

const pillarLabels: Record<string, string> = {
  CARDIO: "Cardiovascular",
  RENAL: "Renal / Kidney",
  METABOLIC: "Metabolic",
}

function isOutOfRange(value: string, min: number | null, max: number | null): boolean {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min !== null && num < min) return true
  if (max !== null && num > max) return true
  return false
}

function getRiskFromValue(value: string, min: number | null, max: number | null): string {
  const num = parseFloat(value)
  if (isNaN(num)) return "UNKNOWN"
  if (min !== null && max !== null) {
    const range = max - min
    if (num < min - range * 0.5 || num > max + range * 0.5) return "HIGH"
    if (num < min || num > max) return "MODERATE"
  }
  return "LOW"
}

const riskBadgeStyles: Record<string, string> = {
  LOW: "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20",
  MODERATE: "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20",
  HIGH: "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20",
  UNKNOWN: "bg-gray-100 text-gray-500 border-gray-200",
}

const riskIcons: Record<string, React.ReactNode> = {
  LOW: <CheckCircle2 className="h-4 w-4" />,
  MODERATE: <Info className="h-4 w-4" />,
  HIGH: <AlertTriangle className="h-4 w-4" />,
}

// ─── Parameter Trend Card ───────────────────────────────────────────────────

function ParameterTrendCard({
  parameterKey,
  entries,
  onRemove,
}: {
  parameterKey: string
  entries: HealthAccountEntry[]
  onRemove: (key: string) => void
}) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const latest = entries[entries.length - 1]
  const pillar = latest?.pillar || "METABOLIC"
  const pColor = pillarColors[pillar] || pillarColors.METABOLIC
  const risk = getRiskFromValue(latest?.value, latest?.referenceMin, latest?.referenceMax)

  const chartData = entries.map((e) => ({
    date: new Date(e.testDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    rawDate: e.testDate,
    value: parseFloat(e.value) || 0,
    lab: e.laboratoryName,
    risk: getRiskFromValue(e.value, e.referenceMin, e.referenceMax),
  }))

  const refMin = latest?.referenceMin
  const refMax = latest?.referenceMax
  const hasAnyOutOfRange = entries.some((e) => isOutOfRange(e.value, e.referenceMin, e.referenceMax))

  const firstDate = entries[0]
    ? new Date(entries[0].testDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—"
  const latestDate = latest
    ? new Date(latest.testDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—"

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${pColor.bg} ${pColor.text} ${pColor.border}`}>
                <HeartPulse className="h-3.5 w-3.5" />
                {pillarLabels[pillar]}
              </div>
              <CardTitle className="font-serif text-lg">{latest?.parameterName || parameterKey}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-slate-900">
                {latest?.value} {latest?.unit}
              </span>
              <Badge variant="outline" className={`${riskBadgeStyles[risk]} flex items-center gap-1`}>
                {riskIcons[risk]}
                {risk === "LOW" ? "Normal" : risk === "MODERATE" ? "Moderate" : risk === "HIGH" ? "High Risk" : "—"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Chart */}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" label={{ value: latest?.unit || "", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#94a3b8" } }} />
                {refMin !== null && refMax !== null && (
                  <ReferenceArea y1={refMin} y2={refMax} fill="#16A34A" fillOpacity={0.08} stroke="#16A34A" strokeOpacity={0.15} />
                )}
                {refMin !== null && <ReferenceLine y={refMin} stroke="#16A34A" strokeDasharray="3 3" strokeOpacity={0.4} />}
                {refMax !== null && <ReferenceLine y={refMax} stroke="#16A34A" strokeDasharray="3 3" strokeOpacity={0.4} />}
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-white p-3 shadow-lg text-sm">
                        <p className="font-semibold">{d.date}</p>
                        <p className="text-slate-600">Value: <span className="font-mono font-bold">{d.value} {latest?.unit}</span></p>
                        <p className="text-slate-500">Lab: {d.lab}</p>
                        <p className={`font-medium ${d.risk === "LOW" ? "text-green-600" : d.risk === "MODERATE" ? "text-amber-600" : "text-red-600"}`}>
                          Risk: {d.risk}
                        </p>
                      </div>
                    )
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={hasAnyOutOfRange ? "#DC2626" : "#16A34A"}
                  strokeWidth={2.5}
                  dot={{ r: 5, strokeWidth: 2, fill: "white" }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm text-slate-500">
            <div className="flex gap-4">
              <span>{entries.length} reading{entries.length !== 1 ? "s" : ""} tracked</span>
              <span>First: {firstDate}</span>
              <span>Latest: {latestDate}</span>
            </div>
            <button
              onClick={() => setShowRemoveDialog(true)}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Remove from tracking
            </button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Remove Parameter Tracking"
        description={
          <>
            This will remove all tracked data for{" "}
            <strong className="text-[var(--color-text-primary)]">
              {latest?.parameterName || parameterKey}
            </strong>{" "}
            from your Health Account. Your original test results will not be affected.
          </>
        }
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => onRemove(parameterKey)}
      />
    </>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function ClientHealthAccount() {
  const navigate = useNavigate()
  const { data: healthData, isLoading } = useHealthAccount()
  const { data: exportHistory, isLoading: historyLoading } = useExportHistory()
  const removeParameterMutation = useRemoveParameter()
  const [showHistory, setShowHistory] = useState(true)

  const handleRemove = (parameterKey: string) => {
    removeParameterMutation.mutate(parameterKey, {
      onSuccess: () => {
        toast.success("Parameter removed from tracking.")
      },
      onError: () => {
        toast.error("Failed to remove parameter.")
      },
    })
  }

  if (isLoading) {
    return <LoadingState message="Loading your Health Account..." />
  }

  const parameterKeys = healthData ? Object.keys(healthData) : []
  const isEmpty = parameterKeys.length === 0

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      {/* Empty State */}
      {isEmpty ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No health data tracked yet.</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Go to My Results and export parameters from any of your test results to start tracking your health trends here.
            </p>
            <Button onClick={() => navigate("/client/results")} size="lg">
              Go to My Results
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Part 1 — Parameter Trend Cards */}
          <div className="grid gap-6">
            {parameterKeys.map((key) => (
              <ParameterTrendCard
                key={key}
                parameterKey={key}
                entries={healthData![key]}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Part 2 — Export History */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--color-forest)]" />
                  Export History
                </CardTitle>
                {showHistory ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </CardHeader>
            {showHistory && (
              <CardContent>
                {historyLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Loading export history...</p>
                ) : !exportHistory || exportHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No export events recorded yet.</p>
                ) : (
                  <div className="divide-y">
                    {exportHistory.map((event, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 text-sm">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 font-medium">
                            {new Date(event.exportedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-[160px]">
                          <TestTube className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-800">{event.resultName}</span>
                        </div>
                        <div className="flex-1 text-slate-500">
                          {event.parametersExported.join(", ")}
                        </div>
                        <span className="text-xs text-slate-400">{event.laboratoryName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
