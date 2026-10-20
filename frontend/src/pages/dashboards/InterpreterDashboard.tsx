import { useState } from "react"
import { 
  FileText, 
  Clock, 
  Heart, 
  Droplets, 
  Activity, 
  CheckCircle, 
  ClipboardList, 
  AlertTriangle, 
  Building2, 
  UserCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useResultsStore } from "@/store/results"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLaboratories } from "@/hooks/useLaboratories"
import { useAllFollowUps, useFollowUpOverviewStats, useUpdateFollowUpStatus } from "@/hooks/useFollowUps"
import toast from "react-hot-toast"

export function InterpreterDashboard() {
  const { user } = useAuthStore()
  const { pendingInterpretations, completedInterpretationsCount } = useResultsStore()
  const [selectedLabName, setSelectedLabName] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState<"interpretations" | "followups">("interpretations")
  const [followUpFilter, setFollowUpFilter] = useState<string>("ALL")
  const [expandedFollowUpId, setExpandedFollowUpId] = useState<string | null>(null)

  const { data: laboratoriesData } = useLaboratories()
  const labsData = laboratoriesData?.data || laboratoriesData
  const labs = labsData?.items || labsData?.data || (Array.isArray(labsData) ? labsData : [])

  const { data: followUpsData, isLoading: followUpsLoading } = useAllFollowUps(
    followUpFilter !== "ALL" ? { status: followUpFilter } : undefined
  )
  const followUps = Array.isArray(followUpsData) ? followUpsData : []

  const { data: followUpStats } = useFollowUpOverviewStats()
  const updateStatusMutation = useUpdateFollowUpStatus()

  const filteredInterpretations = selectedLabName === "ALL" 
    ? pendingInterpretations 
    : pendingInterpretations.filter((item: any) => item.lab === selectedLabName)

  const handleStatusChange = async (followUpId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: followUpId, status: newStatus })
      toast.success(`Follow-up marked as ${newStatus.replace("_", " ")}.`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update follow-up status.")
    }
  }

  const renderPillarIcon = (pillar: string) => {
    switch(pillar) {
      case 'CARDIO': return <div className="h-7 w-7 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shadow-sm"><Heart className="h-4 w-4 text-[#DC2626]" /></div>
      case 'RENAL': return <div className="h-7 w-7 rounded-lg bg-[#0F76E0]/10 flex items-center justify-center shadow-sm"><Droplets className="h-4 w-4 text-[#0F76E0]" /></div>
      case 'METABOLIC': return <div className="h-7 w-7 rounded-lg bg-[#D97706]/10 flex items-center justify-center shadow-sm"><Activity className="h-4 w-4 text-[#D97706]" /></div>
      default: return null
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> EMERGENCY</span>
      case "URGENT":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">URGENT</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">ROUTINE</span>
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[40px] max-w-[1280px] mx-auto animate-fade-in-up">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-1">
            Clinical Interpreter Workspace
          </h1>
          <p className="font-sans text-[15px] text-[var(--color-text-secondary)]">
            Welcome back, Dr. {user?.lastName || user?.firstName}. Review laboratory results and manage continuity-of-care follow-ups.
          </p>
        </div>
      </div>

      {/* HIGH-LEVEL STATISTICS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Pending Review */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 shrink-0">
            <Clock className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-[var(--color-text-primary)] leading-none">{filteredInterpretations.length}</div>
            <div className="font-sans text-[14px] text-[var(--color-text-secondary)] font-medium mt-1">Pending Interpretations</div>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0FDF4] border border-[#16A34A]/20 shrink-0">
            <FileText className="h-6 w-6 text-[#16A34A]" />
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-[var(--color-text-primary)] leading-none">{completedInterpretationsCount}</div>
            <div className="font-sans text-[14px] text-[var(--color-text-secondary)] font-medium mt-1">Completed Today</div>
          </div>
        </div>

        {/* Active Follow-Ups */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 shrink-0">
            <ClipboardList className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-serif text-[32px] font-bold text-[var(--color-text-primary)] leading-none">
                {followUpStats?.total || followUps.length || 0}
              </span>
              {((followUpStats?.emergency || 0) > 0) && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 animate-pulse">
                  {followUpStats?.emergency} Emergency
                </span>
              )}
            </div>
            <div className="font-sans text-[14px] text-[var(--color-text-secondary)] font-medium mt-1">
              Continuity Follow-Ups ({followUpStats?.pending || 0} awaiting ack)
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-[var(--color-border)] gap-6">
        <button
          onClick={() => setActiveTab("interpretations")}
          className={`pb-3 font-serif text-[18px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "interpretations"
              ? "border-[var(--color-forest)] text-[var(--color-forest)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="h-5 w-5" />
          Pending Interpretations
          {filteredInterpretations.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-bold">
              {filteredInterpretations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("followups")}
          className={`pb-3 font-serif text-[18px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "followups"
              ? "border-[var(--color-forest)] text-[var(--color-forest)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          Follow-Up Referrals
          {followUps.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-bold">
              {followUps.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PENDING INTERPRETATIONS */}
      {activeTab === "interpretations" && (
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif text-[22px] font-semibold text-[var(--color-forest)]">
                Diagnostic Results Awaiting Interpretation
              </h2>
              <p className="font-sans text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                Results securely submitted by partner laboratories awaiting clinical doctor review.
              </p>
            </div>
            <div className="w-full sm:w-[240px]">
              <Select value={selectedLabName} onValueChange={setSelectedLabName}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Filter by Laboratory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Laboratories</SelectItem>
                  {labs.map((lab: any) => (
                    <SelectItem key={lab._id || lab.id} value={lab.name}>{lab.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Submitted</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Referral Code</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Package</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lab</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterpretations.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-[24px] py-[18px] font-medium text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1.5 text-[14px]">
                        <Clock className="h-4 w-4 text-orange-500" />
                        {item.submittedAt}
                      </div>
                    </td>
                    <td className="px-[24px] py-[18px]">
                      <span className="font-mono text-[14px] font-bold text-[var(--color-forest)] bg-[var(--color-lime)]/20 px-2 py-1 rounded">
                        {item.referralCode}
                      </span>
                    </td>
                    <td className="px-[24px] py-[18px]">
                      <div className="flex items-center gap-3">
                        {renderPillarIcon(item.pillar)}
                        <span className="font-medium text-[14px] text-[var(--color-text-primary)]">{item.package}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[18px] text-[14px] text-[var(--color-text-secondary)] font-medium">
                      {item.lab}
                    </td>
                    <td className="px-[24px] py-[18px] text-right">
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
      )}

      {/* TAB 2: FOLLOW-UP REFERRALS */}
      {activeTab === "followups" && (
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif text-[22px] font-semibold text-[var(--color-forest)]">
                Continuity of Care Follow-Ups
              </h2>
              <p className="font-sans text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                Track patient acknowledgments and update treatment/referral milestones.
              </p>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending Acknowledgment</SelectItem>
                  <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Patient & Referral</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Type & Urgency</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Target Facility</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Client Status</th>
                  <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {followUpsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-[24px] py-[48px] text-center text-muted-foreground text-sm">
                      Loading follow-ups...
                    </td>
                  </tr>
                ) : followUps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-[24px] py-[64px] text-center">
                      <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                          <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="font-medium text-[16px] text-gray-600">No active follow-up cases found</p>
                        <p className="text-[14px] text-gray-400 mt-1">
                          When you create a follow-up during interpretation, it will appear here for continuity tracking.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  followUps.map((f: any) => {
                  const client = f.clientId
                  const clientName = client ? `${client.firstName} ${client.lastName}` : "Client"
                  const result = f.resultId
                  const referralCode = result?.referralCode || "N/A"
                  const isExpanded = expandedFollowUpId === (f._id || f.id)

                  return (
                    <tr 
                      key={f._id || f.id} 
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors"
                    >
                      <td className="px-[24px] py-[16px]">
                        <div>
                          <div className="font-semibold text-slate-900 text-[14px]">{clientName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border">
                              {referralCode}
                            </span>
                            <span className="text-xs text-slate-400">
                              {result?.panelName || "Diagnostic Test"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-[24px] py-[16px]">
                        <div className="space-y-1">
                          <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                            {f.type.replace("_", " ")}
                          </span>
                          <div>{getUrgencyBadge(f.urgency)}</div>
                        </div>
                      </td>

                      <td className="px-[24px] py-[16px] text-sm text-slate-600">
                        {f.facility ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {f.facility}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not specified</span>
                        )}
                        {f.notes && (
                          <button
                            onClick={() => setExpandedFollowUpId(isExpanded ? null : (f._id || f.id))}
                            className="mt-1 text-xs text-[var(--color-lime-dark)] hover:underline flex items-center gap-0.5"
                          >
                            {isExpanded ? "Hide notes" : "View notes"} {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                        {isExpanded && (
                          <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 max-w-sm">
                            {f.notes}
                          </p>
                        )}
                      </td>

                      <td className="px-[24px] py-[16px]">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            f.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            f.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            f.status === 'ACKNOWLEDGED' ? 'bg-emerald-100 text-emerald-700' :
                            f.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {f.status === 'ACKNOWLEDGED' && <UserCheck className="h-3 w-3" />}
                            {f.status.replace("_", " ")}
                          </span>
                          {f.acknowledgedAt && (
                            <div className="text-[11px] text-slate-400">
                              Ack: {new Date(f.acknowledgedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-[24px] py-[16px] text-right">
                        <Select
                          value={f.status}
                          onValueChange={(val) => handleStatusChange(f._id || f.id, val)}
                        >
                          <SelectTrigger className="h-8 w-[130px] ml-auto text-xs bg-white">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  )
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
