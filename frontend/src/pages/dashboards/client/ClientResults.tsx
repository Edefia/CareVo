import { useState } from "react"
import { Search, FileText, Download, Activity, Droplets, Heart, HeartPulse, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useNavigate } from "react-router-dom"
import { useResults } from "@/hooks/useResults"
import { useExportParameters } from "@/hooks/useHealthAccount"
import { LoadingState } from "@/components/shared/LoadingState"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

// Helper to extract Risk from result (simplified for now)
const getRiskLevel = (status: string) => {
  if (status === "CRITICAL") return "HIGH"
  if (status === "ABNORMAL") return "MODERATE"
  return "LOW"
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'LOW': return 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20'
    case 'MODERATE': return 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20'
    case 'HIGH': return 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20'
    default: return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

// Helper to infer pillar from biomarker name
function inferPillar(biomarkerName: string): 'CARDIO' | 'RENAL' | 'METABOLIC' {
  const name = biomarkerName.toLowerCase()
  const renalKeywords = ['creatinine', 'egfr', 'urea', 'uric acid', 'bun', 'kidney', 'albumin']
  const cardioKeywords = ['cholesterol', 'ldl', 'hdl', 'triglyceride', 'troponin', 'bnp', 'lipid', 'cardiovascular']
  if (renalKeywords.some(kw => name.includes(kw))) return 'RENAL'
  if (cardioKeywords.some(kw => name.includes(kw))) return 'CARDIO'
  return 'METABOLIC'
}

// Helper to parse reference range string like "3.5-5.0" into min/max
function parseReferenceRange(rangeStr: string): { min: number | null; max: number | null } {
  if (!rangeStr) return { min: null, max: null }
  const match = rangeStr.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (match) {
    return { min: parseFloat(match[1]), max: parseFloat(match[2]) }
  }
  return { min: null, max: null }
}

// ─── Export Modal ────────────────────────────────────────────────────────────

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: any
}

