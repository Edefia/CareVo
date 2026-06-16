import { Users, MapPin, Building2, TrendingUp, Activity, CalendarCheck } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Link } from "react-router-dom"

export function AdminDashboard() {
  const { user } = useAuthStore()

  // Mock Admin Data
  const stats = {
    totalUsers: 24500,
    totalScreenings: 14200,
    partnerLabs: 48,
    monthlyRevenue: 125000
  }

  const revenueData = [
    { name: 'Jan', revenue: 40000 },
    { name: 'Feb', revenue: 45000 },
    { name: 'Mar', revenue: 55000 },
    { name: 'Apr', revenue: 70000 },
    { name: 'May', revenue: 90000 },
    { name: 'Jun', revenue: 125000 },
  ]

  const screeningData = [
    { name: 'Mon', count: 120 },
    { name: 'Tue', count: 150 },
    { name: 'Wed', count: 180 },
    { name: 'Thu', count: 140 },
    { name: 'Fri', count: 210 },
    { name: 'Sat', count: 250 },
    { name: 'Sun', count: 190 },
  ]

  const labPerformance = [
    { id: 1, name: "AccuLab Diagnostics", region: "Greater Accra", screenings: 540, turnaround: 92, status: "Active" },
    { id: 2, name: "MediScan Ghana", region: "Ashanti", screenings: 320, turnaround: 85, status: "Active" },
    { id: 3, name: "BioTech Labs", region: "Western", screenings: 180, turnaround: 78, status: "Active" },
    { id: 4, name: "CarePlus Facility", region: "Greater Accra", screenings: 85, turnaround: 95, status: "Inactive" }
  ]

  const recentUsers = [
    { id: '1', name: 'Sarah Jenkins', role: 'CLIENT', date: '2 mins ago', status: 'Active' },
    { id: '2', name: 'Dr. Michael Chen', role: 'INTERPRETER', date: '15 mins ago', status: 'Pending Review' },
    { id: '3', name: 'MediScan Ghana', role: 'LABORATORY', date: '1 hour ago', status: 'Active' },
    { id: '4', name: 'James Wilson', role: 'CLIENT', date: '3 hours ago', status: 'Active' },
  ]

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1400px] mx-auto pb-[96px] animate-in fade-in duration-500">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Platform Overview
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Welcome back, {user?.firstName}. Here is what's happening on CareVo today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-[44px]">Download Report</Button>
          <Link to="/settings">
            <Button className="h-[44px]">System Config</Button>
          </Link>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS (KPIs)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Platform Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          description="+12% from last month"
          className="border-t-4 border-t-blue-500"
        />
        <StatCard
          title="Total Screenings"
          value={stats.totalScreenings.toLocaleString()}
          icon={CalendarCheck}
          description="+8% from last month"
          className="border-t-4 border-t-emerald-500"
        />
        <StatCard
          title="Partner Laboratories"
          value={stats.partnerLabs.toString()}
          icon={MapPin}
          description="3 new labs onboarded"
          className="border-t-4 border-t-amber-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={TrendingUp}
          description="+24% from last month"
          className="border-t-4 border-t-violet-500"
        />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CHARTS SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[32px] lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-[24px]">
          <div className="flex justify-between items-center mb-[24px]">
            <div>
              <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">Revenue Dashboard</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)]">Platform gross revenue over the last 6 months</p>
            </div>
            <Link to="/admin/payments">
              <Button variant="ghost" className="text-violet-600 hover:bg-violet-50">View Ledger →</Button>
            </Link>
          </div>
          <div className="h-[300px] w-full">
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
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screenings Bar Chart */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-[24px]">
          <div className="flex justify-between items-center mb-[24px]">
            <div>
              <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">Screening Analytics</h2>
              <p className="text-[14px] text-[var(--color-text-secondary)]">Daily screening volume for the current week</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={screeningData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lab Name</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Region</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Volume</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Efficiency Score</th>
                </tr>
              </thead>
              <tbody>
                {labPerformance.map((lab) => (
                  <tr key={lab.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                    <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-primary)]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="block">{lab.name}</span>
                          <span className="text-[12px] text-muted-foreground font-normal">{lab.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px] text-[14px] text-[var(--color-text-secondary)]">
                      {lab.region}
                    </td>
                    <td className="px-[24px] py-[20px] text-center font-bold text-[var(--color-text-primary)]">
                      {lab.screenings}
                    </td>
                    <td className="px-[24px] py-[20px]">
                      <div className="w-full max-w-[120px] mx-auto">
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="font-medium">{lab.turnaround}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${lab.turnaround >= 90 ? 'bg-emerald-500' : lab.turnaround >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${lab.turnaround}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            USER MANAGEMENT SYSTEM (SNAPSHOT)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex justify-between items-center">
            <h2 className="font-serif text-[20px] font-semibold text-[var(--color-forest)]">
              User Activity
            </h2>
            <Link to="/admin/users">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Activity className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="p-[24px] flex-1">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 font-bold text-slate-600 text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-slate-900">{user.name}</div>
                      <div className="text-[12px] text-slate-500 flex items-center gap-2">
                        <span>{user.role}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{user.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {user.status}
                  </div>
                </div>
              ))}
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
