import { Calendar, FileText, MapPin, AlertTriangle, Building2, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function AdminDashboard() {
  const { user } = useAuthStore()

  // Mock Admin Data
  const stats = {
    totalScreenings: 1420,
    pendingInterpretations: 45,
    partnerLabs: 12,
    criticalAlerts: 8
  }

  const labPerformance = [
    { id: 1, name: "AccuLab Diagnostics", region: "Greater Accra", screenings: 540, turnaround: "18h", status: "Active" },
    { id: 2, name: "MediScan Ghana", region: "Ashanti", screenings: 320, turnaround: "22h", status: "Active" },
    { id: 3, name: "BioTech Labs", region: "Western", screenings: 180, turnaround: "26h", status: "Active" },
    { id: 4, name: "CarePlus Facility", region: "Greater Accra", screenings: 85, turnaround: "48h", status: "Inactive" }
  ]

  const riskDistribution = {
    low: 65,
    moderate: 25,
    high: 10
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto pb-[96px]">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[36px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            System Overview
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Welcome back, {user?.firstName}. High-level metrics and platform management.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-[44px]">Export Report</Button>
          <Button className="h-[44px]">Platform Settings</Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW CARDS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Screenings Booked"
          value={stats.totalScreenings.toString()}
          icon={<Calendar className="h-[20px] w-[20px] text-[var(--color-forest)]" />}
          description="All-time platform volume"
        />
        <StatCard
          title="Results Pending Interpretation"
          value={stats.pendingInterpretations.toString()}
          icon={<FileText className="h-[20px] w-[20px] text-[var(--color-forest)]" />}
          description="Awaiting clinical review"
        />
        <StatCard
          title="Partner Laboratories"
          value={stats.partnerLabs.toString()}
          icon={<MapPin className="h-[20px] w-[20px] text-[var(--color-forest)]" />}
          description="Active network locations"
        />
        <div className="rounded-[var(--radius-xl)] border border-[#DC2626]/20 bg-[#FEF2F2] p-[24px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[14px] font-bold text-[#DC2626] uppercase tracking-wider">
              Critical Risk Alerts
            </h3>
            <AlertTriangle className="h-[20px] w-[20px] text-[#DC2626]" />
          </div>
          <div>
            <div className="font-serif text-[36px] font-semibold text-[#DC2626] leading-none mb-1">
              {stats.criticalAlerts}
            </div>
            <p className="font-sans text-[13px] font-medium text-[#DC2626]/80">
              High-risk clients identified this week
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-[32px] lg:grid-cols-[2fr_1fr]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LABORATORY PERFORMANCE SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)]">
                Laboratory Network Performance
              </h2>
              <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
                Throughput and efficiency of CareVo partner labs.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lab Name</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Region</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Screenings Conducted</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Avg Turnaround Time</th>
                  <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {labPerformance.map((lab) => (
                  <tr key={lab.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                    <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-primary)]">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[var(--color-text-muted)]" />
                        {lab.name}
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px] text-[14px] text-[var(--color-text-secondary)]">
                      {lab.region}
                    </td>
                    <td className="px-[24px] py-[20px] text-center font-bold text-[var(--color-text-primary)]">
                      {lab.screenings}
                    </td>
                    <td className="px-[24px] py-[20px] text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[14px]">
                        <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <span className={parseInt(lab.turnaround) > 24 ? "text-[#D97706] font-bold" : "text-[#16A34A] font-bold"}>
                          {lab.turnaround}
                        </span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px]">
                      {lab.status === 'Active' ? (
                        <span className="px-2 py-1 bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 rounded text-[11px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded text-[11px] font-bold uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SYSTEM HEALTH ADVOCACY SECTION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
          <div className="px-[24px] py-[20px] border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50">
            <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)]">
              System Risk Distribution
            </h2>
            <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
              Population health risk across all screened clients.
            </p>
          </div>
          
          <div className="p-[24px] flex-1 flex flex-col justify-center">
            {/* Visual Progress Bar */}
            <div className="h-[24px] w-full rounded-full overflow-hidden flex mb-8">
              <div style={{ width: `${riskDistribution.low}%` }} className="bg-[#16A34A] h-full transition-all duration-500" title={`Low Risk: ${riskDistribution.low}%`}></div>
              <div style={{ width: `${riskDistribution.moderate}%` }} className="bg-[#D97706] h-full transition-all duration-500" title={`Moderate Risk: ${riskDistribution.moderate}%`}></div>
              <div style={{ width: `${riskDistribution.high}%` }} className="bg-[#DC2626] h-full transition-all duration-500" title={`High Risk: ${riskDistribution.high}%`}></div>
            </div>

            {/* Legend Blocks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F0FDF4] border border-[#16A34A]/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                  <span className="font-bold text-[#16A34A]">Low Risk</span>
                </div>
                <div className="font-serif text-[20px] font-bold text-[#16A34A]">{riskDistribution.low}%</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FFFBEB] border border-[#D97706]/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-[#D97706]" />
                  <span className="font-bold text-[#D97706]">Moderate Risk</span>
                </div>
                <div className="font-serif text-[20px] font-bold text-[#D97706]">{riskDistribution.moderate}%</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
                  <span className="font-bold text-[#DC2626]">High Risk</span>
                </div>
                <div className="font-serif text-[20px] font-bold text-[#DC2626]">{riskDistribution.high}%</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