function ExportToHealthAccountModal({ open, onOpenChange, result }: ExportModalProps) {
  const [selectedParams, setSelectedParams] = useState<Set<number>>(new Set())
  const exportMutation = useExportParameters()

  const biomarkers = result?.biomarkers || []

  const toggleParam = (index: number) => {
    setSelectedParams(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedParams.size === biomarkers.length) {
      setSelectedParams(new Set())
    } else {
      setSelectedParams(new Set(biomarkers.map((_: any, i: number) => i)))
    }
  }

  const handleExport = () => {
    // TODO: add payment gate before export confirm
    const parameters = Array.from(selectedParams).map(idx => {
      const bm = biomarkers[idx]
      const ref = parseReferenceRange(bm.referenceRange)
      return {
        parameterKey: bm.name.toUpperCase().replace(/\s+/g, '_'),
        parameterName: bm.name,
        pillar: inferPillar(bm.name),
        value: String(bm.value),
        unit: bm.unit,
        referenceMin: ref.min,
        referenceMax: ref.max,
        testDate: result.collectionDate || result.createdAt,
        laboratoryId: typeof result.laboratoryId === 'object' ? result.laboratoryId._id : (result.laboratoryId || ''),
        laboratoryName: typeof result.laboratoryId === 'object' ? (result.laboratoryId.name || 'Unknown Lab') : 'Unknown Lab',
      }
    })

    exportMutation.mutate(
      { resultId: result._id || result.id, parameters },
      {
        onSuccess: () => {
          toast.success("Parameters exported to your Health Account.")
          onOpenChange(false)
          setSelectedParams(new Set())
        },
        onError: () => {
          toast.error("Failed to export parameters.")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-[var(--color-forest)]" />
            Export to Health Account
          </DialogTitle>
          <DialogDescription>
            Select which parameters to export to your Health Account for trend tracking.
          </DialogDescription>
        </DialogHeader>

        {/* Fee Notice */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">💡 A small fee applies for Health Account tracking.</p>
          <p className="text-amber-600 mt-0.5">Payment integration coming soon.</p>
        </div>

        {/* Parameter Checklist */}
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-semibold text-slate-700">Parameters</span>
            <button onClick={toggleAll} className="text-xs text-[var(--color-forest)] hover:underline font-medium">
              {selectedParams.size === biomarkers.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {biomarkers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No biomarkers available for export.</p>
          ) : (
            biomarkers.map((bm: any, idx: number) => (
              <label
                key={idx}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${
                  selectedParams.has(idx) ? "bg-[var(--color-surface-2)]" : "hover:bg-slate-50"
                }`}
              >
                <Checkbox
                  checked={selectedParams.has(idx)}
                  onCheckedChange={() => toggleParam(idx)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{bm.name}</p>
                  <p className="text-xs text-slate-500">
                    {bm.value} {bm.unit} · Ref: {bm.referenceRange || "N/A"}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  bm.flag === 'NORMAL' ? 'bg-green-50 text-green-700 border-green-200' :
                  bm.flag === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {bm.flag}
                </span>
              </label>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedParams.size === 0 || exportMutation.isPending}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Export {selectedParams.size} Parameter{selectedParams.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function ClientResults() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: resultsData, isLoading } = useResults()
  const [exportResult, setExportResult] = useState<any>(null)
  
  const results = resultsData?.items || resultsData || []

  const filteredResults = Array.isArray(results) ? results.filter((res: any) => 
    (res.panelName || res.bookingId || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (res._id || res.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  if (isLoading) {
    return <LoadingState message="Fetching your results..." />
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      {/* Search Toolbar Box */}
      {Array.isArray(results) && results.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3.5 sm:px-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by package..." 
              className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs text-muted-foreground self-center sm:self-auto">
            Showing <strong className="text-slate-700">{filteredResults.length}</strong> {filteredResults.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      )}

      {filteredResults.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm 
                ? `No screenings matched "${searchTerm}".`
                : "You don't have any completed lab results yet. Book a screening to get started."}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => navigate('/client/bookings/new')} className="mt-6">
                Book a Screening
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResults.map((result: any) => {
            const risk = getRiskLevel(result.status)
            const pillar = result._id?.charCodeAt(0) % 3 === 0 ? 'CARDIO' : result._id?.charCodeAt(0) % 2 === 0 ? 'RENAL' : 'METABOLIC'

            return (
              <Card key={result._id || result.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`flex shrink-0 h-12 w-12 items-center justify-center rounded-xl ${
                      pillar === 'CARDIO' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                      pillar === 'RENAL' ? 'bg-[#0F76E0]/10 text-[#0F76E0]' :
                      'bg-[#D97706]/10 text-[#D97706]'
                    }`}>
                      {pillar === 'CARDIO' && <Heart className="h-6 w-6" />}
                      {pillar === 'RENAL' && <Droplets className="h-6 w-6" />}
                      {pillar === 'METABOLIC' && <Activity className="h-6 w-6" />}
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getRiskColor(risk)}`}>
                      {risk} RISK
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {result.panelName || result.bookingId || 'Comprehensive Wellness Screen'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1">
                      {new Date(result.collectionDate || result.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {typeof result.laboratoryId === "object" && result.laboratoryId?.name && (
                      <p className="text-xs text-slate-400 mb-3">{result.laboratoryId.name}</p>
                    )}
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {result.biomarkers?.length || 0} Biomarkers
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-[var(--color-lime-dark)] hover:text-[var(--color-forest)] hover:bg-transparent font-medium text-sm"
                      onClick={() => navigate(`/client/results/${result._id || result.id}`)}
                    >
                      View Full Report
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExportResult(result)
                        }}
                      >
                        <HeartPulse className="h-3.5 w-3.5" />
                        Export to Health Account
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={(e) => { e.stopPropagation() }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Export Modal */}
      <ExportToHealthAccountModal
        open={!!exportResult}
        onOpenChange={(open) => { if (!open) setExportResult(null) }}
        result={exportResult}
      />
    </div>
  )
}
