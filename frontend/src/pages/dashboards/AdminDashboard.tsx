import { useState } from "react"
import { 
  Users, 
  MapPin, 
  Building2, 
  TrendingUp, 
  Activity, 
  CalendarCheck, 
  Loader2,
  ClipboardList,
  HeartPulse,
  AlertTriangle,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  Stethoscope,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Link } from "react-router-dom"
import { useDashboardMetrics, useRevenueChart, useBookingStats } from "@/hooks/useAnalytics"
import { useAllFollowUps, useFollowUpOverviewStats, useUpdateFollowUpStatus } from "@/hooks/useFollowUps"
import { useHealthAccountStats } from "@/hooks/useHealthAccount"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"

export function AdminDashboard() {
  const [followUpFilter, setFollowUpFilter] = useState<string>("ALL")
  const [followUpPage, setFollowUpPage] = useState(1)
  const followUpPageSize = 6

  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: revenueDataResult, isLoading: revenueLoading } = useRevenueChart()
  const { data: bookingStatsData, isLoading: bookingStatsLoading } = useBookingStats()

  const { data: followUpStats } = useFollowUpOverviewStats()
  const { data: followUpsData, isLoading: followUpsLoading } = useAllFollowUps(
    followUpFilter !== "ALL" ? { status: followUpFilter } : undefined
  )
  const followUps = Array.isArray(followUpsData) ? followUpsData : []

  const { data: healthAccountStats } = useHealthAccountStats()
  const updateStatusMutation = useUpdateFollowUpStatus()

  const metrics = metricsData?.data || metricsData
  const revenueData = revenueDataResult?.data || revenueDataResult || []
  const bookingStats = bookingStatsData?.data || bookingStatsData
  
  const weeklyBookings = bookingStats?.weeklyBookings || []
  const labPerformance = bookingStats?.labPerformance || []
  const recentUsers = metrics?.recentUsers || []

  const isLoading = metricsLoading || revenueLoading || bookingStatsLoading

  // Follow-up pagination
  const totalFollowUps = followUps.length
  const totalFollowUpPages = Math.max(1, Math.ceil(totalFollowUps / followUpPageSize))
  const paginatedFollowUps = followUps.slice((followUpPage - 1) * followUpPageSize, followUpPage * followUpPageSize)

  // Lab performance pagination
  const [labPage, setLabPage] = useState(1)
  const labPageSize = 5
  const totalLabPages = Math.max(1, Math.ceil(labPerformance.length / labPageSize))
  const paginatedLabs = labPerformance.slice((labPage - 1) * labPageSize, labPage * labPageSize)

  const handleStatusChange = async (followUpId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: followUpId, status: newStatus })
      toast.success(`Follow-up status updated to ${newStatus.replace("_", " ")}.`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update follow-up status.")
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" /> EMERGENCY</span>
      case "URGENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 w-fit">URGENT</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">ROUTINE</span>
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'IN_PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
      'ACKNOWLEDGED': 'bg-teal-50 text-teal-700 border-teal-200',
      'CLOSED': 'bg-gray-100 text-gray-600 border-gray-200',
      'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles[status] || styles['PENDING']}`}>
        {status === 'ACKNOWLEDGED' && <UserCheck className="h-3 w-3" />}
        {status.replace("_", " ")}
      </span>
    )
  }

  return (
    <div className="space-y-6">

        {/* ═══ SUMMARY CARDS — 3 grouped blocks ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Block 1: Users & Patients */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Platform Users</h3>
            </div>
            <div className="px-4 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-3 divide-x divide-[var(--color-lims-border)]">
                  <div className="pr-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Total Users</div>
                    <div className="text-[28px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">{metrics?.totalUsers?.toLocaleString() || "0"}</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" /> active
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Patients</div>
                    <div className="text-[28px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">{metrics?.totalPatients?.toLocaleString() || "0"}</div>
                    <div className="text-[11px] text-[var(--color-lims-text-muted)] font-medium mt-1.5">registered</div>
                  </div>
                  <div className="pl-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Partner Labs</div>
                    <div className="text-[28px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">{metrics?.totalLabs?.toString() || "0"}</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1.5">{metrics?.activeLabs || 0} active</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Block 2: Screenings & Bookings */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Screenings & Follow-Ups</h3>
            </div>
            <div className="px-4 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid grid-cols-3 divide-x divide-[var(--color-lims-border)]">
                  <div className="pr-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Screenings</div>
                    <div className="text-[28px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">{metrics?.totalBookings?.toLocaleString() || "0"}</div>
                    <div className="text-[11px] text-amber-600 font-medium mt-1.5">{metrics?.pendingBookings || 0} pending</div>
                  </div>
                  <div className="px-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Follow-Ups</div>
                    <div className="text-[28px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">{followUpStats?.total || 0}</div>
                    <div className="text-[11px] text-amber-600 font-medium mt-1.5">{followUpStats?.pending || 0} pending</div>
                  </div>
                  <div className="pl-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Emergency</div>
                    <div className="text-[28px] font-bold text-red-600 leading-none tracking-tight">{followUpStats?.emergency || 0}</div>
                    <div className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-0.5">
                      {(followUpStats?.emergency || 0) > 0 && <AlertTriangle className="h-3 w-3" />}
                      {(followUpStats?.emergency || 0) > 0 ? 'needs attention' : 'none'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Block 3: Revenue & Health Accounts */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500"></div>
              <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Revenue & Health Accounts</h3>
            </div>
            <div className="px-4 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                </div>
              ) : (
                <div className="grid grid-cols-3 divide-x divide-[var(--color-lims-border)]">
                  <div className="pr-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Monthly Rev.</div>
                    <div className="text-[24px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">₵{(metrics?.monthlyRevenue || 0).toLocaleString()}</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" /> this month
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Pending</div>
                    <div className="text-[24px] font-bold text-amber-600 leading-none tracking-tight">₵{(metrics?.pendingPaymentsAmount || 0).toLocaleString()}</div>
                    <div className="text-[11px] text-[var(--color-lims-text-muted)] font-medium mt-1.5">awaiting</div>
                  </div>
                  <div className="pl-4">
                    <div className="text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider mb-1">Health Accts</div>
                    <div className="text-[24px] font-bold text-[var(--color-lims-text)] leading-none tracking-tight">{healthAccountStats?.uniqueClients || 0}</div>
                    <div className="text-[11px] text-[var(--color-lims-text-muted)] font-medium mt-1.5">{healthAccountStats?.totalEntries || 0} tracked</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ CHARTS SECTION — 2 col ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Revenue Area Chart */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-violet-500" />
                <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Revenue Overview</h3>
                <span className="text-[11px] text-[var(--color-lims-text-muted)] font-medium">Last 6 months (GHS)</span>
              </div>
              <Link to="/admin/payments">
                <button className="text-[11px] font-bold text-[var(--color-lims-accent)] hover:text-[var(--color-lims-accent-hover)] transition-colors flex items-center gap-1">
                  View Ledger <ArrowUpRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            <div className="p-4 h-[280px]">
              {revenueLoading ? (
                <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
              ) : revenueData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-[13px] text-[var(--color-lims-text-muted)]">No revenue data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-5} tickFormatter={(value) => `₵${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgb(0 0 0 / 0.08)', fontSize: 12 }}
                      formatter={(value: any) => [`GHS ${value.toLocaleString()}`, 'Revenue'] as any}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6D4AE0" strokeWidth={2} fill="#6D4AE0" fillOpacity={0.08} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Screenings Bar Chart */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Screening Analytics</h3>
                <span className="text-[11px] text-[var(--color-lims-text-muted)] font-medium">This week</span>
              </div>
            </div>
            <div className="p-4 h-[280px]">
              {bookingStatsLoading ? (
                <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-400" /></div>
              ) : weeklyBookings.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-[13px] text-[var(--color-lims-text-muted)]">No screening data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyBookings} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-5} />
                    <RechartsTooltip 
                      cursor={{ fill: '#F9FAFB' }}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgb(0 0 0 / 0.08)', fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ═══ FOLLOW-UPS TABLE ═══ */}
        <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-rose-500" />
              <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Clinical Follow-Ups & Referrals</h3>
              {totalFollowUps > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">{totalFollowUps}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={followUpFilter} onValueChange={(v) => { setFollowUpFilter(v); setFollowUpPage(1); }}>
                <SelectTrigger className="h-8 w-[160px] text-[12px] bg-white border-[var(--color-lims-border)]">
                  <Filter className="h-3 w-3 mr-1.5 text-[var(--color-lims-text-muted)]" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-lims-border)] bg-gray-50/30">
                  <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Referral & Test</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Interpreter</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Type / Urgency</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-lims-border)]">
                {followUpsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="h-5 w-5 animate-spin text-rose-400 mx-auto" />
                    </td>
                  </tr>
                ) : paginatedFollowUps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[var(--color-lims-text-muted)]">
                      No follow-ups matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedFollowUps.map((f: any) => {
                    const client = f.clientId
                    const clientName = client ? `${client.firstName} ${client.lastName}` : "Client"
                    const interpreter = f.interpreterId
                    const interpreterName = interpreter ? `Dr. ${interpreter.lastName || interpreter.firstName}` : "Interpreter"
                    const result = f.resultId

                    return (
                      <tr key={f._id || f.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[11px] font-bold text-slate-600">
                              {client?.firstName?.charAt(0) || "?"}{client?.lastName?.charAt(0) || ""}
                            </div>
                            <div>
                              <div className="font-semibold text-[13px] text-[var(--color-lims-text)]">{clientName}</div>
                              <div className="text-[11px] text-[var(--color-lims-text-muted)]">{client?.email || client?.phone || "No contact"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-[11px] text-[var(--color-lims-accent)] font-bold">{result?.referralCode || "N/A"}</div>
                          <div className="text-[11px] text-[var(--color-lims-text-muted)]">{result?.panelName || "Diagnostic Test"}</div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--color-lims-text)] font-medium whitespace-nowrap">
                          {interpreterName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                              {f.type.replace("_", " ")}
                            </span>
                            <div>{getUrgencyBadge(f.urgency)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(f.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Select
                            value={f.status}
                            onValueChange={(val) => handleStatusChange(f._id || f.id, val)}
                          >
                            <SelectTrigger className="h-7 w-[110px] ml-auto text-[11px] bg-white border-[var(--color-lims-border)]">
                              <SelectValue placeholder="Update" />
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

          {/* Table Pagination */}
          {totalFollowUps > followUpPageSize && (
            <div className="px-4 py-3 border-t border-[var(--color-lims-border)] bg-gray-50/30 flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-lims-text-muted)] font-medium">
                Showing {((followUpPage - 1) * followUpPageSize) + 1}–{Math.min(followUpPage * followUpPageSize, totalFollowUps)} of {totalFollowUps}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFollowUpPage(p => Math.max(1, p - 1))}
                  disabled={followUpPage === 1}
                  className="h-7 w-7 flex items-center justify-center rounded border border-[var(--color-lims-border)] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-[var(--color-lims-text-muted)]" />
                </button>
                {Array.from({ length: totalFollowUpPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFollowUpPage(page)}
                    className={`h-7 w-7 flex items-center justify-center rounded text-[11px] font-bold transition-colors ${
                      followUpPage === page 
                        ? 'bg-[var(--color-lims-accent)] text-white border border-[var(--color-lims-accent)]' 
                        : 'border border-[var(--color-lims-border)] bg-white text-[var(--color-lims-text-muted)] hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setFollowUpPage(p => Math.min(totalFollowUpPages, p + 1))}
                  disabled={followUpPage === totalFollowUpPages}
                  className="h-7 w-7 flex items-center justify-center rounded border border-[var(--color-lims-border)] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--color-lims-text-muted)]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ BOTTOM SECTION: Lab Performance + Recent Users ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          
          {/* Lab Performance Table */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-500" />
                <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">Partner Laboratory Performance</h3>
              </div>
              <Link to="/laboratories">
                <button className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
                  Manage Labs <ArrowUpRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {bookingStatsLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" /></div>
              ) : labPerformance.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-[13px] text-[var(--color-lims-text-muted)]">No laboratory data available</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-lims-border)] bg-gray-50/30">
                      <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Lab Name</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider">Region</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider text-center">Volume</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[var(--color-lims-text-muted)] uppercase tracking-wider text-center">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-lims-border)]">
                    {paginatedLabs.map((lab: any) => (
                      <tr key={lab._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-[13px] text-[var(--color-lims-text)]">{lab.name}</div>
                              <div className="text-[11px] text-[var(--color-lims-text-muted)]">{lab.isActive ? "Active" : "Inactive"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--color-lims-text-muted)]">
                          {lab.address?.state || lab.address?.city || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-[13px] text-[var(--color-lims-text)]">{lab.bookingCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full max-w-[100px] mx-auto">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-bold text-[var(--color-lims-text)]">{Math.round(lab.efficiency)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${lab.efficiency >= 90 ? 'bg-emerald-500' : lab.efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${lab.efficiency}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Lab Pagination */}
            {labPerformance.length > labPageSize && (
              <div className="px-4 py-3 border-t border-[var(--color-lims-border)] bg-gray-50/30 flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-lims-text-muted)] font-medium">
                  Showing {((labPage - 1) * labPageSize) + 1}–{Math.min(labPage * labPageSize, labPerformance.length)} of {labPerformance.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLabPage(p => Math.max(1, p - 1))}
                    disabled={labPage === 1}
                    className="h-7 w-7 flex items-center justify-center rounded border border-[var(--color-lims-border)] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-[var(--color-lims-text-muted)]" />
                  </button>
                  {Array.from({ length: totalLabPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setLabPage(page)}
                      className={`h-7 w-7 flex items-center justify-center rounded text-[11px] font-bold transition-colors ${
                        labPage === page 
                          ? 'bg-[var(--color-lims-accent)] text-white border border-[var(--color-lims-accent)]' 
                          : 'border border-[var(--color-lims-border)] bg-white text-[var(--color-lims-text-muted)] hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setLabPage(p => Math.min(totalLabPages, p + 1))}
                    disabled={labPage === totalLabPages}
                    className="h-7 w-7 flex items-center justify-center rounded border border-[var(--color-lims-border)] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--color-lims-text-muted)]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-lg border border-[var(--color-lims-border)] shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--color-lims-border)] bg-gray-50/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <h3 className="text-[13px] font-bold text-[var(--color-lims-text)]">New Registrations</h3>
              </div>
              <Link to="/admin/users">
                <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                  View All <ArrowUpRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-[var(--color-lims-border)]">
                {metricsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  </div>
                ) : recentUsers.length === 0 ? (
                  <div className="flex items-center justify-center py-16 text-[13px] text-[var(--color-lims-text-muted)]">No recent users</div>
                ) : (
                  recentUsers.map((u: any) => (
                    <div key={u._id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-[11px] font-bold text-slate-600">
                          {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[13px] text-[var(--color-lims-text)]">{u.firstName} {u.lastName}</div>
                          <div className="text-[11px] text-[var(--color-lims-text-muted)] flex items-center gap-1.5">
                            <span>{u.role.replace("_", " ")}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[var(--color-lims-border)] bg-gray-50/30">
              <Link to="/admin/users" className="block">
                <button className="w-full h-8 rounded-md border border-[var(--color-lims-border)] bg-white hover:bg-gray-50 text-[12px] font-bold text-[var(--color-lims-text-muted)] transition-colors">
                  Manage All Users
                </button>
              </Link>
            </div>
          </div>
      </div>
    </div>
  )
}
