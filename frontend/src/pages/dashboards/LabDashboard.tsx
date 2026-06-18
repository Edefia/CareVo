import { useState } from "react"
import { Search, Copy, CheckCircle, Clock, Heart, Droplets, Activity, AlertCircle, Calendar } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

export function LabDashboard() {
  const { user } = useAuthStore()
  const { data: bookingsData, isLoading } = useBookings()
  const bookings = bookingsData?.items || bookingsData || []
  const updateStatusMutation = useUpdateBookingStatus()

  const [searchQuery, setSearchQuery] = useState("")

  const filteredClients = Array.isArray(bookings) ? bookings.filter((b: any) => {
    const name = b.patientId?.userId ? `${b.patientId.userId.firstName} ${b.patientId.userId.lastName}` : ""
    return (b.referralCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           name.toLowerCase().includes(searchQuery.toLowerCase())
  }) : []

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Referral Code copied")
  }

  const markClientArrived = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'CONFIRMED' }) // In our system CONFIRMED acts as Arrived/Accepted
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending</span>
      case 'CONFIRMED': return <span className="px-3 py-1 bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Attended</span>
      case 'COMPLETED': return <span className="px-3 py-1 bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Completed</span>
      case 'CANCELLED': return <span className="px-3 py-1 bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3" /> Cancelled</span>
      default: return null
    }
  }

  const renderPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'CARDIO': return <div className="h-7 w-7 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shadow-sm"><Heart className="h-4 w-4 text-[#DC2626]" /></div>
      case 'RENAL': return <div className="h-7 w-7 rounded-lg bg-[#0F76E0]/10 flex items-center justify-center shadow-sm"><Droplets className="h-4 w-4 text-[#0F76E0]" /></div>
      case 'METABOLIC': return <div className="h-7 w-7 rounded-lg bg-[#D97706]/10 flex items-center justify-center shadow-sm"><Activity className="h-4 w-4 text-[#D97706]" /></div>
      default: return null
    }
  }

  return (
    <div className="space-y-[32px] md:space-y-[48px] max-w-[1280px] mx-auto animate-fade-in-up">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px]">
        <div>
          <h1 className="font-serif text-[32px] md:text-[40px] font-semibold text-[var(--color-forest)] leading-tight mb-[8px]">
            Laboratory Operations
          </h1>
          <p className="font-sans text-[16px] text-[var(--color-text-secondary)]">
            Welcome back, {user?.firstName}. Manage your assigned clients and securely enter results.
          </p>
        </div>
      </div>

      {/* SEARCH BAR (Glassmorphism) */}
      <div className="glass-panel rounded-[var(--radius-xl)] p-[24px] transition-all hover:shadow-[var(--shadow-card-hover)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#A8E6BC]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-[18px] font-bold text-[var(--color-text-primary)] mb-1">Find a Client</h2>
            <p className="text-[14px] text-[var(--color-text-muted)]">Scan or enter the patient's referral code</p>
          </div>
          <div className="relative w-full md:max-w-[400px]">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
            <Input
              placeholder="e.g. CRV-2025-A7K3P2"
              className="pl-[48px] h-[56px] text-[16px] font-mono border-2 bg-white/50 focus:bg-white focus:border-[var(--color-forest)] transition-all shadow-sm rounded-[var(--radius-md)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ASSIGNED CLIENTS QUEUE */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-[24px] py-[24px] border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface-2)] to-white">
          <h2 className="font-serif text-[24px] font-semibold text-[var(--color-forest)]">
            Assigned Clients
          </h2>
          <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1">
            Clients booked at your laboratory using their Referral Codes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50/50">
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Referral Code</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Client Name</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Package</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Booked For</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-[24px] py-[64px] text-center text-muted-foreground">
                    Loading records...
                  </td>
                </tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client: any, idx: number) => (
                  <tr
                    key={client._id || client.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/30 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[14px] font-bold text-[var(--color-forest)] bg-[#7EE8A2]/20 px-2 py-1 rounded">
                          {client.referralCode || "N/A"}
                        </span>
                        {client.referralCode && (
                          <button onClick={() => handleCopy(client.referralCode)} className="text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors p-1 rounded-md hover:bg-gray-100">
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px] font-medium text-[var(--color-text-primary)]">
                      {client.patientId?.userId ? `${client.patientId.userId.firstName} ${client.patientId.userId.lastName}` : "Unknown"}
                    </td>
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-3">
                        {renderPillarIcon(client.packageId?.pillar?.[0] || 'METABOLIC')}
                        <span className="font-medium text-[14px] text-[var(--color-text-secondary)]">{client.packageId?.name || client.reason || "General"}</span>
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-1.5 text-[14px] text-[var(--color-text-secondary)]">
                        <Calendar className="h-4 w-4 text-[var(--color-text-muted)]" />
                        {new Date(client.scheduledAt).toLocaleDateString()} {new Date(client.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-[24px] py-[20px]">
                      {renderStatusBadge(client.status)}
                    </td>
                    <td className="px-[24px] py-[20px] text-right">
                      {client.status === 'PENDING' && (
                        <Button size="sm" variant="outline" className="font-medium shadow-sm hover:shadow-md transition-all" onClick={() => markClientArrived(client._id || client.id)}>
                          Mark Arrived
                        </Button>
                      )}
                      {(client.status === 'CONFIRMED') && (
                        <Link to={`/lab/results/enter/${client.referralCode}`}>
                          <Button size="sm" className="font-medium bg-[var(--color-forest)] hover:bg-[var(--color-forest-mid)] text-white shadow-sm hover:shadow-md transition-all">
                            Enter Results
                          </Button>
                        </Link>
                      )}
                      {client.status === 'COMPLETED' && (
                        <Button size="sm" variant="ghost" disabled className="font-medium text-[var(--color-text-muted)] opacity-50">
                          Submitted
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-[24px] py-[64px] text-center">
                    <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                        <AlertCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-[16px] text-gray-600">No clients found</p>
                      <p className="text-[14px] text-gray-400 mt-1">Adjust your search or check back later.</p>
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
