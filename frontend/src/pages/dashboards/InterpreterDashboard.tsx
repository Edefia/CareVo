import { FileText, Clock, Heart, Droplets, Activity } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function InterpreterDashboard() {
  const { user } = useAuthStore()

  // Mock Queue Data
  const pendingQueue = [
    {
      id: "res-1",
      submittedAt: "2 hours ago",
      referralCode: "CRV-2025-X2L8J4",
      package: "Renal Check",
      pillar: "RENAL",
      lab: "MediScan Ghana",
    },
    {
      id: "res-2",
      submittedAt: "5 hours ago",
      referralCode: "CRV-2025-V5N1C9",
      package: "Metabolic Profile",
      pillar: "METABOLIC",
      lab: "AccuLab Diagnostics",
    },
    {
      id: "res-3",
      submittedAt: "Yesterday",
      referralCode: "CRV-2025-A7K3P2",
      package: "Cardio Essentials",
      pillar: "CARDIO",
      lab: "AccuLab Diagnostics",
    }
  ]

  const renderPillarIcon = (pillar: string) => {
    switch(pillar) {
      case 'CARDIO': return <div className="h-6 w-6 rounded-md bg-[#DC2626]/10 flex items-center justify-center"><Heart className="h-3.5 w-3.5 text-[#DC2626]" /></div>
      case 'RENAL': return <div className="h-6 w-6 rounded-md bg-[#0F76E0]/10 flex items-center justify-center"><Droplets className="h-3.5 w-3.5 text-[#0F76E0]" /></div>
      case 'METABOLIC': return <div className="h-6 w-6 rounded-md bg-[#D97706]/10 flex items-center justify-center"><Activity className="h-3.5 w-3.5 text-[#D97706]" /></div>
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Interpreter Workspace
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Welcome back, {user?.firstName}. Review laboratory results and provide clinical interpretations.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] shadow-sm flex items-center gap-[16px]">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <Clock className="h-[24px] w-[24px] text-[var(--color-forest)]" />
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-[var(--color-text-primary)] leading-none">{pendingQueue.length}</div>
            <div className="font-sans text-[14px] text-[var(--color-text-muted)] font-medium mt-1">Pending Interpretations</div>
          </div>
        </div>
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] p-[24px] shadow-sm flex items-center gap-[16px]">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#F0FDF4]">
            <FileText className="h-[24px] w-[24px] text-[#16A34A]" />
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-[var(--color-text-primary)] leading-none">12</div>
            <div className="font-sans text-[14px] text-[var(--color-text-muted)] font-medium mt-1">Completed Today</div>
          </div>
        </div>
      </div>

      {/* QUEUE TABLE */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)]">
              Pending Interpretations
            </h2>
            <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
              Results submitted by laboratories awaiting your review.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Submitted</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Referral Code</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Package</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lab</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingQueue.map((item) => (
                <tr key={item.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                  <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-secondary)]">
                    {item.submittedAt}
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <span className="font-mono text-[14px] font-bold text-[var(--color-forest)] bg-[#7EE8A2]/10 px-2 py-1 rounded">
                      {item.referralCode}
                    </span>
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <div className="flex items-center gap-2">
                      {renderPillarIcon(item.pillar)}
                      <span className="font-medium text-[14px] text-[var(--color-text-primary)]">{item.package}</span>
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px] text-[14px] text-[var(--color-text-secondary)]">
                    {item.lab}
                  </td>
                  <td className="px-[24px] py-[20px] text-right">
                    <Link to={`/interpreter/editor/${item.referralCode}`}>
                      <Button size="sm" className="font-medium gap-2">
                        Start Interpretation <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {pendingQueue.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-[24px] py-[64px] text-center text-[var(--color-text-muted)]">
                    No pending interpretations in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
