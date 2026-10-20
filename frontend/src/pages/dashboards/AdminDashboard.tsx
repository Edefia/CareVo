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
  UserCheck
} from "lucide-react"

import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Link } from "react-router-dom"
import { useDashboardMetrics, useRevenueChart, useBookingStats } from "@/hooks/useAnalytics"
import { useAllFollowUps, useFollowUpOverviewStats, useUpdateFollowUpStatus } from "@/hooks/useFollowUps"
import { useHealthAccountStats } from "@/hooks/useHealthAccount"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import toast from "react-hot-toast"

export function AdminDashboard() {
  const [followUpFilter, setFollowUpFilter] = useState<string>("ALL")

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
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> EMERGENCY</span>
      case "URGENT":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700">URGENT</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-100 text-green-700">ROUTINE</span>
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1400px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              title="Platform Users"
              value={metrics?.totalUsers?.toLocaleString() || "0"}
              icon={Users}
              description={`${metrics?.totalPatients || 0} registered`}
              className="border-t-4 border-t-blue-500"
            />
            <StatCard
              title="Total Screenings"
              value={metrics?.totalBookings?.toLocaleString() || "0"}
              icon={CalendarCheck}
              description={`${metrics?.pendingBookings || 0} pending`}
              className="border-t-4 border-t-emerald-500"
            />
            <StatCard
              title="Partner Labs"
              value={metrics?.totalLabs?.toString() || "0"}
              icon={MapPin}
              description={`${metrics?.activeLabs || 0} active`}
              className="border-t-4 border-t-amber-500"
            />
            <StatCard
              title="Monthly Revenue"
              value={`GHS ${(metrics?.monthlyRevenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              description={`GHS ${(metrics?.pendingPaymentsAmount || 0).toLocaleString()} pending`}
              className="border-t-4 border-t-violet-500"
            />
            <StatCard
              title="Clinical Follow-Ups"
              value={(followUpStats?.total || 0).toString()}
              icon={ClipboardList}
              description={`${followUpStats?.pending || 0} pending ack, ${followUpStats?.emergency || 0} emergency`}
              className="border-t-4 border-t-rose-500"
            />
            <StatCard
              title="Health Accounts"
              value={(healthAccountStats?.uniqueClients || 0).toString()}
              icon={HeartPulse}
              description={`${healthAccountStats?.totalEntries || 0} parameters tracked`}
              className="border-t-4 border-t-teal-500"
            />
          </>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CHARTS SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[32px] lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-[24px] flex flex-col">
          <div className="flex justify-between items-center mb-[24px]">
            <div>
              <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">Revenue Dashboard</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)]">Platform gross revenue over the last 6 months (GHS)</p>
            </div>
            <Link to="/admin/payments">
              <Button variant="ghost" className="text-violet-600 hover:bg-violet-50">View Ledger →</Button>
            </Link>
          </div>
          <div className="h-[300px] w-full flex-1">
            {revenueLoading ? (
              <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
            ) : revenueData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">No revenue data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₵${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`GHS ${value.toLocaleString()}`, 'Revenue'] as any}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2867B6" strokeWidth={3} fill="#2867B6" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Screenings Bar Chart */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-[24px] flex flex-col">
          <div className="flex justify-between items-center mb-[24px]">
            <div>
              <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">Screening Analytics</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)]">Daily screening volume for the current week</p>
            </div>
          </div>
          <div className="h-[300px] w-full flex-1">
            {bookingStatsLoading ? (
              <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : weeklyBookings.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">No screening data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBookings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CONTINUITY OF CARE / CLINICAL FOLLOW-UPS SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)] flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-rose-500" />
              Continuity of Care & Follow-Up Referrals
              {followUps.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  {followUps.length}
                </span>
              )}
            </h2>
            <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-0.5">
              System-wide monitor for patient continuity actions, referrals, and urgency escalations.
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
                <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Patient</th>
                <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Referral & Test</th>
                <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Interpreter</th>
                <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Type / Urgency</th>
                <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-[24px] py-[14px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {followUpsLoading ? (
                <tr>
                  <td colSpan={6} className="px-[24px] py-[40px] text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-500 mx-auto" />
                  </td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-[24px] py-[48px] text-center text-muted-foreground text-sm">
                    No follow-ups matching filter criteria.
                  </td>
                </tr>
              ) : (
                followUps.slice(0, 8).map((f: any) => {
                  const client = f.clientId
                  const clientName = client ? `${client.firstName} ${client.lastName}` : "Client"
                  const interpreter = f.interpreterId
                  const interpreterName = interpreter ? `Dr. ${interpreter.lastName || interpreter.firstName}` : "Interpreter"
                  const result = f.resultId

                  return (
                    <tr key={f._id || f.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                      <td className="px-[24px] py-[16px]">
                        <div className="font-semibold text-slate-900 text-sm">{clientName}</div>
                        <div className="text-xs text-slate-400">{client?.email || client?.phone || "No contact"}</div>
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <div className="font-mono text-xs text-[var(--color-forest)] font-bold">{result?.referralCode || "N/A"}</div>
                        <div className="text-xs text-slate-500">{result?.panelName || "Diagnostic Test"}</div>
                      </td>
                      <td className="px-[24px] py-[16px] text-sm text-slate-600 font-medium">
                        {interpreterName}
                      </td>
                      <td className="px-[24px] py-[16px]">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {f.type.replace("_", " ")}
                          </span>
                          <div>{getUrgencyBadge(f.urgency)}</div>
                        </div>
                      </td>
                      <td className="px-[24px] py-[16px]">
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
                      </td>
                      <td className="px-[24px] py-[16px] text-right">
                        <Select
                          value={f.status}
                          onValueChange={(val) => handleStatusChange(f._id || f.id, val)}
                        >
                          <SelectTrigger className="h-8 w-[120px] ml-auto text-xs bg-white">
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
      </div>

      <div className="grid gap-[32px] lg:grid-cols-[2fr_1fr]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LABORATORY PERFORMANCE SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">
                Partner Laboratory Performance
              </h2>
              <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
                Efficiency metrics across the active laboratory network.
              </p>
            </div>
            <Link to="/laboratories">
              <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-50">Manage Labs →</Button>
            </Link>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            {bookingStatsLoading ? (
              <div className="h-full w-full flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : labPerformance.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground py-20">No laboratory data available</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                    <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lab Name</th>
                    <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Region</th>
                    <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Volume</th>
                    <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {labPerformance.map((lab: any) => (
                    <tr key={lab._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                      <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block">{lab.name}</span>
                            <span className="text-[12px] text-muted-foreground font-normal">{lab.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-[24px] py-[20px] text-[14px] text-[var(--color-text-secondary)]">
                        {lab.address?.state || lab.address?.city || "Unknown"}
                      </td>
                      <td className="px-[24px] py-[20px] text-center font-bold text-[var(--color-text-primary)]">
                        {lab.bookingCount}
                      </td>
                      <td className="px-[24px] py-[20px]">
                        <div className="w-full max-w-[120px] mx-auto">
                          <div className="flex justify-between text-[12px] mb-1">
                            <span className="font-medium">{Math.round(lab.efficiency)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${lab.efficiency >= 90 ? 'bg-emerald-500' : lab.efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
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
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            USER ACTIVITY SYSTEM
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex justify-between items-center">
            <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">
              New Registrations
            </h2>
            <Link to="/admin/users">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Activity className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="p-[24px] flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {metricsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[100px]" /></div></div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No recent users found</div>
              ) : (
                recentUsers.map((u: any) => (
                  <div key={u._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 font-bold text-slate-600 text-sm">
                        {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-slate-900">{u.firstName} {u.lastName}</div>
                        <div className="text-[12px] text-slate-500 flex items-center gap-2">
                          <span>{u.role.replace("_", " ")}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Link to="/admin/users">
              <Button variant="outline" className="w-full mt-6">Manage All Users</Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
