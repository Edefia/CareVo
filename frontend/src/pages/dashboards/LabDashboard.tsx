import { useParams } from "react-router-dom"
import { WorklistPanel } from "@/components/lab/WorklistPanel"
import { ResultPane } from "@/components/lab/ResultPane"
import { FileText, Search } from "lucide-react"

export function LabDashboard() {
  const { referralCode } = useParams<{ referralCode: string }>()

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Pane: Worklist */}
      <div className={`shrink-0 h-full ${referralCode ? 'hidden md:block' : 'w-full md:w-auto'}`}>
        <WorklistPanel />
      </div>

      {/* Right Pane: Details / Result Entry */}
      <div className={`flex-1 bg-[var(--color-lims-bg)] flex flex-col min-w-0 ${!referralCode ? 'hidden md:flex' : 'flex'}`}>
        {referralCode ? (
          <ResultPane referralCode={referralCode} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--color-lims-border)] mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--color-lims-accent)]/20 animate-[spin_4s_linear_infinite]" />
              <FileText className="w-8 h-8 text-[var(--color-lims-accent)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-lims-text)] font-sans tracking-tight mb-2">
              Laboratory Workspace
            </h2>
            <p className="text-[var(--color-lims-text-muted)] max-w-[400px] text-sm">
              Select a client from the worklist on the left to view details, enter test results, or review past diagnostics.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="bg-white px-4 py-3 rounded-lg border border-[var(--color-lims-border)] shadow-sm flex items-center gap-3">
                <Search className="w-4 h-4 text-[var(--color-lims-accent)]" />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase text-[var(--color-lims-text-muted)]">Quick Search</div>
                  <div className="text-sm font-medium">Ctrl + K</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
