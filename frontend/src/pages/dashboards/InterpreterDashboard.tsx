import { FileText, Clock, Heart, Droplets, Activity, CheckCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useResultsStore } from "@/store/results"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLaboratories } from "@/hooks/useLaboratories"
import { useState } from "react"

export function InterpreterDashboard() {
  const { user } = useAuthStore()
<<<<<<< HEAD
  const { pendingInterpretations, completedInterpretationsCount } = useResultsStore()
=======
  const { pendingInterpretations } = useResultsStore()
  const [selectedLabName, setSelectedLabName] = useState<string>("ALL")
  
  const { data: laboratoriesData } = useLaboratories()
  const labsData = laboratoriesData?.data || laboratoriesData
  const labs = labsData?.items || labsData?.data || (Array.isArray(labsData) ? labsData : [])

  const filteredInterpretations = selectedLabName === "ALL" 
    ? pendingInterpretations 
    : pendingInterpretations.filter((item: any) => item.lab === selectedLabName)
>>>>>>> bd51494230ae3f46a5b12de7b5135f8179699274

  const renderPillarIcon = (pillar: string) => {
    switch(pillar) {
      case 'CARDIO': return <div className="h-7 w-7 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shadow-sm"><Heart className="h-4 w-4 text-[#DC2626]" /></div>
      case 'RENAL': return <div className="h-7 w-7 rounded-lg bg-[#0F76E0]/10 flex items-center justify-center shadow-sm"><Droplets className="h-4 w-4 text-[#0F76E0]" /></div>
      case 'METABOLIC': return <div className="h-7 w-7 rounded-lg bg-[#D97706]/10 flex items-center justify-center shadow-sm"><Activity className="h-4 w-4 text-[#D97706]" /></div>
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto animate-fade-in-up">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-1">
            Interpreter Workspace
          </h1>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
            Welcome back, {user?.firstName}. Review laboratory results and provide clinical interpretations.
          </p>
        </div>
      </div>

      {/* HIGH-LEVEL STATISTICS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 shrink-0">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
<<<<<<< HEAD
          <div>
            <div className="font-serif text-2xl font-bold text-[var(--color-text-primary)] leading-none">{pendingInterpretations.length}</div>
            <div className="font-sans text-[13px] text-[var(--color-text-secondary)] font-medium mt-1 uppercase tracking-wider">Pending Review</div>
=======
          <div className="relative z-10">
            <div className="font-serif text-[36px] font-bold text-[var(--color-text-primary)] leading-none">{filteredInterpretations.length}</div>
            <div className="font-sans text-[15px] text-[var(--color-text-secondary)] font-medium mt-1">Pending Review</div>
>>>>>>> bd51494230ae3f46a5b12de7b5135f8179699274
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0FDF4] border border-[#16A34A]/20 shrink-0">
            <FileText className="h-5 w-5 text-[#16A34A]" />
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-[var(--color-text-primary)] leading-none">{completedInterpretationsCount}</div>
            <div className="font-sans text-[13px] text-[var(--color-text-secondary)] font-medium mt-1 uppercase tracking-wider">Completed Today</div>
          </div>
        </div>
      </div>

      {/* QUEUE TABLE */}
<<<<<<< HEAD
      <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="font-sans text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            Pending Interpretations
            {pendingInterpretations.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-[11px] font-bold">
                {pendingInterpretations.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Results securely submitted by partner laboratories awaiting your review.
          </p>
=======
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-[24px] py-[24px] border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface-2)] to-white flex justify-between items-center">
          <div>
            <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)] flex items-center gap-2">
              Pending Interpretations
              {pendingInterpretations.length > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 text-[12px] font-bold ml-2">
                  {pendingInterpretations.length}
                </span>
              )}
            </h2>
            <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
              Results securely submitted by partner laboratories awaiting your review.
            </p>
          </div>
          <div className="w-[250px]">
            <Select value={selectedLabName} onValueChange={setSelectedLabName}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by Laboratory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Laboratories</SelectItem>
                {labs.map((lab: any) => (
                  <SelectItem key={lab._id} value={lab.name}>{lab.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
>>>>>>> bd51494230ae3f46a5b12de7b5135f8179699274
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
              {filteredInterpretations.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5 text-[14px]">
                      <Clock className="h-4 w-4 text-orange-500" />
                      {item.submittedAt}
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <span className="font-mono text-[14px] font-bold text-[var(--color-forest)] bg-[#7EE8A2]/20 px-2 py-1 rounded">
                      {item.referralCode}
                    </span>
                  </td>
                  <td className="px-[24px] py-[20px]">
                    <div className="flex items-center gap-3">
                      {renderPillarIcon(item.pillar)}
                      <span className="font-medium text-[14px] text-[var(--color-text-primary)]">{item.package}</span>
                    </div>
                  </td>
                  <td className="px-[24px] py-[20px] text-[14px] text-[var(--color-text-secondary)] font-medium">
                    {item.lab}
                  </td>
                  <td className="px-[24px] py-[20px] text-right">
                    <Link to={`/interpreter/editor/${item.referralCode}`}>
                      <Button size="sm" className="font-medium gap-2 bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white shadow-sm hover:shadow-md transition-all">
                        Review Results <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredInterpretations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-[24px] py-[64px] text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                      <p className="font-medium text-[16px] text-gray-600">You're all caught up!</p>
                      <p className="text-[14px] text-gray-400 mt-1">There are no pending interpretations at this time.</p>
                    </div>
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
