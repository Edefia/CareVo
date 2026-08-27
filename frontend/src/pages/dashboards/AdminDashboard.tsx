import { Users, MapPin, Building2, TrendingUp, Activity, CalendarCheck, Loader2 } from "lucide-react"

import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Link } from "react-router-dom"
import { useDashboardMetrics, useRevenueChart, useBookingStats } from "@/hooks/useAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminDashboard() {


  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: revenueDataResult, isLoading: revenueLoading } = useRevenueChart()
  const { data: bookingStatsData, isLoading: bookingStatsLoading } = useBookingStats()

  const metrics = metricsData?.data || metricsData
  const revenueData = revenueDataResult?.data || revenueDataResult || []
  const bookingStats = bookingStatsData?.data || bookingStatsData
  
  const weeklyBookings = bookingStats?.weeklyBookings || []
  const labPerformance = bookingStats?.labPerformance || []
  const recentUsers = metrics?.recentUsers || []

  const isLoading = metricsLoading || revenueLoading || bookingStatsLoading
  


  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1400px] mx-auto pb-[96px] animate-in fade-in duration-500">
      



      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              title="Total Platform Users"
              value={metrics?.totalUsers?.toLocaleString() || "0"}
              icon={Users}
              description={`${metrics?.totalPatients || 0} patients registered`}
              className="border-t-4 border-t-blue-500"
            />
            <StatCard
              title="Total Screenings"
              value={metrics?.totalBookings?.toLocaleString() || "0"}
              icon={CalendarCheck}
              description={`${metrics?.pendingBookings || 0} pending completion`}
              className="border-t-4 border-t-emerald-500"
            />
            <StatCard
              title="Partner Laboratories"
              value={metrics?.totalLabs?.toString() || "0"}
              icon={MapPin}
              description={`${metrics?.activeLabs || 0} active labs`}
              className="border-t-4 border-t-amber-500"
            />
            <StatCard
              title="Monthly Revenue"
              value={`GHS ${(metrics?.monthlyRevenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              description={`GHS ${(metrics?.pendingPaymentsAmount || 0).toLocaleString()} pending`}
              className="border-t-4 border-t-violet-500"
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
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₵${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`GHS ${value.toLocaleString()}`, 'Revenue'] as any}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
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
