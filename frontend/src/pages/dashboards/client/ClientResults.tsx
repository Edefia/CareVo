import { useState } from "react"
import { Search, FileText, Download, Activity, Droplets, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useResults } from "@/hooks/useResults"
import { LoadingState } from "@/components/shared/LoadingState"

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

export function ClientResults() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: resultsData, isLoading } = useResults()
  
  const results = resultsData?.items || resultsData || []

  const filteredResults = Array.isArray(results) ? results.filter((res: any) => 
    (res.bookingId || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (res._id || res.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  if (isLoading) {
    return <LoadingState message="Fetching your results..." />
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">My Results</h1>
          <p className="text-muted-foreground mt-1">Review your latest laboratory screenings and health insights.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by package..." 
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              You don't have any completed lab results yet. Book a screening to get started.
            </p>
            <Button onClick={() => navigate('/client/bookings/new')} className="mt-6">
              Book a Screening
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResults.map((result: any) => {
            const risk = getRiskLevel(result.status)
            // Mocking pillar based on ID for visual variety since real data might not have it yet
            const pillar = result._id?.charCodeAt(0) % 3 === 0 ? 'CARDIO' : result._id?.charCodeAt(0) % 2 === 0 ? 'RENAL' : 'METABOLIC'

            return (
              <Card key={result._id || result.id} className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/client/results/${result._id || result.id}`)}>
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
                      {result.bookingId || 'Comprehensive Wellness Screen'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Completed on {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {result.biomarkers?.length || 0} Biomarkers
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-[var(--color-lime-dark)] font-medium group-hover:text-[var(--color-forest)] transition-colors">
                      View full report
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-[var(--color-forest)]" onClick={(e) => { e.stopPropagation(); /* download logic */ }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
